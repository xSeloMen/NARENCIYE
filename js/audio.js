// Audio Synthesizer Engine (No external sound files needed!)

const AudioEngine = {
    ctx: null,
    initialized: false,
    
    init() {
        if (!this.initialized) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            this.initialized = true;
        }
    },
    
    playTone(freq, type, duration, vol = 0.1) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    },
    
    playMatch(comboLevel) {
        this.init();
        // Base frequency goes up with combo
        const baseFreq = 300 + (comboLevel * 50);
        this.playTone(baseFreq, 'sine', 0.2, 0.15);
        
        // Add a tiny sparkle overtone for higher combos
        if (comboLevel >= 3) {
            setTimeout(() => {
                this.playTone(baseFreq * 2, 'triangle', 0.1, 0.05);
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
        this.playTone(400, 'sine', 0.1, 0.05);
    },
    
    playInvalid() {
        this.init();
        this.playTone(150, 'sawtooth', 0.2, 0.1);
    },
    
    playBossHit() {
        this.init();
        this.playTone(80, 'square', 0.5, 0.3);
    },
    
    playLevelComplete() {
        this.init();
        // A nice little arpeggio
        const notes = [440, 554, 659, 880]; // A major chord
        notes.forEach((freq, i) => {
            setTimeout(() => {
                this.playTone(freq, 'sine', 0.3, 0.1);
            }, i * 150);
        });
    }
};
