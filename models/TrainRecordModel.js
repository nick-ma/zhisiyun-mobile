// TrainRecord Model, 人员培训记录
// ======================
define(["jquery", "backbone"], function($, Backbone) {
    // The Model constructor
    var Model = Backbone.Model.extend({
        idAttribute: "_id",
        // rootUrl: '/admin/masterdata/people/people4m',
        url: function() { //不需要进行数据更新，仅仅作为model来存储数据。
            return '/admin/course/train_record/bb';
        },
        validate: function(attrs, options) {

        }
    });

    // Returns the Model class
    return Model;
})