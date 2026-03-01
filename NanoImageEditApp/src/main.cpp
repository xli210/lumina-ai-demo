/*
 * Nano ImageEdit — Native Desktop Application
 *
 * A Win32 native GUI that manages the Python runner backend,
 * handles license activation, env download, and image generation.
 * Communicates with runner.py via HTTP on localhost:38000.
 *
 * Features two modes:
 *   - Text to Image: generate images from text prompts
 *   - Image Edit: upload up to 4 reference images + prompt for img2img
 */
#ifndef UNICODE
#define UNICODE
#endif
#ifndef _UNICODE
#define _UNICODE
#endif
#ifndef WIN32_LEAN_AND_MEAN
#define WIN32_LEAN_AND_MEAN
#endif
#ifndef NOMINMAX
#define NOMINMAX
#endif

#include <windows.h>
#include <windowsx.h>
#include <commctrl.h>
#include <shellapi.h>
#include <wininet.h>
#include <shlobj.h>
#include <gdiplus.h>
#include <commdlg.h>

#include <string>
#include <vector>
#include <thread>
#include <mutex>
#include <atomic>
#include <functional>
#include <sstream>
#include <fstream>
#include <filesystem>
#include <algorithm>
#include <cstdio>
#include <ctime>

#pragma comment(lib, "comctl32")
#pragma comment(lib, "wininet")
#pragma comment(lib, "gdiplus")
#pragma comment(lib, "shell32")
#pragma comment(lib, "ole32")
#pragma comment(lib, "uxtheme")
#pragma comment(lib, "comdlg32")

namespace fs = std::filesystem;

// ── Forward declarations ───────────────────────────────────
LRESULT CALLBACK WndProc(HWND, UINT, WPARAM, LPARAM);

// ── Constants ──────────────────────────────────────────────
static const wchar_t* APP_TITLE    = L"Nano ImageEdit";
static const wchar_t* APP_CLASS    = L"NanoImageEditApp";
static const int      RUNNER_PORT  = 38000;
static const int      WINDOW_W     = 1060;
static const int      WINDOW_H     = 920;

static const char* RUNNER_HOST     = "127.0.0.1";

// ── Colors (Tokyo Night theme) ─────────────────────────────
struct AppColors {
    COLORREF bg       = RGB(26, 27, 38);
    COLORREF bg2      = RGB(36, 40, 59);
    COLORREF bg3      = RGB(22, 22, 30);
    COLORREF fg       = RGB(169, 177, 214);
    COLORREF fgBright = RGB(192, 202, 245);
    COLORREF accent   = RGB(122, 162, 247);
    COLORREF green    = RGB(158, 206, 106);
    COLORREF red      = RGB(247, 118, 142);
    COLORREF orange   = RGB(224, 175, 104);
    COLORREF purple   = RGB(187, 154, 247);
    COLORREF muted    = RGB(86, 95, 137);
    COLORREF border   = RGB(59, 66, 97);
    COLORREF tabBg    = RGB(30, 32, 48);
    COLORREF tabActive= RGB(122, 162, 247);
};
static AppColors C;

// ── Fonts ──────────────────────────────────────────────────
static HFONT hFontTitle    = nullptr;
static HFONT hFontNormal   = nullptr;
static HFONT hFontSmall    = nullptr;
static HFONT hFontMono     = nullptr;
static HFONT hFontButton   = nullptr;
static HFONT hFontBig      = nullptr;
static HFONT hFontTab      = nullptr;

// ── Brushes ────────────────────────────────────────────────
static HBRUSH hBrBg    = nullptr;
static HBRUSH hBrBg2   = nullptr;
static HBRUSH hBrBg3   = nullptr;
static HBRUSH hBrAccent= nullptr;
static HBRUSH hBrTabBg = nullptr;

// ── GDI+ ───────────────────────────────────────────────────
static ULONG_PTR gdiplusToken;

// ── Tab mode ───────────────────────────────────────────────
enum TabMode { TAB_TEXT2IMG = 0, TAB_IMG2IMG = 1 };
static TabMode currentTab = TAB_TEXT2IMG;

// ── App state ──────────────────────────────────────────────
static HWND hMainWnd       = nullptr;
static HWND hStatusLabel   = nullptr;
static HWND hGpuLabel      = nullptr;

// Text2Img controls
static HWND hPromptEdit    = nullptr;
static HWND hWidthEdit     = nullptr;
static HWND hHeightEdit    = nullptr;
static HWND hStepsEdit     = nullptr;
static HWND hGuidanceEdit  = nullptr;
static HWND hSeedEdit      = nullptr;
static HWND hGenerateBtn   = nullptr;

// Img2Img controls
static HWND hI2IPromptEdit   = nullptr;
static HWND hI2IWidthEdit    = nullptr;
static HWND hI2IHeightEdit   = nullptr;
static HWND hI2IStepsEdit    = nullptr;
static HWND hI2IGuidanceEdit = nullptr;
static HWND hI2ISeedEdit     = nullptr;
static HWND hI2IGenerateBtn  = nullptr;
static HWND hI2IAddImgBtn    = nullptr;
static HWND hI2IClearImgBtn  = nullptr;
static HWND hI2IImgCountLbl  = nullptr;
static HWND hI2IImgPanel     = nullptr;

// Shared controls
static HWND hProgressBar   = nullptr;
static HWND hProgressLabel = nullptr;
static HWND hResultImage   = nullptr;
static HWND hOpenFolderBtn = nullptr;
static HWND hTaskListBox   = nullptr;
static HWND hLogEdit       = nullptr;
static HWND hToggleLogBtn  = nullptr;
static HWND hDeactivateBtn = nullptr;

// Tab buttons
static HWND hTabText2Img   = nullptr;
static HWND hTabImg2Img    = nullptr;

// Img2Img uploaded images (server paths)
static std::vector<std::wstring> i2iImagePaths;
static std::vector<std::wstring> i2iImageNames;
static std::vector<Gdiplus::Image*> i2iThumbnails;
static const int MAX_REF_IMAGES = 4;

static PROCESS_INFORMATION runnerProc = {};
static std::atomic<bool> runnerStarted{false};
static std::atomic<bool> runnerReady{false};
static std::atomic<bool> appClosing{false};
static std::atomic<bool> generating{false};
static std::string activeTaskId;
static std::mutex taskMutex;
static std::wstring appDir;
static std::wstring outputDir;
static std::wstring resultImagePath;
static bool logsVisible = false;

static Gdiplus::Image* pResultBitmap = nullptr;

// ── Timer IDs ──────────────────────────────────────────────
#define TIMER_POLL_TASK    1
#define TIMER_REFRESH_TASKS 2
#define TIMER_REFRESH_LOGS 3
#define TIMER_STARTUP      4

// ── Control IDs ────────────────────────────────────────────
#define IDC_GENERATE       1001
#define IDC_OPEN_FOLDER    1002
#define IDC_TOGGLE_LOG     1003
#define IDC_DEACTIVATE     1004
#define IDC_PROMPT         1005
#define IDC_WIDTH          1006
#define IDC_HEIGHT         1007
#define IDC_STEPS          1008
#define IDC_GUIDANCE       1009
#define IDC_SEED           1010
#define IDC_STATUS         1011
#define IDC_GPU            1012
#define IDC_PROGRESS       1013
#define IDC_PROGRESS_LBL   1014
#define IDC_RESULT_IMG     1015
#define IDC_TASKLIST       1016
#define IDC_LOG            1017
#define IDC_TAB_TEXT2IMG   1020
#define IDC_TAB_IMG2IMG    1021
#define IDC_I2I_PROMPT     1030
#define IDC_I2I_WIDTH      1031
#define IDC_I2I_HEIGHT     1032
#define IDC_I2I_STEPS      1033
#define IDC_I2I_GUIDANCE   1034
#define IDC_I2I_SEED       1035
#define IDC_I2I_GENERATE   1036
#define IDC_I2I_ADD_IMG    1037
#define IDC_I2I_CLEAR_IMG  1038
#define IDC_I2I_IMG_COUNT  1039
#define IDC_I2I_IMG_PANEL  1040

// ── Custom messages ────────────────────────────────────────
#define WM_APP_STATUS      (WM_APP + 1)
#define WM_APP_RUNNER_READY (WM_APP + 2)
#define WM_APP_TASK_UPDATE (WM_APP + 3)
#define WM_APP_RESULT      (WM_APP + 4)
#define WM_APP_ENV_READY   (WM_APP + 5)
#define WM_APP_SETUP_FAIL  (WM_APP + 6)

// ── Utility: wstring <-> string ────────────────────────────
static std::wstring toWide(const std::string& s) {
    if (s.empty()) return {};
    int n = MultiByteToWideChar(CP_UTF8, 0, s.c_str(), (int)s.size(), nullptr, 0);
    std::wstring w(n, 0);
    MultiByteToWideChar(CP_UTF8, 0, s.c_str(), (int)s.size(), &w[0], n);
    return w;
}

static std::string toNarrow(const std::wstring& w) {
    if (w.empty()) return {};
    int n = WideCharToMultiByte(CP_UTF8, 0, w.c_str(), (int)w.size(), nullptr, 0, nullptr, nullptr);
    std::string s(n, 0);
    WideCharToMultiByte(CP_UTF8, 0, w.c_str(), (int)w.size(), &s[0], n, nullptr, nullptr);
    return s;
}

