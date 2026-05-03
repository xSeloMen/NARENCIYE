// Graphics and Rendering Engine

function loadImages(callback) {
    let loadedCount = 0;
    const totalImages = 6;
    
    const onLoad = () => {
        loadedCount++;
        if (loadedCount === totalImages) {
            state.imagesLoaded = true;
            if (callback) callback();
        }
    };

    const loadImg = (id, src) => {
        const img = new Image();
        img.onload = onLoad;
        img.onerror = onLoad; // Continue even if missing
        img.src = src;
        state.images[id] = img;
    };

    loadImg('imgLemon', 'assets/images/lemon.png');
    loadImg('imgOrange', 'assets/images/orange.png');
    loadImg('imgMandarin', 'assets/images/mandarin.png');
    loadImg('imgGrapefruit', 'assets/images/grapefruit.png');
    loadImg('imgLime', 'assets/images/lime.png');
    loadImg('imgBossBug', 'assets/images/boss_bug.png');
}

function render(ctx, canvas) {
    ctx.save();
    if (state.shakeIntensity > 0) {
        ctx.translate((Math.random() - 0.5) * state.shakeIntensity, (Math.random() - 0.5) * state.shakeIntensity);
    }
    
    // The background is mostly handled by CSS, but we can draw some grid lines and effects
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (state.currentScreen === 'playing' || state.currentScreen === 'paused') {
        drawGrid(ctx);
        drawParticles(ctx);
        drawFloatingTexts(ctx);
        drawBoss(ctx, canvas);
    }
    
    ctx.restore();
}

function drawGrid(ctx) {
    for (let row = 0; row < CONFIG.GRID_ROWS; row++) {
        for (let col = 0; col < CONFIG.GRID_COLS; col++) {
            const cell = state.grid[row] ? state.grid[row][col] : null;
            if (!cell) continue;
            
            // Interpolate position for smooth animation
            const targetX = CONFIG.GRID_OFFSET_X + col * CONFIG.CELL_SIZE;
            const targetY = CONFIG.GRID_OFFSET_Y + row * CONFIG.CELL_SIZE;
            
            cell.renderX += (targetX - cell.renderX) * CONFIG.ANIMATION_SPEED;
            cell.renderY += (targetY - cell.renderY) * CONFIG.DROP_SPEED;

            const x = cell.renderX;
            const y = cell.renderY;
            const centerX = x + CONFIG.CELL_SIZE / 2;
            const centerY = y + CONFIG.CELL_SIZE / 2;

            // Cell Background
            ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.beginPath();
            ctx.roundRect(x + 2, y + 2, CONFIG.CELL_SIZE - 4, CONFIG.CELL_SIZE - 4, 12);
            ctx.fill();

            // Selected cell highlight
            if (state.selectedCell && state.selectedCell.row === row && state.selectedCell.col === col) {
                ctx.strokeStyle = '#FFD700';
                ctx.lineWidth = 3;
                ctx.shadowColor = '#FFD700';
                ctx.shadowBlur = 20;
                ctx.beginPath();
                ctx.roundRect(x + 2, y + 2, CONFIG.CELL_SIZE - 4, CONFIG.CELL_SIZE - 4, 12);
                ctx.stroke();
                ctx.shadowBlur = 0;
            }

            if (cell.type) {
                const fruit = FRUIT_TYPES.find(f => f.id === cell.type);
                if (fruit) {
                    if (cell.special) drawSpecialEffect(ctx, centerX, centerY, cell.special, fruit.color);
                    
                    const bounce = cell.bounce ? Math.sin(state.time * 10) * 3 : 0;
                    const scale = cell.scale || 1;
                    const imgSize = (CONFIG.CELL_SIZE - 12) * scale;
                    
                    if (state.images[fruit.imgId] && state.images[fruit.imgId].complete && state.images[fruit.imgId].naturalWidth > 0) {
                        ctx.shadowColor = 'rgba(0,0,0,0.5)';
                        ctx.shadowBlur = 10;
                        if(cell.special) {
                            ctx.shadowColor = fruit.glow;
                            ctx.shadowBlur = 25;
                        }
                        ctx.drawImage(state.images[fruit.imgId], centerX - imgSize/2, centerY - imgSize/2 + bounce, imgSize, imgSize);
                        ctx.shadowBlur = 0;
                    } else {
                        // Fallback
                        ctx.fillStyle = fruit.color;
                        ctx.beginPath();
                        ctx.arc(centerX, centerY + bounce, imgSize/2, 0, Math.PI*2);
                        ctx.fill();
                    }

                    // Special Badges
                    if (cell.special === SPECIAL_TYPES.BOMB) drawBadge(ctx, centerX + 15, centerY - 15, '💣', '#ff4444');
                    else if (cell.special === SPECIAL_TYPES.ROCKET_H) drawBadge(ctx, centerX + 15, centerY - 15, '➡️', '#4444ff');
                    else if (cell.special === SPECIAL_TYPES.ROCKET_V) drawBadge(ctx, centerX + 15, centerY - 15, '⬆️', '#4444ff');
                    else if (cell.special === SPECIAL_TYPES.RAINBOW) drawBadge(ctx, centerX + 15, centerY - 15, '🌈', '#FFD700');
                }
            }

            if (cell.frozen) {
                ctx.fillStyle = 'rgba(135, 206, 235, 0.5)';
                ctx.beginPath();
                ctx.roundRect(x, y, CONFIG.CELL_SIZE, CONFIG.CELL_SIZE, 12);
                ctx.fill();
                ctx.font = '30px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('❄️', centerX, centerY);
            }
        }
    }
}

