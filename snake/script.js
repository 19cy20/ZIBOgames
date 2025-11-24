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
let isGameRunning = false;

// --- NEW: The main color of the snake ---
const defaultColor = "#32CD32"; // Lime Green

// Game Loop Variables
let lastTime = 0; 
let moveTimer = 0;
let moveInterval = 200; 

let highScores = JSON.parse(localStorage.getItem("snakeHighScores")) || [];

// Inputs
canvas.addEventListener("mousedown", handleMouse);
document.addEventListener("keydown", direction);

speedInput.addEventListener("input", function() {
    speedValue.innerText = this.value;
    updateSpeed(this.value);
});

function updateSpeed(val) {
    // Scale 1 (Slow) to 10 (Fast)
    moveInterval = 450 - (val * 40);
}

function resetGame() {
    snake = [];
    // Start with a head + 2 body parts so we can see the snake
    snake[0] = { x: 10 * box, y: 10 * box, color: defaultColor };
    snake[1] = { x: 9 * box, y: 10 * box, color: defaultColor };
    snake[2] = { x: 8 * box, y: 10 * box, color: defaultColor };
    
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
    // Bright, vibrant colors
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
    if (!d && !isGameRunning) resetGame(); 

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

function gameLoop(currentTime) {
    if (!isGameRunning) return;
    window.requestAnimationFrame(gameLoop);

    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;
    moveTimer += deltaTime;

    if (moveTimer > moveInterval) {
        updateGameLogic();
        moveTimer = 0; 
    }
    draw();
}

function updateGameLogic() {
    if (!d) return; 

    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    if (d == "LEFT") snakeX -= box;
    if (d == "UP") snakeY -= box;
    if (d == "RIGHT") snakeX += box;
    if (d == "DOWN") snakeY += box;

    // --- COLOR LOGIC CHANGED HERE ---
    let segmentColor = defaultColor; // Usually, the snake is Green
    
    // Logic: If snake eats food
    if (snakeX == food.x && snakeY == food.y) {
        score++;
        scoreEl.innerText = score;
        segmentColor = food.color; // BUT if we eat, this specific segment takes the food's color
        createFood();
    } else {
        snake.pop();
    }

    let newHead = {
        x: snakeX,
        y: snakeY,
        color: segmentColor // Apply the color determined above
    };

    // Collision
    if (snakeX < 0 || snakeX >= canvas.width || snakeY < 0 || snakeY >= canvas.height || collision(newHead, snake)) {
        isGameRunning = false;
        saveScore(score);
        alert("Game Over! Score: " + score);
        return;
    }

    snake.unshift(newHead);
}

function draw() {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = snake[i].color;
        ctx.fillRect(snake[i].x, snake[i].y, box, box);
        
        // Draw a border around segments so we can see the colors clearly
        ctx.strokeStyle = "#111"; 
        ctx.strokeRect(snake[i].x, snake[i].y, box, box);
    }

    // Draw Food
    ctx.fillStyle = food.color;
    ctx.fillRect(food.x, food.y, box, box);
    
    // Draw a white border around the food to make it pop
    ctx.strokeStyle = "white";
    ctx.strokeRect(food.x, food.y, box, box);
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

drawLeaderboard();
resetGame();