// ── Simple JSON parser (minimal, for our API responses) ────
static std::string jsonGet(const std::string& json, const std::string& key) {
    std::string search = "\"" + key + "\"";
    auto pos = json.find(search);
    if (pos == std::string::npos) return "";
    pos = json.find(':', pos + search.size());
    if (pos == std::string::npos) return "";
    pos++;
    while (pos < json.size() && (json[pos] == ' ' || json[pos] == '\t')) pos++;
    if (pos >= json.size()) return "";

    if (json[pos] == '"') {
        pos++;
        std::string val;
        while (pos < json.size() && json[pos] != '"') {
            if (json[pos] == '\\' && pos + 1 < json.size()) {
                pos++;
                if (json[pos] == 'n') val += '\n';
                else if (json[pos] == 't') val += '\t';
                else val += json[pos];
            } else {
                val += json[pos];
            }
            pos++;
        }
        return val;
    }
    std::string val;
    while (pos < json.size() && json[pos] != ',' && json[pos] != '}' && json[pos] != ']') {
        val += json[pos++];
    }
    while (!val.empty() && (val.back() == ' ' || val.back() == '\t' || val.back() == '\r' || val.back() == '\n'))
        val.pop_back();
    if (val == "null") return "";
    return val;
}

// ── HTTP client (WinINet) ──────────────────────────────────
struct HttpResponse {
    int status = 0;
    std::string body;
};

static HttpResponse httpRequest(const char* host, int port, const char* method,
                                const char* path, const std::string& jsonBody = "",
                                bool https = false, int timeoutSec = 30) {
    HttpResponse resp;
    HINTERNET hInet = InternetOpenA("NanoImageEdit/1.0", INTERNET_OPEN_TYPE_PRECONFIG,
                                     nullptr, nullptr, 0);
    if (!hInet) return resp;

    DWORD timeout = timeoutSec * 1000;
    InternetSetOptionA(hInet, INTERNET_OPTION_CONNECT_TIMEOUT, &timeout, sizeof(timeout));
    InternetSetOptionA(hInet, INTERNET_OPTION_RECEIVE_TIMEOUT, &timeout, sizeof(timeout));
    InternetSetOptionA(hInet, INTERNET_OPTION_SEND_TIMEOUT, &timeout, sizeof(timeout));

    HINTERNET hConn = InternetConnectA(hInet, host, (INTERNET_PORT)port,
                                        nullptr, nullptr, INTERNET_SERVICE_HTTP, 0, 0);
    if (!hConn) { InternetCloseHandle(hInet); return resp; }

    DWORD flags = INTERNET_FLAG_RELOAD | INTERNET_FLAG_NO_CACHE_WRITE;
    if (https) flags |= INTERNET_FLAG_SECURE;

    HINTERNET hReq = HttpOpenRequestA(hConn, method, path, nullptr, nullptr,
                                       nullptr, flags, 0);
    if (!hReq) { InternetCloseHandle(hConn); InternetCloseHandle(hInet); return resp; }

    const char* headers = "Content-Type: application/json\r\n";
    BOOL ok;
    if (!jsonBody.empty()) {
        ok = HttpSendRequestA(hReq, headers, (DWORD)strlen(headers),
                              (LPVOID)jsonBody.c_str(), (DWORD)jsonBody.size());
    } else {
        ok = HttpSendRequestA(hReq, nullptr, 0, nullptr, 0);
    }

    if (ok) {
        DWORD statusCode = 0, sz = sizeof(statusCode);
        HttpQueryInfoA(hReq, HTTP_QUERY_STATUS_CODE | HTTP_QUERY_FLAG_NUMBER,
                       &statusCode, &sz, nullptr);
        resp.status = (int)statusCode;

        char buf[4096];
        DWORD bytesRead;
        while (InternetReadFile(hReq, buf, sizeof(buf), &bytesRead) && bytesRead > 0) {
            resp.body.append(buf, bytesRead);
        }
    }

    InternetCloseHandle(hReq);
    InternetCloseHandle(hConn);
    InternetCloseHandle(hInet);
    return resp;
}

static HttpResponse runnerGet(const char* path, int timeout = 5) {
    return httpRequest(RUNNER_HOST, RUNNER_PORT, "GET", path, "", false, timeout);
}

static HttpResponse runnerPost(const char* path, const std::string& json, int timeout = 300) {
    return httpRequest(RUNNER_HOST, RUNNER_PORT, "POST", path, json, false, timeout);
}

static HttpResponse runnerDelete(const char* path, int timeout = 10) {
    return httpRequest(RUNNER_HOST, RUNNER_PORT, "DELETE", path, "", false, timeout);
}

// ── Upload file to runner via multipart POST ───────────────
static std::string uploadImageToRunner(const std::wstring& filePath) {
    std::string narrowPath = toNarrow(filePath);
    std::ifstream file(filePath.c_str(), std::ios::binary);
    if (!file.is_open()) return "";

    std::vector<char> fileData((std::istreambuf_iterator<char>(file)),
                                std::istreambuf_iterator<char>());
    file.close();
    if (fileData.empty()) return "";

    std::string boundary = "----NanoImageEditBoundary" + std::to_string(GetTickCount64());
    std::string fileName = fs::path(filePath).filename().string();

    std::string body;
    body += "--" + boundary + "\r\n";
    body += "Content-Disposition: form-data; name=\"file\"; filename=\"" + fileName + "\"\r\n";
    body += "Content-Type: application/octet-stream\r\n\r\n";
    body.append(fileData.data(), fileData.size());
    body += "\r\n--" + boundary + "--\r\n";

    HINTERNET hInet = InternetOpenA("NanoImageEdit/1.0", INTERNET_OPEN_TYPE_PRECONFIG,
                                     nullptr, nullptr, 0);
    if (!hInet) return "";

    HINTERNET hConn = InternetConnectA(hInet, RUNNER_HOST, 8765,
                                        nullptr, nullptr, INTERNET_SERVICE_HTTP, 0, 0);
    if (!hConn) { InternetCloseHandle(hInet); return ""; }

    HINTERNET hReq = HttpOpenRequestA(hConn, "POST", "/api/upload", nullptr, nullptr,
                                       nullptr, INTERNET_FLAG_RELOAD, 0);
    if (!hReq) { InternetCloseHandle(hConn); InternetCloseHandle(hInet); return ""; }

    std::string contentType = "Content-Type: multipart/form-data; boundary=" + boundary + "\r\n";
    HttpSendRequestA(hReq, contentType.c_str(), (DWORD)contentType.size(),
                     (LPVOID)body.c_str(), (DWORD)body.size());

    std::string respBody;
    char buf[4096];
    DWORD bytesRead;
    while (InternetReadFile(hReq, buf, sizeof(buf), &bytesRead) && bytesRead > 0) {
        respBody.append(buf, bytesRead);
    }

    InternetCloseHandle(hReq);
    InternetCloseHandle(hConn);
    InternetCloseHandle(hInet);

    return jsonGet(respBody, "path");
}

// ── Runner health check ────────────────────────────────────
static bool isRunnerHealthy() {
    auto r = runnerGet("/healthz");
    return r.status == 200;
}

// ── Set status label (thread-safe) ─────────────────────────
static void setStatus(const std::wstring& msg, COLORREF color = C.green) {
    struct StatusData { std::wstring msg; COLORREF color; };
    auto* d = new StatusData{msg, color};
    PostMessage(hMainWnd, WM_APP_STATUS, (WPARAM)d, 0);
}

// ── Runner management ──────────────────────────────────────
static std::wstring currentLogPath;

static std::wstring makeTimestampedLogPath() {
    std::wstring logsDir = appDir + L"\\logs";
    fs::create_directories(logsDir);
    SYSTEMTIME st;
    GetLocalTime(&st);
    wchar_t buf[64];
    swprintf(buf, 64, L"%04d%02d%02d_%02d%02d%02d",
             st.wYear, st.wMonth, st.wDay, st.wHour, st.wMinute, st.wSecond);
    return logsDir + L"\\runner_" + buf + L".log";
}

static void startRunner() {
    std::wstring pythonExe = appDir + L"\\python312.exe";
    std::wstring runnerScript = appDir + L"\\run_runner.py";

    if (!fs::exists(pythonExe) || !fs::exists(runnerScript)) {
        setStatus(L"Error: python312.exe or run_runner.py not found.", C.red);
        return;
    }

    std::wstring cmdLine = L"\"" + pythonExe + L"\" -u \"" + runnerScript + L"\"";

    SECURITY_ATTRIBUTES sa = {};
    sa.nLength = sizeof(sa);
    sa.bInheritHandle = TRUE;

    currentLogPath = makeTimestampedLogPath();
    HANDLE hLog = CreateFileW(currentLogPath.c_str(), GENERIC_WRITE, FILE_SHARE_READ,
                              &sa, CREATE_ALWAYS, FILE_ATTRIBUTE_NORMAL, nullptr);

    STARTUPINFOW si = {};
    si.cb = sizeof(si);
    si.dwFlags = STARTF_USESHOWWINDOW | STARTF_USESTDHANDLES;
    si.wShowWindow = SW_HIDE;
    si.hStdOutput = hLog;
    si.hStdError = hLog;

    if (!CreateProcessW(nullptr, &cmdLine[0], nullptr, nullptr, TRUE,
                        CREATE_NO_WINDOW, nullptr, appDir.c_str(), &si, &runnerProc)) {
        setStatus(L"Failed to start runner process.", C.red);
        if (hLog != INVALID_HANDLE_VALUE) CloseHandle(hLog);
        return;
    }
    if (hLog != INVALID_HANDLE_VALUE) CloseHandle(hLog);
    runnerStarted = true;
}

