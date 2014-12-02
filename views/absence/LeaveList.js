// ToDo View
// =============

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "async", "moment"], function($, _, Backbone, Handlebars, async, moment) {
    Handlebars.registerHelper('marks', function(data) {
        var mark = {
            'START': '流程开始',
            'RUNNING': '审批中',
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
            num = parseInt(data)
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

    function calculate_02(items) {
        var num = 0;
        _.each(items, function(it) {
            num += it.total_time
        })

        return num
    }

    function sort(items) {
        var sorts = _.sortBy(items, function(it) {
            return it.start_date
        })
        return sorts.reverse()
    }

    function sort_02(items) {
        var sorts = _.sortBy(items, function(ls) {
            return ls.crate_date
        })
        return sorts.reverse()
    }

    var AbsenceListView = Backbone.View.extend({
        // The View Constructor
        initialize: function() {
            this.leave_template = Handlebars.compile($("#leave_view").html());
            this.balance_template = Handlebars.compile($("#balance_view").html());
            this.balance_total_template = Handlebars.compile($("#balance_total_view").html());
            this.back_leave_template = Handlebars.compile($("#back_leave_view").html());
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
                    $(x).find('span').html(items[0].balance ? items[0].balance.data.length : 0);
                } else if (state == '2') {
                    var all_cunts = _.flatten([items[0].leave_total.leaveOfabsences, items[0].leave_total.backleaveOfabsences], true)
                    $(x).find('span').html(all_cunts.length || 0);
                } else if (state == '3') {
                    var filters = _.filter(items[0].leaves.reverse(), function(it) {
                        return it.process_state == 'END' && !it.is_back_after_leave_of_absence
                    })
                    $(x).find('span').html(filters.length || 0);
                } else if (state == '4') {
                    var url = ' /admin/tm/wf_back_after_leave_of_absence/bb';
                    $.get(url, function(data) {
                        self.banck_leaves = data.leaves;
                        self.absences = data.absences;
                        $(x).find('span').html(data.leaves.length || 0);

                    });
                };
            })

            if (self.mode_view == '0') {
                rendered_data = self.leave_template({
                    leaves: sort_02(items[0].leaves)
                });
            } else if (self.mode_view == '1') {
                var current_date = moment(new Date()).format('YYYY-MM-DD')
                if (items[0].balance) {
                    var filter_001s = _.filter(items[0].balance.data, function(dt) {
                        var end_date = moment(dt.end_date).format('YYYY-MM-DD')
                        return dt.absence_code == '001' && (end_date == current_date || end_date > current_date)
                    })

                    var filter_002s = _.filter(items[0].balance.data, function(dt) {
                        var end_date = moment(dt.end_date).format('YYYY-MM-DD')
                        return dt.absence_code == '005'
                    })

                    var filter_003s = _.filter(items[0].balance.details, function(dt) {
                        var end_date = moment(dt.end_date).format('YYYY-MM-DD')
                        return dt.absence_code == '001'
                    })

                    var maps = _.compact(_.map(items[0].balance.details, function(ft) {
                        if (ft.absence_code == '005') {
                            var o = {
                                absence_code: '005',
                                total_time: -ft.total_time,
                                start_date: ft.start_date,
                                valid_end_date: ft.valid_end_date
                            }
                            return o
                        } else {
                            return null;
                        }
                    }))
                };
                _.each(filter_002s, function(ft) {
                    maps.push({
                        absence_code: '005',
                        total_time: ft.init_balance,
                        start_date: ft.start_date,
                        valid_end_date: '9999-12-31',
                        balance: ft.balance,
                    })
                })

                rendered_data = self.balance_template({
                    '001_bs': sort(filter_001s),
                    '002_bs': sort(maps),
                    '001_num': calculate(filter_001s),
                    '002_num': calculate_02(maps)
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

            } else if (self.mode_view == '3') {
                var filters = _.filter(items[0].leaves.reverse(), function(it) {
                    return it.process_state == 'END' && !it.is_back_after_leave_of_absence
                })
                rendered_data = self.leave_template({
                    leaves: sort_02(filters)
                });
            } else if (self.mode_view == '4') {
                var items = []
                _.each(self.banck_leaves, function(bl) {
                    var f_d = _.find(self.absences, function(ls) {
                        return ls.absence_type_code == bl.absence_code
                    })
                    items.push({
                        absence_name: f_d ? f_d.absence_type_name : '',
                        crate_date: bl.crate_date,
                        hours: bl.hours,
                        process_define: bl.process_define,
                        process_define: bl.process_define,
                        leave_id: bl.leave_id,
                        process_state: bl.process_state,
                    })

                })
                rendered_data = self.back_leave_template({
                    leaves: sort_02(items)
                });
            }

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
                my_confirm('确定启动请假流程?', null, function() {
                    $.mobile.loading("show");
                    $.post('/admin/tm/wf_leave_of_absence/bb/' + null, {

                    }, function(data) {
                        $.mobile.loading("hide");
                        window.location.href = "#leave_form_t/" + data.ti._id + '/T';

                    })
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
            }).on('click', '#btn-back_leave_view', function(event) {
                event.preventDefault();
                self.mode_view = '3';
                self.render();
                $("#leave_list-left-panel").panel("close");
            }).on('click', '#btn_jump', function(event) {
                event.preventDefault();
                var process_define = $(this).data('process_define');
                var leave_id = $(this).data("leave_id");

                if (self.mode_view == '0') {
                    window.location.href = '#leave_form_p/' + process_define + '/L'
                } else if (self.mode_view == '3') {
                    my_confirm('确定启动消假流程 ?', null, function() {
                        $.mobile.loading("show");
                        $.post('/admin/tm/wf_back_after_leave_of_absence/bb/' + null, {
                            leave_id: leave_id
                        }, function(data) {
                            if (data) {
                                $.mobile.loading("hide");
                                window.location.href = '#back_leave_form_t/' + data.ti._id + '/T'
                            };

                        })

                    })



                } else if (self.mode_view == '4') {
                    window.location.href = '#back_leave_form_p/' + process_define + '/L'
                }

            }).on('click', '.btn-leave-change_state', function(event) {
                var $this = $(this);
                self.mode_view = $this.data('state');
                self.render();
                $('.btn-leave-change_state').removeClass('ui-btn-active');
                $this.addClass('ui-btn-active');
            })
        },

    });

    // Returns the View class
    return AbsenceListView;

});