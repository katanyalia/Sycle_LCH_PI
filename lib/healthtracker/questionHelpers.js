/**
 * Mengambil label dari opsi pertanyaan.
 */
export function getLabel(option) {
  if (option === null || option === undefined) return "";

  if (typeof option === "object") {
    return option.label ?? String(option.value ?? "");
  }

  return String(option);
}

/**
 * Mengambil value dari opsi pertanyaan.
 */
export function getValue(option) {
  if (option === null || option === undefined) return "";

  if (typeof option === "object") {
    return option.value ?? "";
  }

  return option;
}