// pa workflow router 人事流程
// ===========================

define(["jquery", "backbone", "handlebars", "lzstring",
        // 人员转正
        "../collections/PAEndingProbationCollection",
        //人员离职
        "../collections/PATerminationEmploymentCollection",
        "../collections/PAMoveCollection",
        "../collections/PAPromotionCollection",
        "../collections/PADemotionCollection",
        "../collections/PAUnpaidLeaveOfAbsenceCollection",
        "../collections/PAEndUnpaidLeaveOfAbsenceCollection",
        "../models/PAEndingProbation",
        "../models/PATerminationEmployment",
        "../models/PAMoveModel",
        "../models/PAPromotionModel", //人员 晋升流程
        "../models/PADemotionModel", //人员降级流程
        "../models/PAUnpaidLeaveOfAbsenceModel", //人员停薪留职流程
        "../models/PAEndUnpaidLeaveOfAbsenceModel", //人员结束停薪留职流程
        "../views/pa_wf/PAEndingProbationView",
        "../views/pa_wf/PAEndingProbationESSView",
        "../views/pa_wf/PATerminationEmploymentESSView",
        "../views/pa_wf/PATerminationEmploymentView",
        "../views/pa_wf/PAMoveView",
        "../views/pa_wf/PAPromotionView",
        "../views/pa_wf/PADemotionView",
        "../views/pa_wf/PAUnpaidLeaveOfAbsenceView", //hr停薪流程
        "../views/pa_wf/PAUnpaidLeaveOfAbsenceESSView", //个人停薪流程
        "../views/pa_wf/PAEndUnpaidLeaveOfAbsenceView", //hr结束停薪流程

        "async", "pull-to-refresh"
    ],
    function($, Backbone, Handlebars, LZString,
        PAEndingProbationCollection,
        PATerminationEmploymentCollection,
        PAMoveCollection, PAPromotionCollection,
        PADemotionCollection,
        PAUnpaidLeaveOfAbsenceCollection,
        PAEndUnpaidLeaveOfAbsenceCollection,
        PAEndingProbation,
        PATerminationEmployment,
        PAMoveModel,
        PAPromotionModel,
        PADemotionModel,
        PAUnpaidLeaveOfAbsenceModel,
        PAEndUnpaidLeaveOfAbsenceModel,
        PAEndingProbationView,
        PAEndingProbationESSView,
        PATerminationEmploymentESSView,
        PATerminationEmploymentView, PAMoveView, PAPromotionView, PADemotionView, PAUnpaidLeaveOfAbsenceView,
        PAUnpaidLeaveOfAbsenceESSView,
        PAEndUnpaidLeaveOfAbsenceView,
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
                //人员离职hr流程
                "godo18/:task_id_or_process_instance_id/:type": "pa_terminate_employment_hr", // 流程启动后的界面 或者 流程查看
                //人员平调hr流程
                "godo19/:task_id_or_process_instance_id/:type": "pa_move_hr", // 流程启动后的界面 或者 流程查看
                //人员晋升hr流程
                "godo20/:task_id_or_process_instance_id/:type": "pa_promotion_hr", // 流程启动后的界面 或者 流程查看
                //人员降级hr流程
                "godo21/:task_id_or_process_instance_id/:type": "pa_demotion_hr", // 流程启动后的界面 或者 流程查看
                //人员停薪留职hr流程
                "godo22/:task_id_or_process_instance_id/:type": "pa_unpaid_hr", // 流程启动后的界面 或者 流程查看
                //人员停薪留职个人流程
                "godo23/:task_id_or_process_instance_id/:type": "pa_unpaid", // 流程启动后的界面 或者 流程查看
                //人员结束停薪留职hr流程
                "godo24/:task_id_or_process_instance_id/:type": "pa_end_unpaid_hr", // 流程启动后的界面 或者 流程查看

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
            pa_terminate_employment_hr: function(_id, type) { //人员离职HR
                var self = this;
                $("body").pagecontainer("change", "#pa_terminate_employment_hr_list", {
                    reverse: false,
                    changeHash: false,
                });
                $.mobile.loading("show");
                self.PATerminationEmploymentView.pre_render();
                if (type == 'view') { //流程查看
                    var process_instance_id = _id;
                    async.series({
                        wf_data: function(cb) {
                            var obj = {
                                process_instance_id: process_instance_id,
                            }
                            $.post('/admin/pa/wf/termination_employment/wf_process_data_4m', obj, function(data) {
                                if (data) {
                                    self.PATerminationEmploymentView.data = data;

                                    cb(null, data.wf_data._id)

                                } else {
                                    cb(null, null)
                                }
                            })
                        },
                        par_data: function(cb) {
                            $.get('/admin/pa/par/get_par_by_pae_code?pae_code=Z7', function(data) {
                                if (data.code == 'OK') {
                                    self.PATerminationEmploymentView.par_data = data.data;

                                    cb(null, data.data)

                                } else {
                                    cb(null, null)
                                }
                            })
                        }
                    }, function(err, data) {
                        self.pa_terminate_employment.url = '/admin/pa/wf/termination_employment/bb/' + data.wf_data;
                        self.pa_terminate_employment.fetch().done(function() {
                            self.PATerminationEmploymentView.view_status = type;
                            self.PATerminationEmploymentView.render();
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
                                            self.PATerminationEmploymentView.data = data;
                                            if (data) {
                                                cb(null, data.paep._id)

                                            } else {
                                                cb(null, null)
                                            }
                                        })
                                    },
                                    par_data: function(cb) {
                                        $.get('/admin/pa/par/get_par_by_pae_code?pae_code=Z7', function(data) {
                                            if (data.code == 'OK') {
                                                self.PATerminationEmploymentView.par_data = data.data;

                                                cb(null, data.data)

                                            } else {
                                                cb(null, null)
                                            }
                                        })
                                    }
                                }, function(err, data) {
                                    // self.pa_terminate_employment.url = '/admin/pa/wf/ending_probation_hr/bb';
                                    self.pa_terminate_employment.url = '/admin/pa/wf/termination_employment/bb/' + data.wf_data;
                                    self.pa_terminate_employment.fetch().done(function() {
                                        self.PATerminationEmploymentView.view_status = type;
                                        self.PATerminationEmploymentView.render();
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
                                            self.PATerminationEmploymentView.data = data;
                                            if (data) {
                                                cb(null, data.wf_data._id)

                                            } else {
                                                cb(null, null)
                                            }
                                        })
                                    },
                                    par_data: function(cb) {
                                        $.get('/admin/pa/par/get_par_by_pae_code?pae_code=Z7', function(data) {
                                            if (data.code == 'OK') {
                                                self.PATerminationEmploymentView.par_data = data.data;

                                                cb(null, data.data)

                                            } else {
                                                cb(null, null)
                                            }
                                        })
                                    }
                                }, function(err, data) {
                                    self.pa_terminate_employment.url = '/admin/pa/wf/termination_employment/bb/' + data.wf_data;
                                    self.pa_terminate_employment.fetch().done(function() {
                                        self.PATerminationEmploymentView.view_status = type;
                                        self.PATerminationEmploymentView.render();
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
            pa_move_hr: function(_id, type) { //人员平调HR
                var self = this;
                $("body").pagecontainer("change", "#pa_move_hr_list", {
                    reverse: false,
                    changeHash: false,
                });
                $.mobile.loading("show");
                self.PAMoveView.pre_render();
                if (type == 'view') { //流程查看
                    var process_instance_id = _id;
                    async.series({
                        wf_data: function(cb) {
                            var obj = {
                                process_instance_id: process_instance_id,
                            }
                            $.post('/admin/pa/wf/move/wf_process_data_4m', obj, function(data) {
                                if (data) {
                                    self.PAMoveView.data = data;

                                    cb(null, data.wf_data._id)

                                } else {
                                    cb(null, null)
                                }
                            })
                        },
                        par_data: function(cb) {
                            $.get('/admin/pa/par/get_par_by_pae_code?pae_code=Z4', function(data) {
                                if (data.code == 'OK') {
                                    self.PAMoveView.par_data = data.data;

                                    cb(null, data.data)

                                } else {
                                    cb(null, null)
                                }
                            })
                        }
                    }, function(err, data) {
                        self.pa_move_hr.url = '/admin/pa/wf/move/bb/' + data.wf_data;
                        self.pa_move_hr.fetch().done(function() {
                            self.PAMoveView.view_status = type;
                            self.PAMoveView.render();
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
                                        $.get('/admin/pa/wf/move/edit_4m/' + task_id, function(data) {
                                            self.PAMoveView.data = data;
                                            if (data) {
                                                cb(null, data.paep._id)

                                            } else {
                                                cb(null, null)
                                            }
                                        })
                                    },
                                    par_data: function(cb) {
                                        $.get('/admin/pa/par/get_par_by_pae_code?pae_code=Z4', function(data) {
                                            if (data.code == 'OK') {
                                                self.PAMoveView.par_data = data.data;

                                                cb(null, data.data)

                                            } else {
                                                cb(null, null)
                                            }
                                        })
                                    }
                                }, function(err, data) {
                                    // self.pa_terminate_employment.url = '/admin/pa/wf/ending_probation_hr/bb';
                                    self.pa_move_hr.url = '/admin/pa/wf/move/bb/' + data.wf_data;
                                    self.pa_move_hr.fetch().done(function() {
                                        self.PAMoveView.view_status = type;
                                        self.PAMoveView.render();
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
                                        $.post('/admin/pa/wf/move/wf_process_data_4m', obj, function(data) {
                                            self.PAMoveView.data = data;
                                            if (data) {
                                                cb(null, data.wf_data._id)

                                            } else {
                                                cb(null, null)
                                            }
                                        })
                                    },
                                    par_data: function(cb) {
                                        $.get('/admin/pa/par/get_par_by_pae_code?pae_code=Z4', function(data) {
                                            if (data.code == 'OK') {
                                                self.PAMoveView.par_data = data.data;

                                                cb(null, data.data)

                                            } else {
                                                cb(null, null)
                                            }
                                        })
                                    }
                                }, function(err, data) {
                                    self.pa_move_hr.url = '/admin/pa/wf/move/bb/' + data.wf_data;
                                    self.pa_move_hr.fetch().done(function() {
                                        self.PAMoveView.view_status = type;
                                        self.PAMoveView.render();
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
            pa_promotion_hr: function(_id, type) { //人员晋升HR
                var self = this;
                $("body").pagecontainer("change", "#pa_promotion_hr_list", {
                    reverse: false,
                    changeHash: false,
                });
                $.mobile.loading("show");
                self.PAPromotionView.pre_render();
                if (type == 'view') { //流程查看
                    var process_instance_id = _id;
                    async.series({
                        wf_data: function(cb) {
                            var obj = {
                                process_instance_id: process_instance_id,
                            }
                            $.post('/admin/pa/wf/promotion/wf_process_data_4m', obj, function(data) {
                                if (data) {
                                    self.PAPromotionView.data = data;

                                    cb(null, data.wf_data._id)

                                } else {
                                    cb(null, null)
                                }
                            })
                        },
                        par_data: function(cb) {
                            $.get('/admin/pa/par/get_par_by_pae_code?pae_code=Z3', function(data) {
                                if (data.code == 'OK') {
                                    self.PAPromotionView.par_data = data.data;

                                    cb(null, data.data)

                                } else {
                                    cb(null, null)
                                }
                            })
                        }
                    }, function(err, data) {
                        self.pa_promotion_hr.url = '/admin/pa/wf/promotion/bb/' + data.wf_data;
                        self.pa_promotion_hr.fetch().done(function() {
                            self.PAPromotionView.view_status = type;
                            self.PAPromotionView.render();
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
                                        $.get('/admin/pa/wf/promotion/edit_4m/' + task_id, function(data) {
                                            self.PAPromotionView.data = data;
                                            if (data) {
                                                cb(null, data.paep._id)

                                            } else {
                                                cb(null, null)
                                            }
                                        })
                                    },
                                    par_data: function(cb) {
                                        $.get('/admin/pa/par/get_par_by_pae_code?pae_code=Z3', function(data) {
                                            if (data.code == 'OK') {
                                                self.PAPromotionView.par_data = data.data;

                                                cb(null, data.data)

                                            } else {
                                                cb(null, null)
                                            }
                                        })
                                    }
                                }, function(err, data) {
                                    // self.pa_terminate_employment.url = '/admin/pa/wf/ending_probation_hr/bb';
                                    self.pa_promotion_hr.url = '/admin/pa/wf/promotion/bb/' + data.wf_data;
                                    self.pa_promotion_hr.fetch().done(function() {
                                        self.PAPromotionView.view_status = type;
                                        self.PAPromotionView.render();
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
                                        $.post('/admin/pa/wf/promotion/wf_process_data_4m', obj, function(data) {
                                            self.PAPromotionView.data = data;
                                            if (data) {
                                                cb(null, data.wf_data._id)

                                            } else {
                                                cb(null, null)
                                            }
                                        })
                                    },
                                    par_data: function(cb) {
                                        $.get('/admin/pa/par/get_par_by_pae_code?pae_code=Z3', function(data) {
                                            if (data.code == 'OK') {
                                                self.PAPromotionView.par_data = data.data;

                                                cb(null, data.data)

                                            } else {
                                                cb(null, null)
                                            }
                                        })
                                    }
                                }, function(err, data) {
                                    self.pa_promotion_hr.url = '/admin/pa/wf/promotion/bb/' + data.wf_data;
                                    self.pa_promotion_hr.fetch().done(function() {
                                        self.PAPromotionView.view_status = type;
                                        self.PAPromotionView.render();
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
            pa_demotion_hr: function(_id, type) { //人员降级HR
                var self = this;
                $("body").pagecontainer("change", "#pa_demotion_hr_list", {
                    reverse: false,
                    changeHash: false,
                });
                $.mobile.loading("show");
                self.PADemotionView.pre_render();
                if (type == 'view') { //流程查看
                    var process_instance_id = _id;
                    async.series({
                        wf_data: function(cb) {
                            var obj = {
                                process_instance_id: process_instance_id,
                            }
                            $.post('/admin/pa/wf/demotion/wf_process_data_4m', obj, function(data) {
                                if (data) {
                                    self.PADemotionView.data = data;

                                    cb(null, data.wf_data._id)

                                } else {
                                    cb(null, null)
                                }
                            })
                        },
                        par_data: function(cb) {
                            $.get('/admin/pa/par/get_par_by_pae_code?pae_code=Z4', function(data) {
                                if (data.code == 'OK') {
                                    self.PADemotionView.par_data = data.data;

                                    cb(null, data.data)

                                } else {
                                    cb(null, null)
                                }
                            })
                        }
                    }, function(err, data) {
                        self.pa_demotion_hr.url = '/admin/pa/wf/demotion/bb/' + data.wf_data;
                        self.pa_demotion_hr.fetch().done(function() {
                            self.PADemotionView.view_status = type;
                            self.PADemotionView.render();
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
                                        $.get('/admin/pa/wf/demotion/edit_4m/' + task_id, function(data) {
                                            self.PADemotionView.data = data;
                                            if (data) {
                                                cb(null, data.paep._id)

                                            } else {
                                                cb(null, null)
                                            }
                                        })
                                    },
                                    par_data: function(cb) {
                                        $.get('/admin/pa/par/get_par_by_pae_code?pae_code=Z5', function(data) {
                                            if (data.code == 'OK') {
                                                self.PADemotionView.par_data = data.data;

                                                cb(null, data.data)

                                            } else {
                                                cb(null, null)
                                            }
                                        })
                                    }
                                }, function(err, data) {
                                    // self.pa_terminate_employment.url = '/admin/pa/wf/ending_probation_hr/bb';
                                    self.pa_demotion_hr.url = '/admin/pa/wf/demotion/bb/' + data.wf_data;
                                    self.pa_demotion_hr.fetch().done(function() {
                                        self.PADemotionView.view_status = type;
                                        self.PADemotionView.render();
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
                                        $.post('/admin/pa/wf/demotion/wf_process_data_4m', obj, function(data) {
                                            self.PADemotionView.data = data;
                                            if (data) {
                                                cb(null, data.wf_data._id)

                                            } else {
                                                cb(null, null)
                                            }
                                        })
                                    },
                                    par_data: function(cb) {
                                        $.get('/admin/pa/par/get_par_by_pae_code?pae_code=Z5', function(data) {
                                            if (data.code == 'OK') {
                                                self.PADemotionView.par_data = data.data;

                                                cb(null, data.data)

                                            } else {
                                                cb(null, null)
                                            }
                                        })
                                    }
                                }, function(err, data) {
                                    self.pa_demotion_hr.url = '/admin/pa/wf/demotion/bb/' + data.wf_data;
                                    self.pa_demotion_hr.fetch().done(function() {
                                        self.PADemotionView.view_status = type;
                                        self.PADemotionView.render();
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
            pa_unpaid_hr: function(_id, type) { //人员停薪留职hr流程
                var self = this;
                $("body").pagecontainer("change", "#pa_unpaid_leave_of_absence_hr_list", {
                    reverse: false,
                    changeHash: false,
                });
                $.mobile.loading("show");
                self.PAUnpaidLeaveOfAbsenceView.pre_render();
                if (type == 'view') { //流程查看
                    var process_instance_id = _id;
                    async.series({
                        wf_data: function(cb) {
                            var obj = {
                                process_instance_id: process_instance_id,
                            }
                            $.post('/admin/pa/wf/unpaid_leave_of_absence_hr/wf_process_data_4m', obj, function(data) {
                                if (data) {
                                    self.PAUnpaidLeaveOfAbsenceView.data = data;

                                    cb(null, data.wf_data._id)

                                } else {
                                    cb(null, null)
                                }
                            })
                        },
                        par_data: function(cb) {
                            $.get('/admin/pa/par/get_par_by_pae_code?pae_code=Z9', function(data) {
                                if (data.code == 'OK') {
                                    self.PAUnpaidLeaveOfAbsenceView.par_data = data.data;

                                    cb(null, data.data)

                                } else {
                                    cb(null, null)
                                }
                            })
                        }
                    }, function(err, data) {
                        self.pa_unpaid_hr.url = '/admin/pa/wf/unpaid_leave_of_absence_hr/bb/' + data.wf_data;
                        self.pa_unpaid_hr.fetch().done(function() {
                            self.PAUnpaidLeaveOfAbsenceView.view_status = type;
                            self.PAUnpaidLeaveOfAbsenceView.render();
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
                                        $.get('/admin/pa/wf/unpaid_leave_of_absence_hr/edit_4m/' + task_id, function(data) {
                                            self.PAUnpaidLeaveOfAbsenceView.data = data;
                                            if (data) {
                                                cb(null, data.paep._id)

                                            } else {
                                                cb(null, null)
                                            }
                                        })
                                    },
                                    par_data: function(cb) {
                                        $.get('/admin/pa/par/get_par_by_pae_code?pae_code=Z9', function(data) {
                                            if (data.code == 'OK') {
                                                self.PAUnpaidLeaveOfAbsenceView.par_data = data.data;

                                                cb(null, data.data)

                                            } else {
                                                cb(null, null)
                                            }
                                        })
                                    }
                                }, function(err, data) {
                                    // self.pa_terminate_employment.url = '/admin/pa/wf/ending_probation_hr/bb';
                                    self.pa_unpaid_hr.url = '/admin/pa/wf/unpaid_leave_of_absence_hr/bb/' + data.wf_data;
                                    self.pa_unpaid_hr.fetch().done(function() {
                                        self.PAUnpaidLeaveOfAbsenceView.view_status = type;
                                        self.PAUnpaidLeaveOfAbsenceView.render();
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
                                        $.post('/admin/pa/wf/unpaid_leave_of_absence_hr/wf_process_data_4m', obj, function(data) {
                                            self.PAUnpaidLeaveOfAbsenceView.data = data;
                                            if (data) {
                                                cb(null, data.wf_data._id)

                                            } else {
                                                cb(null, null)
                                            }
                                        })
                                    },
                                    par_data: function(cb) {
                                        $.get('/admin/pa/par/get_par_by_pae_code?pae_code=Z9', function(data) {
                                            if (data.code == 'OK') {
                                                self.PAUnpaidLeaveOfAbsenceView.par_data = data.data;

                                                cb(null, data.data)

                                            } else {
                                                cb(null, null)
                                            }
                                        })
                                    }
                                }, function(err, data) {
                                    self.pa_unpaid_hr.url = '/admin/pa/wf/unpaid_leave_of_absence_hr/bb/' + data.wf_data;
                                    self.pa_unpaid_hr.fetch().done(function() {
                                        self.PAUnpaidLeaveOfAbsenceView.view_status = type;
                                        self.PAUnpaidLeaveOfAbsenceView.render();
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
            pa_unpaid: function(_id, type) { //人员停薪留职个人流程
                var self = this;
                $("body").pagecontainer("change", "#pa_unpaid_leave_of_absence_ess_list", {
                    reverse: false,
                    changeHash: false,
                });
                $.mobile.loading("show");
                self.PAUnpaidLeaveOfAbsenceESSView.pre_render();
                if (type == 'view') { //流程查看
                    var process_instance_id = _id;
                    async.series({
                        wf_data: function(cb) {
                            var obj = {
                                process_instance_id: process_instance_id,
                            }
                            $.post('/admin/pa/wf/unpaid_leave_of_absence_hr/wf_process_data_4m', obj, function(data) {
                                if (data) {
                                    self.PAUnpaidLeaveOfAbsenceESSView.data = data;

                                    cb(null, data.wf_data._id)

                                } else {
                                    cb(null, null)
                                }
                            })
                        },
                        par_data: function(cb) {
                            $.get('/admin/pa/par/get_par_by_pae_code?pae_code=Z9', function(data) {
                                if (data.code == 'OK') {
                                    self.PAUnpaidLeaveOfAbsenceESSView.par_data = data.data;

                                    cb(null, data.data)

                                } else {
                                    cb(null, null)
                                }
                            })
                        }
                    }, function(err, data) {
                        self.pa_unpaid_hr.url = '/admin/pa/wf/unpaid_leave_of_absence_hr/bb/' + data.wf_data;
                        self.pa_unpaid_hr.fetch().done(function() {
                            self.PAUnpaidLeaveOfAbsenceESSView.view_status = type;
                            self.PAUnpaidLeaveOfAbsenceESSView.render();
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
                                        $.get('/admin/pa/wf/unpaid_leave_of_absence_hr/edit_4m/' + task_id, function(data) {
                                            self.PAUnpaidLeaveOfAbsenceESSView.data = data;
                                            if (data) {
                                                cb(null, data.paep._id)

                                            } else {
                                                cb(null, null)
                                            }
                                        })
                                    },
                                    par_data: function(cb) {
                                        $.get('/admin/pa/par/get_par_by_pae_code?pae_code=Z9', function(data) {
                                            if (data.code == 'OK') {
                                                self.PAUnpaidLeaveOfAbsenceESSView.par_data = data.data;

                                                cb(null, data.data)

                                            } else {
                                                cb(null, null)
                                            }
                                        })
                                    }
                                }, function(err, data) {
                                    // self.pa_terminate_employment.url = '/admin/pa/wf/ending_probation_hr/bb';
                                    self.pa_unpaid_hr.url = '/admin/pa/wf/unpaid_leave_of_absence_hr/bb/' + data.wf_data;
                                    self.pa_unpaid_hr.fetch().done(function() {
                                        self.PAUnpaidLeaveOfAbsenceESSView.view_status = type;
                                        self.PAUnpaidLeaveOfAbsenceESSView.render();
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
                                        $.post('/admin/pa/wf/unpaid_leave_of_absence_hr/wf_process_data_4m', obj, function(data) {
                                            self.PAUnpaidLeaveOfAbsenceESSView.data = data;
                                            if (data) {
                                                cb(null, data.wf_data._id)

                                            } else {
                                                cb(null, null)
                                            }
                                        })
                                    },
                                    par_data: function(cb) {
                                        $.get('/admin/pa/par/get_par_by_pae_code?pae_code=Z9', function(data) {
                                            if (data.code == 'OK') {
                                                self.PAUnpaidLeaveOfAbsenceESSView.par_data = data.data;

                                                cb(null, data.data)

                                            } else {
                                                cb(null, null)
                                            }
                                        })
                                    }
                                }, function(err, data) {
                                    self.pa_unpaid_hr.url = '/admin/pa/wf/unpaid_leave_of_absence_hr/bb/' + data.wf_data;
                                    self.pa_unpaid_hr.fetch().done(function() {
                                        self.PAUnpaidLeaveOfAbsenceESSView.view_status = type;
                                        self.PAUnpaidLeaveOfAbsenceESSView.render();
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
            pa_end_unpaid_hr: function(_id, type) { //人员结束停薪留职hr流程
                var self = this;
                $("body").pagecontainer("change", "#pa_end_unpaid_leave_of_absence_hr_list", {
                    reverse: false,
                    changeHash: false,
                });
                $.mobile.loading("show");
                self.PAEndUnpaidLeaveOfAbsenceView.pre_render();
                if (type == 'view') { //流程查看
                    var process_instance_id = _id;
                    async.series({
                        wf_data: function(cb) {
                            var obj = {
                                process_instance_id: process_instance_id,
                            }
                            $.post('/admin/pa/wf/end_unpaid_leave_of_absence/wf_process_data_4m', obj, function(data) {
                                if (data) {
                                    self.PAEndUnpaidLeaveOfAbsenceView.data = data;

                                    cb(null, data.wf_data._id)

                                } else {
                                    cb(null, null)
                                }
                            })
                        },
                        par_data: function(cb) {
                            $.get('/admin/pa/par/get_par_by_pae_code?pae_code=Z10', function(data) {
                                if (data.code == 'OK') {
                                    self.PAEndUnpaidLeaveOfAbsenceView.par_data = data.data;

                                    cb(null, data.data)

                                } else {
                                    cb(null, null)
                                }
                            })
                        }
                    }, function(err, data) {
                        self.pa_end_unpaid_hr.url = '/admin/pa/wf/end_unpaid_leave_of_absence/bb/' + data.wf_data;
                        self.pa_end_unpaid_hr.fetch().done(function() {
                            self.PAEndUnpaidLeaveOfAbsenceView.view_status = type;
                            self.PAEndUnpaidLeaveOfAbsenceView.render();
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
                                        $.get('/admin/pa/wf/end_unpaid_leave_of_absence/edit_4m/' + task_id, function(data) {
                                            self.PAEndUnpaidLeaveOfAbsenceView.data = data;
                                            if (data) {
                                                cb(null, data.paep._id)

                                            } else {
                                                cb(null, null)
                                            }
                                        })
                                    },
                                    par_data: function(cb) {
                                        $.get('/admin/pa/par/get_par_by_pae_code?pae_code=Z10', function(data) {
                                            if (data.code == 'OK') {
                                                self.PAEndUnpaidLeaveOfAbsenceView.par_data = data.data;

                                                cb(null, data.data)

                                            } else {
                                                cb(null, null)
                                            }
                                        })
                                    }
                                }, function(err, data) {
                                    // self.pa_terminate_employment.url = '/admin/pa/wf/ending_probation_hr/bb';
                                    self.pa_end_unpaid_hr.url = '/admin/pa/wf/end_unpaid_leave_of_absence/bb/' + data.wf_data;
                                    self.pa_end_unpaid_hr.fetch().done(function() {
                                        self.PAEndUnpaidLeaveOfAbsenceView.view_status = type;
                                        self.PAEndUnpaidLeaveOfAbsenceView.render();
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
                                        $.post('/admin/pa/wf/end_unpaid_leave_of_absence/wf_process_data_4m', obj, function(data) {
                                            self.PAEndUnpaidLeaveOfAbsenceView.data = data;
                                            if (data) {
                                                cb(null, data.wf_data._id)

                                            } else {
                                                cb(null, null)
                                            }
                                        })
                                    },
                                    par_data: function(cb) {
                                        $.get('/admin/pa/par/get_par_by_pae_code?pae_code=Z10', function(data) {
                                            if (data.code == 'OK') {
                                                self.PAEndUnpaidLeaveOfAbsenceView.par_data = data.data;

                                                cb(null, data.data)

                                            } else {
                                                cb(null, null)
                                            }
                                        })
                                    }
                                }, function(err, data) {
                                    self.pa_end_unpaid_hr.url = '/admin/pa/wf/end_unpaid_leave_of_absence/bb/' + data.wf_data;
                                    self.pa_end_unpaid_hr.fetch().done(function() {
                                        self.PAEndUnpaidLeaveOfAbsenceView.view_status = type;
                                        self.PAEndUnpaidLeaveOfAbsenceView.render();
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
                this.PATerminationEmploymentView = new PATerminationEmploymentView({
                    el: "#pa_terminate_employment_hr_list-content",
                    collection: self.pa_terminate_employment
                });
                this.PAMoveView = new PAMoveView({
                    el: "#pa_move_hr_list-content",
                    collection: self.pa_move_hr
                });
                this.PAPromotionView = new PAPromotionView({ //人员晋升
                    el: "#pa_promotion_hr_list-content",
                    collection: self.pa_promotion_hr
                });
                this.PADemotionView = new PADemotionView({ //人员降级
                    el: "#pa_demotion_hr_list-content",
                    collection: self.pa_demotion_hr
                });
                this.PAUnpaidLeaveOfAbsenceView = new PAUnpaidLeaveOfAbsenceView({ //人员降级
                    el: "#pa_unpaid_leave_of_absence_hr_list-content",
                    collection: self.pa_unpaid_hr
                });
                this.PAUnpaidLeaveOfAbsenceESSView = new PAUnpaidLeaveOfAbsenceESSView({ //人员降级
                    el: "#pa_unpaid_leave_of_absence_ess_list-content",
                    collection: self.pa_unpaid_hr
                });
                this.PAEndUnpaidLeaveOfAbsenceView = new PAEndUnpaidLeaveOfAbsenceView({ //人员降级
                    el: "#pa_end_unpaid_leave_of_absence_hr_list-content",
                    collection: self.pa_end_unpaid_hr
                });

            },
            init_models: function() {

            },
            init_collections: function() {
                this.pa_ending_probation = new PAEndingProbationCollection(); //人员转正
                this.pa_terminate_employment = new PATerminationEmploymentCollection(); //人员离职
                this.pa_move_hr = new PAMoveCollection(); //人员平调
                this.pa_promotion_hr = new PAPromotionCollection(); //人员晋升
                this.pa_demotion_hr = new PADemotionCollection(); //人员降级
                this.pa_unpaid_hr = new PAUnpaidLeaveOfAbsenceCollection(); //人员停薪流程
                this.pa_end_unpaid_hr = new PAEndUnpaidLeaveOfAbsenceCollection(); //人员结束停薪流程

            },



        });

        return PARouter;
    })