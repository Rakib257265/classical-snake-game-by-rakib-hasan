const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("startBtn");
const scoreEl = document.getElementById("currentScore");
const highEl = document.getElementById("highScore");
const gameOverScreen = document.getElementById("gameOverScreen");

const gridSize = 20;
let snake, food, specialFood, dx, dy, score, highScore, gameSpeed, gameLoop, isInvincible, isPaused;

highScore = localStorage.getItem("snakeHighScore") || 0;
highEl.innerText = highScore.toString().padStart(3, '0');

function init() {
    // Initial length of 5 segments
    snake = [
        {x: 160, y: 200}, {x: 140, y: 200}, {x: 120, y: 200}, 
        {x: 100, y: 200}, {x: 80, y: 200}
    ];
    dx = gridSize;
    dy = 0;
    score = 0;
    gameSpeed = 120; // Slower start
    isInvincible = false;
    isPaused = true;
    scoreEl.innerText = "000";
    spawnFood();
    specialFood = null;
    draw();
}

function spawnFood() {
    food = {
        x: Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize,
        y: Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize
    };
}

function spawnSpecial() {
    specialFood = {
        x: Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize,
        y: Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize
    };
    setTimeout(() => { specialFood = null; }, 5000); // Disappears after 5s
}

function moveSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // Wrap around logic
    if (head.x < 0) head.x = canvas.width - gridSize;
    else if (head.x >= canvas.width) head.x = 0;
    if (head.y < 0) head.y = canvas.height - gridSize;
    else if (head.y >= canvas.height) head.y = 0;

    snake.unshift(head);

    // Eat Normal Food
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreEl.innerText = score.toString().padStart(3, '0');
        spawnFood();
        if (score % 50 === 0) spawnSpecial();
        if (gameSpeed > 50) gameSpeed -= 2; // Increase speed
    } 
    // Eat Special Food
    else if (specialFood && head.x === specialFood.x && head.y === specialFood.y) {
        activateInvincibility();
        specialFood = null;
    } else {
        snake.pop();
    }
}

function activateInvincibility() {
    isInvincible = true;
    setTimeout(() => { isInvincible = false; }, 10000);
}

function checkCollision() {
    if (isInvincible) return false;
    for (let i = 4; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) return true;
    }
    return false;
}

function draw() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Food (Yellow Apple style)
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.arc(food.x + 10, food.y + 10, 8, 0, Math.PI * 2);
    ctx.fill();

    // Draw Special Food (Pink)
    if (specialFood) {
        ctx.fillStyle = "#ff69b4";
        ctx.beginPath();
        ctx.arc(specialFood.x + 10, specialFood.y + 10, 10, 0, Math.PI * 2);
        ctx.fill();
    }

    // Draw Snake
    snake.forEach((part, index) => {
        const isHead = index === 0;
        ctx.fillStyle = isInvincible ? "#00ffff" : "green";
        
        // Rounded body
        ctx.beginPath();
        ctx.roundRect(part.x + 1, part.y + 1, gridSize - 2, gridSize - 2, 5);
        ctx.fill();

        if (isHead) {
            // Eyes
            ctx.fillStyle = "white";
            ctx.fillRect(part.x + 4, part.y + 4, 4, 4);
            ctx.fillRect(part.x + 12, part.y + 4, 4, 4);
            // Tongue (Red)
            ctx.fillStyle = "red";
            if (dx > 0) ctx.fillRect(part.x + 20, part.y + 8, 6, 4);
            else if (dx < 0) ctx.fillRect(part.x - 6, part.y + 8, 6, 4);
            else if (dy > 0) ctx.fillRect(part.x + 8, part.y + 20, 4, 6);
            else if (dy < 0) ctx.fillRect(part.x + 8, part.y - 6, 4, 6);
        }
    });
}

function main() {
    if (isPaused) return;
    if (checkCollision()) {
        endGame();
        return;
    }

    moveSnake();
    draw();
    setTimeout(main, gameSpeed);
}

function endGame() {
    gameOverScreen.classList.remove("hidden");
    if (score > highScore) {
        highScore = score;
        localStorage.setItem("snakeHighScore", highScore);
        highEl.innerText = highScore.toString().padStart(3, '0');
    }
}

function resetGame() {
    gameOverScreen.classList.add("hidden");
    init();
    isPaused = false;
    main();
}

// Controls
startBtn.addEventListener("click", () => {
    if (isPaused) {
        isPaused = false;
        startBtn.innerText = "STOP";
        main();
    } else {
        isPaused = true;
        startBtn.innerText = "RESUME";
    }
});

const handleInput = (dir) => {
    if (dir === 'UP' && dy === 0) { dx = 0; dy = -gridSize; }
    if (dir === 'DOWN' && dy === 0) { dx = 0; dy = gridSize; }
    if (dir === 'LEFT' && dx === 0) { dx = -gridSize; dy = 0; }
    if (dir === 'RIGHT' && dx === 0) { dx = gridSize; dy = 0; }
};

window.addEventListener("keydown", e => {
    const key = e.key.replace('Arrow', '').toUpperCase();
    handleInput(key);
});

// Mobile Buttons
document.getElementById("upBtn").onclick = () => handleInput('UP');
document.getElementById("downBtn").onclick = () => handleInput('DOWN');
document.getElementById("leftBtn").onclick = () => handleInput('LEFT');
document.getElementById("rightBtn").onclick = () => handleInput('RIGHT');

init();