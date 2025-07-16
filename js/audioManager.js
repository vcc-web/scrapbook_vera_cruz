// Audio Management System for Scrapbook Pages
class AudioManager {
    constructor() {
        this.currentAudio = null;
        this.audioElements = new Map(); // Store only audio elements
        this.audioFiles = ['marcela.opus', 'maria_ferreira.opus', 'slane.opus', 'valeska.opus', 'will.opus'];
        this.supportedFormats = null;
        
        // Test browser audio support
        this.testAudioSupport();
        
        // Setup global event delegation
        this.setupGlobalEventDelegation();
        this.setupGlobalListeners();
    }

    // Setup global event delegation for all audio controls
    setupGlobalEventDelegation() {
        // Use event delegation on document body for all audio controls
        $(document).on('click', '.scrapbook-audio-btn', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const $btn = $(e.currentTarget);
            const audioId = $btn.data('audio-id');
            const action = $btn.data('action');
            
            console.log(`[AudioManager] Global click handler triggered:`, {
                audioId: audioId,
                action: action,
                buttonClass: $btn.attr('class')
            });
            
            if (!audioId || !action) {
                console.error(`[AudioManager] Missing audio-id or action on button:`, {
                    audioId: audioId,
                    action: action,
                    element: $btn[0]
                });
                return;
            }
            
            // Call appropriate action
            switch (action) {
                case 'play':
                    this.playAudio(audioId);
                    break;
                case 'pause':
                    this.pauseAudio(audioId);
                    break;
                case 'stop':
                    this.stopAudio(audioId);
                    break;
                case 'volume':
                    this.toggleVolume(audioId);
                    break;
                default:
                    console.warn(`[AudioManager] Unknown action: ${action}`);
            }
        });
        
        // Volume slider handler
        $(document).on('input', '.volume-slider', (e) => {
            e.stopPropagation();
            const $slider = $(e.currentTarget);
            const audioId = $slider.data('audio-id');
            const volume = parseFloat(e.target.value);
            
            console.log(`[AudioManager] Volume slider changed:`, {
                audioId: audioId,
                volume: volume
            });
            
            if (audioId) {
                this.setVolume(audioId, volume);
            }
        });
        
