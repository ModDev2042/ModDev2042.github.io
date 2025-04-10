<!DOCTYPE html>
<html>
<head>
    <title>Advanced Platformer</title>
    <style>
        body {
            margin: 0;
            overflow: hidden;
            background-color: #222;
            font-family: 'Arial', sans-serif;
        }
        canvas {
            display: block;
            margin: 0 auto;
            background-color: #87CEEB;
            box-shadow: 0 0 20px rgba(0,0,0,0.5);
        }
        #gameUI {
            position: absolute;
            top: 10px;
            left: 10px;
            color: white;
            text-shadow: 2px 2px 4px #000;
            pointer-events: none;
        }
        #startScreen {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.7);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: white;
        }
        button {
            padding: 10px 20px;
            font-size: 18px;
            margin: 10px;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }
        button:hover {
            background: #45a049;
        }
    </style>
</head>
<body>
    <div id="gameUI">
        <h2>Level: <span id="levelDisplay">1</span></h2>
        <h2>Score: <span id="scoreDisplay">0</span></h2>
        <h2>Coins: <span id="coinDisplay">0</span>/<span id="totalCoins">0</span></h2>
        <h2>Health: <span id="healthDisplay">3</span></h2>
    </div>
    
    <canvas id="gameCanvas" width="800" height="500"></canvas>
    
    <div id="startScreen">
        <h1>ADVANCED PLATFORMER</h1>
        <p>Use arrow keys to move. Space to jump. Collect coins, avoid enemies!</p>
        <button id="startButton">Start Game</button>
    </div>

    <script>
        // Game canvas setup
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const startScreen = document.getElementById('startScreen');
        const startButton = document.getElementById('startButton');

        // Game assets
        const playerImg = new Image();
        playerImg.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMCA1MCI+PHJlY3Qgd2lkdGg9IjMwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjRkYwMDAwIi8+PGNpcmNsZSBjeD0iMTUiIGN5PSIxNSIgcj0iMTAiIGZpbGw9IiNGRkZGMDAiLz48cmVjdCB4PSIxMCIgeT0iMzUiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxNSIgZmlsbD0iIzAwMDAwMCIvPjwvc3ZnPg==';

        const coinImg = new Image();
        coinImg.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMCAyMCI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iOCIgZmlsbD0iI0ZGQ0MwMCIgc3Ryb2tlPSIjQ0M5QTAwIiBzdHJva2Utd2lkdGg9IjIiLz48Y2lyY2xlIGN4PSIxMCIgY3k9IjEwIiByPSI1IiBmaWxsPSJub25lIiBzdHJva2U9IiNGRkZGMDAiIHN0cm9rZS13aWR0aD0iMSIvPjwvc3ZnPg==';

        const enemyImg = new Image();
        enemyImg.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMCAzMCI+PGNpcmNsZSBjeD0iMTUiIGN5PSIxNSIgcj0iMTUiIGZpbGw9IiNGRjAwODAiLz48Y2lyY2xlIGN4PSIxMCIgY3k9IjEwIiByPSIyIiBmaWxsPSIjRkZGRkZGIi8+PGNpcmNsZSBjeD0iMjAiIGN5PSIxMCIgcj0iMiIgZmlsbD0iI0ZGRkZGRiIvPjxwYXRoIGQ9Ik0xMCAxOCBRMTUgMjAgMjAgMTgiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+PC9zdmc+';

        // Game state
        const game = {
            gravity: 0.5,
            friction: 0.85,
            levels: [
                {
                    platforms: [
                        { x: 0, y: 450, width: 200, height: 20, color: '#2E8B57' },
                        { x: 250, y: 400, width: 200, height: 20, color: '#2E8B57' },
                        { x: 500, y: 350, width: 200, height: 20, color: '#2E8B57' },
                        { x: 300, y: 250, width: 200, height: 20, color: '#2E8B57' },
                        { x: 50, y: 200, width: 200, height: 20, color: '#2E8B57' },
                        { x: 550, y: 150, width: 200, height: 20, color: '#2E8B57' }
                    ],
                    coins: [
                        { x: 100, y: 400, width: 20, height: 20, collected: false },
                        { x: 350, y: 350, width: 20, height: 20, collected: false },
                        { x: 600, y: 300, width: 20, height: 20, collected: false },
                        { x: 400, y: 200, width: 20, height: 20, collected: false },
                        { x: 150, y: 150, width: 20, height: 20, collected: false }
                    ],
                    enemies: [
                        { x: 300, y: 380, width: 30, height: 30, speed: 2, direction: 1, minX: 250, maxX: 450 }
                    ],
                    goal: { x: 650, y: 100, width: 50, height: 50 }
                },
                {
                    platforms: [
                        { x: 0, y: 450, width: 150, height: 20, color: '#4682B4' },
                        { x: 200, y: 400, width: 150, height: 20, color: '#4682B4' },
                        { x: 400, y: 350, width: 150, height: 20, color: '#4682B4' },
                        { x: 600, y: 300, width: 150, height: 20, color: '#4682B4' },
                        { x: 0, y: 250, width: 150, height: 20, color: '#4682B4' },
                        { x: 200, y: 200, width: 150, height: 20, color: '#4682B4' }
                    ],
                    coins: [
                        { x: 75, y: 400, width: 20, height: 20, collected: false },
                        { x: 275, y: 350, width: 20, height: 20, collected: false },
                        { x: 475, y: 300, width: 20, height: 20, collected: false },
                        { x: 675, y: 250, width: 20, height: 20, collected: false },
                        { x: 75, y: 200, width: 20, height: 20, collected: false }
                    ],
                    enemies: [
                        { x: 225, y: 380, width: 30, height: 30, speed: 3, direction: 1, minX: 200, maxX: 350 },
                        { x: 475, y: 330, width: 30, height: 30, speed: 2, direction: -1, minX: 400, maxX: 550 }
                    ],
                    goal: { x: 125, y: 150, width: 50, height: 50 }
                }
            ],
            currentLevel: 0,
            player: {
                x: 50,
                y: 100,
                width: 30,
                height: 50,
                velocityX: 0,
                velocityY: 0,
                speed: 6,
                jumpForce: 14,
                isJumping: false,
                health: 3,
                invincible: false,
                invincibleTimer: 0
            },
            keys: {
                left: false,
                right: false,
                up: false
            },
            score: 0,
            coinsCollected: 0,
            gameRunning: false,
            animationFrame: 0,
            particles: []
        };

        // Event listeners
        window.addEventListener('keydown', function(e) {
            if (!game.gameRunning) return;
            
            switch(e.key) {
                case 'ArrowLeft':
                    game.keys.left = true;
                    break;
                case 'ArrowRight':
                    game.keys.right = true;
                    break;
                case 'ArrowUp':
                case ' ':
                    game.keys.up = true;
                    break;
            }
        });

        window.addEventListener('keyup', function(e) {
            switch(e.key) {
                case 'ArrowLeft':
                    game.keys.left = false;
                    break;
                case 'ArrowRight':
                    game.keys.right = false;
                    break;
                case 'ArrowUp':
                case ' ':
                    game.keys.up = false;
                    break;
            }
        });

        startButton.addEventListener('click', function() {
            startScreen.style.display = 'none';
            startGame();
        });

        // Collision detection
        function checkCollision(obj1, obj2) {
            return obj1.x < obj2.x + obj2.width &&
                   obj1.x + obj1.width > obj2.x &&
                   obj1.y < obj2.y + obj2.height &&
                   obj1.y + obj1.height > obj2.y;
        }

        // Create particles
        function createParticles(x, y, color, count) {
            for (let i = 0; i < count; i++) {
                game.particles.push({
                    x: x,
                    y: y,
                    size: Math.random() * 5 + 2,
                    color: color,
                    velocityX: Math.random() * 6 - 3,
                    velocityY: Math.random() * 6 - 3,
                    life: 30
                });
            }
        }

        // Update particles
        function updateParticles() {
            for (let i = 0; i < game.particles.length; i++) {
                const p = game.particles[i];
                p.x += p.velocityX;
                p.y += p.velocityY;
                p.life--;
                
                if (p.life <= 0) {
                    game.particles.splice(i, 1);
                    i--;
                }
            }
        }

        // Draw particles
        function drawParticles() {
            for (const p of game.particles) {
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.life / 30;
                ctx.fillRect(p.x, p.y, p.size, p.size);
            }
            ctx.globalAlpha = 1;
        }

        // Reset level
        function resetLevel() {
            const level = game.levels[game.currentLevel];
            game.player.x = 50;
            game.player.y = 100;
            game.player.velocityX = 0;
            game.player.velocityY = 0;
            game.player.isJumping = false;
            game.player.invincible = true;
            game.player.invincibleTimer = 60;
            
            // Reset coins
            for (const coin of level.coins) {
                coin.collected = false;
            }
            
            game.coinsCollected = 0;
            updateUI();
        }

        // Next level
        function nextLevel() {
            game.currentLevel++;
            if (game.currentLevel >= game.levels.length) {
                // Game completed
                game.gameRunning = false;
                startScreen.style.display = 'flex';
                startScreen.innerHTML = `
                    <h1>GAME COMPLETED!</h1>
                    <p>Final Score: ${game.score}</p>
                    <button id="restartButton">Play Again</button>
                `;
                document.getElementById('restartButton').addEventListener('click', function() {
                    startScreen.style.display = 'none';
                    game.currentLevel = 0;
                    game.score = 0;
                    game.player.health = 3;
                    startGame();
                });
                return;
            }
            
            resetLevel();
        }

        // Update UI
        function updateUI() {
            document.getElementById('levelDisplay').textContent = game.currentLevel + 1;
            document.getElementById('scoreDisplay').textContent = game.score;
            document.getElementById('coinDisplay').textContent = game.coinsCollected;
            document.getElementById('totalCoins').textContent = game.levels[game.currentLevel].coins.length;
            document.getElementById('healthDisplay').textContent = game.player.health;
        }

        // Game loop
        function gameLoop() {
            if (!game.gameRunning) return;
            
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Get current level
            const level = game.levels[game.currentLevel];
            
            // Handle player movement
            if (game.keys.left) {
                game.player.velocityX = -game.player.speed;
            } else if (game.keys.right) {
                game.player.velocityX = game.player.speed;
            } else {
                game.player.velocityX *= game.friction;
            }
            
            // Handle jumping
            if (game.keys.up && !game.player.isJumping) {
                game.player.velocityY = -game.player.jumpForce;
                game.player.isJumping = true;
                createParticles(game.player.x + game.player.width/2, game.player.y + game.player.height, '#FF0000', 10);
            }
            
            // Apply gravity
            game.player.velocityY += game.gravity;
            
            // Update player position
            game.player.x += game.player.velocityX;
            game.player.y += game.player.velocityY;
            
            // Check for collisions with platforms
            let onPlatform = false;
            for (let platform of level.platforms) {
                if (checkCollision(game.player, platform)) {
                    // Check if player is landing on top of platform
                    if (game.player.velocityY > 0 && game.player.y + game.player.height < platform.y + platform.height/2) {
                        game.player.y = platform.y - game.player.height;
                        game.player.velocityY = 0;
                        game.player.isJumping = false;
                        onPlatform = true;
                    }
                }
            }
            
            // If not on a platform, player is jumping/falling
            if (!onPlatform) {
                game.player.isJumping = true;
            }
            
            // Boundary checks
            if (game.player.x < 0) game.player.x = 0;
            if (game.player.x + game.player.width > canvas.width) {
                game.player.x = canvas.width - game.player.width;
            }
            
            // Check if player fell off the screen
            if (game.player.y > canvas.height) {
                game.player.health--;
                if (game.player.health <= 0) {
                    // Game over
                    game.gameRunning = false;
                    startScreen.style.display = 'flex';
                    startScreen.innerHTML = `
                        <h1>GAME OVER</h1>
                        <p>Score: ${game.score}</p>
                        <button id="restartButton">Try Again</button>
                    `;
                    document.getElementById('restartButton').addEventListener('click', function() {
                        startScreen.style.display = 'none';
                        game.currentLevel = 0;
                        game.score = 0;
                        game.player.health = 3;
                        startGame();
                    });
                    return;
                } else {
                    resetLevel();
                    return;
                }
            }
            
            // Update enemies
            for (let enemy of level.enemies) {
                enemy.x += enemy.speed * enemy.direction;
                
                // Change direction if at boundary
                if (enemy.x <= enemy.minX || enemy.x + enemy.width >= enemy.maxX) {
                    enemy.direction *= -1;
                }
                
                // Check collision with player
                if (!game.player.invincible && checkCollision(game.player, enemy)) {
                    game.player.health--;
                    game.player.invincible = true;
                    game.player.invincibleTimer = 120; // 2 seconds of invincibility
                    createParticles(game.player.x + game.player.width/2, game.player.y + game.player.height/2, '#FF0000', 20);
                    
                    if (game.player.health <= 0) {
                        // Game over
                        game.gameRunning = false;
                        startScreen.style.display = 'flex';
                        startScreen.innerHTML = `
                            <h1>GAME OVER</h1>
                            <p>Score: ${game.score}</p>
                            <button id="restartButton">Try Again</button>
                        `;
                        document.getElementById('restartButton').addEventListener('click', function() {
                            startScreen.style.display = 'none';
                            game.currentLevel = 0;
                            game.score = 0;
                            game.player.health = 3;
                            startGame();
                        });
                        return;
                    }
                    
                    updateUI();
                }
            }
            
            // Check coin collection
            for (let coin of level.coins) {
                if (!coin.collected && checkCollision(game.player, coin)) {
                    coin.collected = true;
                    game.score += 100;
                    game.coinsCollected++;
                    createParticles(coin.x + coin.width/2, coin.y + coin.height/2, '#FFD700', 15);
                    updateUI();
                }
            }
            
            // Check if reached goal
            if (checkCollision(game.player, level.goal)) {
                game.score += 500;
                createParticles(level.goal.x + level.goal.width/2, level.goal.y + level.goal.height/2, '#00FF00', 30);
                setTimeout(nextLevel, 500);
            }
            
            // Update invincibility timer
            if (game.player.invincible) {
                game.player.invincibleTimer--;
                if (game.player.invincibleTimer <= 0) {
                    game.player.invincible = false;
                }
            }
            
            // Update particles
            updateParticles();
            
            // Draw everything
            drawGame(level);
            
            // Continue game loop
            game.animationFrame++;
            requestAnimationFrame(gameLoop);
        }

        // Draw game elements
        function drawGame(level) {
            // Draw background
            ctx.fillStyle = '#87CEEB';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw platforms
            for (let platform of level.platforms) {
                ctx.fillStyle = platform.color;
                ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
                
                // Add some texture
                ctx.fillStyle = '#000000';
                ctx.globalAlpha = 0.1;
                for (let i = 0; i < platform.width; i += 10) {
                    ctx.fillRect(platform.x + i, platform.y, 5, platform.height);
                }
                ctx.globalAlpha = 1;
            }
            
            // Draw coins
            for (let coin of level.coins) {
                if (!coin.collected) {
                    ctx.drawImage(coinImg, coin.x, coin.y, coin.width, coin.height);
                    
                    // Add shine animation
                    if (game.animationFrame % 20 < 10) {
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                        ctx.beginPath();
                        ctx.arc(coin.x + coin.width/2, coin.y + coin.height/2, coin.width/3, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            }
            
            // Draw enemies
            for (let enemy of level.enemies) {
                ctx.drawImage(enemyImg, enemy.x, enemy.y, enemy.width, enemy.height);
                
                // Add blinking eyes
                if (game.animationFrame % 30 < 15) {
                    ctx.fillStyle = '#FF0000';
                    ctx.beginPath();
                    ctx.arc(enemy.x + 10, enemy.y + 10, 2, 0, Math.PI * 2);
                    ctx.arc(enemy.x + 20, enemy.y + 10, 2, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            
            // Draw goal
            ctx.fillStyle = '#00FF00';
            ctx.fillRect(level.goal.x, level.goal.y, level.goal.width, level.goal.height);
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('GOAL', level.goal.x + level.goal.width/2, level.goal.y + level.goal.height/2 + 7);
            ctx.textAlign = 'left';
            
            // Draw player
            if (!game.player.invincible || Math.floor(game.animationFrame / 5) % 2 === 0) {
                ctx.drawImage(playerImg, game.player.x, game.player.y, game.player.width, game.player.height);
            }
            
            // Draw particles
            drawParticles();
        }

        // Start game
        function startGame() {
            game.gameRunning = true;
            resetLevel();
            gameLoop();
        }

        // Initialize UI
        updateUI();
    </script>
</body>
</html>
