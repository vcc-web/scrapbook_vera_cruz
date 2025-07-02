const scrapbookTexts = [
    "Memories that last forever", "Beautiful moments captured", "Life's precious treasures",
    "Sweet memories", "Unforgettable times", "Special moments", "Happy days", "Love & laughter",
    "Family first", "Together forever", "Making memories", "Blessed moments", "Pure joy",
    "Adventures await", "Dream big", "Cherished times", "Wonderful memories", "Life is beautiful",
    "Smile always", "Heart full of love", "Creating memories", "Golden moments", "Happiness",
    "Forever grateful", "Magical times", "Love wins", "Perfect moments", "Sunshine days",
    "Captured hearts", "Endless love", "Treasure trove", "Sweet dreams", "Joyful hearts"
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

function createScrapbookPage(imageSrc, imageAlt, page, book) {

    const rotation = getRandomRotation();
    const pattern = getRandomPattern();
    const text = getRandomText();
    const layout = getRandomLayout();

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
                'class': `scrapbook-text ${layout}`,
                text: text
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
