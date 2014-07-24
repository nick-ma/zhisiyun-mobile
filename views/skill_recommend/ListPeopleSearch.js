// Contact List View
// =================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "models/PeopleModel"],
    function($, _, Backbone, Handlebars, PeopleModel) {

        // Extends Backbone.View
        var ListPeoplesSearchView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                this.template = Handlebars.compile($("#show_peoples_search_view").html());
                // The render method is called when Contact Models are added to the Collection

            },

            // Renders all of the Contact models on the UI
            render: function() {

                var self = this;
                var render_data = {
                    people: _.sortBy(_.map(this.collection.models, function(x) {
                        return x.toJSON();
                    }), function(x) {
                        return x.fl;
                    })
                }
                $("#show_peoples_search-content").html(self.template(render_data));
                $("#show_peoples_search-content").trigger('create');
                return this;

            }

        });

        // Returns the View class
        return ListPeoplesSearchView;

    });