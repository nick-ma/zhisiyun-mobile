// myteam router
// ====================
define(["jquery", "backbone", "handlebars", "lzstring",
    "../collections/TmAttendanceCollection",
    "../views/tm_attendance/PeopleAttendanceResult",
    "../models/TmAttendanceModel",
], function($, Backbone, Handlebars, LZString,
    TmAttendanceCollection,
    PeopleAttendanceResult,
    TmAttendanceModel
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
        init_views: function() {
            var self = this;
            this.PeopleAttendanceResult = new PeopleAttendanceResult({
                el: "#personal_attend_list-content",
            });

        },
        init_models: function() {
            this.tmattendance = new TmAttendanceModel();
        },
        init_collections: function() {
            this.tmattendances = new TmAttendanceCollection(); //所有人
        },
    });

    return TmAttendanceRouter;
})