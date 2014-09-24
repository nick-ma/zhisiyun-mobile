// Includes file dependencies
define(["jquery", "backbone", "../models/SuperiorTwitterModel"], function($, Backbone, SuperiorTwitterModel) {
    // Extends Backbone.Router
    var Collection = Backbone.Collection.extend({
        url: function() {
            return '/admin/pm/talent_wf/superior4m';
        },

        // Sets the Collection model property to be a DevelopePlanModel
        model: SuperiorTwitterModel,
    });

    // Returns the Model class
    return Collection;

});