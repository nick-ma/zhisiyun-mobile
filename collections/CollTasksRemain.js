// Coll Task Collection 协作任务
// ===================

// Includes file dependencies
define(["jquery", "backbone", "models/CollTaskModel"], function($, Backbone, CollTaskModel) {

    // Extends Backbone.Router
    var Collection = Backbone.Collection.extend({

        // The Collection constructor
        initialize: function(models, options) {
            this.date_offset = 30; //默认取30天
        },
        url: function() {
            return '/admin/pm/coll_task/bb_remain?date_offset=' + this.date_offset + '&ts=' + (new Date()).getTime();
        },
        // Sets the Collection model property to be a Task Model
        model: CollTaskModel,
    });

    // Returns the Model class
    return Collection;

});