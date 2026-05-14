// Main Game Loop and Initialization

let canvas, ctx;
let lastTime = 0;

function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Bind Events
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);
    
    canvas.addEventListener('touchstart', handleTouchStart, {passive: false});
    canvas.addEventListener('touchmove', handleTouchMove, {passive: false});
    canvas.addEventListener('touchend', handleTouchEnd, {passive: false});
    
    // Start loop
    requestAnimationFrame(gameLoop);
    
    // Load saved settings before starting the loading screen
    if (typeof loadSettings === 'function') loadSettings();
    
    // Start Epic Loading Screen instead of startScreen directly
    startEpicLoading();

    // Hook up UI sounds
    document.querySelectorAll('.btn, .level-node').forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            if(typeof AudioEngine !== 'undefined') AudioEngine.playUIHover();
        });
        btn.addEventListener('click', () => {
            if(typeof AudioEngine !== 'undefined') AudioEngine.playUIClick();
        });
    });
}

function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    
    update(deltaTime);
    if (typeof updateUI === 'function') updateUI();
    render(ctx, canvas);
    
    requestAnimationFrame(gameLoop);
}

function update(deltaTime) {
    state.time += deltaTime * 0.001;
    state.bgOffset += 0.5;
    
    if (state.shakeIntensity > 0) {
        state.shakeIntensity *= 0.9;
        if (state.shakeIntensity < 0.5) state.shakeIntensity = 0;
    }

    // Check Level Complete
    if (state.currentScreen === 'playing' && !state.isAnimating) {
        if (!state.isBossLevel && state.score >= state.targetScore) {
            AudioEngine.playLevelComplete();
            saveProgress(state.level + 1);
            showLevelComplete();
        }
    }

    // Hint System & Shuffle Logic
    if (state.currentScreen === 'playing' && !state.isAnimating) {
        if (state.showHints && state.time - state.lastActionTime > 3) { // Reduced hint time to 3s
            if (!state.hintMove) {
                state.hintMove = findPossibleMove();
                if (!state.hintMove && state.time - state.lastActionTime > 3.5) {
                    // No possible moves!
                    shuffleBoard();
                }
            }
        } else {
            state.hintMove = null;
        }
    }

    // Check Boss Defeat
    if (state.currentScreen === 'playing' && state.isBossLevel && state.bossHealth <= 0 && !state.isAnimating) {
        defeatBoss();
    }

    // Check Game Over
    if (state.currentScreen === 'playing' && state.movesLeft <= 0 && state.score < state.targetScore && !state.isAnimating) {
        if (state.isBossLevel && state.bossHealth > 0) {
            showGameOver('Boss bahçeni ele geçirdi!');
        } else {
            showGameOver('Hamlelerin bitti! Daha fazla narenciye toplayamadın.');
        }
    }
}

function defeatBoss() {
    state.bossesDefeated++;
    AudioEngine.playExplosion();
    showFloatingText('BOSS YENİLDİ!', canvas.width/2, canvas.height/2 - 50, '#FFD700', 60);
    createExplosion(canvas.width/2, canvas.height/2, '#FFD700');
    state.shakeIntensity = 25;
    
    setTimeout(() => { 
        saveProgress(state.level + 1);
        showLevelComplete(); 
    }, 2500);
}

function saveProgress(nextLevel) {
    const highest = parseInt(localStorage.getItem('nk_highest_level')) || 1;
    if (nextLevel > highest) {
        localStorage.setItem('nk_highest_level', nextLevel);
    }
}

function showMap() {
    AudioEngine.init(); // Initialize audio context on first user interaction
    showScreen('mapScreen');
    state.currentScreen = 'map';
    populateLevelMap();
}

function startGame() {
    AudioEngine.init(); // Initialize audio context on first user interaction
    showScreen('storyScreen'); 
    state.currentScreen = 'story';
}

function startLevelFromStory() {
    showScreen('tutorialScreen');
    state.currentScreen = 'tutorial';
}

function startActualGame() {
    showScreen(null); // Hide all screens
    resetGameState();
    loadLevel(state.level);
    state.currentScreen = 'playing';
}

