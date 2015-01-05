// 工作流引擎数据
// ======================
define(["jquery", "backbone"], function($, Backbone) {
    // The Model constructor
    var Model = Backbone.Model.extend({
        idAttribute: "_id",
        rootUrl: '/admin/pm/assessment_instance/wfdata_bb',
        url: function() {
            return this.rootUrl + '/' + this.id + '?ts=' + (new Date()).getTime();
        },
    });

    // Returns the Model class
    return Model;
})