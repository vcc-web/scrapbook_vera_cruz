class TabPoolManager {
    constructor() {
        this.tabPool = [];
        this.activeTabs = new Map();
        this.treeTabs = new Set(); // Track tabs used by tree page
        this.setupPool(3);
        this.setupEventListeners();
    }

    setupPool(size) {
        const tabsContainer = document.querySelector('.tabs-container') ||
            this.createTabsContainer();

        for (let i = 0; i < size; i++) {
            const tab = this.createTabElement();
            tabsContainer.appendChild(tab);
            this.tabPool.push(tab);
        }
    }

    createTabsContainer() {
        const container = document.createElement('div');
        container.className = 'tabs-container';
        document.querySelector('.flipbook-viewport').appendChild(container);
        return container;
    }

    createTabElement() {
        const tab = document.createElement('div');
        tab.className = 'scrapbook-tab';
        tab.innerHTML = '<div class="scrapbook-tab-bg"><div class="scrapbook-tab-label"></div></div>';
        tab.style.display = 'none';

        // Add click event listener
        tab.addEventListener('click', (e) => {
            this.handleTabClick(tab, e);
        });

        return tab;
    }

    updateTabsForVisiblePages() {
        // Don't update tabs if tree is active
        if (this.isTreeActive()) {
            return;
        }
        
        const now = performance.now();
        const visiblePages = this.getVisiblePages();
        const viewportRect = document.querySelector('.flipbook-viewport').getBoundingClientRect();

        // Libera abas de páginas não mais visíveis
        this.activeTabs.forEach((tab, pageNumber) => {
            if (!visiblePages.some(page => page.number === pageNumber)) {
                this.releaseTab(tab, pageNumber);
            }
        });

        // Atribui abas para novas páginas visíveis
        visiblePages.forEach(page => {
            if (!this.activeTabs.has(page.number)) {
                this.assignTabToPage(page);
            }
        });

        console.log(`Atualização de abas em ${performance.now() - now}ms`);
    }

    assignTabToPage(page) {
        if (this.tabPool.length === 0) return;

        if (window.book.turn('page') < 2) {
            console.log('Book has less than 2 pages, skipping tab assignment');
            return;
        }
        if (page.element.dataset.hasTab === "false") {
            return;
        }

            const tab = this.tabPool.pop();
            tab.dataset.page = page.number;

        if (parseInt(page.number) % 2 === 0) {
            tab.classList.add('even');
            tab.classList.remove('odd');
        } else {
            tab.classList.add('odd');
            tab.classList.remove('even');
        }
        // tab.classList.add('open');
        tab.style.display = 'block';

        this.updateTabStyle(tab, page);

        this.activeTabs.set(page.number, tab);
    }

    updateTabStyle(tab, page) {
        const pageRect = page.element.getBoundingClientRect();
        const patternClass = Array.from(page.element.classList).find(c => c.startsWith('pattern-'));
        
        // Verifica se é uma página de oração
        const isOracaoPage = page.element.classList.contains('oracao-page');

        // Configuração do pseudo-elemento ::before
        this.setTabBackground(tab, page.element, patternClass, pageRect, isOracaoPage);
    }

    setTabBackground(tab, pageElement, patternClass, pageRect, isOracaoPage) {

        let bgEl = tab.firstElementChild;
        Array.from(bgEl.classList).filter(c => c.startsWith('pattern-')).forEach(c => bgEl.classList.remove(c));

        if (isOracaoPage) {
            // Para páginas de oração, aplicar a mesma cor de fundo da página
            bgEl.style.background = '#fffbe6'; // Cor das páginas de oração
            
            // Remove qualquer padrão que possa ter sido aplicado
            bgEl.classList.remove(...Array.from(bgEl.classList).filter(c => c.startsWith('pattern-')));
            
            console.log(`[TabManager] Applied prayer page background to tab`);
        } else if (patternClass && bgEl) {
            // Para páginas normais, aplicar o padrão da página
            bgEl.style.background = ''; // Remove background inline
            bgEl.classList.add(patternClass);

            // Força repaint para sincronização perfeita
            // tab.style.animation = 'none';
            // void tab.offsetHeight; // Trigger reflow
            // tab.style.animation = '';
        }
    }

    releaseTab(tab, pageNumber) {
        // Don't release tree tabs through normal page management
        if (tab.dataset.isTreeTab === 'true') {
            return;
        }
        
        tab.style.display = 'none';
        tab.classList.remove('clicked'); // Remove clicked state when releasing
        delete tab.dataset.page;
        this.activeTabs.delete(pageNumber);
        this.tabPool.push(tab);
    }

    getVisiblePages() {
        return Array.from(document.querySelectorAll('.page-wrapper'))
            .filter(wrapper => {
                const style = window.getComputedStyle(wrapper);
                return style.display !== 'none' &&
                    parseInt(style.zIndex) > 0;
            })
            .sort((a, b) => parseInt(b.style.zIndex) - parseInt(a.style.zIndex))
            .slice(0, 2)
            .map(wrapper => ({
                number: wrapper.getAttribute('page'),
                element: wrapper.querySelector('.page')
            }));
    }

    handleTabClick(tab, event) {
        event.stopPropagation();

        // Simply toggle clicked state - allow multiple tabs to be open
        if (tab.classList.contains('clicked')) {
            tab.classList.remove('clicked');
        } else {
            tab.classList.add('clicked');
        }
    }

    setupEventListeners() {
        // Atualização durante animações
        $('.flipbook').on('turned', () => {
            requestAnimationFrame(() => this.updateTabsForVisiblePages());
        });

        // Atualização em redimensionamento
        const resizeObserver = new ResizeObserver(() => {
            this.updateTabsForVisiblePages();
        });
        resizeObserver.observe(document.querySelector('.flipbook-viewport'));

        // Atualização inicial
        requestAnimationFrame(() => this.updateTabsForVisiblePages());
    }

    // Special methods for tree page tab management
    acquireTabsForTree(sectionsData) {
        const acquiredTabs = [];
        
        // Clear any existing tree tabs first
        // this.releaseTreeTabs();
        
        // Acquire tabs for each section
        sectionsData.forEach((sectionData, index) => {
            if (this.tabPool.length > 0) {
                const tab = this.tabPool.pop();
                
                // Configure tab for tree section
                tab.dataset.treeSection = sectionData.id;
                tab.dataset.isTreeTab = 'true';
                
                // Set up tab appearance
                this.setupTreeTab(tab, sectionData, index);
                
                // Track this tab
                this.treeTabs.add(tab);
                acquiredTabs.push(tab);
                
                // Show the tab
                tab.style.display = 'block';
                
                console.log(`Acquired tab for tree section ${sectionData.id}`);
            }
        });
        
        return acquiredTabs;
    }
    
    setupTreeTab(tab, sectionData, index) {
        // Clear existing classes
        tab.classList.remove('even', 'odd', 'clicked');
        tab.classList.add('tree-tab-active');
        
        // Set even/odd classes
        if (index % 2 === 0) {
            tab.classList.add('even');
        } else {
            tab.classList.add('odd');
        }
        
        // Add section image if provided
        if (sectionData.image) {
            this.addTreeTabImage(tab, sectionData.image, sectionData.alt || `Seção ${sectionData.id}`);
        }
        
        // Set up click handler for tree navigation
        if (sectionData.onClick) {
            tab.addEventListener('click', sectionData.onClick);
        }
    }
    
    addTreeTabImage(tab, imageSrc, altText) {
        // Remove existing tree tab image
        const existingImg = tab.querySelector('.tree-tab-img');
        if (existingImg) {
            existingImg.remove();
        }
        
        // Only create new image if imageSrc is provided
        if (imageSrc) {
            const img = document.createElement('img');
            img.className = 'tree-tab-img';
            img.src = imageSrc;
            img.alt = altText;
            img.style.verticalAlign = 'middle';
            
            // Insert at the beginning of the tab
            tab.insertBefore(img, tab.firstChild);
        }
    }
    
    activateTreeTabs() {
        // Add clicked state to all tree tabs with a delay
        setTimeout(() => {
            this.treeTabs.forEach(tab => {
                tab.classList.add('clicked');
            });
        }, 200);
    }
    
    releaseTreeTabs() {
        console.log(`Releasing ${this.treeTabs.size} tree tabs`);
        
        // First, remove clicked state to trigger closing animation
        this.treeTabs.forEach(tab => {
            tab.classList.remove('clicked');
        });
        
        // After animation completes, clean up and return to pool
        setTimeout(() => {
            this.treeTabs.forEach(tab => {
                // Remove tree-specific classes and attributes
                tab.classList.remove('tree-tab-active');
                delete tab.dataset.treeSection;
                delete tab.dataset.isTreeTab;
                
                // Remove tree tab image
                const img = tab.querySelector('.tree-tab-img');
                if (img) {
                    img.remove();
                }
                
                // Remove any tree-specific event listeners
                // Note: We'll need to clone the node to remove all event listeners
                const newTab = tab.cloneNode(true);
                tab.parentNode.replaceChild(newTab, tab);
                
                // Re-add the standard click handler
                newTab.addEventListener('click', (e) => {
                    this.handleTabClick(newTab, e);
                });
                
                // Hide and return to pool
                newTab.style.display = 'none';
                this.tabPool.push(newTab);
            });
            
            // Clear the tree tabs set
            this.treeTabs.clear();
            console.log('Tree tabs cleanup completed');
        }, 1300); // Same duration as the tree overlay animation
    }
    
    // Method to immediately release tree tabs without animation (for emergency cleanup)
    forceReleaseTreeTabs() {
        console.log(`Force releasing ${this.treeTabs.size} tree tabs`);
        
        this.treeTabs.forEach(tab => {
            // Remove tree-specific classes and attributes
            tab.classList.remove('clicked', 'tree-tab-active');
            delete tab.dataset.treeSection;
            delete tab.dataset.isTreeTab;
            
            // Remove tree tab image
            const img = tab.querySelector('.tree-tab-img');
            if (img) {
                img.remove();
            }
            
            // Remove any tree-specific event listeners
            const newTab = tab.cloneNode(true);
            tab.parentNode.replaceChild(newTab, tab);
            
            // Re-add the standard click handler
            newTab.addEventListener('click', (e) => {
                this.handleTabClick(newTab, e);
            });
            
            // Hide and return to pool
            newTab.style.display = 'none';
            this.tabPool.push(newTab);
        });
        
        // Clear the tree tabs set
        this.treeTabs.clear();
    }
    
    // Method to check if tree tabs are in the process of being released
    isTreeTabsReleasing() {
        return this.treeTabs.size > 0 && 
               Array.from(this.treeTabs).some(tab => !tab.classList.contains('clicked'));
    }
    
    isTreeActive() {
        return this.treeTabs.size > 0;
    }

    // Hide all normal tabs (non-tree tabs)
    hideNormalTabs() {
        console.log('[TabManager] Hiding normal tabs');
        
        // Hide all active tabs (normal page tabs)
        this.activeTabs.forEach((tab, pageNumber) => {
            if (tab.dataset.isTreeTab !== 'true') {
                tab.style.display = 'none';
                console.log(`[TabManager] Hidden normal tab for page ${pageNumber}`);
            }
        });
    }

    // Show all normal tabs (restore them)
    showNormalTabs() {
        console.log('[TabManager] Showing normal tabs');
        
        // Update tabs for visible pages to restore normal tabs
        setTimeout(() => {
            this.updateTabsForVisiblePages();
        }, 100);
    }

    hasAvailableTabs(count) {
        return this.tabPool.length >= count;
    }
    
    getAvailableTabCount() {
        return this.tabPool.length;
    }
    
    // Method to ensure minimum tabs are available
    ensureMinimumTabs(minCount) {
        if (this.tabPool.length + this.activeTabs.size + this.treeTabs.size < minCount) {
            const additionalTabs = minCount - (this.tabPool.length + this.activeTabs.size + this.treeTabs.size);
            console.log(`Creating ${additionalTabs} additional tabs`);
            
            const tabsContainer = document.querySelector('.tabs-container');
            for (let i = 0; i < additionalTabs; i++) {
                const tab = this.createTabElement();
                tabsContainer.appendChild(tab);
                this.tabPool.push(tab);
            }
        }
    }

    // Method to update tree tabs with patron saint images
    updateTreeTabsWithPatron(patronImage, sectionId) {
        console.log(`Updating tree tabs with patron image: ${patronImage} for section ${sectionId}`);
        
        this.treeTabs.forEach(tab => {
            const img = tab.querySelector('.tree-tab-img');
            if (img) {
                // Update image source directly without loading state
                img.src = patronImage;
                img.alt = `Patrono da Seção ${sectionId}`;
                
                // Add section data attribute for styling
                tab.setAttribute('data-section', sectionId);
                
                // Remove any previous effects
                tab.classList.remove('patron-selected');
            } else {
                // If no image exists, create one
                const newImg = document.createElement('img');
                newImg.className = 'tree-tab-img';
                newImg.src = patronImage;
                newImg.alt = `Patrono da Seção ${sectionId}`;
                
                // Add section data attribute for styling
                tab.setAttribute('data-section', sectionId);
                
                // Insert at the beginning of the tab
                tab.insertBefore(newImg, tab.firstChild);
            }
        });
    }
}

// Inicialização
$(document).ready(() => {

    window.tabManager = new TabPoolManager();
});