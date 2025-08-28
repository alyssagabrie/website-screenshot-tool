const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

// ---------- CONFIG ----------
const OUT_DIR = process.argv[2] || "nike-archive";
const INPUT_FILE = process.argv[3] || autoDetectInput();
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ---------- Helpers ----------
function autoDetectInput() {
  if (fs.existsSync("sites.csv")) return "sites.csv";
  if (fs.existsSync("sites.tsv")) return "sites.tsv";
  if (fs.existsSync("urls.txt"))  return "urls.txt";
  return null;
}

function sanitizeForFilename(s) {
  if (!s) return "";
  s = String(s).trim();
  s = s.replace(/[\/\\:*?"<>|]/g, "_");
  s = s.replace(/\s+/g, " ");
  return s;
}

function safeFileNameContractCompany(contract, company) {
  const cnum = sanitizeForFilename(contract).replace(/\s+/g, "");
  const cname = sanitizeForFilename(company);
  const base = [cnum, cname].filter(Boolean).join("-");
  return (base || "untitled").slice(0, 180) + ".png";
}

function safeFileNameFromUrl(u) {
  let s = u.replace(/^https?:\/\//, "");
  s = s.replace(/[?#].*$/, "");
  s = s.replace(/[/\\:*?"<>|]/g, "_").replace(/[^a-zA-Z0-9._-]/g, "_");
  return s.slice(0, 180) + ".png";
}

// CSV/TSV parsing
function splitCSVLine(line) {
  const out = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
      else inQ = !inQ;
    } else if (ch === "," && !inQ) {
      out.push(cur); cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (!lines.length) return [];
  const headers = splitCSVLine(lines[0]);
  return lines.slice(1).map(line => {
    const cols = splitCSVLine(line);
    const obj = {};
    headers.forEach((h, idx) => obj[h.trim()] = (cols[idx] || "").trim());
    return obj;
  });
}

function parseTSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (!lines.length) return [];
  const headers = lines[0].split("\t").map(h => h.trim());
  return lines.slice(1).map(line => {
    const cols = line.split("\t");
    const obj = {};
    headers.forEach((h, idx) => obj[h] = (cols[idx] || "").trim());
    return obj;
  });
}

function normalizeSheetRows(rows) {
  const out = [];
  for (const r of rows) {
    const company = r["Company"] ?? r["Company Name"] ?? r["Name"] ?? "";
    const contract = r["Contract #"] ?? r["Contract"] ?? r["Contract Number"] ?? r["Contract No"] ?? "";
    const url = r["Website Link"] ?? r["Website"] ?? r["Link"] ?? r["URL"] ?? r["Onsite"] ?? "";
    if (!url) continue;
    out.push({ company, contract, url });
  }
  return out;
}

function loadRows(inputPath) {
  const text = fs.readFileSync(inputPath, "utf8");
  if (/\.csv$/i.test(inputPath)) return normalizeSheetRows(parseCSV(text));
  if (/\.tsv$/i.test(inputPath)) return normalizeSheetRows(parseTSV(text));
  if (/\.txt$/i.test(inputPath)) {
    return text.split(/\r?\n/).map(l => l.trim()).filter(Boolean).map(url => ({
      company: "", contract: "", url
    }));
  }
  throw new Error("Unsupported input file type. Use .csv, .tsv, or .txt");
}

// ---------- Main ----------
(async () => {
  if (!INPUT_FILE) {
    console.error("No input file found (sites.csv / sites.tsv / urls.txt).");
    process.exit(1);
  }

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const rows = loadRows(INPUT_FILE);
  if (!rows.length) {
    console.error("No rows/URLs found in input.");
    process.exit(1);
  }

  console.log(`Using input: ${INPUT_FILE}`);
  console.log(`Saving to:   ${OUT_DIR}`);

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(60000);

  let success = 0, failed = 0;

  for (let i = 0; i < rows.length; i++) {
    const { company, contract, url } = rows[i];
    try {
      console.log(`[${i + 1}/${rows.length}] Capturing: ${url}`);
      await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

      let fileName =
        (contract || company)
          ? safeFileNameContractCompany(contract, company)
          : safeFileNameFromUrl(url);
      const outPath = path.join(OUT_DIR, fileName);

      await page.evaluate(() => window.scrollTo(0, 0));
      await sleep(800);

      await page.screenshot({ path: outPath, fullPage: true });
      console.log(`   ✓ Saved: ${fileName}`);
      success++;
    } catch (e) {
      console.warn(`   ✗ ${url} — ${e.message}`);
      failed++;
    }
  }

  await browser.close();
  console.log(`\n✅ Done. Screenshots in '${OUT_DIR}'. Success: ${success}, Failed: ${failed}`);
})();
