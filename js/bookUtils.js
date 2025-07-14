
// Load frases-vera-cruz.json once and keep in memory
let scrapbookJsonData = [];

function loadScrapbookJsonData() {
	if (scrapbookJsonData.length > 0) return scrapbookJsonData;
	// Synchronous fetch for simplicity (assumes local file)
	$.ajax({
		url: 'frases-vera-cruz.json',
		dataType: 'json',
		async: false,
		success: function (data) {
			scrapbookJsonData = data;
		},
		error: function () {
			scrapbookJsonData = [];
		}
	});
	return scrapbookJsonData;
}

function getRandomRotation() {
	return Math.random() * 40 - 20; // -20 to 20 degrees
}

function getRandomPattern() {
	let pattern;
	do {
		pattern = Math.floor(Math.random() * 156) + 1;
	} while (pattern === 56 || pattern === 57 || pattern === 11);
	return pattern; // patterns 1-156
}


// Returns the post-it text for a given imageSrc (filename only, e.g. "matheus.jpg")
function getPostItTextForImage(imageSrc) {
	const data = loadScrapbookJsonData();
	// Try to match by foto field (should be "img/filename.jpg")
	const imgPath = `img/${imageSrc}`;
	const entry = data.find(e => e.foto && e.foto.toLowerCase() === imgPath.toLowerCase());
	if (!entry) return null;
	// Prefer mensagem, fallback to frase
	if (entry.mensagem && entry.mensagem.trim()) return entry.mensagem;
	if (entry.frase && entry.frase.trim()) return entry.frase;
	return null;
}

function getRandomLayout() {
	const layouts = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
	return layouts[Math.floor(Math.random() * layouts.length)];
}

function getRandomPostItColor() {
	const colors = ['post-it-yellow', 'post-it-pink', 'post-it-blue', 'post-it-green', 'post-it-orange', 'post-it-purple'];
	return colors[Math.floor(Math.random() * colors.length)];
}
function createOracaoPage(imgSrc, page, book) {
	// Extract the number from the page id (e.g., "oracao3" -> 3)
	let pageNum = null;
	console.log(page);

	if (imgSrc.startsWith('oracao')) {
		pageNum = imgSrc.replace('oracao', '');
	}

	// Define your prayers and images here
	const oracoes = {
		'1': {
			img: 'img/oracao1.jpg',
			texto1: 'Vinde Espírito Santo, vinde por meio da poderosa intercessão do Imaculado Coração de Maria, vossa amadíssima Esposa e nossa mãe.'
		},
		'2': {
			img: 'img/oracao2.jpg',
			texto1: 'O Anjo do Senhor anunciou a Maria, e ela concebeu do Espírito Santo.',
			texto2: 'Ave Maria, cheia de graça, o Senhor é convosco; bendita sois vós entre as mulheres e bendito é o fruto do vosso ventre, Jesus. Santa Maria, Mãe de Deus, rogai por nós, pecadores, agora e na hora de nossa morte. Amém.',
			texto3: 'Eis aqui a serva do Senhor. Faça-se em mim segundo a vossa palavra.',
			texto4: 'Reza-se a Ave-Maria.',
			texto5: 'E o Verbo se fez carne e habitou entre nós.',
			texto6: 'Reza-se a Ave-Maria.',
			texto7: 'Rogai por nós, Santa Mãe de Deus, para que sejamos dignos das promessas de Cristo.',
			texto8: 'Oremos: Derramai, ó Deus, a Vossa graça em nossos corações, para que conhecendo pela anunciação do Anjo a encarnação do Vosso Filho, cheguemos, por Sua paixão e Cruz, à glória da ressurreição. Por Cristo, Nosso Senhor. Amém.',
			texto9: 'Glória ao Pai, ao Filho e ao Espírito Santo, como era no princípio, agora e sempre, por todos os séculos dos séculos. Amém.'
		},
		'3': {
			img: 'img/oracao3.jpg',
			texto1: 'Ó Sangue e Água que jorrastes do Coração de Jesus como uma fonte de misericórdia para nós, eu confio em Vós.',
			texto2: 'Ó Sangue e Água que jorrastes do Coração de Jesus como uma fonte de misericórdia para nós, eu confio em Vós.',
			texto3: 'Ó Sangue e Água que jorrastes do Coração de Jesus como uma fonte de misericórdia para nós, eu confio em Vós.'
		},

	};

	const dados = oracoes[pageNum] || {
		img: 'img/oracao-default.jpg',
		texto: 'Oração padrão: Coloque sua oração personalizada aqui.'
	};

	// Cria o elemento da página
	const $img = $('<img />', {
		src: dados.img,
		alt: `Oração ${pageNum}`,
		css: {
			width: '80%',
			borderRadius: '12px',
			margin: '24px auto',
			display: 'block',
			boxShadow: '0 2px 12px rgba(80,60,20,0.18)'
		}
	});

	// Monta os textos em spans
	const $textContent = $('<div />', { class: 'text-content' });
	let textoFields = Object.keys(dados).filter(k => k.startsWith('texto'));
	if (textoFields.length === 0 && dados.texto) {
		textoFields = ['texto'];
	}
	textoFields.forEach((field, idx) => {
		const span = $('<span />', {
			class: 'oracao-span',
			id: `oracao-span-${pageNum}-${idx + 1}`,
			text: '' // Inicialmente vazio para animação
		});
		$textContent.append(span);
	});

	const $texto = $('<div />', {
		class: 'oracao-texto',
		css: {
			margin: '32px auto',
			fontSize: '1.3rem',
			textAlign: 'center',
			maxWidth: '90%',
			color: '#213822',
			fontFamily: 'serif',
			borderRadius: '8px',
			padding: '18px',
			boxShadow: '0 1px 8px rgba(251,193,83,0.08)'
		}
	}).append($textContent);

	// Função para animar texto letra por letra
	function animateOracaoText() {
		textoFields.forEach((field, idx) => {
			const text = dados[field];
			const span = document.getElementById(`oracao-span-${pageNum}-${idx + 1}`);
			if (!span) return;
			let i = 0;
			function typeLetter() {
				if (i <= text.length) {
					span.textContent = text.substring(0, i);
					i++;
					setTimeout(typeLetter, 18 + Math.random() * 32);
				}
			}
			setTimeout(typeLetter, idx * 600); // Delay entre spans
		});
	}

	// Cria o elemento da página
	const pageElement = $('<div />', {
		class: 'own-size page oracao-page',
		'data-page': page,
		'data-has-tab': true,
		css: { overflow: 'visible', position: 'relative', background: '#fffbe6' }
	}).append(
		$('<div />', {
			class: 'oracao-content',
			css: { overflow: 'visible', paddingTop: '48px' }
		}).append(
			$img,
			$texto
		)
	);

	book.turn('addPage', pageElement, page);

	// Inicia animação do texto após inserir na página
	setTimeout(animateOracaoText, 350);
}


