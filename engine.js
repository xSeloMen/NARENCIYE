// Core Game Logic (Match 3 Engine)

function initGrid() {
    state.grid = [];
    for (let row = 0; row < CONFIG.GRID_ROWS; row++) {
        state.grid[row] = [];
        for (let col = 0; col < CONFIG.GRID_COLS; col++) {
            state.grid[row][col] = createRandomCell(row, col);
        }
    }
    
    // Clear initial matches without points
    let attempts = 0;
    while (findMatches().length > 0 && attempts < 10) {
        removeMatches(false);
        fillEmptyCells();
        attempts++;
    }
}

function createRandomCell(row, col) {
    const types = ['lemon', 'orange', 'mandarin', 'grapefruit', 'lime'];
    return {
        type: types[Math.floor(Math.random() * types.length)],
        special: null, 
        frozen: false, 
        scale: 1, 
        hover: false, 
        bounce: false,
        // Visual coordinates for animation
        renderX: CONFIG.GRID_OFFSET_X + col * CONFIG.CELL_SIZE,
        renderY: CONFIG.GRID_OFFSET_Y + row * CONFIG.CELL_SIZE
    };
}

function findMatches() {
    const matches = [];
    
    // Horizontal
    for (let row = 0; row < CONFIG.GRID_ROWS; row++) {
        let count = 1;
        for (let col = 1; col < CONFIG.GRID_COLS; col++) {
            if (canMatch(state.grid[row][col], state.grid[row][col-1])) count++;
            else {
                if (count >= 3) {
                    for (let i = col - count; i < col; i++) matches.push({row, col: i});
                }
                count = 1;
            }
        }
        if (count >= 3) {
            for (let i = CONFIG.GRID_COLS - count; i < CONFIG.GRID_COLS; i++) matches.push({row, col: i});
        }
    }
    
    // Vertical
    for (let col = 0; col < CONFIG.GRID_COLS; col++) {
        let count = 1;
        for (let row = 1; row < CONFIG.GRID_ROWS; row++) {
            if (canMatch(state.grid[row][col], state.grid[row-1][col])) count++;
            else {
                if (count >= 3) {
                    for (let i = row - count; i < row; i++) matches.push({row: i, col});
                }
                count = 1;
            }
        }
        if (count >= 3) {
            for (let i = CONFIG.GRID_ROWS - count; i < CONFIG.GRID_ROWS; i++) matches.push({row: i, col});
        }
    }
    
    // Deduplicate
    const uniqueMatches = [];
    const seen = new Set();
    for (const match of matches) {
        const key = `${match.row},${match.col}`;
        if (!seen.has(key)) {
            seen.add(key);
            uniqueMatches.push(match);
        }
    }
    return uniqueMatches;
}

function canMatch(a, b) {
    if (!a || !b) return false;
    if (a.frozen || b.frozen) return false;
    if (a.type === b.type) return true;
    if (a.special === SPECIAL_TYPES.RAINBOW || b.special === SPECIAL_TYPES.RAINBOW) return true;
    return false;
}

function findPossibleMove() {
    // Clone grid visually to test swaps
    for (let r = 0; r < CONFIG.GRID_ROWS; r++) {
        for (let c = 0; c < CONFIG.GRID_COLS; c++) {
            // Test Right Swap
            if (c < CONFIG.GRID_COLS - 1) {
                swapVirtual(r, c, r, c + 1);
                if (findMatches().length > 0) {
                    swapVirtual(r, c, r, c + 1); // Revert
                    return { r1: r, c1: c, r2: r, c2: c + 1 };
                }
                swapVirtual(r, c, r, c + 1); // Revert
            }
            // Test Down Swap
            if (r < CONFIG.GRID_ROWS - 1) {
                swapVirtual(r, c, r + 1, c);
                if (findMatches().length > 0) {
                    swapVirtual(r, c, r + 1, c); // Revert
                    return { r1: r, c1: c, r2: r + 1, c2: c };
                }
                swapVirtual(r, c, r + 1, c); // Revert
            }
        }
    }
    return null;
}

function swapVirtual(r1, c1, r2, c2) {
    const temp = state.grid[r1][c1];
    state.grid[r1][c1] = state.grid[r2][c2];
    state.grid[r2][c2] = temp;
}

