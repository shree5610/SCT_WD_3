let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameActive = true;
let isAIMode = false;
let scores = { X: 0, O: 0, draw: 0 };

const WINNING_COMBINATIONS = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('status-text');
const restartBtn = document.getElementById('restart-btn');
const resetScoresBtn = document.getElementById('reset-scores-btn');
const twoPlayerBtn = document.getElementById('two-player-btn');
const aiBtn = document.getElementById('ai-btn');
const modal = document.getElementById('modal');
const modalText = document.getElementById('modal-text');
const playAgainBtn = document.getElementById('play-again-btn');
const scoreX = document.getElementById('score-x');
const scoreO = document.getElementById('score-o');
const scoreDraw = document.getElementById('score-draw');

cells.forEach(cell => {
    cell.addEventListener('click', handleCellClick);
});

restartBtn.addEventListener('click', restartGame);
resetScoresBtn.addEventListener('click', resetScores);
twoPlayerBtn.addEventListener('click', () => setGameMode(false));
aiBtn.addEventListener('click', () => setGameMode(true));
playAgainBtn.addEventListener('click', () => {
    modal.classList.remove('show');
    restartGame();
});

function handleCellClick(event) {
    const cell = event.target;
    const index = parseInt(cell.getAttribute('data-index'));

    if (board[index] !== '' || !gameActive) {
        return;
    }

    makeMove(index);

    if (isAIMode && gameActive && currentPlayer === 'O') {
        setTimeout(makeAIMove, 500);
    }
}

function makeMove(index) {
    board[index] = currentPlayer;
    const cell = cells[index];
    cell.textContent = currentPlayer;
    cell.classList.add('taken', currentPlayer.toLowerCase());

    if (checkWin()) {
        endGame(false);
    } else if (checkDraw()) {
        endGame(true);
    } else {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        updateStatus();
    }
}

function checkWin() {
    return WINNING_COMBINATIONS.some(combination => {
        const [a, b, c] = combination;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            highlightWinningCells(combination);
            return true;
        }
        return false;
    });
}

function checkDraw() {
    return board.every(cell => cell !== '');
}

function highlightWinningCells(combination) {
    combination.forEach(index => {
        cells[index].classList.add('winning');
    });
}

function endGame(isDraw) {
    gameActive = false;

    if (isDraw) {
        scores.draw++;
        modalText.textContent = "It's a Draw!";
        statusText.textContent = "Game Over - Draw!";
    } else {
        scores[currentPlayer]++;
        const winner = isAIMode && currentPlayer === 'O' ? 'AI' : `Player ${currentPlayer}`;
        modalText.textContent = `${winner} Wins! 🎉`;
        statusText.textContent = `${winner} Wins!`;
    }

    updateScoreboard();

    setTimeout(() => {
        modal.classList.add('show');
    }, 600);
}

function updateStatus() {
    if (isAIMode && currentPlayer === 'O') {
        statusText.textContent = "AI is thinking...";
    } else {
        statusText.textContent = `Player ${currentPlayer}'s Turn`;
    }
}

function updateScoreboard() {
    scoreX.textContent = scores.X;
    scoreO.textContent = scores.O;
    scoreDraw.textContent = scores.draw;
}

function restartGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    gameActive = true;

    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('taken', 'x', 'o', 'winning');
    });

    updateStatus();
}

function resetScores() {
    scores = { X: 0, O: 0, draw: 0 };
    updateScoreboard();
    restartGame();
}

function setGameMode(aiMode) {
    isAIMode = aiMode;

    twoPlayerBtn.classList.toggle('active', !aiMode);
    aiBtn.classList.toggle('active', aiMode);

    restartGame();
}

function makeAIMove() {
    if (!gameActive) return;

    const bestMove = findBestMove();
    if (bestMove !== -1) {
        makeMove(bestMove);
    }
}

function findBestMove() {
    let bestScore = -Infinity;
    let bestMove = -1;

    for (let i = 0; i < 9; i++) {
        if (board[i] === '') {
            board[i] = 'O';
            let score = minimax(board, 0, false);
            board[i] = '';

            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }

    return bestMove;
}

function minimax(boardState, depth, isMaximizing) {
    const winner = checkWinnerForMinimax(boardState);

    if (winner === 'O') return 10 - depth;
    if (winner === 'X') return depth - 10;
    if (isBoardFull(boardState)) return 0;

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (boardState[i] === '') {
                boardState[i] = 'O';
                let score = minimax(boardState, depth + 1, false);
                boardState[i] = '';
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (boardState[i] === '') {
                boardState[i] = 'X';
                let score = minimax(boardState, depth + 1, true);
                boardState[i] = '';
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

function checkWinnerForMinimax(boardState) {
    for (const [a, b, c] of WINNING_COMBINATIONS) {
        if (boardState[a] &&
            boardState[a] === boardState[b] &&
            boardState[a] === boardState[c]) {
            return boardState[a];
        }
    }
    return null;
}

function isBoardFull(boardState) {
    return boardState.every(cell => cell !== '');
}

updateStatus();
updateScoreboard();