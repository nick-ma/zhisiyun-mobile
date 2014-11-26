// pa demotion Collection 人员降级数据集合
// =============================

// Includes file dependencies
define(["jquery", "backbone", "models/PADemotionModel"], function($, Backbone, PADemotionModel) {

    // Extends Backbone.Router
    var Collection = Backbone.Collection.extend({

        // The Collection constructor
        initialize: function(models, options) {
        },
        url: function() {

            return '/admin/pa/wf/demotion/bb';
        },
        // Sets the Collection model property to be a Assessment Model
        model: PADemotionModel,
    });
    // Returns the Model class
    return Collection;

});