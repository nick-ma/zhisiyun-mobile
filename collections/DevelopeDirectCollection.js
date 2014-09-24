// Includes file dependencies
define(["jquery", "backbone", "../models/DevelopeDirectModel"], function($, Backbone, DevelopeDirectModel) {
    // Extends Backbone.Router
    var Collection = Backbone.Collection.extend({
        url: function() {
            return '/admin/pm/develope_direct/bb';
        },

        // Sets the Collection model property to be a DevelopePlanModel
        model: DevelopeDirectModel,
    });

    // Returns the Model class
    return Collection;

});