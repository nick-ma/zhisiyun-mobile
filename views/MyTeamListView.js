// MyTeam List View 
// =================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "moment"],
    function($, _, Backbone, Handlebars) {

        // Extends Backbone.View
        var MyTeamListView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                this.template = Handlebars.compile($("#hbtmp_myteam_list_view").html());
                // The render method is called when MyTeamList Models are added to the Collection
                this.collection.on("sync", this.render, this);

            },

            // Renders all of the MyTeamList models on the UI
            render: function() {
                var self = this;
                // var rendered = [];
                var people = _.sortBy(_.compact(_.map(this.collection.models, function(x) {
                    if (x.get('myteam')) {
                        return x.toJSON();
                    }
                })), function(x) {
                    return x.people_no;
                });


                $("#myteam_list-content").html(self.template({
                    people: people
                }));
                $("#myteam_list-content").trigger('create');
                return this;

            }

        });

        // Returns the View class
        return MyTeamListView;

    });