function loadLevel(lvl) {
    const levelData = LEVELS[Math.min(lvl - 1, LEVELS.length - 1)];
    
    state.targetScore = levelData.target;
    state.movesLeft = levelData.moves;
    
    if (levelData.boss) {
        state.isBossLevel = true;
        const boss = BOSSES[levelData.boss];
        state.bossName = boss.name; 
        state.bossHealth = boss.health; 
        state.bossMaxHealth = boss.health;
    } else {
        state.isBossLevel = false;
    }

    loadLevelUI(lvl);
    initGrid();

    // Apply specific boss effects
    if (state.isBossLevel && levelData.boss === 'don') {
        for (let i = 0; i < 25; i++) {
            const r = Math.floor(Math.random() * CONFIG.GRID_ROWS);
            const c = Math.floor(Math.random() * CONFIG.GRID_COLS);
            if (state.grid[r] && state.grid[r][c]) state.grid[r][c].frozen = true;
        }
    }
}

function nextLevel() {
    state.level++;
    if (state.level > LEVELS.length) {
        showGameOver('Tüm seviyeler tamamlandı! Sen bir Narenciye Kaptanısın!');
        return;
    }
    showScreen(null);
    resetLevelState();
    loadLevel(state.level);
    state.currentScreen = 'playing';
}

function restartGame() {
    startGame();
}

function backToMenu() {
    showScreen('startScreen');
    state.currentScreen = 'start';
}

function showHowToPlay() {
    showScreen('howToPlayScreen');
    state.currentScreen = 'howToPlay';
}

function hideHowToPlay() {
    showScreen('startScreen');
    state.currentScreen = 'start';
}

function showCredits() {
    showScreen('creditsScreen');
    state.currentScreen = 'credits';
}

// Input Handling
let dragStart = null;
let swipeStartX = 0;
let swipeStartY = 0;

function handleMouseDown(e) {
    if (state.currentScreen !== 'playing' || state.isAnimating) return;
    
    state.lastActionTime = state.time;
    state.hintMove = null;
    
    const pos = getMousePos(e);
    const cell = getCellFromPos(pos.x, pos.y);
    
    if (state.isUsingPowerup) {
        if (cell && state.grid[cell.row] && state.grid[cell.row][cell.col]) {
            // Powerup creates a massive explosion (Bomb + Rocket H + Rocket V)
            state.grid[cell.row][cell.col] = null;
            if(typeof activateSpecial === 'function') {
                activateSpecial('bomb', cell.row, cell.col, null, true);
                activateSpecial('rocket_h', cell.row, cell.col, null, true);
                activateSpecial('rocket_v', cell.row, cell.col, null, true);
            }
            
            AudioEngine.playExplosion();
            createExplosion(pos.x, pos.y, '#90EE90');
            state.isUsingPowerup = false;
            state.powerupCharge = 0;
            updatePowerupUI();
            state.isAnimating = true;
            setTimeout(() => processMatches(), 200);
        }
        return;
    }

    if (cell) { 
        dragStart = cell; 
        state.selectedCell = cell; 
        swipeStartX = pos.x;
        swipeStartY = pos.y;
    }
}

function handleMouseMove(e) {
    if(state.currentScreen !== 'playing') return;
    const pos = getMousePos(e);
    const cell = getCellFromPos(pos.x, pos.y);
    
    for (let row = 0; row < CONFIG.GRID_ROWS; row++) {
        for (let col = 0; col < CONFIG.GRID_COLS; col++) {
            if (state.grid[row] && state.grid[row][col]) {
                state.grid[row][col].hover = (cell && cell.row === row && cell.col === col);
            }
        }
    }
}

