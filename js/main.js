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
    
    // Preload images
    loadImages(() => {
        console.log("Images loaded successfully");
    });
}

function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    
    update(deltaTime);
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
            showLevelComplete();
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
    showFloatingText('BOSS YENİLDİ!', canvas.width/2, canvas.height/2 - 50, '#FFD700', 60);
    createExplosion(canvas.width/2, canvas.height/2, '#FFD700');
    state.shakeIntensity = 25;
    
    setTimeout(() => { showLevelComplete(); }, 2500);
}

function startGame() {
    showScreen('loadingScreen');
    state.currentScreen = 'loading';
    
    let progress = 0;
    const loadBar = document.getElementById('loadingBar');
    
    const interval = setInterval(() => {
        progress += 5;
        loadBar.style.width = progress + '%';
        if (progress >= 100) {
            clearInterval(interval);
            showScreen('tutorialScreen');
            state.currentScreen = 'tutorial';
        }
    }, 50);
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

// Input Handling
let dragStart = null;

function handleMouseDown(e) {
    if (state.currentScreen !== 'playing' || state.isAnimating) return;
    const pos = getMousePos(e);
    const cell = getCellFromPos(pos.x, pos.y);
    if (cell) { dragStart = cell; state.selectedCell = cell; }
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
    const cell = getCellFromPos(pos.x, pos.y);
    
    if (cell && isAdjacent(dragStart, cell)) {
        swapCells(dragStart, cell);
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

// Start
window.onload = init;
