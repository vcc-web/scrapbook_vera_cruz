// Scrapbook de Memórias - Script Principal com Page-Flip
class ScrapbookViewer {
    constructor() {
        this.currentIndex = 0;
        this.photos = [];
        this.pageFlip = null;
        this.isAnimating = false;
        
        this.initializeElements();
        this.loadPhotos();
        this.bindEvents();
        this.showInstructions();
    }
    
    initializeElements() {
        this.elements = {
            loading: document.getElementById('loading'),
            storyView: document.getElementById('story-view'),
            instructions: document.getElementById('instructions'),
            startBtn: document.getElementById('start-btn'),
            navLeft: document.getElementById('nav-left'),
            navRight: document.getElementById('nav-right'),
            flipbookContainer: document.getElementById('flipbook-container'),
            flipbook: document.getElementById('flipbook'),
            progressDots: document.getElementById('progress-dots'),
            currentIndex: document.getElementById('current-index'),
            totalPhotos: document.getElementById('total-photos')
        };
    }
    
    loadPhotos() {
        // Lista de todas as fotos na pasta img
        const imageFiles = [
            '20250625_092143.jpg', '20250625_092235.jpg', '20250625_092321.jpg', '20250625_094404.jpg',
            '20250625_095741.jpg', '20250625_095858.jpg', '20250625_100527.jpg', '20250625_100843.jpg',
            '20250625_101145.jpg', '20250625_101819.jpg', '20250625_102311.jpg', '20250625_102427.jpg',
            '20250625_102529.jpg', '20250625_102829.jpg', '20250625_105214.jpg', '20250625_105220.jpg',
            '20250625_110638.jpg', '20250625_110930.jpg', '20250625_110936.jpg', '20250626_080316.jpg',
            '20250626_094133.jpg', '20250626_104914.jpg', '20250626_105801.jpg', '20250626_124504.jpg',
            '20250626_133517.jpg', '20250627_125618.jpg', '20250627_125834.jpg', '20250627_130402.jpg',
            '20250627_133956.jpg', '20250628_082913.jpg', '20250628_090919.jpg', '20250628_091050.jpg',
            '20250628_091341.jpg', '20250628_091621.jpg', '20250628_092629.jpg', '20250628_092912.jpg',
            '20250628_093322.jpg', '20250628_093802.jpg', '20250628_093930.jpg', '20250628_094326.jpg',
            '20250628_094422.jpg', '20250628_094447.jpg', '20250628_094830.jpg', '20250628_094902.jpg',
            '20250628_100549.jpg', '20250628_103413.jpg', '20250628_105756.jpg', '20250628_112456.jpg',
            '20250628_113719.jpg', '20250628_113746.jpg', '20250628_114158.jpg', '20250628_114847.jpg',
            'IMG-20250626-WA0019.jpg', 'IMG-20250626-WA0020.jpg', 'IMG-20250626-WA0021.jpg', 'IMG-20250626-WA0022.jpg'
        ];

        // Textos aleatórios para as memórias
        const memoryTexts = [
            'Momentos preciosos que ficaram gravados no coração 💝',
            'Cada clique uma lembrança especial...',
            'Dias que merecem ser lembrados para sempre ✨',
            'Sorrisos que aquecem a alma 😊',
            'Memórias que se transformam em tesouros',
            'Instantes mágicos capturados com amor',
            'Fotografias que contam nossa história',
            'Momentos únicos, emoções verdadeiras',
            'Lembranças que nos fazem sorrir 🌟',
            'Cada foto, uma página da vida',
            'Registros de felicidade genuína',
            'Momentos simples, sentimentos profundos',
            'Capturando a essência dos bons momentos',
            'Memórias que acompanham o coração',
            'Instantes que se tornaram eternos 💫',
            'Fotografias cheias de significado',
            'Momentos especiais, pessoas especiais',
            'Lembranças que nos conectam ao que importa',
            'Cada imagem conta uma história linda',
            'Registros de amor e felicidade 💕'
        ];

        // Gerar dados das fotos com base nos nomes dos arquivos
        this.photos = imageFiles.map((filename, index) => {
            // Extrair data do nome do arquivo
            let dateStr = 'Memória Especial';
            if (filename.startsWith('202506')) {
                const year = filename.substring(0, 4);
                const month = filename.substring(4, 6);
                const day = filename.substring(6, 8);
                
                const monthNames = {
                    '06': 'Junho',
                    '25': 'Junho',
                    '26': 'Junho',
                    '27': 'Junho',
                    '28': 'Junho'
                };
                
                const monthName = monthNames[month] || 'Junho';
                dateStr = `${day} de ${monthName} de ${year}`;
            } else if (filename.startsWith('IMG-')) {
                dateStr = 'Junho de 2025';
            }

            return {
                src: `img/${filename}`,
                text: memoryTexts[index % memoryTexts.length],
                date: dateStr
            };
        });
        
        this.elements.totalPhotos.textContent = this.photos.length;
        this.createProgressDots();
        this.preloadImages();
    }

    preloadImages() {
        let loadedCount = 0;
        const totalImages = this.photos.length;
        
        this.photos.forEach((photo, index) => {
            const img = new Image();
            img.onload = () => {
                loadedCount++;
                if (loadedCount === totalImages) {
                    this.initializeFlipbook();
                }
            };
            img.onerror = () => {
                console.warn(`Failed to load image: ${photo.src}`);
                loadedCount++;
                if (loadedCount === totalImages) {
                    this.initializeFlipbook();
                }
            };
            img.src = photo.src;
        });
    }

