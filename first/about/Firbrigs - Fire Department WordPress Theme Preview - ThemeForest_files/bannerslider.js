(function($){"use strict";var banner_js=function($scope,$){if($('.banner-carousel').length){$('.banner-carousel').owlCarousel({loop:true,margin:0,nav:true,animateOut:'fadeOut',animateIn:'fadeIn',active:true,smartSpeed:1000,autoplay:6000,navText:['<span class="flaticon-left-arrow"></span>','<span class="flaticon-right-arrow"></span>'],responsive:{0:{items:1},600:{items:1},800:{items:1},1024:{items:1}}});}}
$(window).on('elementor/frontend/init',function(){elementorFrontend.hooks.addAction('frontend/element_ready/firbrigs_banner_slider.default',banner_js);});})(window.jQuery);