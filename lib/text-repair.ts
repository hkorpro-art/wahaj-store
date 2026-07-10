const MEEM = "\u0645";
const BROKEN_MEEM_PATTERN = /\uFFFD+\u0085/g;
const CONTAINS_ARABIC_PATTERN = /[\u0600-\u06FF]/;
const ASCII_QUESTION_MARK_PATTERN = /\?/g;
const CONTROL_CHAR_PATTERN = /\u0085/g;

function looksLikeUrl(value: string) {
  return /^(https?:)?\/\//.test(value) || value.startsWith("data:");
}

export function hasBrokenArabicText(value: string) {
  return BROKEN_MEEM_PATTERN.test(value) || CONTROL_CHAR_PATTERN.test(value) || (CONTAINS_ARABIC_PATTERN.test(value) && value.includes("?"));
}

export function repairBrokenArabicText(value: string) {
  if (!value || looksLikeUrl(value)) return value;

  let repaired = value.normalize("NFC");

  if (BROKEN_MEEM_PATTERN.test(repaired)) {
    repaired = repaired.replace(BROKEN_MEEM_PATTERN, MEEM);
  }

  if (CONTROL_CHAR_PATTERN.test(repaired)) {
    repaired = repaired.replace(CONTROL_CHAR_PATTERN, "");
  }

  if (CONTAINS_ARABIC_PATTERN.test(repaired) && repaired.includes("?")) {
    repaired = repaired.replace(ASCII_QUESTION_MARK_PATTERN, MEEM);
  }

  return repaired;
}

export function repairDeepText<T>(value: T): T {
  if (typeof value === "string") {
    return repairBrokenArabicText(value) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => repairDeepText(item)) as T;
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, repairDeepText(item)])
    ) as T;
  }

  return value;
}
