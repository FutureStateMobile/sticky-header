'use strict';

(function(angular){
    var fsm = angular.module('fsm', []);

    fsm.directive('fsmStickyHeader', [function(){
        return {
            restrict: 'EA',
            replace: false,
            scope: {
                scrollBody: '@',
                scrollStop: '=',
                scrollableContainer: '=',
                contentOffset: '=',
				fsmZIndex: '='
            },
            link: function(scope, element, attributes, control){
                var content,
                    header = $(element, this),
                    clonedHeader = null,
                    scrollableContainer = $(scope.scrollableContainer),
                    contentOffset = scope.contentOffset || 0;

                var unbindScrollBodyWatcher = scope.$watch('scrollBody', function(newValue, oldValue) {
                    content = $(scope.scrollBody);
                    init();
                    unbindScrollBodyWatcher();
                });

                if (scrollableContainer.length === 0){
                    scrollableContainer = $(window);
                }

                function setColumnHeaderSizes() {
                    if (clonedHeader.is('tr') || clonedHeader.is('thead')) {
                        var clonedColumns = clonedHeader.find('th');
                        header.find('th').each(function (index, column) {
                            var clonedColumn = $(clonedColumns[index]);
                            //clonedColumn.css( 'width', column.offsetWidth + 'px'); fixed thead width
                            // fluid thead / table
                            var finalWidthSet = column.offsetWidth / ($(window).innerWidth()-20)*100; // $(window) can be replace with a custom wrapper / container
                            clonedColumn.css('width',finalWidthSet + '%');
                        });
                    }
                };

                function determineVisibility(){
                    var scrollTop = scrollableContainer.scrollTop() + scope.scrollStop;
                    var scrollLeft = -scrollableContainer.scrollLeft() + content.offset().left;
                    var contentTop = content.offset().top + contentOffset;
                    var contentBottom = contentTop + content.outerHeight(false);

                    if ( (scrollTop > contentTop) && (scrollTop < contentBottom) ) {
                        if (!clonedHeader){
                            createClone();
                            clonedHeader.css({ "visibility": "visible"});
                        }

                        if ( scrollTop < contentBottom && scrollTop > contentBottom - clonedHeader.outerHeight(false) ){
                            var top = contentBottom - scrollTop + scope.scrollStop - clonedHeader.outerHeight(false);
                            clonedHeader.css('top', top + 'px');
                        } else {
                            calculateSize();
                        }
                        clonedHeader.css('left', scrollLeft + 'px');
                    } else {
                        if (clonedHeader){
                            /*
                             * remove cloned element (switched places with original on creation)
                             */
                            header.remove();
                            header = clonedHeader;
                            clonedHeader = null;

                            header.removeClass('fsm-sticky-header');
                            header.css({
                                position: 'relative',
                                left: 0,
                                top: 0,
                                width: 'auto',
                                'z-index': 0,
                                visibility: 'visible'
                            });
                        }
                    }
                };

                function calculateSize() {
                    clonedHeader.css({
                        top: scope.scrollStop,
                        width: header.outerWidth(),
                        left: header.offset().left
                    });

                    setColumnHeaderSizes();
                };

                function createClone(){
                    /*
                     * switch place with cloned element, to keep binding intact
                     */
                    clonedHeader = header;
                    header = clonedHeader.clone();
                    clonedHeader.after(header);
                    clonedHeader.addClass('fsm-sticky-header');
                    clonedHeader.css({
                        position: 'fixed',
                        'z-index': scope.fsmZIndex || 10000,
                        visibility: 'hidden'
                    });
                    calculateSize();
                };

                function init() {
                    scrollableContainer.on('scroll.fsmStickyHeader', determineVisibility).trigger("scroll");
                    scrollableContainer.on('resize.fsmStickyHeader', determineVisibility);

                    scope.$on('$destroy', function () {
                        scrollableContainer.off('.fsmStickyHeader');
                    });
                }
            }
        };
    }]);

    fsm.directive('fsmMenu', ['$location', function ($location) {
        return {
            restrict: 'A',
            scope: {},
            link: function (scope, el, attrs) {
                var navigationMenu = angular.element(el);
                var menuTitles = navigationMenu.find('.fsm-menu-title');
                var menuItems = navigationMenu.find('[tc-menu-item]:visible');
                var activeMenu = 0;

                function menuOnClick(e) {
                    var menuTitle = angular.element(e.currentTarget);
                    // Find if our menu item has submenu items
                    var submenu = menuTitle.next('.fsm-sub-menu');

                    // If there is submenus, then we wan to either open or close the folder
                    submenu.slideToggle('fast', function () {
                        // swap the arrow from up to down, or vise-versa
                        var chevron = menuTitle.children('[class*=\'fa-chevron\']');
                        chevron.toggleClass('fa-chevron-down fa-chevron-up');

                        // Find the list of currently visible menu items for keyboarding through.
                        menuItems = navigationMenu.find('[tc-menu-item]:visible');
                    });

                }

                function menuOnKeydown(e) {
                    activeMenu = getCurrentMenuItem();

                    if (e.keyCode === 9) {
                        tabOutOfMenu(e);
                    } else if (e.keyCode === 13 || e.keyCode === 37 || e.keyCode === 39) {
                        triggerMenuItem(e);
                    } else if (e.keyCode === 38 || e.keyCode === 40) {
                        highlightMenuItem(e);
                    }
                }

                function tabOutOfMenu(e) {
                    if (e.shiftKey) {
                        $('[fsm-menu-button]').focus();
                    } else {
                        var firstTabItem = $('[tabindex=1]');

                        if (firstTabItem.length == 0) {
                            return;
                        } else {
                            firstTabItem.focus();
                        }
                    }

                    e.preventDefault();
                    e.stopPropagation();
                }

                function triggerMenuItem(e) {
                    e.currentTarget = $(menuItems[activeMenu]).children('a').first();
                    menuOnClick(e);
                }

                function highlightMenuItem(e) {
                    e.preventDefault();
                    e.stopPropagation();

                    if (e.keyCode === 38) {
                        if (activeMenu > 0) {
                            $(menuItems[activeMenu - 1]).children('a').first().focus();
                        } else {
                            $(menuItems[menuItems.length - 1]).children('a').first().focus();
                        }
                    } else if (e.keyCode === 40) {
                        if (activeMenu < (menuItems.length - 1)) {
                            $(menuItems[activeMenu + 1]).children('a').first().focus();
                        } else {
                            $(menuItems[0]).children('a').first().focus();
                        }
                    }
                }

                function getCurrentMenuItem() {
                    var focusedMenu = navigationMenu.find(':focus');

                    if (focusedMenu.length === 1) {
                        return menuItems.index(focusedMenu.parent('[tc-menu-item]').first());
                    }

                    return menuItems.index(navigationMenu.find('[tc-menu-item].active').first());
                }

                function menuOnFocus(e) {
                    e.preventDefault();
                    e.stopPropagation();

                    activeMenu = getCurrentMenuItem();
                    $(menuItems[activeMenu]).children('a').first().focus();
                }

                menuTitles.click(menuOnClick);
                navigationMenu.keydown(menuOnKeydown);
                navigationMenu.focus(menuOnFocus);

                scope.$watch(function () {
                    return $location.path();
                }, function (path) {
                    // grab all the a tags that start with #, indicating and angular route.
                    var allMenuItems = el.find('a[href^=\'#\']');

                    angular.forEach(allMenuItems, function (menuItem) {
                        var menu = angular.element(menuItem);
                        var link = menu.attr('href').split('#')[1];

                        if (path.indexOf(link) == 0) {
                            // activate the menu item
                            angular.element(menuItem.parentElement).addClass('active');

                            // open up the submenus if they are not open
                            var submenus = menu.parents('.fsm-sub-menu');
                            submenus.show();

                            // turn the chevrons up on the menu titles
                            var chevrons = submenus.prev().children('[class*=\'fa-chevron\']');
                            chevrons.removeClass('fa-chevron-down');
                            chevrons.addClass('fa-chevron-up');
                        } else {
                            angular.element(menuItem.parentElement).removeClass('active');
                        }
                    });

                    menuItems = navigationMenu.find('[tc-menu-item]:visible');
                });
            }
        }
    }]);

    fsm.directive('fsmMenuButton', function () {
        return {
            restrict: 'EA',
            replace: false,
            scope: {},
            link: function (scope, element, attributes, control) {
                var menuButton = $(element, this);

                menuButton.addClass('fsm-menu-button');
                menuButton.keydown(menuOnKeydown);
                $('body').keydown(bodyOnKeydown);

                function bodyOnKeydown(e) {
                    if (e.keyCode === 77 && e.ctrlKey && e.altKey) {
                        if (isMenuClosed()) {
                            menuOnClick();
                        }
                        $('[fsm-menu]').focus();
                    } else if (e.keyCode === 77 && e.ctrlKey) {
                        menuButton.focus();
                        menuOnClick();
                    }
                }

                function isMenuClosed() {
                    return $('body').hasClass('fsm-menu-toggle');
                }

                function menuOnClick() {
                    $('body').toggleClass('fsm-menu-toggle');
                    setMenuSpin();
                    setTimeout(setMenuSpin, 50);
                };

                function menuOnKeydown(e) {
                    if (e.keyCode === 32 || e.keyCode === 13) {
                        e.preventDefault();
                        e.stopPropagation();
                        menuOnClick();
                    }
                }

                function setMenuSpin() {
                    menuButton.find('.fsm-menu-button-open').toggleClass('fsm-spin-forward');
                    menuButton.find('.fsm-menu-button-close').toggleClass('fsm-spin-backward');
                };

                menuButton.on('click.fsmMenuButton', menuOnClick);

                scope.$on('$destroy', function() {
                    menuButton.off('.fsmMenuButton');
                });
            }
        }
    });

    fsm.directive('fsmBigData', ['$filter', function ($filter) {

        return {
            restrict: 'AE',
            scope: {},
            replace: false,
            transclude: true,
            link: function (scope, element, attrs, controller, transclude) {
                var orderBy = $filter('orderBy');
                var currentPage = 0;
                var pagedDataName = attrs.fsmBigData.split(' of ')[0];
                var rightHandExpression = attrs.fsmBigData.split(' of ')[1];
                var pageSize = parseInt(rightHandExpression.split(' take ')[1], 10);
                var sourceData = rightHandExpression.split(' take ')[0];

                // Interesting things can be done here with the source object...
                // var displayGetter = $parse(sourceData);
                // var displaySetter = displayGetter.assign;
                // var results = orderBy(displayGetter(scope.$parent), sortColumns);
                // displaySetter(scope.$parent, results)

                var rawData = [];
                var sortedData = [];
                var pagedData = [];
                var page = $(window);
                var sortTypes = [ 'None', 'Ascending', 'Descending' ];
                var sortColumns = [];

                transclude(function (clone, transcludedScope) {

                    transcludedScope.sortTypes = sortTypes;

                    element.append(clone);
                    transcludedScope[pagedDataName] = pagedData;

                    function nextPage() {
                        var dataSlice = sortedData.slice(pageSize * currentPage, (pageSize * (currentPage + 1)));
                        if (dataSlice.length > 0) {
                            pagedData.push.apply(pagedData, dataSlice);
                            currentPage++;
                        }
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

                    function addSortColumn(columnName, sortType) {

                        // If this column is currently in the sort stack, remove it.
                        for (var i = 0; i < sortColumns.length; i ++){
                            if (sortColumns[i].indexOf(columnName) > -1) {
                                sortColumns.splice(i, 1);
                            }
                        }

                        // Push this sort on the top of the stack (aka. array)
                        if (sortType > 0) {
                            var direction = '';
                            if (sortTypes[sortType] === 'Descending'){
                                direction = '-';
                            }
                            sortColumns.unshift(direction + columnName);
                        }

                        renderData();
                    }

                    function onPageScroll() {
                        var s = $(window).scrollTop();
                        var d = $(document).height();
                        var c = $(window).height();
                        var scrollPercent = (s / (d-c));

                        if (scrollPercent > 0.98) {
                            // We use scope.apply here to tell angular about these changes because 
                            // they happen outside of angularjs context... we're using jquery here
                            // to figure out when we need to load another page of data.
                            transcludedScope.$apply(nextPage);
                        }
                    }

                    transcludedScope.$parent.$watchCollection(sourceData, function (newData) {
                        if (newData){
                            rawData = newData;
                            renderData();
                        }
                    });

                    transcludedScope.addSortColumn = addSortColumn;

                    page.on('scroll.fsmBigData', onPageScroll).trigger('scroll');

                    transcludedScope.$on('$destroy', function() {
                        page.off('.fsmBigData');
                    });
                });
            }
        };
    }]);

    fsm.directive('fsmSort', [function () {
        var sortIconTemplate = '<i class="fa fa-sort"></i>';

        return {
            restrict: 'AE',
            replace: false,
            scope: {},
            link: function (scope, element, attrs) {
                var columnHeader = element;
                var columnName = attrs.fsmSort;
                var sortIcon = angular.element(sortIconTemplate);
                columnHeader.append('&nbsp;');
                columnHeader.append(sortIcon);
                var currentSortType = 0;

                function swapIcons(){
                    sortIcon.removeClass('fa-sort-desc fa-sort-asc fa-sort');

                    var classToAdd = 'fa-sort';

                    if (scope.$parent.sortTypes[currentSortType] === 'Ascending'){
                        classToAdd = 'fa-sort-asc';
                    } else if(scope.$parent.sortTypes[currentSortType] === 'Descending') {
                        classToAdd = 'fa-sort-desc';
                    }

                    sortIcon.addClass(classToAdd);
                };

                function applySort() {
                    // Find the kind of sort this should now be
                    currentSortType ++;
                    if (currentSortType == scope.$parent.sortTypes.length ){
                        currentSortType = 0;
                    }

                    scope.$apply( scope.$parent.addSortColumn(columnName, currentSortType) );

                    swapIcons();
                };

                columnHeader.css({ cursor: 'pointer' });

                columnHeader.on('click.fsmSort', applySort);

                columnHeader.on('keydown.fsmSort', function(e) {
                    if (e.keyCode === 13) {
                        applySort();
                        e.preventDefault();
                        e.stopPropagation();
                    }
                });

                scope.$on('$destroy', function() {
                    columnHeader.off('.fsmSort');
                });
            }
        };
    }]);
})(window.angular);