function activateSpecial(special, row, col, type, awardPoints = true) {
    const explode = (x, y, color) => {
        if (awardPoints) createExplosion(x, y, color);
    };

    if (special === SPECIAL_TYPES.BOMB) {
        for (let r = row - 1; r <= row + 1; r++) {
            for (let c = col - 1; c <= col + 1; c++) {
                if (r >= 0 && r < CONFIG.GRID_ROWS && c >= 0 && c < CONFIG.GRID_COLS && state.grid[r][c]) {
                    state.grid[r][c] = null;
                    explode(CONFIG.GRID_OFFSET_X + c * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2, CONFIG.GRID_OFFSET_Y + r * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2, '#ff4444');
                }
            }
        }
    } else if (special === SPECIAL_TYPES.ROCKET_H) {
        for (let c = 0; c < CONFIG.GRID_COLS; c++) {
            if (state.grid[row][c]) {
                state.grid[row][c] = null;
                explode(CONFIG.GRID_OFFSET_X + c * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2, CONFIG.GRID_OFFSET_Y + row * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2, '#4444ff');
            }
        }
    } else if (special === SPECIAL_TYPES.ROCKET_V) {
        for (let r = 0; r < CONFIG.GRID_ROWS; r++) {
            if (state.grid[r][col]) {
                state.grid[r][col] = null;
                explode(CONFIG.GRID_OFFSET_X + col * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2, CONFIG.GRID_OFFSET_Y + r * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2, '#4444ff');
            }
        }
    } else if (special === SPECIAL_TYPES.RAINBOW) {
        for (let r = 0; r < CONFIG.GRID_ROWS; r++) {
            for (let c = 0; c < CONFIG.GRID_COLS; c++) {
                if (state.grid[r][c] && state.grid[r][c].type === type) {
                    state.grid[r][c] = null;
                    explode(CONFIG.GRID_OFFSET_X + c * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2, CONFIG.GRID_OFFSET_Y + r * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2, '#FFD700');
                }
            }
        }
    }
}

function removeMatches(awardPoints = true) {
    const matches = findMatches();
    if (matches.length === 0) return 0;
    
    let points = 0, combo = 0, hasLemon = false;

    // Activate specials
    matches.forEach(m => {
        const cell = state.grid[m.row][m.col];
        if (cell && cell.special) {
            activateSpecial(cell.special, m.row, m.col, cell.type, awardPoints);
        }
    });

    matches.forEach(m => {
        const cell = state.grid[m.row][m.col];
        if (!cell) return;
        
        const fruit = FRUIT_TYPES.find(f => f.id === cell.type);
        const basePoints = fruit ? fruit.points : 10;
        points += Math.floor(basePoints * (1 + combo * 0.15));
        combo++;
        
        if (awardPoints && combo === 1) {
            AudioEngine.playMatch(combo);
        }

        if (awardPoints && cell.type === 'lemon') { 
            state.lemonsCollected++; 
            hasLemon = true; 
        }

        if (awardPoints) {
            createExplosion(
                CONFIG.GRID_OFFSET_X + m.col * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2,
                CONFIG.GRID_OFFSET_Y + m.row * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2,
                fruit ? fruit.color : '#FFD700',
                cell.type === 'lemon' ? 'lemon' : null
            );
        }

        if (matches.length >= 5 && combo === 1 && !cell.special) {
            createSpecialPiece(m.row, m.col, cell.type, matches.length, awardPoints);
        } else {
            state.grid[m.row][m.col] = null;
        }
    });

    if (awardPoints) {
        state.currentCombo += combo;
        if (state.comboTimer) clearTimeout(state.comboTimer);
        state.comboTimer = setTimeout(() => { state.currentCombo = 0; }, 2000);

        if (combo >= 3) {
            showComboText(combo);
            if (state.currentCombo > state.maxCombo) state.maxCombo = state.currentCombo;
        }
        
        const centerMatch = matches[Math.floor(matches.length / 2)];
        showFloatingText('+' + Math.floor(points),
            CONFIG.GRID_OFFSET_X + centerMatch.col * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2,
            CONFIG.GRID_OFFSET_Y + centerMatch.row * CONFIG.CELL_SIZE - 20, '#FFD700', 32);
        
        state.score += Math.floor(points);
        
        // Charge powerup
        state.powerupCharge += combo * 2 + (matches.length > 3 ? 5 : 0);
        if(state.powerupCharge > 100) state.powerupCharge = 100;
        if(typeof updatePowerupUI === 'function') updatePowerupUI();

        if (state.isBossLevel) {
            const damage = combo * 5 + (hasLemon ? 15 : 0);
            state.bossHealth -= damage;
            if (state.bossHealth < 0) state.bossHealth = 0;
            updateBossUI();
            AudioEngine.playBossHit();
            if (damage > 15) showFloatingText('-' + damage + '!', CONFIG.CANVAS_WIDTH - 150, 250, '#ff4444', 36);
        }

        checkAchievements(combo, hasLemon);
    }
    
    return points;
}

