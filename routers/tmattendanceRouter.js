// myteam router
// ====================
define(["jquery", "backbone", "handlebars", "lzstring", "async",
    "../collections/TmAttendanceCollection",
    "../collections/TMAbsenceOfThreeCollection",
    "../views/tm_attendance/PeopleAttendanceResult",
    "../views/tm_attendance/AttendanceResultChangeView",
    "../views/tm_attendance/TMAbsenceOfThreeView",
    "../views/tm_attendance/BeyondOfWorkView",
    "../views/tm_attendance/WorkOfTravelView",
    "../views/tm_attendance/WorkOfCityView",
    "../views/tm_attendance/CitiesView",
    "../views/tm_attendance/MyCardRecordView",
    "../views/tm_attendance/BeyondOfWorkReportView",
    "../views/TransConfirmView",
    "../models/WFDataModel",
    "../models/TmAttendanceModel",
    "../models/TMAbsenceOfThreeModel",

], function($, Backbone, Handlebars, LZString, async,
    TmAttendanceCollection,
    TMAbsenceOfThreeCollection,
    PeopleAttendanceResult,
    AttendanceResultChangeView,
    TMAbsenceOfThreeView,
    BeyondOfWorkView,
    WorkOfTravelView,
    WorkOfCityView,
    CitiesView,
    MyCardRecordView,
    BeyondOfWorkReportView,
    TransConfirmView,
    WFDataModel,
    TmAttendanceModel,
    TMAbsenceOfThreeModel
) {
    var TmAttendanceRouter = Backbone.Router.extend({
        initialize: function() {
            var self = this;
            self.init_models();
            self.init_collections();
            self.init_views();
            console.info('app message: tm attendance router initialized');
        },
        routes: {
            "attendance": "attendance",
            "wf_three": "wf_three",
            "godo5/:op_id/:type": "go_do5", //员工加班流程
            "godo6/:op_id/:type": "go_do6", //外出差旅流程
            "godo7/:op_id/:type": "go_do7", //市区公干流程
            "cities/:task_id": "cities", //城市数据
            "attend_report": "attend_report", //加班统计报表
            "card_record": "card_record" //打卡记录列表查看

        },

        //--------考勤日志--------//
        attendance: function() {
            var self = this
            var login_people = $("#login_people").val();
            this.tmattendance.url = '/admin/tm/cardrecord/m_bb/' + login_people;
            this.tmattendance.fetch().done(function() {
                self.tmattendances.remove(self.tmattendance);
                self.tmattendances.push(self.tmattendance);
                self.PeopleAttendanceResult.model = self.tmattendance;
                self.PeopleAttendanceResult.render();
                $("body").pagecontainer("change", "#attendance", {
                    reverse: false,
                    changeHash: false,
                });
            })
        },
        wf_three: function() {
            var self = this;
            $.get('/admin/tm/beyond_work/wf_three_data_4_m', function(data) {
                if (data) {
                    self.singleTMAbsenceOfThreeView.wf_data = data;

                }
                self.singleTMAbsenceOfThreeView.render();
                $("body").pagecontainer("change", "#wf_three", {
                    reverse: false,
                    changeHash: false,
                });

            })

        },
        go_do5: function(op_id, type, mode) {
            var self = this;
            var ti_id = op_id.split("-")[0];
            var pd_id = op_id.split("-")[1];
            var pd_code = op_id.split("-")[2];
            async.parallel({
                data1: function(cb) {
                    async.waterfall([

                        function(cb) {
                            $.get('/admin/tm/beyond_work/edit_m/' + ti_id, function(data) {
                                if (data) {
                                    self.singleBeyondOfWorkView.wf_data = data;
                                    cb(null, data)
                                } else {
                                    cb(null, null);
                                }
                            })

                        },
                        function(data, cb) {
                            var people = data.leave.people._id;
                            self.singleBeyondOfWorkView.people = people;
                            $.get('/admin/tm/beyond_work/get_work_times/' + people, function(data) {
                                var times = data.times;
                                self.singleBeyondOfWorkView.time_type = data.type;
                                self.singleBeyondOfWorkView.times = times;

                                var type = data.type;
                                var datas = data.datas;
                                self.singleBeyondOfWorkView.times_configs = [];
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
                                        self.singleBeyondOfWorkView.times_configs.push(o)
                                    })
                                } else if (type == '1') {
                                    _.each(datas, function(dt) {
                                        var o = {};
                                        o.calendar_data = dt.calendar_data;
                                        var f_d = _.find(times, function(time) {
                                            return time._id == String(dt.work_time)
                                        });
                                        o.time = f_d;
                                        self.singleBeyondOfWorkView.times_configs.push(o)
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
                                        self.singleBeyondOfWorkView.times_configs.push(o)
                                    })
                                };
                                cb(null, 'OK');

                            })
                        }
                    ], cb);
                }
            }, function(err, ret) {
                var is_self = self.singleBeyondOfWorkView.people == String($("#login_people").val());
                if (is_self) {
                    self.singleBeyondOfWorkView.view_mode = '';

                } else {
                    self.singleBeyondOfWorkView.view_mode = 'deal_with';

                }
                self.singleBeyondOfWorkView.is_full_day = true;
                self.singleBeyondOfWorkView.page_mode = 'wf_three';
                self.singleBeyondOfWorkView.mode = type;

                self.singleBeyondOfWorkView.render();
                //把 a 换成 span， 避免点那个滑块的时候页面跳走。
                $(".ui-flipswitch a").each(function() {
                    $(this).replaceWith("<span class='" + $(this).attr('class') + "'></span>");
                });
                if (!is_self) {
                    $("#category").attr("disabled", true);
                    $("#create_start_date,#create_end_date,#reason").attr("disabled", true);
                    $("#exchange").show();
                }
                if (type == '2') {
                    $("#personal_wf_beyond_of_work-content").find("textarea").attr("disabled", true);
                    $("#wf_beyond_of_work_title").html("加班流程查看")
                    $("#personal_wf_beyond_of_work-content").find("button").attr("disabled", true);
                    $("#personal_wf_beyond_of_work-content").find("input").attr("disabled", true);
                    $("#personal_wf_beyond_of_work-content").find("a").attr("disabled", true);
                    $("#personal_wf_beyond_of_work-content").find("select").attr("disabled", true);
                    $("#personal_wf_beyond_of_work-content").find("select[id='is_full_day']").parent().parent().parent().parent().remove() // self.render();

                }
                $("body").pagecontainer("change", "#wf_beyond_of_work", {
                    reverse: false,
                    changeHash: false,
                });
            })

        },
        go_do6: function(op_id, type) {
            var self = this;
            var ti_id = op_id.split("-")[0];
            var pd_id = op_id.split("-")[1];
            var pd_code = op_id.split("-")[2];
            async.parallel({
                data1: function(cb) {
                    async.waterfall([

                        function(cb) {
                            $.get('/admin/tm/work_travel/edit_m/' + ti_id, function(data) {
                                if (data) {
                                    self.singleWorkOfTravelView.wf_data = data;
                                    cb(null, data)
                                } else {
                                    cb(null, null);
                                }
                            })

                        },
                        function(data, cb) {
                            var people = data.leave.people._id;
                            self.singleWorkOfTravelView.people = people;
                            $.get('/admin/tm/beyond_work/get_work_times/' + people, function(data) {
                                var times = data.times;
                                self.singleWorkOfTravelView.time_type = data.type;
                                self.singleWorkOfTravelView.times = times;

                                var type = data.type;
                                var datas = data.datas;
                                self.singleWorkOfTravelView.times_configs = [];
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
                                        self.singleWorkOfTravelView.times_configs.push(o)
                                    })
                                } else if (type == '1') {
                                    _.each(datas, function(dt) {
                                        var o = {};
                                        o.calendar_data = dt.calendar_data;
                                        var f_d = _.find(times, function(time) {
                                            return time._id == String(dt.work_time)
                                        });
                                        o.time = f_d;
                                        self.singleWorkOfTravelView.times_configs.push(o)
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
                                        self.singleWorkOfTravelView.times_configs.push(o)
                                    })
                                };
                                cb(null, 'OK');

                            })
                        }
                    ], cb);
                }
            }, function(err, ret) {
                var is_self = self.singleWorkOfTravelView.people == String($("#login_people").val());
                if (is_self) {
                    self.singleWorkOfTravelView.view_mode = '';

                } else {
                    self.singleWorkOfTravelView.view_mode = 'deal_with';

                }
                self.singleWorkOfTravelView.is_full_day = true;
                self.singleWorkOfTravelView.page_mode = 'wf_three';
                self.singleWorkOfTravelView.mode = type;

                self.singleWorkOfTravelView.render();
                //把 a 换成 span， 避免点那个滑块的时候页面跳走。
                $(".ui-flipswitch a").each(function() {
                    $(this).replaceWith("<span class='" + $(this).attr('class') + "'></span>");
                });
                if (!is_self) {
                    $("#reason").attr("disabled", true);
                    $("#create_start_date,#create_end_date,#reason").attr("disabled", true);
                    $("#create_destination_data").find("h2").html("查看出差目的地");
                }
                if (type == '2') {
                    $("#personal_wf_work_of_travel-content").find("textarea").attr("disabled", true);

                    $("#wf_work_of_travel_title").html("出差流程查看")
                    $("#personal_wf_work_of_travel-content").find("button").attr("disabled", true);
                    $("#personal_wf_work_of_travel-content").find("input").attr("disabled", true);
                    $("#personal_wf_work_of_travel-content").find("a").attr("disabled", true);
                    $("#personal_wf_work_of_travel-content").find("select").attr("disabled", true);
                    $("#personal_wf_work_of_travel-content").find("select[id='is_full_day']").parent().parent().parent().parent().remove() // self.render();
                    $("#personal_wf_work_of_travel-content").find("a[id='create_destination_data']").parent().remove();

                }
                $("body").pagecontainer("change", "#wf_work_of_travel", {
                    reverse: false,
                    changeHash: false,
                });
            })

        },

        go_do7: function(op_id, type) {
            var self = this;
            var ti_id = op_id.split("-")[0];
            var pd_id = op_id.split("-")[1];
            var pd_code = op_id.split("-")[2];
            async.parallel({
                data1: function(cb) {
                    async.waterfall([

                        function(cb) {
                            $.get('/admin/tm/work_city/edit_m/' + ti_id, function(data) {
                                if (data) {
                                    self.singleWorkOfCityView.wf_data = data;
                                    cb(null, data)
                                } else {
                                    cb(null, null);
                                }
                            })

                        },
                        function(data, cb) {
                            var people = data.leave.people._id;
                            self.singleWorkOfCityView.people = people;
                            $.get('/admin/tm/beyond_work/get_work_times/' + people, function(data) {
                                var times = data.times;
                                self.singleWorkOfCityView.time_type = data.type;
                                self.singleWorkOfCityView.times = times;

                                var type = data.type;
                                var datas = data.datas;
                                self.singleWorkOfCityView.times_configs = [];
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
                                        self.singleWorkOfCityView.times_configs.push(o)
                                    })
                                } else if (type == '1') {
                                    _.each(datas, function(dt) {
                                        var o = {};
                                        o.calendar_data = dt.calendar_data;
                                        var f_d = _.find(times, function(time) {
                                            return time._id == String(dt.work_time)
                                        });
                                        o.time = f_d;
                                        self.singleWorkOfCityView.times_configs.push(o)
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
                                        self.singleWorkOfCityView.times_configs.push(o)
                                    })
                                };
                                cb(null, 'OK');

                            })
                        }
                    ], cb);
                }
            }, function(err, ret) {
                var is_self = self.singleWorkOfCityView.people == String($("#login_people").val());
                if (is_self) {
                    self.singleWorkOfCityView.view_mode = '';

                } else {
                    self.singleWorkOfCityView.view_mode = 'deal_with';

                }
                self.singleWorkOfCityView.is_full_day = true;
                self.singleWorkOfCityView.page_mode = 'wf_three';
                self.singleWorkOfCityView.mode = type;

                self.singleWorkOfCityView.render();
                //把 a 换成 span， 避免点那个滑块的时候页面跳走。
                $(".ui-flipswitch a").each(function() {
                    $(this).replaceWith("<span class='" + $(this).attr('class') + "'></span>");
                });
                if (!is_self) {
                    $("#reason").attr("disabled", true);
                    $("#create_start_date,#create_end_date,#reason").attr("disabled", true);

                }
                if (type == '2') {
                    $("#personal_wf_work_of_city-content").find("textarea").attr("disabled", true);
                    $("#wf_work_of_city_title").html("市区公干流程查看")
                    $("#personal_wf_work_of_city-content").find("button").attr("disabled", true);
                    $("#personal_wf_work_of_city-content").find("input").attr("disabled", true);
                    $("#personal_wf_work_of_city-content").find("a").attr("disabled", true);
                    $("#personal_wf_work_of_city-content").find("select").attr("disabled", true);
                    $("#personal_wf_work_of_city-content").find("select[id='is_full_day']").parent().parent().parent().parent().remove() // self.render();

                }
                $("body").pagecontainer("change", "#wf_work_of_city", {
                    reverse: false,
                    changeHash: false,
                });
            })

        },
        cities: function(ti_id) {
            var self = this;
            async.parallel({
                data1: function(cb) {
                    $.get('/admin/tm/work_travel/edit_m/' + ti_id, function(data) {
                        if (data) {
                            self.singleCitiesView.wf_data = data;
                            var goto_url = (data.ti._id + '-' + data.pd._id + '-') + (data.pd ? data.pd.process_code : '');
                            var back_url = '#godo6/' + goto_url + '/' + 1;
                            self.singleCitiesView.back_url = back_url;
                            cb(null, data)
                        } else {
                            cb(null, null);
                        }
                    })
                }
            }, function(err, ret) {
                self.page_mode = 'destination_selected';
                self.singleCitiesView.render();
                $("#show_destinations").find("a[id='go_back']").attr("href", self.singleCitiesView.back_url);
                $("body").pagecontainer("change", "#show_destinations", {
                    reverse: false,
                    changeHash: false,
                });
            })

        },
        card_record: function() {
            var self = this;
            $.get("/admin/tm/cardrecord/record_4_m", function(data) {
                if (data) {
                    self.singleMyCardRecordView.record_data = data;
                    self.singleMyCardRecordView.render();
                    $("body").pagecontainer("change", "#show_my_card_record", {
                        reverse: false,
                        changeHash: false,
                    });
                }
            })

        },
        attend_report: function() {
            var self = this;
            $.get("/admin/tm/beyond_work/beyond_of_work_4_m", function(data) {
                if (data) {
                    self.singleBeyondOfWorkReportView.data = data;
                    self.singleBeyondOfWorkReportView.render();
                    $("body").pagecontainer("change", "#show_beyond_of_work_report", {
                        reverse: false,
                        changeHash: false,
                    });
                }
            })

        },
        init_views: function() {
            var self = this;
            this.PeopleAttendanceResult = new PeopleAttendanceResult({
                el: "#personal_attend_list-content",
            });
            this.singleTMAbsenceOfThreeView = new TMAbsenceOfThreeView({
                el: "#personal_wf_three_list-content",
            });
            this.singleBeyondOfWorkView = new BeyondOfWorkView({
                el: "#personal_wf_beyond_of_work-content",
            });
            this.singleWorkOfTravelView = new WorkOfTravelView({
                el: "#personal_wf_work_of_travel-content",
            });
            this.singleWorkOfCityView = new WorkOfCityView({
                el: "#personal_wf_work_of_city-content",
            });
            this.singleCitiesView = new CitiesView({
                el: "#show_destinations-content",
            });
            this.singleMyCardRecordView = new MyCardRecordView({
                el: "#personal_my_card_record-content",
            });
            this.singleBeyondOfWorkReportView = new BeyondOfWorkReportView({
                el: "#personal_beyond_of_work_report-content",
            });

            this.transConfirmView = new TransConfirmView({
                el: "#trans_confirm",
            })



        },
        init_models: function() {
            this.tmattendance = new TmAttendanceModel();
            this.tm_absence_three = new TMAbsenceOfThreeModel();
            self.wf_data = new WFDataModel();

        },
        init_collections: function() {
            this.tmattendances = new TmAttendanceCollection(); //所有人
            this.tm_absence_threes = new TMAbsenceOfThreeCollection();
        },
    });

    return TmAttendanceRouter;
})