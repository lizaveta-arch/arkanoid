const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const paddle = {
    x: 350,
    y: 570,
    width: 100,
    height: 15
};

const ball = {
    x: 400,
    y: 550,
    radius: 8,
    color: 'white',
    dx: 3,
    dy: -3
};

let score = 0;
let lives = 3;
let gameOver = false;
let win = false;
let respawnTimer = 0;
let isRespawning = false;

const bricks = [];
const rows = 5;
const cols = 8;
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 40;
const brickOffsetLeft = 35;

const colors = ['#8BC34A', '#689F38', '#4CAF50', '#388E3C', '#1B5E20'];

function createBricks() {
    for (let r = 0; r < rows; r++) {
        for ( let c = 0; c < cols; c++) {
            const x = c * (brickWidth + brickPadding) + brickOffsetLeft;
            const y = r * (brickHeight + brickPadding) + brickOffsetTop;
            bricks.push({
                x: x,
                y: y,
                width: brickWidth,
                height: brickHeight,
                color: colors[r % colors.length],
                alive: true
            });
        }
    }
}

createBricks();

function draw(){
    ctx.fillStyle = '#0f0f1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let brick of bricks) {
        if (brick.alive) {
            ctx.fillStyle = brick.color;
            ctx.shadowColor = brick.color;
            ctx.shadowBlur = 10;
            ctx.fillRect(brick.x, brick.y, brick.width, brick.height);

            ctx.shadowBlur = 0;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.fillRect(brick.x + 5, brick.y + 3, brick.width - 10, brick.height / 3);
        }
    }
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#002137'
    ctx.shadowColor = '#00bfff'
    ctx.shadowBlur = 15,
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.shadowBlur = 0;

    ctx.fillStyle = ball.color;
    ctx.shadowColor = 'white'
    ctx.shadowBlur = 20,
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.shadowBlur = 0;
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText('Счет: ' + score, 20, 30);
    ctx.fillText('Жизни: ' + lives, canvas.width - 120, 30);

    if(isRespawning) {
        const seconds = Math.ceil(respawnTimer / 60);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Ждите ' + seconds, canvas.width / 2, canvas.height / 2 - 50);
        ctx.textAlign = 'left';
    }

    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.textAlign = 'center';
        if (win) {
            ctx.fillStyle = '#66FF66';
            ctx.font = '48px Arial';
            ctx.fillText('Победа!', canvas.width / 2, canvas.height / 2 - 20);
            ctx.fillStyle = 'white';
            ctx.font = '24px Arial';
            ctx.fillText('Вы разбили все кирпичи!', canvas.width / 2, canvas.height / 2 + 40);
        } else {
            ctx.fillStyle = 'white';
            ctx.font = '48px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Игра окончена ', canvas.width / 2, canvas.height / 2 - 20);
            ctx.font = '24px Arial';
            ctx.fillText('Нажмите R для перезапуска', canvas.width / 2, canvas.height / 2 + 40);
            ctx.textAlign = 'left';
        }
    }

}

function update() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.x - ball.radius < 0) {
        ball.x = ball.radius;
        ball.dx = -ball.dx;
    }

    if (ball.x + ball.radius > canvas.width) {
        ball.x = canvas.width - ball.radius;
        ball.dx = -ball.dx;
    }

    if (isRespawning) {
        respawnTimer--;
        if (respawnTimer <= 0) {
            ball.x = paddle.x + paddle.width / 2;
            ball.y = paddle.y - ball.radius;
            ball.dx = 3;
            ball.dy = -3;
            isRespawning = false;
        }
    }


    if (ball.y + ball.radius < 0) {
        ball.y = ball.radius;
        ball.dy = -ball.dy;
    }

    if (ball.dy > 0) {
        if (ball.y + ball.radius > paddle.y &&
        ball.y + ball.radius < paddle.y + paddle.height + 10) {
            if (ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
                ball.dy = -ball.dy;
                ball.y = paddle.y - ball.radius;
            }
        }
    }

    for (let i = 0; i < bricks.length; i++) {
        const brick = bricks[i];
        if (!brick.alive) continue;

        if (ball.x + ball.radius > brick.x &&
            ball.x - ball.radius < brick.x + brick.width &&
            ball.y + ball.radius > brick.y &&
            ball.y - ball.radius < brick.y + brick.height) {
            
                const overlaX = Math.min(ball.x + ball.radius - brick.x, brick.x + brick.width - (ball.x - ball.radius));
                const overlaY = Math.min(ball.y + ball.radius - brick.y, brick.y + brick.height - (ball.y - ball.radius));

                if (overlaX < overlaY) {
                    ball.dx = -ball.dx;
                } else {
                    ball.dy = -ball.dy;
                }

                brick.alive = false;
                score += 10;
                break;
            }
    }

    const allBrickDestroyed = bricks.every(brick => !brick.alive);
    if (allBrickDestroyed && bricks.length > 0) {
        win = true;
        gameOver = true;
        ball.dx = 0;
        ball.dy = 0;
        console.log('Победа!')
    }

    if (ball.y + ball.radius > canvas.height && !isRespawning && !gameOver) {
        lives--;
        if (lives > 0) {
            isRespawning = true;
            respawnTimer = 180;
            ball.dx = 0;
            ball.dy = 0;
            ball.x = -100;
            ball.y = -100;
        } else {
            gameOver = true;
            win = false;
            ball.dx = 0;
            ball.dy = 0;
            console.log('Game Over!');
        }
    }
}

document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft') {
        paddle.x -= 10;
        if (paddle.x < 0) paddle.x = 0;
    }
    if (e.key === 'ArrowRight') {
        paddle.x += 10;
        if (paddle.x + paddle.width > canvas.width) {
            paddle.x = canvas.width - paddle.width;
        }
    }

    if (e.key === 'r' || e.key === 'R') {
        resetGame();
    }
})

function resetGame() {
    bricks.length = 0;
    createBricks();

    ball.x = 400;
    ball.y = 550;
    ball.dx = 3;
    ball.dy = -3;

    paddle.x = 350;

    score = 0;
    lives = 3;
    gameOver = false;
    win = false;
    isRespawning = false;
    respawnTimer = 0;
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();