    initializeFlipbook() {
        // Criar páginas HTML para cada foto
        this.createPages();
        
        // Inicializar a biblioteca page-flip
        this.pageFlip = new St.PageFlip(this.elements.flipbook, {
            width: 800,
            height: 600,
            size: 'stretch',
            minWidth: 315,
            maxWidth: 1000,
            minHeight: 420,
            maxHeight: 1350,
            maxShadowOpacity: 0.5,
            showCover: false,
            mobileScrollSupport: false,
            clickEventForward: false,
            usePortrait: false,
            startZIndex: 0,
            autoSize: true,
            showPageCorners: true,
            disableFlipByClick: false,
            swipeDistance: 30
        });

        // Eventos da biblioteca
        this.pageFlip.on('flip', (e) => {
            this.currentIndex = e.data;
            this.updateProgress();
            this.updateCounter();
        });

        // Carregar páginas
        this.pageFlip.loadFromHTML(document.querySelectorAll('.page'));
        
        this.hideLoading();
    }

    createPages() {
        // Limpar flipbook
        this.elements.flipbook.innerHTML = '';
        
        // Criar páginas para cada foto
        this.photos.forEach((photo, index) => {
            const pageDiv = document.createElement('div');
            pageDiv.className = 'page';
            pageDiv.innerHTML = this.createPageContent(photo, index);
            this.elements.flipbook.appendChild(pageDiv);
        });
    }

    createPageContent(photo, index) {
        const frameDecorations = Array.from({length: 4}, (_, i) => 
            `<div class="frame-decoration frame-${['top-left', 'top-right', 'bottom-left', 'bottom-right'][i]}"></div>`
        ).join('');

        const washiTapes = Array.from({length: 3}, (_, i) => 
            `<div class="washi-tape washi-${i + 1}"></div>`
        ).join('');

        const pageCurls = `
            <div class="page-curl page-curl-top-right"></div>
            <div class="page-curl page-curl-bottom-left"></div>
        `;

        return `
            <div class="paper-texture"></div>
            <div class="photo-frame">
                ${frameDecorations}
                ${washiTapes}
                ${pageCurls}
                
                <img src="${photo.src}" alt="Memória ${index + 1}" class="photo" 
                     style="width: 100%; height: 70%; object-fit: cover; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">
                
                <div class="text-overlay">
                    <div class="memory-text">${photo.text}</div>
                    <div class="memory-date">${photo.date}</div>
                </div>
            </div>
        `;
    }

    createProgressDots() {
        this.elements.progressDots.innerHTML = '';
        this.photos.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.className = `progress-dot ${index === 0 ? 'active' : ''}`;
            dot.addEventListener('click', () => this.goToPhoto(index));
            this.elements.progressDots.appendChild(dot);
        });
    }

    bindEvents() {
        // Botão de iniciar
        this.elements.startBtn.addEventListener('click', () => {
            this.hideInstructions();
        });

        // Navegação por clique
        this.elements.navLeft.addEventListener('click', (e) => {
            e.preventDefault();
            this.previousPhoto();
        });

        this.elements.navRight.addEventListener('click', (e) => {
            e.preventDefault();
            this.nextPhoto();
        });

        // Navegação por teclado
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                this.previousPhoto();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                this.nextPhoto();
            } else if (e.key === 'Escape') {
                this.showInstructions();
            }
        });

        // Touch events para mobile
        this.bindTouchEvents();
    }

    bindTouchEvents() {
        let startX = 0;
        let startY = 0;
        let endX = 0;
        let endY = 0;
        const minSwipeDistance = 50;

        this.elements.flipbook.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });

        this.elements.flipbook.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            endY = e.changedTouches[0].clientY;

            const deltaX = endX - startX;
            const deltaY = endY - startY;

            // Verificar se é um swipe horizontal
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
                if (deltaX > 0) {
                    this.previousPhoto();
                } else {
                    this.nextPhoto();
                }
            }
        });
    }

    nextPhoto() {
        if (this.pageFlip && !this.isAnimating && this.currentIndex < this.photos.length - 1) {
            this.pageFlip.flipNext();
        }
    }

    previousPhoto() {
        if (this.pageFlip && !this.isAnimating && this.currentIndex > 0) {
            this.pageFlip.flipPrev();
        }
    }

    goToPhoto(index) {
        if (this.pageFlip && !this.isAnimating && index >= 0 && index < this.photos.length) {
            this.pageFlip.flip(index);
        }
    }

    updateProgress() {
        const dots = this.elements.progressDots.querySelectorAll('.progress-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentIndex);
        });
    }

    updateCounter() {
        this.elements.currentIndex.textContent = this.currentIndex + 1;
    }

    showInstructions() {
        this.elements.instructions.classList.remove('hidden');
        this.elements.storyView.classList.add('hidden');
    }

    hideInstructions() {
        this.elements.instructions.classList.add('hidden');
        this.elements.storyView.classList.remove('hidden');
    }

    hideLoading() {
        this.elements.loading.classList.add('hidden');
    }
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    new ScrapbookViewer();
});
