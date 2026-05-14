// Global Game State
const state = {
    currentScreen: 'start', // 'start', 'loading', 'tutorial', 'howToPlay', 'playing', 'paused', 'gameover', 'levelcomplete', 'settings', 'map', 'story'
    previousScreen: null,
    score: 0,
    level: 1,
    lemonsCollected: 0,
    maxCombo: 0,
    bossesDefeated: 0,
    movesLeft: 25,
    targetScore: 1000,
    
    // Grid State
    grid: [],
    selectedCell: null,
    isAnimating: false,
    
    // Boss State
    isBossLevel: false,
    bossHealth: 100,
    bossMaxHealth: 100,
    bossName: '',
    
    // Combo State
    currentCombo: 0,
    comboTimer: null,
    
    // Powerup and Hint State
    lastActionTime: 0,
    hintMove: null,
    isUsingPowerup: false,
    powerupCharge: 0,
    
    // Settings State
    volume: 50,
    musicEnabled: true,
    soundEffectsEnabled: true,
    reduceVisualEffects: false,
    showHints: true,
    
    // Render State
    bgOffset: 0,
    time: 0,
    shakeIntensity: 0,
    particles: [],
    floatingTexts: [],
    achievements: [],
    
    // Images cache
    imagesLoaded: false,
    images: {}
};

function resetLevelState() {
    state.grid = [];
    state.selectedCell = null;
    state.isAnimating = false;
    state.currentCombo = 0;
    state.particles = [];
    state.floatingTexts = [];
    state.lastActionTime = state.time;
    state.hintMove = null;
    state.isUsingPowerup = false;
    state.powerupCharge = 0;
}

function resetGameState() {
    state.score = 0;
    state.level = 1;
    state.lemonsCollected = 0;
    state.maxCombo = 0;
    state.bossesDefeated = 0;
    state.achievements = [];
    resetLevelState();
}
