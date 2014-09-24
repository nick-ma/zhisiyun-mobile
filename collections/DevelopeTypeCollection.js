// Includes file dependencies
define(["jquery", "backbone", "../models/DevelopeTypeModel"], function($, Backbone, DevelopeTypeModel) {
    // Extends Backbone.Router
    var Collection = Backbone.Collection.extend({
        url: function() {
            return '/admin/pm/talent_develope/plan';
        },

        // Sets the Collection model property to be a DevelopePlanModel
        model: DevelopeTypeModel,
    });

    // Returns the Model class
    return Collection;

});