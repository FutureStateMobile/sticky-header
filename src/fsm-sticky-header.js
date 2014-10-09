var fsm = angular.module('fsm', []);

fsm.directive('fsmStickyHeader', function(){
    return {
        restrict: 'EA',
        replace: false,
        scope: { 
            scrollBody: '=',
            scrollStop: '=',
            scrollableContainer: '='
        },
        link: function(scope, element, attributes, control){
            var header = $(element, this);
            var clonedHeader = header.clone();

            var content = $(scope.scrollBody);
            var scrollableContainer = $(scope.scrollableContainer)[0] || $(window);

            header.before(clonedHeader);
            clonedHeader.addClass('fsm-sticky-header');
            clonedHeader.css({
                    position: 'fixed',
                    'z-index': 10000,
                    visibility: 'hidden'
                });
            calculateSize();

            function determineVisibility(){
                var scrollTop = scrollableContainer.scrollTop() + scope.scrollStop;
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

            scrollableContainer.scroll(determineVisibility).trigger( "scroll" );
            scrollableContainer.resize(determineVisibility);
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

// fsm.directive('fsmDataTable', function () {
//     return {
//         restrict: 'A',
//         replace: false,
//         transclude: false,
//         scope: false,
//         compile: function (tElement, tAttrs, transclude) {
//             var currentPage = 0;
//             var pagedDataName = tAttrs.fsmDataTable.split(' by ')[0];
//             var rightHandExpression = tAttrs.fsmDataTable.split(' by ')[1];
//             var pageSize = parseInt(rightHandExpression.split(' of ')[0]);
//             var sourceData = rightHandExpression.split(' of ')[1];
           
//             var rawData = [];
//             var pagedData = [];
//             var page = $(window);

//             return function (scope, element, attrs) {
//                 scope[pagedDataName] = pagedData;

//                 function nextPage() {
//                     var dataSlice = rawData.slice(pageSize * currentPage, (pageSize * (currentPage + 1)));
//                     if (dataSlice.length > 0) {
//                         pagedData.push.apply(pagedData, dataSlice);
//                         currentPage++;
//                     }
//                 }

//                 function shouldGetNextPage() {
//                     var s = $(window).scrollTop(),
//                     d = $(document).height(),
//                     c = $(window).height();
//                     scrollPercent = (s / (d-c));

//                     if (scrollPercent > 0.98) {
//                         scope.$apply(nextPage);
//                     }
//                 }

//                 page.scroll(shouldGetNextPage).trigger( 'scroll' );

//                 scope.$watch(sourceData, function (newData) {
//                     rawData = newData;
//                     pagedData.length = 0;
//                     currentPage = 0;
//                     nextPage();
//                 });
//             };
//         }
//     };
// });

fsm.directive('fsmDataTable', function ($filter) {

    return {
        restrict: 'AE',
        scope: {},
        replace: false,
        transclude: true,
        link: function (scope, element, attrs, controller, transclude) {
            var orderBy = $filter('orderBy');
            var currentPage = 0;
            var pagedDataName = attrs.fsmDataTable.split(' take ')[0];
            var rightHandExpression = attrs.fsmDataTable.split(' take ')[1];
            var pageSize = parseInt(rightHandExpression.split(' of ')[0]);
            var sourceData = rightHandExpression.split(' of ')[1];
            
            // var displayGetter = $parse(sourceData);
            // var displaySetter = displayGetter.assign;

            var rawData = [];
            var sortedData = [];
            var pagedData = [];
            var page = $(window);
            var sortTypes = [ 'None', 'Ascending', 'Descending' ];
            var sortColumns = [];

            scope.sortTypes = sortTypes;

            transclude(scope, function (clone, transcludedScope) {
                element.append(clone);
                transcludedScope[pagedDataName] = pagedData;

                function nextPage() {
                    var dataSlice = sortedData.slice(pageSize * currentPage, (pageSize * (currentPage + 1)));
                    if (dataSlice.length > 0) {
                        pagedData.push.apply(pagedData, dataSlice);
                        currentPage++;
                    }
                }

                function checkToGetNextPage() {
                    var s = $(window).scrollTop(),
                    d = $(document).height(),   
                    c = $(window).height();
                    scrollPercent = (s / (d-c));

                    if (scrollPercent > 0.98) {
                        nextPage();
                    }
                }

                function addSortColumn(columnName, sortType) {
                    // If this column is currently in the sort stack, remove it.
                    sortColumns = _.reject(sortColumns, function(item){
                        return item.indexOf(columnName) > -1;
                    });

                    // Push this sort on the top of the stack
                    if (sortType > 0) {
                        
                        var direction = '';
                        if (sortTypes[sortType] === 'Descending'){
                            direction = '-'
                        }
                        sortColumns.unshift(direction + columnName);
                    }

                    // if (sortColumns.length > 0){
                    //     var results = orderBy(displayGetter(scope.$parent), sortColumns);
                    //     displaySetter(scope.$parent, results)
                    // }
                    renderData();

                }

                function renderData() {
                    if (sortColumns.length){
                        sortedData = orderBy(rawData, sortColumns);
                    }
                    else {
                        sortedData = rawData;
                    }

                    pagedData.length = 0;
                    currentPage = 0;
                    nextPage();
                }

                page.scroll(function() {
                    transcludedScope.$apply(checkToGetNextPage);
                }).trigger( 'scroll' );

                scope.$parent.$watchCollection(sourceData, function (newData) {
                    if (newData){
                        rawData = newData;
                        renderData();
                    }
                });

                scope.addSortColumn = addSortColumn;
            });
        }
    }
});

fsm.directive('fsmSort', function () {
    var sortTemplate = '<i class="fa fa-sort"></i>';

    return {
        restrict: 'AE',
        replace: false,
        scope: {},
        link: function (scope, element, attrs) {
            var columnHeader = $(element, this);
            var columnName = attrs.fsmSort;
            var sortIcon = angular.element(sortTemplate);
            columnHeader.append('&nbsp;')
            columnHeader.append(sortIcon);
            var currentSortType = 0;

            function clickSort(){
                // Find the kind of sort this should now be
                currentSortType ++;
                if (currentSortType == scope.$parent.sortTypes.length ){
                    currentSortType = 0;
                }

                scope.$parent.addSortColumn(columnName, currentSortType);
                swapIcons();
            };

            function swapIcons(){
                sortIcon.removeClass('fa-sort-desc fa-sort-asc fa-sort');

                var classToAdd = 'fa-sort';

                if (scope.$parent.sortTypes[currentSortType] === 'Ascending'){
                    classToAdd = 'fa-sort-asc';
                } else if(scope.$parent.sortTypes[currentSortType] === 'Descending') {
                    classToAdd = 'fa-sort-desc';
                }

                sortIcon.addClass(classToAdd);
            }

            columnHeader.css({ cursor: 'pointer' });

            columnHeader.click( function() { 
                scope.$apply(clickSort);
            });
        }
    }
});