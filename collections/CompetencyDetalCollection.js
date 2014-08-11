// Competency Collection 企业人员
// =========================

// Includes file dependencies
define(["jquery", "backbone", "models/CompetencyModel"], function($, Backbone, CompetencyModel) {

    // Extends Backbone.Router
    var Collection = Backbone.Collection.extend({

        // The Collection constructor
        initialize: function(models, options) {

        },
        url: function() {
            return '/admin/om/competency_client/bb';
        },
        // Sets the Collection model property to be a Competency Model
        model: CompetencyModel,
    });

    // Returns the Model class
    return Collection;

});