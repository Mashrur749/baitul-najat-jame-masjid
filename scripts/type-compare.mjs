import { writeFileSync } from "node:fs";
const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36";
const fams = ["Hind Siliguri", "Noto Serif Bengali", "Noto Sans Bengali", "Baloo Da 2", "Atma", "Galada", "Mina", "Tiro Bangla"];
let css = "";
const ok = [];
for (const f of fams) {
  try {
    const r = await fetch(`https://fonts.googleapis.com/css2?family=${encodeURIComponent(f)}&display=block`, { headers: { "User-Agent": UA } });
    if (!r.ok) { console.log(`  ${f}: HTTP ${r.status}`); continue; }
    let t = await r.text();
    const urls = [...new Set([...t.matchAll(/url\((https:\/\/[^)]+\.woff2)\)/g)].map((m) => m[1]))];
    for (const u of urls) {
      const b = Buffer.from(await (await fetch(u, { headers: { "User-Agent": UA } })).arrayBuffer());
      t = t.replaceAll(`url(${u})`, `url(data:font/woff2;base64,${b.toString("base64")})`);
    }
    css += t + "\n"; ok.push(f);
    console.log(`  ${f}: ${urls.length} file(s) inlined`);
  } catch (e) { console.log(`  ${f}: ${e.message}`); }
}
const SAMPLE = "প্রতিটি গ্রুপেই আলাদাভাবে পুরস্কার প্রদান করা হবে। নগদ ৭০০০/- ক্রেস্ট";
const rows = ok.map((f) => `<div class="row"><div class="lbl">${f}</div>
<div style="font-family:'${f}'">${SAMPLE}</div></div>`).join("\n");
writeFileSync("dist/type/compare.html", `<meta charset="utf-8"><style>${css}
body{margin:0;padding:24px 32px;background:#F6F2E7;width:1900px;color:#2B2B28}
.row{margin:0 0 22px}.lbl{font:600 16px system-ui;color:#7E9333;letter-spacing:.12em;text-transform:uppercase;margin-bottom:2px}
.row div:last-child{font-size:46px;line-height:1.5}
</style>${rows}`);
console.log(`\n✓ ${ok.length} families inlined into dist/type/compare.html`);
