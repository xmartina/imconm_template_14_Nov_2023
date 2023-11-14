(function ($) {
    "use strict";
    $.fn.wrapStart = function(numWords){
        return this.each(function(){
            var $this = $(this);
            var node = $this.contents().filter(function(){
                return this.nodeType == 3;
            }).first(),
            text = node.text().trim(),
            first = text.split(' ', 1).join(" ");
            if (!node.length) return;
            node[0].nodeValue = text.slice(first.length);
            node.before('<b>' + first + '</b>');
        });
    }; 

    jQuery(document).ready(function() {
        $('.mod-heading .widget-title > span').wrapStart(1);
        function init_owl() {
            $(".owl-carousel[data-carousel=owl]").each( function(){
                var config = {
                    loop: false,
                    nav: $(this).data( 'nav' ),
                    dots: $(this).data( 'pagination' ),
                    items: 4,
                    navText: ['<span class="univero-arrow-left"></span>', '<span class="univero-arrow-right"></span>']
                };
            
                var owl = $(this);
                if( $(this).data('items') ){
                    config.items = $(this).data( 'items' );
                }

                if ($(this).data('large')) {
                    var desktop = $(this).data('large');
                } else {
                    var desktop = config.items;
                }
                if ($(this).data('medium')) {
                    var medium = $(this).data('medium');
                } else {
                    var medium = config.items;
                }
                if ($(this).data('smallmedium')) {
                    var smallmedium = $(this).data('smallmedium');
                } else {
                    var smallmedium = config.items;
                }
                if ($(this).data('extrasmall')) {
                    var extrasmall = $(this).data('extrasmall');
                } else {
                    var extrasmall = 1;
                }
                if ($(this).data('verysmall')) {
                    var verysmall = $(this).data('verysmall');
                } else {
                    var verysmall = 1;
                }
                config.responsive = {
                    0:{
                        items:1
                    },
                    320:{
                        items:1
                    },
                    640:{
                        items:extrasmall
                    },
                    768:{
                        items:smallmedium
                    },
                    980:{
                        items:medium
                    },
                    1280:{
                        items:desktop
                    }
                }
                if ( $('html').attr('dir') == 'rtl' ) {
                    config.rtl = true;
                }
                $(this).owlCarousel( config );
                // owl enable next, preview
                var viewport = jQuery(window).width();
                var itemCount = jQuery(".owl-item", $(this)).length;

                if(
                    (viewport >= 1280 && itemCount <= desktop) //desktop
                    || ((viewport >= 980 && viewport < 1280) && itemCount <= medium) //desktop
                    || ((viewport >= 768 && viewport < 980) && itemCount <= smallmedium) //tablet
                    || ((viewport >= 320 && viewport < 768) && itemCount <= extrasmall) //mobile
                    || (viewport < 320 && itemCount <= verysmall) //mobile
                ) {
                    $(this).find('.owl-prev, .owl-next').hide();
                }
            } );
        }
        init_owl();
        // Fix owl in bootstrap tabs
        $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
            var target = $(e.target).attr("href");
            var carousel = $(".owl-carousel[data-carousel=owl]", target).data('owlCarousel');

            if ($(".owl-carousel[data-carousel=owl]", target).length > 0) {
                carousel._width = $(".owl-carousel[data-carousel=owl]", target).width();
                carousel.invalidate('width');
                carousel.refresh();
            }
            initProductImageLoad();
        });

        // loading ajax
        $('[data-load="ajax"] a').on('click', function(){
            var $href = $(this).attr('href');
            var self = $(this);
            var main = $($href);
            if ( main.length > 0 && main.data('loaded') == false ) {
                var height = main.parent().find('.tab-pane').first().height();

                main.data('loaded', 'true');
                var loading = $('<div class="ajax-loading"></div>');
                loading.css('height', height);
                main.html(loading);
                $.ajax({
                    url: univero_ajax.ajaxurl,
                    type:'POST',
                    dataType: 'html',
                    data:  'action=univero_get_products&columns=' + main.data('columns') + '&product_type=' + main.data('product_type') + '&number=' + main.data('number')
                        + '&categories=' + main.data('categories') + '&layout_type=' + main.data('layout_type')
                }).done(function(reponse) {
                    main.html( reponse );
                    if ( main.find('.owl-carousel') ) {
                        init_owl();
                    }
                    initProductImageLoad();
                });
                return true;
            }
        });
        // load-more
        $('body').on('click', '.gallery-showmore-btn', function(e) {
            e.preventDefault();

            var self = $(this);
            if (self.hasClass('loading')) {
                return false;
            }
            self.addClass('loading');
            var page = parseInt(self.data('page')) + 1;
            var max_page = parseInt(self.data('max-page'));
            if (page > max_page) {
                return false;
            }
            var main = $('#' + self.data('id'));
            var main_products = main.find('.gallery-content .row');
            

            $.ajax({
                url: univero_ajax.ajaxurl,
                type:'POST',
                dataType: 'html',
                data:  'action=univero_get_ajax_galleries&columns=' + self.data('columns')
                    + '&number=' + self.data('number') + '&page=' + page + '&image_style=' + self.data('image_style') + '&layout_type=' + self.data('layout_type')
                    + '&thumbsize=' + self.data('thumbsize') 
            }).done(function(reponse) {
                self.data('page', page );
                self.removeClass('loading');
                if (page >= max_page) {
                    self.addClass('all-products-loaded');
                }
                if ( self.data('layout_type') == 'mansory' || self.data('layout_type') == 'mansory-special' ) {
                    main.find('.isotope-items').isotope( 'insert', $(reponse).appendTo(main_products) ); 
                } else {
                    main_products.append( reponse );
                }
                setTimeout(function(){
                    initProductImageLoad();
                },300);
            });
        });

        setTimeout(function(){
            initProductImageLoad();
        }, 500);
        function initProductImageLoad() {
            $(window).off('scroll.unveil resize.unveil lookup.unveil');
            var $images = $('.image-wrapper:not(.image-loaded) .unveil-image'); // Get un-loaded images only
            if ($images.length) {
                var scrollTolerance = 1;
                $images.unveil(scrollTolerance, function() {
                    $(this).parents('.image-wrapper').first().addClass('image-loaded');
                });
            }

            var $images = $('.product-image:not(.image-loaded) .unveil-image'); // Get un-loaded images only
            if ($images.length) {
                var scrollTolerance = 1;
                $images.unveil(scrollTolerance, function() {
                    $(this).parents('.product-image').first().addClass('image-loaded');
                });
            }
        }

        // testimonial
        $("[data-testimonial=content]").each( function(){
            var self = $(this);
            var owl = $(this).find('.owl-carousel');
            setTimeout(function(){
                owl.find('.testimonials-body').removeClass('active');
                owl.find('.owl-item.active').eq(2).find('.testimonials-body').addClass('active');
                self.find('.testimonial-content').html( '' ).fadeOut(300);
                self.find('.testimonial-content').html( owl.find('.owl-item.active').eq(2).find('.description').html() ).fadeIn(300);
            }, 100);
            owl.on('changed.owl.carousel',function(property){
                setTimeout(function(){
                    owl.find('.testimonials-body').removeClass('active');
                    owl.find('.owl-item.active').eq(2).find('.testimonials-body').addClass('active');
                    self.find('.testimonial-content').html( '' ).fadeOut(300);
                    self.find('.testimonial-content').html( owl.find('.owl-item.active').eq(2).find('.description').html() ).fadeIn(300);
                }, 100);
            });

            $(this).find('.testimonials-body').on('click', function(){
                self.find('.testimonials-body').removeClass('active');
                $(this).addClass('active');
                self.find('.testimonial-content').html('').fadeOut(300);
                self.find('.testimonial-content').html($(this).find('.description').html()).fadeIn(300);
            });
        });

        //counter up
        if($('.counterUp').length > 0){
            $('.counterUp').counterUp({
                delay: 10,
                time: 1000
            });
        }

        /*---------------------------------------------- 
         * Play Isotope masonry
         *----------------------------------------------*/  
        jQuery('.isotope-items,.blog-masonry').each(function(){  
            var $container = jQuery(this);
        
            $container.imagesLoaded( function(){
                $container.isotope({
                    itemSelector : '.isotope-item',
                    transformsEnabled: true         // Important for videos
                }); 
            });
        });
        /*---------------------------------------------- 
         *    Apply Filter        
         *----------------------------------------------*/
        jQuery('.isotope-filter li a').on('click', function(){
           
            var parentul = jQuery(this).parents('ul.isotope-filter').data('related-grid');
            jQuery(this).parents('ul.isotope-filter').find('li a').removeClass('active');
            jQuery(this).addClass('active');
            var selector = jQuery(this).attr('data-filter');
            jQuery('#'+parentul).isotope({ filter: selector }, function(){ });
            
            return(false);
        });

        //Sticky Header
        setTimeout(function(){
            change_margin_top();
        }, 100);
        $(window).resize(function(){
            setTimeout(function(){
                change_margin_top();
            }, 50);
        });
        function change_margin_top() {
            if ($(window).width() > 991) {
                if ( $('.main-sticky-header').length > 0 ) {
                    var header_height = $('.main-sticky-header').outerHeight();
                    $('.main-sticky-header-wrapper').css({'height': header_height});
                }
            }
        }
        var main_sticky = $('.main-sticky-header');
        
        if ( main_sticky.length > 0 ){
            var _menu_action = main_sticky.offset().top;
            var Ninzio_Menu_Fixed = function(){
                "use strict";
                if( $(document).scrollTop() > _menu_action ){
                  main_sticky.addClass('sticky-header');
                }else{
                  main_sticky.removeClass('sticky-header');
                }
            }
            if ($(window).width() > 991) {
                $(window).scroll(function(event) {
                    Ninzio_Menu_Fixed();
                });
                Ninzio_Menu_Fixed();
            }
        }

        var back_to_top = function () {
            jQuery(window).scroll(function () {
                if (jQuery(this).scrollTop() > 400) {
                    jQuery('#back-to-top').addClass('active');
                } else {
                    jQuery('#back-to-top').removeClass('active');
                }
            });
            jQuery('#back-to-top').on('click', function () {
                jQuery('html, body').animate({scrollTop: '0px'}, 800);
                return false;
            });
        };
        back_to_top();
        
        // popup
        $(document).ready(function() {
            $(".popup-image").magnificPopup({type:'image'});
            $('.popup-video').magnificPopup({
                disableOn: 700,
                type: 'iframe',
                mainClass: 'mfp-fade',
                removalDelay: 160,
                preloader: false,
                fixedContentPos: false
            });
            $('.popup-gallery').magnificPopup({
                type: 'image',
                gallery:{
                    enabled:true
                }
            });
            $('.widget-gallery').each(function(){
                var tagID = $(this).attr('id');
                $('#' + tagID).magnificPopup({
                    delegate: '.popup-image-gallery',
                    type: 'image',
                    tLoading: 'Loading image #%curr%...',
                    mainClass: 'mfp-img-mobile',
                    gallery: {
                        enabled: true,
                        navigateByImgClick: true,
                        preload: [0,1] // Will preload 0 - before current, and 1 after the current image
                    }
                });
            });
        });

        // mobile menu
        $('[data-toggle="offcanvas"], .btn-offcanvas').on('click', function (e) {
            $('#ninzio-mobile-menu').slideToggle();           
        });

        $("#main-mobile-menu .icon-toggle").on('click', function(){
            $(this).parent().find('.sub-menu').first().slideToggle();
            return false;
        } );

        // preload page
        var $body = $('body');
        if ( $body.hasClass('ninzio-body-loading') ) {

            setTimeout(function() {
                $body.removeClass('ninzio-body-loading');
                $('.ninzio-page-loading').fadeOut(250);
            }, 300);
        }

        // full width video
        // Find all YouTube videos
        iframe_full_width();

        function iframe_full_width(){
            var $fluidEl = $(".pro-fluid-inner");
            var $videoEls = $(".pro-fluid-inner iframe");
            $videoEls.each(function() {
                $(this).data('aspectRatio', this.height / this.width)
                .removeAttr('height')
                .removeAttr('width');
            });

            $(window).resize(function() {
                $fluidEl.each(function(){
                    var newWidth = $(this).width();
                    var $videoEl = $(this).find("iframe");
                    $videoEl.each(function() {
                        var $el = $(this);
                        $el.width(newWidth).height(newWidth * $el.data('aspectRatio'));
                    });
                });
            }).resize();
        }
        
        $('.ninzio-mfp-close').on('click', function(){
            magnificPopup.close();
        });

        // search form
        $('.close-search-form').on('click', function(){
            $('.full-top-search-form').removeClass('show');
            $('#searchverlay').removeClass('show');
        });
        // full top search
        $('.button-show-search').on('click', function(){
            $('.full-top-search-form').toggleClass('show');
            $('#searchverlay').toggleClass('show');
        });

        // review
        if ( $('.comment-form-rating').length > 0 ) {
            var $star = $('.comment-form-rating .filled');
            var $review = $('#ninzio_input_rating');
            $star.find('li').on('mouseover',
                function () {
                    $(this).nextAll().find('span').removeClass('univero-star').addClass('univero-star-o');
                    $(this).prevAll().find('span').removeClass('univero-star-o').addClass('univero-star');
                    $(this).find('span').removeClass('univero-star-o').addClass('univero-star');
                    $review.val($(this).index() + 1);
                }
            );
        }

        $('body').on( 'mouseenter', '.accept-account', function(){
            $('.accept-account a[data-toggle=dropdown]').trigger('click');
        }).on( 'mouseleave', '.accept-account', function(){
            $('.accept-account a[data-toggle=dropdown]').trigger('click');
        });

        // course lesson sidebar
        $('.course-lesson-sidebar-btn').on('click', function(e){
            e.preventDefault();
            $('.course-lesson-sidebar-wrapper').toggleClass('active');
        });
        

        // gmap 3
        $('.ninzio-google-map').each(function(){
            var lat = $(this).data('lat');
            var lng = $(this).data('lng');
            var zoom = $(this).data('zoom');
            var id = $(this).attr('id');
            if ( $(this).data('marker_icon') ) {
                var marker_icon = $(this).data('marker_icon');
            } else {
                var marker_icon = '';
            }
            $('#'+id).gmap3({
                map:{
                    options:{
                        "draggable": true
                        ,"mapTypeControl": true
                        ,"mapTypeId": google.maps.MapTypeId.ROADMAP
                        ,"scrollwheel": false
                        ,"panControl": true
                        ,"rotateControl": false
                        ,"scaleControl": true
                        ,"streetViewControl": true
                        ,"zoomControl": true
                        ,"center":[lat, lng]
                        ,"zoom": zoom
                        ,'styles': $(this).data('style')
                    }
                },
                marker:{
                    latLng: [lat, lng],
                    options: {
                        icon: marker_icon,
                    }
                }
            });
        });
        
        setTimeout(function(){
            vc_rtl();
        }, 100);
        $(window).resize(function(){
            vc_rtl();
        });
        function vc_rtl() {
            if( jQuery('html').attr('dir') == 'rtl' ){
                jQuery('[data-vc-full-width="true"]').each( function(i,v){
                    jQuery(this).css('right' , jQuery(this).css('left') ).css( 'left' , 'auto');
                });
            }
        }

        $('.main-menu li.dropdown a').on('click', function() {
            window.location = $(this).attr('href');
        });

        $('#course-program .edr-lessons .lesson').each(function(){
            var self = $(this);
            if ( $('.lesson-excerpt', self).length > 0 ) {
                $('.lessin-wrapper .lesson-icon .expand-lesson', self).on('click', function(){
                    self.toggleClass('active');
                    if ( $(this).find('i').hasClass('mn-icon-193') ) {
                        $(this).find('i').removeClass('mn-icon-193').addClass('mn-icon-195');
                    } else {
                        $(this).find('i').removeClass('mn-icon-195').addClass('mn-icon-193');
                    }
                    $('.lesson-excerpt', self).slideToggle();
                });
            }
        });

        // sticky
        if ($(window).width() > 991) {
            if ($('.sticky-this').length > 0) {
                $('.sticky-this').stick_in_parent({
                    parent: ".sticky-v-wrapper",
                    spacer: false
                });
            }
        }

        $('.thumbs-gallery .gallery-thumb-image').each(function(e){
            $(this).on('click', function(event){
                event.preventDefault();
                $('.main-gallery').trigger("to.owl.carousel", [e, 0, true]);
                
                $('.thumbs-gallery .gallery-thumb-image').removeClass('active');
                $(this).addClass('active');
                return false;
            });
        });
        $('.main-gallery').on('changed.owl.carousel', function(event) {
            setTimeout(function(){
                var index = 0;
                $('.main-gallery .owl-item').each(function(i){
                    if ($(this).hasClass('active')){
                        index = i;
                    }
                });
                $('.thumbs-gallery .gallery-thumb-image').removeClass('active');
                $('.thumbs-gallery .owl-item').eq(index).find('.gallery-thumb-image').addClass('active');
            },50);
        });
    });

    // single gallery
    $('.course-gallery-index .thumb-link').each(function(e){
        $(this).on('click', function(event){
            event.preventDefault();
            $('.course-gallery-preview-owl').trigger("to.owl.carousel", [e, 0, true]);
            
            $('.course-gallery-index .thumb-link').removeClass('active');
            $(this).addClass('active');
            return false;
        });
    });
    $('.course-gallery-preview-owl').on('changed.owl.carousel', function(event) {
        setTimeout(function(){
            var index = 0;
            $('.course-gallery-preview-owl .owl-item').each(function(i){
                if ($(this).hasClass('active')){
                    index = i;
                }
            });
            $('.course-gallery-index .thumb-link').removeClass('active');
            $('.course-gallery-index .owl-item').eq(index).find('.thumb-link').addClass('active');
        },50);
    });

    $('[data-time="timmer"]').each(function(index, el) {
        var $this = $(this);
        var $date = $this.data('date').split("-");
        $this.ninzioCountDown({
            TargetDate:$date[0]+"/"+$date[1]+"/"+$date[2]+" "+$date[3]+":"+$date[4]+":"+$date[5],
            DisplayFormat:"<div class=\"times\"><div class=\"day\">%%D%% Days </div><div class=\"hours\">%%H%% Hours </div><div class=\"minutes\">%%M%% Minites </div><div class=\"seconds\">%%S%% Seconds </div></div>",
            FinishMessage: "",
        });
    });

    $('.widget-news').each(function(){
        var
        $this = $(this),
        auto = $this.data("auto"),
        item = $this.data("column"),
        item2 = $this.data("column2"),
        item3 = $this.data("column3"),
        gap = Number($this.data("gap"));

        $this.find('.owl-carousel').owlCarousel({
            loop: false,
            margin: gap,
            nav: true,
            navigation : true,
            pagination: true,
            autoplay: auto,
            autoplayTimeout: 5000,
            responsive: {
                0:{
                    items:item3
                },
                600:{
                    items:item2
                },
                1000:{
                    items:item
                }
            }
        });
    });

})(jQuery)

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires+";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
    }
    return "";
}