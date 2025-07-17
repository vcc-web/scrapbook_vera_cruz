(function ($) {

    window.book;

    // Why this?  Chrome has the fault:
    // http://code.google.com/p/chromium/issues/detail?id=128488
    function isChrome() {

        return navigator.userAgent.indexOf("Chrome") != -1;

    }

    function updateDepth(book, newPage) {

        var page = book.turn("page"),
            pages = book.turn("pages"),
            depthWidth = 16 * Math.min(1, page * 2 / pages);

        newPage = newPage || page;

        if (newPage > 3)
            $(".sj-book .p2 .depth").css({
                width: depthWidth,
                left: 20 - depthWidth
            });
        else
            $(".sj-book .p2 .depth").css({ width: 0 });

        depthWidth = 19 * Math.min(1, (pages - page) * 2 / pages);

        if (newPage < pages - 3)
            $(".sj-book .p65 .depth").css({
                width: depthWidth,
                right: 20 - depthWidth
            });
        else
            $(".sj-book .p65 .depth").css({ width: 0 });

    }

    // --- Scrapbook helpers from utils.js ---
    const imageFiles = [
        "", "video-inicio", "i1 - inicio.jpg", "i2.jpg", "i3 - regiane.jpg", "i4 - orando.jpg", "i5 - babies.jpg", 
        "i6 - carol.jpg", "i7 - babies_1.jpg", "i8 - regina.jpg", "i9 - gustavo.jpg", "i10 - viviane.jpg", "i11 - isabela.jpg", 
        "i12 - giovana-isabela.jpg", "i13 - laura.jpg", "i14.jpg", "oracao1", "i15.jpg", "i16 - coracao.jpg",
        "i17 - bete.jpg", "i18 - andrea.jpg", "i19 - maria_carolina.jpg", "i20 - aline.jpg", "i21 - tati.jpg", 
        "i22 - maria_ferreira.jpg", "i23 - matheus.jpg", "i24 - ana_paula.jpg", "i25 - junia.jpg", "i26 - flavio.jpg", 
        "i27 - slane.jpg", "i28 - bruna.jpg", "i29 - andreia.jpg", "i30 - zaza.jpg", "oracao2", "tree",
        "i31 - will.jpg", "i32 - missa.jpg", "i33 - barbara.jpg", "i34 - fernanda_stuart.jpg", "i35 - marina.jpg",
        "i36 - silvia.jpg", "i37 - nagila.jpg", "i38 - orando_de_joelhos.jpg", "i39 - lhara.jpg", "i40 - michelle.jpg",
        "i41 - marcela.jpg", "i42 - ana_beatriz.jpg", "i43 - bilocacao.jpg", "oracao3", "i44 - ana_j.jpg", 
        "i45 - rodrigo_missa.jpg", "i46.jpg", "i47 - mae_rodrigo.jpg", "i48 - icone.jpg", "i49 - abraco_1.jpg", 
        "i50 - bolo_1.jpg", "i51 - parabens_1.jpg", "i52 - parabens_2.jpg", "video-fim"
    ]

    console.log('Image files loaded:', imageFiles);

    // Add scrapbook pages using createScrapbookPage from utils.js
    function addPage(page, book) {
        // Pages 1 and last are usually covers/hard, skip scrapbook for those
        if (page < 2 || page > imageFiles.length + 1) return;

        // Index in imageFiles is (page - 2), but skip center page
        let imgIndex = page - 2;

        if (imageFiles[imgIndex] === "tree") {
            console.log('Creating tree page for page:', page);
            createTreePage(page, book);
            return;
        }

        if (imgIndex >= 0 && imgIndex < imageFiles.length) {
            console.log('Creating scrapbook page for image:', imageFiles[imgIndex], 'at page:', page, 'an index:', imgIndex);
            createScrapbookPage(
                imageFiles[imgIndex], imageFiles[imgIndex],
                page, book, imageFiles[imgIndex] === "video-inicio",
                imageFiles[imgIndex] === "video-fim");
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
            pages: 66,
            width: 1000,
            height: 800,
            when: {

                turning: function (e, page, view) {

                    var book = $(this);

                    var currentPage = book.turn("page"),
                        pages = book.turn("pages");


                    if (currentPage > 3 && currentPage < pages - 3) {

                        if (page == 1) {
                            book.turn("page", 2).turn("stop").turn("page", page);
                            e.preventDefault();
                            return;
                        } else if (page == pages) {
                            book.turn("page", pages - 1).turn("stop").turn("page", page);
                            e.preventDefault();
                            return;
                        }

                    } else if (page > 3 && page < pages - 3) {

                        if (currentPage == 1) {
                            book.turn("page", 2).turn("stop").turn("page", page);
                            e.preventDefault();
                            return;
                        } else if (currentPage == pages) {
                            book.turn("page", pages - 1).turn("stop").turn("page", page);
                            e.preventDefault();
                            return;
                        }

                    }

                    updateDepth(book, page);

                    if (page >= 2)
                        $(".sj-book .p2").addClass("fixed");
                    else
                        $(".sj-book .p2").removeClass("fixed");

                    if (page < book.turn("pages"))
                        $(".sj-book .p65").addClass("fixed");
                    else
                        $(".sj-book .p65").removeClass("fixed");

                    // Update the spine position

                    if (page == 1)
                        book.css({ backgroundPosition: "482px 0" });
                    else if (page == pages)
                        book.css({ backgroundPosition: "472px 0" });
                    else
                        book.css({ backgroundPosition: "479px 0" });

                },

                turned: function (e, page, view) {


                    var book = $(this),
                        pages = book.turn("pages");

                    updateDepth(book);

                    if (page == 2 || page == 3) {
                        book.turn("peel", "br");
                    }

                    book.turn("center");

                },

                start: function (e, pageObj, corner) {

                    var book = $(this);

                    if (pageObj.page == 2)
                        book.css({ backgroundPosition: "482px 0" });
                    else if (pageObj.page == book.turn("pages") - 1)
                        book.css({ backgroundPosition: "472px 0" });

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

        flipbook.addClass("animated");
        window.book = flipbook;
    }

    var flipbook = $(".flipbook");

    $(document).on("keydown", function (e) {

        var previous = 37, next = 39;

        switch (e.keyCode) {
            case previous:

                // left arrow
                $(".flipbook").turn("previous");
                e.preventDefault();

                break;
            case next:

                //right arrow
                $(".flipbook").turn("next");
                e.preventDefault();

                break;
        }
    });

    $(window).on("resize", function () {
        resizeViewport();
    }).on("orientationchange", function () {
        resizeViewport();
    });

    loadFlipbook(flipbook);

    // Initialize AudioManager
    console.log('[AudioManager] Checking if AudioManager is available...');
    if (typeof AudioManager !== 'undefined') {
        console.log('[AudioManager] AudioManager class found, initializing...');
        window.audioManager = new AudioManager();
        console.log('[AudioManager] AudioManager initialized successfully:', window.audioManager);
    } else {
        console.error('[AudioManager] AudioManager class not found! Check if audioManager.js is loaded.');
    }

})(jQuery);