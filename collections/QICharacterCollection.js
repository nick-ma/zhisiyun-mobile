// =========================

// Includes file dependencies
define(["jquery", "backbone"], function($, Backbone) {

    // Extends Backbone.Router
    var Collection = Backbone.Collection.extend({

        // The Collection constructor
        initialize: function(models, options) {

        },
        url: function() {
            return '/admin/pm/questionnair_template/get_character_qi_mobile_json/' + this.pp_id;
        },

        // Sets the Collection model property to be a People Model
        // model: Questionnair360Model,
    });

    // Returns the Model class
    return Collection;

});