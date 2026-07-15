/**
 * WHISTLE NETWORK - Memory/Simon Says Mini-Game
 * ICE raid incoming. Warn the neighborhood using whistle patterns.
 *
 * Mechanics:
 * - Listen to a pattern of short (♪) and long (♪───) whistles
 * - Repeat the pattern to warn each house
 * - Pattern gets longer with each house warned
 * - Wrong pattern = house doesn't pass it on
 * - Timer represents ICE arrival
 */

const WhistleGame = {
    // Game configuration
    config: {
        // Difficulty settings
        difficulty: {
            easy: { houses: 6, baseTime: 180, patternSpeed: 600, holdThreshold: 300 },
            normal: { houses: 8, baseTime: 150, patternSpeed: 500, holdThreshold: 250 },
            hard: { houses: 10, baseTime: 120, patternSpeed: 400, holdThreshold: 200 },
            immigrant: { houses: 8, baseTime: 100, patternSpeed: 400, holdThreshold: 200 }
        },

        // Whistle timing
        shortDuration: 150,   // ms for short whistle display
        longDuration: 450,    // ms for long whistle display
        gapDuration: 200,     // ms between whistles in pattern

        // Pattern symbols
        SHORT: 'short',
        LONG: 'long'
    },

    // Game state
    state: {
        houses: [],
        currentHouse: 0,
        pattern: [],
        playerPattern: [],
        phase: 'waiting', // waiting, playing, input, success, failure
        timeLeft: 150,
        raidProgress: 0,
        gameOver: false,
        result: null,
        timerInterval: null,
        currentDifficulty: 'normal',

        // Input tracking
        keyDownTime: 0,
        isKeyDown: false,

        // Pattern playback
        patternIndex: 0,
        isPlayingPattern: false
    },

    // Initialize the game
    init(container, difficulty = 'normal', characterClass = null) {
        this.container = container;

        // Adjust difficulty for character class
        if (characterClass === 'immigrant') {
            this.state.currentDifficulty = 'easy'; // Immigrant has advantage here
        } else if (characterClass === 'engineer') {
            this.state.currentDifficulty = difficulty;
        } else {
            this.state.currentDifficulty = difficulty;
        }

        const settings = this.config.difficulty[this.state.currentDifficulty];
        this.state.timeLeft = settings.baseTime;

        this.resetState();
        this.createHouses(settings);
        this.generateInitialPattern();
        this.render();
        this.bindControls();
        this.startGame();
    },

    // Reset game state
    resetState() {
        this.state.houses = [];
        this.state.currentHouse = 0;
        this.state.pattern = [];
        this.state.playerPattern = [];
        this.state.phase = 'waiting';
        this.state.raidProgress = 0;
        this.state.gameOver = false;
        this.state.result = null;
        this.state.patternIndex = 0;
        this.state.isPlayingPattern = false;
        this.state.keyDownTime = 0;
        this.state.isKeyDown = false;

        if (this.state.timerInterval) clearInterval(this.state.timerInterval);
    },

    // Create houses to warn
    createHouses(settings) {
        const familyNames = [
            'The Garcias', 'The Nguyens', 'The Patels', 'The Kims',
            'The Lopezes', 'The Chens', 'The Hernandezes', 'The Singhs',
            'The Tran family', 'The Morales family'
        ];

        for (let i = 0; i < settings.houses; i++) {
            this.state.houses.push({
                id: i,
                name: familyNames[i] || `Family ${i + 1}`,
                warned: false,
                taken: false
            });
        }
    },

    // Generate initial pattern (starts simple)
    generateInitialPattern() {
        // Start with a simple pattern: short, short, long
        this.state.pattern = [
            this.config.SHORT,
            this.config.SHORT,
            this.config.LONG
        ];
    },

    // Add to pattern for next round
    extendPattern() {
        // Add 1-2 new elements
        const newElements = Math.random() > 0.5 ? 2 : 1;
        for (let i = 0; i < newElements; i++) {
            this.state.pattern.push(
                Math.random() > 0.4 ? this.config.SHORT : this.config.LONG
            );
        }
    },

    // Start the game
    startGame() {
        const settings = this.config.difficulty[this.state.currentDifficulty];

        // Start countdown timer
        this.state.timerInterval = setInterval(() => {
            if (this.state.gameOver) return;

            this.state.timeLeft--;
            this.state.raidProgress = 100 - (this.state.timeLeft / settings.baseTime * 100);

            // Check for raid arrival
            if (this.state.timeLeft <= 0) {
                this.raidArrives();
            }

            this.render();
        }, 1000);

        // Start first round after a brief delay
        setTimeout(() => {
            this.playPattern();
        }, 1500);
    },

    // Play the current pattern for the player to memorize
    playPattern() {
        this.state.phase = 'playing';
        this.state.patternIndex = 0;
        this.state.isPlayingPattern = true;
        this.render();

        this.playNextNote();
    },

    // Play next note in pattern
    playNextNote() {
        if (this.state.patternIndex >= this.state.pattern.length) {
            // Pattern complete, switch to input phase
            this.state.isPlayingPattern = false;
            this.state.phase = 'input';
            this.state.playerPattern = [];
            this.render();
            return;
        }

        const note = this.state.pattern[this.state.patternIndex];
        const settings = this.config.difficulty[this.state.currentDifficulty];
        const duration = note === this.config.SHORT ? this.config.shortDuration : this.config.longDuration;

        // Show the note
        this.showNote(note);

        // Schedule next note
        setTimeout(() => {
            this.hideNote();
            this.state.patternIndex++;

            setTimeout(() => {
                this.playNextNote();
            }, this.config.gapDuration);
        }, duration);
    },

    // Show a note being played
    showNote(type) {
        this.state.activeNote = type;
        this.render();
    },

    // Hide the note
    hideNote() {
        this.state.activeNote = null;
        this.render();
    },

    // Bind keyboard controls
    bindControls() {
        this.keyDownHandler = (e) => {
            if (this.state.gameOver) return;
            if (this.state.phase !== 'input') return;
            if (e.key !== ' ') return;
            if (this.state.isKeyDown) return;

            e.preventDefault();
            this.state.isKeyDown = true;
            this.state.keyDownTime = Date.now();
            this.state.activeNote = 'pressing';
            this.render();
        };

        this.keyUpHandler = (e) => {
            if (this.state.gameOver) return;
            if (this.state.phase !== 'input') return;
            if (e.key !== ' ') return;
            if (!this.state.isKeyDown) return;

            e.preventDefault();
            const holdDuration = Date.now() - this.state.keyDownTime;
            const settings = this.config.difficulty[this.state.currentDifficulty];

            // Determine if it was a short or long whistle
            const whistleType = holdDuration >= settings.holdThreshold ?
                this.config.LONG : this.config.SHORT;

            this.state.isKeyDown = false;
            this.state.activeNote = whistleType;
            this.render();

            // Record the input
            this.recordInput(whistleType);

            // Clear visual after brief moment
            setTimeout(() => {
                this.state.activeNote = null;
                this.render();
            }, 200);
        };

        document.addEventListener('keydown', this.keyDownHandler);
        document.addEventListener('keyup', this.keyUpHandler);
    },

    // Record player's whistle input
    recordInput(type) {
        this.state.playerPattern.push(type);

        // Check if this input is correct so far
        const index = this.state.playerPattern.length - 1;
        if (this.state.pattern[index] !== type) {
            // Wrong! House doesn't get warned
            this.failedHouse();
            return;
        }

        // Check if pattern is complete
        if (this.state.playerPattern.length === this.state.pattern.length) {
            // Success! House is warned
            this.warnedHouse();
        }
    },

    // Successfully warned a house
    warnedHouse() {
        this.state.houses[this.state.currentHouse].warned = true;
        this.state.currentHouse++;
        this.state.phase = 'success';
        this.showMessage(`${this.state.houses[this.state.currentHouse - 1].name} warned!`);
        this.render();

        // Check if all houses warned
        if (this.state.currentHouse >= this.state.houses.length) {
            this.endGame('success');
            return;
        }

        // Extend pattern and continue
        this.extendPattern();

        setTimeout(() => {
            this.playPattern();
        }, 1500);
    },

    // Failed to warn a house
    failedHouse() {
        this.state.phase = 'failure';
        this.showMessage('Wrong pattern! Signal confused.');
        this.render();

        // Move to next house anyway (they didn't get warned)
        this.state.currentHouse++;

        // Check if we've gone through all houses
        if (this.state.currentHouse >= this.state.houses.length) {
            this.raidArrives();
            return;
        }

        // Extend pattern and continue (harder now)
        this.extendPattern();

        setTimeout(() => {
            this.playPattern();
        }, 2000);
    },

    // ICE raid arrives
    raidArrives() {
        this.state.gameOver = true;

        // Mark remaining houses as taken
        this.state.houses.forEach(house => {
            if (!house.warned) {
                house.taken = true;
            }
        });

        const warned = this.state.houses.filter(h => h.warned).length;
        const taken = this.state.houses.filter(h => h.taken).length;
        const total = this.state.houses.length;

        if (warned === total) {
            this.state.result = 'success';
        } else if (warned >= total * 0.6) {
            this.state.result = 'partial';
        } else {
            this.state.result = 'failure';
        }

        this.showResults();
    },

    // End the game
    endGame(result) {
        this.state.gameOver = true;
        this.state.result = result;

        clearInterval(this.state.timerInterval);
        document.removeEventListener('keydown', this.keyDownHandler);
        document.removeEventListener('keyup', this.keyUpHandler);

        this.showResults();
    },

    // Show temporary message
    showMessage(text) {
        this.state.message = text;
        this.render();
        setTimeout(() => {
            this.state.message = null;
            this.render();
        }, 1500);
    },

    // Show results screen
    showResults() {
        clearInterval(this.state.timerInterval);
        document.removeEventListener('keydown', this.keyDownHandler);
        document.removeEventListener('keyup', this.keyUpHandler);

        const warned = this.state.houses.filter(h => h.warned).length;
        const taken = this.state.houses.filter(h => h.taken).length;
        const total = this.state.houses.length;

        let title, message;
        const takenNames = this.state.houses.filter(h => h.taken).map(h => h.name);

        switch (this.state.result) {
            case 'success':
                title = 'NETWORK ACTIVATED';
                message = `All ${total} families escaped!\nThe whistle network worked perfectly.\nBy the time ICE arrived, every house was empty.`;
                break;
            case 'partial':
                title = 'PARTIAL WARNING';
                message = `${warned}/${total} families escaped.\n${taken} families were taken.\n\n${takenNames.join(', ')}\n\nYou hear the doors breaking. The screaming.`;
                break;
            case 'failure':
                title = 'THE RAID';
                message = `Only ${warned}/${total} families escaped.\n\nThe vans arrived. You hear the chaos.\nChildren crying. Families torn apart.\n\n${takenNames.join(', ')}\n\nThey paid for the mistakes.`;
                break;
        }

        // Build house status display
        let housesArt = '';
        this.state.houses.forEach((house, i) => {
            if (house.warned) {
                housesArt += ' █ '; // Safe
            } else if (house.taken) {
                housesArt += ' X '; // Taken
            } else {
                housesArt += ' ░ '; // Unknown
            }
            if ((i + 1) % 4 === 0) housesArt += '\n';
        });

        this.container.innerHTML = `
            <div class="whistle-results ${this.state.result}">
                <h2>${title}</h2>
                <div class="results-art">
${this.state.result === 'success' ? `
    ╔════════════════════════════════════╗
    ║     THE NETWORK WORKED             ║
    ╠════════════════════════════════════╣
    ║                                    ║
    ║     ♪ ♪ ♪─── → 🏠 → 🏠 → 🏠       ║
    ║                                    ║
    ║     Every house warned.            ║
    ║     Every family safe.             ║
    ║                                    ║
    ╚════════════════════════════════════╝
` : this.state.result === 'partial' ? `
    ╔════════════════════════════════════╗
    ║     SOME ESCAPED                   ║
    ╠════════════════════════════════════╣
    ║                                    ║
    ║     🏠 🏠 🏠  ← safe                ║
    ║     🚐 ← ICE                       ║
    ║     X  X  ← taken                  ║
    ║                                    ║
    ╚════════════════════════════════════╝
` : `
    ╔════════════════════════════════════╗
    ║     THE VANS ARRIVED               ║
    ╠════════════════════════════════════╣
    ║                                    ║
    ║     🚐  🚐  🚐  🚐                  ║
    ║                                    ║
    ║     X   X   X   X                  ║
    ║                                    ║
    ║     You got the pattern wrong.     ║
    ║     They paid for it.              ║
    ║                                    ║
    ╚════════════════════════════════════╝
`}
                </div>
                <p class="results-message">${message.replace(/\n/g, '<br>')}</p>
                <div class="house-grid">
                    <pre>${housesArt}</pre>
                    <small>█ = escaped, X = taken</small>
                </div>
                <button class="menu-btn whistle-continue" onclick="WhistleGame.returnToGame()">[ CONTINUE ]</button>
            </div>
        `;
    },

    // Return to main game
    returnToGame() {
        if (typeof Game !== 'undefined') {
            Game.resolveMinigame('whistle', this.state.result);
        }
    },

    // Render the game
    render() {
        const settings = this.config.difficulty[this.state.currentDifficulty];
        const { houses, currentHouse, pattern, playerPattern, phase, timeLeft, activeNote, message } = this.state;

        // Build pattern display
        let patternDisplay = '';
        pattern.forEach((note, i) => {
            const isPlaying = phase === 'playing' && i === this.state.patternIndex;
            const isEntered = phase === 'input' && i < playerPattern.length;
            const isCorrect = isEntered && playerPattern[i] === note;
            const isWrong = isEntered && playerPattern[i] !== note;

            let noteClass = 'pattern-note';
            if (isPlaying) noteClass += ' playing';
            if (isCorrect) noteClass += ' correct';
            if (isWrong) noteClass += ' wrong';

            const symbol = note === this.config.SHORT ? '♪' : '♪───';
            patternDisplay += `<span class="${noteClass}">${symbol}</span> `;
        });

        // Build houses display
        let housesDisplay = '';
        houses.forEach((house, i) => {
            let houseClass = 'whistle-house';
            if (house.warned) houseClass += ' warned';
            if (house.taken) houseClass += ' taken';
            if (i === currentHouse && !this.state.gameOver) houseClass += ' current';

            const icon = house.warned ? '█' : house.taken ? 'X' : '░';
            housesDisplay += `<div class="${houseClass}" title="${house.name}">${icon}</div>`;
        });

        // Whistle indicator
        let whistleClass = 'whistle-indicator';
        let whistleText = 'Ready';
        if (activeNote === 'pressing') {
            whistleClass += ' pressing';
            whistleText = 'Hold...';
        } else if (activeNote === this.config.SHORT) {
            whistleClass += ' short';
            whistleText = '♪';
        } else if (activeNote === this.config.LONG) {
            whistleClass += ' long';
            whistleText = '♪───';
        }

        // Phase instructions
        let instructions = '';
        switch (phase) {
            case 'waiting':
                instructions = 'Get ready...';
                break;
            case 'playing':
                instructions = 'Listen to the pattern...';
                break;
            case 'input':
                instructions = 'Repeat the pattern! (SPACE = short, HOLD SPACE = long)';
                break;
            case 'success':
                instructions = 'Correct! House warned!';
                break;
            case 'failure':
                instructions = 'Wrong pattern!';
                break;
        }

        // Raid progress bar
        const raidPercent = this.state.raidProgress;

        this.container.innerHTML = `
            <div class="whistle-game">
                <div class="whistle-header">
                    <h2>!!! ICE RAID INCOMING !!!</h2>
                    <p>Warn the network before it's too late</p>
                </div>

                <div class="raid-progress">
                    <span class="raid-label">ICE ARRIVAL:</span>
                    <div class="raid-bar">
                        <div class="raid-fill ${raidPercent > 70 ? 'critical' : ''}" style="width:${raidPercent}%"></div>
                        <span class="raid-icon">🚐</span>
                    </div>
                    <span class="raid-time">${timeLeft}s</span>
                </div>

                <div class="whistle-pattern">
                    <div class="pattern-label">Pattern:</div>
                    <div class="pattern-display">${patternDisplay}</div>
                </div>

                <div class="${whistleClass}">
                    <div class="whistle-circle">${whistleText}</div>
                </div>

                <div class="whistle-instructions ${phase === 'input' ? 'active' : ''}">
                    ${instructions}
                </div>

                ${message ? `<div class="whistle-message">${message}</div>` : ''}

                <div class="houses-container">
                    <div class="houses-label">Houses to warn: ${houses.length - currentHouse} remaining</div>
                    <div class="houses-row">${housesDisplay}</div>
                </div>

                <div class="whistle-progress">
                    <span>Warned: ${houses.filter(h => h.warned).length}/${houses.length}</span>
                    <span>Current pattern length: ${pattern.length}</span>
                </div>

                <div class="whistle-controls">
                    <span>TAP SPACE = Short whistle (♪)</span>
                    <span>HOLD SPACE = Long whistle (♪───)</span>
                </div>
            </div>
        `;
    }
};
