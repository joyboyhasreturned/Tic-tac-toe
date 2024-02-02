document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('board');
    const status = document.getElementById('status');
    const resetButton = document.querySelector('button');
    const modal = document.getElementById('modal');
    const endGameModal = document.getElementById('endGameModal');
    const yesBtn = document.getElementById('yesBtn');
    const noBtn = document.getElementById('noBtn');
    const scoreDisplay = document.getElementById('score');

    let currentPlayer = 'X';
    let gameOver = false;
    let boardState = Array.from({ length: 5 }, () => Array(6).fill(''));
    let humanVsAI = false;
    let aiDifficulty = '';
    let scores = { X: 0, O: 0 };

    function renderBoard() {
        board.innerHTML = '';

        boardState.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                const cellElement = document.createElement('div');
                cellElement.classList.add('cell');
                cellElement.dataset.row = rowIndex;
                cellElement.dataset.col = colIndex;
                cellElement.textContent = cell;
                cellElement.addEventListener('click', handleCellClick);
                board.appendChild(cellElement);
            });
        });
    }

    function handleCellClick(event) {
        if (gameOver || (humanVsAI && currentPlayer === 'O')) return;

        const row = parseInt(event.target.dataset.row);
        const col = parseInt(event.target.dataset.col);

        if (boardState[row][col] === '') {
            boardState[row][col] = currentPlayer;
            renderBoard();
            checkForWinner(row, col);
            togglePlayer();

            if (humanVsAI && currentPlayer === 'O' && !gameOver) {
                setTimeout(makeAIMove, 500);
            }
        }
    }

    function checkForWinner(row, col) {
        if (
            checkDirection(row, col, 0, 1) ||  // Check horizontally
            checkDirection(row, col, 1, 0) ||  // Check vertically
            checkDirection(row, col, 1, 1) ||  // Check diagonally \
            checkDirection(row, col, -1, 1)    // Check diagonally /
        ) {
            status.textContent = `${currentPlayer} wins!`;
            scores[currentPlayer]++;
            updateScore();

            if (scores[currentPlayer] >= 5) {
                showEndGameModal();
            } else {
                setTimeout(resetGame, 1000);
            }

            gameOver = true;
        } else if (boardState.every(row => row.every(cell => cell !== ''))) {
            status.textContent = "It's a draw!";
            setTimeout(resetGame, 1000);
            gameOver = true;
        }
    }

    function checkDirection(row, col, rowDir, colDir) {
        let count = 1;
        count += checkLine(row, col, rowDir, colDir);
        count += checkLine(row, col, -rowDir, -colDir);
        return count >= 5;
    }

    function checkLine(row, col, rowDir, colDir) {
        let count = 0;
        let currentRow = row + rowDir;
        let currentCol = col + colDir;

        while (
            currentRow >= 0 && currentRow < 5 &&
            currentCol >= 0 && currentCol < 6 &&
            boardState[currentRow][currentCol] === currentPlayer
        ) {
            count++;
            currentRow += rowDir;
            currentCol += colDir;
        }

        return count;
    }

    function togglePlayer() {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        status.textContent = `${currentPlayer}'s turn`;
    }

    function resetGame() {
        currentPlayer = 'X';
        gameOver = false;
        boardState = Array.from({ length: 5 }, () => Array(6).fill(''));
        renderBoard();
        status.textContent = `${currentPlayer}'s turn`;

        if (humanVsAI && currentPlayer === 'O') {
            setTimeout(makeAIMove, 500);
        }
    }

    function updateScore() {
        scoreDisplay.textContent = `Score: X - ${scores.X}, O - ${scores.O}`;
    }

    function showEndGameModal() {
        endGameModal.style.display = 'flex';
    }

    function hideEndGameModal() {
        endGameModal.style.display = 'none';
    }

    function startGame(opponent) {
        humanVsAI = opponent !== 'human';
        aiDifficulty = opponent;
        resetGame();
        modal.style.display = 'none';

        if (humanVsAI && currentPlayer === 'O') {
            setTimeout(makeAIMove, 500);
        }
    }

    function makeAIMove() {
        if (gameOver || !humanVsAI) return;

        const emptyCells = [];

        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 6; col++) {
                if (boardState[row][col] === '') {
                    emptyCells.push({ row, col });
                }
            }
        }

        if (emptyCells.length > 0) {
            let move;

            switch (aiDifficulty) {
                case 'easy':
                    move = getRandomMove(emptyCells);
                    break;
                case 'medium':
                    move = getMediumAIMove(emptyCells);
                    break;
                case 'hard':
                    move = getHardAIMove(emptyCells);
                    break;
                default:
                    move = getRandomMove(emptyCells);
            }

            boardState[move.row][move.col] = currentPlayer;
            renderBoard();
            checkForWinner(move.row, move.col);
            togglePlayer();
        }
    }

    function getRandomMove(emptyCells) {
        const randomIndex = Math.floor(Math.random() * emptyCells.length);
        return emptyCells[randomIndex];
    }

    function getMediumAIMove(emptyCells) {
        const randomProbability = Math.random();

        if (randomProbability <= 0.7) {
            return getRandomMove(emptyCells);
        } else {
            const centerAndEdges = emptyCells.filter(cell => {
                const isCenter = cell.row === 2 && cell.col === 2;
                const isEdge = cell.row === 0 || cell.row === 4 || cell.col === 0 || cell.col === 5;
                return isCenter || isEdge;
            });

            return centerAndEdges.length > 0 ? getRandomMove(centerAndEdges) : getRandomMove(emptyCells);
        }
    }

    function getHardAIMove(emptyCells) {
        const winningMove = findWinningMove(emptyCells, currentPlayer);
        if (winningMove) {
            return winningMove;
        }

        const blockingMove = findWinningMove(emptyCells, currentPlayer === 'X' ? 'O' : 'X');
        if (blockingMove) {
            return blockingMove;
        }

        return getRandomMove(emptyCells);
    }

    function findWinningMove(emptyCells, player) {
        for (const cell of emptyCells) {
            boardState[cell.row][cell.col] = player;
            if (checkForWinner(cell.row, cell.col)) {
                boardState[cell.row][cell.col] = '';
                return cell;
            }
            boardState[cell.row][cell.col] = '';
        }
        return null;
    }

    // Event listeners for modal buttons
    const humanBtn = document.getElementById('humanBtn');
    const easyBtn = document.getElementById('easyBtn');
    const mediumBtn = document.getElementById('mediumBtn');
    const hardBtn = document.getElementById('hardBtn');

    humanBtn.addEventListener('click', () => startGame('human'));
    easyBtn.addEventListener('click', () => startGame('easy'));
    mediumBtn.addEventListener('click', () => startGame('medium'));
    hardBtn.addEventListener('click', () => startGame('hard'));

    // Event listeners for end game modal buttons
    yesBtn.addEventListener('click', () => {
        hideEndGameModal();
        modal.style.display = 'flex';
        scores = { X: 0, O: 0 };
        updateScore();
    });

    noBtn.addEventListener('click', () => {
        hideEndGameModal();
        window.close();
    });

    // Show the modal when the page loads
    modal.style.display = 'flex';
});
