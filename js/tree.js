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
}

// Show tree page overlay
function showTreePage() {
    if (treePageOverlay && !treePageActive) {
        treePageActive = true;
        treePageOverlay.classList.add('active');

        // Hide all normal tabs when tree page opens
        if (window.tabManager) {
            window.tabManager.hideNormalTabs();
            
            // Define the tree sections data with patron saints (sem imagens iniciais)
            const treeSectionsData = [
                {
                    id: 1,
                    image: null, // Sem imagem inicial
                    alt: 'São Bento',
                    onClick: (e) => handleTreeSectionClick(e, 1)
                },
                {
                    id: 2,
                    image: null, // Sem imagem inicial
                    alt: 'São Josemaría Escrivá',
                    onClick: (e) => handleTreeSectionClick(e, 2)
                },
                {
                    id: 3,
                    image: null, // Sem imagem inicial
                    alt: 'Santa Teresinha',
                    onClick: (e) => handleTreeSectionClick(e, 3)
                }
            ];

            // Ensure we have enough tabs available
            window.tabManager.ensureMinimumTabs(treeSectionsData.length);

            // Acquire tabs for tree sections
            const treeTabs = window.tabManager.acquireTabsForTree(treeSectionsData);
            console.log(`Acquired ${treeTabs.length} tabs for tree page`);

            // Activate the tabs with animation
            window.tabManager.activateTreeTabs();
        }

        // Initialize tree if not already done
        if (!window.treeInstance) {
            window.treeInstance = new Tree("#treeCanvas");
        } else {
            // Resume animation if tree exists
            window.treeInstance.startAnimation();
        }
    }
}

// Handle tree section clicks
function handleTreeSectionClick(event, sectionId) {
    event.stopPropagation();
    
    // Toggle the clicked state of the specific tab
    const tab = event.currentTarget;
    if (tab.classList.contains('clicked')) {
        tab.classList.remove('clicked');
    } else {
        tab.classList.add('clicked');
    }
    
    // Dispatch custom event for tree interaction
    const treeEvent = new CustomEvent('treeSectionClicked', { 
        detail: { section: sectionId } 
    });
    window.dispatchEvent(treeEvent);
    
    console.log(`Tree section ${sectionId} clicked`);
}

// Expose showTreePage globally
window.showTreePage = showTreePage;

