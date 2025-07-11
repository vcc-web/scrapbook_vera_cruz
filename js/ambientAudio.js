class AmbientAudio {
    constructor() {
        this.audioContext = null;
        this.currentTheme = 'sunset';
        this.isPlaying = false;
        this.volume = 0.3;
        this.audioSources = {};
        this.setupAudioSystem();
    }

    setupAudioSystem() {
        // Inicializa o contexto de áudio
        this.initAudioContext();
        
        // Cria controles de áudio
        this.createAudioControls();
        
        // Escuta mudanças de tema
        this.listenToThemeChanges();
    }

    initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API não suportada');
        }
    }

    createAudioControls() {
        // Remove controles de áudio da interface do usuário
        // O áudio será controlado apenas via métodos JS, sem elementos visíveis
    }

    addAudioEvents(controls) {
        const toggle = controls.querySelector('.audio-toggle');
        const content = controls.querySelector('.audio-content');
        const volumeSlider = controls.querySelector('.volume-slider');
        const volumeValue = controls.querySelector('.volume-value');

        // Toggle panel
        toggle.addEventListener('click', () => {
            controls.classList.toggle('expanded');
            if (controls.classList.contains('expanded') && !this.isPlaying) {
                this.startAmbientSound(this.currentTheme);
            }
        });

        // Volume control
        volumeSlider.addEventListener('input', (e) => {
            this.volume = parseFloat(e.target.value);
            volumeValue.textContent = Math.round(this.volume * 100) + '%';
            this.updateVolume();
        });

        // Effect buttons
        controls.querySelectorAll('.effect-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const effect = btn.dataset.effect;
                this.playEffect(effect);
                this.highlightButton(btn);
            });
        });

        // Ambient theme buttons
        controls.querySelectorAll('.ambient-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const theme = btn.dataset.theme;
                this.switchAmbientTheme(theme);
                this.highlightAmbientButton(btn);
            });
        });
    }

    // Gera sons proceduralmente usando Web Audio API
    generateTone(frequency, duration, type = 'sine') {
        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = type;

        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    generateNoise(duration, color = 'white') {
        if (!this.audioContext) return;

        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        // Gera ruído baseado na cor
        for (let i = 0; i < bufferSize; i++) {
            switch(color) {
                case 'pink':
                    data[i] = (Math.random() * 2 - 1) * Math.pow(0.5, i / bufferSize);
                    break;
                case 'brown':
                    data[i] = (Math.random() * 2 - 1) * Math.pow(0.25, i / bufferSize);
                    break;
                default: // white
                    data[i] = Math.random() * 2 - 1;
            }
        }

        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        
        source.buffer = buffer;
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        gainNode.gain.value = this.volume * 0.1;
        source.start();
    }

    playEffect(effectType) {
        switch(effectType) {
            case 'page-turn':
                this.generateTone(200, 0.1, 'sawtooth');
                setTimeout(() => this.generateTone(150, 0.1, 'sawtooth'), 50);
                break;
                
            case 'camera-click':
                this.generateTone(800, 0.05, 'square');
                setTimeout(() => this.generateTone(400, 0.1, 'triangle'), 60);
                break;
                
            case 'magic-sparkle':
                for(let i = 0; i < 5; i++) {
                    setTimeout(() => {
                        this.generateTone(400 + Math.random() * 800, 0.2, 'sine');
                    }, i * 100);
                }
                break;
                
            case 'collect-treasure':
                const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
                notes.forEach((note, i) => {
                    setTimeout(() => this.generateTone(note, 0.3, 'triangle'), i * 100);
                });
                break;
        }
    }

    startAmbientSound(theme) {
        this.stopAmbientSound();
        this.isPlaying = true;
        this.currentTheme = theme;

        switch(theme) {
            case 'sunset':
                this.playWarmAmbient();
                break;
            case 'ocean':
                this.playOceanAmbient();
                break;
            case 'forest':
                this.playForestAmbient();
                break;
            case 'rain':
                this.playRainAmbient();
                break;
            case 'cafe':
                this.playCafeAmbient();
                break;
        }
    }

    playWarmAmbient() {
        // Tom caloroso com harmônicos suaves
        const playWarmTone = () => {
            if (!this.isPlaying) return;
            
            this.generateTone(220 + Math.random() * 20, 4, 'sine');
            this.generateTone(330 + Math.random() * 15, 3, 'triangle');
            
            setTimeout(playWarmTone, 3000 + Math.random() * 2000);
        };
        playWarmTone();
    }

    playOceanAmbient() {
        // Simula ondas do mar
        const playWave = () => {
            if (!this.isPlaying) return;
            
            this.generateNoise(2 + Math.random() * 3, 'pink');
            
            setTimeout(playWave, 1000 + Math.random() * 2000);
        };
        playWave();
    }

    playForestAmbient() {
        // Sons de floresta com pássaros ocasionais
        const playForest = () => {
            if (!this.isPlaying) return;
            
            // Vento nas árvores
            this.generateNoise(1, 'brown');
            
            // Pássaro ocasional
            if (Math.random() < 0.3) {
                setTimeout(() => {
                    this.generateTone(800 + Math.random() * 400, 0.2, 'sine');
                }, 500);
            }
            
            setTimeout(playForest, 2000 + Math.random() * 4000);
        };
        playForest();
    }

    playRainAmbient() {
        // Chuva constante
        const playRain = () => {
            if (!this.isPlaying) return;
            
            this.generateNoise(0.1, 'white');
            
            setTimeout(playRain, 50);
        };
        playRain();
    }

    playCafeAmbient() {
        // Ambiente de café com sons ocasionais
        const playCafe = () => {
            if (!this.isPlaying) return;
            
            // Murmúrio de fundo
            this.generateNoise(1, 'pink');
            
            // Som ocasional de xícara
            if (Math.random() < 0.2) {
                setTimeout(() => {
                    this.generateTone(400, 0.1, 'triangle');
                }, Math.random() * 1000);
            }
            
            setTimeout(playCafe, 1500 + Math.random() * 3000);
        };
        playCafe();
    }

    stopAmbientSound() {
        this.isPlaying = false;
    }

    switchAmbientTheme(theme) {
        this.startAmbientSound(theme);
    }

    updateVolume() {
        // O volume é aplicado individualmente a cada som gerado
    }

    highlightButton(button) {
        button.style.background = 'rgba(255,255,255,0.3)';
        setTimeout(() => {
            button.style.background = '';
        }, 200);
    }

    highlightAmbientButton(selectedBtn) {
        document.querySelectorAll('.ambient-btn').forEach(btn => btn.classList.remove('active'));
        selectedBtn.classList.add('active');
    }

    listenToThemeChanges() {
        // Escuta mudanças de tema visual para sincronizar áudio
        document.addEventListener('theme-changed', (e) => {
            if (this.isPlaying) {
                this.startAmbientSound(e.detail.theme);
            }
        });

        // Escuta eventos de interação
        // $('.flipbook').on('turned', () => {
        //     this.playEffect('page-turn');
        // });

        document.addEventListener('tab-clicked', () => {
            this.playEffect('magic-sparkle');
        });
    }
}
