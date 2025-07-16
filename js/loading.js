// Gerenciador da Tela de Carregamento
class LoadingManager {
    constructor() {
        this.loadingScreen = document.getElementById('loadingScreen');
        this.isLoading = true;
        this.minLoadingTime = 2000; // Tempo mínimo de carregamento em ms
        this.startTime = Date.now();
        
        this.init();
    }
    
    init() {
        // Garantir que a tela de carregamento seja visível inicialmente
        if (this.loadingScreen) {
            this.loadingScreen.style.display = 'flex';
            this.loadingScreen.classList.remove('hidden');
        }
        
        // Aguardar o carregamento do DOM e recursos
        this.waitForPageLoad();
    }
    
    waitForPageLoad() {
        // Aguardar que todos os recursos sejam carregados
        const checkReadyState = () => {
            if (document.readyState === 'complete') {
                this.onPageReady();
            } else {
                setTimeout(checkReadyState, 100);
            }
        };
        
        // Verificar se já está pronto
        if (document.readyState === 'complete') {
            this.onPageReady();
        } else {
            // Aguardar o evento de load
            window.addEventListener('load', () => {
                this.onPageReady();
            });
            
            // Verificação adicional
            checkReadyState();
        }
    }
    
    onPageReady() {
        const elapsed = Date.now() - this.startTime;
        const remainingTime = Math.max(0, this.minLoadingTime - elapsed);
        
        // Aguardar o tempo mínimo antes de ocultar
        setTimeout(() => {
            this.hideLoadingScreen();
        }, remainingTime);
    }
    
    hideLoadingScreen() {
        if (this.loadingScreen && this.isLoading) {
            this.isLoading = false;
            
            // Adicionar classe para fade out
            this.loadingScreen.classList.add('hidden');
            
            // Remover do DOM após a animação
            setTimeout(() => {
                this.loadingScreen.style.display = 'none';
                console.log('Loading screen hidden');
            }, 500); // Tempo da transição CSS
        }
    }
    
    // Método para mostrar novamente (se necessário)
    showLoadingScreen() {
        if (this.loadingScreen) {
            this.isLoading = true;
            this.loadingScreen.style.display = 'flex';
            this.loadingScreen.classList.remove('hidden');
        }
    }
    
    // Método para verificar se está carregando
    isLoadingActive() {
        return this.isLoading;
    }
}

// Inicializar o gerenciador assim que possível
document.addEventListener('DOMContentLoaded', () => {
    window.loadingManager = new LoadingManager();
});

// Fallback para garantir que funcione mesmo sem DOMContentLoaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (!window.loadingManager) {
            window.loadingManager = new LoadingManager();
        }
    });
} else {
    // DOM já está pronto
    window.loadingManager = new LoadingManager();
}
