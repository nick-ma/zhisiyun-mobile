// myteam router
// ====================
define(["jquery", "backbone", "handlebars", "lzstring",
    "../collections/LeaveOfAbsenceCollection",
    "../collections/BackLeaveOfAbsenceCollection",
    "../models/LeaveOfAbsenceModel",
    "../models/BackLeaveOfAbsenceModel",
    "../views/absence/LeaveList",
    "../views/absence/LeaveOfAbsenceList",
    "../views/absence/LeaveViewList",
    "../views/absence/BackLeaveOfAbsenceList"



], function($, Backbone, Handlebars, LZString,
    LeaveOfAbsenceCollection,
    BackLeaveOfAbsenceCollection,
    LeaveOfAbsenceModel,
    BackLeaveOfAbsenceModel,
    LeaveView,
    LeaveOfAbsenceView,
    LeaveShowList,
    BackLeaveOfAbsenceView
    // SkillRecommendModel
) {
    var AbsenceRouter = Backbone.Router.extend({
        initialize: function() {
            var self = this;
            self.init_models();
            self.init_collections();
            // self.data_collections = [];
            self.init_views();
            // this.init_data();
            // self.bind_events();
            console.info('app message: skill recommand router initialized');
            // Backbone.history.start();
        },
        routes: {
            // 假期
            "leave_list": "leave_list",
            "leave_form_t/:ti_id/:type": "leave_form",
            "leave_form_p/:ti_id/:type": "list_view",
            //消假
            // "back_leave_list": "leave_list",
            "back_leave_form_t/:ti_id/:type": "back_leave_form",


        },


        leave_list: function() {
            var self = this;
            self.leaveOfAbsences.fetch().done(function() {
                self.leaveView.leaveOfAbsence = self.leaveOfAbsence;
                self.leaveView.render();
                $("body").pagecontainer("change", "#leave_list", {
                    reverse: false,
                    changeHash: false,
                });
            })
        },
        leave_form: function(ti_id, type) {
            var login_people = $("#login_people").val();
            var self = this;
            self.leaveOfAbsence.id = ti_id;
            self.leaveOfAbsence.fetch().done(function() {
                self.leaveOfAbsenceView.people_id = login_people;
                self.leaveOfAbsenceView.type = type;
                self.leaveOfAbsenceView.render();
                $("body").pagecontainer("change", "#leaveofabsence_list", {
                    reverse: false,
                    changeHash: false,
                });
            })
        },
        list_view: function(pi_id, type) {
            var self = this;
            $.get('/admin/tm/wf_leave_of_absence/view_json/' + pi_id, function(data) {
                console.log(data)
                self.leaveShowList.obj = data
                self.leaveShowList.render();
                $("body").pagecontainer("change", "#leave_view_list", {
                    reverse: false,
                    changeHash: false,
                });
            })

        },
        back_leave_form: function(ti_id, type) {
            var login_people = $("#login_people").val();
            var self = this;
            self.backLeaveOfAbsenceView.model.id = ti_id;
            self.backLeaveOfAbsenceView.model.fetch().done(function() {
                self.backLeaveOfAbsenceView.people_id = login_people;
                self.backLeaveOfAbsenceView.type = type;
                self.backLeaveOfAbsenceView.render();
                $("body").pagecontainer("change", "#backleaveofabsence_list", {
                    reverse: false,
                    changeHash: false,
                });
            })
        },
        init_views: function() {
            var self = this;
            this.leaveView = new LeaveView({
                el: "#leave_list-content",
                collection: self.leaveOfAbsences,
            });
            this.leaveOfAbsenceView = new LeaveOfAbsenceView({
                el: "#leaveofabsence_list-content",
                model: self.leaveOfAbsence,
            });
            this.leaveShowList = new LeaveShowList({
                el: "#leaveofabsence_list-content",
            });
            this.backLeaveOfAbsenceView = new BackLeaveOfAbsenceView({
                el: "#backleaveofabsence_list-content",
                model: self.backLeaveOfAbsence,
            });

        },
        init_models: function() {
            this.leaveOfAbsence = new LeaveOfAbsenceModel();
            this.backLeaveOfAbsence = new BackLeaveOfAbsenceModel();
        },
        init_collections: function() {
            this.leaveOfAbsences = new LeaveOfAbsenceCollection(); //请假数据
            this.backLeaveOfAbsences = new BackLeaveOfAbsenceCollection() //消假数据

        }


    });

    return AbsenceRouter;
})