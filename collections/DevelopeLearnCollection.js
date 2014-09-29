// Includes file dependencies
define(["jquery", "backbone", "../models/DevelopeLearnModel"], function($, Backbone, DevelopeLearnModel) {
    // Extends Backbone.Router
    var Collection = Backbone.Collection.extend({
        url: function() {
            return '/admin/pm/talent_develope/learn_bb';
        },

        // Sets the Collection model property to be a DevelopePlanModel
        model: DevelopeLearnModel,
    });

    // Returns the Model class
    return Collection;

});