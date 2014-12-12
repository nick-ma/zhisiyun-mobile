// 报数项目 Collection 报数定义数据集合
// =============================

// Includes file dependencies
define(["jquery", "backbone", "models/CountNumberItemModel"], function($, Backbone, CountNumberItemModel) {

    // Extends Backbone.Router
    var Collection = Backbone.Collection.extend({

        // The Collection constructor
        initialize: function(models, options) {
        },
        url: function() {

            return '/admin/pm/count_number_item/bb';
        },
        // Sets the Collection model property to be a CountNumberItem Model
        model: CountNumberItemModel,
    });
    // Returns the Model class
    return Collection;

});