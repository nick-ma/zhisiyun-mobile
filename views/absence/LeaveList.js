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


    Handlebars.registerHelper('change_type', function(data) {
        return validate(data) ? '收 入' : '支 出';
    });

    Handlebars.registerHelper('dis_type', function(data) {
        return validate(data) ? '请 假' : '消 假';
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

    function validate(num) {
        var reg = /^\d+(?=\.{0,1}\d+$|$)/
        if (reg.test(num)) return true;
        return false;
    }

    function calculate(items) {
        var num = 0;
        _.each(items, function(it) {
            num += it.balance
        })
        return num
    }

    function sort(items) {
        var sorts = _.sortBy(items, function(it) {
            return it.start_date
        })
        return sorts.reverse()
    }

    var AbsenceListView = Backbone.View.extend({
        // The View Constructor
        initialize: function() {
            this.leave_template = Handlebars.compile($("#leave_view").html());
            this.balance_template = Handlebars.compile($("#balance_view").html());
            this.balance_total_template = Handlebars.compile($("#balance_total_view").html());
            this.month = moment(new Date()).month() + 1;
            this.bind_event();
            this.mode_view = '0';
        },

        render: function() {
            var self = this;
            var rendered_data = '';
            var items = self.collection.toJSON();
            _.each($("#leave_list-left-panel label"), function(x) {
                var state = $(x).data('state');
                if (state == '0') {
                    $(x).find('span').html(items[0].leaves.length || 0);
                } else if (state == '1') {
                    $(x).find('span').html(items[0].balance.details.length || 0);
                } else if (state == '2') {
                    var all_cunts = _.flatten([items[0].leave_total.leaveOfabsences, items[0].leave_total.backleaveOfabsences], true)
                    $(x).find('span').html(all_cunts.length || 0);
                };
            })

            if (self.mode_view == '0') {
                rendered_data = self.leave_template({
                    leaves: items[0].leaves.reverse()
                });
            } else if (self.mode_view == '1') {
                var current_date = moment(new Date()).format('YYYY-MM-DD')
                var filter_001s = _.filter(items[0].balance.data, function(dt) {
                    var end_date = moment(dt.end_date).format('YYYY-MM-DD')
                    return dt.absence_code == '001' && (end_date == current_date || end_date > current_date)
                })

                var filter_002s = _.filter(items[0].balance.data, function(dt) {
                    var end_date = moment(dt.end_date).format('YYYY-MM-DD')
                    return dt.absence_code == '005' && dt.balance > 0
                })

                var filter_003s = _.filter(items[0].balance.details, function(dt) {
                    var end_date = moment(dt.end_date).format('YYYY-MM-DD')
                    return dt.absence_code == '001'
                })

                var filter_004s = _.filter(items[0].balance.details, function(dt) {
                    var end_date = moment(dt.end_date).format('YYYY-MM-DD')
                    return dt.absence_code == '005'
                })

                rendered_data = self.balance_template({
                    '001_bs': sort(filter_003s),
                    '002_bs': sort(filter_004s),
                    '001_num': calculate(filter_001s),
                    '002_num': calculate(filter_002s)
                });

            } else if (self.mode_view == '2') {
                var all_items = _.flatten([items[0].leave_total.leaveOfabsences, items[0].leave_total.backleaveOfabsences], true)


                var gb = _.groupBy(all_items, function(le) {
                    return le.absence_code
                })
                var its = []
                _.each(gb, function(ys, k) {
                    var f_d = _.find(items[0].absences, function(ia) {
                        return ia.absence_type_code == k
                    })
                    var num = 0;
                    var times = [];
                    _.each(ys, function(y) {
                        num += y.hours;
                        times.push({
                            current_date: y.current_date,
                            hours: y.hours,
                            create_start_date: y.leave.create_start_date || y.leave.start_date, //生成请假明细开始日期
                            create_end_date: y.leave.create_end_date || y.leave.start_date, //生成请假明细结束日期
                        })
                    })

                    its.push({
                        absence_name: f_d.absence_type_name,
                        total_hours: num,
                        details: times
                    })

                })
                rendered_data = self.balance_total_template({
                    leaveOfabsences: its
                });

            };
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
            }).on('click', '.open-left-panel', function(event) {
                event.preventDefault();
                $("#leave_list-left-panel").panel("open");
            }).on('swiperight', function(event) { //向右滑动，打开左边的面板
                event.preventDefault();
                $("#leave_list-left-panel").panel("open");
            }).on('click', '#btn-leave_list-refresh', function(event) {
                event.preventDefault();
                $.mobile.loading("show");
                self.collection.fetch().done(function() {
                    self.render();
                    $.mobile.loading("hide");
                    $("#leave_list-left-panel").panel("close");
                })

            }).on('change', 'input[type="radio"]', function(event) {
                event.preventDefault();
                self.mode_view = $(this).val();
                self.render();
                $("#leave_list-left-panel").panel("close");
            })
        },

    });

    // Returns the View class
    return AbsenceListView;

});