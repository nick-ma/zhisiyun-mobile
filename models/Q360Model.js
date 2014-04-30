// 306问卷 Model, 人员
// ======================
define(["jquery", "backbone"], function($, Backbone) {
    // The Model constructor
    var Model = Backbone.Model.extend({
        idAttribute: "_id",
        rootUrl: '/admin/pm/questionnair_template/get_question_instance?q_id=',
        url: function() { //不需要进行数据更新，仅仅作为model来存储数据。
            return this.rootUrl + this.id;
        },
        validate: function(attrs, options) {

        }
    });

    // Returns the Model class
    return Model;
})