        console.log('[AudioManager] Global event delegation setup complete');
    }

    // Test browser audio support
    testAudioSupport() {
        const audio = document.createElement('audio');
        const formats = {
            'audio/ogg; codecs="opus"': audio.canPlayType('audio/ogg; codecs="opus"'),
            'audio/ogg': audio.canPlayType('audio/ogg'),
            'audio/webm': audio.canPlayType('audio/webm'),
            'audio/webm; codecs="opus"': audio.canPlayType('audio/webm; codecs="opus"'),
            'audio/mp3': audio.canPlayType('audio/mp3'),
            'audio/wav': audio.canPlayType('audio/wav')
        };
        
        this.supportedFormats = formats;
        
        console.log(`[AudioManager] Browser audio format support:`, formats);
        
        // Check if OPUS is supported
        const opusSupported = formats['audio/ogg; codecs="opus"'] || formats['audio/ogg'];
        console.log(`[AudioManager] OPUS support:`, {
            opusSupported: !!opusSupported,
            opusCodec: formats['audio/ogg; codecs="opus"'],
            oggGeneral: formats['audio/ogg']
        });
        
        // Test specifically for our OPUS files
        this.audioFiles.forEach(file => {
            console.log(`[AudioManager] Testing ${file}:`, {
                canPlayOpus: audio.canPlayType('audio/ogg; codecs="opus"'),
                canPlayOgg: audio.canPlayType('audio/ogg')
            });
        });
    }

    // Find matching audio file for image
    findAudioForImage(imageSrc) {
        console.log(`[AudioManager] findAudioForImage called with: ${imageSrc}`);
        
        // Extract base name from image (remove path and extension)
        const imgBase = imageSrc.replace(/^.*\//, '').replace(/\.[^.]+$/, '').toLowerCase();
        
        // Also try to extract person name from "iX - <nome>.jpg" format
        const match = imageSrc.match(/^.*?i\d+\s*-\s*(.+)\.jpg$/i);
        const personName = match ? match[1].trim().toLowerCase() : null;
        
        console.log(`[AudioManager] Extracted names:`, {
            imgBase: imgBase,
            personName: personName,
            originalSrc: imageSrc
        });
        
        // Look for matching audio file
        const audioMatch = this.audioFiles.find(audioFile => {
            const audioBase = audioFile.replace(/\.[^.]+$/, '').toLowerCase();
            
            console.log(`[AudioManager] Checking audio file: ${audioFile} (base: ${audioBase})`);
            console.log(`[AudioManager] Against image base: ${imgBase}`);
            
            // Direct match with image base name
            if (audioBase === imgBase) {
                console.log(`[AudioManager] Direct match found: ${audioFile} matches ${imgBase}`);
                return true;
            }
            
            // Match with person name if available
            if (personName && audioBase === personName) {
                console.log(`[AudioManager] Person name match found: ${audioFile} matches ${personName}`);
                return true;
            }
            
            // Try additional matching patterns for common name variations
            const imgBaseCleaned = imgBase.replace(/[^a-z0-9]/g, '');
            const audioCleaned = audioBase.replace(/[^a-z0-9]/g, '');
            const personCleaned = personName ? personName.replace(/[^a-z0-9]/g, '') : null;
            
            console.log(`[AudioManager] Cleaned comparison:`, {
                imgBaseCleaned: imgBaseCleaned,
                audioCleaned: audioCleaned,
                personCleaned: personCleaned
            });
            
            // Check if audio name contains the image base or vice versa
            if (audioCleaned.includes(imgBaseCleaned) || imgBaseCleaned.includes(audioCleaned)) {
                console.log(`[AudioManager] Partial match found: ${audioFile} contains ${imgBase}`);
                return true;
            }
            
            // Check person name variations
            if (personCleaned && (audioCleaned.includes(personCleaned) || personCleaned.includes(audioCleaned))) {
                console.log(`[AudioManager] Person partial match found: ${audioFile} contains ${personName}`);
                return true;
            }
            
            // Match with normalized names (remove spaces, underscores, etc.)
            const normalizedAudio = audioBase.replace(/[^a-z0-9]/g, '');
            const normalizedImg = imgBase.replace(/[^a-z0-9]/g, '');
            const normalizedPerson = personName ? personName.replace(/[^a-z0-9]/g, '') : null;
            
            console.log(`[AudioManager] Normalized comparison:`, {
                normalizedAudio: normalizedAudio,
                normalizedImg: normalizedImg,
                normalizedPerson: normalizedPerson
            });
            
            if (normalizedAudio === normalizedImg) {
                console.log(`[AudioManager] Normalized image match found: ${audioFile}`);
                return true;
            }
            
            if (normalizedPerson && normalizedAudio === normalizedPerson) {
                console.log(`[AudioManager] Normalized person match found: ${audioFile}`);
                return true;
            }
            
            return false;
        });
        
        console.log(`[AudioManager] Final audio search result:`, {
            imgBase,
            personName,
            audioMatch: audioMatch || 'NO MATCH'
        });
        
        return audioMatch;
    }

    // Create audio controls using data attributes (no direct event listeners)
    createAudioControlsWithDataAttributes(audioFile) {
        const audioId = this.generateCacheKey(audioFile);
        
        console.log(`[AudioManager] Creating controls with data attributes for ${audioFile} (ID: ${audioId})`);

        // Create or get existing audio element
        let audioElement;
        if (this.audioElements.has(audioId)) {
            audioElement = this.audioElements.get(audioId);
            console.log(`[AudioManager] Reusing existing audio element for ${audioId}`);
        } else {
            audioElement = document.createElement('audio');
            audioElement.id = `audio-${audioId}`;
            audioElement.src = `audio/${audioFile}`;
            audioElement.preload = 'metadata';
            audioElement.volume = 0.7;
            
            // Add audio event listeners (these stay with the element)
            audioElement.addEventListener('play', () => {
                console.log(`[AudioManager] Audio started playing: ${audioFile}`);
                this.updateControlsForPlay(audioId);
            });
            
            audioElement.addEventListener('pause', () => {
                console.log(`[AudioManager] Audio paused: ${audioFile}`);
                this.updateControlsForPause(audioId);
            });
            
            audioElement.addEventListener('ended', () => {
                console.log(`[AudioManager] Audio ended: ${audioFile}`);
                this.updateControlsForEnd(audioId);
            });
            
            audioElement.addEventListener('error', (e) => {
                console.error(`[AudioManager] Audio error for ${audioFile}:`, e);
            });
            
            this.audioElements.set(audioId, audioElement);
            console.log(`[AudioManager] Created new audio element for ${audioId}`);
        }

        // Create controls container
        const $controls = $('<div />', {
            class: 'scrapbook-audio-controls',
            id: `audio-controls-${audioId}`,
            'data-audio-id': audioId
        });

        // Create play button with data attributes
        const $playBtn = $('<button />', {
            class: 'scrapbook-audio-btn play-btn',
            id: `audio-play-${audioId}`,
            type: 'button',
            'data-audio-id': audioId,
            'data-action': 'play',
            html: '<span class="material-symbols-rounded">play_arrow</span>'
        });

        // Create pause button with data attributes
        const $pauseBtn = $('<button />', {
            class: 'scrapbook-audio-btn pause-btn',
            id: `audio-pause-${audioId}`,
            type: 'button',
            'data-audio-id': audioId,
            'data-action': 'pause',
            html: '<span class="material-symbols-rounded">pause</span>',
            css: { display: 'none' }
        });

        // Create stop button with data attributes
        const $stopBtn = $('<button />', {
            class: 'scrapbook-audio-btn stop-btn',
            id: `audio-stop-${audioId}`,
            type: 'button',
            'data-audio-id': audioId,
            'data-action': 'stop',
            html: '<span class="material-symbols-rounded">stop</span>',
            css: { display: 'none' }
        });

        // Create volume container
        const $volumeContainer = $('<div />', {
            class: 'volume-container',
            css: { display: 'none' }
        });

        // Create volume button with data attributes
        const $volumeBtn = $('<button />', {
            class: 'scrapbook-audio-btn volume-btn',
            id: `audio-volume-${audioId}`,
            type: 'button',
            'data-audio-id': audioId,
            'data-action': 'volume',
            html: '<span class="material-symbols-rounded">volume_up</span>'
        });

        // Create volume slider with data attributes
        const $volumeSlider = $('<input />', {
            type: 'range',
            class: 'volume-slider',
            id: `volume-slider-${audioId}`,
            'data-audio-id': audioId,
            min: 0,
            max: 1,
            step: 0.1,
            value: 0.7
        });

        $volumeContainer.append($volumeBtn, $volumeSlider);
        $controls.append($playBtn, $pauseBtn, $stopBtn, $volumeContainer);

        console.log(`[AudioManager] Created controls with data attributes for ${audioFile}`);

        return {
            $audio: $(audioElement),
            $controls: $controls,
            audioId: audioId,
            audioFile: audioFile
        };
    }

    // Generate cache key for audio file
    generateCacheKey(audioFile) {
        return `audio_${audioFile.replace(/\.[^.]+$/, '')}`;
    }

    // Update controls when audio starts playing
    updateControlsForPlay(audioId) {
        const $controls = $(`#audio-controls-${audioId}`);
        $controls.find('.play-btn').hide();
        $controls.find('.pause-btn').show();
        $controls.find('.stop-btn').show();
        $controls.find('.volume-container').show();
    }

    // Update controls when audio is paused
    updateControlsForPause(audioId) {
        const $controls = $(`#audio-controls-${audioId}`);
        $controls.find('.play-btn').show();
        $controls.find('.pause-btn').hide();
    }

    // Update controls when audio ends
    updateControlsForEnd(audioId) {
        const $controls = $(`#audio-controls-${audioId}`);
        $controls.find('.play-btn').show();
        $controls.find('.pause-btn').hide();
        $controls.find('.stop-btn').hide();
        $controls.find('.volume-container').hide();
    }

    // Create audio controls for an image (simplified)
    createAudioControls(imageSrc, uniqueId) {
        console.log(`[AudioManager] createAudioControls called:`, {
            imageSrc: imageSrc,
            uniqueId: uniqueId
        });
        
        const audioFile = this.findAudioForImage(imageSrc);
        if (!audioFile) {
            console.log(`[AudioManager] No audio file found in createAudioControls for ${imageSrc}`);
            return null;
        }

        console.log(`[AudioManager] Creating audio controls for ${imageSrc} -> ${audioFile}`);

        // Use the new system with data attributes
        return this.createAudioControlsWithDataAttributes(audioFile);
    }
    // Play audio
    playAudio(audioId) {
        console.log(`[AudioManager] playAudio called for ${audioId}`);
        
        const audioElement = this.audioElements.get(audioId);
        if (!audioElement) {
            console.error(`[AudioManager] No audio element found for ${audioId}`);
            return;
        }

        // Stop any currently playing audio
        this.stopAllAudio();

        console.log(`[AudioManager] About to play audio:`, {
            audioId: audioId,
            audioSrc: audioElement.src,
            readyState: audioElement.readyState,
            paused: audioElement.paused
        });
        
        // Check if audio is loaded
        if (audioElement.readyState < 2) {
            console.log(`[AudioManager] Audio not loaded yet, waiting for load event`);
            audioElement.addEventListener('canplay', () => {
                console.log(`[AudioManager] Audio loaded, attempting to play`);
                this.attemptPlay(audioElement, audioId);
            }, { once: true });
            
            audioElement.load();
        } else {
            this.attemptPlay(audioElement, audioId);
        }
    }

    // Attempt to play audio with detailed error handling
    attemptPlay(audioElement, audioId) {
        console.log(`[AudioManager] attemptPlay called for ${audioId}`);
        
        try {
            const playPromise = audioElement.play();
            
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    this.currentAudio = audioId;
                    console.log(`[AudioManager] Successfully started playing audio: ${audioId}`);
                }).catch(error => {
                    console.error(`[AudioManager] Error playing audio:`, {
                        error: error,
                        name: error.name,
                        message: error.message,
                        audioId: audioId
                    });
                });
            }
        } catch (syncError) {
            console.error(`[AudioManager] Synchronous error in play():`, syncError);
        }
    }

    // Pause audio
    pauseAudio(audioId) {
        console.log(`[AudioManager] pauseAudio called for ${audioId}`);
        const audioElement = this.audioElements.get(audioId);
        if (!audioElement) {
            console.error(`[AudioManager] No audio element found for ${audioId}`);
            return;
        }

        audioElement.pause();
        
        if (this.currentAudio === audioId) {
            this.currentAudio = null;
        }
    }

    // Stop audio
    stopAudio(audioId) {
        console.log(`[AudioManager] stopAudio called for ${audioId}`);
        const audioElement = this.audioElements.get(audioId);
        if (!audioElement) {
            console.error(`[AudioManager] No audio element found for ${audioId}`);
            return;
        }

        audioElement.pause();
        audioElement.currentTime = 0;
        
        if (this.currentAudio === audioId) {
            this.currentAudio = null;
        }
    }

    // Stop all audio
    stopAllAudio() {
        this.audioElements.forEach((audioElement, audioId) => {
            if (!audioElement.paused) {
                audioElement.pause();
                audioElement.currentTime = 0;
            }
        });
        this.currentAudio = null;
    }

    // Toggle volume control
    toggleVolume(audioId) {
        console.log(`[AudioManager] toggleVolume called for ${audioId}`);
        const audioElement = this.audioElements.get(audioId);
        if (!audioElement) {
            console.error(`[AudioManager] No audio element found for ${audioId}`);
            return;
        }

        const $volumeBtn = $(`#audio-volume-${audioId}`);
        
        if (audioElement.volume > 0) {
            audioElement.volume = 0;
            $volumeBtn.html('<span class="material-symbols-rounded">volume_off</span>');
        } else {
            audioElement.volume = 0.7;
            $volumeBtn.html('<span class="material-symbols-rounded">volume_up</span>');
        }
    }

    // Set volume
    setVolume(audioId, volume) {
        console.log(`[AudioManager] setVolume called for ${audioId} with volume ${volume}`);
        const audioElement = this.audioElements.get(audioId);
        if (!audioElement) {
            console.error(`[AudioManager] No audio element found for ${audioId}`);
            return;
        }

        audioElement.volume = volume;
        
        const $volumeBtn = $(`#audio-volume-${audioId}`);
        
        // Update volume icon
        if (volume === 0) {
            $volumeBtn.html('<span class="material-symbols-rounded">volume_off</span>');
        } else if (volume < 0.5) {
            $volumeBtn.html('<span class="material-symbols-rounded">volume_down</span>');
        } else {
            $volumeBtn.html('<span class="material-symbols-rounded">volume_up</span>');
        }
    }

    // Clean up audio controls
    removeAudioControls(uniqueId) {
        const controlsData = this.audioControls.get(uniqueId);
        if (!controlsData) return;

        const { audio } = controlsData;
        
        // Stop audio if playing
        if (!audio.paused) {
            audio.pause();
            audio.currentTime = 0;
        }
        
        // Remove from current audio if it matches
        if (this.currentAudio === uniqueId) {
            this.currentAudio = null;
        }
        
        // Remove from controls map
        this.audioControls.delete(uniqueId);
        
        console.log(`Removed audio controls for ${uniqueId}`);
    }

    // Setup global listeners
    setupGlobalListeners() {
        // Pause all audio when page turns
        $('.flipbook').on('turning', () => {
            this.stopAllAudio();
        });

        // Cleanup when tree page opens
        $(window).on('treeSectionClicked', () => {
            this.stopAllAudio();
        });
    }

    // Get current playing audio info
    getCurrentAudio() {
        if (!this.currentAudio) return null;
        return this.audioControls.get(this.currentAudio);
    }

    // Check if audio is available for image
    hasAudioForImage(imageSrc) {
        return this.findAudioForImage(imageSrc) !== undefined;
    }

    // Main function to check and add audio controls to a container
    checkAndAddAudioControls(container, imageSrc) {
        console.log(`[AudioManager] checkAndAddAudioControls called with:`, {
            container: container,
            imageSrc: imageSrc,
            containerClass: container.attr('class')
        });

        // Check if audio exists for this image
        const audioMatch = this.findAudioForImage(imageSrc);
        
        console.log(`[AudioManager] Audio match result:`, {
            imageSrc: imageSrc,
            audioMatch: audioMatch
        });

        if (!audioMatch) {
            console.log(`[AudioManager] No audio file found for image: ${imageSrc}`);
            return false;
        }

        // Generate unique ID for this audio instance
        const audioId = this.generateAudioId(audioMatch);
        
        console.log(`[AudioManager] Using audio ID: ${audioId}`);

        // Create the audio controls
        const controls = this.createAudioControls(imageSrc, audioId);
        
        if (!controls) {
            console.error(`[AudioManager] Failed to create audio controls for ${imageSrc}`);
            return false;
        }

        console.log(`[AudioManager] Successfully created audio controls:`, {
            imageSrc: imageSrc,
            audioFile: audioMatch,
            audioId: audioId
        });

        // Add controls to the container
        container.append(controls.$audio);
        container.append(controls.$controls);
        
        // Add has-audio class to container
        container.addClass('has-audio');
        
        console.log(`[AudioManager] Audio controls added to container for ${imageSrc}`);
        
        return true;
    }

    // Generate unique ID for audio instance
    generateAudioId(audioFile) {
        // Remove extension and use as base ID
        const baseName = audioFile.split('.')[0];
        return `audio-${baseName}`;
    }
}

// Initialize AudioManager when the DOM is ready
$(document).ready(function() {
    console.log('[AudioManager] DOM ready, initializing AudioManager...');
    if (typeof window.audioManager === 'undefined') {
        window.audioManager = new AudioManager();
        console.log('[AudioManager] AudioManager initialized successfully');
    } else {
        console.log('[AudioManager] AudioManager already exists');
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioManager;
}
