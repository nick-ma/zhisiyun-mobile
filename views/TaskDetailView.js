// Task View
// =============

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "models/TaskModel", "jqmcal", "formatdate"], function($, _, Backbone, Handlebars, TaskModel) {

    // Extends Backbone.View
    var TaskDetailView = Backbone.View.extend({
        // The View Constructor
        initialize: function() {
            // this.template = Handlebars.compile($("script#taskItems").html());

            // The render method is called when Task Models are added to the Collection
            // this.model.on("sync", this.render, this);
            
        },

        // Renders all of the Task models on the UI
        render: function() {
            var self = this;
            console.log(self.model);

            // Maintains chainability
            return this;

        }

    });

    // Returns the View class
    return TaskDetailView;

});