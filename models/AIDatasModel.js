// 评估相关数据
// ======================
define(["jquery", "backbone"], function($, Backbone) {
    // The Model constructor
    var Model = Backbone.Model.extend({
        idAttribute: "_id",
    });

    // Returns the Model class
    return Model;
})