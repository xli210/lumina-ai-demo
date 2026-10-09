/**
 * Downloads that are switched off while they are re-checked.
 *
 * A file goes here when security software flags it and we cannot yet show the
 * detection is a false positive. Handing it out meanwhile would risk giving
 * someone malware. The /api/downloads route refuses these files and the
 * download page shows the reason instead of a button. Remove the entry to
 * switch the download back on.
 *
 * Imported by both server and client code, so keep it to plain data.
 */
export const HELD_DOWNLOADS: Readonly<Record<string, string>> = {
  // 2026-10-09: 37 of 69 VirusTotal vendors flagged the installer, and Windows
  // Defender deletes it on download. The installer's loader is the unmodified
  // Inno Setup stub, so the cause is in the files it carries. Under review.
  "NanoFacialEdit-1.0.2-release.zip":
    "Paused while we re-check this build: security software flagged it. Please do not use an earlier copy either.",
};
