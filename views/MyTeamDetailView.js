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
            render: function() {
                var self = this;
                $("#myteam_detail-basic-content").html(self.template(self.model.toJSON()));
                $("#myteam_detail-basic-content").trigger('create');
                return this;
            }

        });

        // Returns the View class
        return MyTeamDetailView;

    });