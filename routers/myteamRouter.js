// myteam router
// ====================

define(["jquery", "backbone", "handlebars", "lzstring", "async",
        "../collections/ScoringFormulaCollection", "../collections/GradeGroupCollection",
        "../collections/AssessmentCollection", "../collections/AssessmentVCollection",
        "../collections/TaskCollection", "../collections/PayrollCollection", "../collections/CompetencyCollection",
        "../collections/PeopleCollection", "../collections/TalentCollection",

        "../models/AssessmentModel", "../models/CompetencyModel", "../models/TalentModel",

        "../views/PayrollDetailView",
        "../views/MyTeamTalentView", "../views/CompetencyScoresView",
        //我的团队相关
        "../views/MyTeamListView", "../views/MyTeamDetailView", "../views/MyTeamTaskView", "../views/MyTeamTaskDetailView", "../views/MyTeamTaskEditView", "../views/MyTeamAllListView", "../views/MyTeamDetailLeftView",
        //团队考核相关
        "../views/MyTeamAssessmentCommentView", "../views/MyTeamAssessmentUpdateValueView", "../views/MyTeamAssessmentImprovePlanView",

        "../views/MyTeamAssessmentView", "../views/MyTeamAssessmentPIListView", "../views/MyTeamAssessmentDetailView",

    ],
    function($, Backbone, Handlebars, LZString, async,
        ScoringFormulaCollection, GradeGroupCollection,
        AssessmentCollection, AssessmentVCollection,
        TaskCollection, PayrollCollection, CompetencyCollection,
        PeopleCollection, TalentCollection,

        AssessmentModel, CompetencyModel, TalentModel,

        PayrollDetailView,
        MyTeamTalentView, CompetencyScoresView,
        MyTeamListView, MyTeamDetailView, MyTeamTaskView, MyTeamTaskDetailView, MyTeamTaskEditView, MyTeamAllListView, MyTeamDetailLeftView,
        MyTeamAssessmentCommentView, MyTeamAssessmentUpdateValueView, MyTeamAssessmentImprovePlanView,
        MyTeamAssessmentView, MyTeamAssessmentPIListView, MyTeamAssessmentDetailView

    ) {

        var MyTeamRouter = Backbone.Router.extend({
            initialize: function() {
                var self = this;
                self.init_models();
                self.init_collections();
                self.init_views();
                self.init_data();
                self.bind_events();
                console.info('app message: myteam router initialized');
                // Backbone.history.start();
            },
            routes: {
                //我的团队相关
                "myteamall": "myteam_all_list", // <- OK
                "myteam": "myteam_list", // <- OK
                "myteam_detail/:people_id/:tab": "myteam_detail", // <- OK
                "myteam_detail/:people_id/calendar/:task_id": "myteam_detail_calendar", // <- OK
                "myteam_detail/:people_id/calendar/:task_id/edit": "myteam_detail_calendar_edit", // <- OK
                "myteam_competency_scores/:people_id/:cid": "myteam_competency_scores", // <- should OK
                "myteam_salary_detail/:people_id/:pay_time": "myteam_salary_detail", // <- OK
                "myteam_assessment_pi_list/:people_id/:ai_id": "myteam_assessment_pi_list", // <- OK
                "myteam_assessment_detail/:people_id/:ai_id/:lx/:pi": "myteam_assessment_detail", // <- 改
                "myteam_assessment_comment/:people_id/:ai_id/:lx/:pi": "myteam_assessment_comment", // <- 改
                "myteam_assessment_update_value/:people_id/:ai_id/:lx/:pi": "myteam_assessment_update_value", // <- 改
                "myteam_assessment_improve_plan/:people_id/:ai_id/:lx/:pi": "myteam_assessment_improve_plan", // <- 改

            },
            myteam_all_list: function() {
                $("body").pagecontainer("change", "#myteam_all_list", {
                    reverse: false,
                    changeHash: false,
                });
            },
            myteam_list: function() { //我的团队，列表界面
                $("body").pagecontainer("change", "#myteam_list", {
                    reverse: false,
                    changeHash: false,
                });
                this.myteamListView.render();
            },
            myteam_detail: function(people_id, tab) { //我的团队，详情界面
                var self = this;
                self.myTeamDetailLeftView.template = Handlebars.compile($("#myteam_detail_left_panel_view").html());
                if (tab == 'basic') {
                    $("body").pagecontainer("change", "#myteam_detail-basic", {
                        reverse: false,
                        changeHash: false,
                    });
                    $.mobile.loading("show");
                    async.parallel({
                        people: function(cb) {
                            cb(null, self.c_people.get(people_id));
                        },
                        payroll: function(cb) {
                            self.c_payroll_myteam.url = '/admin/py/payroll_people/get_payroll_instances?people=' + people_id + '&ct=' + (new Date()).getTime();
                            self.c_payroll_myteam.fetch().done(function() {
                                cb(null, self.c_payroll_myteam);
                            })
                        },
                        competency: function(cb) {
                            // self.c_competency.get(people_id)
                            if (self.c_competency.get(people_id)) {
                                var tmp = self.c_competency.get(people_id);
                                tmp.fetch().done(function() {
                                    cb(null, tmp);
                                })
                            } else {
                                var tmp = new CompetencyModel({
                                    people_id: people_id
                                })
                                self.c_competency.set(tmp);
                                tmp.fetch().done(function() {
                                    cb(null, tmp);
                                })
                            };
                        }
                    }, function(err, result) {
                        self.myteamDetailView.model = result.people;
                        self.myteamDetailView.payroll = result.payroll;
                        self.myteamDetailView.competency = result.competency;
                        self.myteamDetailView.render();
                        //侧边栏
                        self.myTeamDetailLeftView.people_id = result.people.attributes._id;
                        self.myTeamDetailLeftView.cont = $("#myteam_detail-basic");
                        self.myTeamDetailLeftView.el = $("#myteam_detail-basic-left-panel");
                        self.myTeamDetailLeftView.btn_mode = 'basic';
                        self.myTeamDetailLeftView.render();

                        $.mobile.loading("hide");
                    })


                    //获取工资
                    // self.c_payroll_myteam.url = '/admin/py/payroll_people/get_payroll_instances?people=' + people_id + '&ct=' + (new Date()).getTime();
                    // var local_data = JSON.parse(LZString.decompressFromUTF16(localStorage.getItem('payroll_' + people_id)) || null)
                    // if (local_data) {
                    //     self.c_payroll_myteam.reset(local_data);
                    //     self.c_payroll_myteam.trigger('sync');
                    //     $.mobile.loading("hide");
                    //     self.myteamDetailView.model = self.c_people.get(people_id);
                    //     self.myteamDetailView.render(self.c_payroll_myteam, self.c_competency.get(people_id));
                    // } else {
                    //     self.c_payroll_myteam.fetch().done(function() {
                    //         localStorage.setItem('payroll_' + people_id, LZString.compressToUTF16(JSON.stringify(self.c_payroll_myteam)));
                    //         $.mobile.loading("hide");
                    //         self.myteamDetailView.model = self.c_people.get(people_id);
                    //         self.myteamDetailView.render(self.c_payroll_myteam, self.c_competency.get(people_id));
                    //     })
                    // };

                } else if (tab == 'calendar') {
                    // console.log('message in: myteam_detail::calendar');
                    //重新指定route
                    var $cal = $("#jqm_cal_myteam");
                    $cal.data('jqmCalendar').settings.route = '#myteam_detail/' + people_id + '/calendar';

                    //获取日历数据
                    $.mobile.loading("show");
                    this.c_task_myteam.url = '/admin/pm/work_plan/bb4m?people=' + people_id + '&ct=' + (new Date()).getTime();
                    var local_data = JSON.parse(LZString.decompressFromUTF16(localStorage.getItem('task_' + people_id)) || null)
                    if (local_data) {
                        self.c_task_myteam.reset(local_data);
                        self.c_task_myteam.trigger('sync');
                        $.mobile.loading("hide");
                    } else {
                        self.c_task_myteam.fetch().done(function() {
                            localStorage.setItem('task_' + people_id, LZString.compressToUTF16(JSON.stringify(self.c_task_myteam)));
                            $.mobile.loading("hide");
                        })
                    };
                    // this.c_task_myteam.fetch().done();
                    $("#myteam_detail-task")
                        .find("#myteam_detail-task-h1").html(this.c_people.get(people_id).get('people_name')).end()
                        .find("#btn-myteam_detail-task-1").attr('href', '#myteam_detail/' + people_id + '/basic').end()
                        .find("#btn-myteam_detail-task-2").attr('href', '#myteam_detail/' + people_id + '/calendar').end()
                        .find("#btn-myteam_detail-task-3").attr('href', '#myteam_detail/' + people_id + '/assessment').end()
                        .find("#btn-myteam_detail-task-4").attr('href', '#myteam_detail/' + people_id + '/talent').end()
                        .find("#btn-myteam_detail-task-5").attr('href', '#myteam_detail/' + people_id + '/calendar/refresh').end()
                        .find("#btn-myteam_detail-task-6").attr('href', '#myteam_detail/' + people_id + '/calendar/cm').end()
                        .find("#btn-myteam_detail-task-7").attr('href', '#myteam_detail/' + people_id + '/calendar/cd').end()
                        .find("#btn-myteam_detail-task-8").attr('href', '#myteam_detail/' + people_id + '/calendar/new').end()

                    $("body").pagecontainer("change", "#myteam_detail-task", {
                        reverse: false,
                        changeHash: false,
                    });
                    //侧边栏
                    self.myTeamDetailLeftView.people_id = people_id;
                    self.myTeamDetailLeftView.cont = $("#myteam_detail-task");
                    self.myTeamDetailLeftView.el = $("#myteam_detail-task-left-panel");
                    self.myTeamDetailLeftView.btn_mode = 'calendar';
                    self.myTeamDetailLeftView.render();
                } else if (tab == 'assessment') { //下属的绩效
                    $("body").pagecontainer("change", "#myteam_detail-assessment", {
                        reverse: false,
                        changeHash: false,
                    });
                    //获取绩效数据
                    $.mobile.loading("show");
                    self.c_assessment_myteam.url = '/admin/pm/assessment_instance/get_my_assessments_4m?people=' + people_id + '&ct=' + (new Date()).getTime();
                    self.c_assessment_myteam.fetch().done(function() {
                        self.myTeamAssessmentView.render(people_id, self.c_people.get(people_id).get('people_name'));
                        $.mobile.loading("hide");

                        //侧边栏
                        self.myTeamDetailLeftView.people_id = people_id;
                        self.myTeamDetailLeftView.cont = $("#myteam_detail-assessment");
                        self.myTeamDetailLeftView.el = $("#myteam_detail-assessment-left-panel");
                        self.myTeamDetailLeftView.btn_mode = 'assessment';
                        self.myTeamDetailLeftView.render();
                    })

                    // var local_data = JSON.parse(LZString.decompressFromUTF16(localStorage.getItem('assessment_' + people_id)) || null)

                    // if (local_data) {
                    //     self.c_assessment_myteam.reset(local_data);
                    //     // self.c_assessment_myteam.trigger('sync');
                    //     $.mobile.loading("hide");
                    //     self.myTeamAssessmentView.render(people_id, self.c_people.get(people_id).get('people_name'));
                    // } else {
                    //     self.c_assessment_myteam.fetch().done(function() {
                    //         localStorage.setItem('assessment_' + people_id, LZString.compressToUTF16(JSON.stringify(self.c_assessment_myteam)));
                    //         $.mobile.loading("hide");
                    //         self.myTeamAssessmentView.render(people_id, self.c_people.get(people_id).get('people_name'));
                    //     })
                    // };

                } else if (tab == 'talent') {
                    // console.log('message: in talent tab');
                    $("body").pagecontainer("change", "#myteam_detail-talent", {
                        reverse: false,
                        changeHash: false,
                    });
                    $.mobile.loading("show");
                    if (self.c_talent.get(people_id)) {
                        self.myteamTalentView.model = self.c_talent.get(people_id);
                        self.myteamTalentView.model.fetch().done(function() {
                            self.myteamTalentView.render(self.c_people.get(people_id).get('people_name'));
                            $.mobile.loading("hide");

                            //侧边栏
                            self.myTeamDetailLeftView.people_id = people_id;
                            self.myTeamDetailLeftView.cont = $("#myteam_detail-talent");
                            self.myTeamDetailLeftView.el = $("#myteam_detail-talent-left-panel");
                            self.myTeamDetailLeftView.btn_mode = 'talent';
                            self.myTeamDetailLeftView.render();
                        })
                    } else {
                        var tmp = new TalentModel({
                            people_id: people_id
                        })
                        self.c_talent.set(tmp);
                        self.myteamTalentView.model = tmp;
                        tmp.fetch().done(function() {
                            self.myteamTalentView.render(self.c_people.get(people_id).get('people_name'));
                            $.mobile.loading("hide");
                            //侧边栏
                            self.myTeamDetailLeftView.people_id = people_id;
                            self.myTeamDetailLeftView.cont = $("#myteam_detail-talent");
                            self.myTeamDetailLeftView.el = $("#myteam_detail-talent-left-panel");
                            self.myTeamDetailLeftView.btn_mode = 'talent';
                            self.myTeamDetailLeftView.render();
                        })
                    };


                };
            },
            myteam_detail_calendar: function(people_id, task_id) { //我的团队，日历操作功能
                var self = this;
                if (task_id == 'refresh') { //刷新数据
                    $.mobile.loading("show");
                    self.c_task_myteam.url = '/admin/pm/work_plan/bb4m?people=' + people_id + '&ct=' + (new Date()).getTime();
                    self.c_task_myteam.fetch().done(function() {
                        localStorage.setItem('task_' + people_id, LZString.compressToUTF16(JSON.stringify(self.c_task_myteam)))
                        $.mobile.loading("hide");
                    })
                } else if (task_id == 'cm') { //转到当月
                    $("#jqm_cal_myteam").trigger('refresh', [new Date(), true]);
                } else if (task_id == 'cd') { //转到今天
                    $("#jqm_cal_myteam").trigger('refresh', [new Date()]);
                } else if (task_id == 'new') { //为下属新建一条
                    var new_task_date = $("#jqm_cal_myteam a.ui-btn-active").data('date') || new Date();
                    var new_task = this.c_task_myteam.add({
                        'creator': $("#login_people").val(),
                        'people': people_id, //为这个人创建的工作任务
                        'title': '新建任务',
                        'start': new_task_date,
                        'end': new_task_date,
                        'allDay': true,
                        'is_complete': false,
                        'startEditable': true,
                        'durationEditable': true,
                        'editable': true,
                        'forward_people': []
                    });
                    self.myteamTaskEditView.model = new_task;
                    self.myteamTaskEditView.render();
                    $("body").pagecontainer("change", "#myteam_task_edit", {
                        reverse: false,
                        changeHash: false,
                    });

                    //把 a 换成 span， 避免点那个滑块的时候页面跳走。
                    $(".ui-flipswitch a").each(function() {
                        $(this).replaceWith("<span class='" + $(this).attr('class') + "'></span>");
                    });
                } else { //跳到任务详情界面
                    self.myteamTaskDetailView.model = self.c_task_myteam.get(task_id);
                    self.myteamTaskDetailView.render();
                    $("#btn-myteam_task_detail-back").attr('href', '#myteam_detail/' + people_id + '/calendar')
                    //只有当前用户创建的才可以更改（显示更改按钮）
                    if (self.myteamTaskDetailView.model.get('creator')._id == $("#login_people").val()) {
                        $("#btn-myteam_task_detail-task-edit").attr('href', '#myteam_detail/' + people_id + '/calendar/' + task_id + '/edit').show();
                    } else {
                        $("#btn-myteam_task_detail-task-edit").hide();
                    };
                    $("body").pagecontainer("change", "#myteam_task_detail", {
                        reverse: false,
                        changeHash: false,
                    });
                };
            },
            myteam_detail_calendar_edit: function(people_id, task_id) {
                var self = this;
                self.myteamTaskEditView.model = self.c_task_myteam.get(task_id);
                self.myteamTaskEditView.render();
                $("body").pagecontainer("change", "#myteam_task_edit", {
                    reverse: false,
                    changeHash: false,
                });

                //把 a 换成 span， 避免点那个滑块的时候页面跳走。
                $(".ui-flipswitch a").each(function() {
                    $(this).replaceWith("<span class='" + $(this).attr('class') + "'></span>");
                });
            },
            myteam_competency_scores: function(people_id, cid) {
                var self = this;
                $("body").pagecontainer("change", "#competency_scores", {
                    reverse: false,
                    changeHash: false,
                });
                $.mobile.loading('show');
                if (self.c_competency.get(people_id)) {
                    self.competencyScoresView.model = self.c_competency.get(people_id);
                    self.competencyScoresView.model.fetch().done(function() {
                        self.competencyScoresView.render(people_id, cid);
                        $.mobile.loading('hide');
                    })
                } else {
                    var tmp = new CompetencyModel({
                        people_id: people_id
                    })
                    self.c_competency.set(tmp);
                    tmp.fetch().done(function() {
                        self.competencyScoresView.model = tmp;
                        self.competencyScoresView.render(people_id, cid);
                        $.mobile.loading('hide');
                    })
                };

            },
            myteam_salary_detail: function(people_id, pay_time) { //通过localStorage来传递数据
                localStorage.setItem('payroll_detail_data', JSON.stringify(this.c_payroll_myteam.get(pay_time)));
                localStorage.setItem('payroll_detail_backurl', '#myteam_detail/' + people_id + '/basic');
                this.payrollDetailView.render();
                $("body").pagecontainer("change", "#salary_detail", {
                    reverse: false,
                    changeHash: false,
                });
            },

            myteam_assessment_pi_list: function(people_id, ai_id) { //团队成员的绩效合同－指标清单
                var self = this;
                $("body").pagecontainer("change", "#myteam_assessment_pi-list", {
                    reverse: false,
                    changeHash: false,
                });
                $.mobile.loading('show');
                if (self.c_assessment_myteam.get(ai_id)) {
                    self.myteamAssessmentPIListView.model = self.c_assessment_myteam.get(ai_id);
                    self.myteamAssessmentPIListView.model.fetch().done(function() {
                        self.myteamAssessmentPIListView.render(people_id);
                        $.mobile.loading('hide');
                    })
                } else {
                    var tmp = new AssessmentModel({
                        _id: ai_id
                    });
                    self.c_assessment_myteam.set(tmp)
                    tmp.fetch().done(function() {
                        self.myteamAssessmentPIListView.model = tmp;
                        self.myteamAssessmentPIListView.render(people_id);
                        $.mobile.loading('hide');
                    })
                };
            },
            myteam_assessment_detail: function(people_id, ai_id, lx, pi) { //团队成员的绩效合同－指标详情
                localStorage.setItem('colltask_detail_back_url', window.location.href);
                localStorage.setItem('collproject_detail_back_url', window.location.href);
                var self = this;
                $("body").pagecontainer("change", "#myteam_assessment_detail", {
                    reverse: false,
                    changeHash: false,
                });
                $.mobile.loading('show');
                self.myteamAssessmentDetailView.scoringformula = self.c_scoringformula;
                self.myteamAssessmentDetailView.gradegroup = self.c_gradegroup;
                if (self.c_assessment_myteam.get(ai_id)) {
                    self.myteamAssessmentDetailView.model = self.c_assessment_myteam.get(ai_id);
                    self.myteamAssessmentDetailView.model.fetch().done(function() {
                        self.myteamAssessmentDetailView.render(people_id, lx, pi);
                        $.mobile.loading('hide');
                    })
                } else {
                    var tmp = new AssessmentModel({
                        _id: ai_id
                    });
                    self.c_assessment_myteam.set(tmp)
                    tmp.fetch().done(function() {
                        self.myteamAssessmentDetailView.model = tmp;
                        self.myteamAssessmentDetailView.render(people_id, lx, pi);
                        $.mobile.loading('hide');
                    })
                };

            },
            myteam_assessment_comment: function(people_id, ai_id, lx, pi) { //团队成员的绩效合同－沟通与记录（读写）
                var self = this;
                $("body").pagecontainer("change", "#myteam_assessment_comment", {
                    reverse: false,
                    changeHash: false,
                });
                $.mobile.loading('show');
                self.myteamAssessmentCommentView.scoringformula = self.c_scoringformula;
                self.myteamAssessmentCommentView.gradegroup = self.c_gradegroup;
                if (self.c_assessment_myteam.get(ai_id)) {
                    self.myteamAssessmentCommentView.model = self.c_assessment_myteam.get(ai_id);
                    self.myteamAssessmentCommentView.model.fetch().done(function() {
                        self.myteamAssessmentCommentView.render(people_id, lx, pi);
                        $.mobile.loading('hide');
                    })
                } else {
                    var tmp = new AssessmentModel({
                        _id: ai_id
                    });
                    self.c_assessment_myteam.set(tmp)
                    tmp.fetch().done(function() {
                        self.myteamAssessmentCommentView.model = tmp;
                        self.myteamAssessmentCommentView.render(people_id, lx, pi);
                        $.mobile.loading('hide');
                    })
                };
            },
            myteam_assessment_update_value: function(people_id, ai_id, lx, pi) { //团队成员的绩效合同－数据更新（只读）
                var self = this;
                $("body").pagecontainer("change", "#myteam_assessment_update_value", {
                    reverse: false,
                    changeHash: false,
                });
                $.mobile.loading('show');
                self.myteamAssessmentUpdateValueView.scoringformula = self.c_scoringformula;
                self.myteamAssessmentUpdateValueView.gradegroup = self.c_gradegroup;
                if (self.c_assessment_myteam.get(ai_id)) {
                    self.myteamAssessmentUpdateValueView.model = self.c_assessment_myteam.get(ai_id);
                    self.myteamAssessmentUpdateValueView.model.fetch().done(function() {
                        self.myteamAssessmentUpdateValueView.render(people_id, lx, pi);
                        $.mobile.loading('hide');
                    })
                } else {
                    var tmp = new AssessmentModel({
                        _id: ai_id
                    });
                    self.c_assessment_myteam.set(tmp)
                    tmp.fetch().done(function() {
                        self.myteamAssessmentUpdateValueView.model = tmp;
                        self.myteamAssessmentUpdateValueView.render(people_id, lx, pi);
                        $.mobile.loading('hide');
                    })
                };
            },
            myteam_assessment_improve_plan: function(people_id, ai_id, lx, pi) { //团队成员的绩效合同－分析与改进（只读）
                var self = this;
                $("body").pagecontainer("change", "#myteam_assessment_improve_plan", {
                    reverse: false,
                    changeHash: false,
                });
                self.myteamAssessmentImprovePlanView.scoringformula = self.c_scoringformula;
                self.myteamAssessmentImprovePlanView.gradegroup = self.c_gradegroup;
                if (self.c_assessment_myteam.get(ai_id)) {
                    self.myteamAssessmentImprovePlanView.model = self.c_assessment_myteam.get(ai_id);
                    self.myteamAssessmentImprovePlanView.model.fetch().done(function() {
                        self.myteamAssessmentImprovePlanView.render(people_id, lx, pi);
                    })
                } else {
                    var tmp = new AssessmentModel({
                        _id: ai_id
                    });
                    self.c_assessment_myteam.set(tmp)
                    tmp.fetch().done(function() {
                        self.myteamAssessmentImprovePlanView.model = tmp;
                        self.myteamAssessmentImprovePlanView.render(people_id, lx, pi);
                        $.mobile.loading('hide');
                    })
                }
            },

            //
            init_views: function() {
                var self = this;
                this.myteamListView = new MyTeamListView({
                    el: "#myteam_list-content",
                    collection: self.c_people
                })
                this.myteamDetailView = new MyTeamDetailView({
                    el: "#myteam_detail-basic-content"
                })
                this.myteamTaskView = new MyTeamTaskView({
                    el: "#myteam_detail-basic-calendar",
                    collection: self.c_task_myteam
                })
                this.myteamTaskDetailView = new MyTeamTaskDetailView({
                    el: "#myteam_task_detail-content",
                })
                this.myteamTaskEditView = new MyTeamTaskEditView({
                    el: "#myteam_task_edit",
                })
                this.myteamTalentView = new MyTeamTalentView({
                    el: "#myteam_detail-talent-content",
                })
                this.myTeamAssessmentView = new MyTeamAssessmentView({
                    el: "#myteam_detail-assessment-content",
                    collection: self.c_assessment_myteam
                })
                this.myteamAssessmentPIListView = new MyTeamAssessmentPIListView({
                    el: "#myteam_assessment_pi-list-content",
                })
                this.myteamAssessmentDetailView = new MyTeamAssessmentDetailView({
                    el: "#myteam_assessment_detail-content",
                })
                this.myteamAssessmentCommentView = new MyTeamAssessmentCommentView({
                    el: "#myteam_assessment_comment-content",
                })
                this.myteamAssessmentUpdateValueView = new MyTeamAssessmentUpdateValueView({
                    el: "#myteam_assessment_update_value-content",
                })
                this.myteamAssessmentImprovePlanView = new MyTeamAssessmentImprovePlanView({
                    el: "#myteam_assessment_improve_plan-content",
                })
                this.myteamAllListView = new MyTeamAllListView({
                    el: "#myteam_all_list-content",
                    collection: self.c_people
                })
                this.payrollDetailView = new PayrollDetailView();
                this.competencyScoresView = new CompetencyScoresView({
                    el: "#competency_scores-content",
                })
                this.myTeamDetailLeftView = new MyTeamDetailLeftView();
            },
            init_models: function() {

            },
            init_collections: function() {
                this.c_assessment_myteam = new AssessmentCollection(); //团队成员的考核计划－获取的时候需要修改url，把下属的people id拼进去再fetch。
                this.c_assessment_v_myteam = new AssessmentVCollection(); //团队成员的考核计划－获取的时候需要修改url，把下属的people id拼进去再fetch。 －版本
                this.c_task_myteam = new TaskCollection(); //团队成员的工作任务－获取的时候需要修改url，把下属的people id拼进去再fetch。
                this.c_people = new PeopleCollection();
                this.c_talent = new TalentCollection(); //人才
                this.c_payroll_myteam = new PayrollCollection(); //团队成员的工资－获取的时候需要修改url，把下属的people id拼进去再fetch。
                this.c_competency = new CompetencyCollection(); //能力素质
                this.c_scoringformula = new ScoringFormulaCollection(); //能力素质
                this.c_gradegroup = new GradeGroupCollection(); //能力素质

            },
            bind_events: function() {

            },
            init_data: function() { //初始化的时候，先从local storage里面恢复数据，如果localstorage里面没有，则去服务器fetch
                var self = this;
                self.load_data(self.c_people, 'people');
                // self.load_data(self.c_talent, 'talent');
                // self.load_data(self.c_horoscope, 'horoscope');
                // self.load_data(self.c_competency, 'competency');
                self.load_data(self.c_scoringformula, 'scoringformula');
                self.load_data(self.c_gradegroup, 'gradegroup');
                // self.load_data(self.c_payroll, 'payroll');
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
        });

        return MyTeamRouter;
    })