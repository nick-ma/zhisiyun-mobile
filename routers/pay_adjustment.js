// myteam router
// ====================
define(["jquery", "backbone", "handlebars", "lzstring", "async",
    "../collections/PYAdjustSingleCollection",
    "../collections/PYAdjustBulkCollection",
    "../models/PYAdjustSingleModel",
    "../models/PYAdjustBulkModel",
    "../views/pay_adjustment/AdjustmentList",
    "../views/pay_adjustment/AdjustmentSingleEdit",
    "../views/pay_adjustment/AdjustmentSingleView",
    "../views/pay_adjustment/AdjustmentBulkEdit",
    "../views/pay_adjustment/AdjustmentBulkView",



], function($, Backbone, Handlebars, LZString, async,
    PYAdjustSingleCollection,
    PYAdjustBulkCollection,
    PYAdjustSingleModel,
    PYAdjustBulkModel,
    AdjustmentList,
    AdjustmentSingleEdit,
    AdjustmentSingleView,
    AdjustmentBulkEdit,
    AdjustmentBulkView
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
            console.info('app message: pay_adjustment recommand router initialized');
            // Backbone.history.start();
        },
        routes: {

            "adjustment_list": "adjustment_list",
            "adjustment_single_form/:pi_id/:type": "adjustment_single_form",
            "adjustment_bulk_form/:pi_id/:type": "adjustment_bulk_form",
            "godo25/:op_id/:type": "go_do25", //单人挑衅审批
            "godo26/:op_id/:type": "go_do26", //批量挑衅审批

        },
        adjustment_list: function() {

            var self = this;
            localStorage.setItem('to_do_back_url', window.location.href);

            $("body").pagecontainer("change", "#adjustment_list", {
                reverse: false,
                changeHash: false,
            });
            $.mobile.loading("show");
            self.adjustmentView.pre_render();
            var login_people = $("#login_people").val();
            async.parallel({
                adjustment_singles: function(cb) {
                    self.adjustment_singles.fetch().done(function() {
                        cb(null, self.adjustment_singles.toJSON()[0].adjustments)
                    })
                },
                adjustment_bulks: function(cb) {
                    self.adjustment_bulks.fetch().done(function() {
                        cb(null, self.adjustment_bulks.toJSON()[0].adjustments)
                    })
                },
            }, function(err, results) {
                self.adjustmentView.adjustment = results;
                self.adjustmentView.render();
                $.mobile.loading("hide");
            })



        },

        go_do25: function(op_id, type) {
            var self = this;
            localStorage.setItem('to_do_back_url', window.location.href);
            var ti_id = op_id.split("-")[0];
            $("body").pagecontainer("change", "#adjustment_single_edit", {
                reverse: false,
                changeHash: false,
            });

            $.mobile.loading("show");
            self.adjustmentSingleView.pre_render();
            var login_people = $("#login_people").val();

            self.adjustment_single.id = ti_id;
            self.adjustment_single.fetch().done(function(data) {
                if (data.task_state && data.task_state == 'FINISHED') {
                    window.location = "#adjustment_single_form/" + data.process_instance + '/F';
                } else {
                    self.adjustmentSingleView.people_id = login_people;
                    self.adjustmentSingleView.type = type;
                    self.adjustmentSingleView.model_view = '0';
                    self.adjustmentSingleView.render();
                }
                $.mobile.loading("hide");

            })

        },
        go_do26: function(op_id, type) {
            var self = this;
            localStorage.setItem('to_do_back_url', window.location.href);
            var ti_id = op_id.split("-")[0];
            $("body").pagecontainer("change", "#adjustment_bulk_edit", {
                reverse: false,
                changeHash: false,
            });

            console.log(ti_id)

            $.mobile.loading("show");
            self.adjustmentbulkView.pre_render();
            var login_people = $("#login_people").val();

            self.adjustment_bulk.id = ti_id;
            self.adjustment_bulk.fetch().done(function(data) {
                 console.log(data)
                if (data.task_state && data.task_state == 'FINISHED') {
                    window.location = "#adjustment_bulk_form/" + data.process_instance + '/F';
                } else {
                    self.adjustmentbulkView.people_id = login_people;
                    self.adjustmentbulkView.type = type;
                    self.adjustmentbulkView.model_view = '0';
                    self.adjustmentbulkView.render();
                }
                $.mobile.loading("hide");

            })

        },

        adjustment_single_form: function(pi_id, type) {
            var self = this;
            console.log(window.location.href)
            $.get('/admin/py/payroll_adjustment/view_json/' + pi_id, function(data) {
                data.type = type
                self.adjustmentSingleViewList.obj = data
                self.adjustmentSingleViewList.render();
                $("body").pagecontainer("change", "#adjustment_single_view", {
                    reverse: false,
                    changeHash: false,
                });
            })

        },
        adjustment_bulk_form: function(pi_id, type) {
            var self = this;
            console.log(window.location.href)
            $.get('/admin/py/payroll_adjustbulk/view_json/' + pi_id, function(data) {
                data.type = type
                self.adjustmentbulkViewList.obj = data
                self.adjustmentbulkViewList.render();
                $("body").pagecontainer("change", "#adjustment_bulk_view", {
                    reverse: false,
                    changeHash: false,
                });
            })



        },

        init_views: function() {
            var self = this;
            this.adjustmentView = new AdjustmentList({
                el: "#adjustment_list-content",
            });
            this.adjustmentSingleView = new AdjustmentSingleEdit({
                el: "#adjustment_single_edit-content",
                model: self.adjustment_single,
            });
            this.adjustmentSingleViewList = new AdjustmentSingleView({
                el: "#adjustment_single_edit-content",
            });

            this.adjustmentbulkView = new AdjustmentBulkEdit({
                el: "#adjustment_bulk_edit-content",
                model: self.adjustment_bulk,
            });
            this.adjustmentbulkViewList = new AdjustmentBulkView({
                el: "#adjustment_bulk_edit-content",
            });
        },
        init_models: function() {
            this.adjustment_single = new PYAdjustSingleModel();
            this.adjustment_bulk = new PYAdjustBulkModel();
        },
        init_collections: function() {
            this.adjustment_singles = new PYAdjustSingleCollection(); //单人薪酬调整
            this.adjustment_bulks = new PYAdjustBulkCollection(); //批量薪酬调整
        }


    });

    return AbsenceRouter;
})