// Task View
// =============

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "moment", "models/TaskModel", "jqmcal", "formatdate"], function($, _, Backbone, Handlebars, moment, TaskModel) {

    // Extends Backbone.View
    var TaskDetailView = Backbone.View.extend({
        // The View Constructor
        initialize: function() {
            this.template = Handlebars.compile($("#hbtmp_task_detail_view").html());

            // The render method is called when Task Models are added to the Collection
            // this.model.on("sync", this.render, this);

        },

        // Renders all of the Task models on the UI
        render: function() {
            var self = this;

            $("#btn-task-edit").attr('href', "#task_edit?" + self.model.get('_id'));
            $("#task_detail-content").html(self.template(self.model.attributes));
            $("#task_detail-content").trigger('create');
            // Maintains chainability
            return this;

        },

        bind_events: function() {
            var self = this;
            
        }


    });

    // Returns the View class
    return TaskDetailView;

});