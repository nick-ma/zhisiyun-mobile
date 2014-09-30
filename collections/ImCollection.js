// Includes file dependencies
define(["jquery", "backbone", "models/ImModel"], function($, Backbone, ImModel) {

    // Extends Backbone.Router
    var Collection = Backbone.Collection.extend({

        // The Collection constructor
        initialize: function(models, options) {

        },
        url: function() {
            return '/admin/im/list_json';
        },

        // Sets the Collection model property to be a People Model
        model: ImModel,
    });

    // Returns the Model class
    return Collection;

});