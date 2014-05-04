// MyTeamAll List View
// =================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "models/PeopleModel"],
    function($, _, Backbone, Handlebars, PeopleModel) {

        // Extends Backbone.View
        var MyTeamAllListView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                this.template = Handlebars.compile($("#hbtmp_myteam_all_list_view").html());
                // The render method is called when MyTeamAll Models are added to the Collection
                this.collection.on("sync", this.render, this);

            },

            // Renders all of the MyTeamAll models on the UI
            render: function() {

                var self = this;

                // var rendered = ;
                var render_data = {
                    people: _.sortBy(_.compact(_.map(this.collection.models, function(x) {
                        if (x.get('myteama')) {
                            return x.toJSON();
                        }
                    })), function(x) {
                        return x.fl;
                    })
                }
                // _.each(this.collection.models, function(x) {
                //     x.attributes.pi_count = x.attributes.qualitative_pis.items.length + x.attributes.quantitative_pis.items.length;
                //     rendered.push(self.template(x.attributes));
                // });
                // self.template(render_data);
                $("#myteam_all_list-content").html(self.template(render_data));
                $("#myteam_all_list-content").trigger('create');
                return this;

            }

        });

        // Returns the View class
        return MyTeamAllListView;

    });