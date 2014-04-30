// Competency Scores  View
// =======================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "models/PeopleModel"],
    function($, _, Backbone, Handlebars, PeopleModel) {

        // Extends Backbone.View
        var CompetencyScoresView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                this.template = Handlebars.compile($("#hbtmp_competency_scores_view").html());
                // The render method is called when People Models are added to the Collection
                // this.collection.on("sync", this.render, this);

            },

            // Renders all of the People models on the UI
            render: function(people_id, cid) {
                var self = this;
                var render_data = _.find(self.model.get('competencies'), function(x) {
                    return x._id == cid;
                });
                if (people_id == 'self') { //根据不同的来源设置返回的页面
                    $("#btn-competency_scores-back").attr('href', '#myprofile');
                } else {
                    $("#btn-competency_scores-back").attr('href', '#myteam_detail/' + people_id + '/basic');

                };
                render_data.people_id = people_id;
                $("#competency_scores-content").html(self.template(render_data));
                $("#competency_scores-content").trigger('create');
                return this;
            }

        });

        // Returns the View class
        return CompetencyScoresView;

    });