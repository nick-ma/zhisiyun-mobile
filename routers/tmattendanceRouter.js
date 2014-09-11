// myteam router
// ====================
define(["jquery", "backbone", "handlebars", "lzstring", "async",
    "../collections/TmAttendanceCollection",
    "../collections/TMAbsenceOfThreeCollection",
    "../views/tm_attendance/PeopleAttendanceResult",
    "../views/tm_attendance/AttendanceResultChangeView",
    "../views/tm_attendance/TMAbsenceOfThreeView",
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
            "wf_three": "wf_three"
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
        //--------考勤异常流程--------//
        // wf_attendance: function(date, collection_id) {
        //     var self = this;
        //     var login_people = $("#login_people").val();
        //     async.series({
        //         model: function(cb) {
        //             self.tmattendance.url = '/admin/tm/cardrecord/m_bb/' + login_people;
        //             self.tmattendance.fetch().done(function() {
        //                 self.tmattendances.remove(self.tmattendance);
        //                 self.tmattendances.push(self.tmattendance);
        //                 self.singleAttendanceResultChangeView.model = self.tmattendance;
        //                 self.singleAttendanceResultChangeView.date = date;

        //                 cb(null, 'OK');

        //             })
        //         },
        //         get_work_time: function(cb) {
        //             $.get('/admin/tm/beyond_work/get_work_times/' + login_people, function(data) {
        //                 var times = data.times;
        //                 self.singleAttendanceResultChangeView.time_type = data.type;
        //                 self.singleAttendanceResultChangeView.times = times;

        //                 var type = data.type;
        //                 var datas = data.datas;
        //                 self.singleAttendanceResultChangeView.times_configs = [];
        //                 if (type == '0') {
        //                     var group = _.groupBy(datas, function(data) {
        //                         return data.work_time
        //                     })
        //                     _.each(group, function(ys, k) {
        //                         var o = {};
        //                         o.calendar_data = ys;
        //                         var f_d = _.find(times, function(time) {
        //                             return time._id == String(k)
        //                         });
        //                         o.time = f_d;
        //                         self.singleAttendanceResultChangeView.times_configs.push(o)
        //                     })
        //                 } else if (type == '1') {
        //                     _.each(datas, function(dt) {
        //                         var o = {};
        //                         o.calendar_data = dt.calendar_data;
        //                         var f_d = _.find(times, function(time) {
        //                             return time._id == String(dt.work_time)
        //                         });
        //                         o.time = f_d;
        //                         self.singleAttendanceResultChangeView.times_configs.push(o)
        //                     })
        //                 } else if (type == '2') {
        //                     var group = _.groupBy(datas, function(data) {
        //                         return data.work_time
        //                     })
        //                     _.each(group, function(ys, k) {
        //                         var o = {};
        //                         o.calendar_data = ys;
        //                         var f_d = _.find(times, function(time) {
        //                             return time._id == String(k)
        //                         });
        //                         o.time = f_d;
        //                         self.singleAttendanceResultChangeView.times_configs.push(o)
        //                     })
        //                 };
        //                 cb(null, 'OK');

        //             })
        //         },
        //         get_wf_data: function(cb) {
        //             async.waterfall([

        //                 function(cb) {
        //                     $.get('/admin/tm/beyond_work/wf_task/' + collection_id, function(data) {
        //                         if (data) {
        //                             self.singleAttendanceResultChangeView.wf_data = data;
        //                             cb(null, data)
        //                         } else {
        //                             cb(null, null);
        //                         }
        //                     })
        //                 },
        //                 function(wf_data, cb) {
        //                     var attendance_id = wf_data.ti.process_instance.collection_id;
        //                     $.get('/admin/tm/tm_wf/get_collection_data/' + attendance_id, function(data) {
        //                         if (data) {
        //                             self.singleAttendanceResultChangeView.attendance = data;
        //                             cb(null, wf_data)
        //                         } else {
        //                             cb(null, null);
        //                         }
        //                     })
        //                 }
        //             ], cb)

        //         }
        //     }, function(err, result) {
        //         $("body").pagecontainer("change", "#wf_attendance", {
        //             reverse: false,
        //             changeHash: false,
        //         });
        //         self.singleAttendanceResultChangeView.render();
        //         //把 a 换成 span， 避免点那个滑块的时候页面跳走。
        //         $(".ui-flipswitch a").each(function() {
        //             $(this).replaceWith("<span class='" + $(this).attr('class') + "'></span>");
        //         });
        //     })



        // },
        wf_three: function() {
            var self = this;
            var login_people = $("#login_people").val();
            this.tm_absence_three.url = '/admin/tm/beyond_work/mobile_bb/' + login_people + '/' + null;
            this.tm_absence_three.fetch().done(function() {
                self.tm_absence_threes.remove(self.tm_absence_three);
                self.tm_absence_threes.push(self.tm_absence_three);
                self.singleTMAbsenceOfThreeView.model = self.tm_absence_three;
                self.singleTMAbsenceOfThreeView.render();
                $("body").pagecontainer("change", "#wf_three", {
                    reverse: false,
                    changeHash: false,
                });
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