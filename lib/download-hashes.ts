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
 * Authenticode status (checked 2026-10-09 by reading each PE file's certificate table, and
 * again on 2026-10-11, 2026-10-14 and 2026-10-16 for the files added on those days): only the
 * files in SIGNED_DOWNLOADS are signed. Every other Windows installer is
 * unsigned. The pages say so, and build the list of names from SIGNED_DOWNLOADS.
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
    version: "1.0.3",
    platform: "Windows",
    file: "NanoFacialEdit-1.0.3-release.exe",
    size: 2980072,
    sha256: "bd0c1f537a4276feed27a56094b3cbcaaef174c68b360774c53bf6d21059e727",
    installer: null,
    installerSha256: null,
  },
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
    version: "1.0.6",
    platform: "Windows",
    file: "NanoFaceSwap-1.0.6-release.exe",
    size: 7691000,
    sha256: "f7e8d6fa5bc54f18954f1e0bd352241fe8d5142bbfc4a92fac701eec149d1785",
    installer: null,
    installerSha256: null,
  },
  {
    app: "Nano FaceSwap",
    version: "1.0.5",
    platform: "Windows",
    file: "NanoFaceSwap_Release-1.0.5.zip",
    size: 7089076,
    sha256: "e5370d589bb681caf720444e28f571918127dce3ce5eb9ea139931992cd62785",
    installer: "NanoFaceSwap_Release-1.0.5.exe",
    installerSha256: "bf32cf9384c2d008d6ffa9d4ea7305207c79d787901112bd210c3573873e1eee",
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
    version: "1.0.6",
    platform: "Windows",
    file: "NanoImageEdit-1.0.6-release.exe",
    size: 3268528,
    sha256: "83ec360f29f9c02e3be5dc317b13273de456010f9b97cd0facf0f4cfac8b616a",
    installer: null,
    installerSha256: null,
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
    version: "1.0.1",
    platform: "Windows",
    file: "NanoImageTryon-1.0.1-release.exe",
    size: 3351496,
    sha256: "ceab6ad173316fd5af848d33a12aa4e888a1ce2eb65c71e681cf6e2f3938a130",
    installer: null,
    installerSha256: null,
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
    version: "1.0.2",
    platform: "Windows",
    file: "NanoFaceStudioPro-1.0.2-windows.exe",
    size: 105372248,
    sha256: "13f75d906305ef888b6368c585259af83c581cfbed62e6a27449fa2440aa03c4",
    installer: null,
    installerSha256: null,
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

/**
 * Downloads whose Authenticode signature was verified (Get-AuthenticodeSignature: Valid,
 * Microsoft RFC 3161 timestamp present) on the date given. Microsoft Trusted Signing issues
 * short-lived certificates (about three days); the timestamp is what keeps a signature valid
 * after its certificate expires.
 */
export const SIGNED_DOWNLOADS: readonly {
  app: string;
  version: string;
  file: string;
  subject: string;
  issuer: string;
  thumbprint: string;
  timestampAuthority: string;
  verified: string;
}[] = [
  {
    app: "Nano FaceStudio Pro",
    version: "1.0.2",
    file: "NanoFaceStudioPro-1.0.2-windows.exe",
    subject: "NanoPocket AI LLC (Austin, Texas, US)",
    issuer: "Microsoft ID Verified CS AOC CA 04",
    thumbprint: "9967287E9497219A1F1286B16799F2F51D74537E",
    timestampAuthority: "Microsoft Public RSA Time Stamping Authority",
    verified: "2026-10-14",
  },
  {
    app: "Nano FacialEdit",
    version: "1.0.3",
    file: "NanoFacialEdit-1.0.3-release.exe",
    subject: "NanoPocket AI LLC (Austin, Texas, US)",
    issuer: "Microsoft ID Verified CS AOC CA 04",
    thumbprint: "9967287E9497219A1F1286B16799F2F51D74537E",
    timestampAuthority: "Microsoft Public RSA Time Stamping Authority",
    verified: "2026-10-14",
  },
  {
    app: "Nano FaceSwap",
    version: "1.0.6",
    file: "NanoFaceSwap-1.0.6-release.exe",
    subject: "NanoPocket AI LLC (Austin, Texas, US)",
    issuer: "Microsoft ID Verified CS AOC CA 04",
    thumbprint: "9967287E9497219A1F1286B16799F2F51D74537E",
    timestampAuthority: "Microsoft Public RSA Time Stamping Authority",
    verified: "2026-10-11",
  },
  {
    app: "Nano ImageTryon",
    version: "1.0.1",
    file: "NanoImageTryon-1.0.1-release.exe",
    subject: "NanoPocket AI LLC (Austin, Texas, US)",
    issuer: "Microsoft ID Verified CS EOC CA 03",
    thumbprint: "DD19C5CF7BFB36AE9EE6154A77F1D7189270C2AC",
    timestampAuthority: "Microsoft Public RSA Time Stamping Authority",
    verified: "2026-10-16",
  },
  {
    app: "Nano ImageEdit",
    version: "1.0.6",
    file: "NanoImageEdit-1.0.6-release.exe",
    subject: "NanoPocket AI LLC (Austin, Texas, US)",
    issuer: "Microsoft ID Verified CS EOC CA 03",
    thumbprint: "DD19C5CF7BFB36AE9EE6154A77F1D7189270C2AC",
    timestampAuthority: "Microsoft Public RSA Time Stamping Authority",
    verified: "2026-10-16",
  },
];

function joinNames(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/** "Nano FaceStudio Pro 1.0.2, Nano FacialEdit 1.0.3 and Nano FaceSwap 1.0.6": every signed download, for the pages to quote. */
export const SIGNED_APPS_PHRASE = joinNames(SIGNED_DOWNLOADS.map((d) => `${d.app} ${d.version}`));

/** "Three": how many installers are signed, in words. */
export const SIGNED_COUNT_WORD =
  ["No", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"][SIGNED_DOWNLOADS.length] ??
  String(SIGNED_DOWNLOADS.length);

/** A VirusTotal lookup by hash. It searches existing reports and uploads nothing. */
export const virusTotalUrl = (sha256: string) => `https://www.virustotal.com/gui/file/${sha256}`;

export const formatSize = (bytes: number) =>
  bytes >= 1_000_000 ? `${(bytes / 1_000_000).toFixed(1)} MB` : `${Math.round(bytes / 1000)} KB`;
