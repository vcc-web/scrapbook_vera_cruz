// Scrapbook de Memórias - Script Principal com Page-Flip
class ScrapbookViewer {
    constructor() {
        this.currentIndex = 0;
        this.photos = [];
        this.pageFlip = null;
        this.isAnimating = false;
        this.imagesLoaded = false;
        this.flipbookInitialized = false;
        
        // Criar referência global para callbacks
        window.scrapbookInstance = this;
        
        this.initializeMobile();
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
            'Momentos preciosos que ficaram gravados no coração',
            'Cada clique uma lembrança especial...',
            'Dias que merecem ser lembrados para sempre',
            'Sorrisos que aquecem a alma',
            'Memórias que se transformam em tesouros',
            'Instantes mágicos capturados com amor',
            'Fotografias que contam nossa história',
            'Momentos únicos, emoções verdadeiras',
            'Lembranças que nos fazem sorrir',
            'Cada foto, uma página da vida',
            'Registros de felicidade genuína',
            'Momentos simples, sentimentos profundos',
            'Capturando a essência dos bons momentos',
            'Memórias que acompanham o coração',
            'Instantes que se tornaram eternos',
            'Fotografias cheias de significado',
            'Momentos especiais, pessoas especiais',
            'Lembranças que nos conectam ao que importa',
            'Cada imagem conta uma história linda',
            'Registros de amor e felicidade'
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
                    this.imagesLoaded = true;
                    console.log('Todas as imagens foram carregadas!');
                    // Se o usuário já clicou no botão mas o flipbook não foi inicializado
                    if (!this.flipbookInitialized && this.elements.instructions.classList.contains('hidden')) {
                        this.initializeFlipbook();
                    }
                    this.hideLoading();
                }
            };
            img.onerror = () => {
                console.warn(`Failed to load image: ${photo.src}`);
                loadedCount++;
                if (loadedCount === totalImages) {
                    this.imagesLoaded = true;
                    console.log('Carregamento de imagens concluído (com alguns erros)');
                    // Se o usuário já clicou no botão mas o flipbook não foi inicializado
                    if (!this.flipbookInitialized && this.elements.instructions.classList.contains('hidden')) {
                        this.initializeFlipbook();
                    }
                    this.hideLoading();
                }
            };
            img.src = photo.src;
        });
    }

    initializeFlipbook() {
        if (this.flipbookInitialized) {
            return; // Já foi inicializado
        }
        
        if (!this.imagesLoaded) {
            console.log('Aguardando carregamento das imagens...');
            return; // Aguardar carregamento das imagens
        }
        
        // Criar páginas HTML para cada foto
        this.createPages();
        
        // Detectar se é mobile
        const isMobile = window.innerWidth <= 768;
        
        // Configuração otimizada para mobile e desktop (tamanho aumentado)
        const flipbookConfig = {
            width: isMobile ? window.innerWidth : 1200,
            height: isMobile ? window.innerHeight : 800,
            size: 'stretch',
            minWidth: isMobile ? window.innerWidth : 400,
            maxWidth: isMobile ? window.innerWidth : 1400,
            minHeight: isMobile ? window.innerHeight : 500,
            maxHeight: isMobile ? window.innerHeight : 900,
            maxShadowOpacity: isMobile ? 0.3 : 0.5,
            showCover: false,
            mobileScrollSupport: false,
            clickEventForward: false,
            usePortrait: isMobile,
            startZIndex: 0,
            autoSize: true,
            showPageCorners: !isMobile,
            disableFlipByClick: false,
            swipeDistance: isMobile ? 50 : 30,
            // Mobile-specific settings
            flippingTime: isMobile ? 800 : 1000,
            useMouseEvents: !isMobile
        };
        
        // Inicializar a biblioteca page-flip
        this.pageFlip = new St.PageFlip(this.elements.flipbook, flipbookConfig);

        // Eventos da biblioteca
        this.pageFlip.on('flip', (e) => {
            this.currentIndex = e.data;
            this.updateCounter();
            
            // Re-otimizar imagens da página atual após um breve delay
            setTimeout(() => {
                this.optimizeCurrentPageImage();
            }, 300);
        });

        // Carregar páginas
        this.pageFlip.loadFromHTML(document.querySelectorAll('.page'));
        
        this.flipbookInitialized = true;
        console.log('Flipbook inicializado com sucesso!');
        
        // Otimizar a exibição das imagens após inicialização
        setTimeout(() => {
            this.optimizeImageDisplay();
            // Garantir que a primeira imagem esteja otimizada
            this.optimizeCurrentPageImage();
            // Iniciar watchdog de otimização
            this.startImageOptimizationWatchdog();
        }, 500);

        // Força re-otimização periódica para garantir que nenhuma imagem seja cortada
        this.startImageOptimizationWatchdog();
    }

    createPages() {
        // Limpar flipbook
        this.elements.flipbook.innerHTML = '';
        
        // Definir os temas de cores
        const themes = ['theme-green', 'theme-blue-light', 'theme-blue-turquoise', 'theme-gold', 'theme-gray'];
        
        // Criar páginas para cada foto
        this.photos.forEach((photo, index) => {
            const pageDiv = document.createElement('div');
            // Alternar entre os temas baseado no índice
            const themeClass = themes[index % themes.length];
            pageDiv.className = `page ${themeClass}`;
            
            // Adicionar overlay de textura de papel
            const paperOverlay = document.createElement('div');
            paperOverlay.className = 'paperOverlay';
            pageDiv.appendChild(paperOverlay);
            
            // Adicionar conteúdo da página
            pageDiv.innerHTML += this.createPageContent(photo, index);
            this.elements.flipbook.appendChild(pageDiv);
        });
    }

    createPageContent(photo, index) {
        // Escolher um estilo de moldura único para cada página
        const frameStyles = ['frame-style-1', 'frame-style-2', 'frame-style-3', 'frame-style-4', 'frame-style-5', 'frame-style-6'];
        const frameStyle = frameStyles[index % frameStyles.length];

        const frameDecorations = Array.from({length: 4}, (_, i) => 
            `<div class="frame-decoration frame-${['top-left', 'top-right', 'bottom-left', 'bottom-right'][i]}"></div>`
        ).join('');

        const pageCurls = `
            <div class="page-curl page-curl-top-right"></div>
            <div class="page-curl page-curl-bottom-left"></div>
        `;

        // Adicionar elementos decorativos únicos baseados no índice
        const uniqueDecorations = this.generateUniqueDecorations(index);

        return `
            <div class="paper-texture"></div>
            <div class="photo-frame ${frameStyle}">
                ${frameDecorations}
                ${pageCurls}
                ${uniqueDecorations}
                
                <img src="${photo.src}" alt="Memória ${index + 1}" class="photo" 
                     onload="scrapbookInstance.optimizeImageOnLoad(this)"
                     data-photo-index="${index}">
                
                <div class="text-overlay">
                    <div class="memory-text">${photo.text}</div>
                    <div class="memory-date">${photo.date}</div>
                </div>
            </div>
        `;
    }

    bindEvents() {
        // Botão de iniciar
        this.elements.startBtn.addEventListener('click', () => {
            this.hideInstructions();
            // Garantir que o flipbook seja inicializado quando o usuário clicar
            if (!this.flipbookInitialized) {
                if (this.imagesLoaded) {
                    this.initializeFlipbook();
                } else {
                    // Se as imagens ainda não carregaram, mostrar loading e aguardar
                    this.elements.loading.classList.remove('hidden');
                    this.waitForImagesAndInitialize();
                }
            }
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
        
        // Redimensionamento da janela
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    bindTouchEvents() {
        let startX = 0;
        let startY = 0;
        let endX = 0;
        let endY = 0;
        const minSwipeDistance = window.innerWidth <= 768 ? 50 : 30;

        // Touch events no container principal para melhor detecção
        const touchTarget = window.innerWidth <= 768 ? document.body : this.elements.flipbook;

        touchTarget.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });

        touchTarget.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            endY = e.changedTouches[0].clientY;

            const deltaX = endX - startX;
            const deltaY = endY - startY;

            // Verificar se é um swipe horizontal
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
                e.preventDefault();
                if (deltaX > 0) {
                    this.previousPhoto();
                } else {
                    this.nextPhoto();
                }
            }
        }, { passive: false });

        // Prevenir scroll em mobile
        if (window.innerWidth <= 768) {
            document.addEventListener('touchmove', (e) => {
                e.preventDefault();
            }, { passive: false });
        }
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

    updateCounter() {
        this.elements.currentIndex.textContent = this.currentIndex + 1;
    }

    showInstructions() {
        this.elements.instructions.classList.remove('hidden');
        this.elements.storyView.classList.add('hidden');
    }

    hideInstructions() {
        this.elements.instructions.classList.add('hidden');
        // Só mostrar a story view se o flipbook estiver inicializado ou as imagens carregadas
        if (this.flipbookInitialized || this.imagesLoaded) {
            this.elements.storyView.classList.remove('hidden');
        }
    }

    hideLoading() {
        this.elements.loading.classList.add('hidden');
        // Se as instruções foram escondidas, mostrar a story view
        if (this.elements.instructions.classList.contains('hidden')) {
            this.elements.storyView.classList.remove('hidden');
        }
    }

    waitForImagesAndInitialize() {
        // Verificar periodicamente se as imagens foram carregadas
        const checkInterval = setInterval(() => {
            if (this.imagesLoaded) {
                clearInterval(checkInterval);
                this.initializeFlipbook();
                this.hideLoading();
            }
        }, 100);

        // Timeout de segurança - se demorar mais que 10 segundos, inicializar mesmo assim
        setTimeout(() => {
            if (!this.flipbookInitialized) {
                clearInterval(checkInterval);
                console.warn('Timeout aguardando imagens - inicializando flipbook mesmo assim');
                this.initializeFlipbook();
                this.hideLoading();
            }
        }, 10000);
    }

    handleResize() {
        const isMobile = window.innerWidth <= 768;
        
        if (this.pageFlip) {
            // Reinicializar o flipbook com novas dimensões se necessário
            if (isMobile) {
                this.pageFlip.updateBoundary();
            } else {
                this.pageFlip.updateBoundary();
            }
        }
        
        // Ajustar viewport para mobile
        if (isMobile) {
            document.body.style.height = window.innerHeight + 'px';
        }
    }

    initializeMobile() {
        if (window.innerWidth <= 768) {
            // Configurações específicas para mobile
            document.body.classList.add('mobile');
            
            // Ajustar altura para mobile
            const setVH = () => {
                let vh = window.innerHeight * 0.01;
                document.documentElement.style.setProperty('--vh', `${vh}px`);
            };
            
            setVH();
            window.addEventListener('resize', setVH);
            
            // Prevenir zoom em iOS
            document.addEventListener('gesturestart', (e) => e.preventDefault());
            document.addEventListener('gesturechange', (e) => e.preventDefault());
            document.addEventListener('gestureend', (e) => e.preventDefault());
        }
    }

    generateUniqueDecorations(index) {
        const decorations = [
            // Elementos decorativos geométricos artesanais
            '<div style="position: absolute; top: 10px; left: 50%; transform: translateX(-50%); width: 30px; height: 3px; background: linear-gradient(90deg, #d4af37, #2d5a3d); opacity: 0.6;"></div>',
            '<div style="position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%); width: 40px; height: 2px; background: linear-gradient(90deg, #2d5a3d, #d4af37); opacity: 0.6;"></div>',
            
            // Cantos ornamentais delicados
            '<div style="position: absolute; top: 8px; left: 8px; width: 15px; height: 15px; border-top: 1px solid rgba(212, 175, 55, 0.5); border-left: 1px solid rgba(212, 175, 55, 0.5);"></div>',
            '<div style="position: absolute; top: 8px; right: 8px; width: 15px; height: 15px; border-top: 1px solid rgba(212, 175, 55, 0.5); border-right: 1px solid rgba(212, 175, 55, 0.5);"></div>',
            
            // Linhas decorativas sutis
            '<div style="position: absolute; left: 8px; top: 50%; transform: translateY(-50%); width: 1px; height: 40px; background: linear-gradient(180deg, transparent, rgba(212, 175, 55, 0.4), transparent);"></div>',
            '<div style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); width: 1px; height: 40px; background: linear-gradient(180deg, transparent, rgba(45, 90, 61, 0.4), transparent);"></div>',
            
            // Elementos únicos especiais
            '<div style="position: absolute; top: 12px; right: 12px; width: 8px; height: 8px; background: rgba(212, 175, 55, 0.5); transform: rotate(45deg); opacity: 0.7;"></div>',
            '<div style="position: absolute; bottom: 12px; left: 12px; width: 6px; height: 6px; border-radius: 50%; background: rgba(45, 90, 61, 0.5); border: 1px solid rgba(26, 61, 40, 0.3);"></div>',
            
            // Padrões geométricos simples
            '<div style="position: absolute; top: 15px; left: 15px; width: 12px; height: 12px; background: conic-gradient(rgba(212, 175, 55, 0.3), rgba(45, 90, 61, 0.3)); border-radius: 50%; opacity: 0.6;"></div>',
            '<div style="position: absolute; bottom: 15px; right: 15px; width: 10px; height: 10px; background: rgba(206, 184, 136, 0.4); border-radius: 2px; transform: rotate(15deg);"></div>',
            
            // Bordas decorativas
            '<div style="position: absolute; top: 0; left: 20%; width: 60%; height: 1px; background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.3), transparent);"></div>',
            '<div style="position: absolute; bottom: 0; left: 30%; width: 40%; height: 1px; background: linear-gradient(90deg, transparent, rgba(45, 90, 61, 0.3), transparent);"></div>',
        ];
        
        // Selecionar 1-2 decorações baseadas no índice
        const numDecorations = (index % 2) + 1;
        const selectedDecorations = [];
        
        for (let i = 0; i < numDecorations; i++) {
            const decorationIndex = (index * 2 + i) % decorations.length;
            selectedDecorations.push(decorations[decorationIndex]);
        }
        
        return selectedDecorations.join('');
    }

    optimizeImageDisplay() {
        // Otimizar todas as imagens carregadas
        const images = document.querySelectorAll('.photo');
        images.forEach((img, index) => {
            if (img.complete && img.naturalHeight !== 0) {
                this.adjustImageFit(img);
            } else {
                img.addEventListener('load', () => {
                    this.adjustImageFit(img);
                });
            }
        });
    }

    adjustImageFit(img) {
        if (!img.complete || img.naturalHeight === 0) {
            return; // Imagem ainda não carregou
        }

        const photoFrame = img.closest('.photo-frame');
        const aspectRatio = img.naturalWidth / img.naturalHeight;

        // Remover classes anteriores
        photoFrame.classList.remove('portrait-image', 'landscape-image', 'square-image');

        // Limpar estilos inline que podem interferir
        img.style.cssText = '';

        // Classificar a imagem por orientação e aplicar classe
        if (aspectRatio < 0.8) {
            // Imagem portrait (vertical)
            photoFrame.classList.add('portrait-image');
        } else if (aspectRatio > 1.3) {
            // Imagem landscape (horizontal)
            photoFrame.classList.add('landscape-image');
        } else {
            // Imagem quadrada ou proporção equilibrada
            photoFrame.classList.add('square-image');
        }

        // Garantir que as propriedades CSS sejam aplicadas
        img.classList.add('photo');
        
        // Adicionar classe para indicar que a imagem foi otimizada
        photoFrame.classList.add('image-optimized');
        
        console.log(`Imagem otimizada: ${aspectRatio.toFixed(2)} - ${photoFrame.classList.contains('portrait-image') ? 'Portrait' : photoFrame.classList.contains('landscape-image') ? 'Landscape' : 'Square'}`);
    }

    optimizeImageOnLoad(img) {
        // Marcar que a imagem foi carregada
        const photoFrame = img.closest('.photo-frame');
        photoFrame.classList.add('photo-loaded');
        
        // Aplicar otimização imediatamente
        this.adjustImageFit(img);
        
        // Re-aplicar otimização após um pequeno delay para garantir que tudo esteja renderizado
        setTimeout(() => {
            this.adjustImageFit(img);
        }, 100);
    }

    optimizeCurrentPageImage() {
        // Encontrar a imagem da página atual
        const currentPage = document.querySelector(`.page:nth-child(${this.currentIndex + 1})`);
        if (currentPage) {
            const currentImage = currentPage.querySelector('.photo');
            if (currentImage) {
                this.adjustImageFit(currentImage);
            }
        }
    }

    // Força re-otimização periódica para garantir que nenhuma imagem seja cortada
    startImageOptimizationWatchdog() {
        setInterval(() => {
            if (this.flipbookInitialized) {
                this.optimizeImageDisplay();
            }
        }, 5000); // Verificar a cada 5 segundos
    }
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    new ScrapbookViewer();
});