static void stopRunner() {
    if (runnerStarted && runnerProc.hProcess) {
        TerminateProcess(runnerProc.hProcess, 0);
        WaitForSingleObject(runnerProc.hProcess, 5000);
        CloseHandle(runnerProc.hProcess);
        CloseHandle(runnerProc.hThread);
        runnerProc = {};
        runnerStarted = false;
    }
}

static void waitForRunner() {
    std::thread([]() {
        auto start = GetTickCount64();
        const ULONGLONG timeout = 900000;
        int dots = 0;

        while (GetTickCount64() - start < timeout && !appClosing) {
            dots = (dots + 1) % 4;
            int elapsed = (int)((GetTickCount64() - start) / 1000);

            if (runnerStarted && WaitForSingleObject(runnerProc.hProcess, 0) == WAIT_OBJECT_0) {
                DWORD exitCode = 0;
                GetExitCodeProcess(runnerProc.hProcess, &exitCode);
                std::wstring logName = currentLogPath.substr(currentLogPath.find_last_of(L"\\") + 1);
                std::wstring msg = L"Runner crashed (exit code " + std::to_wstring(exitCode) + L"). See logs\\" + logName;
                setStatus(msg, C.red);
                return;
            }

            std::wstring dotStr(dots, L'.');
            setStatus(L"Loading model" + dotStr + L"  (" + std::to_wstring(elapsed) + L"s)", C.orange);

            if (isRunnerHealthy()) {
                PostMessage(hMainWnd, WM_APP_RUNNER_READY, 0, 0);
                return;
            }
            Sleep(2000);
        }

        if (!appClosing) {
            setStatus(L"Runner failed to start. Check GPU/drivers.", C.red);
        }
    }).detach();
}

// ── License check (reads .machine_lock and validates contents) ──
static bool isLicenseValid() {
    std::wstring lockPath = appDir + L"\\.machine_lock";
    if (!fs::exists(lockPath)) return false;

    std::ifstream ifs(lockPath.c_str());
    if (!ifs.is_open()) return false;

    std::string content((std::istreambuf_iterator<char>(ifs)),
                         std::istreambuf_iterator<char>());
    ifs.close();

    if (content.size() < 50) return false;

    auto hasField = [&](const char* key) -> bool {
        std::string needle = std::string("\"") + key + "\"";
        size_t pos = content.find(needle);
        if (pos == std::string::npos) return false;
        pos = content.find(':', pos + needle.size());
        if (pos == std::string::npos) return false;
        pos = content.find_first_not_of(" \t\r\n", pos + 1);
        if (pos == std::string::npos) return false;
        if (content[pos] == '"') {
            size_t end = content.find('"', pos + 1);
            return (end != std::string::npos && end > pos + 1);
        }
        return (content[pos] != 'n');
    };

    return hasField("master_key_enc") &&
           hasField("machine_id") &&
           hasField("license_key");
}

static bool isPythonEnvReady() {
    if (!fs::exists(appDir + L"\\python312.exe")) return false;
    if (!fs::exists(appDir + L"\\.env_extracted_ok")) return false;
    if (!fs::exists(appDir + L"\\Lib")) return false;
    return true;
}

static bool isModelReady() {
    return fs::exists(appDir + L"\\models\\v.dat");
}

static bool isSetupComplete() {
    return isPythonEnvReady() && isModelReady() && isLicenseValid();
}

// ── Run first-time setup (PowerShell GUI) ──────────────────
static bool runFirstTimeSetup() {
    std::wstring setupScript = appDir + L"\\first_time_setup.ps1";
    if (!fs::exists(setupScript)) {
        MessageBoxW(hMainWnd, L"first_time_setup.ps1 not found.\n\n"
                    L"Please reinstall the application.",
                    L"Setup Error", MB_OK | MB_ICONERROR);
        return false;
    }

    setStatus(L"Running first-time setup...", C.orange);

    std::wstring cmdLine = L"powershell.exe -NoProfile -ExecutionPolicy Bypass -File \""
                           + setupScript + L"\" -InstallDir \"" + appDir + L"\"";

    STARTUPINFOW si = {};
    si.cb = sizeof(si);
    PROCESS_INFORMATION pi = {};

    if (!CreateProcessW(nullptr, &cmdLine[0], nullptr, nullptr, FALSE,
                        0, nullptr, appDir.c_str(), &si, &pi)) {
        MessageBoxW(hMainWnd, L"Failed to launch first-time setup.\n\n"
                    L"Make sure PowerShell is available.",
                    L"Setup Error", MB_OK | MB_ICONERROR);
        return false;
    }

    WaitForSingleObject(pi.hProcess, INFINITE);
    DWORD exitCode = 1;
    GetExitCodeProcess(pi.hProcess, &exitCode);
    CloseHandle(pi.hProcess);
    CloseHandle(pi.hThread);

    if (exitCode != 0) {
        setStatus(L"Setup was cancelled or failed. Click Retry to resume.", C.red);
        return false;
    }

    if (!isPythonEnvReady()) {
        setStatus(L"Setup completed but environment not found.", C.red);
        return false;
    }

    if (!isModelReady()) {
        setStatus(L"Setup completed but model is incomplete.", C.red);
        return false;
    }

    return true;
}

// ── Create fonts ───────────────────────────────────────────
static void createFonts() {
    hFontTitle  = CreateFontW(-20, 0, 0, 0, FW_BOLD, 0, 0, 0, DEFAULT_CHARSET,
                              0, 0, CLEARTYPE_QUALITY, 0, L"Segoe UI");
    hFontNormal = CreateFontW(-14, 0, 0, 0, FW_NORMAL, 0, 0, 0, DEFAULT_CHARSET,
                              0, 0, CLEARTYPE_QUALITY, 0, L"Segoe UI");
    hFontSmall  = CreateFontW(-12, 0, 0, 0, FW_NORMAL, 0, 0, 0, DEFAULT_CHARSET,
                              0, 0, CLEARTYPE_QUALITY, 0, L"Segoe UI");
    hFontMono   = CreateFontW(-11, 0, 0, 0, FW_NORMAL, 0, 0, 0, DEFAULT_CHARSET,
                              0, 0, CLEARTYPE_QUALITY, 0, L"Consolas");
    hFontButton = CreateFontW(-14, 0, 0, 0, FW_BOLD, 0, 0, 0, DEFAULT_CHARSET,
                              0, 0, CLEARTYPE_QUALITY, 0, L"Segoe UI");
    hFontBig    = CreateFontW(-17, 0, 0, 0, FW_BOLD, 0, 0, 0, DEFAULT_CHARSET,
                              0, 0, CLEARTYPE_QUALITY, 0, L"Consolas");
    hFontTab    = CreateFontW(-13, 0, 0, 0, FW_BOLD, 0, 0, 0, DEFAULT_CHARSET,
                              0, 0, CLEARTYPE_QUALITY, 0, L"Segoe UI");
}

static void createBrushes() {
    hBrBg     = CreateSolidBrush(C.bg);
    hBrBg2    = CreateSolidBrush(C.bg2);
    hBrBg3    = CreateSolidBrush(C.bg3);
    hBrAccent = CreateSolidBrush(C.accent);
    hBrTabBg  = CreateSolidBrush(C.tabBg);
}

// ── Owner-drawn button painting ────────────────────────────
static void drawButton(DRAWITEMSTRUCT* dis, COLORREF bgColor, COLORREF fgColor) {
    HBRUSH br = CreateSolidBrush(bgColor);
    FillRect(dis->hDC, &dis->rcItem, br);
    DeleteObject(br);

    HPEN pen = CreatePen(PS_SOLID, 1, bgColor);
    SelectObject(dis->hDC, pen);
    RoundRect(dis->hDC, dis->rcItem.left, dis->rcItem.top,
              dis->rcItem.right, dis->rcItem.bottom, 6, 6);
    DeleteObject(pen);

    SetBkMode(dis->hDC, TRANSPARENT);
    SetTextColor(dis->hDC, fgColor);
    SelectObject(dis->hDC, hFontButton);

    wchar_t text[256];
    GetWindowTextW(dis->hwndItem, text, 256);
    DrawTextW(dis->hDC, text, -1, &dis->rcItem, DT_CENTER | DT_VCENTER | DT_SINGLELINE);
}

static void drawTabButton(DRAWITEMSTRUCT* dis, bool active) {
    COLORREF bg = active ? C.accent : C.tabBg;
    COLORREF fg = active ? C.bg : C.muted;

    HBRUSH br = CreateSolidBrush(bg);
    FillRect(dis->hDC, &dis->rcItem, br);
    DeleteObject(br);

    if (active) {
        HPEN pen = CreatePen(PS_SOLID, 2, C.accent);
        SelectObject(dis->hDC, pen);
        MoveToEx(dis->hDC, dis->rcItem.left, dis->rcItem.bottom - 1, nullptr);
        LineTo(dis->hDC, dis->rcItem.right, dis->rcItem.bottom - 1);
        DeleteObject(pen);
    }

    SetBkMode(dis->hDC, TRANSPARENT);
    SetTextColor(dis->hDC, fg);
    SelectObject(dis->hDC, hFontTab);

    wchar_t text[256];
    GetWindowTextW(dis->hwndItem, text, 256);
    DrawTextW(dis->hDC, text, -1, &dis->rcItem, DT_CENTER | DT_VCENTER | DT_SINGLELINE);
}

// ── Containers for tab panels ──────────────────────────────
static std::vector<HWND> text2imgControls;
static std::vector<HWND> img2imgControls;

