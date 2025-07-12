
// Load frases-vera-cruz.json once and keep in memory
let scrapbookJsonData = [];

function loadScrapbookJsonData() {
	if (scrapbookJsonData.length > 0) return scrapbookJsonData;
	// Synchronous fetch for simplicity (assumes local file)
	$.ajax({
		url: 'frases-vera-cruz.json',
		dataType: 'json',
		async: false,
		success: function(data) {
			scrapbookJsonData = data;
		},
		error: function() {
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
		$media = $('<video />', {
			src: 'img/comeco_col.mp4',
			autoplay: true,
			muted: true,
			loop: false,
			controls: false,
			css: { width: '100%', borderRadius: '10px', boxShadow: '0 0 20px rgba(80,60,20,0.3)' }
		});
		$media.on('ended', function() {
			if (!$media.next('.restart-video-btn').length) {
				var $btn = $('<span />', {
					class: 'restart-video-btn material-symbols-rounded',
					html: 'replay',
					css: {
						position: 'absolute',
						left: '50%',
						top: '50%',
						transform: 'translate(-50%, -50%)',
						fontSize: '48px',
						background: 'rgba(255,255,255,0.75)',
						color: '#99693b',
						borderRadius: '50%',
						padding: '16px',
						cursor: 'pointer',
						boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
						zIndex: 10,
						userSelect: 'none',
						border: '2px solid #b38c43',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						pointerEvents: 'all'
					},
					click: function() {
						$media[0].currentTime = 0;
						$media[0].play();
						$(this).remove();
					}
				});
				$media.parent().css('position', 'relative').append($btn);
			}
		});
	} else if (isLastPage) {
		$media = $('<video />', {
			src: 'img/niver_col.mp4',
			autoplay: true,
			muted: true,
			loop: false,
			controls: false,
			css: { width: '100%', borderRadius: '10px', boxShadow: '0 0 20px rgba(80,60,20,0.3)' }
		});
		$media.on('ended', function() {
			if (!$media.next('.restart-video-btn').length) {
				var $btn = $('<span />', {
					class: 'restart-video-btn material-symbols-rounded',
					html: 'replay',
					css: {
						position: 'absolute',
						left: '50%',
						top: '50%',
						transform: 'translate(-50%, -50%)',
						fontSize: '48px',
						background: 'rgba(255,255,255,0.85)',
						color: '#99693b',
						borderRadius: '50%',
						padding: '16px',
						cursor: 'pointer',
						boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
						zIndex: 10,
						userSelect: 'none',
						border: '2px solid #b38c43',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center'
					},
					click: function() {
						$media[0].currentTime = 0;
						$media[0].play();
						$(this).remove();
					}
				});
				$media.parent().css('position', 'relative').append($btn);
			}
		});
	} else {
		$media = $('<img />', {
			src: `img/${imageSrc}`,
			alt: imageAlt,
			css: { transform: `rotate(${rotation}deg)` }
		});
		if (audioMatch) {
			$media.css('cursor', 'pointer');
			$media.on('click', function(e) {
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
				html: '<h2>Árvore do Colégio</h2>'
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
