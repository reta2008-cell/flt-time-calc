// HH:MM only (no seconds, no decimal)
// + Tape/History + localStorage persistence

let input = "";          // digits buffer
let acc = null;          // accumulator minutes
let op = null;           // "+" | "-"
let tape = [];           // { sym: "", val: minutes }

const displayEl = document.getElementById("display");
const tapeEl = document.getElementById("tape");

function parseBufferToMinutes(buf) {
  if (!buf) return 0;
  const raw = parseInt(buf, 10);
  if (Number.isNaN(raw)) return 0;

  // last 2 digits = minutes, rest = hours
  if (buf.length <= 2) return raw; // treat as minutes
  const minutes = raw % 100;
  const hours = Math.floor(raw / 100);
  return hours * 60 + minutes;
}

function formatHHMM(totalMinutes) {
  const sign = totalMinutes < 0 ? "-" : "";
  const absMin = Math.abs(totalMinutes);
  const h = Math.floor(absMin / 60);
  const m = absMin % 60;
  return ${sign}${h}:${String(m).padStart(2, "0")};
}

function saveTape() {
  try { localStorage.setItem("timecalc_tape", JSON.stringify(tape)); } catch {}
}
function loadTape() {
  try {
    const raw = localStorage.getItem("timecalc_tape");
    tape = raw ? JSON.parse(raw) : [];
  } catch { tape = []; }
}

function renderTape() {
  if (!tapeEl) return;
  if (!tape.length) {
    tapeEl.innerHTML = <div style="opacity:.55;font-weight:600;">No history yet</div>;
    return;
  }

  tapeEl.innerHTML = tape.map(row => `
    <div class="tapeRow">
      <div class="sym">${row.sym || ""}</div>
      <div class="val">${formatHHMM(row.val)}</div>
    </div>
  `).join("");

  // scroll to bottom (latest)
  const parent = tapeEl.parentElement;
  if (parent) parent.scrollTop = parent.scrollHeight;
}

function setDisplayToInput() {
  const mins = parseBufferToMinutes(input);
  displayEl.textContent = formatHHMM(mins);
}

function pushTape(sym, minutes) {
  tape.push({ sym, val: minutes });
  saveTape();
  renderTape();
}

function commitPending(nextOpSym) {
  const v = parseBufferToMinutes(input);

  // First entry (no symbol) when starting a chain
  if (acc === null) {
    acc = v;
    pushTape("", v);
    input = "";
    op = nextOpSym;
    setDisplayToMinutes(acc);
    return;
  }

  // If we already have an operator, push the operand line with that operator
  if (op) {
    pushTape(op, v);
    acc = (op === "+") ? (acc + v) : (acc - v);
    setDisplayToMinutes(acc);
  }

  input = "";
  op = nextOpSym;
}

function setDisplayToMinutes(mins) {
  displayEl.textContent = formatHHMM(mins);
}

function handleOp(nextOp) {
  if (nextOp === "=") {
    if (acc === null || !op) return; // nothing to evaluate
    const v = parseBufferToMinutes(input);

    // push operand line
    pushTape(op, v);

    // result
    const result = (op === "+") ? (acc + v) : (acc - v);
    pushTape("=", result);

    setDisplayToMinutes(result);

    // reset chain
    acc = null;
    op = null;
    input = "";
    return;
  }

  // "+" or "-"
  commitPending(nextOp);
}

document.querySelectorAll(".num").forEach(btn => {
  btn.addEventListener("click", () => {
    if (input.length >= 6) return;
    input += btn.dataset.num;
    setDisplayToInput();
  });
});

document.querySelectorAll(".op").forEach(btn => {
  btn.addEventListener("click", () => handleOp(btn.dataset.op));
});

document.getElementById("backspace").addEventListener("click", () => {
  if (!input) return;
  input = input.slice(0, -1);
  setDisplayToInput();
});

document.getElementById("clearEntry").addEventListener("click", () => {
  input = "";
  setDisplayToInput();
});

document.getElementById("clearAll").addEventListener("click", () => {
  input = "";
  acc = null;
  op = null;
  tape = [];
  saveTape();
  renderTape();
  setDisplayToInput();
});

// Init
loadTape();
renderTape();
setDisplayToInput();

// Service Worker (PWA offline)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}
