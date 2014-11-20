// Sets the require.js configuration for your application.
require.config({
  // add one sentence only for test the ivan branch.
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
    "grouped_categories": "./libs/grouped-categories",
    "formatdate": "./libs/formatdate",
    "sparkline": "./libs/jquery.sparkline",
    "exif": "./libs/jquery.exif",
    "canvasResize": "./libs/jquery.canvasResize",

    "jqmcal": "./libs/jw-jqm-cal",
    "pull-to-refresh": "./libs/jquery.pull-to-refresh",

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
    'grouped_categories': ["highcharts"],
    "sprintf": ["jquery"],
    "sparkline": ["jquery"],
    "formatdate": ["jquery"],
    "jqmcal": ["jquery"],
    "exif": ["jquery"],
    "canvasResize": ["jquery"],
    "moment_lang_zh-cn": ["moment"],
    "pull-to-refresh": ["jquery"],
    // "jquerymobile": ["jquery"],

  } // end Shim Configuration

});

// Includes File Dependencies
require(["jquery", "underscore", "backbone", "routers/mobileRouter", "lzstring", "jqmcal", "moment_lang_zh-cn", "sparkline", "exif", "canvasResize"], function($, _, Backbone, Mobile, LZString) {

  $(document).on("mobileinit",
    // Set up the "mobileinit" handler before requiring jQuery Mobile's module
    function() {
      console.warn('mobile init');
      //关掉自动初始化
      $.mobile.autoInitializePage = false;
      // Prevents all anchor click handling including the addition of active button state and alternate link bluring.
      $.mobile.linkBindingEnabled = false;

      // Disabling this will prevent jQuery Mobile from handling hash changes
      $.mobile.hashListeningEnabled = false;

      $.mobile.pushStateEnabled = false;

      // set swipe 
      $.event.special.swipe.durationThreshold = 1000;
      $.event.special.swipe.horizontalDistanceThreshold = window.devicePixelRatio >= 2 ? 15 : 30;
      $.event.special.swipe.verticalDistanceThreshold = window.devicePixelRatio >= 2 ? 15 : 30;
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
      // var ldv = parseFloat(localStorage.getItem('data_version')) || 0;
      // if (DATA_VERSION > ldv) {
      //   localStorage.clear();
      //   localStorage.setItem('data_version', DATA_VERSION);
      // };
      // //判断上次数据刷新的时间
      // if (new Date() > new Date(lsy + 1000 * 60 * 60 * 24)) { //暂定一天
      //   localStorage.clear();
      //   localStorage.setItem('data_version', DATA_VERSION);
      //   localStorage.setItem('last_sync', (new Date()).getTime());
      // };
      // if (localStorage.getItem('refresh_interval') == null) {
      //   localStorage.setItem('refresh_interval', '15'); //如果没设置过，则默认给15分钟
      // };
      //把当前的登录用户的people id保存到local storage里面

      var lsy = localStorage.getItem('last_sync') || 0;
      var login_client = localStorage.getItem('login_client');
      var login_people = localStorage.getItem('login_people');
      //用户更换了client, people, 超过了预定的缓存时间，需要清空所有的local缓存
      if (login_client != $("#login_client").val() || login_people != $("#login_people").val() || new Date() > new Date(lsy + 1000 * 60 * 60 * 24)) {
        localStorage.clear();
        localStorage.setItem('data_version', DATA_VERSION);
        localStorage.setItem('login_client', $("#login_client").val());
        localStorage.setItem('login_people', $("#login_people").val());
        localStorage.setItem('last_sync', (new Date()).getTime());
      };

      $("body")
        .on("pagecontainershow", function(event, ui) {
          // console.log('message: page show->', ui.prevPage.length);

          // if (!ui.prevPage.length) { //首页第一次load
          //   $.mobile.loading("hide");
          // };
          var active_pages = $(".ui-mobile .ui-page-active");
          if (active_pages.length && active_pages[0].id == 'home') {
            window.setTimeout(function() {
              $(window).trigger('resize');
            }, 1);
          };
        })
        .on('pagecontainerbeforetransition', function(event) {

          // do nothing
          // $("#loading").show();
          // $.mobile.loading("show");
        })
        .on('pagecontainertransition', function(event) {
          // do nothing
          // $("#loading").hide();
          // $.mobile.loading("hide");
          /* Act on the event */
        });;

      // 设置首页上的tiles的高度
      var self = this;
      $(window).on('resize', function() {
        // console.log('message: window resize triggered!');
        self.resizeTiles();
        self.showCopyright();
      })
      this.resizeTiles = function() {
        _.each($("#main-tiles,#main-tiles2").find("[class|=ui-block]"), function(x) {
          var w = $(x).width();
          $(x).css('height', w + 'px').find('> div').css('height', w + 'px');
          // $(x).find('> div')
        })
      };
      this.showCopyright = function() {
        var l = Math.max(document.body.clientHeight, document.body.clientWidth);
        if ($("#home-content").height() > l - 40 - 50) {
          $("#copyright").hide();
        } else {
          $("#copyright").show();
        };
      };
      this.resizeTiles();
      this.showCopyright();

      window.android_uploader_callback = function(file_id) {
        if (document.getElementById('android_upload_file_id')) {
          $('#android_upload_file_id').val(file_id).trigger('change');
          return true;
        } else {
          return false;
        };
      }

    }
  )
  require(["jquerymobile"], function() {
    console.warn('start to load jquerymobile');
    // $.mobile.loading("show");
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
    //自定义的多关键字搜索 -> 返回true代表当前行需要隐藏， 返回false代表当前行显示出来
    $.mobile.filterable.prototype.options.filterCallback = function(index, searchValue) {
      // console.log(index, searchValue);
      var $this = $(this),
        filtertext = $this.data('filtertext') || $this.text() || '';

      if (searchValue) {
        searchValue = searchValue.split(' ');
        var found_flag = true;
        for (var i = 0; i < searchValue.length; i++) { //循环字段， 取每次的交集
          var tmp_regexp = /./;
          tmp_regexp.compile(searchValue[i]);
          found_flag = found_flag && tmp_regexp.test(filtertext);
        };
        // console.log(filtertext, searchValue, found_flag);
        return !found_flag;
      };
      return false; //没有过滤条件，全都显示
    }
    //config for ajax file upload in jquery mobile
    // $.ajaxEnvironment = function(settings, block) {
    //   var originalSettings = $.ajaxSetup();
    //   var restoredSettings = {};

    //   $.each(settings, function(key) {
    //     restoredSettings[key] = originalSettings[key];
    //   });

    //   $.ajaxSetup(settings);
    //   block();
    //   $.ajaxSetup(restoredSettings);
    // };

    // $.mobile.ajaxUpload = {};

    // $.mobile.ajaxUpload.upload = function(form, options) {
    //   var form = $(form);

    //   $.ajaxEnvironment({
    //     contentType: false,
    //     processData: false,
    //   }, function() {
    //     // $.mobile.changePage(form.attr('action'), {
    //     //   data: new FormData(form[0]),
    //     //   type: form.attr('method'),
    //     // });
    //     // console.log(new FormData(form[0]));
    //     $("body").pagecontainer("load", form.attr('action'), {
    //       data: new FormData(form[0]),
    //       type: form.attr('method'),
    //     });

    //   });
    // };
    //-- 检查是否需要自动跳转到正确的首页
    var hash = window.location.hash;
    console.debug('start to $.mobile.initializePage()')
    if ($("#req_ua").val() == 'normal') {
      if (hash == "") {
        // window.location.href = "#home"
        window.location.hash = 'home';
      };
    } else {
      if (hash == "#home") {
        // window.location.href = "#"
        window.location.hash = '';
      };
    };
    $.mobile.initializePage();
    console.debug('$.mobile.initializePage() --DONE!')
    // // Instantiates a new Backbone.js Mobile Router
    this.router = new Mobile();
    console.info('app message: backbone MAIN router started!');
    window.setTimeout(function() {
      if ($("#req_ua").val() != 'normal') {
        window.location.href = "cmd://app/init"; //向外壳发出初始化完成的信号
      }
    }, 1000);
    $("#my_alert").popup(); //初始化自定义alert框
    $("#my_confirm").popup(); //初始化自定义confirm框

    window.alert = function(msg, cb) { //默认的alert框的替换
      console.log('message: alert->', msg);
      $("#my_alert").html(msg.replace(/\n/g, '<br>')).popup('open');
      window.setTimeout(function() {
        $("#my_alert").popup('close');
        if (cb && typeof cb == 'function') {
          cb();
        };
      }, 3000);

    }
    window.my_confirm = function(msg, cb_cancel, cb_ok) { //默认的confirm框的替换

      $("#my_confirm #confirm_msg").html(msg.replace(/\n/g, '<br>'))
      $("#my_confirm").popup('open');
      $("#my_confirm").off('click');
      $("#my_confirm")
        .on('click', '#btn_ok', function(event) {
          event.preventDefault();
          console.log('message: ok');
          $("#my_confirm").popup('close');
          if (cb_ok && typeof cb_ok == 'function') {
            cb_ok();
          };
        })
        .on('click', '#btn_cancel', function(event) {
          event.preventDefault();
          console.log('message: cancel');
          $("#my_confirm").popup('close');
          if (cb_cancel && typeof cb_cancel == 'function') {
            cb_cancel();
          };
        });
    }
  });
  // Instantiates a new Backbone.js Mobile Router
  // this.router = new Mobile();
  // console.info('app message: backbone MAIN router started!');

});