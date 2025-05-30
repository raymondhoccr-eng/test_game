const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    let score = 0;
    let ball = { x: 200, y: 550, radius: 10, vx: 0, vy: 0, launched: false };
    let bumpers = [
      { x: 100, y: 200, r: 25 },
      { x: 300, y: 250, r: 25 },
      { x: 200, y: 350, r: 30 }
    ];
    let flipper = { x: 200, y: 880, w: 80, h: 10, angle: 0, speed: 8 };
    flipper.halfW = flipper.w / 2;
    flipper.halfH = flipper.h / 2;
    let gravity = 0.05;
    let moveLeft = false, moveRight = false;
    let gameOver = false;

    function drawBall() {
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#0ff';
      ctx.fill();
      ctx.closePath();
    }

    function drawBumpers() {
      bumpers.forEach(b => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = '#ff0';
        ctx.fill();
        ctx.closePath();
      });
    }

    function drawFlipper() {
      ctx.save();
      ctx.translate(flipper.x, flipper.y);
      ctx.rotate(flipper.angle);
      ctx.fillStyle = '#f0f';
      ctx.fillRect(-flipper.halfW, -flipper.halfH, flipper.w, flipper.h);
      ctx.restore();
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawBall();
      drawBumpers();
      drawFlipper();
    }

    function update() {
      if (moveLeft) flipper.x = Math.max(flipper.halfW, flipper.x - flipper.speed);
      if (moveRight) flipper.x = Math.min(canvas.width - flipper.halfW, flipper.x + flipper.speed);
      if (!ball.launched) return;
      ball.vy += gravity;
      ball.x += ball.vx;
      ball.y += ball.vy;
      // 碰撞邊界
      if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
        ball.vx *= -0.8;
        ball.x = Math.max(ball.radius, Math.min(canvas.width - ball.radius, ball.x));
      }
      if (ball.y - ball.radius < 0) {
        ball.vy *= -0.8;
        ball.y = ball.radius;
      }
      // 碰撞 flipper
      if (
        ball.y + ball.radius > flipper.y - flipper.halfH &&
        ball.x > flipper.x - flipper.halfW &&
        ball.x < flipper.x + flipper.halfW &&
        ball.vy > 0
      ) {
        ball.vy = -Math.abs(ball.vy) * 0.9;
        ball.y = flipper.y - flipper.halfH - ball.radius;
      }
      // 碰撞 bumpers
      bumpers.forEach(b => {
        let dx = ball.x - b.x;
        let dy = ball.y - b.y;
        let distSq = dx*dx + dy*dy;
        let radiiSumSq = (ball.radius + b.r) * (ball.radius + b.r);
        if (distSq < radiiSumSq) {
          let angle = Math.atan2(dy, dx);
          ball.vx += Math.cos(angle) * 2;
          ball.vy += Math.sin(angle) * 2;
          score += 10;
          scoreElement.innerText = '分數：' + score;
        }
      });
      // 遊戲結束
      if (ball.y - ball.radius > canvas.height) {
        gameOver = true;
        ball.launched = false;
        setTimeout(() => {
          alert('遊戲結束！分數：' + score);
          resetGame();
        }, 100);
      }
    }

    function resetGame() {
      score = 0;
      scoreElement.innerText = '分數：0';
      ball = { x: 200, y: 550, radius: 10, vx: 0, vy: 0, launched: false };
      gameOver = false;
    }

    function gameLoop() {
      update();
      draw();
      requestAnimationFrame(gameLoop);
    }

    canvas.addEventListener('click', function(e) {
      if (!ball.launched && !gameOver) {
        ball.vx = (Math.random() - 0.5) * 4;
        ball.vy = -8 - Math.random() * 2;
        ball.launched = true;
      }
    });
    document.addEventListener('keydown', function(e) {
      if (e.repeat) return;
      if (e.code === 'Space' && ball.launched) {
        flipper.angle = -0.5;
        setTimeout(() => { flipper.angle = 0; }, 120);
        if (
          ball.y + ball.radius > flipper.y - flipper.halfH &&
          ball.x > flipper.x - flipper.halfW &&
          ball.x < flipper.x + flipper.halfW &&
          ball.vy > 0
        ) {
          ball.vy = -10;
        }
      }
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') moveLeft = true;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') moveRight = true;
    });
    document.addEventListener('keyup', function(e) {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') moveLeft = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') moveRight = false;
    });
    gameLoop();
