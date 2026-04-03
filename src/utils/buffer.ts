const BINARY_SAMPLE_BYTES = 8192;
const NON_TEXT_RATIO_THRESHOLD = 0.30;

// Control characters that are never valid in plain text files.
// Null byte (0x00) is an immediate binary indicator.
// Ranges 0x01–0x08 and 0x0E–0x1F are non-printable C0 control chars
// (excluding tab 0x09, LF 0x0A, FF 0x0C, CR 0x0D which are valid in text).
// DEL (0x7F) is also non-printable.
const NULL_BYTE        = 0x00;
const C0_LOW_START     = 0x01; // first non-printable C0 control char
const C0_LOW_END       = 0x08; // last in the low non-printable range
const C0_HIGH_START    = 0x0E; // first in the high non-printable range (after CR)
const C0_HIGH_END      = 0x1F; // last C0 control char
const DEL              = 0x7F; // delete character

export function isBinaryBuffer(buf: Buffer): boolean {
  const len = Math.min(buf.length, BINARY_SAMPLE_BYTES);
  let nonTextCount = 0;
  for (let i = 0; i < len; i++) {
    const byte = buf[i];
    if (byte === NULL_BYTE) {
      return true;
    }
    if (
      (byte >= C0_LOW_START && byte <= C0_LOW_END) ||
      (byte >= C0_HIGH_START && byte <= C0_HIGH_END) ||
      byte === DEL
    ) {
      nonTextCount++;
    }
  }
  return len > 0 && nonTextCount / len > NON_TEXT_RATIO_THRESHOLD;
}
