// Assessment PI List View
// =========================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "models/AssessmentModel"],
    function($, _, Backbone, Handlebars, AssessmentModel) {

        // Extends Backbone.View
        var AssessmentView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                this.template = Handlebars.compile($("#hbtmp_assessment_pi_list_view").html());
                // The render method is called when Assessment Models are added to the Collection
                // this.collection.on("sync", this.render, this);

            },

            // Renders all of the Assessment models on the UI
            render: function() {

                var self = this;

                $("#assessment_pi-list-content").html(self.template(self.model.attributes));
                $("#assessment_pi-list-content").trigger('create');
                return this;

            }

        });

        // Returns the View class
        return AssessmentView;

    });