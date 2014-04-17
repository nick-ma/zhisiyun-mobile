// Mobile Router
// =============

// Includes file dependencies
define(["jquery", "backbone",
    "../models/CategoryModel", "../collections/CategoriesCollection", "../views/CategoryView",
    "../models/TaskModel", "../collections/TaskCollection", "../views/TaskView"

  ],
  function($, Backbone,
    CategoryModel, CategoriesCollection, CategoryView,
    TaskModel, TaskCollection, TaskView
  ) {

    // Extends Backbone.Router
    var CategoryRouter = Backbone.Router.extend({

      // The Router constructor
      initialize: function() {

        // Instantiates a new Animal Category View
        this.animalsView = new CategoryView({
          el: "#animals",
          collection: new CategoriesCollection([], {
            type: "animals"
          })
        });

        // Instantiates a new Colors Category View
        this.colorsView = new CategoryView({
          el: "#colors",
          collection: new CategoriesCollection([], {
            type: "colors"
          })
        });

        // Instantiates a new Vehicles Category View
        this.vehiclesView = new CategoryView({
          el: "#vehicles",
          collection: new CategoriesCollection([], {
            type: "vehicles"
          })
        });

        this.taskView = new TaskView({
          el: "#task",
          collection: new TaskCollection()
        });

        // Tells Backbone to start watching for hashchange events
        Backbone.history.start();

      },

      // Backbone.js Routes
      routes: {

        // When there is no hash bang on the url, the home method is called
        "": "home",

        // When #category? is on the url, the category method is called
        "category?:type": "category",
        "task": "task",
        "task?:task_id": "task_detail",

      },

      // Home method
      home: function() {

        // Programatically changes to the categories page
        $.mobile.changePage("#categories", {
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
        $.mobile.changePage("#task_detail", {
          reverse: false,
          changeHash: false
        });
      }

    });

    // Returns the Router class
    return CategoryRouter;

  });