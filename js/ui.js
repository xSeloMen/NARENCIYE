// UI and DOM Manipulation

function updateUI() {
    document.getElementById('scoreValue').textContent = state.score.toLocaleString();
    document.getElementById('lemonCount').textContent = state.lemonsCollected;
    document.getElementById('maxComboDisplay').textContent = state.maxCombo;
    document.getElementById('movesValue').textContent = state.movesLeft;
    
    const progress = Math.min((state.score / state.targetScore) * 100, 100);
    document.getElementById('progressFill').style.width = progress + '%';
    
    document.getElementById('movesValue').style.color = state.movesLeft <= 5 ? '#ff4444' : '#90EE90';
}

function updateBossUI() {
    if(!state.isBossLevel) return;
    const healthPercent = Math.max((state.bossHealth / state.bossMaxHealth) * 100, 0);
    document.getElementById('bossHealthFill').style.width = healthPercent + '%';
}

function showComboText(combo) {
    const display = document.getElementById('comboDisplay');
    const texts = ['GÜZEL!', 'HARİKA!', 'MÜTHİŞ!', 'EFSANE!', 'NARENCİYE PATLAMASI!', 'TARİHİ KOMBO!'];
    const text = combo >= 6 ? texts[Math.min(combo - 6, texts.length - 1)] : (combo >= 4 ? 'SÜPER!' : 'KOMBO!');
    
    display.innerHTML = `
        <div class="combo-multiplier">${combo}x</div>
        <div class="combo-text">${text}</div>
    `;
    display.style.opacity = '1';
    display.style.transform = 'translate(-50%, -50%) scale(1.3)';
    state.shakeIntensity = 8;
    
    setTimeout(() => {
        display.style.opacity = '0';
        display.style.transform = 'translate(-50%, -50%) scale(0.5)';
    }, 1500);
}

function showAchievement(text) {
    const popup = document.getElementById('achievementPopup');
    popup.innerHTML = `<img src="assets/images/lemon.png" onerror="this.src=''" alt="🏆" /> ${text}`;
    popup.style.right = '30px';
    setTimeout(() => { popup.style.right = '-400px'; }, 4000);
}

function showScreen(screenId) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(s => s.classList.add('hidden'));
    
    if(screenId) {
        document.getElementById(screenId).classList.remove('hidden');
    }
}

function loadLevelUI(lvl) {
    const levelData = LEVELS[Math.min(lvl - 1, LEVELS.length - 1)];
    
    document.getElementById('levelValue').textContent = lvl;
    document.getElementById('levelName').textContent = levelData.name;
    document.getElementById('movesValue').textContent = state.movesLeft;
    document.getElementById('progressText').textContent = `HEDEF: ${state.targetScore.toLocaleString()} PUAN`;
    
    if (state.isBossLevel) {
        document.getElementById('bossUI').style.display = 'block';
        document.getElementById('bossName').textContent = state.bossName;
        updateBossUI();
    } else {
        document.getElementById('bossUI').style.display = 'none';
    }
    
    updateUI();
}

function showGameOver(reason) {
    state.currentScreen = 'gameover';
    showScreen('gameOverScreen');
    document.getElementById('gameOverReason').textContent = reason;
    document.getElementById('finalScore').textContent = state.score.toLocaleString();
    document.getElementById('finalLevel').textContent = state.level;
    document.getElementById('finalLemons').textContent = state.lemonsCollected;
    document.getElementById('finalCombo').textContent = state.maxCombo;
}

function showLevelComplete() {
    state.currentScreen = 'levelcomplete';
    showScreen('levelCompleteScreen');
    document.getElementById('levelScore').textContent = state.score.toLocaleString();
    
    const levelData = LEVELS[Math.min(state.level - 1, LEVELS.length - 1)];
    document.getElementById('levelCompleteText').textContent = `${levelData.name} başarıyla tamamlandı!`;
    
    const ratio = state.score / state.targetScore;
    document.getElementById('levelStars').textContent = ratio >= 1.5 ? '⭐⭐⭐' : (ratio >= 1.2 ? '⭐⭐' : '⭐');
    
    let info = levelData.desc || '';
    if (state.level === 6) info += '<br><br><span style="color:#90EE90">Uçkurutan Böceği\'ni yendin! Ağaçların güvende!</span>';
    else if (state.level === 17) info += '<br><br><span style="color:#FFD700; font-size:20px;">TEBRİKLER! Dünya narenciye lideri oldun!</span>';
    
    document.getElementById('levelInfo').innerHTML = info;
}

// 3D Tilt Effect
document.addEventListener('mousemove', (e) => {
    if (state.currentScreen !== 'playing') return;
    
    const panels = document.querySelectorAll('.ui-panel');
    const xAxis = (window.innerWidth / 2 - e.pageX) / 50;
    const yAxis = (window.innerHeight / 2 - e.pageY) / 50;
    
    panels.forEach(panel => {
        panel.style.transform = `perspective(1000px) rotateY(${xAxis}deg) rotateX(${yAxis}deg) translateZ(10px)`;
    });
});

