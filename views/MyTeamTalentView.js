// MyTeam Talent View
// ===================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars"],
    function($, _, Backbone, Handlebars) {

        // Extends Backbone.View
        var MyTeamTalentView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                this.template = Handlebars.compile($("#hbtmp_myteam_detail_talent_view").html());
                // The render method is called when People Models are added to the Collection
                // this.collection.on("sync", this.render, this);
                this.bind_event();
            },

            // Renders all of the People models on the UI
            render: function(people_name) {
                var self = this;
                var render_data = self.model.toJSON();
                render_data.people_name = people_name;
                $("#myteam_detail-talent-content").html(self.template(render_data));
                $("#myteam_detail-talent-content").trigger('create');
                return this;
            },
            bind_event: function() {
                $("#myteam_detail-talent")
                    .on('swiperight', function(event) { //向右滑动，打开左边的面板
                        event.preventDefault();
                        $("#myteam_detail-talent-left-panel").panel("open");
                    })
            }

        });

        // Returns the View class
        return MyTeamTalentView;

    });