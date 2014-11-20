// Assessment Collection 绩效申诉
// =============================

// Includes file dependencies
define(["jquery", "backbone", "models/AssessmentAppealModel"], function($, Backbone, AssessmentAppealModel) {

    // Extends Backbone.Router
    var Collection = Backbone.Collection.extend({

        // The Collection constructor
        initialize: function(models, options) {
        },
        url: function() {

            return '/admin/pm/assessment_instance/appeal/bb';
        },
        // Sets the Collection model property to be a Assessment Model
        model: AssessmentAppealModel,
    });
    // Returns the Model class
    return Collection;

});