// Global video event management
window.videoEventManager = {
	attachVideoListeners: function() {
		// Start video listeners
		const startPlayBtn = document.getElementById('start-video-play');
		const startReplayBtn = document.getElementById('start-video-replay');
		const startVideo = document.getElementById('start-video');
		
		if (startPlayBtn && startReplayBtn && startVideo) {
			startPlayBtn.onclick = function(e) {
				e.stopPropagation();
				e.preventDefault();
				const playPromise = startVideo.play();
				if (playPromise !== undefined) {
					playPromise.then(() => {
						$(startPlayBtn).hide();
					}).catch(error => {
						console.error('Error playing start video:', error);
					});
				}
			};
			
			startReplayBtn.onclick = function(e) {
				e.stopPropagation();
				e.preventDefault();
				startVideo.currentTime = 0;
				const playPromise = startVideo.play();
				if (playPromise !== undefined) {
					playPromise.then(() => {
						$(startReplayBtn).hide();
					}).catch(error => {
						console.error('Error replaying start video:', error);
					});
				}
			};
			
			console.log('Start video listeners attached');
		}
		
		// End video listeners
		const endPlayBtn = document.getElementById('end-video-play');
		const endReplayBtn = document.getElementById('end-video-replay');
		const endVideo = document.getElementById('end-video');
		
		if (endPlayBtn && endReplayBtn && endVideo) {
			endPlayBtn.onclick = function(e) {
				e.stopPropagation();
				e.preventDefault();
				const playPromise = endVideo.play();
				if (playPromise !== undefined) {
					playPromise.then(() => {
						$(endPlayBtn).hide();
					}).catch(error => {
						console.error('Error playing end video:', error);
					});
				}
			};
			
			endReplayBtn.onclick = function(e) {
				e.stopPropagation();
				e.preventDefault();
				endVideo.currentTime = 0;
				const playPromise = endVideo.play();
				if (playPromise !== undefined) {
					playPromise.then(() => {
						$(endReplayBtn).hide();
					}).catch(error => {
						console.error('Error replaying end video:', error);
					});
				}
			};
			
			console.log('End video listeners attached');
		}
	}
};

// Set up MutationObserver to reattach listeners when pages are added
const videoObserver = new MutationObserver(function(mutations) {
	mutations.forEach(function(mutation) {
		if (mutation.type === 'childList') {
			mutation.addedNodes.forEach(function(node) {
				if (node.nodeType === 1 && node.querySelector) {
					const hasStartVideo = node.querySelector('#start-video');
					const hasEndVideo = node.querySelector('#end-video');
					
					if (hasStartVideo || hasEndVideo) {
						setTimeout(function() {
							window.videoEventManager.attachVideoListeners();
						}, 200);
					}
				}
			});
		}
	});
});

