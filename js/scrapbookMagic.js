/**
 * SCRAPBOOK AUDIO SYSTEM
 * Sistema de áudio ambiental para o scrapbook
 * Criado por GitHub Copilot - Design Sênior
 */

class ScrapbookAudio {
    constructor() {
        this.modules = {};
        this.isInitialized = false;
        this.version = '1.0.0';

        this.init();
    }

    async init() {
        console.log(`� Inicializando Scrapbook Audio v${this.version}`);

        // Aguarda DOM estar pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeModules());
        } else {
            this.initializeModules();
        }
    }

    initializeModules() {
        try {
            // Carrega estilos CSS dinamicamente
            this.loadStylesheets();

            // Inicializa apenas o sistema de áudio
            this.initAmbientAudio();

            // Configura eventos globais apenas para áudio
            this.setupAudioEvents();

            // Adiciona contador de páginas
            this.addPageCounter();

            this.isInitialized = true;
            console.log('✨ Sistema de áudio inicializado com sucesso!');

        } catch (error) {
            console.error('❌ Erro ao inicializar sistema de áudio:', error);
        }
    }

    loadStylesheets() {
        const stylesheets = [
            'css/audio-controls.css'
        ];

        stylesheets.forEach(href => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            document.head.appendChild(link);
        });
    }

    initAmbientAudio() {
        if (typeof AmbientAudio !== 'undefined') {
            this.modules.ambientAudio = new AmbientAudio();
            console.log('🎵 Ambient Audio carregado');
        }
    }

    setupAudioEvents() {
        // Eventos de teclado apenas para áudio
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'm':
                        e.preventDefault();
                        this.toggleAudio();
                        break;
                }
            }
        });

        // Auto-save de preferências de áudio
        window.addEventListener('beforeunload', () => {
            this.saveAudioPreferences();
        });
    }

    addPageCounter() {
        // Cria o elemento do contador
        const counter = document.createElement('div');
        counter.className = 'page-counter';
        counter.style.position = 'fixed';
        counter.style.bottom = '32px';
        counter.style.right = '32px';
        counter.style.background = 'rgba(44,62,50,0.85)';
        counter.style.color = '#f4f1e8';
        counter.style.fontFamily = 'Montserrat, Arial, sans-serif';
        counter.style.fontSize = '1.1em';
        counter.style.padding = '10px 22px';
        counter.style.borderRadius = '18px';
        counter.style.boxShadow = '0 2px 12px rgba(33,56,34,0.13)';
        counter.style.zIndex = '9999';
        counter.style.userSelect = 'none';
        counter.textContent = 'Página 1 de 1';
        document.body.appendChild(counter);

        // Função para atualizar o contador
        function updateCounter() {
            if (window.book && typeof window.book.turn === 'function') {
                const current = window.book.turn('page');
                const total = window.book.turn('pages');
                counter.textContent = `Página ${current} de ${total}`;
            }
        }

        // Atualiza ao virar página
        if (window.book && typeof window.book.bind === 'function') {
            window.book.bind('turned', updateCounter);
        }

        // Atualiza ao carregar
        setTimeout(updateCounter, 1200);
    }

    // Método para controlar áudio via atalho
    toggleAudio() {
        const audioControls = document.querySelector('.audio-controls');
        if (audioControls) {
            audioControls.classList.toggle('expanded');
        }
    }

    saveAudioPreferences() {
        const prefs = {
            audioVolume: this.modules.ambientAudio?.volume,
            isPlaying: this.modules.ambientAudio?.isPlaying,
            currentTheme: this.modules.ambientAudio?.currentTheme,
            timestamp: Date.now()
        };

        localStorage.setItem('scrapbook-audio-preferences', JSON.stringify(prefs));
    }

    loadAudioPreferences() {
        const saved = localStorage.getItem('scrapbook-audio-preferences');
        if (saved) {
            const prefs = JSON.parse(saved);

            if (this.modules.ambientAudio && prefs.audioVolume !== undefined) {
                this.modules.ambientAudio.volume = prefs.audioVolume;
            }
        }
    }

    // API pública para o sistema de áudio
    getAudioModule() {
        return this.modules.ambientAudio;
    }

    getVersion() {
        return this.version;
    }
}

// Inicialização global
window.ScrapbookAudio = ScrapbookAudio;
window.scrapbookAudio = new ScrapbookAudio();
