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
    "moment_lang_zh-cn": "./bower_components/moment/lang/zh-cn",
    "sprintf": "./bower_components/sprintf/src/sprintf",
    "async": "./bower_components/async/lib/async",
    "lzstring": "./bower_components/lz-string/libs/lz-string-1.3.3",
    "highcharts": "./bower_components/highcharts/highcharts-all",
    "formatdate": "./libs/formatdate",
    "sparkline": "./libs/jquery.sparkline",

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
    'lzstring': { //amd work strange, so use normal+exports
      "exports": 'LZString'
    },
    'highcharts': { //amd work strange, so use normal+exports
      "deps": ["jquery"],
      "exports": 'Highcharts'
    },
    "sprintf": ["jquery"],
    "sparkline": ["jquery"],
    "formatdate": ["jquery"],
    "jqmcal": ["jquery"],
    "moment_lang_zh-cn": ["moment"],
    // "jquerymobile": ["jquery"],

  } // end Shim Configuration

});

// Includes File Dependencies
require(["jquery", "underscore", "backbone", "routers/mobileRouter", "lzstring", "jqmcal", "moment_lang_zh-cn", "sparkline"], function($, _, Backbone, Mobile, LZString) {

  $(document).on("mobileinit",
    // Set up the "mobileinit" handler before requiring jQuery Mobile's module
    function() {
      // Prevents all anchor click handling including the addition of active button state and alternate link bluring.
      $.mobile.linkBindingEnabled = false;

      // Disabling this will prevent jQuery Mobile from handling hash changes
      $.mobile.hashListeningEnabled = false;

      // console.log(LZString);
      // var string = "This is my compression test.";
      // console.log("Size of sample is: " + string.length);
      // var compressed = LZString.compressToUTF16(string);

      // console.log("Size of compressed sample is: " + compressed.length);
      // localStorage.setItem("myData", compressed);

      // string = LZString.decompressFromUTF16(localStorage.getItem("myData"));
      // console.log("Sample is: " + string);
      if (typeof(Storage) == "undefined") {
        alert('您当前的浏览器不支持本地存储特性！\n智思云移动版无法正常运行！\n请使用最新版的现代浏览器，或者打开浏览器的本地存储的选项，或者关闭浏览器的私密浏览功能。');
        return window.location.href = '/login';
      }
      //hard code data version
      var DATA_VERSION = 1.0;
      //check local storage data version, if data version > local data version, then clear all.
      var ldv = parseFloat(localStorage.getItem('data_version')) || 0;
      if (DATA_VERSION > ldv) {
        localStorage.clear();
        localStorage.setItem('data_version', DATA_VERSION);
      };
      //判断上次数据刷新的时间
      var lsy = localStorage.getItem('last_sync') || 0;
      if (new Date() > new Date(lsy + 1000 * 60 * 60 * 24)) { //暂定一天
        localStorage.clear();
        localStorage.setItem('data_version', DATA_VERSION);
        localStorage.setItem('last_sync', (new Date()).getTime());
      };
      if (localStorage.getItem('refresh_interval') == null) {
        localStorage.setItem('refresh_interval', '15'); //如果没设置过，则默认给15分钟
      };
      //把当前的登录用户的people id保存到local storage里面

      var login_people = JSON.parse(LZString.decompressFromUTF16(localStorage.getItem('login_people')) || null) || [];
      var found = _.find(login_people, function(x) {
        return x._id == $("#login_people").val();
      })
      if (!found) {
        login_people.push({
          _id: $("#login_people").val()
        });
      }
      localStorage.setItem('login_people', LZString.compressToUTF16(JSON.stringify(login_people)));

      $("body").on("pagecontainershow", function(event, ui) {
        // console.log('message: page show->', ui.prevPage.length);

        if (!ui.prevPage.length) { //首页第一次load
          $.mobile.loading("hide");
        };
      }).on('pagecontainerbeforetransition', function(event) {
        // do nothing
        // $("#loading").show();
        // $.mobile.loading("show");
      }).on('pagecontainertransition', function(event) {
        // do nothing
        // $("#loading").hide();
        // $.mobile.loading("hide");
        /* Act on the event */
      });;



    }
  )

  require(["jquerymobile"], function() {
    $.mobile.loading("show");
    $.mobile.listview.prototype.options.autodividersSelector = function(elt) {
      var text = $.trim(elt.data('dvdc')) || null;
      if (!text) {
        return null;
      }
      if (!isNaN(parseFloat(text))) {
        return "0-9";
      } else {
        text = text.slice(0, 1).toUpperCase();
        return text;
      }
    };
    //config for ajax file upload in jquery mobile
    $.ajaxEnvironment = function(settings, block) {
      var originalSettings = $.ajaxSetup();
      var restoredSettings = {};

      $.each(settings, function(key) {
        restoredSettings[key] = originalSettings[key];
      });

      $.ajaxSetup(settings);
      block();
      $.ajaxSetup(restoredSettings);
    };

    $.mobile.ajaxUpload = {};

    $.mobile.ajaxUpload.upload = function(form, options) {
      var form = $(form);

      $.ajaxEnvironment({
        contentType: false,
        processData: false,
      }, function() {
        // $.mobile.changePage(form.attr('action'), {
        //   data: new FormData(form[0]),
        //   type: form.attr('method'),
        // });
        $("body").pagecontainer("load", form.attr('action'), {
          data: new FormData(form[0]),
          type: form.attr('method'),
        });

      });
    };
    
    // Instantiates a new Backbone.js Mobile Router
    this.router = new Mobile();
    console.log('message: backbone router started!');

  });
});