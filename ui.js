// UI and DOM Manipulation

function updateUI() {
    document.getElementById('scoreValue').textContent = state.score.toLocaleString();
    document.getElementById('lemonCount').textContent = state.lemonsCollected;
    document.getElementById('maxComboDisplay').textContent = state.maxCombo;
    document.getElementById('movesValue').textContent = state.movesLeft;
    
    const progress = Math.min((state.score / state.targetScore) * 100, 100);
    document.getElementById('progressFill').style.width = progress + '%';
    
    document.getElementById('movesValue').style.color = state.movesLeft <= 5 ? '#ff4444' : '#90EE90';
    
    // Charge Powerup based on score progress (charge 1% for every 1% of score progress, plus combo bonus handled in engine)
    updatePowerupUI();
}

function loadSettings() {
    const volume = parseInt(localStorage.getItem('nk_volume'));
    if (!isNaN(volume)) state.volume = volume;

    const music = localStorage.getItem('nk_music_enabled');
    const effects = localStorage.getItem('nk_sound_effects');
    const visuals = localStorage.getItem('nk_reduce_visuals');
    const hints = localStorage.getItem('nk_show_hints');

    state.musicEnabled = music === null ? true : music === 'true';
    state.soundEffectsEnabled = effects === null ? true : effects === 'true';
    state.reduceVisualEffects = visuals === 'true';
    state.showHints = hints === null ? true : hints === 'true';

    if (typeof AudioEngine !== 'undefined') {
        AudioEngine.setMasterVolume(state.volume / 100);
        AudioEngine.musicEnabled = state.musicEnabled;
        AudioEngine.effectsEnabled = state.soundEffectsEnabled;
    }
}

function applySettingsUI() {
    const slider = document.getElementById('volumeSlider');
    const text = document.getElementById('volumeText');
    if (slider) slider.value = state.volume;
    if (text) text.textContent = '%' + state.volume;

    setToggleButton('musicToggle', state.musicEnabled, 'Açık', 'Kapalı');
    setToggleButton('effectsToggle', state.soundEffectsEnabled, 'Açık', 'Kapalı');
    setToggleButton('visualsToggle', !state.reduceVisualEffects, 'Normal', 'Azaltılmış');
    setToggleButton('hintToggle', state.showHints, 'Açık', 'Kapalı');
}

function setToggleButton(id, enabled, trueLabel, falseLabel) {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.textContent = enabled ? trueLabel : falseLabel;
    btn.classList.toggle('active', enabled);
    btn.classList.toggle('off', !enabled);
}

function toggleMusic() {
    state.musicEnabled = !state.musicEnabled;
    localStorage.setItem('nk_music_enabled', state.musicEnabled);
    if (typeof AudioEngine !== 'undefined') {
        AudioEngine.musicEnabled = state.musicEnabled;
    }
    setToggleButton('musicToggle', state.musicEnabled, 'Açık', 'Kapalı');
}

function toggleSoundEffects() {
    state.soundEffectsEnabled = !state.soundEffectsEnabled;
    localStorage.setItem('nk_sound_effects', state.soundEffectsEnabled);
    if (typeof AudioEngine !== 'undefined') {
        AudioEngine.effectsEnabled = state.soundEffectsEnabled;
    }
    setToggleButton('effectsToggle', state.soundEffectsEnabled, 'Açık', 'Kapalı');
}

function toggleVisualEffects() {
    state.reduceVisualEffects = !state.reduceVisualEffects;
    localStorage.setItem('nk_reduce_visuals', state.reduceVisualEffects);
    setToggleButton('visualsToggle', !state.reduceVisualEffects, 'Normal', 'Azaltılmış');
}

function toggleHints() {
    state.showHints = !state.showHints;
    localStorage.setItem('nk_show_hints', state.showHints);
    if (!state.showHints) state.hintMove = null;
    setToggleButton('hintToggle', state.showHints, 'Açık', 'Kapalı');
}

function updatePowerupUI() {
    const powerupFill = document.getElementById('powerupFill');
    const powerupBtn = document.getElementById('powerupBtn');
    if(powerupFill && powerupBtn) {
        powerupFill.style.height = state.powerupCharge + '%';
        if (state.powerupCharge >= 100) {
            powerupBtn.classList.add('ready');
        } else {
            powerupBtn.classList.remove('ready');
            state.isUsingPowerup = false;
        }
        
        if (state.isUsingPowerup) {
            powerupBtn.classList.add('active');
        } else {
            powerupBtn.classList.remove('active');
        }
    }
}