static void showTabControls(TabMode tab) {
    for (HWND h : text2imgControls) ShowWindow(h, tab == TAB_TEXT2IMG ? SW_SHOW : SW_HIDE);
    for (HWND h : img2imgControls) ShowWindow(h, tab == TAB_IMG2IMG ? SW_SHOW : SW_HIDE);
    InvalidateRect(hTabText2Img, nullptr, TRUE);
    InvalidateRect(hTabImg2Img, nullptr, TRUE);
}

// ── Update image count label ───────────────────────────────
static void updateImgCountLabel() {
    std::wstring text = std::to_wstring(i2iImagePaths.size()) + L" / " + std::to_wstring(MAX_REF_IMAGES) + L" images";
    SetWindowTextW(hI2IImgCountLbl, text.c_str());
    InvalidateRect(hI2IImgPanel, nullptr, TRUE);
}

// ── Get text from edit control ─────────────────────────────
static std::wstring getEditText(HWND h) {
    int len = GetWindowTextLengthW(h);
    if (len <= 0) return L"";
    std::wstring buf(len + 1, 0);
    GetWindowTextW(h, &buf[0], len + 1);
    buf.resize(len);
    return buf;
}

// ── Create the main UI ─────────────────────────────────────
static void createUI(HWND hwnd) {
    int x = 20, y = 15, w = WINDOW_W - 60;

    // Title row
    CreateWindowW(L"STATIC", L"Nano ImageEdit", WS_CHILD | WS_VISIBLE | SS_LEFT,
                  x, y, 240, 28, hwnd, nullptr, nullptr, nullptr);

    hGpuLabel = CreateWindowW(L"STATIC", L"", WS_CHILD | WS_VISIBLE | SS_LEFT,
                              x + 250, y + 5, 300, 20, hwnd, (HMENU)IDC_GPU, nullptr, nullptr);

    hDeactivateBtn = CreateWindowW(L"BUTTON", L"Deactivate", WS_CHILD | WS_VISIBLE | BS_OWNERDRAW,
                                    w - 60, y, 100, 28, hwnd, (HMENU)IDC_DEACTIVATE, nullptr, nullptr);
    y += 35;

    // Subtitle
    CreateWindowW(L"STATIC", L"AI-powered image generation and editing.",
                  WS_CHILD | WS_VISIBLE | SS_LEFT, x, y, w, 18, hwnd, nullptr, nullptr, nullptr);
    y += 28;

    // ── Tab bar ────────────────────────────────────────────
    hTabText2Img = CreateWindowW(L"BUTTON", L"  Text to Image  ", WS_CHILD | WS_VISIBLE | BS_OWNERDRAW,
                                  x, y, 160, 32, hwnd, (HMENU)IDC_TAB_TEXT2IMG, nullptr, nullptr);
    hTabImg2Img = CreateWindowW(L"BUTTON", L"  Image Edit  ", WS_CHILD | WS_VISIBLE | BS_OWNERDRAW,
                                 x + 164, y, 160, 32, hwnd, (HMENU)IDC_TAB_IMG2IMG, nullptr, nullptr);
    y += 40;

    int panelY = y;

    // ════════════════════════════════════════════════════════
    // TEXT2IMG PANEL
    // ════════════════════════════════════════════════════════
    {
        int cy = panelY;
        HWND lbl;

        lbl = CreateWindowW(L"STATIC", L"GENERATE IMAGE", WS_CHILD | WS_VISIBLE | SS_LEFT,
                      x + 12, cy, w, 18, hwnd, nullptr, nullptr, nullptr);
        text2imgControls.push_back(lbl);
        cy += 25;

        lbl = CreateWindowW(L"STATIC", L"Prompt:", WS_CHILD | WS_VISIBLE | SS_LEFT,
                      x + 12, cy, 60, 18, hwnd, nullptr, nullptr, nullptr);
        text2imgControls.push_back(lbl);
        cy += 20;

        hPromptEdit = CreateWindowExW(0, L"EDIT", L"A cat holding a sign that says hello world",
                                       WS_CHILD | WS_VISIBLE | WS_BORDER | ES_MULTILINE | ES_AUTOVSCROLL | ES_WANTRETURN,
                                       x + 12, cy, w - 24, 60, hwnd, (HMENU)IDC_PROMPT, nullptr, nullptr);
        text2imgControls.push_back(hPromptEdit);
        cy += 68;

        // Parameters row
        int px = x;
        auto addParam = [&](const wchar_t* label, const wchar_t* def, int editW, int id) -> HWND {
            HWND l = CreateWindowW(L"STATIC", label, WS_CHILD | WS_VISIBLE | SS_LEFT,
                          px + 12, cy, 60, 18, hwnd, nullptr, nullptr, nullptr);
            text2imgControls.push_back(l);
            HWND h = CreateWindowExW(0, L"EDIT", def,
                                      WS_CHILD | WS_VISIBLE | WS_BORDER | ES_CENTER,
                                      px + 12 + 62, cy - 2, editW, 22, hwnd, (HMENU)(INT_PTR)id, nullptr, nullptr);
            text2imgControls.push_back(h);
            px += 62 + editW + 20;
            return h;
        };

        hWidthEdit    = addParam(L"Width:", L"1024", 55, IDC_WIDTH);
        hHeightEdit   = addParam(L"Height:", L"1024", 55, IDC_HEIGHT);
        hStepsEdit    = addParam(L"Steps:", L"4", 40, IDC_STEPS);
        hGuidanceEdit = addParam(L"Guidance:", L"1.0", 45, IDC_GUIDANCE);
        hSeedEdit     = addParam(L"Seed:", L"0", 55, IDC_SEED);
        cy += 30;

        hGenerateBtn = CreateWindowW(L"BUTTON", L"Generate", WS_CHILD | WS_VISIBLE | BS_OWNERDRAW | WS_DISABLED,
                                      x + 12, cy, w - 24, 38, hwnd, (HMENU)IDC_GENERATE, nullptr, nullptr);
        text2imgControls.push_back(hGenerateBtn);
    }

    // ════════════════════════════════════════════════════════
    // IMG2IMG PANEL
    // ════════════════════════════════════════════════════════
    {
        int cy = panelY;
        HWND lbl;

        lbl = CreateWindowW(L"STATIC", L"IMAGE EDITING", WS_CHILD | SS_LEFT,
                      x + 12, cy, w, 18, hwnd, nullptr, nullptr, nullptr);
        img2imgControls.push_back(lbl);
        cy += 25;

        // Reference images section
        lbl = CreateWindowW(L"STATIC", L"Reference Images (upload up to 4):", WS_CHILD | SS_LEFT,
                      x + 12, cy, 300, 18, hwnd, nullptr, nullptr, nullptr);
        img2imgControls.push_back(lbl);

        hI2IImgCountLbl = CreateWindowW(L"STATIC", L"0 / 4 images", WS_CHILD | SS_RIGHT,
                                         w - 120, cy, 130, 18, hwnd, (HMENU)IDC_I2I_IMG_COUNT, nullptr, nullptr);
        img2imgControls.push_back(hI2IImgCountLbl);
        cy += 22;

        // Image thumbnail panel (owner-drawn)
        hI2IImgPanel = CreateWindowW(L"STATIC", L"", WS_CHILD | SS_OWNERDRAW,
                                      x + 12, cy, w - 24, 110, hwnd, (HMENU)IDC_I2I_IMG_PANEL, nullptr, nullptr);
        img2imgControls.push_back(hI2IImgPanel);
        cy += 115;

        // Add / Clear buttons
        hI2IAddImgBtn = CreateWindowW(L"BUTTON", L"+ Add Images", WS_CHILD | BS_OWNERDRAW,
                                       x + 12, cy, 140, 30, hwnd, (HMENU)IDC_I2I_ADD_IMG, nullptr, nullptr);
        img2imgControls.push_back(hI2IAddImgBtn);

        hI2IClearImgBtn = CreateWindowW(L"BUTTON", L"Clear All", WS_CHILD | BS_OWNERDRAW,
                                         x + 160, cy, 100, 30, hwnd, (HMENU)IDC_I2I_CLEAR_IMG, nullptr, nullptr);
        img2imgControls.push_back(hI2IClearImgBtn);
        cy += 38;

        // Prompt
        lbl = CreateWindowW(L"STATIC", L"Edit Prompt (describe the changes you want):", WS_CHILD | SS_LEFT,
                      x + 12, cy, 400, 18, hwnd, nullptr, nullptr, nullptr);
        img2imgControls.push_back(lbl);
        cy += 20;

        hI2IPromptEdit = CreateWindowExW(0, L"EDIT", L"",
                                          WS_CHILD | WS_BORDER | ES_MULTILINE | ES_AUTOVSCROLL | ES_WANTRETURN,
                                          x + 12, cy, w - 24, 50, hwnd, (HMENU)IDC_I2I_PROMPT, nullptr, nullptr);
        img2imgControls.push_back(hI2IPromptEdit);
        cy += 58;

        // Parameters row
        int px = x;
        auto addParam2 = [&](const wchar_t* label, const wchar_t* def, int editW, int id) -> HWND {
            HWND l = CreateWindowW(L"STATIC", label, WS_CHILD | SS_LEFT,
                          px + 12, cy, 60, 18, hwnd, nullptr, nullptr, nullptr);
            img2imgControls.push_back(l);
            HWND h = CreateWindowExW(0, L"EDIT", def,
                                      WS_CHILD | WS_BORDER | ES_CENTER,
                                      px + 12 + 62, cy - 2, editW, 22, hwnd, (HMENU)(INT_PTR)id, nullptr, nullptr);
            img2imgControls.push_back(h);
            px += 62 + editW + 20;
            return h;
        };

        hI2IWidthEdit    = addParam2(L"Width:", L"1024", 55, IDC_I2I_WIDTH);
        hI2IHeightEdit   = addParam2(L"Height:", L"1024", 55, IDC_I2I_HEIGHT);
        hI2IStepsEdit    = addParam2(L"Steps:", L"4", 40, IDC_I2I_STEPS);
        hI2IGuidanceEdit = addParam2(L"Guidance:", L"1.0", 45, IDC_I2I_GUIDANCE);
        hI2ISeedEdit     = addParam2(L"Seed:", L"0", 55, IDC_I2I_SEED);
        cy += 30;

        hI2IGenerateBtn = CreateWindowW(L"BUTTON", L"Generate Edit", WS_CHILD | BS_OWNERDRAW | WS_DISABLED,
                                         x + 12, cy, w - 24, 38, hwnd, (HMENU)IDC_I2I_GENERATE, nullptr, nullptr);
        img2imgControls.push_back(hI2IGenerateBtn);
    }

    // ════════════════════════════════════════════════════════
    // SHARED CONTROLS (below both panels)
    // ════════════════════════════════════════════════════════
    int sharedY = panelY + 260;

    // Status label
    hStatusLabel = CreateWindowW(L"STATIC", L"Starting...", WS_CHILD | WS_VISIBLE | SS_LEFT,
                                  x + 12, sharedY, w - 24, 20, hwnd, (HMENU)IDC_STATUS, nullptr, nullptr);
    sharedY += 25;

    // Progress bar
    hProgressBar = CreateWindowExW(0, PROGRESS_CLASSW, nullptr,
                                    WS_CHILD | PBS_SMOOTH,
                                    x + 12, sharedY, w - 24, 12, hwnd, (HMENU)IDC_PROGRESS, nullptr, nullptr);
    SendMessage(hProgressBar, PBM_SETRANGE, 0, MAKELPARAM(0, 100));
    SendMessage(hProgressBar, PBM_SETBARCOLOR, 0, (LPARAM)C.purple);
    SendMessage(hProgressBar, PBM_SETBKCOLOR, 0, (LPARAM)C.bg3);
    sharedY += 16;

    hProgressLabel = CreateWindowW(L"STATIC", L"", WS_CHILD | SS_LEFT,
                                    x + 12, sharedY, w - 24, 16, hwnd, (HMENU)IDC_PROGRESS_LBL, nullptr, nullptr);
    sharedY += 25;

    // Result section
    CreateWindowW(L"STATIC", L"RESULT", WS_CHILD | WS_VISIBLE | SS_LEFT,
                  x + 12, sharedY, w, 18, hwnd, nullptr, nullptr, nullptr);
    sharedY += 25;

    hResultImage = CreateWindowW(L"STATIC", L"", WS_CHILD | WS_VISIBLE | SS_OWNERDRAW,
                                  x + 12, sharedY, w - 24, 260, hwnd, (HMENU)IDC_RESULT_IMG, nullptr, nullptr);
    sharedY += 268;

    hOpenFolderBtn = CreateWindowW(L"BUTTON", L"Open output folder",
                                    WS_CHILD | WS_VISIBLE | BS_OWNERDRAW,
                                    x + 12, sharedY, w - 24, 32, hwnd, (HMENU)IDC_OPEN_FOLDER, nullptr, nullptr);
    sharedY += 42;

    // Task Queue
    CreateWindowW(L"STATIC", L"TASK QUEUE", WS_CHILD | WS_VISIBLE | SS_LEFT,
                  x + 12, sharedY, w, 18, hwnd, nullptr, nullptr, nullptr);
    sharedY += 25;

    hTaskListBox = CreateWindowExW(0, L"LISTBOX", nullptr,
                                    WS_CHILD | WS_VISIBLE | WS_BORDER | LBS_NOINTEGRALHEIGHT | LBS_HASSTRINGS,
                                    x + 12, sharedY, w - 24, 80, hwnd, (HMENU)IDC_TASKLIST, nullptr, nullptr);
    sharedY += 90;

    // Logs
    hToggleLogBtn = CreateWindowW(L"BUTTON", L"Show Logs", WS_CHILD | WS_VISIBLE | BS_OWNERDRAW,
                                   x + 12, sharedY, 100, 26, hwnd, (HMENU)IDC_TOGGLE_LOG, nullptr, nullptr);
    sharedY += 32;

    hLogEdit = CreateWindowExW(0, L"EDIT", L"",
                                WS_CHILD | WS_BORDER | ES_MULTILINE | ES_READONLY | ES_AUTOVSCROLL | WS_VSCROLL,
                                x + 12, sharedY, w - 24, 150, hwnd, (HMENU)IDC_LOG, nullptr, nullptr);

    // Apply fonts
    auto setFont = [](HWND h, HFONT f) { if (h) SendMessage(h, WM_SETFONT, (WPARAM)f, TRUE); };
    setFont(hPromptEdit, hFontNormal);
    setFont(hWidthEdit, hFontNormal);
    setFont(hHeightEdit, hFontNormal);
    setFont(hStepsEdit, hFontNormal);
    setFont(hGuidanceEdit, hFontNormal);
    setFont(hSeedEdit, hFontNormal);
    setFont(hI2IPromptEdit, hFontNormal);
    setFont(hI2IWidthEdit, hFontNormal);
    setFont(hI2IHeightEdit, hFontNormal);
    setFont(hI2IStepsEdit, hFontNormal);
    setFont(hI2IGuidanceEdit, hFontNormal);
    setFont(hI2ISeedEdit, hFontNormal);
    setFont(hStatusLabel, hFontNormal);
    setFont(hGpuLabel, hFontSmall);
    setFont(hProgressLabel, hFontSmall);
    setFont(hTaskListBox, hFontSmall);
    setFont(hLogEdit, hFontMono);
    setFont(hGenerateBtn, hFontButton);
    setFont(hI2IGenerateBtn, hFontButton);
    setFont(hOpenFolderBtn, hFontNormal);
    setFont(hToggleLogBtn, hFontSmall);
    setFont(hDeactivateBtn, hFontSmall);
    setFont(hI2IImgCountLbl, hFontSmall);

    // Show initial tab
    showTabControls(TAB_TEXT2IMG);
}

