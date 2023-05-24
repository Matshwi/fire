// Progress Bar
(function ($) { 

    "use strict";

    var count_bar = function ($scope, $) {
        
        if ($('.count-bar').length) {
            $('.count-bar').appear(function(){
                var el = $(this);
                var percent = el.data('percent');
                $(el).css('width',percent).addClass('counted');
            },{accY: -50});
        
        }
    }
    

    $(window).on('elementor/frontend/init', function () {
        elementorFrontend.hooks.addAction('frontend/element_ready/firbrigs_skill.default', count_bar);
    });
})(window.jQuery);