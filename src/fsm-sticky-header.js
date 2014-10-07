var fsm = angular.module('fsm', []);

fsm.directive('fsmStickyHeader', function(){
    return {
        restrict: 'EA',
        replace: false,
        scope: { 
            scrollBody: '=',
            scrollStop: '=',
            scrollableElement: '='
        },
        link: function(scope, element, attributes, control){
            var header = $(element, this);
            var clonedHeader = header.clone();

            var content = $(scope.scrollBody);
            var scrollableElement = $(scope.scrollableElement)[0] || $(window);

            header.before(clonedHeader);
            clonedHeader.addClass('fsm-sticky-header');
            clonedHeader.css({
                    position: 'fixed',
                    'z-index': 10000,
                    visibility: 'hidden'
                });
            calculateSize();

            function determineVisibility(){
                var scrollTop = scrollableElement.scrollTop() + scope.scrollStop;
                var contentTop = content.offset().top;
                var contentBottom = contentTop + content.outerHeight(false);

                if ( (scrollTop > contentTop) && (scrollTop < contentBottom) ) {
                    clonedHeader.css({ "visibility": "visible"});
                    
                    if ( scrollTop < contentBottom && scrollTop > contentBottom - clonedHeader.outerHeight(false) ){
                        var top = contentBottom - scrollTop + scope.scrollStop - clonedHeader.outerHeight(false);
                        clonedHeader.css('top', top + 'px');
                    } else {
                        calculateSize();
                    }
                } else {
                    clonedHeader.css( {"visibility": "hidden"} );      
                };
            };

            function calculateSize() {
                clonedHeader.css({
                    top: scope.scrollStop,
                    width: header.outerWidth(),
                    left: header.offset().left
                });

                setColumnHeaderSizes();
            };

            function setColumnHeaderSizes() {
                if (clonedHeader.is('tr')) {
                    var clonedColumns = clonedHeader.find('th');
                    header.find('th').each(function (index, column) {
                        var clonedColumn = $(clonedColumns[index]);
                        clonedColumn.css( 'width', column.offsetWidth + 'px');
                    });
                }
            }            

            scrollableElement.scroll(determineVisibility).trigger( "scroll" );
            scrollableElement.resize(determineVisibility);
        }
    }
});

fsm.directive('fsmMenuButton', function(){
    return {
        restrict: 'EA',
        replace: false,
        scope: { },
        link: function(scope, element, attributes, control){
            var menuButton = $(element, this);

            menuButton.addClass('fsm-menu-button');
            menuButton.click( menuOnClick );

            function menuOnClick() {
                setMenuSpin();
                setTimeout(setMenuSpin, 50);
                $('body').toggleClass('fsm-menu-toggle');
            };

            function setMenuSpin(){
                menuButton.find('.fsm-menu-button-open').toggleClass('fsm-spin-forward');
                menuButton.find('.fsm-menu-button-closed').toggleClass('fsm-spin-backward');
            };
        }
    }
});