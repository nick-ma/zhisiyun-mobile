// ScoringFormula Collection 计分公式
// =============================

// Includes file dependencies
define(["jquery", "backbone", "models/ScoringFormulaModel"], function($, Backbone, ScoringFormulaModel) {

    // Extends Backbone.Router
    var Collection = Backbone.Collection.extend({

        // The Collection constructor
        initialize: function(models, options) {

        },
        url: function() {

            return '/admin/pm/scoring_formula_client/get_data_4m' + '?ct=' + (new Date()).getTime();
        },
        // Sets the Collection model property to be a ScoringFormula Model
        model: ScoringFormulaModel,
    });
    // Returns the Model class
    return Collection;

});