/**
 * SISTEMA ROBUSTO DE PROTEÇÃO DE IMAGENS
 * Aplicação inteligente no momento exato do carregamento
 * Zero timeout, zero crop, máxima eficiência
 */

class ImageProtectionSystem {
    constructor() {
        this.init();
    }

    init() {
        console.log('🛡️ Sistema de Proteção de Imagens - Versão Robusta');
        
        // Disponibilizar método global limpo
        window.protectImage = (img, contentType) => this.protectSpecificImage(img, contentType);
    }

    // MÉTODO PRINCIPAL - Proteção robusta aplicada no momento certo
    protectSpecificImage(img, contentType = 'general') {
        if (!img || img.dataset.protected === 'true') return;

        try {
            // Análise rápida e aplicação imediata
            const analysis = this.analyzeImage(img, contentType);
            this.applyIntelligentProtection(img, analysis);
            
            // Marcar como protegida após sucesso
            img.dataset.protected = 'true';
            console.log(`🛡️ Proteção: ${analysis.contentType} (${analysis.orientation})`);
            
        } catch (error) {
            console.warn('⚠️ Aplicando proteção básica:', error.message);
            this.applyBasicProtection(img);
        }
    }

    analyzeImage(img, contentType) {
        // Análise eficiente e inteligente
        const width = img.naturalWidth || img.width || 1;
        const height = img.naturalHeight || img.height || 1;
        const ratio = width / height;
        
        // Determinar orientação
        let orientation, focusArea;
        if (ratio > 1.3) {
            orientation = 'landscape';
            focusArea = 'center';
        } else if (ratio < 0.8) {
            orientation = 'portrait';
            focusArea = 'upper-center';
        } else {
            orientation = 'square';
            focusArea = 'center';
        }

        // Detectar tipo de conteúdo
        const detectedType = this.detectContentFromSrc(img.src) || contentType;
        
        // Ajustar foco para rostos/pessoas
        if (detectedType === 'faces' || detectedType === 'people') {
            focusArea = 'upper-center';
        }

        return { orientation, contentType: detectedType, focusArea, aspectRatio: ratio };
    }

    detectContentFromSrc(src) {
        const filename = src.toLowerCase();
        
        // Detecção inteligente por padrões
        if (filename.match(/\d{8}_\d{6}/) || filename.includes('img-')) {
            return 'people'; // Fotos de smartphone = pessoas
        }
        
        if (filename.includes('face') || filename.includes('portrait')) {
            return 'faces';
        }
        
        if (filename.includes('group') || filename.includes('family')) {
            return 'people';
        }
        
        return 'general';
    }

    applyIntelligentProtection(img, analysis) {
        // Definir posicionamento inteligente
        const objectPosition = analysis.focusArea === 'upper-center' 
            ? (analysis.contentType === 'faces' ? 'center 30%' : 'center 35%')
            : 'center center';
        
        // Dimensionamento responsivo
        const isMobile = window.innerWidth <= 768;
        let maxWidth, maxHeight;
        
        switch (analysis.orientation) {
            case 'portrait':
                maxWidth = isMobile ? '80%' : '75%';
                maxHeight = isMobile ? '75%' : '85%';
                break;
            case 'landscape':
                maxWidth = isMobile ? '90%' : '95%';
                maxHeight = isMobile ? '65%' : '70%';
                break;
            default: // square
                maxWidth = '85%';
                maxHeight = isMobile ? '70%' : '75%';
        }
        
        // Aplicar proteção completa
        img.style.cssText = `
            object-fit: contain !important;
            object-position: ${objectPosition} !important;
            max-width: ${maxWidth} !important;
            max-height: ${maxHeight} !important;
            width: auto !important;
            height: auto !important;
            display: block !important;
            margin: auto !important;
        `;
        
        // Aplicar classes ao frame para CSS adicional
        const frame = img.closest('.photo-frame');
        if (frame) {
            frame.classList.add(`${analysis.orientation}-protected`);
            frame.classList.add(`content-${analysis.contentType}`);
        }
    }

    applyBasicProtection(img) {
        // Proteção robusta de emergência
        img.style.cssText = `
            object-fit: contain !important;
            object-position: center center !important;
            max-width: 85% !important;
            max-height: 75% !important;
            width: auto !important;
            height: auto !important;
            display: block !important;
            margin: auto !important;
        `;
        
        img.dataset.protected = 'true';
        console.log('🛡️ Proteção básica robusta aplicada');
    }
}

// Inicialização automática
document.addEventListener('DOMContentLoaded', () => {
    new ImageProtectionSystem();
});

// Para compatibilidade total
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        if (!window.protectImage) {
            new ImageProtectionSystem();
        }
    });
}
