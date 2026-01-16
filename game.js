/**
 * UNLAWFUL ASSEMBLY - Core Game Engine
 * Oregon Trail-style political resistance game
 */

const Game = {
    // ===== GAME STATE =====
    state: {
        democracy: 65,
        legitimacy: 50,
        press: 40,
        fascism: 35,
        day: 1,
        supplies: {
            water: 100,
            medkits: 50,
            bail: 2000
        },
        allies: [],
        memorial: [],
        phase: 'amber',
        character: null,
        currentScene: 'intro',
        flags: {},
        settings: {
            skipMinigames: false,
            reduceViolence: false,
            hideDeaths: false
        }
    },

    // Character class definitions
    characters: {
        engineer: {
            name: 'The Engineer',
            description: 'White, middle-class, employed at a tech company',
            stats: { democracy: 70, legitimacy: 60, press: 50, fascism: 30 },
            advantage: 'Privilege Shield',
            disadvantage: 'Can lose job if identified',
            special: 'Livestream Setup (+20% Press from documentation)'
        },
        teacher: {
            name: 'The Teacher',
            description: 'Union member, diverse school, politically aware',
            stats: { democracy: 65, legitimacy: 55, press: 40, fascism: 35 },
            advantage: 'Community Connections (starts with 3 allies)',
            disadvantage: 'Students at risk if arrested',
            special: 'Inspire (recruit NPCs more easily)'
        },
        student: {
            name: 'The Student',
            description: 'College activist, no dependents, flexible schedule',
            stats: { democracy: 60, legitimacy: 50, press: 45, fascism: 35 },
            advantage: 'Nothing to Lose',
            disadvantage: 'Low starting resources, easily dismissed',
            special: 'Social Native (Signal Boost easier)'
        },
        veteran: {
            name: 'The Veteran',
            description: 'Served overseas, sees parallels to occupied territories',
            stats: { democracy: 65, legitimacy: 45, press: 35, fascism: 40 },
            advantage: 'Tactical Training (Kettle Escape easier)',
            disadvantage: 'PTSD triggered by tear gas',
            special: 'Command Presence (de-escalate police encounters)'
        },
        immigrant: {
            name: 'The Immigrant',
            description: 'Latino, documented but targeted anyway',
            stats: { democracy: 50, legitimacy: 40, press: 30, fascism: 50 },
            advantage: 'Community Intel (knows about raids)',
            disadvantage: 'Arrest = deportation hearing',
            special: 'Whistle Network (mini-game easier)'
        },
        pastor: {
            name: 'The Pastor',
            description: 'Black church leader, legacy of civil rights movement',
            stats: { democracy: 55, legitimacy: 65, press: 35, fascism: 45 },
            advantage: 'Sanctuary (church is safe house)',
            disadvantage: 'Congregation at risk',
            special: 'Moral Authority (convert conflicted cops)'
        }
    },

    // ===== INITIALIZATION =====
    init() {
        // Check for saved game
        this.loadSettings();
        this.bindKeyboard();
    },

    // ===== SCREEN MANAGEMENT =====
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
        document.getElementById(screenId).classList.remove('hidden');
    },

    // ===== SETTINGS =====
    showSettings() {
        this.showScreen('settings-screen');
    },

    saveSettings() {
        this.state.settings.skipMinigames = document.getElementById('skip-minigames').checked;
        this.state.settings.reduceViolence = document.getElementById('reduce-violence').checked;
        this.state.settings.hideDeaths = document.getElementById('hide-deaths').checked;
        localStorage.setItem('ua_settings', JSON.stringify(this.state.settings));
        this.showScreen('content-warning');
    },

    loadSettings() {
        const saved = localStorage.getItem('ua_settings');
        if (saved) {
            this.state.settings = JSON.parse(saved);
            document.getElementById('skip-minigames').checked = this.state.settings.skipMinigames;
            document.getElementById('reduce-violence').checked = this.state.settings.reduceViolence;
            document.getElementById('hide-deaths').checked = this.state.settings.hideDeaths;
        }
    },

    // ===== GAME START =====
    startGame() {
        this.showScreen('character-select');
    },

    selectCharacter(charId) {
        const char = this.characters[charId];
        this.state.character = charId;

        // Apply character starting stats
        this.state.democracy = char.stats.democracy;
        this.state.legitimacy = char.stats.legitimacy;
        this.state.press = char.stats.press;
        this.state.fascism = char.stats.fascism;

        // Apply character-specific starting conditions
        if (charId === 'teacher') {
            this.state.allies = ['Maria', 'James', 'Rosa'];
        }
        if (charId === 'student') {
            this.state.supplies.bail = 500;
        }

        // Start the game
        this.showScreen('game-screen');
        this.updateAllStats();
        this.loadScene('scene1');
    },

    // ===== COLOR PHASE SYSTEM =====
    setPhase(phase) {
        this.state.phase = phase;
        document.body.className = `phase-${phase}`;
    },

    checkPhaseTransition(sceneNum) {
        // Phase transitions based on scene number
        if (sceneNum >= 6 && this.state.phase === 'amber') {
            this.setPhase('green');
            this.showAlert('Something shifts. You begin to see allies.');
        } else if (sceneNum >= 13 && this.state.phase === 'green') {
            this.setPhase('red');
            this.showAlert('Blood enters the picture. The stakes are real.');
        } else if (sceneNum >= 21 && this.state.phase === 'red') {
            this.setPhase('full');
            this.showAlert('Your eyes are fully open. You see everything now.');
        }
    },

    // ===== STATS MANAGEMENT =====
    updateStat(stat, delta) {
        this.state[stat] = Math.max(0, Math.min(100, this.state[stat] + delta));
        this.updateStatDisplay(stat);
        this.checkEnding();
    },

    updateStatDisplay(stat) {
        const bar = document.getElementById(`${stat}-bar`);
        const val = document.getElementById(`${stat}-val`);
        if (bar && val) {
            bar.style.width = `${this.state[stat]}%`;
            val.textContent = this.state[stat];
        }
    },

    updateAllStats() {
        ['democracy', 'legitimacy', 'press', 'fascism'].forEach(stat => {
            this.updateStatDisplay(stat);
        });
        this.updateSupplies();
    },

    updateSupplies() {
        // Water bar (max 100)
        const waterLevel = Math.floor(this.state.supplies.water / 25);
        document.getElementById('water-bar').textContent =
            '█'.repeat(waterLevel) + '░'.repeat(4 - waterLevel);

        // Medkit bar (max 100)
        const medkitLevel = Math.floor(this.state.supplies.medkits / 25);
        document.getElementById('medkit-bar').textContent =
            '█'.repeat(medkitLevel) + '░'.repeat(4 - medkitLevel);

        // Bail fund
        document.getElementById('bail-amount').textContent =
            this.state.supplies.bail.toLocaleString();
    },

    modifySupply(supply, delta) {
        this.state.supplies[supply] = Math.max(0, this.state.supplies[supply] + delta);
        this.updateSupplies();
    },

    // ===== SCENE SYSTEM =====
    loadScene(sceneId) {
        const scene = Scenes[sceneId];
        if (!scene) {
            console.error('Scene not found:', sceneId);
            return;
        }

        this.state.currentScene = sceneId;

        // Check for phase transition
        const sceneNum = parseInt(sceneId.replace('scene', '')) || 0;
        this.checkPhaseTransition(sceneNum);

        // Update day and location
        if (scene.day) this.state.day = scene.day;
        if (scene.location) {
            document.getElementById('current-location').textContent = scene.location;
        }
        document.getElementById('current-day').textContent = `Day ${this.state.day}`;

        // Display ASCII art if present
        const artElement = document.getElementById('scene-art');
        if (scene.art) {
            artElement.textContent = scene.art;
            artElement.classList.remove('hidden');
        } else {
            artElement.classList.add('hidden');
        }

        // Display scene text with typewriter effect option
        const textElement = document.getElementById('scene-text');
        textElement.innerHTML = this.processText(scene.text);

        // Apply stat changes
        if (scene.effects) {
            this.applyEffects(scene.effects);
        }

        // Set flag if present
        if (scene.setFlag) {
            this.state.flags[scene.setFlag] = true;
        }

        // Display choices
        this.displayChoices(scene.choices);

        // Check for alerts
        if (scene.alert) {
            this.showAlert(scene.alert);
        } else {
            this.hideAlert();
        }

        // Check for minigame trigger
        if (scene.minigame && !this.state.settings.skipMinigames) {
            setTimeout(() => this.triggerMinigame(scene.minigame), 2000);
        }
    },

    processText(text) {
        // Process special tags in text
        let processed = text;

        // Replace character name placeholder
        if (this.state.character) {
            const charName = this.characters[this.state.character].name;
            processed = processed.replace(/\{CHARACTER\}/g, charName);
        }

        // Replace stat values
        processed = processed.replace(/\{DEMOCRACY\}/g, this.state.democracy);
        processed = processed.replace(/\{FASCISM\}/g, this.state.fascism);

        // Process violence content if reduced
        if (this.state.settings.reduceViolence) {
            processed = processed.replace(/<violence>(.*?)<\/violence>/gs,
                '<span class="text-dim">[Violence redacted]</span>');
        } else {
            processed = processed.replace(/<violence>(.*?)<\/violence>/gs, '$1');
        }

        // Process death content if hidden
        if (this.state.settings.hideDeaths) {
            processed = processed.replace(/<death>(.*?)<\/death>/gs,
                '<span class="text-dim">[A life was lost.]</span>');
        } else {
            processed = processed.replace(/<death>(.*?)<\/death>/gs, '$1');
        }

        return processed;
    },

    displayChoices(choices) {
        const choicesArea = document.getElementById('choices-area');
        choicesArea.innerHTML = '';

        if (!choices || choices.length === 0) return;

        choices.forEach((choice, index) => {
            // Check if choice has requirements
            if (choice.requires && !this.checkRequirements(choice.requires)) {
                return; // Skip this choice
            }

            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.innerHTML = `<span class="key">[${index + 1}]</span> ${choice.text}`;
            btn.onclick = () => this.makeChoice(choice);
            btn.dataset.key = (index + 1).toString();
            choicesArea.appendChild(btn);
        });
    },

    checkRequirements(requires) {
        for (const [key, value] of Object.entries(requires)) {
            if (key === 'flag') {
                if (!this.state.flags[value]) return false;
            } else if (key === 'character') {
                if (this.state.character !== value) return false;
            } else if (key === 'minStat') {
                const [stat, min] = value.split(':');
                if (this.state[stat] < parseInt(min)) return false;
            }
        }
        return true;
    },

    makeChoice(choice) {
        // Apply choice effects
        if (choice.effects) {
            this.applyEffects(choice.effects);
        }

        // Set flags
        if (choice.setFlag) {
            this.state.flags[choice.setFlag] = true;
        }

        // Add ally
        if (choice.addAlly) {
            this.state.allies.push(choice.addAlly);
        }

        // Remove ally (arrested/lost)
        if (choice.removeAlly) {
            const idx = this.state.allies.indexOf(choice.removeAlly);
            if (idx > -1) this.state.allies.splice(idx, 1);
        }

        // Add to memorial
        if (choice.addMemorial) {
            this.state.memorial.push(choice.addMemorial);
        }

        // Navigate to next scene
        if (choice.next) {
            this.loadScene(choice.next);
        }
    },

    applyEffects(effects) {
        if (effects.democracy) this.updateStat('democracy', effects.democracy);
        if (effects.legitimacy) this.updateStat('legitimacy', effects.legitimacy);
        if (effects.press) this.updateStat('press', effects.press);
        if (effects.fascism) this.updateStat('fascism', effects.fascism);
        if (effects.water) this.modifySupply('water', effects.water);
        if (effects.medkits) this.modifySupply('medkits', effects.medkits);
        if (effects.bail) this.modifySupply('bail', effects.bail);
    },

    // ===== ALERTS =====
    showAlert(text) {
        const alertArea = document.getElementById('alert-area');
        document.getElementById('alert-text').textContent = text;
        alertArea.classList.remove('hidden');
    },

    hideAlert() {
        document.getElementById('alert-area').classList.add('hidden');
    },

    // ===== RANDOM EVENTS =====
    triggerRandomEvent() {
        const events = RandomEvents[this.state.phase] || RandomEvents.amber;
        const event = events[Math.floor(Math.random() * events.length)];

        if (event.type === 'positive' || event.type === 'negative') {
            this.showAlert(event.text);
            this.applyEffects(event.effects);
        } else if (event.type === 'choice') {
            // Inject choice event into current scene
            this.displayChoices(event.choices);
        }
    },

    // ===== MINIGAME SYSTEM =====
    triggerMinigame(gameId) {
        if (this.state.settings.skipMinigames) {
            // Auto-resolve with average outcome
            this.resolveMinigame(gameId, 'partial');
            return;
        }

        this.showScreen('minigame-screen');
        const container = document.getElementById('minigame-container');

        // Determine difficulty based on character and game state
        let difficulty = 'normal';
        if (this.state.character === 'engineer') difficulty = 'easy';
        if (this.state.character === 'immigrant') difficulty = 'immigrant';
        if (this.state.character === 'veteran' && gameId === 'kettle') difficulty = 'easy';

        // Load the appropriate minigame
        switch (gameId) {
            case 'kettle':
                if (typeof KettleGame !== 'undefined') {
                    KettleGame.init(container, difficulty, this.state.character);
                } else {
                    console.error('KettleGame not loaded');
                    this.resolveMinigame(gameId, 'partial');
                }
                break;
            // Future minigames will be added here
            case 'whistle':
            case 'documentation':
            case 'ballot':
            case 'boss':
                console.log('Minigame not yet implemented:', gameId);
                this.resolveMinigame(gameId, 'partial');
                break;
            default:
                console.error('Unknown minigame:', gameId);
                this.resolveMinigame(gameId, 'partial');
        }
    },

    resolveMinigame(gameId, result) {
        // Apply minigame results
        const outcomes = MinigameOutcomes[gameId];
        if (outcomes && outcomes[result]) {
            this.applyEffects(outcomes[result].effects);
            if (outcomes[result].nextScene) {
                this.loadScene(outcomes[result].nextScene);
            }
        }
        this.showScreen('game-screen');
    },

    // ===== ENDING SYSTEM =====
    checkEnding() {
        let ending = null;

        if (this.state.democracy <= 0) {
            ending = 'fall';
        } else if (this.state.fascism >= 100) {
            ending = 'fascism';
        }

        if (ending) {
            this.showEnding(ending);
        }
    },

    showEnding(endingId) {
        const endings = {
            defiant: {
                title: 'DEFIANT',
                text: `Democracy is wounded, but alive.<br><br>
                       The movement continues. It will always continue.<br><br>
                       And now they want to invade Greenland...<br><br>
                       <span class="text-dim">The absurdity never stops. Neither can we.</span>`
            },
            pyrrhic: {
                title: 'PYRRHIC',
                text: `It's unclear who won.<br><br>
                       Everyone is exhausted, but still standing.<br><br>
                       "We didn't win. But we didn't lose. Yet."<br><br>
                       <span class="text-dim">The fight continues tomorrow.</span>`
            },
            fall: {
                title: 'THE FALL',
                text: `The institutions have collapsed.<br><br>
                       The resistance goes underground.<br><br>
                       It's dark. But there's still a thread of hope.<br><br>
                       <span class="text-dim">They can't kill an idea.</span>`
            },
            fascism: {
                title: 'FASCISM',
                text: `"Temporary emergency measures."<br><br>
                       That's what they called it.<br><br>
                       The measures became permanent.<br><br>
                       <span class="text-dim">First they came...</span>`
            },
            complicit: {
                title: 'COMPLICIT',
                text: `You stayed safe. You kept your head down.<br><br>
                       Now there's a knock at your door.<br><br>
                       They've come for you.<br><br>
                       <span class="text-dim">There's no one left to speak for you.</span>`
            }
        };

        const ending = endings[endingId];
        document.getElementById('ending-title').textContent = ending.title;
        document.getElementById('ending-text').innerHTML = ending.text;
        this.showScreen('ending-screen');
    },

    calculateFinalEnding() {
        if (this.state.democracy > 70 && this.state.fascism < 40) {
            return 'defiant';
        } else if (this.state.democracy >= 40 && this.state.fascism <= 60) {
            return 'pyrrhic';
        } else if (this.state.democracy < 40) {
            return 'fall';
        } else if (this.state.fascism > 80) {
            return 'fascism';
        } else if (!this.state.flags.engaged) {
            return 'complicit';
        }
        return 'pyrrhic';
    },

    // ===== KEYBOARD CONTROLS =====
    bindKeyboard() {
        document.addEventListener('keydown', (e) => {
            // Number keys for choices
            if (e.key >= '1' && e.key <= '9') {
                const btn = document.querySelector(`.choice-btn[data-key="${e.key}"]`);
                if (btn) btn.click();
            }
        });
    },

    // ===== SAVE/LOAD =====
    saveGame() {
        localStorage.setItem('ua_save', JSON.stringify(this.state));
    },

    loadGame() {
        const saved = localStorage.getItem('ua_save');
        if (saved) {
            this.state = JSON.parse(saved);
            this.setPhase(this.state.phase);
            this.showScreen('game-screen');
            this.updateAllStats();
            this.loadScene(this.state.currentScene);
            return true;
        }
        return false;
    },

    // ===== RESTART =====
    restart() {
        localStorage.removeItem('ua_save');
        location.reload();
    }
};

