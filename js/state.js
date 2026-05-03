// Global Game State
const state = {
    currentScreen: 'start', // 'start', 'loading', 'tutorial', 'howToPlay', 'playing', 'paused', 'gameover', 'levelcomplete'
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
