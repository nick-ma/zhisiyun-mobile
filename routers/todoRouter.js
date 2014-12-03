// todo router
// ====================

define(["jquery", "backbone", "handlebars", "lzstring", "async",
        "../views/ToDoListView", "../views/AIWF01View", "../views/AIWF02View", "../views/AIWF03View", "../views/TransConfirmView", "../views/AIPrevView",
        "../views/tm_attendance/AttendanceResultChangeView",
        "../views/tm_attendance/AttendanceResultChange2View",
        "../views/tm_attendance/HrAttendanceResultChangeView",
        "../views/tm_attendance/TMAbsenceOfThreeView",
        // 指标选择界面
        "../views/AIPISelectView",
        "../views/PIView",

        "../collections/ToDoListCollection",
        "../collections/TmAttendanceCollection",
        "../collections/PICollection",
        "../collections/MYPICollection",
        "../collections/AISubCollection",
        "../collections/TaskFinishedListCollection",
        "../collections/WFMyWorkflowCollection",
        "../collections/WFApproveCollection",

        "../models/WFDataModel", "../models/AIModel", "../models/TeamModel", "../models/AIDatasModel", "../models/DataCollectionModel", "../models/AIPrevModel", "../models/AISuperModel", "../models/PIModel",
        "../models/TmAttendanceModel",
        "../models/TMAbsenceOfThreeModel",
        "../models/PIDatasModel",
        "../models/WFDataViewModel",
    ],
    function($, Backbone, Handlebars, LZString, async,
        ToDoListView, AIWF01View, AIWF02View, AIWF03View, TransConfirmView, AIPrevView,
        AttendanceResultChangeView,
        AttendanceResultChange2View,
        HrAttendanceResultChangeView,
        TMAbsenceOfThreeView,
        AIPISelectView,
        PIView,

        ToDoListCollection,
        TmAttendanceCollection,
        PICollection,
        MYPICollection,
        AISubCollection,
        TaskFinishedListCollection,
        WFMyWorkflowCollection,
        WFApproveCollection,

        WFDataModel, AIModel, TeamModel, AIDatasModel, DataCollectionModel, AIPrevModel, AISuperModel, PIModel,
        TmAttendanceModel, TMAbsenceOfThreeModel, PIDatasModel, WFDataViewModel
    ) {

        var ToDoRouter = Backbone.Router.extend({
            initialize: function() {
                var self = this;
                self.init_models();
                self.init_collections();
                self.init_views();
                self.init_data();
                // self.bind_events();
                console.info('app message: todo router initialized');
                // Backbone.history.start();
            },
            routes: {
                //我的待办
                "todo": "todo_list",
                "godo0/:op_id/:type": "go_do0",
                "godo1/:op_id/:type": "go_do1",
                "godo2/:op_id/:type": "go_do2",
                "godo3/:op_id/:type": "go_do3",
                "godo4/:op_id/:type": "go_do4",
                "godo8/:op_id/:type": "go_do8",
                "godo9/:op_id/:type": "go_do9",
                "godo11/:op_id/:type": "go_do11",
                "godofree/:op_id/:type": "go_dofree",
                // "prev_ai/:period/:people/:position": "prev_ai",
                // "super_ai/:period/:position": "super_ai",
                "prev_ai": "prev_ai",
                "super_ai": "super_ai",
                "pis_select": "pis_select",
                "create_pi": "create_pi",
                //查看
                "godo0_view/:op_id": "go_view0", //通用流程
                "godo1_view/:op_id": "go_view1", //绩效考核
                "godo2_view/:op_id": "go_view2", //他人评估
                "godo3_view/:op_id": "go_view3", //绩效计划
                "godo4_view/:op_id": "go_view4", //考勤异常流程查看
                "godo8_view/:op_id": "go_view8", //请假
                "godo9_view/:op_id": "go_view9", //消假
                "godo11_view/:op_id": "go_view11", //HR考勤批量
                "godo12_view/:op_id": "go_view12", //绩效总结
                "godo13_view/:op_id": "go_view13", //绩效面谈
                "godo14_view/:op_id": "go_view14", //绩效申诉

            },
            todo_list: function() { //我的待办
                var self = this;
                //从待办进入时，做标记，后面做返回时用到
                localStorage.setItem('view_mode_state', '1');
                localStorage.setItem('to_do_back_url', window.location.href);

                $("body").pagecontainer("change", "#todo_list", {
                    reverse: false,
                    changeHash: false,
                });
                $.mobile.loading("show");
                self.todoListView.pre_render();

                async.parallel({
                    data1: function(cb) {
                        self.todoListView.collection.fetch().done(function() {
                            cb(null, null);
                        });
                    },
                    data2: function(cb) {
                        self.tfList.fetch().done(function() {
                            cb(null, null);
                        });
                    },
                    data3: function(cb) {
                        self.c_wf_my_workflow.fetch().done(function() {
                            cb(null, null);
                        });
                    },
                    data4: function(cb) {
                        self.c_wf_approve.fetch().done(function() {
                            cb(null, null);
                        });
                    },
                }, function(err, ret) {
                    self.todoListView.tfList = self.tfList;
                    self.todoListView.c_wf_my_workflow = self.c_wf_my_workflow;
                    self.todoListView.c_wf_approve = self.c_wf_approve;
                    self.todoListView.render();
                    $.mobile.loading("hide");
                });
            },
            go_do0: function(op_id, type) {
                window.location.href = "#handle_form/" + op_id;
            },
            go_do1: function(op_id, type) {
                var self = this;
                //判断是否时待办进入，还是返回
                self.view_mode_state = localStorage.getItem('view_mode_state') || null;
                localStorage.removeItem('view_mode_state'); //用完删掉 

                var ti_id = op_id.split("-")[0];
                var pd_id = op_id.split("-")[1];
                var pd_code = op_id.split("-")[2];

                async.parallel({
                    data1: function(cb) {
                        async.waterfall([

                            function(cb) {
                                self.wf_data.id = ti_id;
                                self.wf_data.fetch().done(function() {
                                    cb(null, self.wf_data);
                                });
                            },
                            function(wf_data, cb) {
                                if (wf_data.attributes.ti) {
                                    self.ai.id = wf_data.attributes.ti.process_instance.collection_id;
                                    self.ai.fetch().done(function() {
                                        cb(null, self.ai);
                                    });
                                } else {
                                    cb(null, null);
                                }
                            },
                            function(ai, cb) {
                                if (ai) {
                                    self.team_data.id = ai.attributes.people;
                                    self.team_data.fetch().done(function() {
                                        cb(null, null); //不需要传递
                                    });
                                } else {
                                    cb(null, null);
                                }
                            },
                        ], cb);
                    },
                    data2: function(cb) {
                        self.ai_datas.url = '/admin/pm/assessment_instance/get_assessment_instance_json_4m';
                        self.ai_datas.fetch().done(function() {
                            cb(null, null);
                        });
                    },
                }, function(err, ret) {
                    if (self.wf_data.attributes.ti) {
                        self.wf01View.wf_data = self.wf_data;
                        self.wf01View.ai = self.ai;
                        self.wf01View.team_data = self.team_data;
                        self.wf01View.ai_datas = self.ai_datas;
                        if (self.view_mode_state) {
                            self.wf01View.view_mode = '';
                        }
                        self.wf01View.render();

                        $("body").pagecontainer("change", "#ai_wf", {
                            reverse: false,
                            changeHash: false,
                        });
                    } else {
                        window.location.href = "#godo1_view/" + self.wf_data.attributes.process_instance;
                    }
                })
            },
            go_do2: function(op_id, type) {
                var self = this;
                self.view_mode_state = localStorage.getItem('view_mode_state') || null;
                localStorage.removeItem('view_mode_state'); //用完删掉 
                var ti_id = op_id.split("-")[0];
                var pd_id = op_id.split("-")[1];
                var pd_code = op_id.split("-")[2];

                self.wf_data.id = ti_id;
                self.wf_data.fetch().done(function(data) {
                    if (self.wf_data.attributes.ti) {
                        self.dc.id = data.ti.process_instance.collection_id;
                        self.dc.fetch().done(function(data1) {
                            self.wf02View.wf_data = self.wf_data;
                            self.wf02View.dc = self.dc;
                            if (self.view_mode_state) {
                                self.wf02View.view_mode = '';
                            }
                            self.wf02View.render();

                            $("body").pagecontainer("change", "#dc_wf", {
                                reverse: false,
                                changeHash: false,
                            });
                        });
                    } else {
                        alert('该任务已经办理完成！');
                    }
                });
            },
            go_do3: function(op_id, type) {
                localStorage.setItem('ai_add_pi_back_url', window.location.href);
                var self = this;
                self.view_mode_state = localStorage.getItem('view_mode_state') || null;
                localStorage.removeItem('view_mode_state'); //用完删掉 
                var ti_id = op_id.split("-")[0];
                var pd_id = op_id.split("-")[1];
                var pd_code = op_id.split("-")[2];

                $.mobile.loading("show");
                self.wf03View.pre_render();

                async.parallel({
                    data1: function(cb) {
                        async.waterfall([

                            function(cb) {
                                self.wf_data.id = ti_id;
                                self.wf_data.fetch().done(function() {
                                    cb(null, self.wf_data);
                                });
                            },
                            function(wf_data, cb) {
                                if (wf_data.attributes.ti) {
                                    self.ai.id = wf_data.attributes.ti.process_instance.collection_id;
                                    self.ai.fetch().done(function() {
                                        cb(null, self.ai);
                                    });
                                } else {
                                    cb(null, null);
                                }
                            },
                            function(ai, cb) {
                                if (ai) {
                                    self.ai_prev.period = ai.attributes.period;
                                    self.ai_prev.people = ai.attributes.people;
                                    self.ai_prev.position = ai.attributes.position;

                                    self.ai_super.period = ai.attributes.period;
                                    self.ai_super.position = ai.attributes.position;

                                    self.aiSubCollection.period = ai.attributes.period;
                                    self.aiSubCollection.position = ai.attributes.position;

                                    self.ai_prev.fetch().done(function() {
                                        self.ai_super.fetch().done(function() {
                                            self.aiSubCollection.fetch().done(function() {
                                                cb(null, null);
                                            })
                                        });
                                    });
                                } else {
                                    cb(null, null);
                                }
                            },
                        ], cb);
                    },
                    data2: function(cb) {
                        self.ai_datas.url = '/admin/pm/assessment_instance/get_assessment_instance_json_4m';
                        self.ai_datas.fetch().done(function() {
                            cb(null, null);
                        });
                    },
                }, function(err, ret) {
                    if (self.wf_data.attributes.ti) {
                        self.wf03View.wf_data = self.wf_data;
                        self.wf03View.ai = self.ai;
                        self.wf03View.ai_prev = self.ai_prev;
                        self.wf03View.ai_super = self.ai_super;
                        self.wf03View.aiSubCollection = self.aiSubCollection;
                        self.wf03View.ai_datas = self.ai_datas;
                        if (self.view_mode_state) {
                            self.wf03View.view_mode = '';
                        }
                        self.wf03View.render();
                        $.mobile.loading("hide");

                        // if($("#login_people").val() == self.ai.attributes.people.toString()){
                        //     $("#ai_wf1-footer").show();
                        if (self.ai_prev.attributes.quantitative_pis || self.ai_prev.attributes.qualitative_pis) {
                            $("#btn-ai_wf1-prev").attr("disabled", false);
                        } else {
                            $("#btn-ai_wf1-prev").attr("disabled", true);
                        }

                        if (self.ai_super.attributes.quantitative_pis || self.ai_super.attributes.qualitative_pis) {
                            $("#btn-ai_wf1-super").attr("disabled", false);
                        } else {
                            $("#btn-ai_wf1-super").attr("disabled", true);
                        }
                        // }else{
                        //     $("#ai_wf1-footer").hide();
                        // }

                        $("body").pagecontainer("change", "#ai_wf1", {
                            reverse: false,
                            changeHash: false,
                        });
                    } else {
                        window.location.href = "#godo3_view/" + self.wf_data.attributes.process_instance;
                    }
                })
            },
            go_do4: function(op_id, type) {
                var self = this;
                // self.view_mode_state = localStorage.getItem('view_mode_state') || null;
                // localStorage.removeItem('view_mode_state'); //用完删掉 
                var ti_id = op_id.split("-")[0];
                var pd_id = op_id.split("-")[1];
                var pd_code = op_id.split("-")[2];
                async.parallel({
                    data1: function(cb) {
                        async.waterfall([

                            function(cb) {
                                $.get('/admin/tm/beyond_work/wf_task/' + ti_id, function(data) {
                                    if (data) {
                                        self.singleAttendanceResultChangeView.wf_data = data;
                                        cb(null, data)
                                    } else {
                                        cb(null, null);
                                    }
                                })

                            },
                            function(wf_data, cb) {
                                var attendance_id = wf_data.ti.process_instance.collection_id;
                                $.get('/admin/tm/tm_wf/get_collection_data/' + attendance_id, function(data) {
                                    if (data) {
                                        self.singleAttendanceResultChangeView.attendance = data;
                                        cb(null, data)
                                    } else {
                                        cb(null, null);
                                    }
                                })
                            },
                            function(data, cb) {
                                var people = data.people;
                                self.singleAttendanceResultChangeView.people = people;
                                async.parallel({
                                    model: function(cb) {
                                        self.tmattendance.url = '/admin/tm/cardrecord/m_bb/' + people;
                                        self.tmattendance.fetch().done(function() {
                                            self.tmattendances.remove(self.tmattendance);
                                            self.tmattendances.push(self.tmattendance);
                                            self.singleAttendanceResultChangeView.model = self.tmattendance;
                                            self.singleAttendanceResultChangeView.date = data ? data.change_date : '';
                                            cb(null, 'OK');

                                        })
                                    },
                                    get_work_time: function(cb) {
                                        $.get('/admin/tm/beyond_work/get_work_times/' + people, function(data) {
                                            var times = data.times;
                                            self.singleAttendanceResultChangeView.time_type = data.type;
                                            self.singleAttendanceResultChangeView.times = times;

                                            var type = data.type;
                                            var datas = data.datas;
                                            self.singleAttendanceResultChangeView.times_configs = [];
                                            if (type == '0') {
                                                var group = _.groupBy(datas, function(data) {
                                                    return data.work_time
                                                })
                                                _.each(group, function(ys, k) {
                                                    var o = {};
                                                    o.calendar_data = ys;
                                                    var f_d = _.find(times, function(time) {
                                                        return time._id == String(k)
                                                    });
                                                    o.time = f_d;
                                                    self.singleAttendanceResultChangeView.times_configs.push(o)
                                                })
                                            } else if (type == '1') {
                                                _.each(datas, function(dt) {
                                                    var o = {};
                                                    o.calendar_data = dt.calendar_data;
                                                    var f_d = _.find(times, function(time) {
                                                        return time._id == String(dt.work_time)
                                                    });
                                                    o.time = f_d;
                                                    self.singleAttendanceResultChangeView.times_configs.push(o)
                                                })
                                            } else if (type == '2') {
                                                var group = _.groupBy(datas, function(data) {
                                                    return data.work_time
                                                })
                                                _.each(group, function(ys, k) {
                                                    var o = {};
                                                    o.calendar_data = ys;
                                                    var f_d = _.find(times, function(time) {
                                                        return time._id == String(k)
                                                    });
                                                    o.time = f_d;
                                                    self.singleAttendanceResultChangeView.times_configs.push(o)
                                                })
                                            };
                                            cb(null, 'OK');

                                        })
                                    },
                                }, cb)
                            }
                        ], cb);
                    }
                }, function(err, ret) {
                    var is_self = self.singleAttendanceResultChangeView.people == String($("#login_people").val());
                    if (is_self) {
                        self.singleAttendanceResultChangeView.view_mode = '';

                    } else {
                        self.singleAttendanceResultChangeView.view_mode = 'deal_with';

                    }
                    self.singleAttendanceResultChangeView.is_self = is_self;
                    self.singleAttendanceResultChangeView.mode = type;

                    self.singleAttendanceResultChangeView.render();
                    if (type == '2') {
                        $("#personal_wf_attend-content").find("button").attr("disabled", true);
                        $("#personal_wf_attend-content").find("input").attr("disabled", true);
                        $("#personal_wf_attend-content").find("textarea").attr("disabled", true);

                    }
                    //把 a 换成 span， 避免点那个滑块的时候页面跳走。
                    $(".ui-flipswitch a").each(function() {
                        $(this).replaceWith("<span class='" + $(this).attr('class') + "'></span>");
                    });
                    if (!is_self) {
                        $("#change_no_card_on").attr("disabled", true);
                        $("#change_reason").attr("disabled", true);

                    }
                    $("body").pagecontainer("change", "#wf_attendance", {
                        reverse: false,
                        changeHash: false,
                    });
                })
            },
            go_view4: function(pi_id) { //考勤异常流程查看
                var self = this;
                async.parallel({
                    data1: function(cb) {
                        async.waterfall([

                            function(cb) {
                                $.get('/admin/tm/tm_wf/view_4m/' + pi_id, function(data) {
                                    if (data) {
                                        self.singleAttendanceResultChange2View.wf_data = data;
                                        self.singleAttendanceResultChange2View.attendance = data.paep;
                                        cb(null, data)
                                    } else {
                                        cb(null, null);
                                    }
                                })

                            },
                            function(data, cb) {
                                var people = data.paep.people._id;
                                self.singleAttendanceResultChange2View.people = people;
                                async.parallel({
                                    model: function(cb) {
                                        self.tmattendance.url = '/admin/tm/cardrecord/m_bb/' + people;
                                        self.tmattendance.fetch().done(function() {
                                            self.tmattendances.remove(self.tmattendance);
                                            self.tmattendances.push(self.tmattendance);
                                            self.singleAttendanceResultChange2View.model = self.tmattendance;
                                            self.singleAttendanceResultChange2View.date = data ? data.change_date : '';
                                            cb(null, 'OK');

                                        })
                                    },
                                    get_work_time: function(cb) {
                                        $.get('/admin/tm/beyond_work/get_work_times/' + people, function(data) {
                                            var times = data.times;
                                            self.singleAttendanceResultChange2View.time_type = data.type;
                                            self.singleAttendanceResultChange2View.times = times;

                                            var type = data.type;
                                            var datas = data.datas;
                                            self.singleAttendanceResultChange2View.times_configs = [];
                                            if (type == '0') {
                                                var group = _.groupBy(datas, function(data) {
                                                    return data.work_time
                                                })
                                                _.each(group, function(ys, k) {
                                                    var o = {};
                                                    o.calendar_data = ys;
                                                    var f_d = _.find(times, function(time) {
                                                        return time._id == String(k)
                                                    });
                                                    o.time = f_d;
                                                    self.singleAttendanceResultChange2View.times_configs.push(o)
                                                })
                                            } else if (type == '1') {
                                                _.each(datas, function(dt) {
                                                    var o = {};
                                                    o.calendar_data = dt.calendar_data;
                                                    var f_d = _.find(times, function(time) {
                                                        return time._id == String(dt.work_time)
                                                    });
                                                    o.time = f_d;
                                                    self.singleAttendanceResultChange2View.times_configs.push(o)
                                                })
                                            } else if (type == '2') {
                                                var group = _.groupBy(datas, function(data) {
                                                    return data.work_time
                                                })
                                                _.each(group, function(ys, k) {
                                                    var o = {};
                                                    o.calendar_data = ys;
                                                    var f_d = _.find(times, function(time) {
                                                        return time._id == String(k)
                                                    });
                                                    o.time = f_d;
                                                    self.singleAttendanceResultChange2View.times_configs.push(o)
                                                })
                                            };
                                            cb(null, 'OK');

                                        })
                                    },
                                }, cb)
                            }
                        ], cb);
                    }
                }, function(err, ret) {
                    $("body").pagecontainer("change", "#wf_attendance_view", {
                        reverse: false,
                        changeHash: false,
                    });
                    self.singleAttendanceResultChange2View.render();
                    $("#personal_wf_attend_view-content").find("button").attr("disabled", true);
                    $("#personal_wf_attend_view-content").find("input").attr("disabled", true);
                    $("#personal_wf_attend_view-content").find("textarea").attr("disabled", true);
                    //把 a 换成 span， 避免点那个滑块的时候页面跳走。
                    $(".ui-flipswitch a").each(function() {
                        $(this).replaceWith("<span class='" + $(this).attr('class') + "'></span>");
                    });

                    $("#personal_wf_attend_view-content #change_no_card_on").attr("disabled", true);
                    $("#personal_wf_attend_view-content #change_reason").attr("disabled", true);

                })
            },

            go_do11: function(op_id, type) {
                var self = this;
                // self.view_mode_state = localStorage.getItem('view_mode_state') || null;
                // localStorage.removeItem('view_mode_state'); //用完删掉 
                if (type == 'view') {

                    async.parallel({
                        data1: function(cb) {
                            async.waterfall([

                                function(cb) {
                                    $.get('/admin/tm/tm_wf/hr_view_4m/' + op_id, function(data) {
                                        if (data) {
                                            self.singleHrAttendanceResultChangeView.wf_data = data;
                                            cb(null, data)
                                        } else {
                                            cb(null, null);
                                        }
                                    })

                                },
                                function(wf_data, cb) {
                                    var attendance_id = wf_data.paep._id;
                                    $.get('/admin/tm/tm_wf/get_hr_collection_data/' + attendance_id, function(data) {
                                        if (data) {
                                            self.singleHrAttendanceResultChangeView.attendance = data;
                                            cb(null, data)
                                        } else {
                                            cb(null, null);
                                        }
                                    })
                                },

                            ], cb);
                        }
                    }, function(err, ret) {
                        self.singleHrAttendanceResultChangeView.view_mode = 'view';
                        self.singleHrAttendanceResultChangeView.render();
                        //把 a 换成 span， 避免点那个滑块的时候页面跳走。
                        $(".ui-flipswitch a").each(function() {
                            $(this).replaceWith("<span class='" + $(this).attr('class') + "'></span>");
                        });
                        $("body").pagecontainer("change", "#wf_attendance_batch", {
                            reverse: false,
                            changeHash: false,
                        });
                    })
                } else {
                    var ti_id = op_id.split("-")[0];
                    var pd_id = op_id.split("-")[1];
                    var pd_code = op_id.split("-")[2];
                    $.get('/admin/pm/assessment_instance/summary/edit_m/' + ti_id, function(data) {
                        if (data.code == "OK") {
                            if (data.msg.task_state != 'FINISHED') {
                                var type = "edit";

                                async.parallel({
                                    data1: function(cb) {
                                        async.waterfall([

                                            function(cb) {
                                                $.get('/admin/tm/beyond_work/wf_task/' + ti_id, function(data) {
                                                    if (data) {
                                                        self.singleHrAttendanceResultChangeView.wf_data = data;
                                                        cb(null, data)
                                                    } else {
                                                        cb(null, null);
                                                    }
                                                })

                                            },
                                            function(wf_data, cb) {
                                                var attendance_id = wf_data.ti.process_instance.collection_id;
                                                $.get('/admin/tm/tm_wf/get_hr_collection_data/' + attendance_id, function(data) {
                                                    if (data) {
                                                        self.singleHrAttendanceResultChangeView.attendance = data;
                                                        cb(null, data)
                                                    } else {
                                                        cb(null, null);
                                                    }
                                                })
                                            },

                                        ], cb);
                                    }
                                }, function(err, ret) {
                                    self.singleHrAttendanceResultChangeView.view_mode = 'deal_with';
                                    self.singleHrAttendanceResultChangeView.render();
                                    //把 a 换成 span， 避免点那个滑块的时候页面跳走。
                                    $(".ui-flipswitch a").each(function() {
                                        $(this).replaceWith("<span class='" + $(this).attr('class') + "'></span>");
                                    });
                                    $("body").pagecontainer("change", "#wf_attendance_batch", {
                                        reverse: false,
                                        changeHash: false,
                                    });
                                })
                            } else {
                                var type = "view";
                                var process_instance_id = data.msg.process_instance;
                                window.location.href = "#godo11/" + process_instance_id + "/view";
                            }

                        } else {
                            alert(data.code)
                        }
                    })

                }

            },
            go_do8: function(op_id, type) {
                var ti_id = op_id.split("-")[0];
                var pd_id = op_id.split("-")[1];
                var pd_code = op_id.split("-")[2];
                window.location.href = '/m#leave_form_t/' + ti_id + '/T';
            },
            go_do9: function(op_id, type) {

                var ti_id = op_id.split("-")[0];
                var pd_id = op_id.split("-")[1];
                var pd_code = op_id.split("-")[2];
                window.location.href = '/m#back_leave_form_t/' + ti_id + '/T';
            },
            go_dofree: function(op_id, type) {
                window.location.href = '#wf_approve_edit/' + op_id;
            },
            // prev_ai: function(period, people, position) {
            prev_ai: function() {
                var self = this;
                // self.ai_prev.period = period;
                // self.ai_prev.people = people;
                // self.ai_prev.position = position;

                $("body").pagecontainer("change", "#ai_add_pi", {
                    reverse: false,
                    changeHash: false,
                });

                $("#btn_add_pi_prev").show();
                $("#btn_add_my_pi").hide();
                $("#ai_add_pi_title").html('从上期复制');

                $.mobile.loading("show");
                self.aiPrevView.pre_render();

                // self.ai_prev.fetch().done(function() {
                self.piCollection.fetch().done(function() {
                        self.aiPrevView.pi_source = '1';
                        self.aiPrevView.ai_data = self.ai;
                        self.aiPrevView.pis = self.piCollection;
                        self.aiPrevView.model = self.ai_prev;
                        self.aiPrevView.peoples_data = self.ai_datas.attributes.peoples;
                        self.aiPrevView.render();
                        $.mobile.loading("hide");
                    })
                    // })
            },
            // super_ai: function(period, position) {
            super_ai: function() {
                var self = this;
                // self.ai_super.period = period;
                // self.ai_super.position = position;

                $("body").pagecontainer("change", "#ai_add_pi", {
                    reverse: false,
                    changeHash: false,
                });
                $("#btn_add_pi_prev").show();
                $("#btn_add_my_pi").hide();
                $("#ai_add_pi_title").html('从上级复制');

                $.mobile.loading("show");
                self.aiPrevView.pre_render();

                // self.ai_super.fetch().done(function() {
                self.piCollection.fetch().done(function() {
                        self.aiPrevView.pi_source = '5';
                        self.aiPrevView.ai_data = self.ai;
                        self.aiPrevView.pis = self.piCollection;
                        self.aiPrevView.model = self.ai_super;
                        self.aiPrevView.peoples_data = self.ai_datas.attributes.peoples;
                        self.aiPrevView.render();
                        $.mobile.loading("hide");
                    })
                    // })
            },
            //----------指标选择----------//
            pis_select: function() {
                var self = this;

                self.piCollection.fetch().done(function() {
                    self.myPICollection.fetch().done(function() {
                        self.piSelectView.ai_data = self.ai;
                        self.piSelectView.my_pis = self.myPICollection;
                        self.piSelectView.peoples_data = self.ai_datas.attributes.peoples;
                        self.piSelectView.render();
                    })
                })

                $("body").pagecontainer("change", "#pis_select", {
                    reverse: false,
                    changeHash: false,
                });
            },
            //新建指标
            create_pi: function() {
                var self = this;


                $("body").pagecontainer("change", "#ai_add_pi", {
                    reverse: false,
                    changeHash: false,
                });
                $("#btn_add_pi_prev").hide();
                $("#btn_add_my_pi").show();
                $("#ai_add_pi_title").html('新建指标');

                $.mobile.loading("show");
                self.piView.pre_render();

                self.pi.attributes.pi_name = '我新建的指标';
                self.pi.save().done(function() {
                    self.pi_datas.url = '/admin/pm/pi_library/get_pi_datas_4m';
                    self.pi_datas.fetch().done(function() {
                        self.piView.model = self.pi;
                        self.piView.ai_data = self.ai;
                        self.piView.pi_datas = self.pi_datas;
                        self.piView.render();
                        $.mobile.loading("hide");
                    });
                })
            },

            go_view0: function(op_id, type) {
                window.location.href = "#handle_form_view/" + op_id;
            },
            go_view1: function(op_id, type) {
                var self = this;
                //判断是否时待办进入，还是返回
                self.view_mode_state = localStorage.getItem('view_mode_state') || null;
                localStorage.removeItem('view_mode_state'); //用完删掉 

                var pi_id = op_id.split("-")[0];
                var pd_id = op_id.split("-")[1];
                var pd_code = op_id.split("-")[2];

                async.parallel({
                    data1: function(cb) {
                        async.waterfall([

                            function(cb) {
                                self.wf_data_v.id = pi_id;
                                self.wf_data_v.fetch().done(function() {
                                    cb(null, self.wf_data_v);
                                });
                            },
                            function(wf_data_v, cb) {
                                self.ai.id = wf_data_v.attributes.pi.collection_id;
                                self.ai.fetch().done(function() {
                                    cb(null, self.ai);
                                });
                            },
                            function(ai, cb) {
                                if (ai) {
                                    self.team_data.id = ai.attributes.people;
                                    self.team_data.fetch().done(function() {
                                        cb(null, null); //不需要传递
                                    });
                                } else {
                                    cb(null, null);
                                }
                            },
                        ], cb);
                    },
                    data2: function(cb) {
                        self.ai_datas.url = '/admin/pm/assessment_instance/get_assessment_instance_json_4m';
                        self.ai_datas.fetch().done(function() {
                            cb(null, null);
                        });
                    },
                }, function(err, ret) {
                    self.wf01View.wf_data = self.wf_data_v;
                    self.wf01View.ai = self.ai;
                    self.wf01View.team_data = self.team_data;
                    self.wf01View.ai_datas = self.ai_datas;
                    if (self.view_mode_state) {
                        self.wf01View.view_mode = '';
                    }
                    self.wf01View.mode = 'view';
                    self.wf01View.render();

                    $("body").pagecontainer("change", "#ai_wf", {
                        reverse: false,
                        changeHash: false,
                    });
                })
            },
            go_view2: function(op_id, type) {
                var self = this;
                self.view_mode_state = localStorage.getItem('view_mode_state') || null;
                localStorage.removeItem('view_mode_state'); //用完删掉 
                var ti_id = op_id.split("-")[0];
                var pd_id = op_id.split("-")[1];
                var pd_code = op_id.split("-")[2];

                self.wf_data_v.id = ti_id;
                self.wf_data_v.fetch().done(function(data) {
                    self.dc.id = self.wf_data_v.attributes.pi.collection_id;
                    self.dc.fetch().done(function(data1) {
                        self.wf02View.wf_data = self.wf_data_v;
                        self.wf02View.dc = self.dc;
                        if (self.view_mode_state) {
                            self.wf02View.view_mode = '';
                        }
                        self.wf02View.mode = 'view';
                        self.wf02View.render();

                        $("body").pagecontainer("change", "#dc_wf", {
                            reverse: false,
                            changeHash: false,
                        });
                    });
                });
            },
            go_view3: function(op_id, type) {
                localStorage.setItem('ai_add_pi_back_url', window.location.href);
                var self = this;
                self.view_mode_state = localStorage.getItem('view_mode_state') || null;
                localStorage.removeItem('view_mode_state'); //用完删掉 
                var pi_id = op_id.split("-")[0];
                var pd_id = op_id.split("-")[1];
                var pd_code = op_id.split("-")[2];

                $.mobile.loading("show");
                self.wf03View.pre_render();

                async.parallel({
                    data1: function(cb) {
                        async.waterfall([

                            function(cb) {
                                self.wf_data_v.id = pi_id;
                                self.wf_data_v.fetch().done(function() {
                                    cb(null, self.wf_data_v);
                                });
                            },
                            function(wf_data_v, cb) {
                                self.ai.id = wf_data_v.attributes.pi.collection_id;
                                self.ai.fetch().done(function() {
                                    cb(null, self.ai);
                                });
                            },
                            function(ai, cb) {
                                if (ai) {
                                    self.ai_prev.period = ai.attributes.period;
                                    self.ai_prev.people = ai.attributes.people;
                                    self.ai_prev.position = ai.attributes.position;

                                    self.ai_super.period = ai.attributes.period;
                                    self.ai_super.position = ai.attributes.position;

                                    self.aiSubCollection.period = ai.attributes.period;
                                    self.aiSubCollection.position = ai.attributes.position;

                                    self.ai_prev.fetch().done(function() {
                                        self.ai_super.fetch().done(function() {
                                            self.aiSubCollection.fetch().done(function() {
                                                cb(null, null);
                                            })
                                        });
                                    });
                                } else {
                                    cb(null, null);
                                }
                            },
                        ], cb);
                    },
                    data2: function(cb) {
                        self.ai_datas.url = '/admin/pm/assessment_instance/get_assessment_instance_json_4m';
                        self.ai_datas.fetch().done(function() {
                            cb(null, null);
                        });
                    },
                }, function(err, ret) {
                    self.wf03View.wf_data = self.wf_data_v;
                    self.wf03View.ai = self.ai;
                    self.wf03View.ai_prev = self.ai_prev;
                    self.wf03View.ai_super = self.ai_super;
                    self.wf03View.aiSubCollection = self.aiSubCollection;
                    self.wf03View.ai_datas = self.ai_datas;
                    if (self.view_mode_state) {
                        self.wf03View.view_mode = '';
                    }
                    self.wf03View.mode = 'view';
                    self.wf03View.render();
                    $.mobile.loading("hide");

                    if (self.ai_prev.attributes.quantitative_pis || self.ai_prev.attributes.qualitative_pis) {
                        $("#btn-ai_wf1-prev").attr("disabled", false);
                    } else {
                        $("#btn-ai_wf1-prev").attr("disabled", true);
                    }

                    if (self.ai_super.attributes.quantitative_pis || self.ai_super.attributes.qualitative_pis) {
                        $("#btn-ai_wf1-super").attr("disabled", false);
                    } else {
                        $("#btn-ai_wf1-super").attr("disabled", true);
                    }

                    $("body").pagecontainer("change", "#ai_wf1", {
                        reverse: false,
                        changeHash: false,
                    });
                })
            },
            go_view8: function(op_id) {
                window.location.href = "#leave_form_p/" + op_id + "/L";
            },
            go_view9: function(op_id) {
                window.location.href = "#back_leave_form_p/" + op_id + "/L";
            },
            go_view11: function(op_id) {
                window.location.href = "#godo11/" + op_id + "/view";
            },
            go_view12: function(op_id) {
                window.location.href = "#godo12/" + op_id + "/view";
            },
            go_view13: function(op_id) {
                window.location.href = "#godo13/" + op_id + "/view";
            },
            go_view14: function(op_id) {
                window.location.href = "#godo14/" + op_id + "/view";
            },
            init_views: function() {
                var self = this;

                self.todoListView = new ToDoListView({
                    el: "#todo_list",
                    collection: self.todoList
                })

                self.wf01View = new AIWF01View({
                    el: "#ai_wf",
                })

                self.wf02View = new AIWF02View({
                    el: "#dc_wf",
                })

                self.wf03View = new AIWF03View({
                    el: "#ai_wf1",
                })

                self.transConfirmView = new TransConfirmView({
                    el: "#trans_confirm",
                })
                self.singleAttendanceResultChangeView = new AttendanceResultChangeView({
                    el: "#personal_wf_attend-content",
                });
                self.singleHrAttendanceResultChangeView = new HrAttendanceResultChangeView({
                    el: "#personal_wf_attend_batch-content",
                });
                self.singleAttendanceResultChange2View = new AttendanceResultChange2View({
                    el: "#personal_wf_attend_view-content",
                });

                self.aiPrevView = new AIPrevView();

                self.piSelectView = new AIPISelectView({
                    el: "#pis_select-content",
                    collection: self.piCollection,
                });

                self.piView = new PIView();

            },
            init_models: function() {
                var self = this;
                self.wf_data = new WFDataModel();
                self.wf_data_v = new WFDataViewModel();
                self.ai = new AIModel();
                self.ai_prev = new AIPrevModel();
                self.ai_super = new AISuperModel();
                self.pi = new PIModel();
                self.team_data = new TeamModel();
                self.ai_datas = new AIDatasModel();
                self.pi_datas = new PIDatasModel();
                self.dc = new DataCollectionModel();
                this.tmattendance = new TmAttendanceModel();

            },
            init_collections: function() {
                var self = this;
                self.todoList = new ToDoListCollection();
                self.tmattendances = new TmAttendanceCollection(); //所有人
                self.piCollection = new PICollection();
                self.myPICollection = new MYPICollection();
                self.aiSubCollection = new AISubCollection();
                self.tfList = new TaskFinishedListCollection();
                self.c_wf_approve = new WFApproveCollection(); //全体相关的流程
                self.c_wf_my_workflow = new WFMyWorkflowCollection(); //我的相关的流程
            },
            init_data: function() {
                // var self = this;
                // this.todoList.fetch();
            },
        });

        return ToDoRouter;
    })