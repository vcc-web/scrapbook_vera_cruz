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

            // Exibe splash screen com tema do colégio
            this.showSplashScreen();

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

    showSplashScreen() {
        const splash = document.createElement('div');
        splash.className = 'scrapbook-splash';
        splash.innerHTML = `
            <div class="splash-content">
                <div class="splash-logo">
                    <h1>🎵 Sistema de Áudio</h1>
                    <p>Ambiente sonoro para suas memórias</p>
                </div>
                <div class="splash-features">
                    <div class="feature">� Sons Ambientais</div>
                    <div class="feature">🔊 Controle de Volume</div>
                    <div class="feature">� Efeitos Sonoros</div>
                    <div class="feature">🎭 Temas Musicais</div>
                </div>
                <div class="splash-shortcuts">
                    <h3>Controle:</h3>
                    <div class="shortcut">Ctrl+M - Painel de Áudio</div>
                </div>
            </div>
        `;

        document.body.appendChild(splash);

        // Remove splash após 3 segundos
        setTimeout(() => {
            splash.style.opacity = '0';
            setTimeout(() => splash.remove(), 500);
        }, 3000);

        // Adiciona estilos do splash com cores do colégio
        this.addSplashStyles();
    }

    addSplashStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .scrapbook-splash {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: linear-gradient(135deg, #213822 0%, #2d4a2e 50%, #1a2f1d 100%);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                color: #f4f1e8;
                transition: opacity 0.5s ease;
            }

            .splash-content {
                text-align: center;
                animation: splash-appear 1s ease-out;
            }

            .splash-logo h1 {
                font-size: 2.5em;
                margin: 0 0 10px 0;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
                animation: glow 2s infinite ease-in-out;
                color: #e8dcc6;
            }

            .splash-logo p {
                font-size: 1.1em;
                margin: 0 0 30px 0;
                opacity: 0.9;
                color: #f0ebe0;
            }

            .splash-features {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 15px;
                margin-bottom: 30px;
                max-width: 400px;
            }

            .feature {
                background: rgba(139, 127, 102, 0.2);
                padding: 12px;
                border-radius: 10px;
                font-size: 14px;
                backdrop-filter: blur(5px);
                border: 1px solid rgba(244, 241, 232, 0.1);
                color: #f4f1e8;
            }

            .splash-shortcuts h3 {
                margin: 0 0 15px 0;
                font-size: 1.1em;
                color: #e8dcc6;
            }

            .shortcut {
                background: rgba(139, 127, 102, 0.3);
                padding: 8px 15px;
                margin: 5px;
                border-radius: 20px;
                display: inline-block;
                font-size: 12px;
                font-family: monospace;
                border: 1px solid rgba(244, 241, 232, 0.2);
                color: #f4f1e8;
            }

            @keyframes splash-appear {
                0% {
                    opacity: 0;
                    transform: scale(0.8) translateY(50px);
                }
                100% {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                }
            }

            @keyframes glow {
                0%, 100% {
                    text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
                }
                50% {
                    text-shadow: 2px 2px 20px rgba(232, 220, 198, 0.6);
                }
            }
        `;
        document.head.appendChild(style);
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
