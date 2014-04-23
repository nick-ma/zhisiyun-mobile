// Contact List View
// =================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "models/PeopleModel"],
    function($, _, Backbone, Handlebars, PeopleModel) {
        
        // Extends Backbone.View
        var ContactListView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                this.template = Handlebars.compile($("#hbtmp_contact_list_view").html());
                // The render method is called when Contact Models are added to the Collection
                this.collection.on("sync", this.render, this);

            },

            // Renders all of the Contact models on the UI
            render: function() {

                var self = this;

                // var rendered = ;
                var render_data = {
                    people: _.map(this.collection.models,function  (x) {
                        return x.toJSON();
                    })
                }
                // _.each(this.collection.models, function(x) {
                //     x.attributes.pi_count = x.attributes.qualitative_pis.items.length + x.attributes.quantitative_pis.items.length;
                //     rendered.push(self.template(x.attributes));
                // });
                // self.template(render_data);
                $("#contact_list-content").html(self.template(render_data));
                $("#contact_list-content").trigger('create');
                return this;

            }

        });

        // Returns the View class
        return ContactListView;

    });