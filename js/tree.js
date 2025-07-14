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

        // Show global scrapbook tabs when tree page opens
        if (window.tabManager && window.tabManager.tabPool) {
            window.tabManager.tabPool.forEach((tab, idx) => {
                tab.style.display = 'block';
                tab.classList.add('tree-tab-active');

                // Add image to tab if not already present
                if (!tab.querySelector('.tree-tab-img')) {
                    const img = document.createElement('img');
                    img.className = 'tree-tab-img';
                    img.src = `img/tree-tab-${idx + 1}.png`;
                    img.alt = `Seção ${idx + 1}`;
                    img.style.width = '32px';
                    img.style.height = '32px';
                    img.style.marginRight = '8px';
                    img.style.verticalAlign = 'middle';
                    tab.insertBefore(img, tab.firstChild);
                }
            });

            window.tabManager.tabPool[0].classList.add('even');
            window.tabManager.tabPool[1].classList.add('odd');

            setTimeout(() => {
                window.tabManager.tabPool.forEach(tab => {
                    tab.classList.add('clicked');
                })
            }, 200);
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

// Expose showTreePage globally
window.showTreePage = showTreePage;

// Hide tree page overlay
function hideTreePage() {
    if (treePageOverlay && treePageActive) {

        // Hide global scrapbook tabs when tree page closes
        if (window.tabManager && window.tabManager.tabPool) {
            window.tabManager.tabPool.forEach(tab => {
                tab.classList.remove('clicked');

                // Remove tree tab image if present
                const img = tab.querySelector('.tree-tab-img');
                if (img) img.remove();

                setTimeout(() => {
                    window.tabManager.releaseTab(tab, tab.dataset.page);
                }, 1300);
            });
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