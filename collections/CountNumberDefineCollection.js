// 人员定义 Collection 报数定义数据集合
// =============================

// Includes file dependencies
define(["jquery", "backbone", "models/CountNumberDefineModel"], function($, Backbone, CountNumberDefineModel) {

    // Extends Backbone.Router
    var Collection = Backbone.Collection.extend({

        // The Collection constructor
        initialize: function(models, options) {
        },
        url: function() {

            return '/admin/pm/count_number_define/bb';
        },
        // Sets the Collection model property to be a Assessment Model
        model: CountNumberDefineModel,
    });
    // Returns the Model class
    return Collection;

});