/**
 * Template filters shared by the 11ty site and the asset renderer.
 * Defined once so a poster and a web page can never format a date differently.
 */

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";

/**
 * Latin digits -> Bengali numerals.
 *
 * Convention (matches the reference campaign artwork): Bengali numerals for all
 * dates, times, prices and counts; Latin digits for phone numbers, because that
 * is how they are dialled and read locally. Pass a string containing a phone
 * number and it is left alone.
 */
export function bn(value) {
  if (value == null) return value;
  const s = String(value);
  // Leave phone numbers alone: 11-digit BD mobile, with or without separators.
  if (/(?:\+?88)?0\d{4}[- ]?\d{6}/.test(s)) return s;
  return s.replace(/[0-9]/g, (d) => BN_DIGITS[+d]);
}

/** Bengali numerals -> Latin, for sorting or machine-readable output. */
export function latn(value) {
  if (value == null) return value;
  return String(value).replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)));
}

/**
 * Local Bangladeshi number ("01765-204547") -> tel: href ("tel:+8801765204547"),
 * so a phone taps straight into the dialler.
 */
export function tel(value) {
  const digits = String(value ?? "").replace(/\D/g, "");
  return "tel:+880" + digits.replace(/^(880)?0?/, "");
}

export function registerAll(addFilter) {
  addFilter("bn", bn);
  addFilter("latn", latn);
  addFilter("tel", tel);
}
