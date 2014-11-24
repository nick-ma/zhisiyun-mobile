// pa workflow router 人事流程
// ===========================

define(["jquery", "backbone", "handlebars", "lzstring",
        // 人员转正
        "../collections/PAEndingProbationCollection",
        //人员离职
        "../collections/PATerminationEmploymentCollection",
        "../models/PAEndingProbation",
        "../models/PATerminationEmployment",
        "../views/pa_wf/PAEndingProbationView",
        "../views/pa_wf/PAEndingProbationESSView",
        "../views/pa_wf/PATerminationEmploymentESSView",

        "async", "pull-to-refresh"
    ],
    function($, Backbone, Handlebars, LZString,
        PAEndingProbationCollection, PATerminationEmploymentCollection, PAEndingProbation, PATerminationEmployment,
        PAEndingProbationView,
        PAEndingProbationESSView,
        PATerminationEmploymentESSView,
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
                //人员转正个人流程
                "godo16/:task_id_or_process_instance_id/:type": "pa_ending_probation_ess", // 流程启动后的界面 或者 流程查看
                //人员离职个人流程
                "godo17/:task_id_or_process_instance_id/:type": "pa_terminate_employment_ess", // 流程启动后的界面 或者 流程查看

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
                                    self.PAEndingProbationView.data = data;

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
            pa_ending_probation_ess: function(_id, type) { //人员转正个人
                var self = this;
                $("body").pagecontainer("change", "#pa_ending_probation_ess_list", {
                    reverse: false,
                    changeHash: false,
                });
                $.mobile.loading("show");
                self.PAEndingProbationESSView.pre_render();
                if (type == 'view') { //流程查看
                    var process_instance_id = _id;
                    async.series({
                        wf_data: function(cb) {
                            var obj = {
                                process_instance_id: process_instance_id,
                            }
                            $.post('/admin/pa/wf/ending_probation_hr/wf_process_data_4m', obj, function(data) {
                                if (data) {
                                    self.PAEndingProbationESSView.data = data;

                                    cb(null, data.wf_data._id)

                                } else {
                                    cb(null, null)
                                }
                            })
                        }
                    }, function(err, data) {
                        self.pa_ending_probation.url = '/admin/pa/wf/ending_probation_hr/bb/' + data.wf_data;
                        self.pa_ending_probation.fetch().done(function() {
                            self.PAEndingProbationESSView.view_status = type;
                            self.PAEndingProbationESSView.render();
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
                                            self.PAEndingProbationESSView.data = data;
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
                                        self.PAEndingProbationESSView.view_status = type;
                                        self.PAEndingProbationESSView.render();
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
                                            self.PAEndingProbationESSView.data = data;
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
                                        self.PAEndingProbationESSView.view_status = type;
                                        self.PAEndingProbationESSView.render();
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
            pa_terminate_employment_ess: function(_id, type) { //人员离职个人
                var self = this;
                $("body").pagecontainer("change", "#pa_terminate_employment_ess_list", {
                    reverse: false,
                    changeHash: false,
                });
                $.mobile.loading("show");
                self.PATerminationEmploymentESSView.pre_render();
                if (type == 'view') { //流程查看
                    var process_instance_id = _id;
                    async.series({
                        wf_data: function(cb) {
                            var obj = {
                                process_instance_id: process_instance_id,
                            }
                            $.post('/admin/pa/wf/termination_employment/wf_process_data_4m', obj, function(data) {
                                if (data) {
                                    self.PATerminationEmploymentESSView.data = data;

                                    cb(null, data.wf_data._id)

                                } else {
                                    cb(null, null)
                                }
                            })
                        }
                    }, function(err, data) {
                        self.pa_terminate_employment.url = '/admin/pa/wf/termination_employment/bb/' + data.wf_data;
                        self.pa_terminate_employment.fetch().done(function() {
                            self.PATerminationEmploymentESSView.view_status = type;
                            self.PATerminationEmploymentESSView.render();
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
                                        $.get('/admin/pa/wf/termination_employment/edit_4m/' + task_id, function(data) {
                                            self.PATerminationEmploymentESSView.data = data;
                                            console.log(data);
                                            if (data) {
                                                cb(null, data.paep._id)

                                            } else {
                                                cb(null, null)
                                            }
                                        })
                                    }
                                }, function(err, data) {
                                    // self.pa_terminate_employment.url = '/admin/pa/wf/ending_probation_hr/bb';
                                    self.pa_terminate_employment.url = '/admin/pa/wf/termination_employment/bb/' + data.wf_data;
                                    self.pa_terminate_employment.fetch().done(function() {
                                        self.PATerminationEmploymentESSView.view_status = type;
                                        self.PATerminationEmploymentESSView.render();
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
                                        $.post('/admin/pa/wf/termination_employment/wf_process_data_4m', obj, function(data) {
                                            self.PATerminationEmploymentESSView.data = data;
                                            if (data) {
                                                cb(null, data.wf_data._id)

                                            } else {
                                                cb(null, null)
                                            }
                                        })
                                    }
                                }, function(err, data) {
                                    self.pa_terminate_employment.url = '/admin/pa/wf/termination_employment/bb/' + data.wf_data;
                                    self.pa_terminate_employment.fetch().done(function() {
                                        self.PATerminationEmploymentESSView.view_status = type;
                                        self.PATerminationEmploymentESSView.render();
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
                this.PAEndingProbationESSView = new PAEndingProbationESSView({
                    el: "#pa_ending_probation_ess_list-content",
                    collection: self.pa_ending_probation
                });
                this.PATerminationEmploymentESSView = new PATerminationEmploymentESSView({
                    el: "#pa_terminate_employment_ess_list-content",
                    collection: self.pa_terminate_employment
                });

            },
            init_models: function() {

            },
            init_collections: function() {
                this.pa_ending_probation = new PAEndingProbationCollection(); //人员转正
                this.pa_terminate_employment = new PATerminationEmploymentCollection(); //人员离职

            },



        });

        return PARouter;
    })