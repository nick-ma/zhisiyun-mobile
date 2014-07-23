// Contact Detail View
// ===================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "models/PeopleModel"],
    function($, _, Backbone, Handlebars, PeopleModel) {

        // Extends Backbone.View
        var ContactDetailView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                this.template = Handlebars.compile($("#hbtmp_contact_detail_view").html());
                // The render method is called when People Models are added to the Collection
                // this.collection.on("sync", this.render, this);

            },

            // Renders all of the People models on the UI
            render: function() {

                var self = this;
                var contact_detail_back_url = localStorage.getItem('contact_detail_back_url') || '#contact_list';
                // console.log(localStorage.getItem('contact_detail_back_url'));
                // console.log(contact_detail_back_url);
                localStorage.removeItem('contact_detail_back_url');
                $("#btn-contact_detail-back").attr('href', contact_detail_back_url);
                $("#contact_detail-content").html(self.template(self.model.attributes));
                $("#contact_detail-content").trigger('create');
                return this;

            }

        });

        // Returns the View class
        return ContactDetailView;

    });