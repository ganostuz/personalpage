(() => {
  const boardCanvas = document.querySelector("#tetris-board");
  const nextCanvas = document.querySelector("#tetris-next");

  if (!boardCanvas || !nextCanvas) {
    return;
  }

  const boardContext = boardCanvas.getContext("2d");
  const nextContext = nextCanvas.getContext("2d");
  const overlay = document.querySelector("[data-game-overlay]");
  const overlayLabel = document.querySelector("[data-overlay-label]");
  const overlayMessage = document.querySelector("[data-overlay-message]");
  const startButton = document.querySelector("[data-game-start]");
  const restartButton = document.querySelector("[data-game-restart]");
  const status = document.querySelector("[data-game-status]");
  const scoreOutput = document.querySelector("[data-score]");
  const linesOutput = document.querySelector("[data-lines]");
  const levelOutput = document.querySelector("[data-level]");
  const pauseButton = document.querySelector('[data-game-action="pause"]');
  const pauseIcon = pauseButton?.querySelector("span");
  const pauseLabel = pauseButton?.querySelector("small");

  const columns = 10;
  const rows = 20;
  const pieceTypes = ["I", "O", "T", "S", "Z", "J", "L"];
  const shapes = {
    I: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    O: [
      [1, 1],
      [1, 1]
    ],
    T: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    S: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0]
    ],
    Z: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0]
    ],
    J: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    L: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0]
    ]
  };

  let board = createBoard();
  let activePiece;
  let nextType;
  let bag = [];
  let score = 0;
  let clearedLines = 0;
  let level = 1;
  let gameState = "ready";
  let frameId = 0;
  let lastDropTime = 0;
  let colors = readColors();

  function createBoard() {
    return Array.from({ length: rows }, () => Array(columns).fill(null));
  }

  function shuffledBag() {
    const available = [...pieceTypes];

    for (let index = available.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [available[index], available[swapIndex]] = [available[swapIndex], available[index]];
    }

    return available;
  }

  function takePieceType() {
    if (bag.length === 0) {
      bag = shuffledBag();
    }

    return bag.shift();
  }

  function createPiece(type) {
    const matrix = shapes[type].map((row) => [...row]);

    return {
      type,
      matrix,
      x: Math.floor((columns - matrix[0].length) / 2),
      y: -1
    };
  }

  function resetGame(shouldStart = false) {
    cancelAnimationFrame(frameId);
    frameId = 0;
    board = createBoard();
    bag = [];
    score = 0;
    clearedLines = 0;
    level = 1;
    nextType = takePieceType();
    spawnPiece();
    gameState = shouldStart ? "running" : "ready";
    lastDropTime = 0;
    updateStats();
    updatePauseButton();
    draw();

    if (shouldStart) {
      hideOverlay();
      setStatus("Game started.");
      requestLoop();
    } else {
      showOverlay("Ready?", "Use the keyboard or controls below.", "Start game");
      setStatus("Game ready.");
    }
  }

  function spawnPiece() {
    activePiece = createPiece(nextType);
    nextType = takePieceType();
  }

  function collides(piece, offsetX = 0, offsetY = 0, matrix = piece.matrix) {
    for (let rowIndex = 0; rowIndex < matrix.length; rowIndex += 1) {
      for (let columnIndex = 0; columnIndex < matrix[rowIndex].length; columnIndex += 1) {
        if (!matrix[rowIndex][columnIndex]) {
          continue;
        }

        const x = piece.x + columnIndex + offsetX;
        const y = piece.y + rowIndex + offsetY;

        if (x < 0 || x >= columns || y >= rows || (y >= 0 && board[y][x])) {
          return true;
        }
      }
    }

    return false;
  }

  function movePiece(offsetX, offsetY) {
    if (collides(activePiece, offsetX, offsetY)) {
      return false;
    }

    activePiece.x += offsetX;
    activePiece.y += offsetY;
    return true;
  }

  function rotateMatrix(matrix, direction) {
    const size = matrix.length;
    const rotated = Array.from({ length: size }, () => Array(size).fill(0));

    for (let rowIndex = 0; rowIndex < size; rowIndex += 1) {
      for (let columnIndex = 0; columnIndex < size; columnIndex += 1) {
        if (direction > 0) {
          rotated[columnIndex][size - rowIndex - 1] = matrix[rowIndex][columnIndex];
        } else {
          rotated[size - columnIndex - 1][rowIndex] = matrix[rowIndex][columnIndex];
        }
      }
    }

    return rotated;
  }

  function rotatePiece(direction) {
    const rotated = rotateMatrix(activePiece.matrix, direction);
    const kicks = [
      [0, 0],
      [-1, 0],
      [1, 0],
      [-2, 0],
      [2, 0],
      [0, -1]
    ];

    for (const [offsetX, offsetY] of kicks) {
      if (!collides(activePiece, offsetX, offsetY, rotated)) {
        activePiece.matrix = rotated;
        activePiece.x += offsetX;
        activePiece.y += offsetY;
        return true;
      }
    }

    return false;
  }

  function mergePiece() {
    let reachedTop = false;

    activePiece.matrix.forEach((row, rowIndex) => {
      row.forEach((cell, columnIndex) => {
        if (!cell) {
          return;
        }

        const x = activePiece.x + columnIndex;
        const y = activePiece.y + rowIndex;

        if (y < 0) {
          reachedTop = true;
        } else {
          board[y][x] = activePiece.type;
        }
      });
    });

    return reachedTop;
  }

  function clearCompletedLines() {
    let linesThisTurn = 0;

    for (let rowIndex = rows - 1; rowIndex >= 0; rowIndex -= 1) {
      if (board[rowIndex].every(Boolean)) {
        board.splice(rowIndex, 1);
        board.unshift(Array(columns).fill(null));
        linesThisTurn += 1;
        rowIndex += 1;
      }
    }

    if (linesThisTurn === 0) {
      return;
    }

    const lineScores = [0, 100, 300, 500, 800];
    score += lineScores[linesThisTurn] * level;
    clearedLines += linesThisTurn;
    level = Math.floor(clearedLines / 10) + 1;
    updateStats();
    setStatus(`${linesThisTurn} ${linesThisTurn === 1 ? "line" : "lines"} cleared.`);
  }

  function lockPiece() {
    const reachedTop = mergePiece();
    clearCompletedLines();

    if (reachedTop) {
      endGame();
      return;
    }

    spawnPiece();

    if (collides(activePiece)) {
      endGame();
      return;
    }

    draw();
  }

  function stepDown(awardPoint = false) {
    if (movePiece(0, 1)) {
      if (awardPoint) {
        score += 1;
        updateStats();
      }
    } else {
      lockPiece();
    }
  }

  function hardDrop() {
    let distance = 0;

    while (movePiece(0, 1)) {
      distance += 1;
    }

    score += distance * 2;
    updateStats();
    lockPiece();
  }

  function endGame() {
    gameState = "over";
    cancelAnimationFrame(frameId);
    frameId = 0;
    updatePauseButton();
    draw();
    showOverlay("Game over", `Final score: ${score.toLocaleString()}.`, "Play again");
    setStatus(`Game over. Final score ${score.toLocaleString()}.`);
  }

  function startGame() {
    if (gameState === "over") {
      resetGame(true);
      return;
    }

    gameState = "running";
    lastDropTime = 0;
    hideOverlay();
    updatePauseButton();
    setStatus("Game running.");
    requestLoop();
  }

  function togglePause() {
    if (gameState === "ready") {
      startGame();
      return;
    }

    if (gameState === "over") {
      return;
    }

    if (gameState === "paused") {
      gameState = "running";
      lastDropTime = 0;
      hideOverlay();
      updatePauseButton();
      setStatus("Game resumed.");
      requestLoop();
    } else {
      gameState = "paused";
      cancelAnimationFrame(frameId);
      frameId = 0;
      showOverlay("Paused", "Your board will wait here.", "Resume");
      updatePauseButton();
      setStatus("Game paused.");
    }
  }

  function updatePauseButton() {
    const isPaused = gameState === "paused";

    if (pauseIcon) {
      pauseIcon.textContent = isPaused ? "▶" : "Ⅱ";
    }

    if (pauseLabel) {
      pauseLabel.textContent = isPaused ? "Resume" : "Pause";
    }
  }

  function updateStats() {
    scoreOutput.textContent = score.toLocaleString();
    linesOutput.textContent = clearedLines.toLocaleString();
    levelOutput.textContent = level.toLocaleString();
  }

  function showOverlay(label, message, buttonText) {
    overlayLabel.textContent = label;
    overlayMessage.textContent = message;
    startButton.textContent = buttonText;
    overlay.hidden = false;
  }

  function hideOverlay() {
    overlay.hidden = true;
  }

  function setStatus(message) {
    status.textContent = message;
  }

  function requestLoop() {
    if (!frameId && gameState === "running") {
      frameId = requestAnimationFrame(runGame);
    }
  }

  function runGame(time) {
    frameId = 0;

    if (gameState !== "running") {
      return;
    }

    if (!lastDropTime) {
      lastDropTime = time;
    }

    const dropInterval = Math.max(90, 800 - (level - 1) * 65);

    if (time - lastDropTime >= dropInterval) {
      stepDown();
      lastDropTime = time;
    }

    draw();
    requestLoop();
  }

  function performAction(action) {
    if (action === "pause") {
      togglePause();
      return;
    }

    if (gameState === "ready") {
      startGame();
    }

    if (gameState !== "running") {
      return;
    }

    if (action === "left") {
      movePiece(-1, 0);
    } else if (action === "right") {
      movePiece(1, 0);
    } else if (action === "down") {
      stepDown(true);
    } else if (action === "rotate") {
      rotatePiece(1);
    } else if (action === "rotate-back") {
      rotatePiece(-1);
    } else if (action === "drop") {
      hardDrop();
    }

    draw();
  }

  function readColors() {
    const styles = getComputedStyle(document.documentElement);
    const value = (name) => styles.getPropertyValue(name).trim();

    return {
      background: value("--surface-raised") || "#f4f3ee",
      grid: value("--line") || "#d7d7cf",
      ghost: value("--muted") || "#6c716b",
      I: value("--piece-i"),
      O: value("--piece-o"),
      T: value("--piece-t"),
      S: value("--piece-s"),
      Z: value("--piece-z"),
      J: value("--piece-j"),
      L: value("--piece-l")
    };
  }

  function resizeCanvas(canvas) {
    const bounds = canvas.getBoundingClientRect();
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(bounds.width * pixelRatio));
    const height = Math.max(1, Math.round(bounds.height * pixelRatio));

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
  }

  function drawCell(context, x, y, width, height, color, opacity = 1) {
    const gap = Math.max(1, Math.min(width, height) * 0.07);
    context.save();
    context.globalAlpha = opacity;
    context.fillStyle = color;
    context.fillRect(x * width + gap, y * height + gap, width - gap * 2, height - gap * 2);
    context.restore();
  }

  function drawBoardBackground() {
    const cellWidth = boardCanvas.width / columns;
    const cellHeight = boardCanvas.height / rows;

    boardContext.fillStyle = colors.background;
    boardContext.fillRect(0, 0, boardCanvas.width, boardCanvas.height);
    boardContext.strokeStyle = colors.grid;
    boardContext.lineWidth = Math.max(1, Math.min(cellWidth, cellHeight) * 0.025);
    boardContext.beginPath();

    for (let columnIndex = 1; columnIndex < columns; columnIndex += 1) {
      const x = Math.round(columnIndex * cellWidth);
      boardContext.moveTo(x, 0);
      boardContext.lineTo(x, boardCanvas.height);
    }

    for (let rowIndex = 1; rowIndex < rows; rowIndex += 1) {
      const y = Math.round(rowIndex * cellHeight);
      boardContext.moveTo(0, y);
      boardContext.lineTo(boardCanvas.width, y);
    }

    boardContext.stroke();
  }

  function drawMatrix(context, matrix, offsetX, offsetY, cellWidth, cellHeight, type, opacity = 1) {
    matrix.forEach((row, rowIndex) => {
      row.forEach((cell, columnIndex) => {
        if (cell && offsetY + rowIndex >= 0) {
          drawCell(
            context,
            offsetX + columnIndex,
            offsetY + rowIndex,
            cellWidth,
            cellHeight,
            colors[type],
            opacity
          );
        }
      });
    });
  }

  function ghostY() {
    let offsetY = 0;

    while (!collides(activePiece, 0, offsetY + 1)) {
      offsetY += 1;
    }

    return activePiece.y + offsetY;
  }

  function draw() {
    resizeCanvas(boardCanvas);
    resizeCanvas(nextCanvas);
    drawBoardBackground();

    const cellWidth = boardCanvas.width / columns;
    const cellHeight = boardCanvas.height / rows;

    board.forEach((row, rowIndex) => {
      row.forEach((type, columnIndex) => {
        if (type) {
          drawCell(boardContext, columnIndex, rowIndex, cellWidth, cellHeight, colors[type]);
        }
      });
    });

    if (activePiece) {
      drawMatrix(
        boardContext,
        activePiece.matrix,
        activePiece.x,
        ghostY(),
        cellWidth,
        cellHeight,
        activePiece.type,
        0.18
      );
      drawMatrix(
        boardContext,
        activePiece.matrix,
        activePiece.x,
        activePiece.y,
        cellWidth,
        cellHeight,
        activePiece.type
      );
    }

    drawNextPiece();
  }

  function drawNextPiece() {
    nextContext.fillStyle = colors.background;
    nextContext.fillRect(0, 0, nextCanvas.width, nextCanvas.height);

    if (!nextType) {
      return;
    }

    const matrix = shapes[nextType];
    const occupiedRows = matrix
      .map((row, index) => (row.some(Boolean) ? index : -1))
      .filter((index) => index >= 0);
    const occupiedColumns = matrix[0]
      .map((_, columnIndex) => (matrix.some((row) => row[columnIndex]) ? columnIndex : -1))
      .filter((index) => index >= 0);
    const minRow = Math.min(...occupiedRows);
    const maxRow = Math.max(...occupiedRows);
    const minColumn = Math.min(...occupiedColumns);
    const maxColumn = Math.max(...occupiedColumns);
    const pieceWidth = maxColumn - minColumn + 1;
    const pieceHeight = maxRow - minRow + 1;
    const cellSize = Math.min(
      nextCanvas.width / (pieceWidth + 1.5),
      nextCanvas.height / (pieceHeight + 1.5)
    );
    const offsetX = (nextCanvas.width - pieceWidth * cellSize) / 2 / cellSize - minColumn;
    const offsetY = (nextCanvas.height - pieceHeight * cellSize) / 2 / cellSize - minRow;

    drawMatrix(nextContext, matrix, offsetX, offsetY, cellSize, cellSize, nextType);
  }

  startButton.addEventListener("click", () => {
    if (gameState === "paused") {
      togglePause();
    } else {
      startGame();
    }
  });

  restartButton.addEventListener("click", () => {
    resetGame(true);
  });

  document.querySelectorAll("[data-game-action]").forEach((button) => {
    button.addEventListener("click", () => {
      performAction(button.dataset.gameAction);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return;
    }

    const actions = {
      ArrowLeft: "left",
      ArrowRight: "right",
      ArrowDown: "down",
      ArrowUp: "rotate",
      KeyX: "rotate",
      KeyZ: "rotate-back",
      Space: "drop",
      KeyP: "pause",
      Escape: "pause"
    };
    const action = actions[event.code];

    if (event.code === "KeyR") {
      event.preventDefault();
      resetGame(true);
      return;
    }

    if (!action || (event.code === "Space" && event.target instanceof HTMLButtonElement)) {
      return;
    }

    event.preventDefault();
    performAction(action);
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && gameState === "running") {
      togglePause();
    }
  });

  const themeObserver = new MutationObserver(() => {
    colors = readColors();
    draw();
  });

  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"]
  });

  const resizeObserver = new ResizeObserver(() => {
    draw();
  });

  resizeObserver.observe(boardCanvas);
  resizeObserver.observe(nextCanvas);
  resetGame();
})();
