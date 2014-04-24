// Sets the require.js configuration for your application.
require.config({

  // 3rd party script alias names (Easier to type "jquery" than "libs/jquery-1.8.2.min")
  paths: {

    // Core Libraries
    "jquery": "./bower_components/jquery/jquery",
    "jquerymobile": "./libs/jquery.mobile-1.4.2", //bower build failed, so use this offical version
    "underscore": "./bower_components/lodash/dist/lodash",
    "backbone": "./bower_components/backbone-amd/backbone",
    "handlebars": "./bower_components/handlebars/handlebars",
    "moment": "./bower_components/moment/moment",
    "sprintf": "./bower_components/sprintf/src/sprintf",
    "formatdate": "./libs/formatdate",

    "jqmcal": "./libs/jw-jqm-cal",

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
    "sprintf": ["jquery"],
    "formatdate": ["jquery"],
    "jqmcal": ["jquery"],
    // "jquerymobile": ["jquery"],

  } // end Shim Configuration

});

// Includes File Dependencies
require(["jquery", "underscore", "backbone", "routers/mobileRouter", "jqmcal"], function($, _, Backbone, Mobile) {

  $(document).on("mobileinit",
    // Set up the "mobileinit" handler before requiring jQuery Mobile's module
    function() {
      // Prevents all anchor click handling including the addition of active button state and alternate link bluring.
      $.mobile.linkBindingEnabled = false;

      // Disabling this will prevent jQuery Mobile from handling hash changes
      $.mobile.hashListeningEnabled = false;

      //把当前的登录用户的people id保存到local storage里面
      var login_people = JSON.parse(localStorage.getItem('login_people')) || [];
      var found = _.find(login_people, function(x) {
        return x._id == $("#login_people").val();
      })
      if (!found) {
        login_people.push({
          _id: $("#login_people").val()
        });
      }
      localStorage.setItem('login_people', JSON.stringify(login_people));
    }
  )

  require(["jquerymobile"], function() {
    // Instantiates a new Backbone.js Mobile Router
    this.router = new Mobile();
    console.log('message: backbone router started!');

  });
});