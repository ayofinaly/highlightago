// 🔴 REPLACE WITH YOUR GOOGLE SHEET ID
const SHEET_ID = "1BAYSXQHsZ71EPyPeyKdVtf17CdWAMepiONgTQWFUtwI";

// 🔴 REPLACE IF YOUR SHEET NAME IS DIFFERENT
const SHEET_NAME = "Sheet1";

// Google Visualization API URL
const SHEET_URL =
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=${encodeURIComponent(SHEET_NAME)}`;

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

async function loadGlossary() {
  const response = await fetch(SHEET_URL, { cache: "no-store" });
  if (!response.ok) throw new Error("Sheet fetch failed");

  const text = await response.text();

  // Google wraps JSON in a function call → strip it
  const json = JSON.parse(
    text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1)
  );

  const rows = json.table.rows;
  const glossary = Object.create(null);

  for (const row of rows) {
    const wordCell = row.c[0];
    const defCell = row.c[1];

    if (!wordCell || !defCell) continue;

    const word = wordCell.v.toString().trim().toLowerCase();
    const definition = defCell.v.toString().trim();

    glossary[word] = definition;
  }

  return glossary;
}

(async () => {
  const termEl = document.getElementById("term");
  const resultEl = document.getElementById("result");

  const term = getQueryParam("q");

  if (!term) {
    resultEl.textContent = "No term provided.";
    resultEl.className = "error";
    return;
  }

  termEl.textContent = term.toLowerCase();

  try {
    const glossary = await loadGlossary();
    const key = term.toLowerCase().trim();

    resultEl.textContent =
      glossary[key] || `No definition found for "${term}".`;
  } catch (err) {
    resultEl.textContent = "Error loading glossary.";
    resultEl.className = "error";
  }
})();