// Start observing when DOM is ready
$(document).ready(function() {
	videoObserver.observe(document.body, { childList: true, subtree: true });
});

function createStartVideoPage() {
	const $video = $('<video />', {
		id: 'start-video',
		src: 'img/comeco_col.mp4',
		muted: true,
		loop: false,
		controls: false,
		preload: 'metadata',
		css: {
			height: '100%',
			borderRadius: '10px',
			padding: '1%',
			background: 'white',
			boxShadow: '0 0 20px rgba(80,60,20,0.3)'
		}
	});
	
	const $controls = $('<div />', { 
		class: 'scrapbook-video-controls', 
		id: 'start-video-controls' 
	});
	
	const $playBtn = $('<button />', {
		class: 'scrapbook-video-btn',
		id: 'start-video-play',
		type: 'button',
		html: '<span class="material-symbols-rounded">play_arrow</span>'
	});
	$controls.append($playBtn);
	
	const $replayBtn = $('<button />', {
		class: 'scrapbook-video-btn',
		id: 'start-video-replay',
		type: 'button',
		html: '<span class="material-symbols-rounded">replay</span>',
		css: { display: 'none' }
	});
	$controls.append($replayBtn);
	
	// Initialize video state
	const videoElement = $video[0];
	videoElement.currentTime = 0;
	$playBtn.show();
	$replayBtn.hide();
	
	// Video events for UI updates
	$video.off('ended pause play').on('ended', function () {
		$replayBtn.show();
		$playBtn.hide();
	}).on('pause', function () {
		if (this.currentTime === 0 || this.ended) {
			$playBtn.show();
			$replayBtn.hide();
		}
	}).on('play', function () {
		$playBtn.hide();
		$replayBtn.hide();
	});
	
	// Event listeners will be attached by videoEventManager
	setTimeout(function() {
		window.videoEventManager.attachVideoListeners();
	}, 100);
	
	const $videoContainer = $('<div />', {
		css: { position: 'relative', width: '100%', height: '100%' }
	});
	$videoContainer.append($video, $controls);
	return $videoContainer;
}

function createEndVideoPage() {
	const $video = $('<video />', {
		id: 'end-video',
		src: 'img/niver_col.mp4',
		muted: true,
		loop: false,
		controls: false,
		preload: 'metadata',
		css: {
			height: '100%',
			borderRadius: '10px',
			padding: '1%',
			background: 'white',
			boxShadow: '0 0 20px rgba(80,60,20,0.3)'
		}
	});
	
	const $controls = $('<div />', { 
		class: 'scrapbook-video-controls', 
		id: 'end-video-controls' 
	});
	
	const $playBtn = $('<button />', {
		class: 'scrapbook-video-btn',
		id: 'end-video-play',
		type: 'button',
		html: '<span class="material-symbols-rounded">play_arrow</span>'
	});
	$controls.append($playBtn);
	
	const $replayBtn = $('<button />', {
		class: 'scrapbook-video-btn',
		id: 'end-video-replay',
		type: 'button',
		html: '<span class="material-symbols-rounded">replay</span>',
		css: { display: 'none' }
	});
	$controls.append($replayBtn);
	
	// Initialize video state
	const videoElement = $video[0];
	videoElement.currentTime = 0;
	$playBtn.show();
	$replayBtn.hide();
	
	// Video events for UI updates
	$video.off('ended pause play').on('ended', function () {
		$replayBtn.show();
		$playBtn.hide();
	}).on('pause', function () {
		if (this.currentTime === 0 || this.ended) {
			$playBtn.show();
			$replayBtn.hide();
		}
	}).on('play', function () {
		$playBtn.hide();
		$replayBtn.hide();
	});
	
	// Event listeners will be attached by videoEventManager
	setTimeout(function() {
		window.videoEventManager.attachVideoListeners();
	}, 100);
	
	const $videoContainer = $('<div />', {
		css: { position: 'relative', width: '100%', height: '100%' }
	});
	$videoContainer.append($video, $controls);
	return $videoContainer;
}


