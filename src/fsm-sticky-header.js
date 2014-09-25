angular.module('fsm', [])
.directive('fsmStickyHeader', function () {
    return {
        restrict: 'EA',
        replace: false,
        scope: {
            scrollBody: '=',
            scrollStop: '=',
            scrollableElement: '='
        },
        link: function (scope, element) {
            var header = $(element);
            var clonedHeader = header.clone();
            var scrollStop = scope.scrollStop || 0;
            var isVisible = false;
            var scrollBody = scope.scrollBody || 'body,html';
            var scrollableElement = scope.scrollableElement || window;

            scrollBody = $(scrollBody);
            scrollableElement = $(scrollableElement);

            function initialize() {
                clonedHeader.css({
                    top: scope.scrollStop,
                    position: 'fixed',
                    'z-index': 10001,
                    visibility: 'hidden'
                });
                clonedHeader.addClass('sticky-header');

                // Attach the new header beside the original one in the dom
                header.after(clonedHeader);
                determineVisibility();
            };

            function determineVisibility() {
                var offset = scrollBody.offset();
                var scrollStopTop = scrollableElement.scrollTop() + scrollStop;
                var shouldBeVisible = ((scrollStopTop > offset.top) && (scrollStopTop < offset.top + scrollBody.height()));

                if (shouldBeVisible == isVisible) {
                    return;
                } else {
                    if (shouldBeVisible) {
                        clonedHeader.css({ "visibility": "visible" });
                        calculateSize();
                    } else {
                        clonedHeader.css({ "visibility": "hidden" });
                    };

                    isVisible = shouldBeVisible;
                }
            };

            function calculateSize() {
                clonedHeader.css({
                    width: header.width(),
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

            scrollableElement.scroll(determineVisibility).trigger("scroll");

            $(window).resize(calculateSize);

            initialize();
        }
    };
});
