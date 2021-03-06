// assessment instances router
// ===========================

define(["jquery", "backbone", "handlebars", "lzstring",
        // 计分公式和等级组
        "../collections/ScoringFormulaCollection", "../collections/GradeGroupCollection",
        "../collections/AssessmentCollection", "../collections/AssessmentVCollection",
        "../collections/AssessmentSummaryCollection", //我的绩效总结
        "../collections/AssessmentReviewCollection", //绩效面谈
        "../collections/AssessmentAppealCollection", //绩效申诉
        "../collections/PeopleCollection",
        "../models/AssessmentModel",
        "../models/AssessmentSummaryModel", //我的绩效总结
        "../models/AssessmentReviewModel", //绩效面谈
        "../models/AssessmentAppealModel", //绩效申诉
        "../collections/AssessmentSubCollection",
        // views
        "../views/assessment/Home", "../views/assessment/HomeHistory",
        "../views/assessment/HomePIList",
        "../views/assessment/Comment", "../views/assessment/UpdateValue",
        "../views/assessment/ImprovePlan", "../views/assessment/ImprovePlanEdit",
        "../views/assessment/Detail",
        // 指标选择界面
        "../views/PISelectView",
        //我的绩效总结
        "../views/assessment/Summary",
        //我的绩效总结编辑
        "../views/assessment/SummaryEdit",
        //我的绩效总结－流程编辑
        "../views/assessment/SummaryWfEdit",

        //我的绩效面谈
        "../views/assessment/Review",
        //我的绩效面谈编辑
        "../views/assessment/ReviewEdit",
        //我的绩效面谈－流程编辑
        "../views/assessment/ReviewWfEdit",

        //我的绩效申诉
        "../views/assessment/Appeal",
        //我的绩效申诉编辑
        "../views/assessment/AppealEdit",
        //我的绩效申诉－流程编辑
        "../views/assessment/AppealWfEdit",

        "async", "pull-to-refresh"
    ],
    function($, Backbone, Handlebars, LZString,
        ScoringFormulaCollection, GradeGroupCollection,
        AssessmentCollection, AssessmentVCollection,
        AssessmentSummaryCollection,
        AssessmentReviewCollection,
        AssessmentAppealCollection,
        PeopleCollection,
        AssessmentSummaryModel,
        AssessmentReviewModel,
        AssessmentAppealModel,
        AssessmentModel,
        AssessmentSubCollection,
        //views
        HomeAssessmentView, HomeAssessmentHistoryView,
        HomeAssessmentPIListView,
        AssessmentCommentView, AssessmentUpdateValueView,
        AssessmentImprovePlanView, AssessmentImprovePlanEditView,
        AssessmentDetailView,
        PISelectView,
        AssessmentSummaryView, //我的绩效总结
        AssessmentSummaryEditView,
        AssessmentSummaryWfEditView,
        AssessmentReviewView, //我的绩效面谈
        AssessmentReviewEditView,
        AssessmentReviewWfEditView,
        AssessmentAppealView, //我的绩效申诉
        AssessmentAppealEditView, //我的绩效申诉
        AssessmentAppealWfEditView,

        async
    ) {

        var AssessmentRouter = Backbone.Router.extend({
            initialize: function() {
                var self = this;
                self.init_models();
                self.init_collections();
                self.init_views();
                // self.c_assessment.fetch();
                // self.c_scoringformula.fetch();
                // self.c_gradegroup.fetch();
                self.init_data();
                self.bind_events();

                console.info('app message: assessment router initialized');
                // Backbone.history.start();
            },
            routes: {
                // 绩效合同相关页面
                "assessment_list": "assessment_list", //当前登录人员的绩效
                "assessment_pi_list/:ai_id": "assessment_pi_list",
                "assessment_detail/:ai_id/:lx/:pi": "assessment_detail", // <- 改
                "assessment_comment/:ai_id/:lx/:pi": "assessment_comment", // <- 改
                "assessment_update_value/:ai_id/:lx/:pi": "assessment_update_value", // <- 改
                "assessment_improve_plan/:ai_id/:lx/:pi": "assessment_improve_plan", // <- 改
                "assessment_improve_plan/:ai_id/:lx/:pi/:ip_id/:seg_name": "assessment_improve_plan_edit", // <- 改
                // 指标选择界面
                "pi_select/:mode/:target_field": "pi_select",
                "summary": "summary", // 绩效总结列表
                "summary/edit/:ai_id/:ai_status": "summary_edit", // 绩效总结明细列表
                "godo12/:task_id_or_process_instance_id/:type": "wf_summary", // 流程启动后的界面 或者 流程查看
                "review": "review", // 绩效面谈列表
                "review/edit/:ai_id/:ai_status": "review_edit", // 绩效总结明细列表
                "godo13/:task_id_or_process_instance_id/:type": "wf_review", // 流程启动后的界面 或者 流程查看
                "appeal": "appeal", // 绩效申诉列表
                "appeal/edit/:ai_id/:ai_status": "appeal_edit", // 绩效申诉明细列表
                "godo14/:task_id_or_process_instance_id/:type": "wf_appeal", // 流程启动后的界面 或者 流程查看

            },
            assessment_list: function() {
                var self = this;
                localStorage.setItem('to_do_back_url', window.location.href);
                // self.refresh_data();
                $("body").pagecontainer("change", "#assessment_list", {
                    reverse: false,
                    changeHash: false,
                });
                $.mobile.loading('show');
                self.c_assessment.fetch().done(function() {
                    self.c_people.fetch().done(function() {
                        self.homeAssessmentView.c_people = self.c_people;
                        self.homeAssessmentView.c_assessment_sub = self.c_assessment_sub;
                        self.homeAssessmentView.homeAssessmentHistoryView = self.homeAssessmentHistoryView;

                        self.homeAssessmentView.render();
                        self.homeAssessmentHistoryView.render();
                        $.mobile.loading('hide');
                    })
                })

            },
            assessment_pi_list: function(ai_id) { //做一个下拉更新的功能
                var self = this;
                $("body").pagecontainer("change", "#assessment_pi-list", {
                    reverse: false,
                    changeHash: false,
                });
                $.mobile.loading('show');
                if (self.c_assessment.get(ai_id)) { //当前collection里面有
                    self.homeAssessmentPIListView.model = self.c_assessment.get(ai_id);
                    self.homeAssessmentPIListView.model.fetch().done(function() {
                        self.homeAssessmentPIListView.render();
                        $.mobile.loading('hide');
                    })
                } else {
                    var tmp = new AssessmentModel({
                        _id: ai_id
                    })
                    self.c_assessment.set(tmp);
                    tmp.fetch().done(function() {
                        self.homeAssessmentPIListView.model = tmp;
                        self.homeAssessmentPIListView.render();
                        $.mobile.loading('hide');
                    })
                }
            },
            assessment_detail: function(ai_id, lx, pi) { //绩效合同－单条指标的查看界面
                //设置返回路径
                localStorage.setItem('colltask_detail_back_url', window.location.href);
                localStorage.setItem('collproject_detail_back_url', window.location.href);
                var self = this;
                $("body").pagecontainer("change", "#assessment_detail", {
                    reverse: false,
                    changeHash: false,
                });
                $.mobile.loading('show');
                self.assessmentDetailView.scoringformula = self.c_scoringformula;
                self.assessmentDetailView.gradegroup = self.c_gradegroup;
                if (self.c_assessment.get(ai_id)) { //当前collection里面有
                    self.assessmentDetailView.model = self.c_assessment.get(ai_id);
                    self.assessmentDetailView.model.fetch().done(function() { //为了保证数据最新，需要重新fetch一下。
                        self.assessmentDetailView.render(lx, pi);
                        $.mobile.loading('hide');
                    })
                } else { //没有，需要直接获取一个，然后set到collectin里
                    var tmp = new AssessmentModel({
                        _id: ai_id
                    })
                    self.c_assessment.set(tmp);
                    tmp.fetch().done(function() {
                        self.assessmentDetailView.model = tmp;
                        self.assessmentDetailView.render(lx, pi);
                        $.mobile.loading('hide');
                    })
                };

            },
            assessment_comment: function(ai_id, lx, pi) { //绩效合同－单条指标的编辑留言界面
                var self = this;
                $("body").pagecontainer("change", "#assessment_comment", {
                    reverse: false,
                    changeHash: false,
                });
                $.mobile.loading('show');
                if (self.c_assessment.get(ai_id)) { //当前collection里面有
                    self.assessmentCommentView.model = self.c_assessment.get(ai_id);
                    self.assessmentCommentView.model.fetch().done(function() { //为了保证数据最新，需要重新fetch一下。
                        self.assessmentCommentView.render(lx, pi);
                        $.mobile.loading('hide');
                    })
                } else {
                    var tmp = new AssessmentModel({
                        _id: ai_id
                    })
                    self.c_assessment.set(tmp);
                    tmp.fetch().done(function() {
                        self.assessmentCommentView.model = tmp;
                        self.assessmentCommentView.render(lx, pi);
                        $.mobile.loading('hide');
                    })
                }

            },
            assessment_update_value: function(ai_id, lx, pi) { //绩效合同－单条指标的编辑留言界面
                var self = this;
                $("body").pagecontainer("change", "#assessment_update_value", {
                    reverse: false,
                    changeHash: false,
                });
                $.mobile.loading('show');
                self.assessmentUpdateValueView.scoringformula = self.c_scoringformula;
                self.assessmentUpdateValueView.gradegroup = self.c_gradegroup;
                if (self.c_assessment.get(ai_id)) { //当前collection里面有
                    self.assessmentUpdateValueView.model = self.c_assessment.get(ai_id);
                    self.assessmentUpdateValueView.model.fetch().done(function() {
                        self.assessmentUpdateValueView.render(lx, pi);
                        $.mobile.loading('hide');
                    })
                } else {
                    var tmp = new AssessmentModel({
                        _id: ai_id
                    })
                    self.c_assessment.set(tmp);
                    tmp.fetch().done(function() {
                        self.assessmentUpdateValueView.model = tmp;
                        self.assessmentUpdateValueView.render(lx, pi);
                        $.mobile.loading('hide');
                    })
                }
            },
            assessment_improve_plan: function(ai_id, lx, pi) { //绩效合同－单条指标的编辑留言界面
                var self = this;
                $("body").pagecontainer("change", "#assessment_improve_plan", {
                    reverse: false,
                    changeHash: false,
                });
                $.mobile.loading('show');
                if (self.c_assessment.get(ai_id)) { //当前collection里面有
                    self.assessmentImprovePlanView.model = self.c_assessment.get(ai_id);
                    self.assessmentImprovePlanView.model.fetch().done(function() {
                        self.assessmentImprovePlanView.render(lx, pi);
                        $.mobile.loading('hide');
                    })
                } else {
                    var tmp = new AssessmentModel({
                        _id: ai_id
                    })
                    self.c_assessment.set(tmp);
                    tmp.fetch().done(function() {
                        self.assessmentImprovePlanView.model = tmp;
                        self.assessmentImprovePlanView.render(lx, pi);
                        $.mobile.loading('hide');
                    })
                }
            },
            assessment_improve_plan_edit: function(ai_id, lx, pi, ip_id, seg_name) { //新增／修改改进措施
                var self = this;
                $("body").pagecontainer("change", "#assessment_improve_plan_edit", {
                    reverse: false,
                    changeHash: false,
                });

                this.assessmentImprovePlanEditView.model = this.c_assessment.get(ai_id);
                this.assessmentImprovePlanEditView.render(lx, pi, ip_id, seg_name);

            },
            //----------指标选择屏幕----------//
            pi_select: function(mode, target_field) {
                $("body").pagecontainer("change", "#pi_select", {
                    reverse: false,
                    changeHash: false,
                });
                this.piSelectView.target_field = target_field;
                this.piSelectView.collection = this.c_assessment;
                this.piSelectView.render(mode);
            },
            //
            summary: function() { //绩效总结
                var self = this;
                $("body").pagecontainer("change", "#summary_list", {
                    reverse: false,
                    changeHash: false,
                });
                $.mobile.loading("show");
                self.AssessmentSummaryView.pre_render();
                self.c_assessment_summary.url = '/admin/pm/assessment_instance/summary/bb';
                self.c_assessment_summary.fetch().done(function() {
                    self.c_people.fetch().done(function() {
                        self.AssessmentSummaryView.c_people = self.c_people;
                        self.AssessmentSummaryView.render();
                        $.mobile.loading('hide');
                    })
                })
            },
            summary_edit: function(ai_id, ai_status) { //绩效总结明细查看
                var self = this;

                $("body").pagecontainer("change", "#summary_edit_form", {
                    reverse: false,
                    changeHash: false,
                });
                $.mobile.loading("show");
                self.AssessmentSummaryEditView.pre_render();
                self.c_assessment_summary.url = '/admin/pm/assessment_instance/summary/bb/' + ai_id;
                self.c_assessment_summary.fetch().done(function() {
                    self.AssessmentSummaryEditView.ai_status = ai_status;
                    var is_self = self.c_assessment_summary.models[0].attributes.people._id == String($("#login_people").val());
                    self.AssessmentSummaryEditView.is_self = is_self;
                    self.AssessmentSummaryEditView.render();
                    $.mobile.loading('hide');

                })
            },
            wf_summary: function(_id, type) { //流程界面
                var self = this;
                $("body").pagecontainer("change", "#summary_wf_edit_form", {
                    reverse: false,
                    changeHash: false,
                });
                $.mobile.loading("show");
                self.AssessmentSummaryWfEditView.pre_render();
                if (type == 'view') { //流程查看
                    var process_instance_id = _id;
                    async.series({
                        wf_data: function(cb) {
                            $.get('/admin/pm/assessment_instance/summary/wf_summary_view_4m/' + process_instance_id, function(data) {
                                self.AssessmentSummaryWfEditView.data = data;
                                if (data) {
                                    cb(null, data.ai._id)

                                } else {
                                    cb(null, null)
                                }
                            })
                        }
                    }, function(err, data) {
                        self.c_assessment_summary.url = '/admin/pm/assessment_instance/summary/bb/' + data.wf_data;
                        self.c_assessment_summary.fetch().done(function() {
                            var is_self = self.c_assessment_summary.models[0].attributes.people._id == String($("#login_people").val());
                            //是否间接上级
                            var is_ind_superiors = self.c_assessment_summary.models[0].attributes.people.ind_superiors == String($("#login_people").val());
                            //是否直接上级
                            var is_superiors = self.c_assessment_summary.models[0].attributes.people.superiors == String($("#login_people").val());

                            self.AssessmentSummaryWfEditView.is_self = is_self;
                            self.AssessmentSummaryWfEditView.is_ind_superiors = is_ind_superiors;
                            self.AssessmentSummaryWfEditView.is_superiors = is_superiors;

                            self.AssessmentSummaryWfEditView.type = type;
                            self.AssessmentSummaryWfEditView.render();
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
                                        $.get('/admin/pm/assessment_instance/summary/wf_summary_4m/' + task_id, function(data) {
                                            self.AssessmentSummaryWfEditView.data = data;
                                            if (data) {
                                                cb(null, data.ai._id)

                                            } else {
                                                cb(null, null)
                                            }
                                        })
                                    }
                                }, function(err, data) {
                                    self.c_assessment_summary.url = '/admin/pm/assessment_instance/summary/bb/' + data.wf_data;
                                    self.c_assessment_summary.fetch().done(function() {
                                        var is_self = self.c_assessment_summary.models[0].attributes.people._id == String($("#login_people").val());
                                        //是否间接上级
                                        var is_ind_superiors = self.c_assessment_summary.models[0].attributes.people.ind_superiors == String($("#login_people").val());
                                        //是否直接上级
                                        var is_superiors = self.c_assessment_summary.models[0].attributes.people.superiors == String($("#login_people").val());
                                        self.AssessmentSummaryWfEditView.is_self = is_self;
                                        self.AssessmentSummaryWfEditView.is_ind_superiors = is_ind_superiors;
                                        self.AssessmentSummaryWfEditView.is_superiors = is_superiors;
                                        self.AssessmentSummaryWfEditView.type = type;
                                        self.AssessmentSummaryWfEditView.render();
                                        $.mobile.loading('hide');

                                    })
                                })
                            } else {
                                var type = "view";
                                var process_instance_id = data.msg.process_instance;
                                async.series({
                                    wf_data: function(cb) {
                                        $.get('/admin/pm/assessment_instance/summary/wf_summary_view_4m/' + process_instance_id, function(data) {
                                            self.AssessmentSummaryWfEditView.data = data;
                                            if (data) {
                                                cb(null, data.ai._id)

                                            } else {
                                                cb(null, null)
                                            }
                                        })
                                    }
                                }, function(err, data) {
                                    self.c_assessment_summary.url = '/admin/pm/assessment_instance/summary/bb/' + data.wf_data;
                                    self.c_assessment_summary.fetch().done(function() {
                                        var is_self = self.c_assessment_summary.models[0].attributes.people._id == String($("#login_people").val());
                                        //是否间接上级
                                        var is_ind_superiors = self.c_assessment_summary.models[0].attributes.people.ind_superiors == String($("#login_people").val());
                                        //是否直接上级
                                        var is_superiors = self.c_assessment_summary.models[0].attributes.people.superiors == String($("#login_people").val());

                                        self.AssessmentSummaryWfEditView.is_self = is_self;
                                        self.AssessmentSummaryWfEditView.is_ind_superiors = is_ind_superiors;
                                        self.AssessmentSummaryWfEditView.is_superiors = is_superiors;

                                        self.AssessmentSummaryWfEditView.type = type;
                                        self.AssessmentSummaryWfEditView.render();
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
            review: function() { //绩效面谈
                var self = this;
                $("body").pagecontainer("change", "#review_list", {
                    reverse: false,
                    changeHash: false,
                });
                $.mobile.loading("show");
                self.AssessmentReviewView.pre_render();
                self.c_assessment_review.url = '/admin/pm/assessment_instance/review/bb?source=m';
                self.c_assessment_review.fetch().done(function() {
                    self.c_people.fetch().done(function() {
                        self.AssessmentReviewView.c_people = self.c_people;
                        self.AssessmentReviewView.render();
                        $.mobile.loading('hide');
                    })
                })
            },
            review_edit: function(ai_id, ai_status) { //绩效面谈明细查看
                var self = this;

                $("body").pagecontainer("change", "#review_edit_form", {
                    reverse: false,
                    changeHash: false,
                });
                $.mobile.loading("show");
                self.AssessmentReviewEditView.pre_render();
                self.c_assessment_review.url = '/admin/pm/assessment_instance/review/bb/' + ai_id;
                self.c_assessment_review.fetch().done(function() {
                    self.AssessmentReviewEditView.ai_status = ai_status;
                    var is_self = self.c_assessment_review.models[0].attributes.people._id == String($("#login_people").val());
                    self.AssessmentReviewEditView.is_self = is_self;
                    self.AssessmentReviewEditView.render();
                    $.mobile.loading('hide');

                })
            },
            wf_review: function(_id, type) { //流程界面
                var self = this;
                $("body").pagecontainer("change", "#review_wf_edit_form", {
                    reverse: false,
                    changeHash: false,
                });
                $.mobile.loading("show");
                self.AssessmentReviewWfEditView.pre_render();
                if (type == 'view') { //流程查看
                    var process_instance_id = _id;
                    async.series({
                        wf_data: function(cb) {
                            $.get('/admin/pm/assessment_instance/review/wf_review_view_4m/' + process_instance_id, function(data) {
                                self.AssessmentReviewWfEditView.data = data;
                                if (data) {
                                    cb(null, data.ai._id)

                                } else {
                                    cb(null, null)
                                }
                            })
                        }
                    }, function(err, data) {
                        self.c_assessment_review.url = '/admin/pm/assessment_instance/review/bb/' + data.wf_data;
                        self.c_assessment_review.fetch().done(function() {
                            var is_self = self.c_assessment_review.models[0].attributes.people._id == String($("#login_people").val());

                            self.AssessmentReviewWfEditView.is_self = is_self;

                            self.AssessmentReviewWfEditView.type = type;
                            self.AssessmentReviewWfEditView.render();
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
                                        $.get('/admin/pm/assessment_instance/summary/wf_summary_4m/' + task_id, function(data) {
                                            self.AssessmentReviewWfEditView.data = data;
                                            if (data) {
                                                cb(null, data.ai._id)

                                            } else {
                                                cb(null, null)
                                            }
                                        })
                                    }
                                }, function(err, data) {
                                    self.c_assessment_review.url = '/admin/pm/assessment_instance/review/bb/' + data.wf_data;
                                    self.c_assessment_review.fetch().done(function() {
                                        var is_self = self.c_assessment_review.models[0].attributes.people._id == String($("#login_people").val());
                                        self.AssessmentReviewWfEditView.is_self = is_self;
                                        self.AssessmentReviewWfEditView.type = type;
                                        self.AssessmentReviewWfEditView.render();
                                        $.mobile.loading('hide');

                                    })
                                })
                            } else {
                                var type = "view";
                                var process_instance_id = data.msg.process_instance;
                                async.series({
                                    wf_data: function(cb) {
                                        $.get('/admin/pm/assessment_instance/review/wf_review_view_4m/' + process_instance_id, function(data) {
                                            self.AssessmentReviewWfEditView.data = data;
                                            if (data) {
                                                cb(null, data.ai._id)

                                            } else {
                                                cb(null, null)
                                            }
                                        })
                                    }
                                }, function(err, data) {
                                    self.c_assessment_review.url = '/admin/pm/assessment_instance/review/bb/' + data.wf_data;
                                    self.c_assessment_review.fetch().done(function() {
                                        var is_self = self.c_assessment_review.models[0].attributes.people._id == String($("#login_people").val());
                                        self.AssessmentReviewWfEditView.is_self = is_self;
                                        self.AssessmentReviewWfEditView.type = type;
                                        self.AssessmentReviewWfEditView.render();
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
            appeal: function() { //绩效申诉
                var self = this;
                localStorage.setItem('to_do_back_url', window.location.href);
                $("body").pagecontainer("change", "#appeal_list", {
                    reverse: false,
                    changeHash: false,
                });
                $.mobile.loading("show");
                self.AssessmentAppealView.pre_render();
                self.c_assessment_appeal.url = '/admin/pm/assessment_instance/appeal/bb';
                self.c_assessment_appeal.fetch().done(function() {
                    self.AssessmentAppealView.render();
                    $.mobile.loading('hide');
                })
            },
            appeal_edit: function(ai_id, view_status) { //绩效申诉明细查看
                var self = this;

                $("body").pagecontainer("change", "#appeal_edit_form", {
                    reverse: false,
                    changeHash: false,
                });
                $.mobile.loading("show");
                self.AssessmentAppealEditView.pre_render();
                self.c_assessment_appeal.url = '/admin/pm/assessment_instance/appeal/bb/' + ai_id;
                self.c_assessment_appeal.fetch().done(function() {
                    self.AssessmentAppealEditView.view_status = view_status;
                    self.AssessmentAppealEditView.render();
                    $.mobile.loading('hide');

                })
            },
            wf_appeal: function(_id, type) { //流程界面
                var self = this;
                $("body").pagecontainer("change", "#appeal_wf_edit_form", {
                    reverse: false,
                    changeHash: false,
                });
                $.mobile.loading("show");
                self.AssessmentAppealWfEditView.pre_render();
                if (type == 'view') { //流程查看
                    var process_instance_id = _id;
                    async.series({
                        wf_data: function(cb) {
                            $.get('/admin/pm/assessment_instance/review/wf_review_view_4m/' + process_instance_id, function(data) {
                                self.AssessmentAppealWfEditView.data = data;
                                if (data) {
                                    cb(null, data.ai._id)

                                } else {
                                    cb(null, null)
                                }
                            })
                        }
                    }, function(err, data) {
                        self.c_assessment_appeal.url = '/admin/pm/assessment_instance/appeal/bb/' + data.wf_data;
                        self.c_assessment_appeal.fetch().done(function() {
                            var is_self = self.c_assessment_appeal.models[0].attributes.people == String($("#login_people").val());
                            self.AssessmentAppealWfEditView.is_self = is_self;
                            self.AssessmentAppealWfEditView.view_status = type;
                            self.AssessmentAppealWfEditView.render();
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
                                        $.get('/admin/pm/assessment_instance/summary/wf_summary_4m/' + task_id, function(data) {
                                            self.AssessmentAppealWfEditView.data = data;
                                            if (data) {
                                                cb(null, data.ai._id)

                                            } else {
                                                cb(null, null)
                                            }
                                        })
                                    }
                                }, function(err, data) {
                                    self.c_assessment_appeal.url = '/admin/pm/assessment_instance/appeal/bb/' + data.wf_data;
                                    self.c_assessment_appeal.fetch().done(function() {
                                        var is_self = self.c_assessment_appeal.models[0].attributes.people == String($("#login_people").val());
                                        self.AssessmentAppealWfEditView.is_self = is_self;
                                        self.AssessmentAppealWfEditView.view_status = type;
                                        self.AssessmentAppealWfEditView.render();
                                        $.mobile.loading('hide');

                                    })
                                })
                            } else {
                                var type = "view";
                                var process_instance_id = data.msg.process_instance;
                                async.series({
                                    wf_data: function(cb) {
                                        $.get('/admin/pm/assessment_instance/review/wf_review_view_4m/' + process_instance_id, function(data) {
                                            self.AssessmentAppealWfEditView.data = data;
                                            if (data) {
                                                cb(null, data.ai._id)

                                            } else {
                                                cb(null, null)
                                            }
                                        })
                                    }
                                }, function(err, data) {
                                    self.c_assessment_appeal.url = '/admin/pm/assessment_instance/appeal/bb/' + data.wf_data;
                                    self.c_assessment_appeal.fetch().done(function() {
                                        var is_self = self.c_assessment_appeal.models[0].attributes.people == String($("#login_people").val());
                                        self.AssessmentAppealWfEditView.is_self = is_self;
                                        self.AssessmentAppealWfEditView.view_status = type;
                                        self.AssessmentAppealWfEditView.render();
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
                this.homeAssessmentView = new HomeAssessmentView({
                    el: "#home-assessment_wip-list",
                    collection: self.c_assessment
                });
                this.homeAssessmentHistoryView = new HomeAssessmentHistoryView({
                    el: "#home-assessment_history-list",
                    collection: self.c_assessment
                });
                this.homeAssessmentPIListView = new HomeAssessmentPIListView({
                    el: "#assessment_pi-list-content",
                });
                this.assessmentDetailView = new AssessmentDetailView({
                    el: "#assessment_detail-content"
                })
                this.assessmentCommentView = new AssessmentCommentView({
                    el: "#assessment_comment-content"
                })
                this.assessmentUpdateValueView = new AssessmentUpdateValueView({
                    el: "#assessment_update_value-content"
                })
                this.assessmentImprovePlanView = new AssessmentImprovePlanView({
                    el: "#assessment_improve_plan-content"
                })
                this.assessmentImprovePlanEditView = new AssessmentImprovePlanEditView({
                    el: "#assessment_improve_plan_edit-content"
                })
                this.piSelectView = new PISelectView({
                    el: "#pi_select-content",

                })
                this.AssessmentSummaryView = new AssessmentSummaryView({
                    el: "#summary_list-content",
                    collection: self.c_assessment_summary

                })
                this.AssessmentSummaryEditView = new AssessmentSummaryEditView({
                    el: "#summary_edit_form-content",
                    collection: self.c_assessment_summary

                })
                this.AssessmentSummaryWfEditView = new AssessmentSummaryWfEditView({
                    el: "#summary_wf_edit_form-content",
                    collection: self.c_assessment_summary

                })
                this.AssessmentReviewView = new AssessmentReviewView({
                    el: "#review_list-content",
                    collection: self.c_assessment_review

                })
                this.AssessmentReviewEditView = new AssessmentReviewEditView({
                    el: "#review_edit_form-content",
                    collection: self.c_assessment_review

                })
                this.AssessmentReviewWfEditView = new AssessmentReviewWfEditView({
                    el: "#review_wf_edit_form-content",
                    collection: self.c_assessment_review

                })
                this.AssessmentAppealView = new AssessmentAppealView({ //绩效申诉
                    el: "#appeal_list-content",
                    collection: self.c_assessment_appeal

                })
                this.AssessmentAppealEditView = new AssessmentAppealEditView({ //绩效申诉
                    el: "#appeal_edit_form-content",
                    collection: self.c_assessment_appeal

                })
                 this.AssessmentAppealWfEditView = new AssessmentAppealWfEditView({
                    el: "#appeal_wf_edit_form-content",
                    collection: self.c_assessment_appeal

                })
            },
            init_models: function() {

            },
            init_collections: function() {
                this.c_assessment = new AssessmentCollection(); //考核计划
                this.c_assessment_summary = new AssessmentSummaryCollection(); //绩效总结
                this.c_assessment_review = new AssessmentReviewCollection(); //绩效面谈
                this.c_assessment_appeal = new AssessmentAppealCollection(); //绩效申诉
                this.c_assessment_v = new AssessmentVCollection(); //考核计划-版本
                this.c_scoringformula = new ScoringFormulaCollection(); //计分公式
                this.c_gradegroup = new GradeGroupCollection(); //等级组
                this.c_people = new PeopleCollection();
                this.c_assessment_sub = new AssessmentSubCollection(); //考核计划-下属
            },
            bind_events: function() {
                var self = this;
                // $("#wrapper").pull_to_refresh({
                //     container: document.getElementById('assessment_list-content'),
                //     pull_to_refresh_text: '下拉刷新数据...',
                //     letgo_text: '松开刷新...',
                //     refreshing_text: '正在获取新数据...',
                //     status_indicator_id: 'pull_to_refresh',
                //     refreshClass: 'refresh',
                //     visibleClass: 'visible',
                //     refresh: function(stoploading) {
                //         self.refresh_data(function() {
                //             self.homeAssessmentView.render();
                //             self.homeAssessmentHistoryView.render();
                //             stoploading();
                //         });
                //         // stoploading();
                //     }
                // })
            },
            init_data: function() { //初始化的时候，先从local storage里面恢复数据，如果localstorage里面没有，则去服务器fetch
                var self = this;
                // self.load_data(self.c_assessment, 'assessment');
                self.load_data(self.c_scoringformula, 'scoringformula');
                self.load_data(self.c_gradegroup, 'gradegroup');
            },
            load_data: function(col_obj, col_name) { //加载数据
                $.mobile.loading("show");
                var login_people = $("#login_people").val();
                var cn = col_name
                var local_data = JSON.parse(LZString.decompressFromUTF16(localStorage.getItem(cn)) || null)
                    // var local_data = localStorage.getItem(cn);
                if (local_data) {
                    col_obj.reset(local_data);
                    col_obj.trigger('sync');
                    $.mobile.loading("hide");
                } else {
                    col_obj.fetch().done(function() {
                        localStorage.setItem(cn, LZString.compressToUTF16(JSON.stringify(col_obj)));
                        $.mobile.loading("hide");
                    })
                };
            },
            refresh_data: function(callback) {
                var self = this;
                $.mobile.loading("show");
                async.parallel({
                    assessment: function(cb) {
                        // 刷新考核数据
                        self.c_assessment.fetch().done(function() {
                            localStorage.setItem('assessment', LZString.compressToUTF16(JSON.stringify(self.c_assessment)))
                            cb(null, 'OK');
                        })
                    },

                }, function(err, result) {
                    if (typeof callback == 'function') {
                        window.setTimeout(function() {
                            callback();
                        }, 3000);
                        // callback();
                    };
                    $.mobile.loading("hide");
                })
            }
        });

        return AssessmentRouter;
    })