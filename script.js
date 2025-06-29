const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const startButton = document.getElementById('start-button');
const nextPieceCanvas = document.getElementById('next-piece');
const nextPieceContext = nextPieceCanvas.getContext('2d');
const holdPieceCanvas = document.getElementById('hold-piece');
const holdPieceContext = holdPieceCanvas.getContext('2d');

// Add audio element
const bgm = new Audio('tetris_bgm.mp3');
bgm.loop = true;

const ROW = 20;
const COL = 10;
const SQ = 20;
const VACANT = 'BLACK'; // color of an empty square

// draw a square
function drawSquare(x, y, color, ctx = context) { // Add optional context
    ctx.fillStyle = color;
    ctx.fillRect(x * SQ, y * SQ, SQ, SQ);

    ctx.strokeStyle = 'BLACK';
    ctx.strokeRect(x * SQ, y * SQ, SQ, SQ);
}

// create the board
let board = [];
for (let r = 0; r < ROW; r++) {
    board[r] = [];
    for (let c = 0; c < COL; c++) {
        board[r][c] = VACANT;
    }
}

// draw the board
function drawBoard() {
    for (let r = 0; r < ROW; r++) {
        for (let c = 0; c < COL; c++) {
            drawSquare(c, r, board[r][c]);
        }
    }
}

drawBoard();

// Draw the next piece
function drawNextPiece() {
    // Clear the canvas
    nextPieceContext.fillStyle = 'BLACK';
    nextPieceContext.fillRect(0, 0, nextPieceCanvas.width, nextPieceCanvas.height);

    const tetromino = nextPiece.tetromino[nextPiece.tetrominoN]; // Use the current rotation for consistency
    const pieceSize = tetromino.length;
    const xOffset = (nextPieceCanvas.width / SQ - pieceSize) / 2;
    const yOffset = (nextPieceCanvas.height / SQ - pieceSize) / 2;


    for (let r = 0; r < pieceSize; r++) {
        for (let c = 0; c < pieceSize; c++) {
            if (tetromino[r][c]) {
                drawSquare(c + xOffset, r + yOffset, nextPiece.color, nextPieceContext);
            }
        }
    }
}

function drawHeldPiece() {
    holdPieceContext.fillStyle = 'BLACK';
    holdPieceContext.fillRect(0, 0, holdPieceCanvas.width, holdPieceCanvas.height);

    if (heldPiece) {
        const tetromino = heldPiece.tetromino[heldPiece.tetrominoN];
        const pieceSize = tetromino.length;
        const xOffset = (holdPieceCanvas.width / SQ - pieceSize) / 2;
        const yOffset = (holdPieceCanvas.height / SQ - pieceSize) / 2;

        for (let r = 0; r < pieceSize; r++) {
            for (let c = 0; c < pieceSize; c++) {
                if (tetromino[r][c]) {
                    drawSquare(c + xOffset, r + yOffset, heldPiece.color, holdPieceContext);
                }
            }
        }
    }
}