// Minigame outcome definitions (placeholders for Phase 3)
const MinigameOutcomes = {
    kettle: {
        success: { effects: { legitimacy: 10 }, nextScene: 'scene11' },
        partial: { effects: { press: 5, legitimacy: -5 }, nextScene: 'scene11' },
        failure: { effects: { bail: -500, legitimacy: -15 }, nextScene: 'scene11_arrest' }
    },
    whistle: {
        success: { effects: { legitimacy: 15, democracy: 10 }, nextScene: 'scene18' },
        partial: { effects: { legitimacy: 5 }, nextScene: 'scene18_partial' },
        failure: { effects: { democracy: -10, legitimacy: -10 }, nextScene: 'scene18_fail' }
    },
    documentation: {
        success: { effects: { press: 20, legitimacy: 15 }, nextScene: 'scene15' },
        partial: { effects: { press: 10 }, nextScene: 'scene15' },
        failure: { effects: { press: -10 }, nextScene: 'scene15_caught' }
    },
    ballot: {
        success: { effects: { democracy: 20, legitimacy: 10 }, nextScene: 'scene26' },
        partial: { effects: { democracy: 5 }, nextScene: 'scene26_partial' },
        failure: { effects: { democracy: -15, fascism: 15 }, nextScene: 'scene26_fail' }
    },
    boss: {
        success: { effects: { fascism: -30, democracy: 20 }, nextScene: 'ending_defiant' },
        failure: { effects: { fascism: 20 }, nextScene: 'ending_pyrrhic' }
    }
};

// Random events by phase
const RandomEvents = {
    amber: [
        { type: 'positive', text: 'A neighbor shares water with you.', effects: { water: 25 } },
        { type: 'negative', text: 'Your phone battery died. Missed important updates.', effects: { press: -5 } }
    ],
    green: [
        { type: 'positive', text: 'A local business owner brings water for the marchers.', effects: { water: 50 } },
        { type: 'positive', text: 'Off-duty nurses join your medic team.', effects: { medkits: 25 } },
        { type: 'negative', text: 'Counter-protesters slashed tires on the supply van.', effects: { water: -25, medkits: -25 } }
    ],
    red: [
        { type: 'positive', text: 'Your livestream just hit 100K views.', effects: { press: 15 } },
        { type: 'negative', text: 'Police drone spotted overhead - they\'re documenting faces.', effects: { fascism: 5 } },
        { type: 'negative', text: 'A plant threw a brick - news is blaming you.', effects: { legitimacy: -10, press: 5 } }
    ],
    full: [
        { type: 'positive', text: 'A cop you talked to earlier lets your group pass.', effects: { legitimacy: 10 } },
        { type: 'negative', text: 'City shut off water fountains along march route.', effects: { water: -30 } }
    ]
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => Game.init());
