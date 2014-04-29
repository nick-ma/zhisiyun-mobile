// MyTeam Detail View
// ===================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "models/PeopleModel"],
    function($, _, Backbone, Handlebars, PeopleModel) {

        // Extends Backbone.View
        var MyTeamDetailView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                this.template = Handlebars.compile($("#hbtmp_myteam_detail_basic_view").html());
                // The render method is called when People Models are added to the Collection
                // this.collection.on("sync", this.render, this);

            },

            // Renders all of the People models on the UI
            render: function(m_payroll, m_competenty) {
                var self = this;
                var render_data = self.model.toJSON();
                render_data.competencies = m_competenty.get('competencies')
                render_data.payrolls = _.map(m_payroll.models,function  (x) {
                    return x.toJSON();
                });
                // console.log(render_data.payrolls);
                $("#myteam_detail-basic-content").html(self.template(render_data));
                $("#myteam_detail-basic-content").trigger('create');
                return this;
            }

        });

        // Returns the View class
        return MyTeamDetailView;

    });