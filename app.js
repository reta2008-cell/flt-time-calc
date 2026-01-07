// HH:MM only (no seconds, no decimal)
let input = "";          // digits buffer
let acc = null;          // accumulator minutes
let op = null;           // "+" | "-"

const displayEl = document.getElementById("display");

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
  return `${sign}${h}:${String(m).padStart(2, "0")}`;
}

function refreshDisplay() {
  const mins = parseBufferToMinutes(input);
  displayEl.textContent = formatHHMM(mins);
}

function commitPending() {
  const v = parseBufferToMinutes(input);

  if (acc !== null && op) {
    acc = (op === "+") ? (acc + v) : (acc - v);
    displayEl.textContent = formatHHMM(acc);
  } else {
    acc = v;
    displayEl.textContent = formatHHMM(acc);
  }
  input = "";
}

function handleOp(nextOp) {
  if (nextOp === "=") {
    if (acc === null || !op) return;
    const v = parseBufferToMinutes(input);
    const result = (op === "+") ? (acc + v) : (acc - v);
    displayEl.textContent = formatHHMM(result);
    acc = null;
    op = null;
    input = "";
    return;
  }

  commitPending();
  op = nextOp;
}

document.querySelectorAll(".num").forEach(btn => {
  btn.addEventListener("click", () => {
    if (input.length >= 6) return;
    input += btn.dataset.num;
    refreshDisplay();
  });
});

document.querySelectorAll(".op").forEach(btn => {
  btn.addEventListener("click", () => handleOp(btn.dataset.op));
});

document.getElementById("backspace").addEventListener("click", () => {
  if (!input) return;
  input = input.slice(0, -1);
  refreshDisplay();
});

document.getElementById("clearEntry").addEventListener("click", () => {
  input = "";
  refreshDisplay();
});

document.getElementById("clearAll").addEventListener("click", () => {
  input = "";
  acc = null;
  op = null;
  refreshDisplay();
});

// Initial
refreshDisplay();

// Register Service Worker (PWA offline)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}