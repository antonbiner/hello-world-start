import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd());
const hrDir = path.join(root, "src", "modules", "hr");
const enPath = path.join(hrDir, "locale", "hr.en.json");
const frPath = path.join(hrDir, "locale", "hr.fr.json");

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function flatten(obj, prefix = "") {
  const out = {};
  for (const [k, v] of Object.entries(obj ?? {})) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) Object.assign(out, flatten(v, key));
    else out[key] = true;
  }
  return out;
}

function walk(dir) {
  let res = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) res = res.concat(walk(p));
    else if (/\.(ts|tsx)$/.test(ent.name)) res.push(p);
  }
  return res;
}

const en = readJson(enPath);
const fr = readJson(frPath);
const enFlat = flatten(en);
const frFlat = flatten(fr);

const files = walk(hrDir);

// Very small-but-reliable: only capture t("x") and t('x') in HR files.
// Dynamic keys (template strings) are intentionally ignored.
const keyRe = /\bt\(\s*["']([^"'${}]+)["']/g;

const used = new Map(); // key -> { file, count }

for (const f of files) {
  const txt = fs.readFileSync(f, "utf8");
  let m;
  while ((m = keyRe.exec(txt))) {
    const key = m[1].trim();
    if (!key) continue;
    const prev = used.get(key);
    used.set(key, { file: prev?.file ?? f, count: (prev?.count ?? 0) + 1 });
  }
}

const usedKeys = [...used.keys()].sort();
const missingEn = usedKeys.filter((k) => !enFlat[k]);
const missingFr = usedKeys.filter((k) => !frFlat[k]);
const enNotFr = Object.keys(enFlat).filter((k) => !frFlat[k]).sort();
const frNotEn = Object.keys(frFlat).filter((k) => !enFlat[k]).sort();

function printList(title, arr, limit = 200) {
  console.log(`${title}: ${arr.length}`);
  if (arr.length) {
    for (const k of arr.slice(0, limit)) {
      const meta = used.get(k);
      const suffix = meta ? `  (used in ${path.relative(root, meta.file)})` : "";
      console.log(`- ${k}${suffix}`);
    }
    if (arr.length > limit) console.log(`... and ${arr.length - limit} more`);
  }
  console.log("");
}

console.log("HR i18n audit");
console.log("------------");
console.log(`Files scanned: ${files.length}`);
console.log(`Keys used: ${usedKeys.length}`);
console.log("");

printList("Missing in hr.en.json", missingEn);
printList("Missing in hr.fr.json", missingFr);
printList("Present in EN but missing in FR", enNotFr, 100);
printList("Present in FR but missing in EN", frNotEn, 100);

