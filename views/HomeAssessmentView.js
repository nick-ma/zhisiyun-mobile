// Assessment View
// =============

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "models/AssessmentModel"],
    function($, _, Backbone, Handlebars, AssessmentModel) {
        
        // Extends Backbone.View
        var AssessmentView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                this.template = Handlebars.compile($("#hbtmp_home_assessment_view").html());
                // The render method is called when Assessment Models are added to the Collection
                this.collection.on("sync", this.render, this);

            },

            // Renders all of the Assessment models on the UI
            render: function() {

                var self = this;

                var rendered = [];
                _.each(this.collection.models, function(x) {
                    x.attributes.pi_count = x.attributes.qualitative_pis.items.length + x.attributes.quantitative_pis.items.length;
                    rendered.push(self.template(x.attributes));
                });

                $("#home-assessment-list").html(rendered.join(''));
                $("#home-assessment-list").trigger('create');
                return this;

            }

        });

        // Returns the View class
        return AssessmentView;

    });