/**
 * Minimal RFC 4180 CSV parser for the committee's Google Sheets: quoted cells, doubled
 * quotes, commas and newlines inside quotes. Returns rows of trimmed strings.
 */
export function parseCsv(text) {
  const rows = [];
  let row = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); rows.push(row); row = []; cell = "";
    } else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.map((r) => r.map((c) => c.trim()));
}

/**
 * Accepts the address of a Google Sheet as it appears in the browser (".../edit#gid=123")
 * and returns its live CSV export for that tab. The sheet must be shared "Anyone with the
 * link: Viewer". Unlike "Publish to web", which can lag ~5 minutes behind edits, the export
 * is current, so "update now" in the sheet shows what was just typed. Published-CSV links
 * and any other URL pass through unchanged.
 */
export function sheetCsvUrl(url) {
  const m = String(url || "").match(/docs\.google\.com\/spreadsheets\/d\/([\w-]{20,})/);
  if (!m || /output=csv|format=csv/.test(url)) return url;
  const gid = (url.match(/[#&?]gid=(\d+)/) || [])[1] || "0";
  return `https://docs.google.com/spreadsheets/d/${m[1]}/export?format=csv&gid=${gid}`;
}