// ── Generate image (text2img) ──────────────────────────────
static void doGenerate() {
    std::wstring prompt = getEditText(hPromptEdit);
    if (prompt.empty()) { setStatus(L"Please enter a prompt.", C.red); return; }

    std::string sPrompt = toNarrow(prompt);
    std::string sWidth  = toNarrow(getEditText(hWidthEdit));
    std::string sHeight = toNarrow(getEditText(hHeightEdit));
    std::string sSteps  = toNarrow(getEditText(hStepsEdit));
    std::string sGuid   = toNarrow(getEditText(hGuidanceEdit));
    std::string sSeed   = toNarrow(getEditText(hSeedEdit));

    EnableWindow(hGenerateBtn, FALSE);
    generating = true;
    setStatus(L"Submitting...", C.orange);

    std::thread([=]() {
        std::string escaped;
        for (char c : sPrompt) {
            if (c == '"') escaped += "\\\"";
            else if (c == '\\') escaped += "\\\\";
            else if (c == '\n') escaped += "\\n";
            else if (c == '\r') continue;
            else escaped += c;
        }

        std::string json = "{\"action\":\"create\",\"prompt\":\"" + escaped +
            "\",\"width\":" + sWidth + ",\"height\":" + sHeight +
            ",\"steps\":" + sSteps + ",\"guidance_scale\":" + sGuid +
            ",\"seed\":" + sSeed + ",\"task_type\":\"text2img\",\"image_paths\":[]}";

        auto r = runnerPost("/api/generate", json);
        if (r.status == 200) {
            std::string tid = jsonGet(r.body, "task_id");
            if (!tid.empty()) {
                std::lock_guard<std::mutex> lk(taskMutex);
                activeTaskId = tid;
                setStatus(L"Task queued. Generating...", C.orange);
                PostMessage(hMainWnd, WM_APP_TASK_UPDATE, 0, 0);
            } else {
                setStatus(L"Error: no task_id in response.", C.red);
                PostMessage(hMainWnd, WM_APP_TASK_UPDATE, 1, 0);
            }
        } else {
            std::string err = jsonGet(r.body, "error");
            setStatus(L"Generation failed: " + toWide(err.empty() ? "server error" : err), C.red);
            PostMessage(hMainWnd, WM_APP_TASK_UPDATE, 1, 0);
        }
    }).detach();
}

