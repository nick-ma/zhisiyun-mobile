// Assessment V Collection 绩效合同的数据版本，用来比较服务器上的数据版本是否与本地的一致。
// =============================================================================

// Includes file dependencies
define(["jquery", "backbone", "models/AssessmentVModel"], function($, Backbone, AssessmentVModel) {

    // Extends Backbone.Router
    var Collection = Backbone.Collection.extend({

        // The Collection constructor
        initialize: function(models, options) {


        },
        url: function() {

            return '/admin/pm/assessment_instance/get_my_assessments_v_4m' + '?ct=' + (new Date()).getTime();
        },

        // Sets the Collection model property to be a Assessment Model
        model: AssessmentVModel,
    });
    // Returns the Model class
    return Collection;

});