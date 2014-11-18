// Assessment Collection 绩效合同
// =============================

// Includes file dependencies
define(["jquery", "backbone", "models/AssessmentReviewModel"], function($, Backbone, AssessmentReviewModel) {

    // Extends Backbone.Router
    var Collection = Backbone.Collection.extend({

        // The Collection constructor
        initialize: function(models, options) {
        },
        url: function() {

            return '/admin/pm/assessment_instance/review/bb';
        },
        // Sets the Collection model property to be a Assessment Model
        model: AssessmentReviewModel,
    });
    // Returns the Model class
    return Collection;

});