// ── Generate image (img2img) ───────────────────────────────
static void doGenerateImg2Img() {
    std::wstring prompt = getEditText(hI2IPromptEdit);
    if (prompt.empty()) { setStatus(L"Please enter an edit prompt.", C.red); return; }
    if (i2iImagePaths.empty()) { setStatus(L"Please add at least one reference image.", C.red); return; }

    std::string sPrompt = toNarrow(prompt);
    std::string sWidth  = toNarrow(getEditText(hI2IWidthEdit));
    std::string sHeight = toNarrow(getEditText(hI2IHeightEdit));
    std::string sSteps  = toNarrow(getEditText(hI2IStepsEdit));
    std::string sGuid   = toNarrow(getEditText(hI2IGuidanceEdit));
    std::string sSeed   = toNarrow(getEditText(hI2ISeedEdit));

    // Collect server paths
    std::vector<std::string> serverPaths;
    for (auto& p : i2iImagePaths) serverPaths.push_back(toNarrow(p));

    EnableWindow(hI2IGenerateBtn, FALSE);
    generating = true;
    setStatus(L"Submitting image edit...", C.orange);

    std::thread([=]() {
        std::string escaped;
        for (char c : sPrompt) {
            if (c == '"') escaped += "\\\"";
            else if (c == '\\') escaped += "\\\\";
            else if (c == '\n') escaped += "\\n";
            else if (c == '\r') continue;
            else escaped += c;
        }

        std::string pathsJson = "[";
        for (size_t i = 0; i < serverPaths.size(); i++) {
            if (i > 0) pathsJson += ",";
            pathsJson += "\"" + serverPaths[i] + "\"";
        }
        pathsJson += "]";

        std::string json = "{\"action\":\"create\",\"prompt\":\"" + escaped +
            "\",\"width\":" + sWidth + ",\"height\":" + sHeight +
            ",\"steps\":" + sSteps + ",\"guidance_scale\":" + sGuid +
            ",\"seed\":" + sSeed + ",\"task_type\":\"img2img\",\"image_paths\":" + pathsJson + "}";

        auto r = runnerPost("/api/generate", json);
        if (r.status == 200) {
            std::string tid = jsonGet(r.body, "task_id");
            if (!tid.empty()) {
                std::lock_guard<std::mutex> lk(taskMutex);
                activeTaskId = tid;
                setStatus(L"Task queued. Generating edit...", C.orange);
                PostMessage(hMainWnd, WM_APP_TASK_UPDATE, 0, 0);
            } else {
                setStatus(L"Error: no task_id in response.", C.red);
                PostMessage(hMainWnd, WM_APP_TASK_UPDATE, 1, 0);
            }
        } else {
            std::string err = jsonGet(r.body, "error");
            setStatus(L"Generation failed: " + toWide(err.empty() ? "server error" : err), C.red);
            PostMessage(hMainWnd, WM_APP_TASK_UPDATE, 1, 0);
        }
    }).detach();
}

// ── Add reference images (file picker) ─────────────────────
static void addReferenceImages() {
    if ((int)i2iImagePaths.size() >= MAX_REF_IMAGES) {
        setStatus(L"Maximum 4 reference images reached.", C.orange);
        return;
    }

    wchar_t fileBuffer[4096] = {};
    OPENFILENAMEW ofn = {};
    ofn.lStructSize = sizeof(ofn);
    ofn.hwndOwner = hMainWnd;
    ofn.lpstrFilter = L"Images\0*.png;*.jpg;*.jpeg;*.bmp;*.webp\0All Files\0*.*\0";
    ofn.lpstrFile = fileBuffer;
    ofn.nMaxFile = 4096;
    ofn.Flags = OFN_FILEMUSTEXIST | OFN_ALLOWMULTISELECT | OFN_EXPLORER;
    ofn.lpstrTitle = L"Select Reference Images (up to 4)";

    if (!GetOpenFileNameW(&ofn)) return;

    std::vector<std::wstring> files;
    wchar_t* p = fileBuffer;
    std::wstring dir = p;
    p += dir.size() + 1;

    if (*p == 0) {
        files.push_back(dir);
    } else {
        while (*p) {
            std::wstring fname = p;
            files.push_back(dir + L"\\" + fname);
            p += fname.size() + 1;
        }
    }

    int remaining = MAX_REF_IMAGES - (int)i2iImagePaths.size();
    int toAdd = (std::min)((int)files.size(), remaining);

    setStatus(L"Uploading images...", C.orange);

    std::vector<std::wstring> filesToUpload(files.begin(), files.begin() + toAdd);

    std::thread([filesToUpload]() {
        for (auto& f : filesToUpload) {
            std::string serverPath = uploadImageToRunner(f);
            if (!serverPath.empty()) {
                i2iImagePaths.push_back(toWide(serverPath));
                i2iImageNames.push_back(fs::path(f).filename().wstring());

                auto* img = Gdiplus::Image::FromFile(f.c_str());
                if (img && img->GetLastStatus() == Gdiplus::Ok) {
                    i2iThumbnails.push_back(img);
                } else {
                    if (img) delete img;
                    i2iThumbnails.push_back(nullptr);
                }
            }
        }
        PostMessage(hMainWnd, WM_APP_TASK_UPDATE, 5, 0);
        setStatus(L"Images uploaded. Ready to generate.", C.green);
    }).detach();
}

static void clearReferenceImages() {
    i2iImagePaths.clear();
    i2iImageNames.clear();
    for (auto* img : i2iThumbnails) { if (img) delete img; }
    i2iThumbnails.clear();
    updateImgCountLabel();
}

// ── Paint image thumbnail panel ────────────────────────────
static void paintImgPanel(DRAWITEMSTRUCT* dis) {
    HBRUSH br = CreateSolidBrush(C.bg3);
    FillRect(dis->hDC, &dis->rcItem, br);
    DeleteObject(br);

    int boxW = dis->rcItem.right - dis->rcItem.left;
    int boxH = dis->rcItem.bottom - dis->rcItem.top;

    if (i2iThumbnails.empty()) {
        SetBkMode(dis->hDC, TRANSPARENT);
        SetTextColor(dis->hDC, C.muted);
        SelectObject(dis->hDC, hFontNormal);
        DrawTextW(dis->hDC, L"No reference images. Click \"+ Add Images\" to upload.", -1, &dis->rcItem,
                  DT_CENTER | DT_VCENTER | DT_SINGLELINE);
        return;
    }

    Gdiplus::Graphics gfx(dis->hDC);
    gfx.SetInterpolationMode(Gdiplus::InterpolationModeHighQualityBicubic);

    int thumbSize = 90;
    int gap = 10;
    int startX = 10;
    int startY = (boxH - thumbSize - 16) / 2;

    for (int i = 0; i < (int)i2iThumbnails.size(); i++) {
        int tx = startX + i * (thumbSize + gap);
        int ty = startY;

        // Border
        Gdiplus::Pen borderPen(Gdiplus::Color(100, 99, 108, 144), 1);
        gfx.DrawRectangle(&borderPen, tx - 1, ty - 1, thumbSize + 1, thumbSize + 1);

        if (i2iThumbnails[i]) {
            int imgW = i2iThumbnails[i]->GetWidth();
            int imgH = i2iThumbnails[i]->GetHeight();
            float scale = (std::min)((float)thumbSize / imgW, (float)thumbSize / imgH);
            int drawW = (int)(imgW * scale);
            int drawH = (int)(imgH * scale);
            int drawX = tx + (thumbSize - drawW) / 2;
            int drawY = ty + (thumbSize - drawH) / 2;
            gfx.DrawImage(i2iThumbnails[i], drawX, drawY, drawW, drawH);
        }

        // Filename label below
        if (i < (int)i2iImageNames.size()) {
            SetBkMode(dis->hDC, TRANSPARENT);
            SetTextColor(dis->hDC, C.fg);
            SelectObject(dis->hDC, hFontSmall);
            RECT labelRect = { tx, ty + thumbSize + 2, tx + thumbSize, ty + thumbSize + 16 };
            DrawTextW(dis->hDC, i2iImageNames[i].c_str(), -1, &labelRect,
                      DT_CENTER | DT_SINGLELINE | DT_END_ELLIPSIS);
        }
    }
}

// ── Poll active task ───────────────────────────────────────
static void pollActiveTask() {
    std::string tid;
    {
        std::lock_guard<std::mutex> lk(taskMutex);
        tid = activeTaskId;
    }
    if (tid.empty()) return;

    std::thread([tid]() {
        std::string json = "{\"action\":\"check\",\"task_id\":\"" + tid + "\"}";
        auto r = runnerPost("/api/generate", json, 10);
        if (r.status != 200) return;

        std::string status = jsonGet(r.body, "status");
        std::string progress = jsonGet(r.body, "progress");
        std::string message = jsonGet(r.body, "message");
        std::string result = jsonGet(r.body, "result");

        float pct = 0;
        try { pct = std::stof(progress); } catch (...) {}

        if (status == "DONE") {
            {
                std::lock_guard<std::mutex> lk(taskMutex);
                activeTaskId.clear();
            }
            generating = false;

            if (!result.empty()) {
                resultImagePath = toWide(result);
                PostMessage(hMainWnd, WM_APP_RESULT, 0, 0);
            }
            setStatus(L"Generation complete!", C.green);
            PostMessage(hMainWnd, WM_APP_TASK_UPDATE, 1, 0);
        } else if (status == "ERROR" || status == "CANCELLED" || status == "TIMEOUT") {
            {
                std::lock_guard<std::mutex> lk(taskMutex);
                activeTaskId.clear();
            }
            generating = false;
            std::string err = jsonGet(r.body, "error");
            setStatus(L"Task " + toWide(status) + L": " + toWide(err.empty() ? message : err), C.red);
            PostMessage(hMainWnd, WM_APP_TASK_UPDATE, 1, 0);
        } else {
            int pctInt = (int)(pct * 100);
            ShowWindow(hProgressBar, SW_SHOW);
            ShowWindow(hProgressLabel, SW_SHOW);
            PostMessage(hProgressBar, PBM_SETPOS, pctInt, 0);
            setStatus(toWide(message.empty() ? "Processing..." : message), C.orange);
        }
    }).detach();
}

