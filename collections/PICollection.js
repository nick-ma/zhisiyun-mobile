// Includes file dependencies
define(["jquery", "backbone"], function($, Backbone) {

    // Extends Backbone.Router
    var Collection = Backbone.Collection.extend({
        url: function() {

            return '/admin/pm/assessment_instance/pis_bb';
        },
    });
    // Returns the Model class
    return Collection;

});