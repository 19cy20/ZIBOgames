const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const speedInput = document.getElementById("speedRange");
const speedValue = document.getElementById("speedValue");
const scoreList = document.getElementById("scoreList");

// Game Settings
const box = 20; // Size of one square
let snake = [];
let food = {};
let score = 0;
let d; // Direction
let game; // The game loop interval
let speed = 100; // Initial speed (ms)

// Load High Scores from Local Storage
let highScores = JSON.parse(localStorage.getItem("snakeHighScores")) || [];

// Mouse Control Variables
canvas.addEventListener("mousedown", handleMouse);

document.addEventListener("keydown", direction);
speedInput.addEventListener("input", function() {
    speedValue.innerText = this.value;
});

function startGame() {
    clearInterval(game);
    snake = [];
    snake[0] = { x: 10 * box, y: 10 * box, color: getRandomColor() };
    score = 0;
    scoreEl.innerText = score;
    d = null; // Wait for input to move
    createFood();
    drawLeaderboard();
    
    // Calculate speed: Higher slider value = Lower interval time (faster)
    let fps = 1000 / (parseInt(speedInput.value) * 2); 
    game = setInterval(draw, fps);
}

function createFood() {
    food = {
        x: Math.floor(Math.random() * (canvas.width / box)) * box,
        y: Math.floor(Math.random() * (canvas.height / box)) * box,
        color: getRandomColor() // Different color food
    };
}

function getRandomColor() {
    // Generates a random bright color
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
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    const head = snake[0];
    
    // Calculate relative position of mouse to snake head
    const diffX = mouseX - head.x;
    const diffY = mouseY - head.y;

    // Determine if the mouse is more horizontal or vertical from the head
    if (Math.abs(diffX) > Math.abs(diffY)) {
        // Horizontal priority
        if (diffX > 0 && d != "LEFT") d = "RIGHT";
        else if (diffX < 0 && d != "RIGHT") d = "LEFT";
    } else {
        // Vertical priority
        if (diffY > 0 && d != "UP") d = "DOWN";
        else if (diffY < 0 && d != "DOWN") d = "UP";
    }
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
    const scoreObj = { score: newScore, date: date };
    highScores.push(scoreObj);
    
    // Sort descending
    highScores.sort((a, b) => b.score - a.score);
    
    // Keep top 50
    highScores.splice(50);
    
    localStorage.setItem("snakeHighScores", JSON.stringify(highScores));
    drawLeaderboard();
}

function drawLeaderboard() {
    scoreList.innerHTML = highScores.map((s, index) => 
        `<li><span>#${index + 1}</span> <span>${s.score} pts</span></li>`
    ).join('');
}

function draw() {
    // Clear screen
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < snake.length; i++) {
        // Use the stored color for each segment, or white for head if you prefer
        ctx.fillStyle = snake[i].color; 
        ctx.fillRect(snake[i].x, snake[i].y, box, box);
        
        ctx.strokeStyle = "black";
        ctx.strokeRect(snake[i].x, snake[i].y, box, box);
    }

    // Draw Food
    ctx.fillStyle = food.color;
    ctx.fillRect(food.x, food.y, box, box);

    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    if (d == "LEFT") snakeX -= box;
    if (d == "UP") snakeY -= box;
    if (d == "RIGHT") snakeX += box;
    if (d == "DOWN") snakeY += box;

    // Logic: If snake eats food
    if (snakeX == food.x && snakeY == food.y) {
        score++;
        scoreEl.innerText = score;
        createFood();
        // Don't pop the tail, so it grows
    } else {
        // Remove the tail
        snake.pop();
    }

    // New Head with a new random color
    let newHead = {
        x: snakeX,
        y: snakeY,
        color: getRandomColor()
    };

    // Game Over Rules
    if (snakeX < 0 || snakeX >= canvas.width || snakeY < 0 || snakeY >= canvas.height || collision(newHead, snake)) {
        clearInterval(game);
        saveScore(score);
        alert("Game Over! Score: " + score);
    }

    snake.unshift(newHead);
}

// Initial Start
startGame();
