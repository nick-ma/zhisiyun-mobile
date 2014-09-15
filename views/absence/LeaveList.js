// ToDo View
// =============

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "async", "moment"], function($, _, Backbone, Handlebars, async, moment) {
    Handlebars.registerHelper('mark', function(data) {
        var mark = {
            'START': '流程开始',
            'RUNNING': '流程执行中 ',
            'END': '审批结束',
            'SUSPEND': '流程挂起',
            'TERMINATE': '流程终止',
            'DELETE': '流程删除'
        }
        return mark[data]
    });

    Handlebars.registerHelper('rp', function(data) {
        var str = '无假期类型'
        if (data) {
            str = data;
        };
        return str
    });

    Handlebars.registerHelper('show_date', function(st, ed) {
        var s = (st) ? moment(st).format('YYYY-MM-DD') : '';
        var e = (ed) ? moment(ed).format('YYYY-MM-DD') : '';
        if (s && e) {
            return s + '~' + e
        };

    });
    Handlebars.registerHelper('num', function(data) {
        var num = 0;
        if (data) {
            num = data
        };
        return num;
    });


    var AbsenceListView = Backbone.View.extend({
        // The View Constructor
        initialize: function() {
            // console.log(this);
            this.leave_template = Handlebars.compile($("#leave_view").html());
            this.month = moment(new Date()).month() + 1;
            this.bind_event();
        },
        // Renders all of the Task models on the UI
        render: function() {
            var self = this;
            var rendered_data = '';
            var items = self.collection.toJSON()
            rendered_data = self.leave_template({
                leaves: items.reverse()
            });
            // console.log(self.collection.toJSON())
            $("#leave_list-content").html(rendered_data);
            $("#leave_list-content").trigger('create');
            $("#leave_list #crate_leave").show();
            $("#leave_list #btn-leave_list-back").hide()
            return self;
        },
        bind_event: function() {
            var self = this
            var bool = true;
            $("#leave_list").on('change', '#absence_month', function(event) {
                self.month = parseInt($(this).val()) + 1;
                self.render()
            }).on('click', '#crate_leave', function(event) {
                self.leaveOfAbsence.save().done(function(data) {
                    window.location.href = "/m#leave_form_t/" + data.ti._id;

                })

            })
        },

    });

    // Returns the View class
    return AbsenceListView;

});