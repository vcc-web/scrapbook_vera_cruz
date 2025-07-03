const scrapbookTexts = [
    "Memories that last forever", "Beautiful moments captured in time", "Life's precious treasures and special gifts",
    "Sweet memories of love", "Unforgettable times we shared together", "Special moments with family", "Happy days filled with laughter", "Love & laughter with dear friends",
    "Family first, always and forever", "Together forever in our hearts", "Making memories that will never fade", "Blessed moments of pure happiness", "Pure joy in simple things",
    "Adventures await those who dare to dream", "Dream big and reach for the stars", "Cherished times with loved ones", "Wonderful memories of childhood", "Life is beautiful when shared with others",
    "Smile always, even through difficult times", "Heart full of love and gratitude", "Creating memories one day at a time", "Golden moments in the sunset", "Happiness is found in small things",
    "Forever grateful for these blessings", "Magical times under starry skies", "Love wins over everything else", "Perfect moments frozen in time", "Sunshine days and peaceful nights",
    "Captured hearts and stolen glances", "Endless love that knows no bounds", "Treasure trove of precious memories", "Sweet dreams and hopeful tomorrows", "Joyful hearts celebrating life together"
];


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

function getRandomText() {
    return scrapbookTexts[Math.floor(Math.random() * scrapbookTexts.length)];
}

function getRandomLayout() {
    const layouts = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
    return layouts[Math.floor(Math.random() * layouts.length)];
}

function getRandomPostItColor() {
    const colors = ['post-it-yellow', 'post-it-pink', 'post-it-blue', 'post-it-green', 'post-it-orange', 'post-it-purple'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function createScrapbookPage(imageSrc, imageAlt, page, book) {

    const rotation = getRandomRotation();
    const pattern = getRandomPattern();
    const text = getRandomText();
    const layout = getRandomLayout();
    const postItColor = getRandomPostItColor();

    var pageElement = $('<div />', {
        'class': `own-size page pattern-${pattern}`,
        'data-layout': layout
    }).append(
        $('<div />', {'class': 'scrapbook-content'}).append(
            $('<img />', {
                src: `img/${imageSrc}`,
                alt: imageAlt,
                css: { transform: `rotate(${rotation}deg)` }
            }),
            $('<div />', {
                'class': `scrapbook-text ${layout} ${postItColor}`,
                html: `<div class="text-content">${text}</div>`
            })
        )
    );

    book.turn('addPage', pageElement, page);
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


	if ($('.flipbook').turn('zoom')==1) {
		var bound = calculateBound({
			width: options.width,
			height: options.height,
			boundWidth: Math.min(options.width, width),
			boundHeight: Math.min(options.height, height)
		});

		if (bound.width%2!==0)
			bound.width-=1;

			
		if (bound.width!=$('.flipbook').width() || bound.height!=$('.flipbook').height()) {

			$('.flipbook').turn('size', bound.width, bound.height);

			if ($('.flipbook').turn('page')==1)
				$('.flipbook').turn('peel', 'br');

		}

		$('.flipbook').css({top: -bound.height/2, left: -bound.width/2});
	}

	var flipbookOffset = $('.flipbook').offset(),
		boundH = height - flipbookOffset.top - $('.flipbook').height(),
		marginTop = (boundH - $('.thumbnails > div').height()) / 2;

	if (marginTop<0) {
		$('.thumbnails').css({height:1});
	} else {
		$('.thumbnails').css({height: boundH});
		$('.thumbnails > div').css({marginTop: marginTop});
	}

	if (flipbookOffset.top<$('.made').height())
		$('.made').hide();
	else
		$('.made').show();

	$('.flipbook').addClass('animated');
	
}

function calculateBound(d) {
	
	var bound = {width: d.width, height: d.height};

	if (bound.width>d.boundWidth || bound.height>d.boundHeight) {
		
		var rel = bound.width/bound.height;

		if (d.boundWidth/rel>d.boundHeight && d.boundHeight*rel<=d.boundWidth) {
			
			bound.width = Math.round(d.boundHeight*rel);
			bound.height = d.boundHeight;

		} else {
			
			bound.width = d.boundWidth;
			bound.height = Math.round(d.boundWidth/rel);
		
		}
	}
		
	return bound;
}