function handleMouseUp(e) {
    if (!dragStart || state.currentScreen !== 'playing' || state.isAnimating) {
        dragStart = null; state.selectedCell = null; return;
    }
    const pos = getMousePos(e);
    
    const dx = pos.x - swipeStartX;
    const dy = pos.y - swipeStartY;
    const minSwipeDist = 20;

    let targetCell = null;

    if (Math.abs(dx) > minSwipeDist || Math.abs(dy) > minSwipeDist) {
        if (Math.abs(dx) > Math.abs(dy)) {
            // Horizontal
            if (dx > 0) targetCell = { row: dragStart.row, col: dragStart.col + 1 };
            else targetCell = { row: dragStart.row, col: dragStart.col - 1 };
        } else {
            // Vertical
            if (dy > 0) targetCell = { row: dragStart.row + 1, col: dragStart.col };
            else targetCell = { row: dragStart.row - 1, col: dragStart.col };
        }
    } else {
        const cell = getCellFromPos(pos.x, pos.y);
        if (cell && isAdjacent(dragStart, cell)) {
            targetCell = cell;
        }
    }
    
    if (targetCell && targetCell.row >= 0 && targetCell.row < CONFIG.GRID_ROWS && targetCell.col >= 0 && targetCell.col < CONFIG.GRID_COLS) {
        if (isAdjacent(dragStart, targetCell)) {
            swapCells(dragStart, targetCell);
        }
    }
    dragStart = null; state.selectedCell = null;
}

function handleTouchStart(e) {
    if(e.cancelable) e.preventDefault();
    const touch = e.touches[0];
    handleMouseDown({clientX: touch.clientX, clientY: touch.clientY});
}

function handleTouchMove(e) {
    if(e.cancelable) e.preventDefault();
    const touch = e.touches[0];
    handleMouseMove({clientX: touch.clientX, clientY: touch.clientY});
}

function handleTouchEnd(e) {
    if(e.cancelable) e.preventDefault();
    const touch = e.changedTouches[0];
    handleMouseUp({clientX: touch.clientX, clientY: touch.clientY});
}

function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return { 
        x: (e.clientX - rect.left) * scaleX, 
        y: (e.clientY - rect.top) * scaleY 
    };
}

function getCellFromPos(x, y) {
    const col = Math.floor((x - CONFIG.GRID_OFFSET_X) / CONFIG.CELL_SIZE);
    const row = Math.floor((y - CONFIG.GRID_OFFSET_Y) / CONFIG.CELL_SIZE);
    if (row >= 0 && row < CONFIG.GRID_ROWS && col >= 0 && col < CONFIG.GRID_COLS) return {row, col};
    return null;
}

function isAdjacent(a, b) {
    return Math.abs(a.row - b.row) + Math.abs(a.col - b.col) === 1;
}

// ------------------------------------------------------------------
// Cinematic Loading Screen Logic
// ------------------------------------------------------------------
function startEpicLoading() {
    state.currentScreen = 'loading';
    showScreen('loadingScreen');

    const bar = document.getElementById('cinematicLoadingBar');
    const totalTime = 5200;
    const interval = 50;
    const minDisplay = 5200;
    const startTime = Date.now();
    let timeElapsed = 0;
    let isComplete = false;

    const loadingInterval = setInterval(() => {
        timeElapsed += interval;
        const progress = Math.min((timeElapsed / totalTime) * 100, 98);
        if (bar) bar.style.width = progress + '%';
    }, interval);

    loadImages(() => {
        isComplete = true;
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, minDisplay - elapsed);

        setTimeout(() => {
            clearInterval(loadingInterval);
            if (bar) bar.style.width = '100%';
            finishLoading();
        }, remaining);
    });
}

function finishLoading() {
    const bar = document.getElementById('cinematicLoadingBar');
    if(bar) bar.style.width = '100%';
    
    const loader = document.getElementById('loadingScreen');
    
    // Use transitionend to guarantee bug-free transition
    loader.addEventListener('transitionend', function handler(e) {
        if (e.propertyName === 'opacity' || e.propertyName === 'visibility') {
            loader.removeEventListener('transitionend', handler);
            showScreen('startScreen');
        }
    });

    // Trigger the fade out CSS
    loader.classList.add('loading-fade-out');
    
    // Fallback in case transition fails/isn't supported
    setTimeout(() => {
        if (!document.getElementById('startScreen').classList.contains('hidden')) return; // Already triggered
        showScreen('startScreen');
    }, 2000);
}

// Start
window.onload = init;
