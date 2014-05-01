// MyTeam Assessment View
// ===================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars"],
    function($, _, Backbone, Handlebars) {

        // Extends Backbone.View
        var MyTeamAssessmentView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                this.template = Handlebars.compile($("#hbtmp_myteam_detail_assessment_view").html());
                // The render method is called when People Models are added to the Collection
                // this.collection.on("sync", this.render, this);

            },

            // Renders all of the People models on the UI
            render: function(people_id, people_name) {
                var self = this;
                var render_data = {};
                render_data.people_id = people_id;
                render_data.people_name = people_name;
                render_data.assessment_wip = _.map(_.filter(this.collection.models, function(x) {
                    return (parseInt(x.get('ai_status')) >= 4 && parseInt(x.get('ai_status')) < 9); //找出来“执行中”的合同
                }), function(t) {
                    return t.toJSON();
                })
                render_data.assessment_history = _.map(_.filter(this.collection.models, function(x) {
                    return (parseInt(x.get('ai_status')) >= 9); //找出来“考核完成”的合同
                }), function(t) {
                    return t.toJSON();
                })
                $("#myteam_detail-assessment-content").html(self.template(render_data));
                $("#myteam_detail-assessment-content").trigger('create');
                return this;
            }

        });

        // Returns the View class
        return MyTeamAssessmentView;

    });