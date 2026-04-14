const size = 4;
let grid = createEmptyGrid();
let score = 0;
let gameOver = false;
const bestKey = "best-2048-score";

const board = document.getElementById("board");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const restartBtn = document.getElementById("restart");
const retryBtn = document.getElementById("retry");
const overlay = document.getElementById("overlay");
const message = document.getElementById("message");

let touchStartX = 0;
let touchStartY = 0;

function createEmptyGrid() {
  return Array.from({ length: size }, () => Array(size).fill(0));
}

function cloneGrid(targetGrid) {
  return targetGrid.map((row) => [...row]);
}

function randomEmptyCell() {
  const empties = [];
  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      if (grid[r][c] === 0) empties.push([r, c]);
    }
  }
  if (!empties.length) return null;
  return empties[Math.floor(Math.random() * empties.length)];
}

function addRandomTile() {
  const cell = randomEmptyCell();
  if (!cell) return;
  const [r, c] = cell;
  grid[r][c] = Math.random() < 0.9 ? 2 : 4;
}

function init() {
  grid = createEmptyGrid();
  score = 0;
  gameOver = false;
  overlay.classList.add("hidden");
  addRandomTile();
  addRandomTile();
  updateScore();
  render();
}

function updateScore() {
  scoreEl.textContent = String(score);
  const best = Number(localStorage.getItem(bestKey) || 0);
  if (score > best) {
    localStorage.setItem(bestKey, String(score));
    bestEl.textContent = String(score);
    return;
  }
  bestEl.textContent = String(best);
}

function render() {
  board.innerHTML = "";
  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      const value = grid[r][c];
      const tile = document.createElement("div");
      tile.className = `cell value-${value <= 2048 ? value : 2048}`;
      tile.textContent = value === 0 ? "" : String(value);
      board.appendChild(tile);
    }
  }
}

function compressAndMerge(line) {
  const values = line.filter((n) => n !== 0);
  for (let i = 0; i < values.length - 1; i += 1) {
    if (values[i] === values[i + 1]) {
      values[i] *= 2;
      score += values[i];
      values[i + 1] = 0;
    }
  }
  const merged = values.filter((n) => n !== 0);
  while (merged.length < size) merged.push(0);
  return merged;
}

function reverse(line) {
  return [...line].reverse();
}

function columnsToRows(targetGrid) {
  return targetGrid[0].map((_, c) => targetGrid.map((row) => row[c]));
}

function rowsToColumns(rows) {
  return rows[0].map((_, c) => rows.map((row) => row[c]));
}

function move(direction) {
  if (gameOver) return;

  const before = cloneGrid(grid);
  let working = cloneGrid(grid);

  if (direction === "up" || direction === "down") {
    working = columnsToRows(working);
  }

  if (direction === "right" || direction === "down") {
    working = working.map((line) => reverse(line));
  }

  working = working.map((line) => compressAndMerge(line));

  if (direction === "right" || direction === "down") {
    working = working.map((line) => reverse(line));
  }

  if (direction === "up" || direction === "down") {
    working = rowsToColumns(working);
  }

  grid = working;

  const changed = JSON.stringify(before) !== JSON.stringify(grid);
  if (!changed) return;

  addRandomTile();
  updateScore();
  render();

  if (isGameLost()) {
    gameOver = true;
    showMessage("ゲームオーバー");
  }
}

function isGameLost() {
  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      const value = grid[r][c];
      if (value === 0) return false;
      if (r < size - 1 && value === grid[r + 1][c]) return false;
      if (c < size - 1 && value === grid[r][c + 1]) return false;
    }
  }
  return true;
}

function showMessage(text) {
  message.textContent = text;
  overlay.classList.remove("hidden");
}

window.addEventListener("keydown", (event) => {
  const keyMap = {
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right",
    w: "up",
    s: "down",
    a: "left",
    d: "right",
    W: "up",
    S: "down",
    A: "left",
    D: "right",
  };

  const direction = keyMap[event.key];
  if (!direction) return;
  event.preventDefault();
  move(direction);
});

board.addEventListener(
  "touchstart",
  (event) => {
    const touch = event.changedTouches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  },
  { passive: true }
);

board.addEventListener(
  "touchend",
  (event) => {
    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;
    const minSwipe = 24;

    if (Math.abs(dx) < minSwipe && Math.abs(dy) < minSwipe) return;
    if (Math.abs(dx) > Math.abs(dy)) {
      move(dx > 0 ? "right" : "left");
      return;
    }

    move(dy > 0 ? "down" : "up");
  },
  { passive: true }
);

restartBtn.addEventListener("click", init);
retryBtn.addEventListener("click", init);

bestEl.textContent = localStorage.getItem(bestKey) || "0";
init();
