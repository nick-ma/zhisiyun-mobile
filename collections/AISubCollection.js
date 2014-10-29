// Includes file dependencies
define(["jquery", "backbone"], function($, Backbone) {

    // Extends Backbone.Router
    var Collection = Backbone.Collection.extend({

        url: function() {
            var url = '/admin/pm/assessment_instance/sub_ai_data_bb?period=' + this.period + '&position=' + this.position;
            return url;
        },
    });
    // Returns the Model class
    return Collection;

});