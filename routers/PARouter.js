// pa workflow router 人事流程
// ===========================

define(["jquery", "backbone", "handlebars", "lzstring",
        // 人员转正
        "../collections/PAEndingProbationCollection",
        "../models/PAEndingProbation",
        "../views/pa_wf/PAEndingProbationView",

        "async", "pull-to-refresh"
    ],
    function($, Backbone, Handlebars, LZString,
        PAEndingProbationCollection, PAEndingProbation,
        PAEndingProbationView,
        async
    ) {

        var PARouter = Backbone.Router.extend({
            initialize: function() {
                var self = this;
                self.init_models();
                self.init_collections();
                self.init_views();
                console.info('app message: pa router initialized');
            },
            routes: {
                // 人员转正hr流程
                "godo15/:task_id_or_process_instance_id/:type": "pa_ending_probation", // 流程启动后的界面 或者 流程查看

            },

            pa_ending_probation: function(_id, type) { //人员转正
                var self = this;
                $("body").pagecontainer("change", "#pa_ending_probation-list", {
                    reverse: false,
                    changeHash: false,
                });
                $.mobile.loading("show");
                self.PAEndingProbationView.pre_render();
                if (type == 'view') { //流程查看
                    var process_instance_id = _id;
                    async.series({
                        wf_data: function(cb) {
                            var obj = {
                                process_instance_id: process_instance_id,
                            }
                            $.post('/admin/pa/wf/ending_probation_hr/wf_process_data_4m', obj, function(data) {
                                if (data) {
                                    cb(null, data.wf_data._id)

                                } else {
                                    cb(null, null)
                                }
                            })
                        }
                    }, function(err, data) {
                        self.pa_ending_probation.url = '/admin/pa/wf/ending_probation_hr/bb/' + data.wf_data;
                        self.pa_ending_probation.fetch().done(function() {
                            self.PAEndingProbationView.view_status = type;
                            self.PAEndingProbationView.render();
                            $.mobile.loading('hide');

                        })
                    })
                } else { //流程编辑
                    var type = "edit";
                    var task_id = _id.split("-")[0];
                    var pd_id = _id.split("-")[1];
                    var pd_code = _id.split("-")[2];
                    $.get('/admin/pm/assessment_instance/summary/edit_m/' + task_id, function(data) {
                        if (data.code == "OK") {
                            if (data.msg.task_state != 'FINISHED') {
                                var type = "edit";

                                // var task_id = _id; //流程任务处理，则是任务ID，否则，是流程实例ID；
                                async.series({
                                    wf_data: function(cb) {
                                        $.get('/admin/pa/wf/ending_probation_hr/edit_4m/' + task_id, function(data) {
                                            self.PAEndingProbationView.data = data;
                                            if (data) {
                                                cb(null, data.paep._id)

                                            } else {
                                                cb(null, null)
                                            }
                                        })
                                    }
                                }, function(err, data) {
                                    // self.pa_ending_probation.url = '/admin/pa/wf/ending_probation_hr/bb';
                                    self.pa_ending_probation.url = '/admin/pa/wf/ending_probation_hr/bb/' + data.wf_data;
                                    self.pa_ending_probation.fetch().done(function() {
                                        self.PAEndingProbationView.view_status = type;
                                        self.PAEndingProbationView.render();
                                        $.mobile.loading('hide');

                                    })
                                })
                            } else {
                                var type = "view";
                                var process_instance_id = data.msg.process_instance;
                                async.series({
                                    wf_data: function(cb) {
                                        var obj = {
                                            process_instance_id: process_instance_id,
                                        }
                                        $.post('/admin/pa/wf/ending_probation_hr/wf_process_data_4m', obj, function(data) {
                                            self.PAEndingProbationView.data = data;
                                            if (data) {
                                                cb(null, data.wf_data._id)

                                            } else {
                                                cb(null, null)
                                            }
                                        })
                                    }
                                }, function(err, data) {
                                    self.pa_ending_probation.url = '/admin/pa/wf/ending_probation_hr/bb/' + data.wf_data;
                                    self.pa_ending_probation.fetch().done(function() {
                                        self.PAEndingProbationView.view_status = type;
                                        self.PAEndingProbationView.render();
                                        $.mobile.loading('hide');

                                    })
                                })
                            }

                        } else {
                            alert(data.code)
                        }
                    })

                }
            },

            init_views: function() {
                var self = this;
                this.PAEndingProbationView = new PAEndingProbationView({
                    el: "#pa_ending_probation-list-content",
                    collection: self.pa_ending_probation
                });

            },
            init_models: function() {

            },
            init_collections: function() {
                this.pa_ending_probation = new PAEndingProbationCollection(); //人员转正

            },



        });

        return PARouter;
    })