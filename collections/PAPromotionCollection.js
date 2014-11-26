// pa promotion Collection 人员晋升数据集合
// =============================

// Includes file dependencies
define(["jquery", "backbone", "models/PAPromotionModel"], function($, Backbone, PAPromotionModel) {

    // Extends Backbone.Router
    var Collection = Backbone.Collection.extend({

        // The Collection constructor
        initialize: function(models, options) {
        },
        url: function() {

            return '/admin/pa/wf/promotion/bb';
        },
        // Sets the Collection model property to be a Assessment Model
        model: PAPromotionModel,
    });
    // Returns the Model class
    return Collection;

});