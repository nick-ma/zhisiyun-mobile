// Includes file dependencies
define(["jquery", "backbone"], function($, Backbone, ToDoModel) {

    // Extends Backbone.Router
    var Collection = Backbone.Collection.extend({

        // The Collection constructor
        initialize: function(models, options) {
            this.date_offset = 30; //默认取30天
        },
        url: function() {
            return '/admin/wf/finished_list_bb?date_offset=' + this.date_offset;
        },
    });

    // Returns the Model class
    return Collection;

});