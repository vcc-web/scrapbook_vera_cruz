// Tree Integration with Flipbook
let treePageActive = false;
let treePageOverlay = null;
let treeCloseBtn = null;

// Check if user is on the special tree page (center of book)
function isOnTreePages() {
    if (window.book) {
        const currentPage = window.book.turn('page');
        const totalPages = window.book.turn('pages');
        const centerPage = Math.floor(totalPages / 2);
        
        // Show tree on pages 28-29 (center of 56-page book)
        return currentPage === centerPage || currentPage === centerPage + 1;
    }
    return false;
}

// Initialize tree page overlay
function initTreePageOverlay() {
    treePageOverlay = document.getElementById('treePageOverlay');
    treeCloseBtn = document.getElementById('treeCloseBtn');
    
    if (treeCloseBtn) {
        treeCloseBtn.addEventListener('click', hideTreePage);
    }
    
    // Listen for book page changes
    if (window.book) {
        window.book.bind('turned', function(event, page, view) {
            if (isOnTreePages()) {
                showTreePage();
            } else {
                hideTreePage();
            }
        });
    }
}

// Show tree page overlay
function showTreePage() {
    if (treePageOverlay && !treePageActive) {
        treePageActive = true;
        treePageOverlay.classList.add('active');
        
        // Initialize tree if not already done
        if (!window.treeInstance) {
            window.treeInstance = new Tree("#treeCanvas");
        } else {
            // Resume animation if tree exists
            window.treeInstance.startAnimation();
        }
    }
}

// Expose showTreePage globally
window.showTreePage = showTreePage;

// Hide tree page overlay
function hideTreePage() {
    if (treePageOverlay && treePageActive) {
        treePageActive = false;
        treePageOverlay.classList.remove('active');
        
        // Pause animation
        if (window.treeInstance) {
            window.treeInstance.pauseAnimation();
        }
    }
}

window.addEventListener("DOMContentLoaded", () => {
    // Initialize tree page overlay first
    initTreePageOverlay();
    
    // Check if we should show tree page immediately
    setTimeout(() => {
        if (isOnTreePages()) {
            showTreePage();
        }
    }, 1000); // Wait for book to initialize
});

