(function($){
  $.fn.pull_to_refresh = function(options) {

    var defaults = {
      refresh: function(callback){},
      container: document.body,
      pull_to_refresh_text: 'Pull down to refresh...',
      letgo_text: 'Release to refresh...',
      refreshing_text: 'Refreshing...',
      status_indicator_id: 'pull_to_refresh',
      refresh_class: 'refresh',
      visible_class: 'visible',
    };
    var options = $.extend(defaults, options);

    var content,container,
        status_indicator,
        refreshing,
        contentStartY = 0,
        startY = 0,
        track = false,
        refresh = false;

    var removeTransition = function() {
      content.css('-webkit-transition-duration',0);
      // content.css('top',0);
      status_indicator.removeClass(options.refresh_class);
      status_indicator.removeClass(options.visible_class)
      status_indicator.text(options.pull_to_refresh_text)
    };

    // get the different objects
    content = $(this);
    container = options.container;
    // create the container for the pull indicator
    content.prepend('<div id="' + options.status_indicator_id + '" >' + options.pull_to_refresh_text + '</div>');
    status_indicator = $('#' + options.status_indicator_id);

    // make sure the content is absolute positioned
    content.css('position','absolute');
    content.css('top',60); //adapt to jquery mobile head part!
    content.css('min-height','100%'); //adapt to jquery mobile head part!

    // move the pull_to_refresh to the top
    status_indicator.css('position','absolute');
    status_indicator.css('top','-' + status_indicator.height() + 'px');
    status_indicator.css('display','block');

    // add the listener for the touchdown event, and set the initial values
    container.addEventListener('touchstart', function(e) {
      // e.stopPropagation();
      try {
        contentStartY = parseInt(content.css('top'));
      }
      catch(e) {
        contentStartY = 0;
      }
      startY = e.touches[0].screenY;
    });

    // this is where the magic happens, if we stop moving, we check
    // whether we haved moved enough, if so, we set a nice transition, and 
    // start the callback
    container.addEventListener('touchend', function(e) {
      // e.stopPropagation();
      if(refresh) {
        content.css('-webkit-transition-duration','1.0s');
        content.css('top',status_indicator.height() + 'px');
        status_indicator.text(options.refreshing_text);
        status_indicator.addClass(options.refresh_class);

        options.refresh(function() { // pass down done callback
          // container.addEventListener('transitionEnd', removeTransition);
          removeTransition();
        });

        refresh = false;
      } else if(track) {
        content.css('-webkit-transition-duration','.25s');
        content.css('top','0');
        container.addEventListener('transitionEnd', removeTransition);
        // removeTransition();
      }

      track = false;
    });

    // on moving of the touch event, we move the diff down
    // unfortunately, for this to work, we need to prevent the default
    // behaviour, which means a broken bounce, any tips would be appreciated!
    container.addEventListener('touchmove', function(e) {
      e.preventDefault(); // <- bummer!
      // e.stopPropagation();
      var move_to = contentStartY - (startY - e.changedTouches[0].screenY);
      if(move_to > 0) track = true; // start tracking if near the top 
      content.css('top',move_to + 'px');

      // have we pull the whole indicator down?
      if(move_to > status_indicator.height()) {
        refresh = true;
        status_indicator.addClass(options.visible_class)
        status_indicator.text(options.letgo_text)
      } else {
        content.css('-webkit-transition','');
        refresh = false;
      }
    });
  }
})(jQuery);