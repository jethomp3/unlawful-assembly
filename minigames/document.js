/**
 * DOCUMENTATION - Photography Mini-Game
 * Capture evidence of police brutality before they spot you.
 *
 * Updated Design:
 * - 3 officers moving around the scene
 * - Must capture badge, face, and action for each
 * - Officers can block each other (occlusion)
 * - Balance zooming (for detail) with tracking (keeping in frame)
 * - Time limit + danger meter
 */

const DocumentGame = {
    // Game configuration
    config: {
        sceneWidth: 400,
        sceneHeight: 300,
        viewportWidth: 200,
        viewportHeight: 150,

        // Difficulty settings
        difficulty: {
            easy: { time: 90, officerSpeed: 0.3, dangerRate: 0.5, officerCount: 3 },
            normal: { time: 60, officerSpeed: 0.5, dangerRate: 1, officerCount: 3 },
            hard: { time: 45, officerSpeed: 0.7, dangerRate: 1.5, officerCount: 4 },
            immigrant: { time: 40, officerSpeed: 0.8, dangerRate: 2, officerCount: 4 }
        },

        // Zoom levels
        zoom: {
            min: 1,
            max: 3,
            step: 0.25,
            default: 1.5
        },

        // Required shot types and their zoom requirements
        shotRequirements: {
            badge: { minZoom: 2.5, maxZoom: 3, label: 'Badge #' },
            face: { minZoom: 1.75, maxZoom: 2.5, label: 'Face' },
            action: { minZoom: 1, maxZoom: 1.75, label: 'Action' }
        }
    },

    // Game state
    state: {
        officers: [],
        victims: [],
        camera: { x: 200, y: 150, zoom: 1.5 },
        timeLeft: 60,
        danger: 0,
        maxDanger: 100,
        documented: {}, // { officer1: { badge: true, face: true, action: false }, ... }
        gameOver: false,
        result: null,
        timerInterval: null,
        gameLoopInterval: null,
        currentDifficulty: 'normal',
        lastFrameTime: 0
    },

    // Initialize the game
    init(container, difficulty = 'normal', characterClass = null) {
        this.container = container;

        // Adjust difficulty for character class
        if (characterClass === 'immigrant') {
            this.state.currentDifficulty = 'immigrant';
        } else if (characterClass === 'engineer') {
            this.state.currentDifficulty = 'easy';
        } else {
            this.state.currentDifficulty = difficulty;
        }

        const settings = this.config.difficulty[this.state.currentDifficulty];
        this.state.timeLeft = settings.time;

        this.resetState();
        this.createScene(settings);
        this.render();
        this.bindControls();
        this.startGame();
    },

    // Reset game state
    resetState() {
        this.state.officers = [];
        this.state.victims = [];
        this.state.camera = {
            x: this.config.sceneWidth / 2,
            y: this.config.sceneHeight / 2,
            zoom: this.config.zoom.default
        };
        this.state.danger = 0;
        this.state.documented = {};
        this.state.gameOver = false;
        this.state.result = null;

        if (this.state.timerInterval) clearInterval(this.state.timerInterval);
        if (this.state.gameLoopInterval) cancelAnimationFrame(this.state.gameLoopInterval);
    },

    // Create the scene with officers and victims
    createScene(settings) {
        const { sceneWidth, sceneHeight } = this.config;

        // Create officers with patrol patterns
        for (let i = 0; i < settings.officerCount; i++) {
            const officer = {
                id: `officer_${i}`,
                badgeNumber: 1000 + Math.floor(Math.random() * 9000),
                x: 50 + Math.random() * (sceneWidth - 100),
                y: 50 + Math.random() * (sceneHeight - 100),
                width: 30,
                height: 40,
                // Patrol pattern
                patrolType: ['horizontal', 'vertical', 'circle', 'random'][Math.floor(Math.random() * 4)],
                patrolCenter: { x: 0, y: 0 },
                patrolRadius: 40 + Math.random() * 40,
                patrolAngle: Math.random() * Math.PI * 2,
                patrolDirection: Math.random() > 0.5 ? 1 : -1,
                speed: settings.officerSpeed * (0.8 + Math.random() * 0.4),
                // State
                isActing: true, // Currently doing something documentable
                facing: ['left', 'right'][Math.floor(Math.random() * 2)],
                zIndex: i
            };
            officer.patrolCenter = { x: officer.x, y: officer.y };
            this.state.officers.push(officer);
            this.state.documented[officer.id] = { badge: false, face: false, action: false };
        }

        // Create victims (stationary, on ground)
        for (let i = 0; i < settings.officerCount; i++) {
            const officer = this.state.officers[i];
            this.state.victims.push({
                id: `victim_${i}`,
                x: officer.x + (officer.facing === 'left' ? -20 : 20),
                y: officer.y + 20,
                width: 35,
                height: 20
            });
        }
    },

    // Start game loops
    startGame() {
        const settings = this.config.difficulty[this.state.currentDifficulty];

        // Timer countdown
        this.state.timerInterval = setInterval(() => {
            if (this.state.gameOver) return;

            this.state.timeLeft--;

            if (this.state.timeLeft <= 0) {
                this.endGame('timeout');
            }
        }, 1000);

        // Main game loop
        this.state.lastFrameTime = performance.now();
        this.gameLoop();
    },

    // Main game loop
    gameLoop() {
        if (this.state.gameOver) return;

        const now = performance.now();
        const deltaTime = (now - this.state.lastFrameTime) / 1000;
        this.state.lastFrameTime = now;

        this.updateOfficers(deltaTime);
        this.updateDanger(deltaTime);
        this.render();

        this.state.gameLoopInterval = requestAnimationFrame(() => this.gameLoop());
    },

    // Update officer positions
    updateOfficers(deltaTime) {
        const { sceneWidth, sceneHeight } = this.config;

        this.state.officers.forEach(officer => {
            const speed = officer.speed * 60 * deltaTime;

            switch (officer.patrolType) {
                case 'horizontal':
                    officer.x += speed * officer.patrolDirection;
                    if (officer.x > officer.patrolCenter.x + officer.patrolRadius ||
                        officer.x < officer.patrolCenter.x - officer.patrolRadius) {
                        officer.patrolDirection *= -1;
                        officer.facing = officer.patrolDirection > 0 ? 'right' : 'left';
                    }
                    break;

                case 'vertical':
                    officer.y += speed * officer.patrolDirection;
                    if (officer.y > officer.patrolCenter.y + officer.patrolRadius ||
                        officer.y < officer.patrolCenter.y - officer.patrolRadius) {
                        officer.patrolDirection *= -1;
                    }
                    break;

                case 'circle':
                    officer.patrolAngle += speed * 0.02 * officer.patrolDirection;
                    officer.x = officer.patrolCenter.x + Math.cos(officer.patrolAngle) * officer.patrolRadius;
                    officer.y = officer.patrolCenter.y + Math.sin(officer.patrolAngle) * officer.patrolRadius;
                    officer.facing = Math.cos(officer.patrolAngle + 0.1) > Math.cos(officer.patrolAngle) ? 'right' : 'left';
                    break;

                case 'random':
                    if (Math.random() < 0.02) {
                        officer.patrolDirection = Math.random() * Math.PI * 2;
                    }
                    officer.x += Math.cos(officer.patrolDirection) * speed;
                    officer.y += Math.sin(officer.patrolDirection) * speed;
                    officer.facing = Math.cos(officer.patrolDirection) > 0 ? 'right' : 'left';
                    break;
            }

            // Keep in bounds
            officer.x = Math.max(30, Math.min(sceneWidth - 30, officer.x));
            officer.y = Math.max(30, Math.min(sceneHeight - 30, officer.y));

            // Update associated victim position
            const victimIndex = this.state.officers.indexOf(officer);
            if (this.state.victims[victimIndex]) {
                this.state.victims[victimIndex].x = officer.x + (officer.facing === 'left' ? -25 : 25);
                this.state.victims[victimIndex].y = officer.y + 15;
            }
        });

        // Update z-index based on y position (for occlusion)
        this.state.officers.sort((a, b) => a.y - b.y);
        this.state.officers.forEach((o, i) => o.zIndex = i);
    },

    // Update danger meter
    updateDanger(deltaTime) {
        const settings = this.config.difficulty[this.state.currentDifficulty];

        // Danger increases faster when zoomed in (more conspicuous)
        const zoomFactor = this.state.camera.zoom / this.config.zoom.max;
        this.state.danger += settings.dangerRate * deltaTime * (0.5 + zoomFactor);

        if (this.state.danger >= this.state.maxDanger) {
            this.endGame('caught');
        }
    },

    // Bind keyboard controls
    bindControls() {
        this.keyState = {};

        this.keyDownHandler = (e) => {
            if (this.state.gameOver) return;
            this.keyState[e.key.toLowerCase()] = true;

            // Zoom controls
            if (e.key.toLowerCase() === 'z') {
                this.adjustZoom(this.config.zoom.step);
            } else if (e.key.toLowerCase() === 'x') {
                this.adjustZoom(-this.config.zoom.step);
            }

            // Take photo
            if (e.key === ' ') {
                this.takePhoto();
                e.preventDefault();
            }
        };

        this.keyUpHandler = (e) => {
            this.keyState[e.key.toLowerCase()] = false;
        };

        document.addEventListener('keydown', this.keyDownHandler);
        document.addEventListener('keyup', this.keyUpHandler);

        // Continuous pan movement
        this.panInterval = setInterval(() => {
            if (this.state.gameOver) return;
            const panSpeed = 3;

            if (this.keyState['arrowleft'] || this.keyState['a']) {
                this.panCamera(-panSpeed, 0);
            }
            if (this.keyState['arrowright'] || this.keyState['d']) {
                this.panCamera(panSpeed, 0);
            }
            if (this.keyState['arrowup'] || this.keyState['w']) {
                this.panCamera(0, -panSpeed);
            }
            if (this.keyState['arrowdown'] || this.keyState['s']) {
                this.panCamera(0, panSpeed);
            }
        }, 16);
    },

    // Pan camera
    panCamera(dx, dy) {
        const { sceneWidth, sceneHeight, viewportWidth, viewportHeight } = this.config;
        const halfViewW = (viewportWidth / this.state.camera.zoom) / 2;
        const halfViewH = (viewportHeight / this.state.camera.zoom) / 2;

        this.state.camera.x = Math.max(halfViewW, Math.min(sceneWidth - halfViewW, this.state.camera.x + dx));
        this.state.camera.y = Math.max(halfViewH, Math.min(sceneHeight - halfViewH, this.state.camera.y + dy));
    },

    // Adjust zoom level
    adjustZoom(delta) {
        const { min, max } = this.config.zoom;
        this.state.camera.zoom = Math.max(min, Math.min(max, this.state.camera.zoom + delta));
    },

    // Take a photo
    takePhoto() {
        const viewport = this.getViewportBounds();
        const { shotRequirements } = this.config;
        let shotTaken = false;

        // Check each officer
        this.state.officers.forEach(officer => {
            const doc = this.state.documented[officer.id];

            // Is officer in viewport?
            if (!this.isInViewport(officer, viewport)) return;

            // Is officer occluded by another officer in front?
            if (this.isOccluded(officer)) return;

            const zoom = this.state.camera.zoom;

            // Check what we can capture at current zoom
            for (const [shotType, req] of Object.entries(shotRequirements)) {
                if (doc[shotType]) continue; // Already have this shot

                if (zoom >= req.minZoom && zoom <= req.maxZoom) {
                    // Check if the right part is in frame
                    if (this.canCaptureShot(officer, shotType, viewport)) {
                        doc[shotType] = true;
                        shotTaken = true;
                        this.showMessage(`${req.label} captured for Officer #${officer.badgeNumber}!`);
                    }
                }
            }
        });

        if (!shotTaken) {
            this.showMessage('Shot unclear - adjust zoom or framing');
            // Small danger increase for failed shot (flash/noise)
            this.state.danger += 3;
        }

        // Check for victory
        this.checkVictory();
    },

    // Get current viewport bounds in scene coordinates
    getViewportBounds() {
        const { viewportWidth, viewportHeight } = this.config;
        const { x, y, zoom } = this.state.camera;
        const halfW = (viewportWidth / zoom) / 2;
        const halfH = (viewportHeight / zoom) / 2;

        return {
            left: x - halfW,
            right: x + halfW,
            top: y - halfH,
            bottom: y + halfH
        };
    },

    // Check if entity is in viewport
    isInViewport(entity, viewport) {
        return entity.x + entity.width / 2 > viewport.left &&
               entity.x - entity.width / 2 < viewport.right &&
               entity.y + entity.height / 2 > viewport.top &&
               entity.y - entity.height / 2 < viewport.bottom;
    },

    // Check if officer is occluded by another
    isOccluded(officer) {
        const viewport = this.getViewportBounds();

        for (const other of this.state.officers) {
            if (other.id === officer.id) continue;

            // Other officer is in front (higher zIndex = in front for y-sorting)
            if (other.zIndex > officer.zIndex) {
                // Check if they overlap horizontally
                const overlapX = Math.abs(officer.x - other.x) < (officer.width + other.width) / 2;
                const overlapY = Math.abs(officer.y - other.y) < (officer.height + other.height) / 2;

                if (overlapX && overlapY && this.isInViewport(other, viewport)) {
                    return true;
                }
            }
        }
        return false;
    },

    // Check if we can capture specific shot type
    canCaptureShot(officer, shotType, viewport) {
        // Badge: need upper body in frame
        // Face: need upper body in frame, officer facing somewhat toward camera
        // Action: need full officer + victim in frame

        const centerX = (viewport.left + viewport.right) / 2;
        const centerY = (viewport.top + viewport.bottom) / 2;

        switch (shotType) {
            case 'badge':
                // Badge is on chest - need upper body centered-ish
                const badgeY = officer.y - 10;
                return Math.abs(officer.x - centerX) < 30 && Math.abs(badgeY - centerY) < 25;

            case 'face':
                // Face - need head area in frame
                const headY = officer.y - 15;
                return Math.abs(officer.x - centerX) < 25 && Math.abs(headY - centerY) < 20;

            case 'action':
                // Action - need officer and their victim both visible
                const victimIndex = this.state.officers.indexOf(officer);
                const victim = this.state.victims[victimIndex];
                return victim && this.isInViewport(victim, viewport);

            default:
                return false;
        }
    },

    // Check if all officers are documented
    checkVictory() {
        const allDocumented = this.state.officers.every(officer => {
            const doc = this.state.documented[officer.id];
            return doc.badge && doc.face && doc.action;
        });

        if (allDocumented) {
            this.endGame('success');
        }
    },

    // Show temporary message
    showMessage(text) {
        const msgEl = this.container.querySelector('.doc-message');
        if (msgEl) {
            msgEl.textContent = text;
            msgEl.classList.add('show');
            setTimeout(() => msgEl.classList.remove('show'), 1500);
        }
    },

    // End the game
    endGame(result) {
        this.state.gameOver = true;
        this.state.result = result;

        clearInterval(this.state.timerInterval);
        clearInterval(this.panInterval);
        cancelAnimationFrame(this.state.gameLoopInterval);
        document.removeEventListener('keydown', this.keyDownHandler);
        document.removeEventListener('keyup', this.keyUpHandler);

        this.showResults();
    },

    // Calculate final score
    calculateScore() {
        let totalShots = 0;
        let capturedShots = 0;

        this.state.officers.forEach(officer => {
            const doc = this.state.documented[officer.id];
            totalShots += 3;
            if (doc.badge) capturedShots++;
            if (doc.face) capturedShots++;
            if (doc.action) capturedShots++;
        });

        return { totalShots, capturedShots };
    },

    // Show results screen
    showResults() {
        const { totalShots, capturedShots } = this.calculateScore();
        const percentage = Math.round((capturedShots / totalShots) * 100);

        let title, message, resultType;

        switch (this.state.result) {
            case 'success':
                title = 'EVIDENCE SECURED';
                message = `All ${this.state.officers.length} officers documented!\nBadges, faces, and actions captured.\nThis footage will hold up in court.`;
                resultType = 'success';
                break;
            case 'timeout':
                if (percentage >= 60) {
                    title = 'PARTIAL DOCUMENTATION';
                    message = `Time ran out.\n${capturedShots}/${totalShots} shots captured (${percentage}%).\nSome evidence, but not enough for all charges.`;
                    resultType = 'partial';
                } else {
                    title = 'INSUFFICIENT EVIDENCE';
                    message = `Time ran out.\n${capturedShots}/${totalShots} shots captured (${percentage}%).\n"Footage inconclusive" - no charges filed.`;
                    resultType = 'failure';
                }
                break;
            case 'caught':
                title = 'SPOTTED!';
                message = `They saw you filming.\nPhone confiscated. Evidence destroyed.\nYou've become the next victim.`;
                resultType = 'failure';
                break;
        }

        // Build evidence checklist
        let checklist = '';
        this.state.officers.forEach(officer => {
            const doc = this.state.documented[officer.id];
            checklist += `\nOfficer #${officer.badgeNumber}: `;
            checklist += doc.badge ? '✓' : '○';
            checklist += doc.face ? '✓' : '○';
            checklist += doc.action ? '✓' : '○';
        });

        this.container.innerHTML = `
            <div class="doc-results ${resultType}">
                <h2>${title}</h2>
                <div class="results-art">
${resultType === 'success' ? `
    ╔════════════════════════════════════╗
    ║    EVIDENCE PACKAGE COMPLETE       ║
    ╠════════════════════════════════════╣
    ║  📷 Badge Numbers    [CAPTURED]    ║
    ║  📷 Officer Faces    [CAPTURED]    ║
    ║  📷 Brutality Acts   [CAPTURED]    ║
    ╠════════════════════════════════════╣
    ║  STATUS: ADMISSIBLE IN COURT       ║
    ╚════════════════════════════════════╝
` : resultType === 'partial' ? `
    ╔════════════════════════════════════╗
    ║    PARTIAL EVIDENCE                ║
    ╠════════════════════════════════════╣
    ║  📷 Some shots captured            ║
    ║  ░░ Some shots missing             ║
    ╠════════════════════════════════════╣
    ║  STATUS: INCONCLUSIVE              ║
    ╚════════════════════════════════════╝
` : `
    ╔════════════════════════════════════╗
    ║    !!!  PHONE CONFISCATED  !!!     ║
    ╠════════════════════════════════════╣
    ║                                    ║
    ║      They saw you.                 ║
    ║      They took your phone.         ║
    ║      Now you're on the ground.     ║
    ║                                    ║
    ╚════════════════════════════════════╝
`}
                </div>
                <p class="results-message">${message}</p>
                <div class="evidence-checklist">
                    <strong>Evidence Checklist:</strong>
                    <pre>${checklist}</pre>
                    <small>✓ = captured, ○ = missing</small>
                </div>
                <button class="menu-btn doc-continue" onclick="DocumentGame.returnToGame()">[ CONTINUE ]</button>
            </div>
        `;
    },

    // Return to main game
    returnToGame() {
        const { totalShots, capturedShots } = this.calculateScore();
        const percentage = (capturedShots / totalShots) * 100;

        let result;
        if (this.state.result === 'success') {
            result = 'success';
        } else if (this.state.result === 'caught') {
            result = 'failure';
        } else if (percentage >= 60) {
            result = 'partial';
        } else {
            result = 'failure';
        }

        if (typeof Game !== 'undefined') {
            Game.resolveMinigame('documentation', result);
        }
    },

    // Render the game
    render() {
        const { sceneWidth, sceneHeight, viewportWidth, viewportHeight } = this.config;
        const { camera, officers, victims, documented, timeLeft, danger, maxDanger } = this.state;

        // Calculate viewport in scene coordinates
        const viewport = this.getViewportBounds();

        // Build scene elements (transformed to viewport)
        const transformX = (x) => ((x - viewport.left) / (viewport.right - viewport.left)) * viewportWidth;
        const transformY = (y) => ((y - viewport.top) / (viewport.bottom - viewport.top)) * viewportHeight;
        const transformSize = (size) => size * camera.zoom;

        // Sort entities by y for proper layering
        const entities = [
            ...victims.map(v => ({ ...v, type: 'victim' })),
            ...officers.map(o => ({ ...o, type: 'officer' }))
        ].sort((a, b) => a.y - b.y);

        let entitiesHtml = '';
        entities.forEach(entity => {
            const x = transformX(entity.x);
            const y = transformY(entity.y);
            const w = transformSize(entity.width);
            const h = transformSize(entity.height);

            // Skip if outside viewport
            if (x + w/2 < 0 || x - w/2 > viewportWidth || y + h/2 < 0 || y - h/2 > viewportHeight) return;

            if (entity.type === 'victim') {
                entitiesHtml += `<div class="doc-victim" style="left:${x - w/2}px;top:${y - h/2}px;width:${w}px;height:${h}px;">☻</div>`;
            } else {
                const doc = documented[entity.id];
                const fully = doc.badge && doc.face && doc.action;
                const partial = doc.badge || doc.face || doc.action;
                const statusClass = fully ? 'documented' : partial ? 'partial' : '';

                entitiesHtml += `
                    <div class="doc-officer ${statusClass} ${entity.facing}"
                         style="left:${x - w/2}px;top:${y - h/2}px;width:${w}px;height:${h}px;">
                        <span class="officer-badge">#${entity.badgeNumber}</span>
                        <span class="officer-icon">👮</span>
                    </div>`;
            }
        });

        // Build checklist
        let checklistHtml = '';
        officers.forEach(officer => {
            const doc = documented[officer.id];
            checklistHtml += `
                <div class="doc-officer-status">
                    <span class="officer-num">#${officer.badgeNumber}</span>
                    <span class="shot-status ${doc.badge ? 'done' : ''}">B</span>
                    <span class="shot-status ${doc.face ? 'done' : ''}">F</span>
                    <span class="shot-status ${doc.action ? 'done' : ''}">A</span>
                </div>`;
        });

        // Zoom indicator
        const zoomPercent = Math.round((camera.zoom / this.config.zoom.max) * 100);

        // Danger bar
        const dangerPercent = Math.round((danger / maxDanger) * 100);

        this.container.innerHTML = `
            <div class="doc-game">
                <div class="doc-header">
                    <h2>DOCUMENT THE EVIDENCE</h2>
                    <p>Capture badge, face, and action for each officer</p>
                </div>

                <div class="doc-viewport-container">
                    <div class="doc-viewport" style="width:${viewportWidth}px;height:${viewportHeight}px;">
                        <div class="doc-scene">
                            ${entitiesHtml}
                        </div>
                        <div class="doc-crosshair"></div>
                        <div class="doc-frame"></div>
                    </div>
                    <div class="doc-zoom-indicator">
                        <span class="zoom-label">ZOOM</span>
                        <div class="zoom-bar">
                            <div class="zoom-fill" style="height:${zoomPercent}%"></div>
                            <div class="zoom-marker badge" style="bottom:${(2.5/3)*100}%"></div>
                            <div class="zoom-marker face" style="bottom:${(1.75/3)*100}%"></div>
                            <div class="zoom-marker action" style="bottom:${(1/3)*100}%"></div>
                        </div>
                        <span class="zoom-level">${camera.zoom.toFixed(1)}x</span>
                    </div>
                </div>

                <div class="doc-message"></div>

                <div class="doc-controls">
                    <div class="doc-timer ${timeLeft <= 10 ? 'urgent' : ''}">
                        Time: ${timeLeft}s
                    </div>
                    <div class="doc-danger">
                        <span>DANGER:</span>
                        <div class="danger-bar">
                            <div class="danger-fill ${dangerPercent > 70 ? 'high' : ''}" style="width:${dangerPercent}%"></div>
                        </div>
                    </div>
                </div>

                <div class="doc-checklist">
                    ${checklistHtml}
                </div>

                <div class="doc-instructions">
                    <span>Arrow Keys: Pan</span>
                    <span>Z/X: Zoom In/Out</span>
                    <span>SPACE: Take Photo</span>
                </div>

                <div class="doc-legend">
                    <span>B=Badge F=Face A=Action</span>
                    <span>Zoom in for badge, out for action</span>
                </div>
            </div>
        `;
    }
};
