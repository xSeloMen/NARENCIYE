// Game Configuration Constants
const CONFIG = {
    GRID_ROWS: 9,
    GRID_COLS: 9,
    CELL_SIZE: 72, // Slightly larger cells for better touch target and visibility
    GRID_OFFSET_X: 130, // Adjusted for new cell size and canvas size
    GRID_OFFSET_Y: 150,
    ANIMATION_SPEED: 0.15, // Easing speed for swaps
    DROP_SPEED: 0.2, // Easing speed for falling blocks
    PARTICLE_COUNT: 14,
    MAX_PARTICLES: 120,
    CANVAS_WIDTH: 1050,
    CANVAS_HEIGHT: 850
};

// Fruit Types with Image Mappings
const FRUIT_TYPES = [
    { id: 'lemon', imgId: 'imgLemon', color: '#FFFF00', name: 'Lamas Limonu', points: 20, glow: '#FFFF44' },
    { id: 'orange', imgId: 'imgOrange', color: '#FF6600', name: 'Portakal', points: 20, glow: '#FF7722' },
    { id: 'mandarin', imgId: 'imgMandarin', color: '#FF4400', name: 'Mandalina', points: 20, glow: '#FF5522' },
    { id: 'grapefruit', imgId: 'imgGrapefruit', color: '#FF0000', name: 'Greyfurt', points: 30, glow: '#FF3333' },
    { id: 'lime', imgId: 'imgLime', color: '#00DD00', name: 'Mayer Limonu', points: 30, glow: '#00FF00' }
];

// Special Match Types
const SPECIAL_TYPES = { 
    BOMB: 'bomb', 
    ROCKET_H: 'rocket_h', 
    ROCKET_V: 'rocket_v', 
    RAINBOW: 'rainbow' 
};

// Boss Definitions
const BOSSES = {
    ucurutan: { name: 'UÇKURUTAN BÖCEĞİ', health: 400, imgId: 'imgBossBug', color: '#8B4513', desc: 'Ağaçları kurutuyor! Kombolarla yen!' },
    don: { name: 'DON ZARARLISI', health: 500, emoji: '❄️', color: '#87CEEB', desc: 'Tahtaları donduruyor! Özel narenciyelerle kır!' },
    kuraklik: { name: 'KURAKLIK', health: 600, emoji: '☀️', color: '#D2691E', desc: 'Su kaynakları kuruyor! Hızlı eşleştir!' }
};

// Level Map
const LEVELS = [
    { name: 'Mersin Fidanlığı', target: 2500, moves: 20, boss: null, desc: 'Mersin, Türkiye limon üretiminin %48\'ini karşılar!' },
    { name: 'Erdemli Bahçeleri', target: 5000, moves: 20, boss: null, desc: 'Erdemli, Mersin\'in önemli narenciye ilçelerinden biridir.' },
    { name: 'Silifke Portakallığı', target: 8000, moves: 22, boss: null, desc: 'Silifke, portakal ve mandalina üretiminde zengindir.' },
    { name: 'Anamur Tarımı', target: 11500, moves: 22, boss: null, desc: 'Anamur, muz ve narenciye yetiştiriciliğiyle ünlüdür.' },
    { name: 'Tarsus Tarımı', target: 15500, moves: 24, boss: null, desc: 'Tarsus, tarihi ve tarımıyla öne çıkan bir ilçedir.' },
    { name: 'UÇKURUTAN SALDIRISI!', target: 20000, moves: 25, boss: 'ucurutan', desc: 'Uçkurutan böceği ağaçları kurutur! Özel narenciyelerle savun!' },
    { name: 'Lamas Limon Hasadı', target: 25000, moves: 26, boss: null, desc: 'Lamas limonu, Mersin\'in Lamas ilçesinden adını alır.' },
    { name: 'Enterdonat Çeşidi', target: 30000, moves: 28, boss: null, desc: 'Enterdonat, kalın kabuğu ve zengin aromasıyla ünlüdür.' },
    { name: 'Kütdiken Kalitesi', target: 36000, moves: 30, boss: null, desc: 'Kütdiken, en uzun depolanabilen limon çeşididir.' },
    { name: 'Mersin Limon İhracatı', target: 43000, moves: 32, boss: null, desc: 'Mersin limonu dünyanın dört bir yanına ihraç edilir!' },
    { name: 'Rusya Pazarı', target: 51000, moves: 35, boss: null, desc: 'Rusya, Türk narenciyesinin önemli ithalatçısıdır.' },
    { name: 'Irak ve Ortadoğu', target: 60000, moves: 38, boss: null, desc: 'Irak, mandalina ithalatında büyük artış göstermiştir.' },
    { name: 'DON ZARARLISI!', target: 70000, moves: 40, boss: 'don', desc: 'Don olayı meyveleri dondurur! Dikkatli ol!' },
    { name: 'Avrupa Birliği', target: 82000, moves: 42, boss: null, desc: 'AB pazarına girmek için kalite standartları yüksektir.' },
    { name: 'Ukrayna ve Polonya', target: 95000, moves: 45, boss: null, desc: 'Doğu Avrupa ülkeleri narenciye talebi artmaktadır.' },
    { name: 'KURAKLIK TEHLİKESİ', target: 110000, moves: 48, boss: 'kuraklik', desc: 'Küresel ısınma su kaynaklarını tüketiyor.' },
    { name: 'Dünya Lideri!', target: 130000, moves: 50, boss: null, desc: 'Tebrikler! Mersin narenciyesi dünya lideri oldu!' }
];
