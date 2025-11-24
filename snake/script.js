const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const speedInput = document.getElementById("speedRange");
const speedValue = document.getElementById("speedValue");
const scoreList = document.getElementById("scoreList");

// Game Settings
const box = 20; 
let snake = [];
let food = {};
let score = 0;
let d; 
let currentSnakeColor = "white"; // Stores the color of the last food eaten
let isGameRunning = false;

// Game Loop Variables
let lastTime = 0; 
let moveTimer = 0;
let moveInterval = 200; // Time in ms between snake moves (controlled by slider)

// Load High Scores
let highScores = JSON.parse(localStorage.getItem("snakeHighScores")) || [];

// Inputs
canvas.addEventListener("mousedown", handleMouse);
document.addEventListener("keydown", direction);

// Update slider display and speed logic instantly
speedInput.addEventListener("input", function() {
    speedValue.innerText = this.value;
    updateSpeed(this.value);
});

function updateSpeed(val) {
    // Level 1 = 400ms delay (Slow), Level 10 = 60ms delay (Fast)
    // Formula: Start at 450, subtract roughly 40ms per level
    moveInterval = 450 - (val * 40);
}

function resetGame() {
    snake = [];
    snake[0] = { x: 10 * box, y: 10 * box, color: "white" };
    currentSnakeColor = "white";
    
    score = 0;
    scoreEl.innerText = score;
    d = null; 
    
    createFood();
    drawLeaderboard();
    updateSpeed(speedInput.value);
    
    if (!isGameRunning) {
        isGameRunning = true;
        requestAnimationFrame(gameLoop);
    }
}

function createFood() {
    food = {
        x: Math.floor(Math.random() * (canvas.width / box)) * box,
        y: Math.floor(Math.random() * (canvas.height / box)) * box,
        color: getRandomColor() 
    };
}

function getRandomColor() {
    return `hsl(${Math.random() * 360}, 100%, 50%)`;
}

function direction(event) {
    let key = event.keyCode;
    if (key == 37 && d != "RIGHT") d = "LEFT";
    else if (key == 38 && d != "DOWN") d = "UP";
    else if (key == 39 && d != "LEFT") d = "RIGHT";
    else if (key == 40 && d != "UP") d = "DOWN";
}

function handleMouse(event) {
    if (!d && !isGameRunning) resetGame(); // Click to start if idle

    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const head = snake[0];
    const diffX = mouseX - head.x;
    const diffY = mouseY - head.y;

    if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 0 && d != "LEFT") d = "RIGHT";
        else if (diffX < 0 && d != "RIGHT") d = "LEFT";
    } else {
        if (diffY > 0 && d != "UP") d = "DOWN";
        else if (diffY < 0 && d != "DOWN") d = "UP";
    }
}

// --- THE NEW GAME LOOP ---
function gameLoop(currentTime) {
    if (!isGameRunning) return;

    window.requestAnimationFrame(gameLoop);

    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    // Accumulate time
    moveTimer += deltaTime;

    // Only MOVE the snake if enough time has passed (controlled by slider)
    if (moveTimer > moveInterval) {
        updateGameLogic();
        moveTimer = 0; 
    }

    // Draw every single frame (60fps) so controls feel responsive
    draw();
}

function updateGameLogic() {
    if (!d) return; // Don't update if game hasn't started moving

    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    if (d == "LEFT") snakeX -= box;
    if (d == "UP") snakeY -= box;
    if (d == "RIGHT") snakeX += box;
    if (d == "DOWN") snakeY += box;

    // Eating Food
    if (snakeX == food.x && snakeY == food.y) {
        score++;
        scoreEl.innerText = score;
        currentSnakeColor = food.color; // Update snake color to match food
        createFood();
    } else {
        snake.pop();
    }

    let newHead = {
        x: snakeX,
        y: snakeY,
        color: currentSnakeColor // Head takes the currently active color
    };

    // Collision Detection
    if (snakeX < 0 || snakeX >= canvas.width || snakeY < 0 || snakeY >= canvas.height || collision(newHead, snake)) {
        isGameRunning = false;
        saveScore(score);
        alert("Game Over! Score: " + score);
        return;
    }

    snake.unshift(newHead);
}

function draw() {
    // Clear screen
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Snake
    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = snake[i].color;
        ctx.fillRect(snake[i].x, snake[i].y, box, box);
        ctx.strokeStyle = "black";
        ctx.strokeRect(snake[i].x, snake[i].y, box, box);
    }

    // Draw Food
    ctx.fillStyle = food.color;
    ctx.fillRect(food.x, food.y, box, box);
}

function collision(newHead, array) {
    for (let i = 0; i < array.length; i++) {
        if (newHead.x == array[i].x && newHead.y == array[i].y) {
            return true;
        }
    }
    return false;
}

function saveScore(newScore) {
    const date = new Date().toLocaleDateString();
    highScores.push({ score: newScore, date: date });
    highScores.sort((a, b) => b.score - a.score);
    highScores.splice(50);
    localStorage.setItem("snakeHighScores", JSON.stringify(highScores));
    drawLeaderboard();
}

function drawLeaderboard() {
    scoreList.innerHTML = highScores.map((s, index) => 
        `<li><span>#${index + 1}</span> <span>${s.score} pts</span></li>`
    ).join('');
}

// Initial Load
drawLeaderboard();
resetGame();
