/**
 * SHA-256 of every file served from /download, with the installer inside each zip.
 *
 * Computed on 2026-10-09 from the objects actually served (downloaded from the
 * storage bucket and hashed), and checked equal to the archived copies in
 * downloads-private/. Update this file whenever a download is replaced: a stale
 * hash here would tell a careful user that a good file is bad.
 *
 * `sha256` is the file the browser downloads; `installerSha256` is the .exe or
 * .dmg inside it, which is what Windows, SmartScreen and antivirus scan.
 *
 * None of the Windows installers is Authenticode-signed (checked 2026-10-09: the
 * certificate table of every PE file is empty). The pages say so.
 */

export const DOWNLOAD_HASHES_CHECKED = "2026-10-09";

export interface DownloadHash {
  app: string;
  version: string;
  platform: "Windows" | "macOS";
  file: string;
  size: number;
  sha256: string;
  installer: string | null;
  installerSha256: string | null;
}

export const DOWNLOAD_HASHES: readonly DownloadHash[] = [
  {
    app: "Nano FacialEdit",
    version: "1.0.2",
    platform: "Windows",
    file: "NanoFacialEdit-1.0.2-release.zip",
    size: 2286067,
    sha256: "59d3903b5211e89d92336bf5a46e39486b10dd854eec1b993ab7e83504d13765",
    installer: "NanoFacialEdit_Release_1.0.2.exe",
    installerSha256: "494f8134f94386dc8b52fdec4f327172c4221a29eeb53610b857ac367b26f8d6",
  },
  {
    app: "Nano FaceSwap",
    version: "1.0.4",
    platform: "Windows",
    file: "NanoFaceSwap-1.0.4-release.zip",
    size: 8763604,
    sha256: "ca4d55a2426c8965731698ac578df3f39db7217320acd63a3d55ed40ea809f92",
    installer: "NanoFaceSwap_Release_1.0.4.exe",
    installerSha256: "8163050073669f53141b83e8be9ba09f858b2f51b6db6c74e80b4f75f37fa84a",
  },
  {
    app: "Nano ImageEdit",
    version: "1.0.5",
    platform: "Windows",
    file: "NanoImageEdit-1.0.5-release.zip",
    size: 2578148,
    sha256: "98658bfb3df70b210211c432d6f23d95275837690ae80b31c0c36976d7506d08",
    installer: "NanoImageEdit_Release_1.0.5.exe",
    installerSha256: "351dde909469f0354e1c5b2f4333d453ea67cd5a1ff044d741a3b3914cd0cc2f",
  },
  {
    app: "Nano ImageTryon",
    version: "1.0.0",
    platform: "Windows",
    file: "NanoImageTryon-1.0.0-release.zip",
    size: 2562914,
    sha256: "c5367b5114d6e12ab907fe0cbd2c5979c096de613f6e3684435b839cf5931243",
    installer: "NanoImageTryon_Release_1.0.0.exe",
    installerSha256: "4bd50cb0e2aad9e7dd9ed1c38a91a887d09a28c3673df2424a9ebaabcf89a5e6",
  },
  {
    app: "Nano VideoEnhance",
    version: "1.0.5",
    platform: "Windows",
    file: "NanoVideoEnhance-1.0.5-release.zip",
    size: 9491724,
    sha256: "5daab57c55e832f7b5b59e48c3605fa42f15a9ee8c1334ca96bcb0293ee005ab",
    installer: "NanoVideoEnhance_1.05.exe",
    installerSha256: "71b91ead97067d86239bf29b1b32f3df89fcb844fdd9cc0ff94a7d8a7f189e6e",
  },
  {
    app: "Nano VideoGen",
    version: "1.1.2",
    platform: "Windows",
    file: "NanoVideoGen-1.1.2-release.zip",
    size: 2272165,
    sha256: "8fe1f460b0f688563b83f52eb01e00e884638e2d350477a3902e637faa66a444",
    installer: "NanoVideoGen_Setup_1.1.2.exe",
    installerSha256: "de8357440b1097036a13bde69afeb02f25ff6d60e14355d3699b2f12dbb818fc",
  },
  {
    app: "Nano ImageEnh Pro",
    version: "3.0.0",
    platform: "Windows",
    file: "NanoImageEnh-3.0.0-windows.zip",
    size: 93501252,
    sha256: "366c7d4dacd94fdd409271b6568afc47e2c9d6087180bfb783b1ae358c93cd3f",
    installer: "NanoImageEnh-3.0.0.exe",
    installerSha256: "4abe6c7bacefe7c0c1d336cf284ceb032489c4430007f70fa932dece3fefa3ae",
  },
  {
    app: "Nano ImageEnh Pro",
    version: "3.0.0",
    platform: "macOS",
    file: "NanoImageEnh-3.0.0-macos.zip",
    size: 119346105,
    sha256: "afa93902c022af3f75ba19cd8b92852a9480f59f2a91c18a079685ebe04f5538",
    installer: "NanoImageEnh-3.0.0.dmg",
    installerSha256: "98b4096658ac8e355569a39beafc81a7812c80b6c25911135d6aca9f86204958",
  },
  {
    app: "Nano FaceStudio Pro",
    version: "1.0.0",
    platform: "Windows",
    file: "NanoFaceStudioPro-1.0.0-windows.exe",
    size: 105247832,
    sha256: "fa9bcdba7e826080c5a9c4b23ad1052892d3f529d419de0ed8007eea7ab30012",
    installer: null,
    installerSha256: null,
  },
];

/** A VirusTotal lookup by hash. It searches existing reports and uploads nothing. */
export const virusTotalUrl = (sha256: string) => `https://www.virustotal.com/gui/file/${sha256}`;

export const formatSize = (bytes: number) =>
  bytes >= 1_000_000 ? `${(bytes / 1_000_000).toFixed(1)} MB` : `${Math.round(bytes / 1000)} KB`;
