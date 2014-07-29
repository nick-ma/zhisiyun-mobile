// assessment instances router
// ===========================

define(["jquery", "backbone", "handlebars", "lzstring",
        // 计分公式和等级组
        "../collections/ScoringFormulaCollection", "../collections/GradeGroupCollection",
        "../collections/AssessmentCollection","../collections/AssessmentVCollection",
        // views
        "../views/assessment/Home", "../views/assessment/HomeHistory",
        "../views/assessment/HomePIList", 
        "../views/assessment/Comment", "../views/assessment/UpdateValue",
        "../views/assessment/ImprovePlan", "../views/assessment/ImprovePlanEdit",
        "../views/assessment/Detail",
        // 指标选择界面
        "../views/PISelectView",

        "async", "pull-to-refresh"
    ],
    function($, Backbone, Handlebars, LZString,
        ScoringFormulaCollection, GradeGroupCollection,
        AssessmentCollection,AssessmentVCollection,
        //views
        HomeAssessmentView, HomeAssessmentHistoryView,
        HomeAssessmentPIListView, 
        AssessmentCommentView, AssessmentUpdateValueView,
        AssessmentImprovePlanView, AssessmentImprovePlanEditView,
        AssessmentDetailView,
        PISelectView,

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
            },
            assessment_list: function() {
                var self = this;
                // self.refresh_data();
                self.homeAssessmentView.render();
                self.homeAssessmentHistoryView.render();

                $("body").pagecontainer("change", "#assessment_list", {
                    reverse: false,
                    changeHash: false,
                });
            },
            assessment_pi_list: function(ai_id) { //做一个下拉更新的功能
                this.homeAssessmentPIListView.model = this.c_assessment.get(ai_id);
                this.homeAssessmentPIListView.render();
                $("body").pagecontainer("change", "#assessment_pi-list", {
                    reverse: false,
                    changeHash: false,
                });
            },
            assessment_detail: function(ai_id, lx, pi) { //绩效合同－单条指标的查看界面
                var self = this;

                self.assessmentDetailView.model = self.c_assessment.get(ai_id);
                self.assessmentDetailView.scoringformula = self.c_scoringformula;
                self.assessmentDetailView.gradegroup = self.c_gradegroup;
                self.assessmentDetailView.model.fetch().done(function() { //为了保证数据最新，需要重新fetch一下。
                    self.assessmentDetailView.render(lx, pi);
                })
                $("body").pagecontainer("change", "#assessment_detail", {
                    reverse: false,
                    changeHash: false,
                });
            },
            assessment_comment: function(ai_id, lx, pi) { //绩效合同－单条指标的编辑留言界面
                this.assessmentCommentView.model = this.c_assessment.get(ai_id);
                this.assessmentCommentView.render(lx, pi);
                $("body").pagecontainer("change", "#assessment_comment", {
                    reverse: false,
                    changeHash: false,
                });
            },
            assessment_update_value: function(ai_id, lx, pi) { //绩效合同－单条指标的编辑留言界面
                this.assessmentUpdateValueView.model = this.c_assessment.get(ai_id);
                this.assessmentUpdateValueView.scoringformula = this.c_scoringformula;
                this.assessmentUpdateValueView.gradegroup = this.c_gradegroup;
                this.assessmentUpdateValueView.render(lx, pi);
                $("body").pagecontainer("change", "#assessment_update_value", {
                    reverse: false,
                    changeHash: false,
                });
            },
            assessment_improve_plan: function(ai_id, lx, pi) { //绩效合同－单条指标的编辑留言界面
                var self = this;
                self.assessmentImprovePlanView.model = self.c_assessment.get(ai_id);
                // self.assessmentImprovePlanView.model.fetch().done(function() {
                self.assessmentImprovePlanView.render(lx, pi);
                // })
                $("body").pagecontainer("change", "#assessment_improve_plan", {
                    reverse: false,
                    changeHash: false,
                });
            },
            assessment_improve_plan_edit: function(ai_id, lx, pi, ip_id, seg_name) { //新增／修改改进措施
                this.assessmentImprovePlanEditView.model = this.c_assessment.get(ai_id);
                this.assessmentImprovePlanEditView.render(lx, pi, ip_id, seg_name);
                $("body").pagecontainer("change", "#assessment_improve_plan_edit", {
                    reverse: false,
                    changeHash: false,
                });
            },
            //----------指标选择屏幕----------//
            pi_select: function(mode, target_field) {
                this.piSelectView.target_field = target_field;
                this.piSelectView.collection = this.c_assessment;
                this.piSelectView.render(mode);
                $("body").pagecontainer("change", "#pi_select", {
                    reverse: false,
                    changeHash: false,
                });
            },
            //
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
            },
            init_models: function() {

            },
            init_collections: function() {
                this.c_assessment = new AssessmentCollection(); //考核计划
                this.c_assessment_v = new AssessmentVCollection(); //考核计划-版本
                this.c_scoringformula = new ScoringFormulaCollection(); //计分公式
                this.c_gradegroup = new GradeGroupCollection(); //等级组
            },
            bind_events: function() {
                var self = this;
                $("#wrapper").pull_to_refresh({
                    container: document.getElementById('assessment_list-content'),
                    pull_to_refresh_text: '下拉刷新数据...',
                    letgo_text: '松开刷新...',
                    refreshing_text: '正在获取新数据...',
                    status_indicator_id: 'pull_to_refresh',
                    refreshClass: 'refresh',
                    visibleClass: 'visible',
                    refresh: function(stoploading) {
                        self.refresh_data(function() {
                            self.homeAssessmentView.render();
                            self.homeAssessmentHistoryView.render();
                            stoploading();
                        });
                        // stoploading();
                    }
                })
            },
            init_data: function() { //初始化的时候，先从local storage里面恢复数据，如果localstorage里面没有，则去服务器fetch
                var self = this;
                self.load_data(self.c_assessment, 'assessment');
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