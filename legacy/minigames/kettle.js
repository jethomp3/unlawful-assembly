/**
 * THE KETTLE - Escape Mini-Game
 * Police are forming a perimeter. Find the exit before you're trapped.
 *
 * Mechanics:
 * - Top-down grid maze
 * - Police lines closing in from edges
 * - Player escorts followers to exit
 * - Timer countdown
 * - Arrow keys to move, SPACE to rally scattered followers
 */

const KettleGame = {
    // Game configuration
    config: {
        gridWidth: 20,
        gridHeight: 12,
        cellSize: 24,

        // Difficulty settings
        difficulty: {
            easy: { time: 60, policeSpeed: 3000, exits: 2, followers: 4 },
            normal: { time: 45, policeSpeed: 2500, exits: 1, followers: 5 },
            hard: { time: 30, policeSpeed: 2000, exits: 1, followers: 6 },
            immigrant: { time: 25, policeSpeed: 1500, exits: 1, followers: 6, playerTargeted: true }
        }
    },

    // Game state
    state: {
        grid: [],
        player: { x: 0, y: 0 },
        followers: [],
        police: [],
        exits: [],
        timeLeft: 45,
        gameOver: false,
        result: null,
        policeInterval: null,
        timerInterval: null,
        currentDifficulty: 'normal'
    },

    // Cell types
    CELL: {
        EMPTY: 0,
        WALL: 1,
        POLICE: 2,
        EXIT: 3,
        PLAYER: 4,
        FOLLOWER: 5,
        ALLY_GATE: 6  // Ally who opens a path
    },

    // Initialize the game
    init(container, difficulty = 'normal', characterClass = null) {
        this.container = container;
        this.state.currentDifficulty = difficulty;

        // Adjust difficulty for immigrant class
        if (characterClass === 'immigrant') {
            this.state.currentDifficulty = 'immigrant';
        }

        const settings = this.config.difficulty[this.state.currentDifficulty];
        this.state.timeLeft = settings.time;

        this.resetState();
        this.generateMaze();
        this.placeEntities(settings);
        this.render();
        this.bindControls();
        this.startTimers(settings);
    },

    // Reset game state
    resetState() {
        this.state.grid = [];
        this.state.player = { x: 0, y: 0 };
        this.state.followers = [];
        this.state.police = [];
        this.state.exits = [];
        this.state.gameOver = false;
        this.state.result = null;

        if (this.state.policeInterval) clearInterval(this.state.policeInterval);
        if (this.state.timerInterval) clearInterval(this.state.timerInterval);
    },

    // Generate the maze/play area
    generateMaze() {
        const { gridWidth, gridHeight } = this.config;

        // Initialize empty grid
        for (let y = 0; y < gridHeight; y++) {
            this.state.grid[y] = [];
            for (let x = 0; x < gridWidth; x++) {
                // Border is police line
                if (x === 0 || x === gridWidth - 1 || y === 0 || y === gridHeight - 1) {
                    this.state.grid[y][x] = this.CELL.POLICE;
                    this.state.police.push({ x, y, original: true });
                } else {
                    this.state.grid[y][x] = this.CELL.EMPTY;
                }
            }
        }

        // Add some internal walls/obstacles
        this.addObstacles();
    },

    // Add random obstacles to make it interesting
    addObstacles() {
        const { gridWidth, gridHeight } = this.config;

        // Add some wall clusters
        const numClusters = 4 + Math.floor(Math.random() * 3);

        for (let i = 0; i < numClusters; i++) {
            const cx = 3 + Math.floor(Math.random() * (gridWidth - 6));
            const cy = 3 + Math.floor(Math.random() * (gridHeight - 6));
            const size = 2 + Math.floor(Math.random() * 2);

            // Create L-shaped or line obstacles
            const horizontal = Math.random() > 0.5;
            for (let j = 0; j < size; j++) {
                const wx = horizontal ? cx + j : cx;
                const wy = horizontal ? cy : cy + j;
                if (this.isValidCell(wx, wy) && this.state.grid[wy][wx] === this.CELL.EMPTY) {
                    this.state.grid[wy][wx] = this.CELL.WALL;
                }
            }
        }
    },

    // Place player, followers, and exits
    placeEntities(settings) {
        const { gridWidth, gridHeight } = this.config;

        // Place player in center-ish area
        this.state.player.x = Math.floor(gridWidth / 2) - 2 + Math.floor(Math.random() * 4);
        this.state.player.y = Math.floor(gridHeight / 2) - 1 + Math.floor(Math.random() * 2);
        this.state.grid[this.state.player.y][this.state.player.x] = this.CELL.PLAYER;

        // Place followers near player
        for (let i = 0; i < settings.followers; i++) {
            let placed = false;
            let attempts = 0;
            while (!placed && attempts < 50) {
                const fx = this.state.player.x - 2 + Math.floor(Math.random() * 5);
                const fy = this.state.player.y - 2 + Math.floor(Math.random() * 5);
                if (this.isValidCell(fx, fy) && this.state.grid[fy][fx] === this.CELL.EMPTY) {
                    this.state.followers.push({ x: fx, y: fy, escaped: false, caught: false, following: false });
                    this.state.grid[fy][fx] = this.CELL.FOLLOWER;
                    placed = true;
                }
                attempts++;
            }
        }

        // Place exits on the edge (gaps in police line)
        const edges = ['top', 'bottom', 'left', 'right'];
        const shuffledEdges = edges.sort(() => Math.random() - 0.5);

        for (let i = 0; i < settings.exits; i++) {
            const edge = shuffledEdges[i % 4];
            let ex, ey;

            switch (edge) {
                case 'top':
                    ex = 3 + Math.floor(Math.random() * (gridWidth - 6));
                    ey = 0;
                    break;
                case 'bottom':
                    ex = 3 + Math.floor(Math.random() * (gridWidth - 6));
                    ey = gridHeight - 1;
                    break;
                case 'left':
                    ex = 0;
                    ey = 3 + Math.floor(Math.random() * (gridHeight - 6));
                    break;
                case 'right':
                    ex = gridWidth - 1;
                    ey = 3 + Math.floor(Math.random() * (gridHeight - 6));
                    break;
            }

            // Remove police from exit cell and neighbors
            this.state.grid[ey][ex] = this.CELL.EXIT;
            this.state.exits.push({ x: ex, y: ey });

            // Remove from police array
            this.state.police = this.state.police.filter(p => !(p.x === ex && p.y === ey));
        }
    },

    // Check if cell is valid
    isValidCell(x, y) {
        return x >= 0 && x < this.config.gridWidth && y >= 0 && y < this.config.gridHeight;
    },

    // Start game timers
    startTimers(settings) {
        // Countdown timer
        this.state.timerInterval = setInterval(() => {
            this.state.timeLeft--;
            this.updateTimer();

            if (this.state.timeLeft <= 0) {
                this.endGame('failure');
            }
        }, 1000);

        // Police closing in
        this.state.policeInterval = setInterval(() => {
            this.advancePolice(settings);
        }, settings.policeSpeed);
    },

    // Police advance inward
    advancePolice(settings) {
        if (this.state.gameOver) return;

        const { gridWidth, gridHeight } = this.config;
        const newPolice = [];

        // Each police unit might spawn a new one closer to center
        this.state.police.forEach(p => {
            if (Math.random() > 0.6) return; // Not all advance every tick

            // Determine direction toward center (or toward player if immigrant mode)
            let targetX = Math.floor(gridWidth / 2);
            let targetY = Math.floor(gridHeight / 2);

            if (settings.playerTargeted) {
                targetX = this.state.player.x;
                targetY = this.state.player.y;
            }

            const dx = Math.sign(targetX - p.x);
            const dy = Math.sign(targetY - p.y);

            // Try to advance
            const nx = p.x + dx;
            const ny = p.y + dy;

            if (this.isValidCell(nx, ny)) {
                const cell = this.state.grid[ny][nx];

                if (cell === this.CELL.EMPTY || cell === this.CELL.WALL) {
                    this.state.grid[ny][nx] = this.CELL.POLICE;
                    newPolice.push({ x: nx, y: ny, original: false });
                } else if (cell === this.CELL.FOLLOWER) {
                    // Catch follower!
                    const follower = this.state.followers.find(f => f.x === nx && f.y === ny);
                    if (follower) {
                        follower.caught = true;
                        this.state.grid[ny][nx] = this.CELL.POLICE;
                        newPolice.push({ x: nx, y: ny, original: false });
                    }
                } else if (cell === this.CELL.PLAYER) {
                    // Caught the player!
                    this.endGame('failure');
                }
            }
        });

        this.state.police = this.state.police.concat(newPolice);
        this.render();
    },

    // Bind keyboard controls
    bindControls() {
        this.keyHandler = (e) => {
            if (this.state.gameOver) return;

            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    this.movePlayer(0, -1);
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    this.movePlayer(0, 1);
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    this.movePlayer(-1, 0);
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    this.movePlayer(1, 0);
                    break;
                case ' ':
                    this.rallyFollowers();
                    e.preventDefault();
                    break;
            }
        };

        document.addEventListener('keydown', this.keyHandler);
    },

    // Move player
    movePlayer(dx, dy) {
        const nx = this.state.player.x + dx;
        const ny = this.state.player.y + dy;

        if (!this.isValidCell(nx, ny)) return;

        const cell = this.state.grid[ny][nx];

        // Can't move into walls or police
        if (cell === this.CELL.WALL || cell === this.CELL.POLICE) return;

        // Clear old position
        this.state.grid[this.state.player.y][this.state.player.x] = this.CELL.EMPTY;

        // Move player
        this.state.player.x = nx;
        this.state.player.y = ny;

        // Check if reached exit
        if (cell === this.CELL.EXIT) {
            this.playerEscaped();
            return;
        }

        this.state.grid[ny][nx] = this.CELL.PLAYER;

        // Move following followers
        this.moveFollowers(dx, dy);

        this.render();
    },

    // Move followers that are following
    moveFollowers(dx, dy) {
        this.state.followers.forEach(f => {
            if (!f.following || f.escaped || f.caught) return;

            const nx = f.x + dx;
            const ny = f.y + dy;

            if (!this.isValidCell(nx, ny)) return;

            const cell = this.state.grid[ny][nx];

            if (cell === this.CELL.EMPTY) {
                this.state.grid[f.y][f.x] = this.CELL.EMPTY;
                f.x = nx;
                f.y = ny;
                this.state.grid[ny][nx] = this.CELL.FOLLOWER;
            } else if (cell === this.CELL.EXIT) {
                this.state.grid[f.y][f.x] = this.CELL.EMPTY;
                f.escaped = true;
            } else if (cell === this.CELL.POLICE) {
                f.caught = true;
                this.state.grid[f.y][f.x] = this.CELL.EMPTY;
            }
        });
    },

    // Rally nearby followers to start following
    rallyFollowers() {
        const rallyRadius = 3;
        let rallied = 0;

        this.state.followers.forEach(f => {
            if (f.following || f.escaped || f.caught) return;

            const dist = Math.abs(f.x - this.state.player.x) + Math.abs(f.y - this.state.player.y);
            if (dist <= rallyRadius) {
                f.following = true;
                rallied++;
            }
        });

        if (rallied > 0) {
            this.showMessage(`Rallied ${rallied} protester${rallied > 1 ? 's' : ''}!`);
        }

        this.render();
    },

    // Player reached exit
    playerEscaped() {
        // Count results
        const escaped = this.state.followers.filter(f => f.escaped).length;
        const caught = this.state.followers.filter(f => f.caught).length;
        const total = this.state.followers.length;

        // Followers still following escape with player
        this.state.followers.forEach(f => {
            if (f.following && !f.escaped && !f.caught) {
                f.escaped = true;
            }
        });

        const finalEscaped = this.state.followers.filter(f => f.escaped).length;
        const finalCaught = this.state.followers.filter(f => f.caught).length;

        if (finalEscaped === total) {
            this.endGame('success');
        } else if (finalEscaped > finalCaught) {
            this.endGame('partial');
        } else {
            this.endGame('partial'); // Even partial escape is something
        }
    },

    // End the game
    endGame(result) {
        this.state.gameOver = true;
        this.state.result = result;

        clearInterval(this.state.timerInterval);
        clearInterval(this.state.policeInterval);
        document.removeEventListener('keydown', this.keyHandler);

        this.showResults();
    },

    // Show temporary message
    showMessage(text) {
        const msgEl = this.container.querySelector('.kettle-message');
        if (msgEl) {
            msgEl.textContent = text;
            msgEl.classList.add('show');
            setTimeout(() => msgEl.classList.remove('show'), 1500);
        }
    },

    // Update timer display
    updateTimer() {
        const timerEl = this.container.querySelector('.kettle-timer');
        if (timerEl) {
            timerEl.textContent = `Time: ${this.state.timeLeft}s`;
            if (this.state.timeLeft <= 10) {
                timerEl.classList.add('urgent');
            }
        }
    },

    // Show results screen
    showResults() {
        const escaped = this.state.followers.filter(f => f.escaped).length;
        const caught = this.state.followers.filter(f => f.caught).length;
        const total = this.state.followers.length;

        let title, message;

        switch (this.state.result) {
            case 'success':
                title = 'ESCAPED!';
                message = `You led everyone to safety!\n${escaped}/${total} protesters escaped.`;
                break;
            case 'partial':
                title = 'PARTIAL ESCAPE';
                message = `You made it out, but not everyone.\n${escaped}/${total} escaped. ${caught} were arrested.`;
                break;
            case 'failure':
                title = 'KETTLED';
                message = `The police closed in. Mass arrest.\n${caught} protesters detained.`;
                break;
        }

        this.container.innerHTML = `
            <div class="kettle-results">
                <h2>${title}</h2>
                <div class="results-art">
${this.state.result === 'success' ? `
    ╔════════════════════════════════════╗
    ║                                    ║
    ║    ☻☻☻☻☻ →→→  ░░░ EXIT ░░░        ║
    ║                                    ║
    ║    You made it out!                ║
    ║                                    ║
    ╚════════════════════════════════════╝
` : this.state.result === 'partial' ? `
    ╔════════════════════════════════════╗
    ║                                    ║
    ║    ☻☻☻ →→→  ░░░ EXIT ░░░          ║
    ║                                    ║
    ║    ████  ☻☻  ████  ← left behind  ║
    ║                                    ║
    ╚════════════════════════════════════╝
` : `
    ╔════════════════════════════════════╗
    ║    ████████████████████████████    ║
    ║    █                          █    ║
    ║    █   ☻☻☻☻☻☻  KETTLED       █    ║
    ║    █                          █    ║
    ║    ████████████████████████████    ║
    ╚════════════════════════════════════╝
`}
                </div>
                <p class="results-message">${message}</p>
                <div class="results-stats">
                    <span>Escaped: ${escaped}</span>
                    <span>Arrested: ${caught}</span>
                </div>
                <button class="menu-btn kettle-continue" onclick="KettleGame.returnToGame()">[ CONTINUE ]</button>
            </div>
        `;
    },

    // Return to main game with results
    returnToGame() {
        const escaped = this.state.followers.filter(f => f.escaped).length;
        const caught = this.state.followers.filter(f => f.caught).length;
        const total = this.state.followers.length;

        // Call back to main game
        if (typeof Game !== 'undefined') {
            Game.resolveMinigame('kettle', this.state.result);
        }
    },

    // Render the game
    render() {
        const { gridWidth, gridHeight, cellSize } = this.config;

        // Build grid HTML
        let gridHtml = '<div class="kettle-grid">';

        for (let y = 0; y < gridHeight; y++) {
            gridHtml += '<div class="kettle-row">';
            for (let x = 0; x < gridWidth; x++) {
                const cell = this.state.grid[y][x];
                let cellClass = 'kettle-cell';
                let content = '';

                switch (cell) {
                    case this.CELL.EMPTY:
                        cellClass += ' empty';
                        content = '·';
                        break;
                    case this.CELL.WALL:
                        cellClass += ' wall';
                        content = '▓';
                        break;
                    case this.CELL.POLICE:
                        cellClass += ' police';
                        content = '█';
                        break;
                    case this.CELL.EXIT:
                        cellClass += ' exit';
                        content = '░';
                        break;
                    case this.CELL.PLAYER:
                        cellClass += ' player';
                        content = '☻';
                        break;
                    case this.CELL.FOLLOWER:
                        const follower = this.state.followers.find(f => f.x === x && f.y === y);
                        cellClass += follower && follower.following ? ' follower following' : ' follower';
                        content = '☻';
                        break;
                }

                gridHtml += `<span class="${cellClass}">${content}</span>`;
            }
            gridHtml += '</div>';
        }

        gridHtml += '</div>';

        // Count stats
        const following = this.state.followers.filter(f => f.following && !f.escaped && !f.caught).length;
        const escaped = this.state.followers.filter(f => f.escaped).length;
        const remaining = this.state.followers.filter(f => !f.following && !f.escaped && !f.caught).length;

        // Full render
        this.container.innerHTML = `
            <div class="kettle-game">
                <div class="kettle-header">
                    <h2>!!! KETTLE ALERT !!!</h2>
                    <p>Police forming perimeter - Find the exit!</p>
                </div>

                ${gridHtml}

                <div class="kettle-message"></div>

                <div class="kettle-controls">
                    <span class="kettle-timer ${this.state.timeLeft <= 10 ? 'urgent' : ''}">Time: ${this.state.timeLeft}s</span>
                    <span class="kettle-stats">Following: ${following} | Escaped: ${escaped} | Scattered: ${remaining}</span>
                </div>

                <div class="kettle-instructions">
                    <span>Arrow Keys: Move</span>
                    <span>SPACE: Rally nearby protesters</span>
                </div>

                <div class="kettle-legend">
                    <span><span class="legend-icon player">☻</span> You</span>
                    <span><span class="legend-icon follower">☻</span> Protesters</span>
                    <span><span class="legend-icon police">█</span> Police</span>
                    <span><span class="legend-icon exit">░</span> Exit</span>
                </div>
            </div>
        `;
    }
};
