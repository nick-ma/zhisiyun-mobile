// Assessment View 绩效合同的单条指标查看页面
// =====================================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "moment", "models/AssessmentModel"], function($, _, Backbone, Handlebars, moment, AssessmentModel) {

    // Extends Backbone.View
    var AssessmentDetailView = Backbone.View.extend({
        // The View Constructor
        initialize: function() {
            this.template = Handlebars.compile($("#hbtmp_task_detail_view").html());
            this.bind_events();
            // The render method is called when Assessment Models are added to the Collection
            // this.model.on("sync", this.render, this);

        },

        // Renders all of the Assessment models on the UI
        render: function() {
            var self = this;

            $("#btn-task-edit").attr('href', "#task_edit/" + self.model.get('_id'));
            $("#task_detail-content").html(self.template(self.model.attributes));
            $("#task_detail-content").trigger('create');
            // Maintains chainability
            return this;

        },

        bind_events: function() {
            var self = this;
            self.$el
                .on('click', '#btn-task-markcomplete', function(event) {
                    event.preventDefault();
                    self.model.set('is_complete', true);
                    self.model.save().done(function() {
                        $.mobile.changePage("#task", {
                            reverse: false,
                            changeHash: false,
                            transition: "flip",
                        });
                    });
                });
        }


    });

    // Returns the View class
    return AssessmentDetailView;

});