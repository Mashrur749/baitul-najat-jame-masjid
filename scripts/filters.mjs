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

const BN_MONTHS = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];

/** "2026-10-01" -> "১ অক্টোবর ২০২৬". */
export function bnDate(iso) {
  const [y, m, d] = String(iso ?? "").split("-").map(Number);
  if (!y || !m || !d) return iso;
  return bn(`${d} ${BN_MONTHS[m - 1]} ${y}`);
}

/** Start and end as one line: "২২–২৯ আগস্ট ২০২৬", "৩০ সেপ্টেম্বর – ৫ অক্টোবর ২০২৬". */
export function bnDateRange(start, end) {
  if (!end || end === start) return bnDate(start);
  const [y1, m1, d1] = start.split("-").map(Number);
  const [y2, m2, d2] = end.split("-").map(Number);
  if (y1 === y2 && m1 === m2) return bn(`${d1}–${d2} ${BN_MONTHS[m1 - 1]} ${y1}`);
  if (y1 === y2) return bn(`${d1} ${BN_MONTHS[m1 - 1]} – ${d2} ${BN_MONTHS[m2 - 1]} ${y1}`);
  return `${bnDate(start)} – ${bnDate(end)}`;
}

export function registerAll(addFilter) {
  addFilter("bn", bn);
  addFilter("latn", latn);
  addFilter("tel", tel);
  addFilter("bnDate", bnDate);
  addFilter("bnDateRange", bnDateRange);
}
