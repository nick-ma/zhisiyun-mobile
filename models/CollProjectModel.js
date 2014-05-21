// Coll Project Model, 协作项目
// ===========================
define(["jquery", "backbone"], function($, Backbone) {
    // The Model constructor
    var Model = Backbone.Model.extend({
        idAttribute: "_id",
        rootUrl: '/admin/pm/coll_task/bb',
        url: function() {
            return this.rootUrl + '/' + this.id;
        },
        validate: function(attrs, options) {
            // var e_date = moment(moment(attrs.end).format('YYYY-MM-DD HH:mm')).toDate();
            // var s_date = moment(moment(attrs.start).format('YYYY-MM-DD HH:mm')).toDate();
            // // console.log(e_date, s_date);
            // if (e_date < s_date) {
            //     return "结束日期不能小于开始日期";
            // }
            if (!attrs.project_name) {
                return "项目名称不能为空";
            };
        }
    });

    // Returns the Model class
    return Model;
})