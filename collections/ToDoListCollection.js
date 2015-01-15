// ToDoList Collection 我的待办
// ===================

// Includes file dependencies
define(["jquery", "backbone", "models/ToDoModel"], function($, Backbone, ToDoModel) {

    // Extends Backbone.Router
    var Collection = Backbone.Collection.extend({

        // The Collection constructor
        initialize: function(models, options) {

        },
        url: function() {
            return '/admin/wf/todo_list_bb?ts=' + (new Date()).getTime();
        },
        // Sets the Collection model property to be a Task Model
        model: ToDoModel,
    });

    // Returns the Model class
    return Collection;

});