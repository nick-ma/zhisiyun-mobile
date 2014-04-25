// Task Collection 个人工作日历
// ===================

// Includes file dependencies
define(["jquery", "backbone", "models/TaskModel"], function($, Backbone, TaskModel) {

    // Extends Backbone.Router
    var Collection = Backbone.Collection.extend({

        // The Collection constructor
        initialize: function(models, options) {
            
        },
        url: '/admin/pm/work_plan/bb4m',
        // Sets the Collection model property to be a Task Model
        model: TaskModel,
    });

    // Returns the Model class
    return Collection;

});