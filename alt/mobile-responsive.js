// Enhanced Mobile Responsiveness Script
// This script handles advanced mobile viewport fixes and responsive behaviors

class MobileResponsiveHandler {
    constructor() {
        this.isMobile = this.detectMobile();
        this.isIOS = this.detectIOS();
        this.isAndroid = this.detectAndroid();
        this.viewportHeight = window.innerHeight;
        this.viewportWidth = window.innerWidth;
        
        this.initializeMobileFeatures();
        this.setupViewportHandling();
        this.setupOrientationHandling();
        this.setupTouchHandling();
        this.setupPerformanceOptimizations();
        
        console.log('Mobile Responsive Handler initialized:', {
            isMobile: this.isMobile,
            isIOS: this.isIOS,
            isAndroid: this.isAndroid,
            viewport: `${this.viewportWidth}x${this.viewportHeight}`
        });
    }
    
    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               window.innerWidth <= 768;
    }
    
    detectIOS() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    }
    
    detectAndroid() {
        return /Android/i.test(navigator.userAgent);
    }
    
    initializeMobileFeatures() {
        if (this.isMobile) {
            document.body.classList.add('mobile');
            
            // Add platform-specific classes
            if (this.isIOS) {
                document.body.classList.add('ios');
            }
            if (this.isAndroid) {
                document.body.classList.add('android');
            }
            
            // Prevent zoom on double tap
            document.addEventListener('touchstart', function(event) {
                if (event.touches.length > 1) {
                    event.preventDefault();
                }
            });
            
            let lastTouchEnd = 0;
            document.addEventListener('touchend', function(event) {
                const now = (new Date()).getTime();
                if (now - lastTouchEnd <= 300) {
                    event.preventDefault();
                }
                lastTouchEnd = now;
            }, false);
        }
    }
    
    setupViewportHandling() {
        // Set CSS custom property for viewport height
        const setVH = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
            
            // Update viewport dimensions
            this.viewportHeight = window.innerHeight;
            this.viewportWidth = window.innerWidth;
            
            // Trigger custom event for other components
            window.dispatchEvent(new CustomEvent('viewportChanged', {
                detail: {
                    width: this.viewportWidth,
                    height: this.viewportHeight,
                    vh: vh
                }
            }));
        };
        
        // Set initial viewport height
        setVH();
        
        // Update on resize with debouncing
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(setVH, 100);
        });
        
        // Special handling for iOS Safari address bar
        if (this.isIOS) {
            window.addEventListener('orientationchange', () => {
                setTimeout(setVH, 500);
            });
        }
    }
    
    setupOrientationHandling() {
        const handleOrientationChange = () => {
            const orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
            
            document.body.classList.remove('portrait', 'landscape');
            document.body.classList.add(orientation);
            
            // Dispatch orientation change event
            window.dispatchEvent(new CustomEvent('orientationChanged', {
                detail: { orientation }
            }));
            
            // Force viewport recalculation after orientation change
            setTimeout(() => {
                const vh = window.innerHeight * 0.01;
                document.documentElement.style.setProperty('--vh', `${vh}px`);
            }, 300);
        };
        
        // Initial orientation
        handleOrientationChange();
        
        // Listen for orientation changes
        window.addEventListener('orientationchange', () => {
            setTimeout(handleOrientationChange, 100);
        });
        
        window.addEventListener('resize', handleOrientationChange);
    }
    
    setupTouchHandling() {
        if (!this.isMobile) return;
        
        // Improve touch responsiveness
        document.body.style.touchAction = 'manipulation';
        
        // Add touch-specific CSS
        const touchCSS = `
            .touch-device * {
                -webkit-tap-highlight-color: transparent;
                -webkit-touch-callout: none;
                -webkit-user-select: none;
                user-select: none;
            }
            
            .touch-device .nav-area {
                -webkit-tap-highlight-color: rgba(212, 175, 55, 0.2);
            }
            
            .touch-device .start-button {
                -webkit-tap-highlight-color: rgba(212, 175, 55, 0.3);
            }
        `;
        
        const style = document.createElement('style');
        style.textContent = touchCSS;
        document.head.appendChild(style);
        
        document.body.classList.add('touch-device');
        
        // Enhanced touch feedback for navigation areas
        const navAreas = document.querySelectorAll('.nav-area');
        navAreas.forEach(area => {
            let touchStartTime;
            
            area.addEventListener('touchstart', (e) => {
                touchStartTime = Date.now();
                area.style.backgroundColor = 'rgba(212, 175, 55, 0.15)';
            }, { passive: true });
            
            area.addEventListener('touchend', (e) => {
                const touchDuration = Date.now() - touchStartTime;
                
                // Provide visual feedback
                setTimeout(() => {
                    area.style.backgroundColor = '';
                }, 150);
                
                // Ensure quick taps are registered
                if (touchDuration < 500) {
                    e.stopPropagation();
                }
            }, { passive: true });
            
            area.addEventListener('touchcancel', () => {
                area.style.backgroundColor = '';
            }, { passive: true });
        });
    }
    
    setupPerformanceOptimizations() {
        if (!this.isMobile) return;
        
        // Reduce animations on lower-end devices
        const isLowEndDevice = () => {
            return navigator.hardwareConcurrency <= 2 || 
                   navigator.deviceMemory <= 2 ||
                   window.innerWidth <= 480;
        };
        
        if (isLowEndDevice()) {
            document.body.classList.add('low-end-device');
            
            // Add CSS for reduced animations
            const lowEndCSS = `
                .low-end-device * {
                    animation-duration: 0.2s !important;
                    transition-duration: 0.2s !important;
                }
                
                .low-end-device .frame-decoration,
                .low-end-device .paper-texture,
                .low-end-device .washi-tape {
                    display: none !important;
                }
                
                .low-end-device .photo {
                    filter: none !important;
                }
                
                .low-end-device .photo-frame {
                    animation: none !important;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
                }
            `;
            
            const style = document.createElement('style');
            style.textContent = lowEndCSS;
            document.head.appendChild(style);
        }
        
        // Optimize images for mobile
        this.optimizeImagesForMobile();
        
        // Preload critical assets
        this.preloadCriticalAssets();
    }
    
    optimizeImagesForMobile() {
        const images = document.querySelectorAll('img');
        
        images.forEach(img => {
            // Add loading optimization
            if (!img.hasAttribute('loading')) {
                img.setAttribute('loading', 'lazy');
            }
            
            // Add decode hint
            img.decoding = 'async';
            
            // Handle image load errors
            img.addEventListener('error', function() {
                this.style.display = 'none';
                console.warn('Failed to load image:', this.src);
            });
            
            // Optimize image rendering
            img.addEventListener('load', function() {
                this.classList.add('image-loaded');
            });
        });
    }
    
    preloadCriticalAssets() {
        // Preload Google Fonts
        const fontPreloads = [
            'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;600;700&display=swap',
            'https://fonts.googleapis.com/css2?family=Indie+Flower&display=swap',
            'https://fonts.googleapis.com/css2?family=Kalam:wght@300;400;700&display=swap'
        ];
        
        fontPreloads.forEach(href => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'style';
            link.href = href;
            document.head.appendChild(link);
        });
    }
    
    // Public method to force viewport recalculation
    recalculateViewport() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
        this.viewportHeight = window.innerHeight;
        this.viewportWidth = window.innerWidth;
    }
    
    // Public method to get current viewport info
    getViewportInfo() {
        return {
            width: this.viewportWidth,
            height: this.viewportHeight,
            isMobile: this.isMobile,
            isIOS: this.isIOS,
            isAndroid: this.isAndroid,
            orientation: this.viewportHeight > this.viewportWidth ? 'portrait' : 'landscape'
        };
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.mobileHandler = new MobileResponsiveHandler();
    });
} else {
    window.mobileHandler = new MobileResponsiveHandler();
}

// Export for use in other scripts
window.MobileResponsiveHandler = MobileResponsiveHandler;
