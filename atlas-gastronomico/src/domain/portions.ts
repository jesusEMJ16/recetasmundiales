// Only scale an unambiguous quantity at the start of an ingredient.
// Descriptive quantities and ranges remain unchanged rather than being guessed.
export function scaleIngredient(text: string, ratio: number, locale: string): string {
  if (ratio === 1 || !Number.isFinite(ratio) || ratio <= 0) return text;
  const match = /^(\d+(?:[.,]\d+)?)(?:\s+(\d+)\/(\d+)|\/(\d+))?(.*)$/.exec(text);
  if (!match || /^\s*(?:[-–]|a\s+\d|to\s+\d)/i.test(match[5])) return text;
  let amount = Number(match[1].replace(",", "."));
  if (match[3]) {
    if (Number(match[3]) === 0) return text;
    amount += Number(match[2]) / Number(match[3]);
  } else if (match[4]) {
    if (Number(match[4]) === 0) return text;
    amount /= Number(match[4]);
  }
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(amount * ratio) + match[5];
}
