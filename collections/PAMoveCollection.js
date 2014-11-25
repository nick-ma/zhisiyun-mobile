// pa move Collection 人员平调数据集合
// =============================

// Includes file dependencies
define(["jquery", "backbone", "models/PAMoveModel"], function($, Backbone, PAMoveModel) {

    // Extends Backbone.Router
    var Collection = Backbone.Collection.extend({

        // The Collection constructor
        initialize: function(models, options) {
        },
        url: function() {

            return '/admin/pa/wf/move/bb';
        },
        // Sets the Collection model property to be a Assessment Model
        model: PAMoveModel,
    });
    // Returns the Model class
    return Collection;

});