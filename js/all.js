(function ($) {

    window.book;

    // Why this?  Chrome has the fault:
    // http://code.google.com/p/chromium/issues/detail?id=128488
    function isChrome() {

        return navigator.userAgent.indexOf('Chrome') != -1;

    }

    function updateDepth(book, newPage) {

        var page = book.turn('page'),
            pages = book.turn('pages'),
            depthWidth = 16 * Math.min(1, page * 2 / pages);

        newPage = newPage || page;

        if (newPage > 3)
            $('.sj-book .p2 .depth').css({
                width: depthWidth,
                left: 20 - depthWidth
            });
        else
            $('.sj-book .p2 .depth').css({ width: 0 });

        depthWidth = 19 * Math.min(1, (pages - page) * 2 / pages);

        if (newPage < pages - 3)
            $('.sj-book .p55 .depth').css({
                width: depthWidth,
                right: 20 - depthWidth
            });
        else
            $('.sj-book .p55 .depth').css({ width: 0 });

    }

    // --- Scrapbook helpers from utils.js ---
    // Assumes utils.js is loaded before this script

    // List of image files for scrapbook pages
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

    // Add scrapbook pages using createScrapbookPage from utils.js
    function addPage(page, book) {
        // Pages 1 and last are usually covers/hard, skip scrapbook for those
        if (page < 2 || page > imageFiles.length + 1) return;

        // Check if this is the tree page (center of book)
        const totalPages = 56;
        const centerPage = Math.floor(totalPages / 2); // page 28
        
        if (page === centerPage) {
            createTreePage(page, book);
            return;
        }

        // Index in imageFiles is (page - 2), but skip center page
        let imgIndex = page - 2;
        if (page > centerPage) {
            imgIndex -= 1; // Adjust for skipped tree page
        }
        
        if (imgIndex >= 0 && imgIndex < imageFiles.length) {
            createScrapbookPage(imageFiles[imgIndex], imageFiles[imgIndex], page, book);
        }
    }


    function loadFlipbook(flipbook) {

        if (flipbook.width() === 0) {

            if (flipbook.width() == 0 || flipbook.height() == 0) {
                setTimeout(function () {
                    loadFlipbook(flipbook);
                }, 10);
            }

            return;
        }

        optimizeFlipbookPerformance();

        flipbook.turn({
            elevation: 50,
            acceleration: !isChrome(),
            autoCenter: true,
            duration: 1500,
            pages: 56,
            width: 1000,
            height: 800,
            when: {

                turning: function (e, page, view) {

                    var book = $(this);

                    var currentPage = book.turn('page'),
                        pages = book.turn('pages');


                    if (currentPage > 3 && currentPage < pages - 3) {

                        if (page == 1) {
                            book.turn('page', 2).turn('stop').turn('page', page);
                            e.preventDefault();
                            return;
                        } else if (page == pages) {
                            book.turn('page', pages - 1).turn('stop').turn('page', page);
                            e.preventDefault();
                            return;
                        }

                    } else if (page > 3 && page < pages - 3) {

                        if (currentPage == 1) {
                            book.turn('page', 2).turn('stop').turn('page', page);
                            e.preventDefault();
                            return;
                        } else if (currentPage == pages) {
                            book.turn('page', pages - 1).turn('stop').turn('page', page);
                            e.preventDefault();
                            return;
                        }

                    }

                    updateDepth(book, page);

                    if (page >= 2)
                        $('.sj-book .p2').addClass('fixed');
                    else
                        $('.sj-book .p2').removeClass('fixed');

                    if (page < book.turn('pages'))
                        $('.sj-book .p55').addClass('fixed');
                    else
                        $('.sj-book .p55').removeClass('fixed');

                    // Update the spine position

                    if (page == 1)
                        book.css({ backgroundPosition: '482px 0' });
                    else if (page == pages)
                        book.css({ backgroundPosition: '472px 0' });
                    else
                        book.css({ backgroundPosition: '479px 0' });

                },

                turned: function (e, page, view) {


                    var book = $(this),
                        pages = book.turn('pages');

                    updateDepth(book);

                    if (page == 2 || page == 3) {
                        book.turn('peel', 'br');
                    }

                    book.turn('center');

                },

                start: function (e, pageObj, corner) {

                    var book = $(this);

                    if (pageObj.page == 2)
                        book.css({ backgroundPosition: '482px 0' });
                    else if (pageObj.page == book.turn('pages') - 1)
                        book.css({ backgroundPosition: '472px 0' });

                },

                end: function (e, pageObj) {

                    var book = $(this);

                    updateDepth(book);

                },

                missing: function (e, pages) {
                    for (var i = 0; i < pages.length; i++) {
                        addPage(pages[i], $(this));
                    }
                }

            }
        });

        flipbook.addClass('animated');
        window.book = flipbook;
    }

    var flipbook = $('.flipbook');

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

    loadFlipbook(flipbook);

})(jQuery);