function drawBadge(ctx, x, y, text, color) {
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.beginPath();
    ctx.arc(x, y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
}

function drawSpecialEffect(ctx, x, y, special, color) {
    if (special === SPECIAL_TYPES.BOMB) {
        const pulse = Math.sin(state.time * 5) * 6;
        ctx.fillStyle = 'rgba(255, 68, 68, 0.3)';
        ctx.beginPath();
        ctx.arc(x, y, 35 + pulse, 0, Math.PI * 2);
        ctx.fill();
    } else if (special === SPECIAL_TYPES.ROCKET_H || special === SPECIAL_TYPES.ROCKET_V) {
        ctx.fillStyle = 'rgba(68, 68, 255, 0.25)';
        ctx.beginPath();
        ctx.arc(x, y, 30, 0, Math.PI * 2);
        ctx.fill();
    } else if (special === SPECIAL_TYPES.RAINBOW) {
        const colors = ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3'];
        for (let i = 0; i < 7; i++) {
            ctx.strokeStyle = colors[i];
            ctx.lineWidth = 3;
            ctx.globalAlpha = 0.5 + Math.sin(state.time * 4 + i) * 0.3;
            ctx.beginPath();
            ctx.arc(x, y, 25 + i * 3, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
    }
}

function drawBoss(ctx, canvas) {
    if (!state.isBossLevel) return;
    const boss = BOSSES[LEVELS[state.level-1] ? LEVELS[state.level-1].boss : null];
    if (!boss) return;
    
    const bossX = canvas.width - 150;
    const bossY = 250;
    const floatY = Math.sin(state.time * 2) * 15;
    
    if (boss.imgId && state.images[boss.imgId] && state.images[boss.imgId].complete && state.images[boss.imgId].naturalWidth > 0) {
        ctx.shadowColor = boss.color;
        ctx.shadowBlur = 40;
        ctx.drawImage(state.images[boss.imgId], bossX - 60, bossY - 60 + floatY, 120, 120);
        ctx.shadowBlur = 0;
    } else {
        ctx.font = '100px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = boss.color;
        ctx.shadowBlur = 40;
        ctx.fillText(boss.emoji || '👾', bossX, bossY + floatY);
        ctx.shadowBlur = 0;
    }
}

function createExplosion(x, y, color, imgType = null) {
    for (let i = 0; i < CONFIG.PARTICLE_COUNT; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 6;
        state.particles.push({
            x: x, y: y, 
            vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 2,
            life: 1, size: 4 + Math.random() * 8, color: color,
            gravity: 0.15, decay: 0.02 + Math.random() * 0.02, 
            rotation: 0, rotSpeed: (Math.random() - 0.5) * 0.2,
            isImage: false
        });
    }
    
    if (imgType) {
        const fruit = FRUIT_TYPES.find(f => f.id === imgType);
        if (fruit) {
            for (let i = 0; i < 3; i++) {
                const angle = Math.random() * Math.PI * 2;
                state.particles.push({
                    x: x, y: y, 
                    vx: Math.cos(angle) * 4, vy: Math.sin(angle) * 4 - 3,
                    life: 1.5, size: 24, imgId: fruit.imgId,
                    gravity: 0.1, decay: 0.015, rotation: Math.random() * Math.PI, rotSpeed: 0.1,
                    isImage: true
                });
            }
        }
    }
}

function drawParticles(ctx) {
    state.particles = state.particles.filter(p => {
        p.x += p.vx; 
        p.y += p.vy;
        p.vy += p.gravity;
        p.life -= p.decay;
        p.rotation += p.rotSpeed;
        
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        
        if (p.isImage && p.imgId && state.images[p.imgId] && state.images[p.imgId].complete) {
            ctx.drawImage(state.images[p.imgId], -p.size/2, -p.size/2, p.size, p.size);
        } else {
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(0, 0, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
        return p.life > 0;
    });
}

function showFloatingText(text, x, y, color, size) {
    state.floatingTexts.push({ 
        text: text, x: x, y: y, color: color, 
        life: 2.0, scale: 0.5, targetScale: 1, speed: 1.5, size: size || 28 
    });
}

function drawFloatingTexts(ctx) {
    state.floatingTexts = state.floatingTexts.filter(t => {
        t.y -= t.speed;
        t.life -= 0.02;
        t.scale += (t.targetScale - t.scale) * 0.2;
        
        ctx.save();
        ctx.globalAlpha = Math.min(t.life, 1);
        ctx.translate(t.x, t.y);
        ctx.scale(t.scale, t.scale);
        ctx.font = `900 ${t.size}px 'Fredoka One', cursive`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 10;
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#000';
        ctx.strokeText(t.text, 0, 0);
        
        ctx.fillStyle = t.color;
        ctx.shadowBlur = 0;
        ctx.fillText(t.text, 0, 0);
        ctx.restore();
        
        return t.life > 0;
    });
}
