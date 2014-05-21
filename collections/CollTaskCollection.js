// Coll Task Collection 协作任务
// ===================

// Includes file dependencies
define(["jquery", "backbone", "models/CollTaskModel"], function($, Backbone, CollTaskModel) {

    // Extends Backbone.Router
    var Collection = Backbone.Collection.extend({

        // The Collection constructor
        initialize: function(models, options) {

        },
        url: function() {
            return '/admin/pm/coll_task/bb' + '?ct=' + (new Date()).getTime();
        },
        // Sets the Collection model property to be a Task Model
        model: CollTaskModel,
    });

    // Returns the Model class
    return Collection;

});