angular.module('fsm', [])
.directive('fsmStickyHeader', function(){
	return {
		restrict: 'EA',
		replace: false,
		scope: { 
			topOfPage: '=',
			contentSelector: '='
		},
		link: function(scope, element, attributes, control){
			var clonedHeader;
			var content;

			var content = $(scope.contentSelector);

			clonedHeader = $(element, this);
			clonedHeader
		    	.before(clonedHeader.clone())
		    	.css("width", clonedHeader.width())
		    	.css({
		    		top: scope.topOfPage,
		    		width: clonedHeader.width(),
		    		left: clonedHeader.offset().left,
		    		position: 'fixed',
      				'z-index': 10001,
      				visibility: 'hidden',
      				'box-shadow': '0 2px 4px 0 rgba(0,0,0,.15)'
		    	});

			function updateStickyHeader(){
				var offset = content.offset();
				var scrollTop = $(window).scrollTop() + scope.topOfPage;

				if ((scrollTop > offset.top) && (scrollTop < offset.top + content.height())) {
					clonedHeader.css({ "visibility": "visible"});
				} else {
					clonedHeader.css( {"visibility": "hidden"} );      
				};
			};

			$( window ).scroll( updateStickyHeader ).trigger( "scroll" );
		}
	}
});
