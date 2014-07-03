// Coll Project Model, 协作项目
// ===========================
define(["jquery", "backbone"], function($, Backbone) {
    // The Model constructor
    var Model = Backbone.Model.extend({
        idAttribute: "_id",
        rootUrl: '/admin/pm/coll_project/bb',
        url: function() {
            return this.rootUrl + '/' + this.id;
        },
        validate: function(attrs, options) {

            if (!attrs.project_name) {
                return "项目名称不能为空";
            };
            var e_date = moment(attrs.end).endOf('day').toDate();
            var s_date = moment(attrs.start).startOf('day').toDate();
            // console.log(e_date, s_date);
            if (e_date < s_date) {
                return "结束日期不能小于开始日期";
            }
        }
    });

    // Returns the Model class
    return Model;
})