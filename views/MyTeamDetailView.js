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
                this.bind_event();

            },

            // Renders all of the People models on the UI
            render: function() {
                var self = this;
                var render_data = self.model.toJSON();
                render_data.competencies = (self.competency) ? self.competency.get('competencies') : [];
                render_data.payrolls = (self.payroll) ? _.map(self.payroll.models, function(x) {
                    return x.toJSON();
                }) : [];
                // console.log(render_data.payrolls);
                $("#myteam_detail-basic-content").html(self.template(render_data));
                $("#myteam_detail-basic-content").trigger('create');
                return this;
            },
            bind_event: function() {
                var self = this;
                $("#myteam_detail-basic-content").on('click', '#btn_start_userchat', function(event) {
                    event.preventDefault();
                    var url = 'im://userchat/' + self.model.get('_id');
                    window.location.href = url;
                });
            }

        });

        // Returns the View class
        return MyTeamDetailView;

    });