function createScrapbookPage(imageSrc, imageAlt, page, book, isFirstPage = false, isLastPage = false) {
	const rotation = getRandomRotation();
	const pattern = getRandomPattern();
	const layout = getRandomLayout();
	const postItColor = getRandomPostItColor();
	const postItText = getPostItTextForImage(imageSrc);

	// Check if there is a matching audio file
	const audioFiles = ['marcela.opus', 'marlene.opus', 'slane.opus', 'valeska.opus', 'will.opus'];
	const imgBase = imageSrc.replace(/\.[^.]+$/, '').toLowerCase();
	const audioMatch = audioFiles.find(aud => aud.replace(/\.[^.]+$/, '').toLowerCase() === imgBase);

	let $media;
	if (isFirstPage) {
		$media = createStartVideoPage();
	} else if (isLastPage) {
		$media = createEndVideoPage();
	} else if (imageSrc.startsWith('oracao')) {
		createOracaoPage(imageSrc, page, book);
		return;
	} else {
		$media = $('<img />', {
			src: `img/${imageSrc}`,
			alt: imageAlt,
			css: { transform: `rotate(${rotation}deg)` }
		});
		if (audioMatch) {
			console.log('Adding audio for image:', imageSrc, 'audio:', audioMatch);
			$media.css('cursor', 'pointer');
			$media.on('click', function (e) {
				e.stopPropagation();
				$('.scrapbook-audio').remove();
				var $audio = $('<audio />', {
					class: 'scrapbook-audio',
					src: `audio/${audioMatch}`,
					autoplay: true
				}).css({ display: 'none' });
				$(this).parent().append($audio);
			});
		}
	}

	var pageElement = $('<div />', {
		'class': `own-size page pattern-${pattern}`,
		'data-layout': layout,
		'data-has-tab': false,
		css: { overflow: 'visible' }
	}).append(
		$('<div />', {
			'class': 'scrapbook-content',
			css: { overflow: 'visible' }
		}).append(
			$media
		)
	);

	if (postItText && !isFirstPage && !isLastPage) {
		pageElement.find('.scrapbook-content').append(
			$('<div />', {
				'class': `scrapbook-text ${layout} ${postItColor}`,
				html: `<div class="text-content">${postItText}</div>`,
				css: { overflow: 'visible' }
			})
		);
	}

	book.turn('addPage', pageElement, page);
}

function createTreePage(page, book) {
	var pageElement = $('<div />', {
		'class': 'own-size page tree-page',
		'data-page': page,
		'data-has-tab': false
	}).append(
		$('<div />', {
			'class': 'tree-page-content',
		}).append(
			$('<div />', {
				'class': 'tree-page-title',
				html: '<h2>A vida do Colégio</h2>'
			}),
			$('<button />', {
				'class': 'tree-page-button',
				html: '🌳 Abrir Árvore',
				'onClick': "showTreePage()",
			})
		)
	);

	book.turn('addPage', pageElement, page);
}

function optimizeFlipbookPerformance() {
	const flipbook = document.querySelector('.flipbook');
	if (flipbook) {
		flipbook.style.transformStyle = 'preserve-3d';
		flipbook.style.backfaceVisibility = 'hidden';

		// Otimiza páginas visíveis
		document.querySelectorAll('.page-wrapper').forEach(page => {
			page.style.willChange = 'transform';
			page.style.contain = 'layout paint';
		});
	}
}

function resizeViewport() {

	var width = $(window).width(),
		height = $(window).height(),
		options = $('.flipbook').turn('options');

	$('.flipbook').removeClass('animated');

	$('.flipbook-viewport').css({
		width: width,
		height: height
	}).
		zoom('resize');


	if ($('.flipbook').turn('zoom') == 1) {
		var bound = calculateBound({
			width: options.width,
			height: options.height,
			boundWidth: Math.min(options.width, width),
			boundHeight: Math.min(options.height, height)
		});

		if (bound.width % 2 !== 0)
			bound.width -= 1;


		if (bound.width != $('.flipbook').width() || bound.height != $('.flipbook').height()) {

			$('.flipbook').turn('size', bound.width, bound.height);

			if ($('.flipbook').turn('page') == 1)
				$('.flipbook').turn('peel', 'br');

		}

		$('.flipbook').css({ top: -bound.height / 2, left: -bound.width / 2 });
	}

	var flipbookOffset = $('.flipbook').offset(),
		boundH = height - flipbookOffset.top - $('.flipbook').height(),
		marginTop = (boundH - $('.thumbnails > div').height()) / 2;

	if (marginTop < 0) {
		$('.thumbnails').css({ height: 1 });
	} else {
		$('.thumbnails').css({ height: boundH });
		$('.thumbnails > div').css({ marginTop: marginTop });
	}

	if (flipbookOffset.top < $('.made').height())
		$('.made').hide();
	else
		$('.made').show();

	$('.flipbook').addClass('animated');

}

function calculateBound(d) {

	var bound = { width: d.width, height: d.height };

	if (bound.width > d.boundWidth || bound.height > d.boundHeight) {

		var rel = bound.width / bound.height;

		if (d.boundWidth / rel > d.boundHeight && d.boundHeight * rel <= d.boundWidth) {

			bound.width = Math.round(d.boundHeight * rel);
			bound.height = d.boundHeight;

		} else {

			bound.width = d.boundWidth;
			bound.height = Math.round(d.boundWidth / rel);

		}
	}

	return bound;
}
