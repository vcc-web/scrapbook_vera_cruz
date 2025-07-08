class TabPoolManager {
    constructor() {
        this.tabPool = [];
        this.activeTabs = new Map();
        this.setupPool(3); // Cria 3 abas para reutilização
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
        tab.innerHTML = '<div class="scrapbook-tab-label">Scrapbook</div>';
        tab.style.display = 'none';
        return tab;
    }

    updateTabsForVisiblePages() {
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

        const tab = this.tabPool.pop();
        tab.dataset.page = page.number;
        if (parseInt(page.number) % 2 === 0) {
            tab.classList.add('even');
            tab.classList.remove('odd');
        } else {
            tab.classList.add('odd');
            tab.classList.remove('even');
        }
        tab.classList.add('open');
        tab.style.display = 'block';
        this.activeTabs.set(page.number, tab);
    }

    releaseTab(tab, pageNumber) {
        tab.style.display = 'none';
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
}

// Inicialização
$(document).ready(() => {
    window.tabManager = new TabPoolManager();
});