class Tree {
    constructor(qs) {
        this.C = document.querySelector(qs);
        this.c = this.C?.getContext("2d");
        this.S = window.devicePixelRatio;
        this.W = 800;
        this.H = 800;
        this.branches = [];
        this.leaves = [];
        this.flyingLeaves = []; // Folhas que estão voando
        this.storedLeaves = { 1: [], 2: [], 3: [] }; // Folhas armazenadas por seção
        this.darkTheme = false;
        this.debug = false;
        this.decaying = false;
        this.floorY = 685;
        this.gravity = 0.098;
        this.loopDelay = 500;
        this.loopEnd = Utils.dateValue;
        this.maxGenerations = 10;
        this.animationSpeed = 1.0; // Multiplicador de velocidade global
        this.clickRadius = 80; // Raio de detecção de clique
        this.animationRunning = false; // Controla se a animação está rodando
        
        // Pontos de destino para cada seção
        this.sectionTargets = {
            1: { x: 100, y: 100 },   // Canto superior esquerdo
            2: { x: 400, y: 50 },    // Centro superior
            3: { x: 700, y: 100 }    // Canto superior direito
        };
        
        // Áreas das seções da árvore (será calculado depois)
        this.treeSections = {};

        if (this.C) this.init();
    }
    get allBranchesComplete() {
        const { branches, maxGenerations } = this;

        return branches.filter(b => {
            const isLastGen = b.generation === maxGenerations;
            return b.progress >= 1 && isLastGen;
        }).length > 0;
    }
    get allLeavesComplete() {
        return !!this.leaves.length && this.leaves.every(leaf => leaf.progress === 1);
    }
    get allFlyingLeavesComplete() {
        return this.flyingLeaves.length === 0;
    }
    get totalStoredLeaves() {
        return this.storedLeaves[1].length + this.storedLeaves[2].length + this.storedLeaves[3].length;
    }
    get debugInfo() {
        return [
            { item: 'Pixel Ratio', value: this.S },
            { item: 'Branches', value: this.branches.length },
            { item: 'Branches Complete', value: this.allBranchesComplete },
            { item: 'Leaves', value: this.leaves.length },
            { item: 'Leaves Complete', value: this.allLeavesComplete },
            { item: 'Flying Leaves', value: this.flyingLeaves.length },
            { item: 'Stored S1/S2/S3', value: `${this.storedLeaves[1].length}/${this.storedLeaves[2].length}/${this.storedLeaves[3].length}` },
            { item: 'Decaying', value: this.decaying },
        ];
    }
    get lastGeneration() {
        const genIntegers = this.branches.map(b => b.generation);
        return [...new Set(genIntegers)].pop();
    }
    get trunk() {
        return {
            angle: 0,
            angleInc: 20,
            decaySpeed: 0.0625,
            diameter: 10,
            distance: 120,
            distanceFade: 0.2,
            generation: 1,
            growthSpeed: 0.04 * this.animationSpeed, // Aplicar multiplicador
            hadBranches: false,
            progress: 0,
            x1: 400,
            y1: 680,
            x2: 400,
            y2: 560
        };
    }
    detectTheme(mq) {
        this.darkTheme = mq.matches;
    }
    draw() {
        const { c, W, H, debug, branches, leaves, flyingLeaves, storedLeaves, sectionTargets } = this;

        c.clearRect(0, 0, W, H);

        // debug info
        if (debug === true) {
            const lightness = this.darkTheme ? 90 : 10;
            const foreground = `hsl(223,10%,${lightness}%)`;
            c.fillStyle = foreground;
            c.strokeStyle = foreground;

            const textX = 24;

            this.debugInfo.forEach((d, i) => {
                c.fillText(`${d.item}: ${d.value}`, textX, 24 * (i + 1));
            });
        }

        // Removido: indicadores visuais das seções e pontos de destino

        // Desenhar divisões das seções na árvore (linhas de referência)
        c.strokeStyle = 'rgba(200, 200, 200, 0.3)';
        c.lineWidth = 1;
        c.setLineDash([2, 2]);
        
        // Seção 1: esquerda (x < 350)
        c.beginPath();
        c.moveTo(350, 0);
        c.lineTo(350, H);
        c.stroke();
        
        // Seção 3: direita (x > 450)
        c.beginPath();
        c.moveTo(450, 0);
        c.lineTo(450, H);
        c.stroke();
        
        c.setLineDash([]);

        // branches com cores baseadas na geração
        branches.forEach(b => {
            // Cores do tronco/galhos: marrom mais escuro para o tronco, mais claro para galhos
            const brownIntensity = Math.min(70, 20 + (b.generation * 4));
            const branchColor = `hsl(30, 60%, ${brownIntensity}%)`;

            c.strokeStyle = branchColor;
            c.lineWidth = b.diameter;
            c.beginPath();
            c.moveTo(b.x1, b.y1);
            c.lineTo(
                b.x1 + (b.x2 - b.x1) * b.progress,
                b.y1 + (b.y2 - b.y1) * b.progress
            );
            c.stroke();
            c.closePath();
        });

        // folhas verdes fixas com cor fixa
        leaves.forEach(leaf => {
            c.fillStyle = leaf.color;
            c.globalAlpha = leaf.progress;
            c.beginPath();
            c.arc(leaf.x, leaf.y, leaf.size * leaf.progress, 0, 2 * Math.PI);
            c.fill();
            c.closePath();
            c.globalAlpha = 1;
        });

        // folhas voando
        flyingLeaves.forEach(leaf => {
            c.fillStyle = leaf.color;
            c.globalAlpha = leaf.opacity;
            c.beginPath();
            c.arc(leaf.x, leaf.y, leaf.size, 0, 2 * Math.PI);
            c.fill();
            c.closePath();
            c.globalAlpha = 1;
        });

        // folhas armazenadas nos pontos de destino
        // Indicadores visuais e folhas armazenadas removidos conforme solicitado
    }
    grow() {
        // start with the trunk
        if (!this.branches.length && Utils.dateValue - this.loopEnd > this.loopDelay) {
            this.branches.push(this.trunk);
        }

        if (!this.allBranchesComplete) {
            this.branches.forEach(b => {
                if (b.progress < 1) {
                    // branch growth
                    b.progress += b.growthSpeed;

                    if (b.progress > 1) {
                        b.progress = 1;

                        // Criar folhas nos galhos das últimas 7 gerações, priorizando cobertura da copa
                        if (b.generation >= this.maxGenerations - 6) {
                            // Limite global de folhas para evitar sobrecarga
                            const maxTotalLeaves = 3800;
                            if (this.leaves.length < maxTotalLeaves) {
                                // Prioridade: galhos médios e intermediários recebem mais folhas, galhos finais menos
                                let baseLeaves;
                                if (b.generation <= this.maxGenerations - 4) {
                                    // Galhos iniciais/intermediários: mais folhas para cobrir copa
                                    baseLeaves = 3;
                                } else if (b.generation <= this.maxGenerations - 2) {
                                    // Galhos médios/finais: quantidade média
                                    baseLeaves = 2;
                                } else {
                                    // Galhos finais: poucas folhas
                                    baseLeaves = 1;
                                }
                                const numLeaves = Utils.randomInt(baseLeaves, baseLeaves + 1);
                                for (let i = 0; i < numLeaves; i++) {
                                    // Fração do comprimento do galho (de 15% a 95%)
                                    const frac = 0.15 + Math.random() * 0.8;
                                    // Ângulo de dispersão (+/- 20 graus)
                                    let angle = b.angle + Utils.randomInt(-20, 20);
                                    // Para galhos finais, espalhar mais para as bordas da copa
                                    if (baseLeaves === 1) {
                                        // Se o galho está à esquerda, jogue folhas para esquerda; à direita, para direita
                                        if (b.x2 < 350) {
                                            angle -= 25 + Utils.randomInt(0, 15); // espalha para esquerda
                                        } else if (b.x2 > 450) {
                                            angle += 25 + Utils.randomInt(0, 15); // espalha para direita
                                        } else {
                                            // centro, dispersão normal
                                        }
                                    }
                                    // Posição ao longo do galho
                                    const leafX = b.x1 + (b.x2 - b.x1) * frac + Utils.randomInt(-6, 6);
                                    const leafY = b.y1 + (b.y2 - b.y1) * frac + Utils.randomInt(-6, 6);
                                    // Tamanho e cor variados
                                    const leafSize = Utils.randomInt(3, 7);
                                    const hue = 120 + Utils.randomInt(-12, 12);
                                    const sat = 60 + Utils.randomInt(-12, 12);
                                    const lum = 30 + Utils.randomInt(0, 25);
                                    this.leaves.push({
                                        x: leafX,
                                        y: leafY,
                                        size: leafSize,
                                        progress: 0,
                                        growthSpeed: (0.02 + Math.random() * 0.02) * this.animationSpeed,
                                        color: `hsl(${hue}, ${sat}%, ${lum}%)`,
                                        section: this.getLeafSection(leafX)
                                    });
                                }
                            }
                        }
                    }

                } else if (!b.hadBranches && b.generation < this.maxGenerations) {
                    b.hadBranches = true;
                    // create two new branches
                    const lean = 5;
                    const angleLeft = b.angle - (b.angleInc + Utils.randomInt(-lean, lean));
                    const angleRight = b.angle + (b.angleInc + Utils.randomInt(-lean, lean));
                    const distance = b.distance * (1 - b.distanceFade);
                    const generation = b.generation + 1;

                    const leftBranch = {
                        angle: angleLeft,
                        angleInc: b.angleInc,
                        decaySpeed: b.decaySpeed,
                        diameter: Math.floor(b.diameter * 0.9),
                        distance,
                        distanceFade: b.distanceFade,
                        generation,
                        growthSpeed: b.growthSpeed * this.animationSpeed,
                        hadBranches: false,
                        progress: 0,
                        x1: b.x2,
                        y1: b.y2,
                        x2: b.x2 + Utils.endPointX(angleLeft, distance),
                        y2: b.y2 - Utils.endPointY(angleLeft, distance)
                    };

                    const rightBranch = { ...leftBranch };
                    rightBranch.angle = angleRight;
                    rightBranch.x2 = b.x2 + Utils.endPointX(angleRight, distance);
                    rightBranch.y2 = b.y2 - Utils.endPointY(angleRight, distance);

                    this.branches.push(leftBranch, rightBranch);
                }
            });
        }

        // Crescimento das folhas
        if (!this.allLeavesComplete) {
            this.leaves.forEach(leaf => {
                if (leaf.progress < 1) {
                    leaf.progress += leaf.growthSpeed;
                    if (leaf.progress > 1) leaf.progress = 1;
                }
            });
        }

        // Árvore apenas cresce, sem decaimento
    }
    
