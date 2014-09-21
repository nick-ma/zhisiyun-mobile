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
            this.leave_template = Handlebars.compile($("#backleaveofabsence_view_shwon").html());
            // this.leave_details_template = Handlebars.compile($("#back_leave_details_view").html());
            this.leaves_list_template = Handlebars.compile($("#leaves_list_view").html());
            this.bind_event();
            this.model_view = '0';
        },
        // Renders all of the Task models on the UI
        render: function() {
            $("#leaveofabsence_name").html('假期查看')
            var self = this;
            var rendered_data = '';
            if (self.model_view == '0') {
                var f_d = _.find(self.obj.absences, function(ab) {
                    return ab.absence_type_code == self.obj.leave.leaveOfabsence.absence_code
                })

                self.obj.leave.absence_name = f_d ? f_d.absence_type_name : '';
                self.obj.leave.start_date = moment(self.obj.leave.start_date).format('YYYY-MM-DD') + ' ' + self.obj.leave.time_zone_s
                self.obj.leave.end_date = moment(self.obj.leave.end_date).format('YYYY-MM-DD') + ' ' + self.obj.leave.time_zone_e
                rendered_data = self.leave_template(self.obj);

            } else if (self.model_view == '1') {
                $("#leaveofabsence_name").html('假期累计明细');

                rendered_data = self.leave_details_template(self.obj);
            } else if (self.model_view == '2') {
                $("#leaveofabsence_name").html('消假明细');

                var obj = {
                    leave: {}
                }
                obj['leave'].leaves = []
                obj['leave'].leaves = self.obj.leave.leaveOfabsence.leaves;
                obj['leave'].hours = self.obj.leave.leaveOfabsence.hours;
                rendered_data = self.leaves_list_template(obj);
            }



            $("#back_leave_view_list-content").html(rendered_data);
            $("#back_leave_view_list-content").trigger('create');
            return self;
        },
        bind_event: function() {
            var self = this
            var bool = true;
            $("#back_leave_view_list").on('click', '#leave_details_show', function(event) {
                self.model_view = '1'
                self.render();
            }).on('click', '#leaves_list', function(event) {
                self.model_view = '2'
                self.render();
            }).on('click', '#btn-back_view_list-back', function(event) {
                if (self.model_view != '0') {
                    self.model_view = '0'
                    self.render();
                } else {
                    window.location.href = "/m#leave_list"
                }
            }).on('click', '#btn-create_back_leave', function(event) {
                var leave_id = $(this).attr('leave_id');
                if (confirm('确定启动消假流程 ？')) {
                    $.post('/admin/tm/wf_back_after_leave_of_absence/bb/' + null, {
                        leave_id: leave_id
                    }, function(data) {
                        if (data) {
                            window.location.href = '#back_leave_form_t/' + data.ti
                        };

                    })
                };
            })

        },

    });

    // Returns the View class
    return AbsenceListView;

});