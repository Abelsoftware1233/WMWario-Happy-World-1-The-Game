<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Super Mario (Werkende Game Engine)</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
        
        html, body {
            margin: 0;
            padding: 0;
            font-family: 'Inter', sans-serif;
            overflow: hidden;
            height: 100%;
        }

        body {
            background-color: #1a202c;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 1rem;
            box-sizing: border-box;
        }

        .game-container {
            border: 4px solid #4a5568;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
            max-width: 90vw; /* Responsive width */
        }

        canvas {
            display: block;
            /* De canvas wordt geschaald met ctx.scale(3,3), dus de interne resolutie is 256x240 */
            width: 768px; /* 256 * 3 */
            height: 720px; /* 240 * 3 */
            background-color: #63b3ed;
            image-rendering: pixelated;
        }

        .info {
            background-color: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 0.75rem 1.25rem;
            border-radius: 8px;
            font-size: 0.875rem;
            margin-top: 1rem;
            text-align: center;
        }
        
        .info h3 {
            font-weight: bold;
            margin-bottom: 0.5rem;
            color: #a0aec0;
        }
    </style>
</head>
<body class="bg-gray-900 text-white font-inter">

    <div class="game-container">
        <canvas id="gameCanvas"></canvas>
    </div>

    <div class="info">
        <h3 class="font-bold">Bediening (De "Rode Speler")</h3>
        <p><strong>Pijltjes:</strong> Bewegen | <strong>X:</strong> Springen (Jump) | <strong>Z:</strong> Rennen (Run)</p>
        <p class="mt-2 text-xs text-gray-400">Opmerking: Dit is een technisch werkende 'stub' van de game. Alle sprites en geluiden zijn gemockt (simpele rechthoeken) omdat externe bestanden niet geladen kunnen worden.</p>
    </div>

    <script>
        /********************************************************************************
         * 1. INPUT LOGIC (from original file)
         ********************************************************************************/
        (function() {
            var pressedKeys = {};

            function setKey(event, status) {
                var code = event.keyCode;
                var key;

                switch(code) {
                case 32: key = 'SPACE'; break;
                case 37: case 65: key = 'LEFT'; break; // 37: Left, 65: A
                case 38: case 87: key = 'UP'; break; // 38: Up, 87: W
                case 39: case 68: key = 'RIGHT'; break; // 39: Right, 68: D
                case 40: case 83: key = 'DOWN'; break; // 40: Down, 83: S
                case 88: case 17: key = 'JUMP'; break; // 88: X, 17: Ctrl
                case 90: case 16: key = 'RUN'; break; // 90: Z, 16: Shift
                default:
                    key = String.fromCharCode(code);
                }
                pressedKeys[key] = status;
            }

            document.addEventListener('keydown', function(e) {
                setKey(e, true);
            });

            document.addEventListener('keyup', function(e) {
                setKey(e, false);
            });

            window.addEventListener('blur', function() {
                pressedKeys = {};
            });

            window.input = {
                isDown: function(key) {
                    return pressedKeys[key.toUpperCase()];
                },
                reset: function() {
                    // Reset only relevant keys to prevent ghost movement
                    ['RUN', 'LEFT', 'RIGHT', 'DOWN', 'JUMP'].forEach(k => pressedKeys[k] = false);
                }
            };
        })();

        /********************************************************************************
         * 2. MARIO ENGINE STUBS (To define missing classes)
         ********************************************************************************/
        var Mario = {};
        
        // Mock Resources (Bypasses image/sound loading)
        var resources = {
            _readyCallbacks: [],
            load: function(paths) { console.log("Resources mocked. No actual image/sound loading."); },
            onReady: function(callback) { 
                this._readyCallbacks.push(callback); 
                // Call immediately as we have no async resources to load
                setTimeout(callback, 50); 
            },
            get: function(path) { return { width: 16, height: 16, isMock: true }; }
        };
        
        // Mock Entity Base Class
        Mario.Entity = function(pos, size, sprite, hitBox) {
            this.pos = pos || [0, 0];
            this.size = size || [16, 16];
            this.sprite = sprite;
            this.update = function() {};
            this.checkCollisions = function() {};
        };
        Mario.Entity.prototype.render = function(ctx, vX, vY, color) {
            ctx.fillStyle = color || 'gray';
            ctx.fillRect(this.pos[0] - vX, this.pos[1] - vY, this.size[0], this.size[1]);
        };
        
        // Mock Specific Entities (Needed for Level Builder)
        Mario.Floor = function(pos, sprite) { Mario.Entity.call(this, pos, [16, 16], sprite); };
        Mario.Prop = function(pos, sprite) { Mario.Entity.call(this, pos, [16, 16], sprite); };
        Mario.Block = function(options) { 
            Mario.Entity.call(this, options.pos, [16, 16], options.sprite); 
            this.update = function() {};
            this.isHit = false;
            this.render = function(ctx, vX, vY) {
                var color = this.isHit ? '#a04000' : '#d08800'; // Brown or Orange
                Mario.Entity.prototype.render.call(this, ctx, vX, vY, color);
            }
        };
        Mario.Coin = function(pos, sprite) { Mario.Entity.call(this, pos, [8, 8], sprite); };
        Mario.Pipe = function(options) { Mario.Entity.call(this, options.pos, [32, options.length * 16]); };
        Mario.Flag = function(x) { 
            Mario.Entity.call(this, [x, 32], [16, 16]); 
            this.render = function(ctx, vX, vY) {
                Mario.Entity.prototype.render.call(this, ctx, vX, vY, 'yellow'); // Flagpole
            }
        };

        // Goomba Mock (Enemy that moves and can die)
        Mario.Goomba = function(pos, sprite) {
            Mario.Entity.call(this, pos, [16, 16], sprite);
            this.vel = [-30, 0];
            this.isDead = false;
            this.update = function(dt) {
                if (!this.isDead) { this.pos[0] += this.vel[0] * dt; }
                if (this.pos[1] > 180) { this.pos[1] = 180; } // Floor collision
            };
            this.render = function(ctx, vX, vY) {
                if (!this.isDead) {
                    Mario.Entity.prototype.render.call(this, ctx, vX, vY, 'brown');
                } else {
                    ctx.fillStyle = 'darkred'; 
                    ctx.fillRect(this.pos[0] - vX, this.pos[1] - vY + 14, 16, 2); // Squashed
                }
            };
            this.checkCollisions = function() {
                // Check if it fell off world (mocking) or was squashed
            }
        };
        
        // Player Mock (The Mario entity)
        Mario.Player = function(pos) {
            Mario.Entity.call(this, pos, [16, 16]);
            this.vel = [0, 0];
            this.speed = 100;
            this.piping = false;
            this.dying = false;
            this.noInput = false;
            this.exiting = false;
            this.powering = [];
            this.invincibility = 0;
            this.onGround = true;

            this.update = function(dt) {
                // Gravity
                this.vel[1] += 1000 * dt; 
                
                // Max speed in air
                if (!this.onGround) {
                    this.vel[0] = Math.max(-150, Math.min(150, this.vel[0]));
                }
                
                this.pos[0] += this.vel[0] * dt;
                this.pos[1] += this.vel[1] * dt;
                
                // Simple floor collision mock
                if (this.pos[1] > 180) {
                    this.pos[1] = 180;
                    this.vel[1] = 0;
                    this.onGround = true;
                }
            };
            this.render = function(ctx, vX, vY) {
                // Red square for Mario
                Mario.Entity.prototype.render.call(this, ctx, vX, vY, 'red');
            };

            // Input handlers
            this.run = function() { this.speed = 150; };
            this.noRun = function() { this.speed = 50; };
            this.jump = function() { 
                if (this.onGround) {
                    this.vel[1] = -300; 
                    this.onGround = false;
                }
            };
            this.noJump = function() {};
            this.crouch = function() {};
            this.noCrouch = function() {};
            this.moveLeft = function() { this.vel[0] = -this.speed; };
            this.moveRight = function() { this.vel[0] = this.speed; };
            this.noWalk = function() { if(this.onGround) { this.vel[0] = 0; } };

            this.checkCollisions = function() {
                // Basic Goomba collision: if on top, squash; otherwise, take damage (mocked by color change)
                level.enemies.forEach((enemy, index) => {
                    if (!enemy.isDead && this.pos[0] < enemy.pos[0] + 16 &&
                        this.pos[0] + 16 > enemy.pos[0] &&
                        this.pos[1] + 16 > enemy.pos[1] &&
                        this.pos[1] < enemy.pos[1] + 16) 
                    {
                        // Mock: Kill Goomba if jumping/falling onto it
                        if (this.vel[1] > 0 && this.pos[1] + 16 < enemy.pos[1] + 8) {
                             enemy.isDead = true;
                             this.vel[1] = -150; // Little hop
                        } else {
                            // Mock: Die
                            this.dying = true;
                            console.log("Mario hit enemy and is now 'dying'");
                        }
                    }
                });
            };
        };


        /********************************************************************************
         * 3. LEVEL BUILDER (from second code block)
         ********************************************************************************/
        var Level = Mario.Level = function(options) {
            this.playerPos = options.playerPos;
            this.scrolling = options.scrolling;
            this.background = options.background;
            this.exit = options.exit;

            // Sprites are now mocked objects
            this.floorSprite = options.floorSprite;
            this.wallSprite = options.wallSprite;
            this.brickSprite = options.brickSprite;
            this.ublockSprite = options.ublockSprite;
            this.goombaSprite = options.goombaSprite;

            this.statics = [];
            this.scenery = [];
            this.blocks = [];
            this.enemies = [];
            this.items = [];
            this.pipes = [];

            for (var i = 0; i < 15; i++) {
                this.statics[i] = [];
                this.scenery[i] = [];
                this.blocks[i] = [];
            }
        };

        Level.prototype.putFloor = function(start, end) {
            for (var i = start; i < end; i++) {
                this.statics[13][i] = new Mario.Floor([16*i,208], this.floorSprite);
                this.statics[14][i] = new Mario.Floor([16*i,224], this.floorSprite);
            }
        };

        Level.prototype.putGoomba = function(x, y) {
            this.enemies.push(new Mario.Goomba([16*x, 16*y], this.goombaSprite() ));
        };

        Level.prototype.putWall = function(x, y, height) {
            for (var i = y-height; i < y; i++) {
                this.statics[i][x] = new Mario.Floor([16*x, 16*i], this.wallSprite);
            }
        };

        Level.prototype.putQBlock = function(x, y, item) {
            this.blocks[y][x] = new Mario.Block( {
                pos: [x*16, y*16],
                item: item,
                sprite: this.qblockSprite,
                usedSprite: this.ublockSprite
            });
        };

        Level.prototype.putBrick = function(x,y,item) {
            this.blocks[y][x] = new Mario.Block({
                pos: [x*16, y*16],
                item: item,
                sprite: this.brickSprite,
                usedSprite: this.ublockSprite,
                breakable: !item
            });
        };
        
        Level.prototype.putFlagpole = function(x) {
            this.statics[12][x] = new Mario.Floor([16*x, 192], this.wallSprite);
            for (i=3; i < 12; i++) {
                this.scenery[i][x] = new Mario.Prop([16*x, 16*i], this.flagpoleSprites ? this.flagpoleSprites[1] : resources.get('pole'))
            }
            this.scenery[2][x] = new Mario.Prop([16*x, 32], resources.get('top'));
            this.items.push(new Mario.Flag(16*x));
        }

        // Mock the level creator (Level 1-1)
        Mario.oneone = function() {
            window.level = new Mario.Level({
                playerPos: [80, 160],
                scrolling: true,
                background: '#63b3ed',
                exit: 3200,
                // Mocked sprites needed for put functions
                floorSprite: resources.get('floor'),
                wallSprite: resources.get('wall'),
                qblockSprite: resources.get('qblock'),
                brickSprite: resources.get('brick'),
                ublockSprite: resources.get('ublock'),
                goombaSprite: function() { return resources.get('goomba'); }
            });
            
            // Set initial player position based on level config
            player.pos = level.playerPos;

            // --- BUILD LEVEL (Simplified 1-1 Structure) ---
            level.putFloor(0, 150); // Main floor
            
            // First jump
            level.putQBlock(15, 10, 'coin');
            level.putQBlock(16, 10, 'shroom');
            level.putBrick(17, 10);
            
            // Goomba and a hole
            level.putGoomba(22, 12);
            level.putGoomba(23, 12);
            level.putFloor(28, 150);
            
            // Wall and second jump structure
            level.putWall(35, 13, 4);
            level.putQBlock(40, 10, 'coin');
            
            // Flagpole
            level.putFlagpole(50);
        };


        /********************************************************************************
         * 4. GAME LOOP (from the code you just provided)
         ********************************************************************************/
        var requestAnimFrame = (function(){
            return window.requestAnimationFrame       ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame    ||
                window.oRequestAnimationFrame      ||
                window.msRequestAnimationFrame     ||
                function(callback){
                    window.setTimeout(callback, 1000 / 60);
                };
        })();

        var canvas = document.getElementById("gameCanvas");
        var ctx = canvas.getContext('2d');
        
        // Adjust canvas size for correct scaling
        canvas.width = 256 * 3;
        canvas.height = 240 * 3;
        ctx.scale(3,3);

        var updateables = [];
        var fireballs = [];
        // The real player object, using the stubbed class
        var player = new Mario.Player([80, 160]); 

        var vX = 0, vY = 0, vWidth = 256, vHeight = 240;
        var level;
        var sounds; // Will remain mocked
        var music;  // Will remain mocked

        resources.load([
             // We don't need these paths anymore, but keep the call for structure
        ]);

        resources.onReady(init);
        var lastTime;
        
        function init() {
             // Mock audio objects to prevent errors
             music = {};
             sounds = {};
             
             Mario.oneone();
             lastTime = Date.now();
             main();
        }

        var gameTime = 0;

        function main() {
            var now = Date.now();
            var dt = (now - lastTime) / 1000.0;

            update(dt);
            render();

            lastTime = now;
            requestAnimFrame(main);
        }

        function update(dt) {
            gameTime += dt;

            handleInput(dt);
            updateEntities(dt, gameTime);

            checkCollisions();
        }

        function handleInput(dt) {
            if (player.piping || player.dying || player.noInput) return;

            if (input.isDown('RUN')){
                player.run();
            } else {
                player.noRun();
            }
            if (input.isDown('JUMP')) {
                player.jump();
            } else {
                player.noJump();
            }

            if (input.isDown('DOWN')) {
                player.crouch();
            } else {
                player.noCrouch();
            }

            if (input.isDown('LEFT')) { 
                player.moveLeft();
            }
            else if (input.isDown('RIGHT')) { 
                player.moveRight();
            } else {
                player.noWalk();
            }
        }

        function updateEntities(dt, gameTime) {
            player.update(dt); // vX is now handled inside player logic if needed
            updateables.forEach (function(ent) {
                ent.update(dt, gameTime);
            });

            if (player.exiting) {
                if (player.pos[0] > vX + 96)
                    vX = player.pos[0] - 96
            }else if (level.scrolling && player.pos[0] > vX + 80) {
                vX = player.pos[0] - 80;
            }

            if (player.powering.length !== 0 || player.dying) { return; }
            level.items.forEach (function(ent) {
                ent.update(dt);
            });

            // Filter out dead enemies
            level.enemies = level.enemies.filter(e => !e.isDead);
            level.enemies.forEach (function(ent) {
                ent.update(dt, vX);
            });

            fireballs.forEach(function(fireball) {
                fireball.update(dt);
            });
            level.pipes.forEach (function(pipe) {
                pipe.update(dt);
            });
        }

        function checkCollisions() {
            if (player.powering.length !== 0 || player.dying) { return; }
            player.checkCollisions();

            level.items.forEach(function(item) {
                item.checkCollisions();
            });
            level.enemies.forEach (function(ent) {
                ent.checkCollisions();
            });
            fireballs.forEach(function(fireball){
                fireball.checkCollisions();
            });
            level.pipes.forEach (function(pipe) {
                pipe.checkCollisions();
            });
        }

        function render() {
            updateables = [];
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = level.background;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            for(var i = 0; i < 15; i++) {
                for (var j = Math.floor(vX / 16) - 1; j < Math.floor(vX / 16) + 20; j++){
                    if (level.scenery[i][j]) {
                        renderEntity(level.scenery[i][j]);
                    }
                }
            }

            level.items.forEach (function (item) {
                renderEntity(item);
            });

            level.enemies.forEach (function(enemy) {
                renderEntity(enemy);
            });

            fireballs.forEach(function(fireball) {
                renderEntity(fireball);
            })

            for(var i = 0; i < 15; i++) {
                for (var j = Math.floor(vX / 16) - 1; j < Math.floor(vX / 16) + 20; j++){
                    if (level.statics[i][j]) {
                        renderEntity(level.statics[i][j], '#4CAF50'); // Groene vloer
                    }
                    if (level.blocks[i][j]) {
                        renderEntity(level.blocks[i][j]);
                        updateables.push(level.blocks[i][j]);
                    }
                }
            }

            if (player.dying) { 
                ctx.fillStyle = 'black';
                ctx.fillText("Game Over", vX + 100, vY + 120);
                return;
            }

            if (player.invincibility % 2 === 0) {
                renderEntity(player);
            }

            level.pipes.forEach (function(pipe) {
                renderEntity(pipe, '#4CAF50'); // Groene pijp
            });
        }

        function renderEntity(entity, defaultColor) {
            // Use entity's own render method if available, otherwise use mock
            if (entity.render.length > 2) {
                entity.render(ctx, vX, vY);
            } else {
                Mario.Entity.prototype.render.call(entity, ctx, vX, vY, defaultColor);
            }
        }
    </script>
</body>
</html>