// ── Refresh task list ──────────────────────────────────────
static void refreshTaskList() {
    std::thread([]() {
        auto r = runnerGet("/api/tasks");
        if (r.status != 200) return;

        std::vector<std::wstring> items;
        std::string body = r.body;
        size_t pos = body.find("\"tasks\"");
        if (pos == std::string::npos) return;
        pos = body.find('[', pos);
        if (pos == std::string::npos) return;

        int depth = 0;
        size_t objStart = 0;
        for (size_t i = pos; i < body.size(); i++) {
            if (body[i] == '{') { if (depth == 0) objStart = i; depth++; }
            else if (body[i] == '}') {
                depth--;
                if (depth == 0) {
                    std::string obj = body.substr(objStart, i - objStart + 1);
                    std::string st  = jsonGet(obj, "status");
                    std::string msg = jsonGet(obj, "message");
                    std::string tl  = jsonGet(obj, "task_label");
                    std::wstring line = L"[" + toWide(st) + L"] " + toWide(tl.empty() ? "Task" : tl);
                    if (!msg.empty()) line += L" \u2014 " + toWide(msg);
                    items.push_back(line);
                }
            }
        }
        PostMessage(hMainWnd, WM_APP_TASK_UPDATE, 2, (LPARAM)new std::vector<std::wstring>(std::move(items)));
    }).detach();
}

// ── Refresh logs ───────────────────────────────────────────
static void refreshLogs() {
    if (!logsVisible) return;
    std::thread([]() {
        auto r = runnerGet("/api/logs");
        if (r.status != 200) return;

        std::string text;
        std::string body = r.body;
        size_t pos = body.find("\"logs\"");
        if (pos == std::string::npos) return;
        pos = body.find('[', pos);
        if (pos == std::string::npos) return;

        int depth = 0;
        size_t objStart = 0;
        for (size_t i = pos; i < body.size(); i++) {
            if (body[i] == '{') { if (depth == 0) objStart = i; depth++; }
            else if (body[i] == '}') {
                depth--;
                if (depth == 0) {
                    std::string obj = body.substr(objStart, i - objStart + 1);
                    std::string ts  = jsonGet(obj, "ts");
                    std::string msg = jsonGet(obj, "msg");
                    text += ts + "  " + msg + "\r\n";
                }
            }
        }
        auto* pText = new std::wstring(toWide(text));
        PostMessage(hMainWnd, WM_APP_TASK_UPDATE, 3, (LPARAM)pText);
    }).detach();
}

// ── Load and display result image ──────────────────────────
static void loadResultImage() {
    if (pResultBitmap) { delete pResultBitmap; pResultBitmap = nullptr; }
    if (resultImagePath.empty()) return;

    pResultBitmap = Gdiplus::Image::FromFile(resultImagePath.c_str());
    if (pResultBitmap && pResultBitmap->GetLastStatus() != Gdiplus::Ok) {
        delete pResultBitmap;
        pResultBitmap = nullptr;
    }
    InvalidateRect(hResultImage, nullptr, TRUE);
}

static void paintResultImage(DRAWITEMSTRUCT* dis) {
    HBRUSH br = CreateSolidBrush(C.bg3);
    FillRect(dis->hDC, &dis->rcItem, br);
    DeleteObject(br);

    if (!pResultBitmap) {
        SetBkMode(dis->hDC, TRANSPARENT);
        SetTextColor(dis->hDC, C.muted);
        SelectObject(dis->hDC, hFontNormal);
        DrawTextW(dis->hDC, L"Generated image will appear here", -1, &dis->rcItem,
                  DT_CENTER | DT_VCENTER | DT_SINGLELINE);
        return;
    }

    Gdiplus::Graphics gfx(dis->hDC);
    gfx.SetInterpolationMode(Gdiplus::InterpolationModeHighQualityBicubic);

    int imgW = pResultBitmap->GetWidth();
    int imgH = pResultBitmap->GetHeight();
    int boxW = dis->rcItem.right - dis->rcItem.left;
    int boxH = dis->rcItem.bottom - dis->rcItem.top;

    float scale = (std::min)((float)boxW / imgW, (float)boxH / imgH);
    int drawW = (int)(imgW * scale);
    int drawH = (int)(imgH * scale);
    int drawX = (boxW - drawW) / 2;
    int drawY = (boxH - drawH) / 2;

    gfx.DrawImage(pResultBitmap, drawX, drawY, drawW, drawH);
}