function createSpecialPiece(row, col, type, matchCount, visual = true) {
    if (matchCount >= 6) {
        state.grid[row][col] = { 
            type: type, special: SPECIAL_TYPES.RAINBOW, frozen: false, scale: 1.2, hover: false, bounce: true,
            renderX: CONFIG.GRID_OFFSET_X + col * CONFIG.CELL_SIZE, renderY: CONFIG.GRID_OFFSET_Y + row * CONFIG.CELL_SIZE
        };
        if (visual) showFloatingText('GÖKKUŞAĞI!', CONFIG.GRID_OFFSET_X + col * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE/2, CONFIG.GRID_OFFSET_Y + row * CONFIG.CELL_SIZE - 40, '#FFD700', 24);
    } else if (matchCount === 5) {
        const isH = Math.random() > 0.5;
        state.grid[row][col] = { 
            type: type, special: isH ? SPECIAL_TYPES.ROCKET_H : SPECIAL_TYPES.ROCKET_V, frozen: false, scale: 1.1, hover: false, bounce: true,
            renderX: CONFIG.GRID_OFFSET_X + col * CONFIG.CELL_SIZE, renderY: CONFIG.GRID_OFFSET_Y + row * CONFIG.CELL_SIZE
        };
        if (visual) showFloatingText(isH ? 'FÜZE!' : 'ROKET!', CONFIG.GRID_OFFSET_X + col * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE/2, CONFIG.GRID_OFFSET_Y + row * CONFIG.CELL_SIZE - 40, '#4444FF', 22);
    }
}

function fillEmptyCells() {
    // 1. Move existing cells down and fill empty slots instantly
    for (let col = 0; col < CONFIG.GRID_COLS; col++) {
        let emptyCount = 0;
        // Count empty from bottom up
        for (let row = CONFIG.GRID_ROWS - 1; row >= 0; row--) {
            if (!state.grid[row][col]) {
                emptyCount++;
            } else if (emptyCount > 0) {
                // Move cell down
                state.grid[row + emptyCount][col] = state.grid[row][col];
                state.grid[row][col] = null;
            }
        }
        // Fill top with new cells
        for(let row = 0; row < emptyCount; row++) {
            const newCell = createRandomCell(row, col);
            // Visual offset for animation
            newCell.renderY = CONFIG.GRID_OFFSET_Y - (emptyCount - row) * CONFIG.CELL_SIZE;
            state.grid[row][col] = newCell;
        }
    }
    
    // 2. Anti-Cascade System: Guarantee ZERO matches on the board after refilling
    // We check the board and if any matches exist involving newly generated cells, we scramble them.
    let attempts = 0;
    let matches = findMatches();
    while (matches.length > 0 && attempts < 20) {
        let fixed = false;
        const types = ['lemon', 'orange', 'mandarin', 'grapefruit', 'lime'];
        
        for (const m of matches) {
            const cell = state.grid[m.row][m.col];
            // If it's a newly generated cell (it hasn't reached its visual renderY yet)
            if (cell && cell.renderY < CONFIG.GRID_OFFSET_Y + m.row * CONFIG.CELL_SIZE) {
                cell.type = types[Math.floor(Math.random() * types.length)];
                fixed = true;
                break; // fix one and rescan
            }
        }
        
        if (!fixed) {
            // Force fix the first cell of the match if no "new" cell was found
            const m = matches[0];
            state.grid[m.row][m.col].type = types[Math.floor(Math.random() * types.length)];
        }
        
        matches = findMatches();
        attempts++;
    }
}

