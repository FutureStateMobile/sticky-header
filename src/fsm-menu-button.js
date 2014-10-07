angular.module('fsm', [])
.directive('fsmMenuButton', function(){
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
            }

            function setMenuSpin(){
                menuButton.find('.fsm-menu-button-open').toggleClass('fsm-spin-forward');
                menuButton.find('.fsm-menu-button-closed').toggleClass('fsm-spin-backward');
            }
        }
    }
});