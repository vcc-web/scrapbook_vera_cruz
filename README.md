# Scrapbook de Memórias 📸

Uma aplicação web interativa que simula um scrapbook artesanal de memórias, com visualização de fotos em tela cheia e molduras decorativas.

## ✨ Características

- **Interface Artesanal**: Molduras decorativas que simulam um scrapbook real
- **Navegação Intuitiva**: Clique na direita para avançar, esquerda para voltar
- **Design Responsivo**: Funciona perfeitamente em desktop e mobile
- **Animações Suaves**: Transições fluidas entre fotos
- **Controles Múltiplos**: Mouse, teclado, touch e gestos
- **Efeitos Visuais**: Washi tape, decorações e sombras realistas

## 🎮 Como Usar

1. **Navegação por Mouse/Touch**:
   - Clique na parte direita da tela → próxima foto
   - Clique na parte esquerda da tela → foto anterior
   - Clique nos pontos de progresso → vai direto para a foto

2. **Navegação por Teclado**:
   - `→` ou `↓` ou `Espaço` → próxima foto
   - `←` ou `↑` → foto anterior
   - `Home` → primeira foto
   - `End` → última foto
   - `Esc` → mostrar instruções

3. **Gestos Mobile**:
   - Deslize para a esquerda → próxima foto
   - Deslize para a direita → foto anterior

## 📁 Estrutura de Arquivos

```bash
mama/
├── index.html          # Página principal
├── styles.css          # Estilos artesanais
├── script.js           # Funcionalidade interativa
├── img/                # Pasta para suas fotos
└── README.md           # Este arquivo
```

## 🖼️ Adicionando Suas Próprias Fotos

1. Coloque suas fotos na pasta `img/`
2. Edite o arquivo `script.js` na seção `loadPhotos()` para incluir suas fotos:

```javascript
this.photos = [
    {
        src: 'img/sua-foto-1.jpg',
        text: 'Descrição da sua memória...',
        date: 'Data ou período'
    },
    {
        src: 'img/sua-foto-2.jpg',
        text: 'Outra memória especial...',
        date: 'Outra data'
    }
    // Adicione mais fotos aqui...
];
```

## 🎨 Personalização

O design pode ser facilmente personalizado editando o arquivo `styles.css`:

- **Cores**: Modifique as variáveis de cor nos gradientes
- **Fontes**: Troque as fontes do Google Fonts
- **Animações**: Ajuste as transições e efeitos
- **Layout**: Modifique tamanhos e posições dos elementos

## 🚀 Tecnologias Utilizadas

- **HTML5**: Estrutura semântica
- **CSS3**: Animações e efeitos visuais avançados
- **JavaScript ES6+**: Funcionalidade moderna e interativa
- **Google Fonts**: Tipografia artesanal
- **Responsive Design**: Layout adaptativo

## 📱 Compatibilidade

- ✅ Chrome, Firefox, Safari, Edge (versões modernas)
- ✅ Dispositivos móveis (iOS, Android)
- ✅ Tablets e desktops
- ✅ Suporte a touch e gestos

## 🎯 Funcionalidades Extras

- **Auto-rotação**: Avança automaticamente após 10 segundos de inatividade
- **Pré-carregamento**: Imagens são carregadas antecipadamente
- **Easter Egg**: Código Konami para efeito especial 🌈
- **Indicadores Visuais**: Contador de fotos e progresso
- **Efeitos Sonoros**: (Pode ser adicionado posteriormente)

## 🛠️ Para Desenvolvedores

A aplicação é construída com uma classe JavaScript moderna:

```javascript
const scrapbook = new ScrapbookViewer();

// Adicionar foto programaticamente
scrapbook.addPhoto('caminho/para/foto.jpg', 'Texto', 'Data');

// Remover foto
scrapbook.removePhoto(index);
```

## 📸 Dicas para Melhores Resultados

1. **Resolução**: Use fotos com boa qualidade (mín. 800x600)
2. **Formato**: JPG, PNG, WebP são suportados
3. **Proporção**: Fotos em landscape funcionam melhor
4. **Tamanho**: Otimize para web (< 2MB por foto)

---

### Criado com ❤️ para preservar suas memórias mais preciosas