// Hide tree page overlay
function hideTreePage() {
    if (treePageOverlay && treePageActive) {

        // Hide global scrapbook tabs when tree page closes
        if (window.tabManager) {
            // Use the robust tree tab release method (already has timing built-in)
            window.tabManager.releaseTreeTabs();
            
            // Restore normal tabs after tree tabs are released
            setTimeout(() => {
                window.tabManager.showNormalTabs();
            }, 1350);
            
            console.log('Tree tabs release initiated');
        }

        setTimeout(() => {
            treePageActive = false;
            treePageOverlay.classList.remove('active');
        }, 1300);

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
        this.fallingLeaves = [];
        this.darkTheme = false;
        this.debug = false;
        this.floorY = 685;
        this.gravity = 0.098;
        this.loopDelay = 500;
        this.loopEnd = Utils.dateValue;
        this.maxGenerations = 10;
        this.animationSpeed = 1.0; // Multiplicador de velocidade global
        this.clickRadius = 80; // Raio de detecção de clique
        this.animationRunning = false; // Controla se a animação está rodando
        
        // Ciclo das folhas
        this.cycleStarted = false;
        this.cyclePhase = 'growing'; // 'growing', 'yellowing', 'falling', 'regrowing'
        this.cycleTimer = 0;
        this.cycleDelayAfterGrowth = 8000; // 8 segundos após crescimento completo
        this.yellowingDuration = 4000; // 4 segundos para amarelar
        this.fallingDuration = 5000; // 5 segundos para cair
        this.regrowthDelay = 2000; // 2 segundos de pausa antes de rebrotar
        this.regrowthDuration = 6000; // 6 segundos para rebrotar gradualmente
        this.regrowthStartTime = 0;
        this.regrowthLeaves = []; // Array para armazenar folhas durante rebrotamento

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
        const { c, W, H, debug, branches, leaves } = this;

        c.clearRect(0, 0, W, H);

        // Draw simple 2D soil with grass
        const soilY = 700;
        const soilHeight = 60;
        const soilWidth = 420;

        c.save();
        c.beginPath();
        c.ellipse(W / 2, soilY, soilWidth, soilHeight, 0, 0, 2 * Math.PI);
        c.clip();

        // Draw soil base (brown gradient)
        const soilGradient = c.createLinearGradient(W / 2, soilY + soilHeight, W / 2, soilY - soilHeight);
        soilGradient.addColorStop(0, '#3e2723');  // Dark brown at bottom
        soilGradient.addColorStop(0.5, '#5d4037'); // Medium brown
        soilGradient.addColorStop(1, '#8d6e63');   // Light brown at top
        c.fillStyle = soilGradient;
        c.fillRect(W / 2 - soilWidth, soilY - soilHeight, soilWidth * 2, soilHeight * 2);

        // Draw grass layer on top (simple green gradient)
        const grassY = soilY - 25;
        const grassHeight = 35;
        const grassGradient = c.createLinearGradient(W / 2, grassY + grassHeight, W / 2, grassY - grassHeight);
        grassGradient.addColorStop(0, '#2e7d32');  // Dark green at bottom
        grassGradient.addColorStop(0.3, '#388e3c'); // Medium green
        grassGradient.addColorStop(0.7, '#4caf50'); // Bright green
        grassGradient.addColorStop(1, '#66bb6a');   // Light green at top
        c.fillStyle = grassGradient;

        // Draw grass as an ellipse on top of soil
        c.beginPath();
        c.ellipse(W / 2, grassY, soilWidth * 0.9, grassHeight, 0, 0, 2 * Math.PI);
        c.fill();

        // Add small flowers scattered on the grass
        const flowers = [
            { x: W / 2 - 120, y: grassY - 15, color: '#ff6b6b' }, // Red
            { x: W / 2 - 60, y: grassY - 20, color: '#ffd93d' },  // Yellow
            { x: W / 2 - 20, y: grassY - 18, color: '#ff6b6b' },  // Red
            { x: W / 2 + 40, y: grassY - 12, color: '#a8e6cf' },  // Light green
            { x: W / 2 + 90, y: grassY - 22, color: '#ffd93d' },  // Yellow
            { x: W / 2 + 140, y: grassY - 16, color: '#ff6b6b' }, // Red
            { x: W / 2 - 150, y: grassY - 8, color: '#a8e6cf' },  // Light green
            { x: W / 2 - 30, y: grassY - 10, color: '#ffd93d' },  // Yellow
            { x: W / 2 + 70, y: grassY - 25, color: '#ff6b6b' },  // Red
            { x: W / 2 + 110, y: grassY - 8, color: '#a8e6cf' }   // Light green
        ];

        flowers.forEach(flower => {
            // Draw flower center
            c.beginPath();
            c.arc(flower.x, flower.y, 2, 0, 2 * Math.PI);
            c.fillStyle = flower.color;
            c.fill();

            // Draw petals around the center
            for (let i = 0; i < 6; i++) {
                const angle = (i * 60) * Math.PI / 180;
                const petalX = flower.x + Math.cos(angle) * 4;
                const petalY = flower.y + Math.sin(angle) * 4;
                c.beginPath();
                c.arc(petalX, petalY, 1.5, 0, 2 * Math.PI);
                c.fillStyle = flower.color;
                c.globalAlpha = 0.8;
                c.fill();
                c.globalAlpha = 1;
            }
        });

        c.restore();

        // ...existing code...

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

        // folhas com ciclo de vida
        leaves.forEach(leaf => {
            if (leaf.cyclePhase === 'falling') {
                // Folhas caindo não são renderizadas aqui (serão renderizadas em fallingLeaves)
                return;
            }
            
            let currentColor = leaf.color;
            let alpha = leaf.progress;
            
            // Se está amarelando, interpolar entre verde e amarelo
            if (leaf.cyclePhase === 'yellowing') {
                const green = leaf.originalColor;
                const yellowHue = 50; // Tom amarelo
                const yellowSat = 80;
                const yellowLum = 60;
                const yellow = `hsl(${yellowHue}, ${yellowSat}%, ${yellowLum}%)`;
                
                // Interpolar cores baseado no yellowProgress
                const yellowFactor = leaf.yellowProgress;
                const greenFactor = 1 - yellowFactor;
                
                // Extrair valores HSL do verde original
                const greenMatch = green.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
                if (greenMatch) {
                    const greenH = parseInt(greenMatch[1]);
                    const greenS = parseInt(greenMatch[2]);
                    const greenL = parseInt(greenMatch[3]);
                    
                    const newH = Math.round(greenH * greenFactor + yellowHue * yellowFactor);
                    const newS = Math.round(greenS * greenFactor + yellowSat * yellowFactor);
                    const newL = Math.round(greenL * greenFactor + yellowLum * yellowFactor);
                    
                    currentColor = `hsl(${newH}, ${newS}%, ${newL}%)`;
                }
            }
            
            c.fillStyle = currentColor;
            c.globalAlpha = alpha;
            c.beginPath();
            c.arc(leaf.x, leaf.y, leaf.size * leaf.progress, 0, 2 * Math.PI);
            c.fill();
            c.closePath();
            c.globalAlpha = 1;
        });

        // Renderizar folhas caindo
        this.fallingLeaves.forEach(leaf => {
            c.fillStyle = leaf.color;
            c.globalAlpha = Math.max(0.3, 1 - (leaf.y - leaf.originalY) / 200); // Fade ao cair
            c.beginPath();
            c.arc(leaf.x, leaf.y, leaf.size, 0, 2 * Math.PI);
            c.fill();
            c.closePath();
            c.globalAlpha = 1;
        });

        // ...existing code...

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
                                        originalX: leafX,
                                        originalY: leafY,
                                        size: leafSize,
                                        progress: 0,
                                        growthSpeed: (0.02 + Math.random() * 0.02) * this.animationSpeed,
                                        color: `hsl(${hue}, ${sat}%, ${lum}%)`,
                                        originalColor: `hsl(${hue}, ${sat}%, ${lum}%)`,
                                        section: this.getLeafSection(leafX),
                                        cyclePhase: 'growing',
                                        yellowProgress: 0,
                                        fallSpeed: 0,
                                        swayAmplitude: Utils.randomInt(10, 25),
                                        swaySpeed: 0.02 + Math.random() * 0.02
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
                if (leaf.progress < 1 && leaf.cyclePhase === 'growing') {
                    leaf.progress += leaf.growthSpeed;
                    if (leaf.progress > 1) leaf.progress = 1;
                }
            });
        }

        // Iniciar ciclo das folhas depois que tudo cresceu
        if (this.allBranchesComplete && this.allLeavesComplete && !this.cycleStarted) {
            this.cycleStarted = true;
            this.cycleTimer = Utils.dateValue;
            console.log('Iniciando ciclo das folhas');
        }

        // Processar ciclo das folhas
        if (this.cycleStarted) {
            const elapsed = Utils.dateValue - this.cycleTimer;
            
            switch (this.cyclePhase) {
                case 'growing':
                    if (elapsed > this.cycleDelayAfterGrowth) {
                        this.cyclePhase = 'yellowing';
                        this.cycleTimer = Utils.dateValue;
                        console.log('Iniciando fase de amarelamento');
                    }
                    break;

                case 'yellowing':
                    const yellowProgress = Math.min(1, elapsed / this.yellowingDuration);
                    this.leaves.forEach(leaf => {
                        leaf.cyclePhase = 'yellowing';
                        leaf.yellowProgress = yellowProgress;
                    });
                    
                    if (yellowProgress >= 1) {
                        this.cyclePhase = 'falling';
                        this.cycleTimer = Utils.dateValue;
                        this.startFallingLeaves();
                        console.log('Iniciando fase de queda');
                    }
                    break;

                case 'falling':
                    this.updateFallingLeaves();
                    
                    if (elapsed > this.fallingDuration && this.fallingLeaves.length === 0) {
                        this.cyclePhase = 'regrowing';
                        this.cycleTimer = Utils.dateValue;
                        console.log('Iniciando fase de rebrota');
                    }
                    break;

                case 'regrowing':
                    if (elapsed > this.regrowthDelay) {
                        if (this.regrowthStartTime === 0) {
                            // Iniciar rebrotamento gradual
                            this.regrowthStartTime = Utils.dateValue;
                            this.prepareRegrowthLeaves();
                            console.log('Iniciando rebrotamento gradual');
                        }
                        
                        const regrowthElapsed = Utils.dateValue - this.regrowthStartTime;
                        const regrowthProgress = Math.min(1, regrowthElapsed / this.regrowthDuration);
                        
                        this.updateRegrowthProgress(regrowthProgress);
                        
                        if (regrowthProgress >= 1) {
                            this.completeRegrowthCycle();
                            console.log('Rebrotamento completo, reiniciando ciclo');
                        }
                    }
                    break;
            }
        }
    }

    startFallingLeaves() {
        // Converter folhas da árvore em folhas caindo
        this.leaves.forEach((leaf, index) => {
            // Adicionar com um pequeno delay aleatório para parecer mais natural
            setTimeout(() => {
                if (leaf.cyclePhase === 'yellowing') {
                    leaf.cyclePhase = 'falling';
                    leaf.fallSpeed = 0.5 + Math.random() * 1.5;
                    leaf.swayOffset = Math.random() * Math.PI * 2;
                    
                    // Cor amarelada final
                    leaf.color = `hsl(${50 + Utils.randomInt(-10, 10)}, 80%, 60%)`;
                    
                    this.fallingLeaves.push(leaf);
                }
            }, Math.random() * 1000); // Delay de 0-1 segundo
        });
        
        // Limpar folhas da árvore
        setTimeout(() => {
            this.leaves = this.leaves.filter(leaf => leaf.cyclePhase !== 'falling');
        }, 1200);
    }

    updateFallingLeaves() {
        this.fallingLeaves.forEach((leaf, index) => {
            // Movimento de queda com balanço
            leaf.y += leaf.fallSpeed;
            leaf.x = leaf.originalX + Math.sin(leaf.y * leaf.swaySpeed + leaf.swayOffset) * leaf.swayAmplitude;
            
            // Acelerar levemente a queda
            leaf.fallSpeed += 0.02;
            
            // Remover folha se chegou ao chão
            if (leaf.y > this.floorY + 50) {
                this.fallingLeaves.splice(index, 1);
            }
        });
    }

    prepareRegrowthLeaves() {
        // Criar todas as folhas que vão rebrotar, mas com progress 0
        this.regrowthLeaves = [];
        this.leaves = [];
        
        this.branches.forEach(b => {
            if (b.generation >= this.maxGenerations - 6 && b.progress === 1) {
                const maxTotalLeaves = 3800;
                if (this.regrowthLeaves.length < maxTotalLeaves) {
                    let baseLeaves;
                    if (b.generation <= this.maxGenerations - 4) {
                        baseLeaves = 3;
                    } else if (b.generation <= this.maxGenerations - 2) {
                        baseLeaves = 2;
                    } else {
                        baseLeaves = 1;
                    }
                    
                    const numLeaves = Utils.randomInt(baseLeaves, baseLeaves + 1);
                    for (let i = 0; i < numLeaves; i++) {
                        const frac = 0.15 + Math.random() * 0.8;
                        let angle = b.angle + Utils.randomInt(-20, 20);
                        
                        if (baseLeaves === 1) {
                            if (b.x2 < 350) {
                                angle -= 25 + Utils.randomInt(0, 15);
                            } else if (b.x2 > 450) {
                                angle += 25 + Utils.randomInt(0, 15);
                            }
                        }
                        
                        const leafX = b.x1 + (b.x2 - b.x1) * frac + Utils.randomInt(-6, 6);
                        const leafY = b.y1 + (b.y2 - b.y1) * frac + Utils.randomInt(-6, 6);
                        const leafSize = Utils.randomInt(3, 7);
                        const hue = 120 + Utils.randomInt(-12, 12);
                        const sat = 60 + Utils.randomInt(-12, 12);
                        const lum = 30 + Utils.randomInt(0, 25);
                        
                        this.regrowthLeaves.push({
                            x: leafX,
                            y: leafY,
                            originalX: leafX,
                            originalY: leafY,
                            size: leafSize,
                            progress: 0,
                            growthSpeed: (0.02 + Math.random() * 0.02) * this.animationSpeed,
                            color: `hsl(${hue}, ${sat}%, ${lum}%)`,
                            originalColor: `hsl(${hue}, ${sat}%, ${lum}%)`,
                            section: this.getLeafSection(leafX),
                            cyclePhase: 'growing',
                            yellowProgress: 0,
                            fallSpeed: 0,
                            swayAmplitude: Utils.randomInt(10, 25),
                            swaySpeed: 0.02 + Math.random() * 0.02,
                            regrowthOrder: this.calculateRegrowthOrder(leafY) // Ordem baseada na altura (y)
                        });
                    }
                }
            }
        });
        
        // Ordenar folhas por altura (de baixo para cima)
        this.regrowthLeaves.sort((a, b) => b.y - a.y);
        
        // Atribuir ordem de rebrotamento
        this.regrowthLeaves.forEach((leaf, index) => {
            leaf.regrowthOrder = index / this.regrowthLeaves.length;
        });
    }

    calculateRegrowthOrder(y) {
        // Folhas mais baixas (maior y) rebrotam primeiro
        const maxY = 600; // Aproximadamente a altura máxima das folhas
        const minY = 200; // Aproximadamente a altura mínima das folhas
        return (maxY - y) / (maxY - minY);
    }

    updateRegrowthProgress(progress) {
        // Adicionar folhas gradualmente de baixo para cima
        this.regrowthLeaves.forEach(leaf => {
            // Cada folha começa a crescer quando o progresso global atinge sua ordem
            if (progress >= leaf.regrowthOrder) {
                // Calcular progresso local da folha
                const localProgress = Math.min(1, (progress - leaf.regrowthOrder) / (1 - leaf.regrowthOrder));
                
                // Aplicar crescimento suave
                if (localProgress > 0) {
                    leaf.progress = Math.min(1, localProgress);
                    
                    // Adicionar folha ao array principal se ainda não foi adicionada
                    if (!this.leaves.includes(leaf) && leaf.progress > 0) {
                        this.leaves.push(leaf);
                    }
                }
            }
        });
    }

    completeRegrowthCycle() {
        // Garantir que todas as folhas estejam no array principal
        this.regrowthLeaves.forEach(leaf => {
            leaf.progress = 1;
            if (!this.leaves.includes(leaf)) {
                this.leaves.push(leaf);
            }
        });
        
        // Resetar variáveis do ciclo
        this.cyclePhase = 'growing';
        this.cycleTimer = Utils.dateValue;
        this.regrowthStartTime = 0;
        this.regrowthLeaves = [];
        this.fallingLeaves = [];
    }

    restartGrowthCycle() {
        // Método legado - agora usa o sistema gradual
        this.completeRegrowthCycle();
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

        // Mapear seções para imagens dos patronos
        const patronImages = {
            1: 'img/st_bento.jpg',      // Seção esquerda - São Bento
            2: 'img/st_escriva.jpg',    // Seção central - São Josemaría Escrivá
            3: 'img/st_teresinha.jpg'   // Seção direita - Santa Teresinha
        };

        // Mostrar a imagem do patrono nas abas de forma duplicada
        if (window.tabManager && patronImages[clickedSection]) {
            const patronImage = patronImages[clickedSection];
            
            // Usar o método dedicado do TabManager para atualizar as abas da árvore
            window.tabManager.updateTreeTabsWithPatron(patronImage, clickedSection);
            
            console.log(`Imagem do patrono da seção ${clickedSection} mostrada em todas as abas`);
        }

        // Sinal global para outros scripts
        const event = new CustomEvent('treeSectionClicked', { 
            detail: { 
                section: clickedSection,
                patronImage: patronImages[clickedSection]
            } 
        });
        window.dispatchEvent(event);
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
    // ...existing code...
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

        // Continua o loop se ainda há crescimento, folhas caindo, ou ciclo ativo E se a animação deve continuar
        const shouldContinue = (
            !this.allBranchesComplete || 
            !this.allLeavesComplete || 
            this.fallingLeaves.length > 0 ||
            this.cycleStarted
        ) && this.animationRunning;

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