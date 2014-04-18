// Mobile Router
// =============

// Includes file dependencies
define(["jquery", "backbone",
    //工作日历相关
    "../models/TaskModel", "../collections/TaskCollection", "../views/TaskView", "../views/TaskDetailView"
    //人员和组织相关
  ],
  function($, Backbone,

    TaskModel, TaskCollection, TaskView, TaskDetailView
  ) {
    // Extends Backbone.Router
    var CategoryRouter = Backbone.Router.extend({

      // The Router constructor
      initialize: function() {


        this.taskView = new TaskView({
          el: "#task",
          collection: new TaskCollection()
        });
        this.taskDetailView = new TaskDetailView({
          el: "#task_detail",
          // model: new TaskCollection()
        });

        // Tells Backbone to start watching for hashchange events
        Backbone.history.start();

      },

      // Backbone.js Routes
      routes: {

        // When there is no hash bang on the url, the home method is called
        "": "home",

        // When #category? is on the url, the category method is called

        "task": "task",
        "task?:task_id": "task_detail",

      },

      // Home method
      home: function() {

        // Programatically changes to the categories page
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

            // Programatically changes to the task page
            $.mobile.changePage("#task", {
              reverse: false,
              changeHash: false
            });

          });
        };
      },

      task_detail: function(task_id) {
        console.log(task_id);
        var taskView = this.taskView;
        var taskDetailView = this.taskDetailView;
        if (task_id == 'new') {
          var new_task = taskView.collection.add({
            'title': '新建任务',
            'start': new Date(),
            'end': new Date(),
            'allDay': true
          });
          // new_task.save().done(function() {
          taskDetailView.model = new_task;
          taskDetailView.render();
          // })
        } else {
          taskDetailView.model = taskView.collection.get(task_id);
          taskDetailView.render();
        };

        $.mobile.changePage("#task_detail", {
          reverse: false,
          changeHash: false
        });
        //把 a 换成 span， 避免点那个滑块的时候页面跳走。
        $(".ui-flipswitch a").each(function() {
          $(this).replaceWith("<span class='" + $(this).attr('class') + "'></span>")
        })
      }

    });

    // Returns the Router class
    return CategoryRouter;

  });