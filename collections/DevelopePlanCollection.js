// Includes file dependencies
define(["jquery", "backbone", "../models/DevelopePlanModel"], function($, Backbone, DevelopePlanModel) {
    // Extends Backbone.Router
    var Collection = Backbone.Collection.extend({
        url: function() {
            return '/admin/pm/talent_develope/plan';
        },

        // Sets the Collection model property to be a DevelopePlanModel
        model: DevelopePlanModel,
    });

    // Returns the Model class
    return Collection;

});