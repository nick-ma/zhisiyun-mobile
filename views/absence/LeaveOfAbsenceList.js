// ToDo View
// =============

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "async", "moment"], function($, _, Backbone, Handlebars, async, moment) {
    // Handlebars.registerHelper('mark', function(data) {
    //     var mark = {
    //         'START': '开始',
    //         'RUNNING': '执行中 ',
    //         'END': '结束',
    //         'SUSPEND': '挂起',
    //         'TERMINATE': '终止',
    //         'DELETE': '删除'
    //     }
    //     return mark[data]
    // });

    function absence_code_show(absence_code, self) {
        var absence_code = (absence_code || '001');
        var absences = self.model.get('absences');
        var accumulates = self.model.get('accumulates');
        var balance = self.model.get('leavebalance');
        var leave = self.model.get('leave');

        var f_d = _.find(absences, function(ab) {
            return ab.absence_type_code == absence_code
        })
        $('#absence_type_description').text(f_d.absence_type_description);


        if (absence_code == '001' || absence_code == '005') {
            leave.leave_balance = 0;
            $("#balance_show,#history").show();
            $("#detail_show,#ration_show").hide();
            if (balance) {
                var filters = _.filter(balance.data, function(dd) {
                    var end_date = moment(dd.end_date).format('YYYY-MM-DD');
                    var current_date = moment(new Date()).format('YYYY-MM-DD');
                    var bool = true;
                    if (absence_code == '001') {
                        if (current_date <= end_date) {
                            bool = true;
                        } else {
                            bool = false;
                        }
                    };
                    return dd.absence_code == absence_code && bool
                })
                var num = 0;
                _.each(filters, function(ft) {
                    num += ft.balance
                })
                leave.leave_balance = num;
                $('#leave_balance').html(num + ' 小时')
            };
        } else if (absence_code == '003' || absence_code == '002') {
            $("#detail_show,#history").show();
            $("#balance_show,#ration_show").hide();

            var filters = _.filter(accumulates, function(acc) {
                return acc.absence_code == absence_code
            })
            var num = 0;
            _.each(filters, function(accumulate) {
                num += accumulate.hours
            })
            leave.aggregate_value = num + '小时';
            $('#aggregate_value').html(num + '小时')

        } else if (absence_code == '004') {
            $("#ration_show,#history").show();
            $("#balance_show,#detail_show").hide();

            var people = leave.people;
            var years = moment(new Date).diff(people.birthday, 'year');
            var absence = f_d;
            var hours = 0;
            if (absence.is_ration) {
                if (absence.ration_option == 'N' && absence.is_gender) {
                    var f_d = _.find(absence.rations, function(rt) {
                        var gd = (rt.gender == people.gender);
                        return gd && rt.max > years && (years > rt.min || years == rt.min)
                    })
                    hours = f_d ? f_d.ration : 0;
                } else if (absence.ration_option == 'N') {
                    var f_d = _.find(absence.rations, function(rt) {
                        return rt.max > years && (years > rt.min || years == rt.min)
                    })
                    hours = f_d ? f_d.ration : 0;
                };
            };

            leave.ration = hours * 8;
            $("#ration").html(hours * 8 + '小时')


        } else {
            $("#balance_show,#detail_show,#ration_show").hide();
        }

    }

    //计算时间
    function calculate_hours(time, start_time, s_hour, end_time, e_hour) {
        var time_long = null;
        var s_hour = moment.duration(s_hour);
        var e_hour = moment.duration(e_hour);
        var work_on_time = moment.duration(time.work_on_time);
        var work_off_time = moment.duration(time.work_off_time);
        var rest_start = moment.duration(time.rest_start);
        var rest_end = moment.duration(time.rest_end);

        var s_up = s_hour >= work_on_time && s_hour <= rest_start;
        var e_up = e_hour >= work_on_time && e_hour <= rest_start; //同在上午

        var s_down = s_hour >= rest_end && s_hour <= work_off_time;
        var e_down = e_hour >= rest_end && e_hour <= work_off_time; //同在下午
        if (s_up && e_up || s_down && e_down) {
            time_long = (e_hour - s_hour) / 60000 / 60
        } else {
            time_long = ((rest_start - s_hour) + (e_hour - rest_end)) / 60000 / 60
        }

        return time_long
    }


    //取工作时间并且判断是不是上班
    function is_work_on_off(times_configs, time_type, data) {
        var time = null;
        _.each(times_configs, function(config) {
            var f_d = _.find(config.calendar_data, function(dt) {
                if (time_type == '2') {
                    return moment(data).isBefore(dt.expire_off) && moment(data).isAfter(dt.expire_on)
                } else {
                    return dt.job_date == moment(data).format('YYYY-MM-DD')
                }
            })
            if (f_d && f_d.is_job_day) {
                time = config.time;
                return
            };
        })

        return time
    }
    //只获取工作时间
    function is_work_on_off_time(times_configs, time_type, data) {
        var time = null;
        _.each(times_configs, function(config) {
            var f_d = _.find(config.calendar_data, function(dt) {
                if (time_type == '2') {
                    return moment(data).isBefore(dt.expire_off) && moment(data).isAfter(dt.expire_on)
                } else {
                    return dt.job_date == moment(data).format('YYYY-MM-DD')
                }
            })
            if (f_d) {
                time = config.time;
                return
            };
        })

        return time
    }

    //判断这天是不是半天
    function compare(st_zone, ed_zone, ost_zone, oed_zone) {
        var bool = false
        if (st_zone == ost_zone && ed_zone == oed_zone) {
            return true
        }
        return bool;
    }

    function assemble(self, st, ed) {
        var data = self.model.get('work_time');
        var leave = self.model.get('leave');
        var times = data.times;
        var type = data.type;
        var datas = data.datas;
        var times_configs = []
        if (type == '0') {
            var group = _.groupBy(datas, function(data) {
                return data.work_time
            })
            _.each(group, function(ys, k) {
                var o = {};
                o.calendar_data = ys;
                var f_d = _.find(times, function(time) {
                    return time._id = k
                });
                o.time = f_d;
                times_configs.push(o)
            })
        } else if (type == '1') {
            _.each(datas, function(dt) {
                var o = {};
                o.calendar_data = dt.calendar_data;
                var f_d = _.find(times, function(time) {
                    return time._id = dt.work_time
                });
                o.time = f_d;
                times_configs.push(o)
            })
        } else if (type == '2') {
            var group = _.groupBy(datas, function(data) {
                return data.work_time
            })
            _.each(group, function(ys, k) {
                var o = {};
                o.calendar_data = ys;
                var f_d = _.find(times, function(time) {
                    return time._id = k
                });
                o.time = f_d;
                times_configs.push(o)
            })
        };
        if (st.zone == 'null' || st.zone == null) {
            var time = is_work_on_off_time(times_configs, type, st.date);
            if (time) {
                st.zone = time.work_on_time
            };
        };
        if (ed.zone == 'null' || ed.zone == null) {
            var time = is_work_on_off_time(times_configs, type, ed.date);
            if (time) {
                ed.zone = time.work_off_time
            };
        };

        var date_items = [];

        if (st.date && st.zone && ed.date && ed.zone) {
            var days_between = moment(ed.date).diff(moment(st.date), 'days');

            if (days_between == 0) {
                var time = is_work_on_off(times_configs, type, st.date);
                if (time) {
                    date_items.push({
                        is_full_day: compare(st.zone, ed.zone, time.work_on_time, time.work_off_time),
                        start_date: st.date,
                        end_date: ed.date,
                        o_time_zone_s: time.work_on_time,
                        o_time_zone_e: time.work_off_time,
                        time_zone_s: st.zone,
                        time_zone_e: ed.zone,
                        total_time: calculate_hours(time, st.date, st.zone, ed.date, ed.zone),

                    })
                };
            } else {
                var num = null;
                for (var i = 0; i <= days_between; i++) {
                    var iterate_date = moment(st.date).add('days', i).format('YYYY-MM-DD');
                    var time = is_work_on_off(times_configs, type, iterate_date);
                    if (time) {

                        var o = {
                            is_full_day: compare(st.zone, ed.zone, time.work_on_time, time.work_off_time),
                            start_date: iterate_date,
                            end_date: iterate_date,
                            o_time_zone_s: time.work_on_time,
                            o_time_zone_e: time.work_off_time,
                        }
                        if (i == 0) {
                            o.time_zone_s = st.zone;
                            o.time_zone_e = time.work_off_time;
                            o.is_full_day = compare(st.zone, time.work_off_time, time.work_on_time, time.work_off_time);
                            o.total_time = calculate_hours(time, iterate_date, st.zone, iterate_date, time.work_off_time);

                        } else if (i == days_between) {
                            o.time_zone_s = time.work_on_time;
                            o.time_zone_e = ed.zone;
                            o.is_full_day = compare(time.work_on_time, ed.zone, time.work_on_time, time.work_off_time);
                            o.total_time = calculate_hours(time, iterate_date, time.work_on_time, iterate_date, ed.zone);
                        } else {

                            o.time_zone_s = time.work_on_time;
                            o.time_zone_e = time.work_off_time;
                            o.is_full_day = compare(time.work_on_time, time.work_off_time, time.work_on_time, time.work_off_time);
                            o.total_time = calculate_hours(time, iterate_date, time.work_on_time, iterate_date, time.work_off_time);

                        }
                        date_items.push(o)
                    }

                };

            }
            date_items = _.compact(date_items);
            var total_value = 0;
            _.each(date_items, function(dt) {
                total_value += dt.total_time
            })
            leave.leaves = date_items;
            leave.hours = total_value;

            $('#hours').html(total_value + '小时');

        };
        if (date_items.length == 0) {
            var c_date = moment(new Date()).format('YYYY-MM-DD')
            var o = {
                is_full_day: true,
                start_date: c_date,
                end_date: c_date,
                time_zone_s: '09:00',
                time_zone_e: '18:00',
            }
            date_items.push(o);
        };
        leave.create_start_date = _.first(date_items).start_date + ' ' + _.first(date_items).time_zone_s;
        leave.create_end_date = _.last(date_items).end_date + ' ' + _.last(date_items).time_zone_e;

    }



    function times(start_date) {
        s_date = start_date.split('T')[0];
        s_zone = start_date.split('T')[1] || null;
        var o = {
            date: s_date,
            zone: s_zone,
        }
        return o
    }


    var do_trans = function(trans_data) {
        var post_data = {
            process_instance_id: $("#process_instance_id").val(),
            task_instance_id: $("#task_instance_id").val(),
            process_define_id: $("#process_define_id").val(),
            next_tdid: $("#next_tdid").val() || trans_data.next_tdid,
            next_user: $("#next_user_id").val() || trans_data.next_user, //'516cf9a1d26ad4fe48000001', //以后从列表中选出
            trans_name: $("#trans_name").val() || trans_data.trans_name, // 转移过来的名称
            comment_msg: $("#comment_msg").val() || trans_data.comment_msg, // 任务批注 
            // 任务批注 
        };
        var post_url = $("#task_process_url").val();
        post_url = post_url.replace('<TASK_ID>', $("#task_instance_id").val());
        $.post(post_url, post_data, function(data) {
            if (data.code == 'OK') {

                window.location = '#todo';
            };
        })
    }


    var leaveofabsenceListView = Backbone.View.extend({
        // The View Constructor
        initialize: function() {
            var self = this
            this.leaveofabsence_template = Handlebars.compile($("#leaveofabsence_view").html());
            this.leave_details_template = Handlebars.compile($("#leave_details_view").html());
            this.leaves_list_template = Handlebars.compile($("#leaves_list_view").html());
            this.template = Handlebars.compile($("#trans_confirm_view").html()); //跳转页面
            this.model_view = '0';
            this.bind_event();
        },
        // Renders all of the Task models on the UI
        render: function() {

            var self = this;
            var rendered_data = '';
            var leave = self.model.get('leave');
            var ti = self.model.get('ti');

            if (self.model_view == '0') {
                $("#leaveofabsence_name").html('假期申请单')
                var start_date = moment(leave.create_start_date || new Date).format('YYYY-MM-DD');
                var end_date = moment(leave.create_end_date || new Date).format('YYYY-MM-DD');
                var time_zone_s = _.first(leave.leaves) ? _.first(leave.leaves).time_zone_s : null;
                var time_zone_e = _.last(leave.leaves) ? _.last(leave.leaves).time_zone_e : null;

                if (leave.allday == 'undefined' || !leave.allday) {
                    if (leave.leaves.length) {
                        var bool_01 = _.first(leave.leaves).is_full_day;
                        var bool_02 = _.last(leave.leaves).is_full_day;
                        if (!bool_01 || !bool_02) {
                            leave.allday = false;
                        };
                    } else {
                        leave.allday = true;
                    }
                };

                assemble(self, times(start_date + 'T' + time_zone_s), times(end_date + 'T' + time_zone_e));


                rendered_data = self.leaveofabsence_template(self.model.attributes);

            } else if (self.model_view == '1') {
                $("#leaveofabsence_name").html('假期累计明细');
                rendered_data = self.leave_details_template(self.model.attributes);
            } else if (self.model_view == '2') {
                $("#leaveofabsence_name").html('请假明细');
                rendered_data = self.leaves_list_template(self.model.attributes);
            } else if (self.model_view == '3') {
                rendered_data = self.template(self.trans_data);
                if (self.trans_data.next_td.node_type == 'END') {
                    do_trans(self.trans_data);
                }
            };
            $("#leaveofabsence_list-content").html(rendered_data);
            $("#leaveofabsence_list-content").trigger('create');
            absence_code_show(leave.absence_code, self);
            var absences = self.model.get('absences');
            var absence_code = $("#absence_type").val();
            var f_d = _.find(absences, function(ab) {
                return ab.absence_type_code == absence_code
            })
            if (f_d) {
                leave.absence_id = f_d._id;
                leave.absence_code = f_d.absence_type_code;
            };
            console.log(self.people_id + '======' + String(leave.people._id));
            console.log(self.people_id == String(leave.people._id))
            if (self.people_id == String(leave.people._id)) {
                $("#btn_ims_show").hide();
                // if (self.type == 'L') {
                $('absence_type,#leave_reason,#leave_allday,#create_start_date,#create_end_date').removeAttr('disabled');
                // };

            } else {
                $("#btn_ims_show").show();
                $('#absence_type,#leave_reason,#leave_allday,#create_start_date,#create_end_date').attr('disabled', true);
            }


            $("#leave_list #crate_leave").hide();
            $("#leave_list #btn-leave_list-back").show()

            return self;
        },
        bind_event: function() {
            var self = this
            var bool = true;
            $("#leaveofabsence_list").on('click', '#btn-ct-save', function(event) {
                event.preventDefault();
                var leave = self.model.get('leave');
                var absence_type = $('#absence_type').val();
                if (absence_type == '001' || absence_type == '005') {
                    if (leave.hours > leave.leave_balance) {
                        alert('请假时长不能大于假期余额！')
                        return false
                    };
                } else if (absence_type == '004') {
                    if (leave.hours > leave.ration) {
                        alert('请假时长不能大于定额！')
                        return false
                    };

                };
                self.model.id = $("#leaveofabsence_list-content #leave_id").val();

                self.model.save().done(function(data) {
                    if (data) {
                        alert('数据保存成功！！')
                    };
                })
            }).on('change', '#create_end_date, #create_start_date', function(event) {
                event.preventDefault();
                var type = $(this).data('type');
                if (type == 'S') {
                    var start_date = $(this).val();
                    var end_date = $("#create_end_date").val();

                } else {
                    var start_date = $("#create_start_date").val();
                    var end_date = $(this).val();
                }
                st = times(start_date);
                ed = times(end_date);
                assemble(self, st, ed);
            }).on('change', '#absence_type', function(event) {
                event.preventDefault();
                var absences = self.model.get('absences');
                var absence_code = $(this).val();
                absence_code_show(absence_code, self);
                var leave = self.model.get('leave');
                var f_d = _.find(absences, function(ab) {
                    return ab.absence_type_code == absence_code
                })
                leave.absence_id = f_d._id;
                leave.absence_code = f_d.absence_type_code;
            }).on('click', '#leave_details_show', function(event) {
                event.preventDefault();
                self.model_view = '1'
                self.render();
            }).on('click', '#leaves_list', function(event) {
                event.preventDefault();
                self.model_view = '2'
                self.render();
            }).on('click', '#btn-leave_list-back', function(event) {
                event.preventDefault();
                if (self.model_view != '0') {
                    self.model_view = '0'
                    self.render();
                } else {
                    window.location.href = "/m#leave_list"
                }
            }).on('change', '#leave_reason', function(event) {
                event.preventDefault();
                var leave = self.model.get('leave');
                leave.leave_reason = $(this).val();
            }).on('change', '#leave_allday', function(event) {
                event.preventDefault();
                var la = $(this).val();
                var leave = self.model.get('leave');
                leave.allday = (la == 'false' ? false : true);
                self.render();
                //把 a 换成 span， 避免点那个滑块的时候页面跳走。
                $(".ui-flipswitch a").each(function() {
                    $(this).replaceWith("<span class='" + $(this).attr('class') + "'></span>");
                });
            }).on('click', '.do_trans', function(event) {

                event.preventDefault();
                var leave = self.model.get('leave');
                var $this = $(this);
                if ($("#leaveofabsence_list-content #ti_comment").val() == '') {
                    alert('请填写审批意见！');
                    return;
                };


                var absence_type = $('#absence_type').val();
                if (absence_type == '001' || absence_type == '005') {
                    if (leave.hours > leave.leave_balance) {
                        alert('请假时长不能大于假期余额！')
                        return false
                    };
                } else if (absence_type == '004') {
                    if (leave.hours > leave.ration) {
                        alert('请假时长不能大于定额！')
                        return false
                    };
                };

                $(this).attr('disabled', true)
                $.mobile.loading("show");


                var process_define_id = $("#leaveofabsence_list-content #process_define_id").val();
                var task_define_id = $("#leaveofabsence_list-content #task_define_id").val();
                var process_instance_id = $("#leaveofabsence_list-content #process_instance_id").val();
                var task_process_url = $("#leaveofabsence_list-content #task_process_url").val();
                var task_instance_id = $("#leaveofabsence_list-content #task_instance_id").val();



                var direction = $this.data('direction');
                var target_id = $this.data('target_id');
                var task_name = $this.data('task_name');
                var name = $this.data('name');
                var roles_type = $this.data('roles_type');
                var position_form_field = $this.data('position_form_field');


                self.model.id = $("#leaveofabsence_list-content #leave_id").val();
                self.model.save().done(function(data) {
                    $.post('/admin/wf/trans_confirm_form_4m', {
                        process_define_id: process_define_id,
                        task_define_id: task_define_id,
                        process_instance_id: process_instance_id,
                        task_process_url: task_process_url,
                        next_tdname: task_name,
                        trans_name: name,
                        ti_comment: $("#leaveofabsence_list-content #ti_comment").val(),
                        task_instance_id: task_instance_id,
                        next_tdid: target_id,
                        direction: direction
                    }, function(data) {
                        self.model_view = '3';
                        self.trans_data = data;
                        $.mobile.loading("hide");
                        self.render();
                    });
                })

            }).on('click', '#btn_trans_cancel', function(event) {
                event.preventDefault();
                window.location.reload();
            }).on('click', '#btn_ok', function(e) {
                $.mobile.loading("show");
                if ($("#next_user_name").val()) {
                    $("#btn_ok").attr("disabled", "disabled");
                    do_trans(self.trans_data);
                    $.mobile.loading("hide");
                } else {
                    alert('请选择下一任务的处理人');
                };
            }).on('click', '#btn_wf_start_userchat', function(event) {
                event.preventDefault();
                var leave = self.model.get('leave');
                var url = "im://userchat/" + leave.people._id;
                window.location.href = url;
            })
        },

    });

    // Returns the View class
    return leaveofabsenceListView;

});