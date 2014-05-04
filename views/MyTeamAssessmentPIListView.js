// MyTeam Assessment PI List View
// =========================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "models/AssessmentModel"],
    function($, _, Backbone, Handlebars, AssessmentModel) {

        // Extends Backbone.View
        var MyTeamAssessmentView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                this.template = Handlebars.compile($("#hbtmp_myteam_assessment_pi_list_view").html());
                // The render method is called when Assessment Models are added to the Collection
                // this.collection.on("sync", this.render, this);

            },

            // Renders all of the Assessment models on the UI
            render: function(people_id) {

                var self = this;
                var render_data = self.model.toJSON();
                render_data.people_id = people_id;
                $("#myteam_assessment_pi-list-content").html(self.template(render_data));
                $("#myteam_assessment_pi-list-content").trigger('create');

                $("#btn-myteam_assessment_pi-list-back").attr('href', '#myteam_detail/' + people_id + '/assessment')
                return this;

            }

        });

        // Returns the View class
        return MyTeamAssessmentView;

    });