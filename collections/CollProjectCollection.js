// Coll Project Collection 项目
// ===========================

// Includes file dependencies
define(["jquery", "backbone", "models/CollProjectModel"], function($, Backbone, CollProjectModel) {

    // Extends Backbone.Router
    var Collection = Backbone.Collection.extend({

        // The Collection constructor
        initialize: function(models, options) {

        },
        url: function() {
            return '/admin/pm/coll_project/bb' + '?ct=' + (new Date()).getTime();
        },
        // Sets the Collection model property to be a Task Model
        model: CollProjectModel,
    });

    // Returns the Model class
    return Collection;

});