    updateFlyingLeaves() {
        this.flyingLeaves = this.flyingLeaves.filter(leaf => {
            // Mover folha em direção ao destino
            const dx = leaf.targetX - leaf.x;
            const dy = leaf.targetY - leaf.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 5) {
                // Folha chegou ao destino
                if (leaf.returning) {
                    // Folha retornando à árvore - adicionar de volta às folhas
                    this.leaves.push({
                        x: leaf.originalX,
                        y: leaf.originalY,
                        size: leaf.size,
                        color: leaf.color,
                        progress: 1,
                        growthSpeed: 0.02,
                        section: leaf.section
                    });
                } else {
                    // Folha indo para o ponto de destino - armazenar na seção
                    this.storedLeaves[leaf.section].push({
                        size: leaf.size,
                        color: leaf.color,
                        originalX: leaf.originalX,
                        originalY: leaf.originalY,
                        section: leaf.section
                    });
                }
                return false;
            }
            
            // Mover folha
            leaf.x += dx * leaf.speed;
            leaf.y += dy * leaf.speed;
            
            // Manter opacidade para folhas retornando
            if (!leaf.returning) {
                leaf.opacity = Math.max(0.5, leaf.opacity - 0.005);
            }
            
            // Adicionar rotação suave
            leaf.rotation += leaf.rotationSpeed;
            
            return leaf.opacity > 0;
        });
    }
    
    getLeafSection(x) {
        if (x < 350) return 1;      // Seção esquerda
        if (x > 450) return 3;      // Seção direita
        return 2;                   // Seção central
    }
    
    getClickedSection(x) {
        return this.getLeafSection(x);
    }
    
    handleClick(x, y) {
        console.log(`Processando clique em (${x}, ${y})`);
        
        // Determinar qual seção foi clicada
        const clickedSection = this.getClickedSection(x);
        console.log(`Seção clicada: ${clickedSection}`);

        // Sinal global para outros scripts
        const event = new CustomEvent('treeSectionClicked', { detail: { section: clickedSection } });
        window.dispatchEvent(event);
    }
    
    getClickedTargetSection(x, y) {
        // Verificar se clicou em algum ponto de destino
        for (const section of [1, 2, 3]) {
            const target = this.sectionTargets[section];
            const distance = Math.sqrt((x - target.x) ** 2 + (y - target.y) ** 2);
            if (distance < 30) { // Raio de 30 pixels ao redor do ponto
                return section;
            }
        }
        return null;
    }
    
    returnStoredLeaves(section) {
        const stored = this.storedLeaves[section];
        if (stored.length === 0) {
            console.log(`Nenhuma folha da seção ${section} para retornar`);
            return;
        }
        
        console.log(`Retornando ${stored.length} folhas da seção ${section}`);
        
        // Transformar folhas armazenadas em folhas voadoras retornando
        stored.forEach(leaf => {
            this.flyingLeaves.push({
                x: this.sectionTargets[section].x,
                y: this.sectionTargets[section].y,
                originalX: leaf.originalX,
                originalY: leaf.originalY,
                targetX: leaf.originalX + Utils.randomInt(-5, 5),
                targetY: leaf.originalY + Utils.randomInt(-5, 5),
                size: leaf.size,
                color: leaf.color,
                opacity: 1,
                speed: 0.03 + Math.random() * 0.02,
                rotation: 0,
                rotationSpeed: (Math.random() - 0.5) * 0.2,
                returning: true,
                section: leaf.section
            });
        });
        
        // Limpar folhas da seção
        this.storedLeaves[section] = [];
        
        // Reiniciar o loop de animação se estava parado
        if (!this.animationRunning && this.flyingLeaves.length > 0) {
            console.log('Reiniciando loop de animação para folhas retornando');
            this.animationRunning = true;
            this.run();
        }
    }
    
    getCanvasCoordinates(event) {
        const rect = this.C.getBoundingClientRect();
        const scaleX = this.W / rect.width;
        const scaleY = this.H / rect.height;
        
        return {
            x: (event.clientX - rect.left) * scaleX,
            y: (event.clientY - rect.top) * scaleY
        };
    }
    decay() {
        if (this.fruit.length) {
            // fruit fall
            this.fruit = this.fruit.filter(f => f.decayTime > 0);

            this.fruit.forEach(f => {
                if (f.timeUntilFall <= 0) {
                    f.y += f.yVelocity;
                    f.yVelocity += this.gravity;

                    const bottom = this.floorY - f.r;

                    if (f.y >= bottom) {
                        f.y = bottom;
                        f.yVelocity *= -f.restitution;
                    }

                    --f.decayTime;

                } else if (!f.decaying) {
                    --f.timeUntilFall;
                }
            });
        }
        if (this.allFruitFalling || !this.fruit.length) {
            // branch decay
            this.branches = this.branches.filter(b => b.progress > 0);

            this.branches.forEach(b => {
                if (b.generation === this.lastGeneration) b.progress -= b.decaySpeed;
            });
        }
        if (!this.branches.length && !this.fruit.length) {
            // back to the trunk
            this.decaying = false;
            this.loopEnd = Utils.dateValue;
        }
    }
    init() {
        this.setupCanvas();
        this.setupThemeDetection();
        this.setupClickHandler();
        this.animationRunning = true;
        this.run();
    }
    run() {
        this.draw();

        // Apenas crescimento, sem decaimento
        this.grow();
        
        // Atualizar folhas voando
        this.updateFlyingLeaves();

        // Continua o loop se ainda há crescimento ou folhas voando E se a animação deve continuar
        const shouldContinue = (!this.allBranchesComplete || !this.allLeavesComplete || !this.allFlyingLeavesComplete) && this.animationRunning;
        
        if (shouldContinue) {
            requestAnimationFrame(this.run.bind(this));
        } else {
            if (!this.animationRunning) {
                console.log('Animação pausada pelo usuário');
            } else {
                console.log('Animação pausada - todas as folhas e galhos completos');
            }
            this.animationRunning = false;
        }
    }
    
    // Métodos de controle da animação
    startAnimation() {
        if (!this.animationRunning) {
            console.log('Iniciando animação da árvore');
            this.animationRunning = true;
            this.run();
        }
    }
    
    pauseAnimation() {
        console.log('Pausando animação da árvore');
        this.animationRunning = false;
    }
    
    setupCanvas() {
        const { C, c, W, H, S } = this;

        // properly scale the canvas based on the pixel ratio
        C.width = W * S;
        C.height = H * S;
        C.style.width = "100%";
        C.style.height = "auto";
        c.scale(S, S);

        // set unchanging styles
        c.font = "16px sans-serif";
        c.lineCap = "round";
        c.lineJoin = "round";
    }
    setupThemeDetection() {
        if (window.matchMedia) {
            const mq = window.matchMedia("(prefers-color-scheme: dark)");
            this.detectTheme(mq);
            mq.addEventListener("change", this.detectTheme.bind(this));
        }
    }
    
    setupClickHandler() {
        this.C.addEventListener('click', (event) => {
            console.log('Clique detectado no canvas');
            const coords = this.getCanvasCoordinates(event);
            console.log('Coordenadas do clique:', coords);
            console.log('Total de folhas na árvore:', this.leaves.length);
            this.handleClick(coords.x, coords.y);
        });
        
        // Adicionar cursor pointer para indicar interatividade
        this.C.style.cursor = 'pointer';
    }
}

class Utils {
    static get dateValue() {
        return +new Date();
    }
    static endPointX(angleInDeg, distance) {
        return Math.sin(angleInDeg * Math.PI / 180) * distance;
    }
    static endPointY(angleInDeg, distance) {
        return Math.cos(angleInDeg * Math.PI / 180) * distance;
    }
    static randomInt(min, max) {
        return min + Math.round(Math.random() * (max - min));
    }
}