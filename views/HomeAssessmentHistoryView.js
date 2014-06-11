// Assessment History View
// =========================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "models/AssessmentModel"],
    function($, _, Backbone, Handlebars, AssessmentModel) {

        // Extends Backbone.View
        var AssessmentView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                this.template = Handlebars.compile($("#hbtmp_assessment_history_view").html());
                // The render method is called when Assessment Models are added to the Collection
                // this.collection.on("sync", this.render, this);

            },

            // Renders all of the Assessment models on the UI
            render: function() {

                var self = this;

                var rendered = [];
                var aihs = _.filter(this.collection.models, function(x) {
                    return (parseInt(x.get('ai_status')) >= 9); //找出来“考核完成”的合同
                })
                // aihs = _.sortBy(aihs, function(x) {
                //     return -(new Date(x.get('periodFrom')));
                // });
                _.each(aihs, function(x) {
                    // x.attributes.pi_count = x.attributes.qualitative_pis.items.length + x.attributes.quantitative_pis.items.length;
                    rendered.push(self.template(x.attributes));
                });
                $("#home-assessment_history-num").html(aihs.length);
                $("#home-assessment_history-list").html(rendered.join(''));
                $("#home-assessment_history-list").trigger('create');
                return this;

            }

        });

        // Returns the View class
        return AssessmentView;

    });