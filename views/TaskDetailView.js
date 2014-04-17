// Task View
// =============

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "moment", "models/TaskModel", "jqmcal", "formatdate"], function($, _, Backbone, Handlebars, moment, TaskModel) {

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
            var $form = $("#task-detail")
            $form.find("#task-title").val(self.model.get('title'));
            $form.find("#task-description").val(self.model.get('description'));
            $form.find("#task-start").val(moment(self.model.get('start')).format('YYYY-MM-DDTHH:mm'));
            $form.find("#task-end").val(moment(self.model.get('end')).format('YYYY-MM-DDTHH:mm'));
            console.log(self.model);

            // Maintains chainability
            return this;

        }

    });

    // Returns the View class
    return TaskDetailView;

});