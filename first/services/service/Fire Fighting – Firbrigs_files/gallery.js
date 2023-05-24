(function ($) { 

    "use strict";

    var gallery_js = function ($scope, $) {
        
        if ($('.gallery-carousel').length) {
            $('.gallery-carousel').owlCarousel({
                loop:true,
                margin:6,
                nav:true,
                smartSpeed: 500,
                autoplay: 5000,
                navText: [ '<span class="fas fa-angle-left"></span>', '<span class="fas fa-angle-right"></span>' ],
                responsive:{
                    0:{
                        items:1
                    },
                    600:{
                        items:2
                    },
                    800:{
                        items:3
                    },
                    1024:{
                        items:3
                    },
                    1200:{
                        items:4
                    }
                }
            });    		
        }
    }
    

    $(window).on('elementor/frontend/init', function () {
        elementorFrontend.hooks.addAction('frontend/element_ready/firbrigs_gallery.default', gallery_js);
    });
})(window.jQuery);