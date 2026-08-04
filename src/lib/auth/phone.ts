/**
 * Ethiopian mobile numbers are the real identity on this site.
 *
 * Accepts 09xxxxxxxx, 9xxxxxxxx, +2519xxxxxxxx and 2519xxxxxxxx, and always
 * stores the canonical +251 form. Landlines (011…) are allowed for agencies.
 */
export function normalizeEthiopianPhone(raw: string): string | null {
  const digits = raw.replace(/[\s\-()]/g, "");
  let national: string | null = null;

  if (/^\+251\d{9}$/.test(digits)) return digits;
  if (/^251\d{9}$/.test(digits)) return `+${digits}`;
  if (/^0\d{9}$/.test(digits)) national = digits.slice(1);
  else if (/^[97]\d{8}$/.test(digits)) national = digits;
  else return null;

  return `+251${national}`;
}

export function isValidEthiopianPhone(raw: string): boolean {
  return normalizeEthiopianPhone(raw) !== null;
}
