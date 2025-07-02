// Scrapbook data
const scrapbookTexts = [
    "Memories that last forever", "Beautiful moments captured", "Life's precious treasures",
    "Sweet memories", "Unforgettable times", "Special moments", "Happy days", "Love & laughter",
    "Family first", "Together forever", "Making memories", "Blessed moments", "Pure joy",
    "Adventures await", "Dream big", "Cherished times", "Wonderful memories", "Life is beautiful",
    "Smile always", "Heart full of love", "Creating memories", "Golden moments", "Happiness",
    "Forever grateful", "Magical times", "Love wins", "Perfect moments", "Sunshine days",
    "Captured hearts", "Endless love", "Treasure trove", "Sweet dreams", "Joyful hearts"
];



function loadApp() {
    var flipbook = $('.flipbook');

    // Check if the CSS was already loaded
    if (flipbook.width() == 0 || flipbook.height() == 0) {
        setTimeout(loadApp, 10);
        return;
    }

    // Clear existing pages except first two empty ones
    const imageFiles = [
        '20250625_092143.jpg', '20250625_092235.jpg', '20250625_092321.jpg', '20250625_094404.jpg',
        '20250625_095741.jpg', '20250625_095858.jpg', '20250625_100527.jpg', '20250625_100843.jpg',
        '20250625_101145.jpg', '20250625_101819.jpg', '20250625_102311.jpg', '20250625_102427.jpg',
        '20250625_102529.jpg', '20250625_102829.jpg', '20250625_105214.jpg', '20250625_105220.jpg',
        '20250625_110638.jpg', '20250625_110930.jpg', '20250625_110936.jpg', '20250626_080316.jpg',
        '20250626_094133.jpg', '20250626_104914.jpg', '20250626_105801.jpg', '20250626_124504.jpg',
        '20250626_133517.jpg', '20250627_125618.jpg', '20250627_125834.jpg', '20250627_130402.jpg',
        '20250627_133956.jpg', '20250628_082913.jpg', '20250628_090919.jpg', '20250628_091050.jpg',
        '20250628_091341.jpg', '20250628_091621.jpg', '20250628_092629.jpg', '20250628_092912.jpg',
        '20250628_093322.jpg', '20250628_093802.jpg', '20250628_093930.jpg', '20250628_094326.jpg',
        '20250628_094422.jpg', '20250628_094447.jpg', '20250628_094830.jpg', '20250628_094902.jpg',
        '20250628_100549.jpg', '20250628_103413.jpg', '20250628_105756.jpg', '20250628_112456.jpg',
        '20250628_113719.jpg', '20250628_113746.jpg', '20250628_114158.jpg', '20250628_114847.jpg',
        'IMG-20250626-WA0019.jpg', 'IMG-20250626-WA0020.jpg', 'IMG-20250626-WA0021.jpg', 'IMG-20250626-WA0022.jpg'
    ];

    // Remove existing image pages
    $('.flipbook .double').remove();

    // Add scrapbook pages
    imageFiles.forEach((img, indx) => {
        const pageHtml = createScrapbookPage(img, img, indx);
        flipbook.append(pageHtml);
    });

    $('.flipbook .double').scissor();

    // Create the flipbook
    $('.flipbook').turn({
        width: 1000,
        height: 800,
        duration: 1500,
        gradients: true,
        acceleration: true,
        autoCenter: true,
        elevation: 50,
        pages: 56,
        when: {
            turning: function (event, page) {
                // Handle page turning event
                console.log('Turning to page:', page);
            },
            turned: function (event, page, view) {
                $(this).turn('center');

                if (page == 1) {
                    $(this).turn('peel', 'br');
                }

            },
        }
    });
}

// Using arrow keys to turn the page

$(document).on('keydown', function (e) {

    var previous = 37, next = 39, esc = 27;

    switch (e.keyCode) {
        case previous:

            // left arrow
            $('.flipbook').turn('previous');
            e.preventDefault();

            break;
        case next:

            //right arrow
            $('.flipbook').turn('next');
            e.preventDefault();

            break;
        case esc:

            $('.flipbook-viewport').zoom('zoomOut');
            e.preventDefault();

            break;
    }
});

$(window).on('resize', function () {
    resizeViewport();
}).on('orientationchange', function () {
    resizeViewport();
});


$('#canvas').hide();

// Load turn.js
loadApp()