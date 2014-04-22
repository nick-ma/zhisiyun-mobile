// Assessment Collection 绩效合同
// =============================

// Includes file dependencies
define(["jquery", "backbone", "models/AssessmentModel"], function($, Backbone, AssessmentModel) {

    // Extends Backbone.Router
    var Collection = Backbone.Collection.extend({

        // The Collection constructor
        initialize: function(models, options) {


        },
        url: '/admin/pm/assessment_instance/get_my_assessments_4m',
        // Sets the Collection model property to be a Assessment Model
        model: AssessmentModel,
    });
    // Returns the Model class
    return Collection;

});