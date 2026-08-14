/**
 * SMS segment math. GSM-7 messages fit 160 chars in one segment (153 per
 * segment when concatenated); anything outside the GSM-7 charset forces
 * UCS-2 at 70 / 67. Extended GSM-7 chars (€, [, ], etc.) count double.
 */

// Basic GSM-7 charset.
const GSM7 =
  "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?" +
  "¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà";
const GSM7_EXTENDED = "^{}\\[~]|€";

const GSM7_SET = new Set(GSM7);
const GSM7_EXT_SET = new Set(GSM7_EXTENDED);

export interface SegmentInfo {
  /** Number of billable segments for the current text. */
  segments: number;
  /** "gsm7" or "ucs2". */
  encoding: "gsm7" | "ucs2";
  /** Septets (gsm7) or characters (ucs2) used. */
  length: number;
  /** How many more characters fit before another segment is added. */
  remaining: number;
  /** Per-segment capacity at the current segment count. */
  perSegment: number;
}

export function countSegments(text: string): SegmentInfo {
  if (text.length === 0) {
    return { segments: 0, encoding: "gsm7", length: 0, remaining: 160, perSegment: 160 };
  }

  let gsm = true;
  let septets = 0;
  for (const ch of text) {
    if (GSM7_SET.has(ch)) septets += 1;
    else if (GSM7_EXT_SET.has(ch)) septets += 2;
    else {
      gsm = false;
      break;
    }
  }

  if (gsm) {
    const single = 160;
    const multi = 153;
    const segments = septets <= single ? 1 : Math.ceil(septets / multi);
    const perSegment = segments === 1 ? single : multi;
    const capacity = segments === 1 ? single : segments * multi;
    return { segments, encoding: "gsm7", length: septets, remaining: capacity - septets, perSegment };
  }

  // UCS-2: count UTF-16 code units (that's what the wire uses).
  const units = text.length;
  const single = 70;
  const multi = 67;
  const segments = units <= single ? 1 : Math.ceil(units / multi);
  const perSegment = segments === 1 ? single : multi;
  const capacity = segments === 1 ? single : segments * multi;
  return { segments, encoding: "ucs2", length: units, remaining: capacity - units, perSegment };
}
