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
  // Nothing is paused. Nano FacialEdit was paused for a few hours on 2026-10-09
  // by mistake of judgement (it was not asked for) and restored at the owner's
  // instruction. The mechanism stays so a download can be switched off with one
  // line: add `"<file name>": "<reason shown to users>"`.
};
