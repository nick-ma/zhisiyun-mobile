// Coll Task Model, 协同任务
// ======================
define(["jquery", "backbone", "moment"], function($, Backbone, moment) {
    // The Model constructor
    var Model = Backbone.Model.extend({
        idAttribute: "_id",
        rootUrl: '/admin/pm/coll_task/bb',
        url: function() {
            return this.rootUrl + '/' + this.id + '?ts=' + (new Date()).getTime();
        },
        validate: function(attrs, options) {

            if (!attrs.task_name) {
                return "请输入任务名称";
            };
            if (!attrs.end) {
                return "请设定任务截止日期";
            };
            var e_date = (attrs.allday) ? moment(attrs.end).endOf('day').toDate() : moment(attrs.end).toDate();
            var s_date = (attrs.allday) ? moment(attrs.start).startOf('day').toDate() : moment(attrs.start).toDate();
            // console.log(e_date, s_date);
            if (e_date < s_date) {
                return "结束日期不能小于开始日期";
            }
        }
    });

    // Returns the Model class
    return Model;
})