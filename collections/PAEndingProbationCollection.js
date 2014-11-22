// pa ending probation Collection 人员转正集合
// =============================

// Includes file dependencies
define(["jquery", "backbone", "models/PAEndingProbation"], function($, Backbone, PAEndingProbation) {

    // Extends Backbone.Router
    var Collection = Backbone.Collection.extend({

        // The Collection constructor
        initialize: function(models, options) {
        },
        url: function() {

            return '/admin/pa/wf/ending_probation_hr/bb';
        },
        // Sets the Collection model property to be a Assessment Model
        model: PAEndingProbation,
    });
    // Returns the Model class
    return Collection;

});