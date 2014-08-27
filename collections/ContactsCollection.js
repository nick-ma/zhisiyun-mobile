// Includes file dependencies
define(["jquery", "backbone", "../models/ContactModel"], function($, Backbone, ContactModel) {
    // Extends Backbone.Router
    var Collection = Backbone.Collection.extend({
        url: function() {
            return '/admin/pm/coll_project_contact/bb';
        },

        // Sets the Collection model property to be a People Model
        model: ContactModel,
    });

    // Returns the Model class
    return Collection;

});