// Tetrominoes and their colors
const Z = [
    [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
    [[0, 0, 1], [0, 1, 1], [0, 1, 0]],
    [[0, 0, 0], [1, 1, 0], [0, 1, 1]],
    [[0, 1, 0], [1, 1, 0], [1, 0, 0]]
];

const S = [
    [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
    [[0, 1, 0], [0, 1, 1], [0, 0, 1]],
    [[0, 0, 0], [0, 1, 1], [1, 1, 0]],
    [[1, 0, 0], [1, 1, 0], [0, 1, 0]]
];

const T = [
    [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
    [[0, 1, 0], [0, 1, 1], [0, 1, 0]],
    [[0, 0, 0], [1, 1, 1], [0, 1, 0]],
    [[0, 1, 0], [1, 1, 0], [0, 1, 0]]
];

const O = [
    [[1, 1], [1, 1]]
];

const L = [
    [[0, 0, 1], [1, 1, 1], [0, 0, 0]],
    [[0, 1, 0], [0, 1, 0], [0, 1, 1]],
    [[0, 0, 0], [1, 1, 1], [1, 0, 0]],
    [[1, 1, 0], [0, 1, 0], [0, 1, 0]]
];

const I = [
    [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
    [[0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0]],
    [[0, 0, 0, 0], [0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0]],
    [[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0]]
];

// CORRECTED J PIECE
const J = [
    [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
    [[0, 1, 0], [0, 1, 0], [1, 1, 0]],
    [[0, 0, 0], [1, 1, 1], [0, 0, 1]],
    [[1, 1, 0], [1, 0, 0], [1, 0, 0]]
];


const PIECES = [
    [Z, 'red'],
    [S, 'green'],
    [T, 'yellow'],
    [O, 'blue'],
    [L, 'purple'],
    [I, 'cyan'],
    [J, 'orange'],
];

// generate random pieces
function randomPiece() {
    let r = Math.floor(Math.random() * PIECES.length); // 0 -> 6
    return new Piece(PIECES[r][0], PIECES[r][1]);
}

let p;
let nextPiece;
let heldPiece;
let canHold;
let gameOver;
let score;
let dropStart;
let gameLoop;

// The Object Piece
function Piece(tetromino, color) {
    this.tetromino = tetromino;
    this.color = color;

    this.tetrominoN = 0; // we start from the first pattern
    this.activeTetromino = this.tetromino[this.tetrominoN];

    // we need to control the pieces
    this.x = 3;
    this.y = -2;
}

// fill function
Piece.prototype.fill = function (color) {
    for (let r = 0; r < this.activeTetromino.length; r++) {
        for (let c = 0; c < this.activeTetromino.length; c++) {
            // we draw only occupied squares
            if (this.activeTetromino[r][c]) {
                drawSquare(this.x + c, this.y + r, color);
            }
        }
    }
};

// draw a piece to the board
Piece.prototype.draw = function () {
    this.fill(this.color);
};

// undraw a piece
Piece.prototype.unDraw = function () {
    this.fill(VACANT);
};

// move Down the piece
Piece.prototype.moveDown = function () {
    if (!this.collision(0, 1, this.activeTetromino)) {
        this.unDraw();
        this.y++;
        this.draw();
    } else {
        // we lock the piece and generate a new one
        this.lock();
        if(gameOver) return;
        p = nextPiece;
        nextPiece = randomPiece();
        drawNextPiece();
    }
};

// move Right the piece
Piece.prototype.moveRight = function () {
    if (!this.collision(1, 0, this.activeTetromino)) {
        this.unDraw();
        this.x++;
        this.draw();
    }
};

// move Left the piece
Piece.prototype.moveLeft = function () {
    if (!this.collision(-1, 0, this.activeTetromino)) {
        this.unDraw();
        this.x--;
        this.draw();
    }
};

// rotate the piece
Piece.prototype.rotate = function () {
    let nextPattern = this.tetromino[
        (this.tetrominoN + 1) % this.tetromino.length
    ];
    let kick = 0;

    if (this.collision(0, 0, nextPattern)) {
        if (this.x > COL / 2) {
            // it's the right wall
            kick = -1; // we need to move the piece to the left
        } else {
            // it's the left wall
            kick = 1; // we need to move the piece to the right
        }
    }

    if (!this.collision(kick, 0, nextPattern)) {
        this.unDraw();
        this.x += kick;
        this.tetrominoN = (this.tetrominoN + 1) % this.tetromino.length;
        this.activeTetromino = this.tetromino[this.tetrominoN];
        this.draw();
    }
};

Piece.prototype.lock = function () {
    for (let r = 0; r < this.activeTetromino.length; r++) {
        for (let c = 0; c < this.activeTetromino.length; c++) {
            // we skip the vacant squares
            if (!this.activeTetromino[r][c]) {
                continue;
            }
            // pieces to lock on top = game over
            if (this.y + r < 0) {
                // stop request animation frame
                if(gameLoop) {
                    cancelAnimationFrame(gameLoop);
                }
                gameOver = true;
                bgm.pause();
                alert('Game Over');
                return; // Use return to stop execution
            }
            // we lock the piece
            board[this.y + r][this.x + c] = this.color;
        }
    }
    // remove full rows
    for (let r = 0; r < ROW; r++) {
        let isRowFull = true;
        for (let c = 0; c < COL; c++) {
            isRowFull = isRowFull && board[r][c] != VACANT;
        }
        if (isRowFull) {
            // if the row is full
            // we move down all the rows above it
            for (let y = r; y > 1; y--) {
                for (let c = 0; c < COL; c++) {
                    board[y][c] = board[y - 1][c];
                }
            }
            // the top row board[0][..] has no row above it
            for (let c = 0; c < COL; c++) {
                board[0][c] = VACANT;
            }
            // increment the score
            score += 10;
        }
    }
    // update the board
    drawBoard();

    // update the score
    scoreElement.innerHTML = score;
    canHold = true;
};

// collision function
Piece.prototype.collision = function (x, y, piece) {
    for (let r = 0; r < piece.length; r++) {
        for (let c = 0; c < piece.length; c++) {
            // if the square is empty, we skip it
            if (!piece[r][c]) {
                continue;
            }
            // coordinates of the piece after movement
            let newX = this.x + c + x;
            let newY = this.y + r + y;

            // conditions
            if (newX < 0 || newX >= COL || newY >= ROW) {
                return true;
            }
            // skip newY < 0; board[-1] will crush our game
            if (newY < 0) {
                continue;
            }
            // check if there is a locked piece already in place
            if (board[newY][newX] != VACANT) {
                return true;
            }
        }
    }
    return false;
};

// CONTROL the piece
document.addEventListener('keydown', CONTROL);

function CONTROL(event) {
    if(!p || gameOver) return; // Don't control if no piece or game over
    if (event.keyCode == 37) {
        p.moveLeft();
        dropStart = Date.now();
    } else if (event.keyCode == 38) {
        p.rotate();
        dropStart = Date.now();
    } else if (event.keyCode == 39) {
        p.moveRight();
        dropStart = Date.now();
    } else if (event.keyCode == 40) {
        p.moveDown();
    } else if (event.keyCode == 32) {
        hold();
    }
}

function hold() {
    if (!canHold) return;

    if (!heldPiece) {
        p.unDraw();
        heldPiece = p;
        p = nextPiece;
        nextPiece = randomPiece();
        drawNextPiece();
    } else {
        p.unDraw();
        let temp = p;
        p = heldPiece;
        heldPiece = temp;
        p.x = 3;
        p.y = -2;
    }

    drawHeldPiece();
    p.draw();
    canHold = false;
}

// drop the piece every 1sec
function drop() {
    let now = Date.now();
    let delta = now - dropStart;
    if (delta > 1000) {
        p.moveDown();
        dropStart = Date.now();
    }
    if (!gameOver) {
        gameLoop = requestAnimationFrame(drop);
    }
}

function startGame() {
     // reset score and board
    score = 0;
    scoreElement.innerHTML = score;
    board = [];
    for (let r = 0; r < ROW; r++) {
        board[r] = [];
        for (let c = 0; c < COL; c++) {
            board[r][c] = VACANT;
        }
    }
    drawBoard();

    // generate a new piece
    p = randomPiece();
    nextPiece = randomPiece();
    heldPiece = null;
    canHold = true;
    drawNextPiece();
    drawHeldPiece();

    // start the game
    if(gameLoop) {
        cancelAnimationFrame(gameLoop);
    }
    gameOver = false;
    
    // Play BGM
    bgm.currentTime = 0;
    let playPromise = bgm.play();

    if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log("Playback prevented. Please click the start button again to start music.");
        });
    }
    
    dropStart = Date.now();
    drop();
}

startButton.addEventListener('click', startGame);
