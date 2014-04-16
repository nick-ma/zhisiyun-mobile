// Sets the require.js configuration for your application.
require.config({

  // 3rd party script alias names (Easier to type "jquery" than "libs/jquery-1.8.2.min")
  paths: {

    // Core Libraries
    "jquery": "bower_components/jquery/jquery",
    "jquerymobile": "libs/jquery.mobile-1.4.2.min", //bower build failed, so use this offical version
    "underscore": "bower_components/lodash/dist/lodash",
    "backbone": "bower_components/backbone-amd/backbone",
    "handlebars": "bower_components/handlebars/handlebars",
    "moment": "bower_components/moment/moment",
    "jqmcal": "libs/jw-jqm-cal",

  },

  // Sets the configuration for your third party scripts that are not AMD compatible
  shim: {

    "backbone": {
      "deps": ["underscore", "jquery"],
      "exports": "Backbone" //attaches "Backbone" to the window object
    },
    'handlebars': { //amd work strange, so use normal+exports
      "exports": 'Handlebars'
    },
    "jqmcal": ["jquery"],

  } // end Shim Configuration

});

// Includes File Dependencies
require(["jquery", "backbone", "routers/mobileRouter", "jqmcal"], function($, Backbone, Mobile) {

  $(document).on("mobileinit",
    // Set up the "mobileinit" handler before requiring jQuery Mobile's module
    function() {
      // Prevents all anchor click handling including the addition of active button state and alternate link bluring.
      $.mobile.linkBindingEnabled = false;

      // Disabling this will prevent jQuery Mobile from handling hash changes
      $.mobile.hashListeningEnabled = false;
    }
  )

  require(["jquerymobile"], function() {
    // Instantiates a new Backbone.js Mobile Router
    this.router = new Mobile();
    console.log('message: router started!');
  });
});