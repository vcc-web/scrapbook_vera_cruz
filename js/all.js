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
            $(".sj-book .p75 .depth").css({
                width: depthWidth,
                right: 20 - depthWidth
            });
        else
            $(".sj-book .p75 .depth").css({ width: 0 });

    }

    // --- Scrapbook helpers from utils.js ---

    // List of image files for scrapbook pages
    const imageFiles = [
        "", "1.jpg", "10.jpg", "11.jpg", "12.jpg", "13.jpg", "14.jpg", "15.jpg", "16.jpg", "17.jpg", 
        "18.jpg", "19.jpg", "2.jpg", "20.jpg", "21.jpg", "22.jpg", "23.jpg", "24.jpg", "25.jpg", 
        "26.jpg", "27.jpg", "28.jpg", "29.jpg", "3.jpg", "30.jpg", "31.jpg", "4.jpg", "5.jpg", 
        "6.jpg", "7.jpg", "8.jpg", "9.jpg", "aline.jpg", "ana_beatriz.jpg", "ana_j.jpg", 
        "andrea.jpg", "andreia.jpg", "babies.jpg", "barbara.jpg", "bruna.jpg", "carol.jpg", 
        "dona_bete.jpg", "dona_maria_ferreira.jpg", "erica.jpg", "fernanda.jpg", 
        "fernanda_stuart.jpg", "flavio.jpg", "giovana_isabela.jpg", "gustavo.jpg", "icone.jpg", 
        "IMG-20250626-WA0019.jpg", "IMG-20250626-WA0020.jpg", "IMG-20250626-WA0021.jpg", 
        "isabel.jpg", "junia.jpg", "laura.jpg", "lhara.jpg", "logo.jpg", "logo_col.png", 
        "luiz.jpg", "marcela.jpg", "maria_carolina.jpg", "marina.jpg", "matheus.jpg", "nagila.jpg", 
        "regiane.jpg", "regiane_2.jpg", "regiane_3.jpg", "regina.jpg", "rodrigo.jpg", "santos.jpg", 
        "silvia.jpg", "slane.jpg", "tati.jpg", 
        "viviane.jpg", "will.jpg", "zaza.jpg"];
    
    console.log('Image files loaded:', imageFiles);

    // Add scrapbook pages using createScrapbookPage from utils.js
    function addPage(page, book) {
        // Pages 1 and last are usually covers/hard, skip scrapbook for those
        if (page < 2 || page > imageFiles.length + 1) return;

        // Check if this is the tree page (center of book)
        const totalPages = 76;
        const centerPage = Math.floor(totalPages / 2);
        
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
            pages: 76,
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
                        $(".sj-book .p75").addClass("fixed");
                    else
                        $(".sj-book .p75").removeClass("fixed");

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

        var previous = 37, next = 39, esc = 27;

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
            case esc:

                $(".flipbook-viewport").zoom("zoomOut");
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

})(jQuery);