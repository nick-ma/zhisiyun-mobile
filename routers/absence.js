// myteam router
// ====================
define(["jquery", "backbone", "handlebars", "lzstring",
    "../collections/LeaveOfAbsenceCollection",
    "../views/absence/LeaveList",
    "../views/absence/LeaveOfAbsenceList",
    "../models/LeaveOfAbsenceModel",
    "../views/absence/LeaveViewList"
], function($, Backbone, Handlebars, LZString,
    LeaveOfAbsenceCollection,
    LeaveView,
    LeaveOfAbsenceView,
    LeaveOfAbsenceModel,
    LeaveShowList
    // SkillRecommendModel
) {
    var AbsenceRouter = Backbone.Router.extend({
        initialize: function() {
            var self = this;
            self.init_models();
            self.init_collections();
            // self.data_collections = [];
            self.init_views();
            self.init_config_data();
            // this.init_data();
            // self.bind_events();
            console.info('app message: skill recommand router initialized');
            // Backbone.history.start();
        },
        routes: {
            // 假期
            "leave_list": "leave_list",
            "leave_form_t/:ti_id": "leave_form",
            "leave_form_p/:ti_id": "list_view",
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
        leave_form: function(ti_id) {
            var login_people = $("#login_people").val();
            var self = this;
            self.leaveOfAbsence.id = ti_id;
            self.leaveOfAbsence.fetch().done(function() {
                self.leaveOfAbsenceView.people_id = login_people;
                self.leaveOfAbsenceView.render();
                $("body").pagecontainer("change", "#leaveofabsence_list", {
                    reverse: false,
                    changeHash: false,
                });
            })
        },
        list_view: function(pi_id) {
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
                // model: self.leaveOfAbsence,
            });


        },
        init_models: function() {
            this.leaveOfAbsence = new LeaveOfAbsenceModel();
        },
        init_collections: function() {
            this.leaveOfAbsences = new LeaveOfAbsenceCollection(); //所有人

        },
        init_config_data: function() {
            // var self = this;
            // var leave_people = $("#leave_people").val();
            // console.log(leave_people)


        }

    });

    return AbsenceRouter;
})