// Audio Synthesizer Engine (No external sound files needed!)

const AudioEngine = {
    ctx: null,
    initialized: false,
    masterVolume: 0.5,
    musicEnabled: true,
    effectsEnabled: true,
    
    setMasterVolume(val) {
        this.masterVolume = val;
    },
    
    init() {
        if (!this.initialized) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            this.initialized = true;
            this.startAmbient();
        }
    },
    
    startAmbient() {
        if (!this.ctx) return;
        
        const playChord = () => {
            if (!this.musicEnabled) {
                setTimeout(playChord, 5000);
                return;
            }

            if(state.currentScreen !== 'playing') {
                setTimeout(playChord, 1000);
                return;
            }
            
            const rootFreq = 220; // A3
            const intervals = [1, 1.25, 1.5]; // Major chord ratio
            intervals.forEach(interval => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                
                osc.type = 'sine';
                osc.frequency.value = rootFreq * interval;
                
                gain.gain.setValueAtTime(0, this.ctx.currentTime);
                gain.gain.linearRampToValueAtTime(0.02 * this.masterVolume, this.ctx.currentTime + 2); // fade in
                gain.gain.linearRampToValueAtTime(0, 0, this.ctx.currentTime + 6); // fade out
                
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                
                osc.start();
                osc.stop(this.ctx.currentTime + 6);
            });
            
            setTimeout(playChord, 5000);
        };
        
        playChord();
    },
    
    playTone(freq, type, duration, vol = 0.1, category = 'effect') {
        if (!this.ctx) return;
        if (category === 'music' && !this.musicEnabled) return;
        if (category === 'effect' && !this.effectsEnabled) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        
        gain.gain.setValueAtTime(vol * this.masterVolume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    },
    
    playMatch(comboLevel) {
        this.init();
        // C Major Pentatonic Scale for happy, positive match sounds
        // C5, D5, E5, G5, A5, C6, D6
        const baseFreqs = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66]; 
        const freqIndex = Math.min(comboLevel - 3, baseFreqs.length - 1);
        const baseFreq = baseFreqs[Math.max(0, freqIndex)];
        
        this.playTone(baseFreq, 'sine', 0.2, 0.15);
        
        // Add a bright sparkle overtone for higher combos
        if (comboLevel >= 3) {
            setTimeout(() => {
                this.playTone(baseFreq * 1.5, 'triangle', 0.15, 0.08);
            }, 50);
        }
    },
    
    playExplosion() {
        this.init();
        this.playTone(100, 'square', 0.3, 0.2);
        setTimeout(() => this.playTone(50, 'sawtooth', 0.4, 0.2), 50);
    },
    
    playSwap() {
        this.init();
        this.playTone(600, 'sine', 0.1, 0.05); // Brighter swap
    },
    
    playInvalid() {
        this.init();
        this.playTone(250, 'sawtooth', 0.15, 0.1);
    },
    
    playBossHit() {
        this.init();
        this.playTone(150, 'square', 0.4, 0.3);
    },
    
    playLevelComplete() {
        this.init();
        // Bright C Major Arpeggio
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, i) => {
            setTimeout(() => {
                this.playTone(freq, 'sine', 0.4, 0.15);
            }, i * 120);
        });
    },

    playUIHover() {
        this.init();
        this.playTone(800, 'sine', 0.05, 0.03);
    },
    
    playUIClick() {
        this.init();
        // High pitched "drop" sound (very positive/refreshing)
        this.playTone(1200, 'sine', 0.1, 0.08);
        setTimeout(() => {
            this.playTone(1600, 'sine', 0.1, 0.08);
        }, 30);
    }
};
