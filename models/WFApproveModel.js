// WF Approve Model, 自由审批流程
// ============================
define(["jquery", "backbone", "moment"], function($, Backbone, moment) {
    // The Model constructor
    var Model = Backbone.Model.extend({
        idAttribute: "_id",
        rootUrl: '/admin/free_wf/approve/bb',
        url: function() {
            return this.rootUrl + '/' + this.id;
        },
        validate: function(attrs, options) {

            if (!attrs.name) {
                return "请输入流程名称";
            };
            if (!attrs.content) {
                return "请输入报批事项";
            };
        }
    });

    // Returns the Model class
    return Model;
})