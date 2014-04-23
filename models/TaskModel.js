// Task Model, 个人工作日历
// ======================
define(["jquery", "backbone"], function($, Backbone) {
    // The Model constructor
    var Model = Backbone.Model.extend({
        idAttribute: "_id",
        rootUrl: '/admin/pm/work_plan/bb',
        url: function() {
            return this.rootUrl + '/' + this.id;
        },
        validate: function(attrs, options) {
            if (new Date(attrs.end) < new Date(attrs.start)) {
                return "结束日期不能小于开始日期";
            }
            if (!attrs.title) {
                return "任务标题不能为空";
            };
        }
    });

    // Returns the Model class
    return Model;
})