// ── Window procedure ───────────────────────────────────────
LRESULT CALLBACK WndProc(HWND hwnd, UINT msg, WPARAM wParam, LPARAM lParam) {
    switch (msg) {
    case WM_CREATE:
        createUI(hwnd);
        SetTimer(hwnd, TIMER_STARTUP, 500, nullptr);
        return 0;

    case WM_TIMER:
        if (wParam == TIMER_STARTUP) {
            KillTimer(hwnd, TIMER_STARTUP);
            if (!runnerReady) {
                bool needSetup = false;
                if (!isPythonEnvReady()) {
                    setStatus(L"Environment not found. Starting setup...", C.orange);
                    needSetup = true;
                } else if (!isLicenseValid()) {
                    setStatus(L"License not activated. Starting setup...", C.orange);
                    needSetup = true;
                } else if (!isModelReady()) {
                    setStatus(L"Model incomplete. Resuming setup...", C.orange);
                    needSetup = true;
                }

                if (needSetup) {
                    EnableWindow(hGenerateBtn, FALSE);
                    EnableWindow(hI2IGenerateBtn, FALSE);
                    std::thread([]() {
                        bool ok = runFirstTimeSetup();
                        if (ok) PostMessage(hMainWnd, WM_APP_ENV_READY, 0, 0);
                        else PostMessage(hMainWnd, WM_APP_SETUP_FAIL, 0, 0);
                    }).detach();
                } else {
                    setStatus(L"Starting runner...", C.orange);
                    startRunner();
                    waitForRunner();
                }
            }
        } else if (wParam == TIMER_POLL_TASK) {
            pollActiveTask();
        } else if (wParam == TIMER_REFRESH_TASKS) {
            if (runnerReady) refreshTaskList();
        } else if (wParam == TIMER_REFRESH_LOGS) {
            if (runnerReady) refreshLogs();
        }
        return 0;

    case WM_APP_STATUS: {
        struct StatusData { std::wstring msg; COLORREF color; };
        auto* d = (StatusData*)wParam;
        SetWindowTextW(hStatusLabel, d->msg.c_str());
        SetProp(hStatusLabel, L"StatusColor", (HANDLE)(ULONG_PTR)d->color);
        InvalidateRect(hStatusLabel, nullptr, TRUE);
        delete d;
        return 0;
    }

    case WM_APP_ENV_READY:
        setStatus(L"Environment ready. Starting runner...", C.green);
        startRunner();
        waitForRunner();
        return 0;

    case WM_APP_SETUP_FAIL: {
        int choice = MessageBoxW(hwnd,
            L"First-time setup was not completed.\n\n"
            L"The environment is required to run Nano ImageEdit.\n"
            L"Would you like to retry the setup?",
            L"Setup Required", MB_RETRYCANCEL | MB_ICONWARNING);
        if (choice == IDRETRY) {
            setStatus(L"Retrying setup...", C.orange);
            std::thread([]() {
                bool ok = runFirstTimeSetup();
                if (ok) PostMessage(hMainWnd, WM_APP_ENV_READY, 0, 0);
                else PostMessage(hMainWnd, WM_APP_SETUP_FAIL, 0, 0);
            }).detach();
        } else {
            setStatus(L"Setup required. Restart the app to try again.", C.red);
        }
        return 0;
    }

    case WM_APP_RUNNER_READY:
        runnerReady = true;
        EnableWindow(hGenerateBtn, TRUE);
        EnableWindow(hI2IGenerateBtn, TRUE);
        setStatus(L"Ready. Enter a prompt and click Generate.", C.green);

        std::thread([]() {
            auto r = runnerGet("/healthz");
            if (r.status == 200) {
                std::string gpu = jsonGet(r.body, "gpu");
                std::string device = jsonGet(r.body, "device");
                std::wstring label;
                if (!gpu.empty() && gpu != "CPU" && gpu != "unknown")
                    label = L"GPU: " + toWide(gpu);
                else if (device == "cpu")
                    label = L"CPU mode";
                PostMessage(hMainWnd, WM_APP_TASK_UPDATE, 4, (LPARAM)new std::wstring(label));
            }
        }).detach();

        SetTimer(hwnd, TIMER_POLL_TASK, 800, nullptr);
        SetTimer(hwnd, TIMER_REFRESH_TASKS, 3000, nullptr);
        SetTimer(hwnd, TIMER_REFRESH_LOGS, 3000, nullptr);
        return 0;

    case WM_APP_TASK_UPDATE:
        if (wParam == 1) {
            EnableWindow(hGenerateBtn, TRUE);
            EnableWindow(hI2IGenerateBtn, TRUE);
            ShowWindow(hProgressBar, SW_HIDE);
            ShowWindow(hProgressLabel, SW_HIDE);
        } else if (wParam == 2) {
            auto* items = (std::vector<std::wstring>*)lParam;
            SendMessage(hTaskListBox, LB_RESETCONTENT, 0, 0);
            if (items) {
                for (auto& item : *items)
                    SendMessageW(hTaskListBox, LB_ADDSTRING, 0, (LPARAM)item.c_str());
                delete items;
            }
        } else if (wParam == 3) {
            auto* pText = (std::wstring*)lParam;
            if (pText) {
                SetWindowTextW(hLogEdit, pText->c_str());
                SendMessage(hLogEdit, EM_SETSEL, (WPARAM)pText->size(), (LPARAM)pText->size());
                SendMessage(hLogEdit, EM_SCROLLCARET, 0, 0);
                delete pText;
            }
        } else if (wParam == 4) {
            auto* label = (std::wstring*)lParam;
            if (label) { SetWindowTextW(hGpuLabel, label->c_str()); delete label; }
        } else if (wParam == 5) {
            updateImgCountLabel();
        }
        return 0;

    case WM_APP_RESULT:
        loadResultImage();
        return 0;

    case WM_COMMAND:
        switch (LOWORD(wParam)) {
        case IDC_GENERATE:
            if (runnerReady && !generating) doGenerate();
            break;
        case IDC_I2I_GENERATE:
            if (runnerReady && !generating) doGenerateImg2Img();
            break;
        case IDC_I2I_ADD_IMG:
            addReferenceImages();
            break;
        case IDC_I2I_CLEAR_IMG:
            clearReferenceImages();
            break;
        case IDC_TAB_TEXT2IMG:
            currentTab = TAB_TEXT2IMG;
            showTabControls(TAB_TEXT2IMG);
            break;
        case IDC_TAB_IMG2IMG:
            currentTab = TAB_IMG2IMG;
            showTabControls(TAB_IMG2IMG);
            break;
        case IDC_OPEN_FOLDER:
            ShellExecuteW(hwnd, L"open", outputDir.c_str(), nullptr, nullptr, SW_SHOW);
            break;
        case IDC_TOGGLE_LOG:
            logsVisible = !logsVisible;
            ShowWindow(hLogEdit, logsVisible ? SW_SHOW : SW_HIDE);
            SetWindowTextW(hToggleLogBtn, logsVisible ? L"Hide Logs" : L"Show Logs");
            break;
        case IDC_DEACTIVATE:
            if (MessageBoxW(hwnd, L"Deactivate this machine?\nYou can re-activate later.",
                            L"Deactivate", MB_YESNO | MB_ICONQUESTION) == IDYES) {
                MessageBoxW(hwnd, L"Machine deactivated. The app will now close.",
                            L"Deactivated", MB_OK | MB_ICONINFORMATION);
                DestroyWindow(hwnd);
            }
            break;
        }
        return 0;

    case WM_DRAWITEM: {
        auto* dis = (DRAWITEMSTRUCT*)lParam;
        if (dis->CtlID == IDC_GENERATE || dis->CtlID == IDC_I2I_GENERATE) {
            COLORREF bg = IsWindowEnabled(dis->hwndItem) ? C.accent : C.muted;
            drawButton(dis, bg, C.bg);
        } else if (dis->CtlID == IDC_OPEN_FOLDER) {
            drawButton(dis, C.green, C.bg);
        } else if (dis->CtlID == IDC_TOGGLE_LOG || dis->CtlID == IDC_DEACTIVATE) {
            drawButton(dis, C.border, C.muted);
        } else if (dis->CtlID == IDC_TAB_TEXT2IMG) {
            drawTabButton(dis, currentTab == TAB_TEXT2IMG);
        } else if (dis->CtlID == IDC_TAB_IMG2IMG) {
            drawTabButton(dis, currentTab == TAB_IMG2IMG);
        } else if (dis->CtlID == IDC_RESULT_IMG) {
            paintResultImage(dis);
        } else if (dis->CtlID == IDC_I2I_IMG_PANEL) {
            paintImgPanel(dis);
        } else if (dis->CtlID == IDC_I2I_ADD_IMG) {
            drawButton(dis, C.accent, C.bg);
        } else if (dis->CtlID == IDC_I2I_CLEAR_IMG) {
            drawButton(dis, C.border, C.fg);
        }
        return TRUE;
    }

    case WM_CTLCOLORSTATIC: {
        HDC hdc = (HDC)wParam;
        HWND hCtl = (HWND)lParam;
        SetBkMode(hdc, TRANSPARENT);

        if (hCtl == hStatusLabel) {
            COLORREF col = (COLORREF)(ULONG_PTR)GetProp(hCtl, L"StatusColor");
            SetTextColor(hdc, col ? col : C.green);
        } else if (hCtl == hGpuLabel) {
            SetTextColor(hdc, C.accent);
        } else {
            int id = GetDlgCtrlID(hCtl);
            wchar_t cls[64];
            GetClassNameW(hCtl, cls, 64);
            if (wcscmp(cls, L"Static") == 0) {
                wchar_t text[256];
                GetWindowTextW(hCtl, text, 256);
                std::wstring t(text);
                if (t == L"GENERATE IMAGE" || t == L"IMAGE EDITING" || t == L"RESULT" || t == L"TASK QUEUE") {
                    SetTextColor(hdc, C.accent);
                } else if (t.find(L"AI-powered") != std::wstring::npos) {
                    SetTextColor(hdc, C.muted);
                } else if (t == L"Nano ImageEdit") {
                    SetTextColor(hdc, C.fgBright);
                    SelectObject(hdc, hFontTitle);
                } else {
                    SetTextColor(hdc, C.fg);
                }
            }
        }
        return (LRESULT)hBrBg;
    }

    case WM_CTLCOLOREDIT: {
        HDC hdc = (HDC)wParam;
        SetBkColor(hdc, C.bg3);
        SetTextColor(hdc, C.fgBright);
        return (LRESULT)hBrBg3;
    }

    case WM_CTLCOLORLISTBOX: {
        HDC hdc = (HDC)wParam;
        SetBkColor(hdc, C.bg2);
        SetTextColor(hdc, C.fg);
        return (LRESULT)hBrBg2;
    }

    case WM_ERASEBKGND: {
        HDC hdc = (HDC)wParam;
        RECT rc;
        GetClientRect(hwnd, &rc);
        FillRect(hdc, &rc, hBrBg);
        return 1;
    }

    case WM_CLOSE:
        appClosing = true;
        stopRunner();
        DestroyWindow(hwnd);
        return 0;

    case WM_DESTROY:
        KillTimer(hwnd, TIMER_POLL_TASK);
        KillTimer(hwnd, TIMER_REFRESH_TASKS);
        KillTimer(hwnd, TIMER_REFRESH_LOGS);
        if (pResultBitmap) { delete pResultBitmap; pResultBitmap = nullptr; }
        for (auto* img : i2iThumbnails) { if (img) delete img; }
        i2iThumbnails.clear();
        PostQuitMessage(0);
        return 0;
    }
    return DefWindowProcW(hwnd, msg, wParam, lParam);
}

// ── Entry point ────────────────────────────────────────────
int WINAPI wWinMain(HINSTANCE hInstance, HINSTANCE, LPWSTR, int nCmdShow) {
    CoInitializeEx(nullptr, COINIT_APARTMENTTHREADED);

    INITCOMMONCONTROLSEX icc = { sizeof(icc), ICC_PROGRESS_CLASS | ICC_STANDARD_CLASSES };
    InitCommonControlsEx(&icc);

    Gdiplus::GdiplusStartupInput gdipInput;
    Gdiplus::GdiplusStartup(&gdiplusToken, &gdipInput, nullptr);

    wchar_t exePath[MAX_PATH];
    GetModuleFileNameW(nullptr, exePath, MAX_PATH);
    appDir = fs::path(exePath).parent_path().wstring();
    outputDir = appDir + L"\\outputs";
    fs::create_directories(outputDir);

    createFonts();
    createBrushes();

    WNDCLASSEXW wc = {};
    wc.cbSize        = sizeof(wc);
    wc.style         = CS_HREDRAW | CS_VREDRAW;
    wc.lpfnWndProc   = WndProc;
    wc.hInstance     = hInstance;
    wc.hCursor       = LoadCursor(nullptr, IDC_ARROW);
    wc.hbrBackground = hBrBg;
    wc.lpszClassName = APP_CLASS;

    std::wstring iconPath = appDir + L"\\flux_engine.ico";
    if (fs::exists(iconPath)) {
        wc.hIcon = (HICON)LoadImageW(nullptr, iconPath.c_str(), IMAGE_ICON, 0, 0,
                                      LR_LOADFROMFILE | LR_DEFAULTSIZE);
        wc.hIconSm = (HICON)LoadImageW(nullptr, iconPath.c_str(), IMAGE_ICON, 16, 16,
                                        LR_LOADFROMFILE);
    }

    RegisterClassExW(&wc);

    hMainWnd = CreateWindowExW(0, APP_CLASS, APP_TITLE,
                                WS_OVERLAPPEDWINDOW | WS_CLIPCHILDREN,
                                CW_USEDEFAULT, CW_USEDEFAULT, WINDOW_W, WINDOW_H,
                                nullptr, nullptr, hInstance, nullptr);

    ShowWindow(hMainWnd, nCmdShow);
    UpdateWindow(hMainWnd);

    MSG msg;
    while (GetMessageW(&msg, nullptr, 0, 0)) {
        TranslateMessage(&msg);
        DispatchMessageW(&msg);
    }

    Gdiplus::GdiplusShutdown(gdiplusToken);
    CoUninitialize();

    DeleteObject(hFontTitle);
    DeleteObject(hFontNormal);
    DeleteObject(hFontSmall);
    DeleteObject(hFontMono);
    DeleteObject(hFontButton);
    DeleteObject(hFontBig);
    DeleteObject(hFontTab);
    DeleteObject(hBrBg);
    DeleteObject(hBrBg2);
    DeleteObject(hBrBg3);
    DeleteObject(hBrAccent);
    DeleteObject(hBrTabBg);

    return (int)msg.wParam;
}
