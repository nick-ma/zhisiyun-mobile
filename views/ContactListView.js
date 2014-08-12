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
                // this.collection.on("sync", this.render, this);
                this.filter_mode = 'favorite'; //默认是all
                this.bind_event();
            },

            // Renders all of the Contact models on the UI
            render: function() {

                var self = this;
                // console.log(self.filter_mode);
                // var rendered = ;
                var render_data = {
                    people: _.sortBy(_.map(this.collection.models, function(x) {
                        return x.toJSON();
                    }), function(x) {
                        return x.fl;
                    })
                }
                if (self.filter_mode == 'favorite') {
                    render_data.people = _.filter(render_data.people, function(x) {
                        return x.is_my_favorite;
                    })
                };
                // _.each(this.collection.models, function(x) {
                //     x.attributes.pi_count = x.attributes.qualitative_pis.items.length + x.attributes.quantitative_pis.items.length;
                //     rendered.push(self.template(x.attributes));
                // });
                // self.template(render_data);
                $("#contact_list-content").html(self.template(render_data));
                $("#contact_list-content").trigger('create');
                // 
                if (self.filter_mode == 'all') {
                    $("#contact_list").find("#btn_filter_all").addClass('ui-btn-active');
                    $("#contact_list").find("#btn_filter_my_favorite").removeClass('ui-btn-active');
                } else {
                    $("#contact_list").find("#btn_filter_all").removeClass('ui-btn-active');
                    $("#contact_list").find("#btn_filter_my_favorite").addClass('ui-btn-active');
                };
                // self.rendered = true;
                return this;

            },
            bind_event: function() {
                var self = this;
                $("#contact_list")
                    .on('click', '#btn_filter_all', function(event) {
                        event.preventDefault();
                        self.filter_mode = 'all';
                        self.render();
                    })
                    .on('click', '#btn_filter_my_favorite', function(event) {
                        event.preventDefault();
                        self.filter_mode = 'favorite';
                        self.render();
                    });
            }

        });

        // Returns the View class
        return ContactListView;

    });