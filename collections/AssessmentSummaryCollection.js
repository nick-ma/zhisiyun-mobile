// Assessment Collection 绩效合同
// =============================

// Includes file dependencies
define(["jquery", "backbone", "models/AssessmentSummaryModel"], function($, Backbone, AssessmentSummaryModel) {

    // Extends Backbone.Router
    var Collection = Backbone.Collection.extend({

        // The Collection constructor
        initialize: function(models, options) {
        },
        url: function() {

            return '/admin/pm/assessment_instance/summary/bb';
        },
        // Sets the Collection model property to be a Assessment Model
        model: AssessmentSummaryModel,
    });
    // Returns the Model class
    return Collection;

});