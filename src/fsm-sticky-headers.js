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
			var header = $(element);
			var stickyBody = $(scope.contentSelector);
			var clonedHeader = header.clone();

			function initialize(){
				clonedHeader.css({
		    		top: scope.topOfPage,
		    		position: 'fixed',
	  				'z-index': 10001,
	  				visibility: 'hidden'
		    	});
		    	clonedHeader.addClass( 'sticky-header' );

				calculateSize();

				// Attach the new header beside the original one in the dom
				header.after(clonedHeader);
			};

			function determineVisibility(){
				var offset = stickyBody.offset();
				var scrollTop = $(window).scrollTop() + scope.topOfPage;

				if ((scrollTop > offset.top) && (scrollTop < offset.top + stickyBody.height())) {
					clonedHeader.css({ "visibility": "visible"});
				} else {
					clonedHeader.css( {"visibility": "hidden"} );      
				};
			};

			function calculateSize(){
				clonedHeader.css({
		    		width: header.width(),
		    		left: header.offset().left
				});
			};

			$( window ).scroll( determineVisibility ).trigger( "scroll" );

			$( window ).resize(calculateSize);

			initialize();
		}
	};
});
