angular.module('fsm', [])
.directive('fsmStickyHeader', function(){
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
            var scrollableElement = $(scope.scrollableElement) || $(window);

            header.before(clonedHeader);
            clonedHeader.addClass('fsm-sticky-header');
            clonedHeader.css({
                    top: scope.scrollStop,
                    width: header.outerWidth(),
                    left: header.offset().left,
                    position: 'fixed',
                    'z-index': 10000,
                    visibility: 'hidden'
                });
            calculateSize();

            function determineVisibility(){
                var offset = content.offset();
                var scrollTop = $(window).scrollTop() + scope.scrollStop;

                if ((scrollTop > offset.top) && (scrollTop < offset.top + content.height())) {
                    clonedHeader.css({ "visibility": "visible"});
                    calculateSize();
                } else {
                    clonedHeader.css( {"visibility": "hidden"} );      
                };
            };

            function calculateSize() {
                clonedHeader.css({
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

            $(window).scroll(determineVisibility).trigger( "scroll" );
            $(window).resize(determineVisibility);
        }
    }
});