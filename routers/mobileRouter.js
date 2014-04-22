// Mobile Router
// =============

// Includes file dependencies
define(["jquery", "backbone", "handlebars",
    //首页
    "../views/HomeObjectiveView", "../collections/ObjectiveCollection",
    "../views/HomeAssessmentView", "../collections/AssessmentCollection",
    //工作日历相关
    "../models/TaskModel", "../collections/TaskCollection", "../views/TaskView", "../views/TaskDetailView", "../views/TaskEditView",
    //人员和组织相关

    //其他jquery插件
    "moment",
  ],
  function($, Backbone, Handlebars,
    HomeObjectiveView, ObjectiveCollection,
    HomeAssessmentView, AssessmentCollection,
    TaskModel, TaskCollection, TaskView, TaskDetailView, TaskEditView

  ) {
    //注册handlebars的helper
    Handlebars.registerHelper('sprintf', function(sf, data) {
      return sprintf(sf, data);
    });
    Handlebars.registerHelper('fromNow', function(data) {
      return moment(data).fromNow();
    });
    Handlebars.registerHelper('Avatar', function(data) {
      return (data) ? '/gridfs/get/' + data : '/img/no-avatar.jpg';
    });
    Handlebars.registerHelper('toISOMD', function(date) {
      return (date) ? moment(date).format('MM/DD') : '';
    });
    Handlebars.registerHelper('toISODate', function(date) {
      return (date) ? moment(date).format('YYYY-MM-DD') : '';
    });
    Handlebars.registerHelper('toISOTime', function(date) {
      return (date) ? moment(date).format('HH:mm') : '';
    });
    Handlebars.registerHelper('toISODatetime', function(date) {
      return (date) ? moment(date).format('YYYY-MM-DD HH:mm') : '';
    });
    // Extends Backbone.Router
    var CategoryRouter = Backbone.Router.extend({

      // The Router constructor
      initialize: function() {
        this.homeObjectiveView = new HomeObjectiveView({
          el: "#home-objective-list",
          collection: new ObjectiveCollection()
        });
        this.homeAssessmentView = new HomeAssessmentView({
          el: "#home-assessment-list",
          collection: new AssessmentCollection()
        });
        this.taskView = new TaskView({
          el: "#task",
          collection: new TaskCollection()
        });

        this.taskEditView = new TaskEditView({
          el: "#task_edit",
          // model: new TaskCollection()
        });
        this.taskEditView.bind_events();
        this.taskDetailView = new TaskDetailView({
          el: "#task_detail",
          // model: new TaskCollection()
        });
        this.taskDetailView.bind_events();

        // Tells Backbone to start watching for hashchange events
        Backbone.history.start();

      },

      // Backbone.js Routes
      routes: {

        // When there is no hash bang on the url, the home method is called
        "": "home",

        "assessment_detail/:ai_id/:lx/:pi/:ol": "assessment_detail",
        // When #category? is on the url, the category method is called

        "task": "task",
        "task?:task_id": "task_detail",
        "task_edit?:task_id": "task_edit",

      },

      // Home method
      home: function() {
        console.log('message: home route');
        // var homeObjectiveView = this.homeObjectiveView;
        // if (homeObjectiveView.collection.length) {
        //   $.mobile.changePage("#home", {
        //     reverse: false,
        //     changeHash: false
        //   });
        // } else {
        //   // Show's the jQuery Mobile loading icon
        //   $.mobile.loading("show");

        //   // Fetches the Collection of Category Models for the current Category View
        //   homeObjectiveView.collection.fetch().done(function() {
        //     $.mobile.loading("hide");
        //     // Programatically changes to the home page
        //     $.mobile.changePage("#home", {
        //       reverse: false,
        //       changeHash: false
        //     });

        //   });
        // };

        var homeAssessmentView = this.homeAssessmentView;
        if (!homeAssessmentView.collection.length) {
          $.mobile.loading("show");
          homeAssessmentView.collection.fetch().done(function() {
            $.mobile.loading("hide");
          })
        };
        $.mobile.changePage("#home", {
          reverse: false,
          changeHash: false
        });
      },

      // Category method that passes in the type that is appended to the url hash
      category: function(type) {

        // Stores the current Category View  inside of the currentView variable
        var currentView = this[type + "View"];

        // If there are no collections in the current Category View
        if (!currentView.collection.length) {

          // Show's the jQuery Mobile loading icon
          $.mobile.loading("show");

          // Fetches the Collection of Category Models for the current Category View
          currentView.collection.fetch().done(function() {

            // Programatically changes to the current categories page
            $.mobile.changePage("#" + type, {
              reverse: false,
              changeHash: false
            });

          });

        }

        // If there already collections in the current Category View
        else {

          // Programatically changes to the current categories page
          $.mobile.changePage("#" + type, {
            reverse: false,
            changeHash: false
          });

        }

      },

      task: function() {
        var taskView = this.taskView;
        if (taskView.collection.length) {
          $.mobile.changePage("#task", {
            reverse: false,
            changeHash: false
          });
        } else {
          // Show's the jQuery Mobile loading icon
          $.mobile.loading("show");

          // Fetches the Collection of Category Models for the current Category View
          taskView.collection.fetch().done(function() {
            $.mobile.loading("hide");
            // Programatically changes to the task page
            $.mobile.changePage("#task", {
              reverse: false,
              changeHash: false
            });

          });
        };
      },

      task_detail: function(task_id) {
        var taskView = this.taskView;
        var taskDetailView = this.taskDetailView;
        taskDetailView.model = taskView.collection.get(task_id);
        taskDetailView.render();
        $.mobile.changePage("#task_detail", {
          reverse: false,
          changeHash: false
        });

      },

      task_edit: function(task_id) {
        var taskView = this.taskView;
        var taskEditView = this.taskEditView;
        if (task_id == 'new') {
          var new_task = taskView.collection.add({
            'title': '新建任务',
            'start': new Date(),
            'end': new Date(),
            'allDay': true,
            'is_complete': false,
          });
          // new_task.save().done(function() {
          taskEditView.model = new_task;
          taskEditView.render();
          // })
        } else {
          taskEditView.model = taskView.collection.get(task_id);
          taskEditView.render();
        };

        $.mobile.changePage("#task_edit", {
          reverse: false,
          changeHash: false
        });
        //把 a 换成 span， 避免点那个滑块的时候页面跳走。
        $(".ui-flipswitch a").each(function() {
          $(this).replaceWith("<span class='" + $(this).attr('class') + "'></span>")
        })
      },
      assessment_detail: function(ai_id, lx, pi, ol) {
        console.log(ai_id, lx, pi, ol);
      }

    });

    // Returns the Router class
    return CategoryRouter;

  });