// Includes file dependencies
define(["jquery", "backbone", "../models/DevelopeCheckModel"], function($, Backbone, DevelopeCheckModel) {
    // Extends Backbone.Router
    var Collection = Backbone.Collection.extend({
        url: function() {
            return '/admin/pm/talent_develope/check_bb';
        },

        // Sets the Collection model property to be a DevelopePlanModel
        model: DevelopeCheckModel,
    });

    // Returns the Model class
    return Collection;

});