function togglePowerup() {
    if (state.powerupCharge >= 100 && state.currentScreen === 'playing') {
        state.isUsingPowerup = !state.isUsingPowerup;
        updatePowerupUI();
    }
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

    const pauseBtn = document.getElementById('pauseBtn');
    if (pauseBtn) {
        if (state.currentScreen === 'playing') {
            pauseBtn.classList.remove('hidden');
        } else {
            pauseBtn.classList.add('hidden');
        }
    }
}

function togglePause() {
    if (state.currentScreen === 'playing') {
        state.currentScreen = 'paused';
        showScreen('pauseScreen');
    } else if (state.currentScreen === 'paused') {
        state.currentScreen = 'playing';
        showScreen(null);
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
    
    // Educational Facts (Mersin Narenciye Ansiklopedisi)
    const facts = [
        "Biliyor muydunuz? Türkiye limon üretiminin %48'i Mersin'den karşılanmaktadır.",
        "Biliyor muydunuz? Lamas limonu sadece Mersin'in Erdemli ilçesindeki Lamas Vadisi'nde mikroklima sayesinde yetişir.",
        "Biliyor muydunuz? Mersin Narenciye Festivali'nde sergilenen devasa ejderha, denizaltı gibi figürlerin 100 binlerce GERÇEK narenciyeden yapıldığını biliyor muydunuz?",
        "Biliyor muydunuz? Enterdonat limonu en çok ihraç edilen ve uç kısmı hafif yana eğik olan bir türdür.",
        "Biliyor muydunuz? Narenciye sadece meyve değil, Mersin ekonomisinin 'bel kemiği' olarak kabul edilir."
    ];
    
    let info = levelData.desc || '';
    if (state.level === 6) info += '<br><br><span style="color:#90EE90">Uçkurutan Böceği\'ni yendin! Ağaçların güvende!</span>';
    else if (state.level === 17) info += '<br><br><span style="color:#FFD700; font-size:20px;">TEBRİKLER! Dünya narenciye lideri oldun!</span>';
    
    info += `<br><br><div style="padding:15px; background:rgba(0,0,0,0.3); border-left:4px solid #FFA500; text-align:left; font-size:14px; font-weight:normal;">
                <strong style="color:#FFA500;">Mersin Narenciye Ansiklopedisi:</strong><br>
                ${facts[(state.level - 1) % facts.length]}
             </div>`;
    
    document.getElementById('levelInfo').innerHTML = info;
}

function populateLevelMap() {
    const grid = document.getElementById('levelMapGrid');
    if (!grid) return;
    grid.innerHTML = '';
    
    // Read highest completed level from localStorage if available, else 1
    const highestLevel = parseInt(localStorage.getItem('nk_highest_level')) || 1;
    
    LEVELS.forEach((levelData, index) => {
        const lvlNum = index + 1;
        const node = document.createElement('div');
        node.className = 'level-node';
        
        if (levelData.boss) node.classList.add('boss-node');
        
        if (lvlNum < highestLevel) {
            node.classList.add('completed');
            node.textContent = '✓';
        } else if (lvlNum === highestLevel) {
            node.textContent = lvlNum;
        } else {
            node.classList.add('locked');
            node.innerHTML = '<svg style="width:32px;height:32px" viewBox="0 0 24 24"><path fill="currentColor" d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z" /></svg>';
        }
        
        node.onclick = () => {
            if (lvlNum <= highestLevel) {
                state.level = lvlNum;
                startGame(); // Starts loading -> story -> actual game
            }
        };
        
        grid.appendChild(node);
    });
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

function showSettings() {
    state.previousScreen = state.currentScreen;
    loadSettings();
    applySettingsUI();
    showScreen('settingsScreen');
    state.currentScreen = 'settings';
}

function closeSettings() {
    if (state.previousScreen === 'paused') {
        state.currentScreen = 'paused';
        showScreen('pauseScreen');
    } else {
        state.currentScreen = 'map';
        showScreen('mapScreen');
    }
}

function updateVolume(value) {
    const volume = parseInt(value, 10) || 0;
    state.volume = volume;
    document.getElementById('volumeText').textContent = '%' + volume;
    localStorage.setItem('nk_volume', volume);
    if(typeof AudioEngine !== 'undefined') {
        AudioEngine.setMasterVolume(volume / 100);
    }
}

