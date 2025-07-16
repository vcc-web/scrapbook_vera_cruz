
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


// Returns the post-it text for a given imageSrc (filename in format "iX - <nome>.jpg")
function getPostItTextForImage(imageSrc) {
	const data = loadScrapbookJsonData();
	
	// Extract person name from format "iX - <nome>.jpg"
	let personName = null;
	
	// Check if it's in the format "iX - <nome>.jpg"
	const match = imageSrc.match(/^i\d+\s*-\s*(.+)\.jpg$/i);
	if (match) {
		personName = match[1].trim();
	} else {
		// If not in "iX - <nome>.jpg" format, try to use the filename without extension
		personName = imageSrc.replace(/\.(jpg|jpeg|png|gif)$/i, '');
	}
	
	if (!personName) return null;
	
	console.log(`Searching for person: "${personName}" from image: "${imageSrc}"`);
	
	// Try to find entry by foto field matching the person name
	const entry = data.find(e => {
		if (!e.foto) return false;
		
		// Remove common prefixes and normalize for comparison
		const fotoName = e.foto.toLowerCase()
			.replace(/^img\//, '')
			.replace(/\.(jpg|jpeg|png|gif)$/i, '')
			.trim();
		
		const searchName = personName.toLowerCase().trim();
		
		// Direct match
		if (fotoName === searchName) {
			console.log(`Direct match found: ${fotoName} === ${searchName}`);
			return true;
		}
		
		// Try matching with underscores replaced by spaces
		if (fotoName.replace(/_/g, ' ') === searchName) {
			console.log(`Underscore match found: ${fotoName.replace(/_/g, ' ')} === ${searchName}`);
			return true;
		}
		
		// Try matching with spaces replaced by underscores
		if (fotoName === searchName.replace(/ /g, '_')) {
			console.log(`Space match found: ${fotoName} === ${searchName.replace(/ /g, '_')}`);
			return true;
		}
		
		// Try matching without special characters and spaces
		const normalizedFoto = fotoName.replace(/[^a-z0-9]/g, '');
		const normalizedSearch = searchName.replace(/[^a-z0-9]/g, '');
		if (normalizedFoto === normalizedSearch) {
			console.log(`Normalized match found: ${normalizedFoto} === ${normalizedSearch}`);
			return true;
		}
		
		return false;
	});
	
	if (!entry) {
		console.log(`No entry found for person: "${personName}" from image: "${imageSrc}"`);
		// Show available foto fields for debugging
		console.log('Available foto fields:', data.map(e => e.foto).filter(f => f));
		return null;
	}
	
	console.log(`Found entry for ${personName}:`, entry.autor);
	
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
			texto1: 'Vinde Espírito Santo, vinde por meio da poderosa intercessão do Imaculado Coração de Maria, vossa amadíssima Esposa e nossa mãe.'
		},
		'2': {
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
			texto1: 'Ó Sangue e Água que jorrastes do Coração de Jesus como uma fonte de misericórdia para nós, eu confio em Vós.',
			texto2: 'Ó Sangue e Água que jorrastes do Coração de Jesus como uma fonte de misericórdia para nós, eu confio em Vós.',
			texto3: 'Ó Sangue e Água que jorrastes do Coração de Jesus como uma fonte de misericórdia para nós, eu confio em Vós.'
		},

	};

	const dados = oracoes[pageNum] || {
		texto: 'Oração padrão: Coloque sua oração personalizada aqui.'
	};

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
			text: '', // Inicialmente vazio para animação
			css: {
				display: 'block',
				marginBottom: '4px',
				lineHeight: '1.5',
				opacity: '0.3', // Começa semi-transparente
				transition: 'opacity 0.3s ease-in-out'
			}
		});
		$textContent.append(span);
	});

	const $texto = $('<div />', {
		class: 'oracao-texto',
		css: {
			margin: '18px auto',
			fontSize: '1.3rem',
			textAlign: 'center',
			maxWidth: '90%',
			color: '#213822',
			fontFamily: 'serif',
			borderRadius: '8px',
			boxShadow: '0 1px 8px rgba(251,193,83,0.08)'
		}
	}).append($textContent);

	// Função para animar texto letra por letra de forma sequencial
	function animateOracaoText() {
		let currentSpanIndex = 0;
		
		function animateSpan(spanIndex) {
			if (spanIndex >= textoFields.length) return; // Terminou todos os spans
			
			const field = textoFields[spanIndex];
			const text = dados[field];
			const span = document.getElementById(`oracao-span-${pageNum}-${spanIndex + 1}`);
			
			if (!span) {
				// Se não encontrou o span, pula para o próximo
				setTimeout(() => animateSpan(spanIndex + 1), 100);
				return;
			}
			
			// Marca este span como ativo (mais opaco)
			span.style.opacity = '0.7';
			
			let i = 0;
			
			function typeLetter() {
				if (i <= text.length) {
					// Adiciona cursor piscante durante a digitação
					const displayText = text.substring(0, i);
					const cursor = i < text.length ? '<span style="animation: blink 1s infinite;">|</span>' : '';
					span.innerHTML = displayText + cursor;
					
					i++;
					// Velocidade variável para parecer mais humano
					const delay = 8 + Math.random() * 12;
					setTimeout(typeLetter, delay);
				} else {
					// Terminou este span, remove cursor e torna totalmente visível
					span.innerHTML = text;
					span.style.opacity = '1';
					
					// Pequena pausa antes do próximo span
					setTimeout(() => animateSpan(spanIndex + 1), 500);
				}
			}
			
			// Inicia a animação deste span
			typeLetter();
		}
		
		// Adiciona CSS para animação do cursor
		if (!document.getElementById('cursor-blink-style')) {
			const style = document.createElement('style');
			style.id = 'cursor-blink-style';
			style.textContent = `
				@keyframes blink {
					0%, 50% { opacity: 1; }
					51%, 100% { opacity: 0; }
				}
			`;
			document.head.appendChild(style);
		}
		
		// Inicia a animação do primeiro span
		animateSpan(0);
	}

	// Cria o elemento da página
	const pageElement = $('<div />', {
		class: 'own-size page oracao-page',
		'data-page': page,
		'data-has-tab': false,
		css: { 
			overflow: 'visible', 
			position: 'relative', 
			background: '#fffbe6',
			display: 'flex',
			alignItems: 'center',
		}
	}).append(
		$('<div />', {
			class: 'oracao-content',
			css: { overflow: 'visible' }
		}).append($texto)
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
						$(endReplayBtn).hide();
						// Rotate flipbook when video starts
						rotateFlipbook(true);
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
						$(endPlayBtn).hide();
						$(endReplayBtn).hide();
						// Rotate flipbook when video replays
						rotateFlipbook(true);
					}).catch(error => {
						console.error('Error replaying end video:', error);
					});
				}
			};
			
			// Event listeners are managed in the page creation functions
			// to avoid conflicts with existing listeners
			
			console.log('End video listeners attached with rotation');
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
	
	// Add page change listener to reset flipbook rotation and pause videos
	$(document).on('turned', '.flipbook', function() {
		// Pause any playing videos when page changes (but don't interfere with ended videos)
		const startVideo = document.getElementById('start-video');
		const endVideo = document.getElementById('end-video');
		
		if (startVideo && !startVideo.paused && !startVideo.ended) {
			startVideo.pause();
			$('#start-video-play').show();
			$('#start-video-replay').hide();
		}
		
		if (endVideo && !endVideo.paused && !endVideo.ended) {
			endVideo.pause();
			$('#end-video-play').show();
			$('#end-video-replay').hide();
		}
		
		// Small delay to ensure page has finished turning
		setTimeout(() => {
			// Check if the current page has an end video that's playing
			const currentEndVideo = document.getElementById('end-video');
			if (currentEndVideo && !currentEndVideo.paused && !currentEndVideo.ended) {
				// Video is playing, keep rotation
				rotateFlipbook(true);
			} else {
				// Reset rotation when page changes
				rotateFlipbook(false);
			}
		}, 100);
	});
	
	// Add listener for when page is about to turn
	$(document).on('turning', '.flipbook', function() {
		// Pause any playing videos when page starts turning (but don't interfere with ended videos)
		const startVideo = document.getElementById('start-video');
		const endVideo = document.getElementById('end-video');
		
		if (startVideo && !startVideo.paused && !startVideo.ended) {
			startVideo.pause();
			$('#start-video-play').show();
			$('#start-video-replay').hide();
		}
		
		if (endVideo && !endVideo.paused && !endVideo.ended) {
			endVideo.pause();
			$('#end-video-play').show();
			$('#end-video-replay').hide();
		}
		
		// Small delay to check video state after page starts turning
		setTimeout(() => {
			// Check if the current page has an end video that's playing
			const currentEndVideo = document.getElementById('end-video');
			if (currentEndVideo && !currentEndVideo.paused && !currentEndVideo.ended) {
				// Video is playing, keep rotation
				rotateFlipbook(true);
			}
		}, 300);
	});
	
	// Add keyboard listener for arrow keys
	$(document).on('keydown', function(e) {
		// Check if arrow keys are pressed (left arrow = 37, right arrow = 39)
		if (e.keyCode === 37 || e.keyCode === 39) {
			// Pause any playing videos when navigating with arrow keys (but don't interfere with ended videos)
			const startVideo = document.getElementById('start-video');
			const endVideo = document.getElementById('end-video');
			
			if (startVideo && !startVideo.paused && !startVideo.ended) {
				startVideo.pause();
				$('#start-video-play').show();
				$('#start-video-replay').hide();
			}
			
			if (endVideo && !endVideo.paused && !endVideo.ended) {
				endVideo.pause();
				$('#end-video-play').show();
				$('#end-video-replay').hide();
			}
			
			// Small delay to check video state after navigation
			setTimeout(() => {
				// Check if the current page has an end video that's playing
				const currentEndVideo = document.getElementById('end-video');
				if (currentEndVideo && !currentEndVideo.paused && !currentEndVideo.ended) {
					// Video is playing, keep rotation
					rotateFlipbook(true);
				} else {
					// Reset rotation when navigating with arrow keys
					rotateFlipbook(false);
				}
			}, 100);
		}
	});
	
	// Add click listener for page navigation
	$(document).on('click', '.flipbook', function(e) {
		// If clicking on page area (not on video controls), pause videos and check video state after navigation
		if (!$(e.target).closest('.scrapbook-video-controls').length) {
			// Pause any playing videos when clicking to navigate (but don't interfere with ended videos)
			const startVideo = document.getElementById('start-video');
			const endVideo = document.getElementById('end-video');
			
			if (startVideo && !startVideo.paused && !startVideo.ended) {
				startVideo.pause();
				$('#start-video-play').show();
				$('#start-video-replay').hide();
			}
			
			if (endVideo && !endVideo.paused && !endVideo.ended) {
				endVideo.pause();
				$('#end-video-play').show();
				$('#end-video-replay').hide();
			}
			
			setTimeout(() => {
				// Check if the current page has an end video that's playing
				const currentEndVideo = document.getElementById('end-video');
				if (currentEndVideo && !currentEndVideo.paused && !currentEndVideo.ended) {
					// Video is playing, keep rotation
					rotateFlipbook(true);
				} else {
					// Reset rotation
					rotateFlipbook(false);
				}
			}, 200);
		}
	});
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
		console.log('Start video ended - showing replay button');
		$replayBtn.show();
		$playBtn.hide();
	}).on('pause', function () {
		console.log('Start video paused - currentTime:', this.currentTime, 'ended:', this.ended);
		if (this.currentTime === 0 || this.ended) {
			$playBtn.show();
			$replayBtn.hide();
		}
	}).on('play', function () {
		console.log('Start video playing - hiding all buttons');
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
			padding: '2%',
			height: '50%',
			objectFit: 'cover',
			borderRadius: '10px',
			background: 'white',
			boxShadow: '0 0 20px rgba(80,60,20,0.3)',
			transform: 'rotate(90deg)', // Vídeo em paisagem
			transformOrigin: 'center center'
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
	
	// Video events for UI updates and book rotation
	$video.off('ended pause play').on('play', function () {
		console.log('End video playing - hiding all buttons');
		$playBtn.hide();
		$replayBtn.hide();
		// Rotate the entire flipbook when video starts
		rotateFlipbook(true);
	}).on('ended', function () {
		console.log('End video ended - showing replay button');
		$replayBtn.show();
		$playBtn.hide();
		// Rotate back when video ends
		rotateFlipbook(false);
	}).on('pause', function () {
		console.log('End video paused - currentTime:', this.currentTime, 'ended:', this.ended);
		if (this.currentTime === 0 || this.ended) {
			$playBtn.show();
			$replayBtn.hide();
			// Rotate back when paused at beginning or end
			rotateFlipbook(false);
		}
	}).on('loadedmetadata', function() {
		console.log('End video metadata loaded - resetting UI');
		// Reset UI when video loads
		$playBtn.show();
		$replayBtn.hide();
	});
	
	// Event listeners will be attached by videoEventManager
	setTimeout(function() {
		window.videoEventManager.attachVideoListeners();
	}, 100);
	
	const $videoContainer = $('<div />', {
		css: { 
			position: 'relative', 
			width: '100%', 
			height: '100%',
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center'
		}
	});
	$videoContainer.append($video, $controls);
	return $videoContainer;
}

// Function to rotate the entire flipbook for landscape video viewing
function rotateFlipbook(rotate) {
	const $flipbook = $('.flipbook');
	const $viewport = $('.flipbook-viewport');
	
	if (rotate) {
		// Rotate the flipbook 90 degrees clockwise
		$flipbook.css({
			transform: 'rotate(-90deg) translateX(20%)',
			transformOrigin: 'center center',
			transition: 'transform 0.8s ease-in-out'
		});
		
		// Adjust viewport if needed
		$viewport.css({
			transition: 'all 0.8s ease-in-out'
		});
		
		console.log('Flipbook rotated for landscape video');
	} else {
		// Rotate back to normal
		$flipbook.css({
			transform: 'rotate(0deg) translateX(0)',
			transition: 'transform 0.8s ease-in-out'
		});
		
		console.log('Flipbook rotated back to normal');
	}
}


function createScrapbookPage(imageSrc, imageAlt, page, book, isFirstPage = false, isLastPage = false) {
	const rotation = getRandomRotation();
	const pattern = getRandomPattern();
	const layout = getRandomLayout();
	const postItColor = getRandomPostItColor();
	const postItText = getPostItTextForImage(imageSrc);

	// Check if there is a matching audio file
	const audioFiles = ['marcela.opus', 'maria_ferreira.opus', 'slane.opus', 'valeska.opus', 'will.opus'];
	const imgBase = imageSrc.replace(/\.[^.]+$/, '').toLowerCase();
	
	// Try multiple matching strategies
	let audioMatch = audioFiles.find(aud => aud.replace(/\.[^.]+$/, '').toLowerCase() === imgBase);
	
	// If no direct match, try with person name extraction from "iX - <nome>.jpg" format
	if (!audioMatch) {
		const match = imageSrc.match(/^.*?i\d+\s*-\s*(.+)\.jpg$/i);
		if (match) {
			const personName = match[1].trim().toLowerCase();
			audioMatch = audioFiles.find(aud => aud.replace(/\.[^.]+$/, '').toLowerCase() === personName);
			
			// If still no match, try normalized comparison
			if (!audioMatch) {
				const normalizedPerson = personName.replace(/[^a-z0-9]/g, '');
				audioMatch = audioFiles.find(aud => {
					const normalizedAudio = aud.replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9]/g, '');
					return normalizedAudio === normalizedPerson;
				});
			}
		}
	}
	
	console.log(`[BookUtils] Audio matching details:`, {
		imageSrc: imageSrc,
		imgBase: imgBase,
		audioFiles: audioFiles,
		audioMatch: audioMatch
	});

	console.log(`[BookUtils] createScrapbookPage called:`, {
		imageSrc: imageSrc,
		imgBase: imgBase,
		audioMatch: audioMatch,
		isFirstPage: isFirstPage,
		isLastPage: isLastPage
	});

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
			src: `iorder/${imageSrc}`,
			alt: imageAlt,
			css: { transform: `rotate(${rotation}deg)` }
		});
		
		// Use the AudioManager for audio controls if available
		if (window.audioManager && audioMatch) {
			console.log(`[BookUtils] Adding audio controls for image: ${imageSrc}, audio: ${audioMatch}`);
			$media.addClass('has-audio');
		} else {
			console.log(`[BookUtils] No audio controls added:`, {
				hasAudioManager: !!window.audioManager,
				audioMatch: audioMatch
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

	// Add audio controls if AudioManager is available and audio file exists
	if (window.audioManager && audioMatch && !isFirstPage && !isLastPage) {
		console.log(`[BookUtils] Adding audio controls to page:`, {
			imageSrc: imageSrc,
			audioMatch: audioMatch,
			fullImagePath: `iorder/${imageSrc}`
		});
		
		const scrapbookContent = pageElement.find('.scrapbook-content');
		console.log(`[BookUtils] Scrapbook content found:`, scrapbookContent.length > 0);
		
		// Pass the image source as it is used in the src attribute
		const success = window.audioManager.checkAndAddAudioControls(scrapbookContent, `iorder/${imageSrc}`);
		console.log(`[BookUtils] Audio controls added successfully:`, success);
	} else {
		console.log(`[BookUtils] Audio controls not added:`, {
			hasAudioManager: !!window.audioManager,
			audioMatch: audioMatch,
			isFirstPage: isFirstPage,
			isLastPage: isLastPage
		});
	}

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
