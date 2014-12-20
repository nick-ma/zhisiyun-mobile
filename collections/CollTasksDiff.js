// Coll Task Collection 协作任务
// ===================

// Includes file dependencies
define(["jquery", "backbone", "models/CollTaskModel"], function($, Backbone, CollTaskModel) {

    // Extends Backbone.Router
    var Collection = Backbone.Collection.extend({

        // The Collection constructor
        initialize: function(models, options) {
            this.last_fetch_ts = 0; //
        },
        url: function() {
            return '/admin/pm/coll_task/bb_diff?last_fetch_ts=' + this.last_fetch_ts + '&ts=' + (new Date()).getTime();
        },
        // Sets the Collection model property to be a Task Model
        model: CollTaskModel,
    });

    // Returns the Model class
    return Collection;

});