function checkAchievements(combo, hasLemon) {
    if (combo >= 5 && state.achievements.indexOf('combo5') === -1) {
        state.achievements.push('combo5');
        showAchievement('5\'li Kombo Ustası!');
    }
    if (state.lemonsCollected >= 50 && state.achievements.indexOf('lemons50') === -1) {
        state.achievements.push('lemons50');
        showAchievement('Limon Hasatçısı!');
    }
    if (state.score >= 10000 && state.achievements.indexOf('score10k') === -1) {
        state.achievements.push('score10k');
        showAchievement('10,000 Puan!');
    }
}

function processMatches() {
    const matches = findMatches();
    if (matches.length > 0) {
        removeMatches();
        setTimeout(() => {
            fillEmptyCells();
            setTimeout(() => {
                const newMatches = findMatches();
                if (newMatches.length > 0) {
                    processMatches();
                } else {
                    state.isAnimating = false;
                }
            }, 300);
        }, 250);
    } else {
        state.isAnimating = false;
    }
}

function swapCells(cellA, cellB) {
    if (!state.grid[cellA.row] || !state.grid[cellA.row][cellA.col] || 
        !state.grid[cellB.row] || !state.grid[cellB.row][cellB.col]) {
        return;
    }
    
    if (state.grid[cellA.row][cellA.col].frozen || state.grid[cellB.row][cellB.col].frozen) {
        showFloatingText('BUZLU!', CONFIG.GRID_OFFSET_X + cellA.col * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE/2, 
                        CONFIG.GRID_OFFSET_Y + cellA.row * CONFIG.CELL_SIZE, '#87CEEB', 28);
        state.shakeIntensity = 5; 
        return;
    }
    
    const tempCell = state.grid[cellA.row][cellA.col];
    state.grid[cellA.row][cellA.col] = state.grid[cellB.row][cellB.col];
    state.grid[cellB.row][cellB.col] = tempCell;

    const matches = findMatches();
    if (matches.length > 0) {
        state.movesLeft--;
        state.isAnimating = true;
        AudioEngine.playSwap();
        setTimeout(() => processMatches(), 200);
    } else {
        const revertTemp = state.grid[cellA.row][cellA.col];
        state.grid[cellA.row][cellA.col] = state.grid[cellB.row][cellB.col];
        state.grid[cellB.row][cellB.col] = revertTemp;
        
        AudioEngine.playInvalid();
        showFloatingText('X', CONFIG.GRID_OFFSET_X + cellA.col * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE/2, 
                        CONFIG.GRID_OFFSET_Y + cellA.row * CONFIG.CELL_SIZE, '#ff4444', 32);
    }
}

function shuffleBoard() {
    state.isAnimating = true;
    state.shakeIntensity = 15;
    if(typeof showFloatingText === 'function') {
        showFloatingText('KARIŞTIRILIYOR!', CONFIG.CANVAS_WIDTH/2, CONFIG.CANVAS_HEIGHT/2, '#FFD700', 60);
    }
    if(typeof AudioEngine !== 'undefined') AudioEngine.playExplosion();
    
    let cells = [];
    for (let r = 0; r < CONFIG.GRID_ROWS; r++) {
        for (let c = 0; c < CONFIG.GRID_COLS; c++) {
            if (state.grid[r][c] && !state.grid[r][c].frozen) {
                cells.push(state.grid[r][c]);
            }
        }
    }
    
    for (let i = cells.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = cells[i];
        cells[i] = cells[j];
        cells[j] = temp;
    }
    
    let index = 0;
    for (let r = 0; r < CONFIG.GRID_ROWS; r++) {
        for (let c = 0; c < CONFIG.GRID_COLS; c++) {
            if (state.grid[r][c] && !state.grid[r][c].frozen) {
                state.grid[r][c] = cells[index];
                // Reset render pos so they fly from center
                state.grid[r][c].renderX = CONFIG.CANVAS_WIDTH / 2;
                state.grid[r][c].renderY = CONFIG.CANVAS_HEIGHT / 2;
                index++;
            }
        }
    }
    
    setTimeout(() => {
        processMatches();
    }, 1000);
}
