// People Collection 企业人员
// =========================

// Includes file dependencies
define(["jquery", "backbone", "models/PeopleModel"], function($, Backbone, PeopleModel) {

    // Extends Backbone.Router
    var Collection = Backbone.Collection.extend({

        // The Collection constructor
        initialize: function(models, options) {

        },
        url: function() {
            return '/admin/masterdata/people/people_list4m' + '?ct=' + (new Date()).getTime();
        },

        // Sets the Collection model property to be a People Model
        model: PeopleModel,
    });

    // Returns the Model class
    return Collection;

});