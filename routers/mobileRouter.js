// Mobile Router
// =============

// Includes file dependencies
define(["jquery", "backbone", "handlebars", "lzstring",
    //首页
    "../views/HomeObjectiveView", "../collections/ObjectiveCollection",
    "../views/HomeAssessmentView", "../views/HomeAssessmentHistoryView", "../views/HomeAssessmentPIListView", "../collections/AssessmentCollection", "../views/AssessmentCommentView", "../views/AssessmentUpdateValueView", "../views/AssessmentImprovePlanView", "../collections/AssessmentVCollection",
    "../views/HomeTaskView", "../views/HomeMyTeamView",
    //工作日历相关
    "../models/TaskModel", "../collections/TaskCollection", "../views/TaskView", "../views/TaskDetailView", "../views/TaskEditView", "../views/TaskForwardView", "../views/TaskForwardSelectPeoplePanelView",
    //人员和组织相关
    "../models/PeopleModel", "../collections/PeopleCollection", "../views/ContactListView", "../views/ContactDetailView",
    //我的团队相关
    "../views/MyTeamListView", "../views/MyTeamDetailView", "../views/MyTeamTaskView", "../views/MyTeamTaskDetailView", "../views/MyTeamTaskEditView", "../views/MyTeamAllListView",
    //绩效考核合同相关
    "../views/AssessmentDetailView", "../views/MyTeamAssessmentView", "../views/MyTeamAssessmentPIListView", "../views/MyTeamAssessmentDetailView",
    // 人才盘点相关
    "../collections/TalentCollection", "../views/MyTeamTalentView", "../collections/HoroscopeCollection", "../views/Talent9GridsChartView",
    // 能力素质相关
    "../collections/CompetencyCollection", "../views/CompetencyScoresView", "../views/CompetencySpiderChartView", "../models/Q360Model",
    // 工资相关
    "../collections/PayrollCollection", "../views/PayrollListView", "../views/PayrollDetailView",
    // 个人档案
    "../views/MyProfileView",
    //其他jquery插件
    "async", "moment", "sprintf", "highcharts"
  ],
  function($, Backbone, Handlebars, LZString,
    HomeObjectiveView, ObjectiveCollection,
    HomeAssessmentView, HomeAssessmentHistoryView, HomeAssessmentPIListView, AssessmentCollection, AssessmentCommentView, AssessmentUpdateValueView, AssessmentImprovePlanView, AssessmentVCollection,
    HomeTaskView, HomeMyTeamView,
    TaskModel, TaskCollection, TaskView, TaskDetailView, TaskEditView, TaskForwardView, TaskForwardSelectPeoplePanelView,
    PeopleModel, PeopleCollection, ContactListView, ContactDetailView,
    MyTeamListView, MyTeamDetailView, MyTeamTaskView, MyTeamTaskDetailView, MyTeamTaskEditView, MyTeamAllListView,
    AssessmentDetailView, MyTeamAssessmentView, MyTeamAssessmentPIListView, MyTeamAssessmentDetailView,
    TalentCollection, MyTeamTalentView, HoroscopeCollection, Talent9GridsChartView,
    CompetencyCollection, CompetencyScoresView, CompetencySpiderChartView, Q360Model,
    PayrollCollection, PayrollListView, PayrollDetailView,
    MyProfileView,
    async, moment

  ) {
    // Extends Backbone.Router
    var MainRouter = Backbone.Router.extend({

      // The Router constructor
      initialize: function() {
        var self = this;
        this.init_models();
        //init collections
        this.init_cols();
        //init views
        this.init_views(self)
        //load data
        this.init_data();
        //
        this.start_auto_fetch(parseInt(localStorage.getItem('refresh_interval') || 0) * 60 * 1000);
        this.bind_events();
        // Tells Backbone to start watching for hashchange events
        Backbone.history.start();
      },

      // Backbone.js Routes
      routes: {

        //首页
        "": "home",
        // 返回上一个
        "goto/:pagename": "goto",
        // 绩效合同相关页面
        "assessment_pi_list/:ai_id": "assessment_pi_list",
        "assessment_detail/:ai_id/:lx/:pi/:ol": "assessment_detail",
        "assessment_comment/:ai_id/:lx/:pi/:ol": "assessment_comment",
        "assessment_update_value/:ai_id/:lx/:pi/:ol": "assessment_update_value",
        "assessment_improve_plan/:ai_id/:lx/:pi/:ol": "assessment_improve_plan",
        // When #category? is on the url, the category method is called
        //任务日历相关的routes
        "task": "task",
        "task/refresh": "task_refresh",
        "task/cm": "task_cm",
        "task/cd": "task_cd",
        "task/:task_id": "task_detail",
        "task_forward/:task_id": "task_forward",
        "task_edit/:task_id": "task_edit",
        //人员相关
        "contact_list": "contact_list",
        "contact_detail/:people_id": "contact_detail",
        //我的团队相关
        "myteamall": "myteam_all_list",
        "myteam": "myteam_list",
        "myteam_detail/:people_id/:tab": "myteam_detail",
        "myteam_detail/:people_id/calendar/:task_id": "myteam_detail_calendar",
        "myteam_detail/:people_id/calendar/:task_id/edit": "myteam_detail_calendar_edit",
        "myteam_competency_scores/:people_id/:cid": "myteam_competency_scores",
        "myteam_salary_detail/:people_id/:pay_time": "myteam_salary_detail",
        "myteam_assessment_pi_list/:people_id/:ai_id": "myteam_assessment_pi_list",
        "myteam_assessment_detail/:people_id/:ai_id/:lx/:pi/:ol": "myteam_assessment_detail",

        // 更多功能的导航页面
        "more_functions": "more_functions",
        "more_functions/refresh_local_storage": "refresh_local_storage",
        "more_functions/config_refresh_interval": "config_refresh_interval",
        "more_functions/clear_local_storage": "clear_local_storage",
        "more_functions/get_local_storage_size": "get_local_storage_size",
        // 个人薪酬报表－工资条
        "salary_list": "salary_list",
        "salary_detail/:pay_time": "salary_detail",
        // 我的资料
        "myprofile": "myprofile",
        // 能力测评明细
        "competency_scores/:cid": "competency_scores",
        "competency_spider_chart/:people_id/:qi_id": "competency_spider_chart",
        //人才九宫图
        "talent9grides/:people_id/:ai_score/:score": "talent9grides",
        //默认的路由。当找不到路由的时候，转到首页。
        "*path": "home",
      },

      // Home method
      home: function() { //首页
        $("body").pagecontainer("change", "#home", {
          reverse: false,
          changeHash: false,
        });
        // $.mobile.changePage("#home", {
        //   reverse: false,
        //   changeHash: false,
        //   // transition: "flip",
        // });
        $.mobile.loading("hide");
      },
      goto: function(pagename) {
        $("body").pagecontainer("change", "#" + pagename, {
          reverse: false,
          changeHash: false,
        });
      },
      more_functions: function() {
        if (navigator.onLine) {
          $("#online_status").removeClass('label-danger').addClass('label-success').text('在线');
        } else {
          $("#online_status").removeClass('label-success').addClass('label-danger').text('断网');
        };
        $("body").pagecontainer("change", "#more_functions", {
          reverse: false,
          changeHash: false,
        });
      },
      task: function() { //任务日历
        $("body").pagecontainer("change", "#task", {
          reverse: false,
          changeHash: false,
        });
      },
      task_refresh: function() { //刷新任务数据
        $.mobile.loading("show");
        var self = this;
        self.c_task.fetch().done(function() {
          var login_people = $("#login_people").val();
          localStorage.setItem('task_' + login_people, LZString.compressToUTF16(JSON.stringify(self.c_task)))
          $.mobile.loading("hide");
        })
      },
      task_cm: function() { //转到当前月
        $("#jqm_cal").trigger('refresh', [new Date(), true]);
      },
      task_cd: function() { //转到当天
        $("#jqm_cal").trigger('refresh', [new Date()]);
      },
      task_detail: function(task_id) { //查看任务详情
        this.taskDetailView.model = this.c_task.get(task_id);
        this.taskDetailView.render();
        $("body").pagecontainer("change", "#task_detail", {
          reverse: false,
          changeHash: false,
        });

      },
      task_forward: function(task_id) { //转发任务
        var self = this;
        self.taskForwardView.model = self.c_task.get(task_id);
        self.taskForwardView.render(self.c_people);
        $("#panel-fwd-people input[type=checkbox]:checked").removeAttr('checked').checkboxradio("refresh");; //把选择框都清空
        $("#people-for-forward").val(''); //清空隐藏域，避免发到错误的人。
        $("body").pagecontainer("change", "#task_forward", {
          reverse: false,
          changeHash: false,
        });
      },
      task_edit: function(task_id) { //编辑任务详情
        var taskEditView = this.taskEditView;
        if (task_id == 'new') {
          var new_task_date = $("#jqm_cal a.ui-btn-active").data('date') || new Date();
          var new_task = this.c_task.add({
            'title': '新建任务',
            'start': new_task_date,
            'end': new_task_date,
            'allDay': true,
            'is_complete': false,
            'startEditable': true,
            'durationEditable': true,
            'editable': true,
          });
          // new_task.save().done(function() {
          taskEditView.model = new_task;
          taskEditView.render();
          // })
        } else {
          taskEditView.model = this.c_task.get(task_id);
          taskEditView.render();
        }
        $("body").pagecontainer("change", "#task_edit", {
          reverse: false,
          changeHash: false,
        });

        //把 a 换成 span， 避免点那个滑块的时候页面跳走。
        $(".ui-flipswitch a").each(function() {
          $(this).replaceWith("<span class='" + $(this).attr('class') + "'></span>");
        });
      },
      assessment_pi_list: function(ai_id) {
        this.homeAssessmentPIListView.model = this.c_assessment.get(ai_id);
        this.homeAssessmentPIListView.render();
        $("body").pagecontainer("change", "#assessment_pi-list", {
          reverse: false,
          changeHash: false,
        });

      },
      assessment_detail: function(ai_id, lx, pi, ol) { //绩效合同－单条指标的查看界面
        this.assessmentDetailView.model = this.c_assessment.get(ai_id);
        this.assessmentDetailView.render(lx, pi, ol);
        $("body").pagecontainer("change", "#assessment_detail", {
          reverse: false,
          changeHash: false,
        });
      },
      assessment_comment: function(ai_id, lx, pi, ol) { //绩效合同－单条指标的编辑留言界面
        this.assessmentCommentView.model = this.c_assessment.get(ai_id);
        this.assessmentCommentView.render(lx, pi, ol);
        $("body").pagecontainer("change", "#assessment_comment", {
          reverse: false,
          changeHash: false,
        });
      },
      assessment_update_value: function(ai_id, lx, pi, ol) { //绩效合同－单条指标的编辑留言界面
        this.assessmentUpdateValueView.model = this.c_assessment.get(ai_id);
        this.assessmentUpdateValueView.render(lx, pi, ol);
        $("body").pagecontainer("change", "#assessment_update_value", {
          reverse: false,
          changeHash: false,
        });
      },
      assessment_improve_plan: function(ai_id, lx, pi, ol) { //绩效合同－单条指标的编辑留言界面
        this.assessmentImprovePlanView.model = this.c_assessment.get(ai_id);
        this.assessmentImprovePlanView.render(lx, pi, ol);
        $("body").pagecontainer("change", "#assessment_improve_plan", {
          reverse: false,
          changeHash: false,
        });
      },
      myteam_assessment_pi_list: function(people_id, ai_id) { //团队成员的绩效合同－指标清单
        this.myteamAssessmentPIListView.model = this.c_assessment_myteam.get(ai_id);
        this.myteamAssessmentPIListView.render(people_id);
        $("body").pagecontainer("change", "#myteam_assessment_pi-list", {
          reverse: false,
          changeHash: false,
        });

      },
      myteam_assessment_detail: function(people_id, ai_id, lx, pi, ol) { //团队成员的绩效合同－指标详情
        this.myteamAssessmentDetailView.model = this.c_assessment_myteam.get(ai_id);
        this.myteamAssessmentDetailView.render(people_id, lx, pi, ol);
        $("body").pagecontainer("change", "#myteam_assessment_detail", {
          reverse: false,
          changeHash: false,
        });
      },
      contact_list: function() { //企业通讯录，列表
        $("body").pagecontainer("change", "#contact_list", {
          reverse: false,
          changeHash: false,
        });

      },
      contact_detail: function(people_id) { //企业通讯录，单人详情
        this.contactDetaillView.model = this.c_people.get(people_id);
        this.contactDetaillView.render();
        $("body").pagecontainer("change", "#contact_detail", {
          reverse: false,
          changeHash: false,
        });

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

      },
      myteam_detail: function(people_id, tab) { //我的团队，详情界面
        var self = this;
        if (tab == 'basic') {
          //获取工资
          $.mobile.loading("show");
          this.c_payroll_myteam.url = '/admin/py/payroll_people/get_payroll_instances?people=' + people_id;
          var local_data = JSON.parse(LZString.decompressFromUTF16(localStorage.getItem('payroll_' + people_id)) || null)
          if (local_data) {
            self.c_payroll_myteam.reset(local_data);
            self.c_payroll_myteam.trigger('sync');
            $.mobile.loading("hide");
            self.myteamDetailView.model = self.c_people.get(people_id);
            self.myteamDetailView.render(self.c_payroll_myteam, self.c_competency.get(people_id));
          } else {
            self.c_payroll_myteam.fetch().done(function() {
              localStorage.setItem('payroll_' + people_id, LZString.compressToUTF16(JSON.stringify(self.c_payroll_myteam)));
              $.mobile.loading("hide");
              self.myteamDetailView.model = self.c_people.get(people_id);
              self.myteamDetailView.render(self.c_payroll_myteam, self.c_competency.get(people_id));
            })
          };

          $("body").pagecontainer("change", "#myteam_detail-basic", {
            reverse: false,
            changeHash: false,
          });

        } else if (tab == 'calendar') {
          // console.log('message in: myteam_detail::calendar');
          //重新指定route
          var $cal = $("#jqm_cal_myteam");
          $cal.data('jqmCalendar').settings.route = '#myteam_detail/' + people_id + '/calendar';

          //获取日历数据
          $.mobile.loading("show");
          this.c_task_myteam.url = '/admin/pm/work_plan/bb4m?people=' + people_id;
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
        } else if (tab == 'assessment') { //下属的绩效
          //获取绩效数据
          $.mobile.loading("show");
          this.c_assessment_myteam.url = '/admin/pm/assessment_instance/get_my_assessments_4m?people=' + people_id;
          var local_data = JSON.parse(LZString.decompressFromUTF16(localStorage.getItem('assessment_' + people_id)) || null)
          if (local_data) {
            self.c_assessment_myteam.reset(local_data);
            // self.c_assessment_myteam.trigger('sync');
            $.mobile.loading("hide");
            self.myTeamAssessmentView.render(people_id, self.c_people.get(people_id).get('people_name'));
          } else {
            self.c_assessment_myteam.fetch().done(function() {
              localStorage.setItem('assessment_' + people_id, LZString.compressToUTF16(JSON.stringify(self.c_assessment_myteam)));
              $.mobile.loading("hide");
              self.myTeamAssessmentView.render(people_id, self.c_people.get(people_id).get('people_name'));
            })
          };
          $("body").pagecontainer("change", "#myteam_detail-assessment", {
            reverse: false,
            changeHash: false,
          });
        } else if (tab == 'talent') {
          // console.log('message: in talent tab');

          self.myteamTalentView.model = self.c_talent.get(people_id);
          self.myteamTalentView.render(self.c_people.get(people_id).get('people_name'));
          $("body").pagecontainer("change", "#myteam_detail-talent", {
            reverse: false,
            changeHash: false,
          });

        };

      },
      myteam_detail_calendar: function(people_id, task_id) { //我的团队，日历操作功能
        var self = this;
        if (task_id == 'refresh') { //刷新数据
          $.mobile.loading("show");
          self.c_task_myteam.url = '/admin/pm/work_plan/bb4m?people=' + people_id;
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
          if (self.myteamTaskDetailView.model.get('creator') == $("#login_people").val()) {
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
      // ------工资相关------ //
      salary_list: function() {
        $("body").pagecontainer("change", "#salary_list", {
          reverse: false,
          changeHash: false,
        });

      },
      salary_detail: function(pay_time) {
        this.payrollDetailView.model = this.c_payroll.get(pay_time);
        this.payrollDetailView.render();
        $("#btn-salary_detail-back").attr('href', '#salary_list');
        $("body").pagecontainer("change", "#salary_detail", {
          reverse: false,
          changeHash: false,
        });
      },
      myteam_salary_detail: function(people_id, pay_time) {
        this.payrollDetailView.model = this.c_payroll_myteam.get(pay_time);
        this.payrollDetailView.render();
        $("#btn-salary_detail-back").attr('href', '#myteam_detail/' + people_id + '/basic');
        $("body").pagecontainer("change", "#salary_detail", {
          reverse: false,
          changeHash: false,
        });
      },
      // ------个人相关------ //
      myprofile: function() {
        var login_people = $("#login_people").val();
        this.myProfileView.model = this.c_people.get(login_people);
        this.myProfileView.render(this.c_competency.get(login_people), this.c_talent.get(login_people));
        // $.mobile.changePage("#myprofile_basic", {
        //   reverse: false,
        //   changeHash: false,
        // });
        $("body").pagecontainer("change", "#myprofile_basic", {
          reverse: false,
          changeHash: false,
        });
      },
      competency_scores: function(cid) {
        var login_people = $("#login_people").val();
        this.competencyScoresView.model = this.c_competency.get(login_people);
        this.competencyScoresView.render('self', cid);
        // $.mobile.changePage("#competency_scores", {
        //   reverse: false,
        //   changeHash: false,
        // });
        $("body").pagecontainer("change", "#competency_scores", {
          reverse: false,
          changeHash: false,
        });
      },
      myteam_competency_scores: function(people_id, cid) {
        this.competencyScoresView.model = this.c_competency.get(people_id);
        this.competencyScoresView.render(people_id, cid);
        $("body").pagecontainer("change", "#competency_scores", {
          reverse: false,
          changeHash: false,
        });
      },
      competency_spider_chart: function(people_id, qi_id) { //测评问卷的蜘蛛网图
        // console.log(people_id, qi_id);
        var self = this;
        //获取蜘蛛网图数据
        $.mobile.loading("show");
        self.m_Q360.set('_id', qi_id);
        var local_data = JSON.parse(LZString.decompressFromUTF16(localStorage.getItem('q360_' + qi_id)) || null)
        if (local_data) {
          self.m_Q360.set(local_data);
          // self.m_Q360.trigger('sync');
          $.mobile.loading("hide");
          self.competencySpiderChartView.model = self.m_Q360;
          self.competencySpiderChartView.render(people_id, qi_id);
        } else {
          self.m_Q360.fetch().done(function() {
            localStorage.setItem('q360_' + qi_id, LZString.compressToUTF16(JSON.stringify(self.m_Q360)));
            $.mobile.loading("hide");
            self.competencySpiderChartView.model = self.m_Q360;
            self.competencySpiderChartView.render(people_id, qi_id);
          })
        };
        $("body").pagecontainer("change", "#competency_spider_chart", {
          reverse: false,
          changeHash: false,
        });

      },
      talent9grides: function(people_id, ai_score, score) {
        var self = this;
        var horoscope = self.c_horoscope.models[0];
        self.talent9GridsChartView.render(horoscope.toJSON(), ai_score, score, people_id);
        // console.log(horoscope, ai_score, score);
        $("body").pagecontainer("change", "#talent_9_grids_chart", {
          reverse: false,
          changeHash: false,
        });
      },
      //-----------------init---------------------//
      get_local_storage_size: function() {
        var ls_size = 0;
        for (var i = 0; i < localStorage.length; i++) {
          ls_size += localStorage.getItem(localStorage.key(i)).length;
        };
        var msg = ''
        if (ls_size < 100) {
          msg = ls_size + ' B';
        } else if (ls_size >= 100 && ls_size <= 1024 * 1024) {
          msg = Math.round(ls_size / 1024 * 10) / 10 + ' KB';
        } else {
          msg = Math.round(ls_size / 1024 / 1024 * 10) / 10 + ' MB';
        };
        $("#more_functions_msg").html(msg).popup('open', {
          transition: 'slidedown'
        });
      },
      refresh_local_storage: function() {
        var self = this;
        if (navigator.onLine) {


          var login_people = $("#login_people").val();
          //刷新登录用户
          var login_peoples = JSON.parse(LZString.decompressFromUTF16(localStorage.getItem('login_people')) || null) || [];
          var found = _.find(login_peoples, function(x) {
            return x._id == $("#login_people").val();
          })
          if (!found) {
            login_peoples.push({
              _id: $("#login_people").val()
            });
          }
          localStorage.setItem('login_people', LZString.compressToUTF16(JSON.stringify(login_peoples)));
          $.mobile.loading("show");
          async.parallel({
            objective: function(cb) {
              // 刷新目标计划数据
              self.c_objectives.fetch().done(function() {
                localStorage.setItem('objectives_' + login_people, LZString.compressToUTF16(JSON.stringify(self.c_objectives)))
                cb(null, 'OK');
              });
            },
            assessment: function(cb) {
              // 刷新考核数据
              self.c_assessment.fetch().done(function() {
                localStorage.setItem('assessment_' + login_people, LZString.compressToUTF16(JSON.stringify(self.c_assessment)))
                cb(null, 'OK');
              })
            },
            task: function(cb) {
              // 刷新日历数据
              self.c_task.fetch().done(function() {
                localStorage.setItem('task_' + login_people, LZString.compressToUTF16(JSON.stringify(self.c_task)))
                cb(null, 'OK');
              })
            },
            people: function(cb) {
              // 刷新通讯录数据
              self.c_people.fetch().done(function() {
                localStorage.setItem('people_' + login_people, LZString.compressToUTF16(JSON.stringify(self.c_people)))
                cb(null, 'OK');
              })
            },
            talent: function(cb) {
              // 刷新通讯录数据
              self.c_talent.fetch().done(function() {
                localStorage.setItem('talent_' + login_people, LZString.compressToUTF16(JSON.stringify(self.c_talent)))
                cb(null, 'OK');
              })
            },
            horoscope: function(cb) {
              // 刷新通讯录数据
              self.c_horoscope.fetch().done(function() {
                localStorage.setItem('horoscope_' + login_people, LZString.compressToUTF16(JSON.stringify(self.c_horoscope)))
                cb(null, 'OK');
              })
            },
            competency: function(cb) {
              // 刷新通讯录数据
              self.c_competency.fetch().done(function() {
                localStorage.setItem('competency_' + login_people, LZString.compressToUTF16(JSON.stringify(self.c_competency)))
                cb(null, 'OK');
              })
            },
            payroll: function(cb) {
              // 刷新通讯录数据
              self.c_payroll.fetch().done(function() {
                localStorage.setItem('payroll_' + login_people, LZString.compressToUTF16(JSON.stringify(self.c_payroll)))
                cb(null, 'OK');
              })
            }

          }, function(err, result) {
            // console.log(result);
            localStorage.setItem('last_sync', (new Date()).getTime());
            $.mobile.loading("hide");
            alert('同步完成');
          })
        } else {
          alert('当前处于断网状态，不能同步数据。');
        };
      },
      config_refresh_interval: function() { //设置自动刷新的时间间隔

        $("body").pagecontainer("change", "#config_refresh_interval", {
          reverse: false,
          changeHash: false,
        });
        $("input[type=radio][name=config_refresh_interval_option]").prop('checked', false).checkboxradio('refresh');
        $("input[type=radio][name=config_refresh_interval_option][value=" + parseInt(localStorage.getItem('refresh_interval') || 0) + "]").prop('checked', true).checkboxradio('refresh');
      },
      clear_local_storage: function() {
        if (confirm('此操作将清空所有本地缓存数据，为了提高访问速度，建议保留缓存数据。\n如需要刷新缓存数据，请使用“同步数据”功能。')) {
          var ldv = parseFloat(localStorage.getItem('data_version')) || 0;
          var ri = parseInt(localStorage.getItem('refresh_interval') || 0);
          localStorage.clear();
          localStorage.setItem('data_version', ldv);
          localStorage.setItem('refresh_interval', ri);
          alert('缓存清空完成')
        };
      },

      init_data: function() { //初始化的时候，先从local storage里面恢复数据，如果localstorage里面没有，则去服务器fetch
        var self = this;
        self.load_data(self.c_people, 'people');
        self.load_data(self.c_objectives, 'objectives');
        self.load_data(self.c_assessment, 'assessment');
        self.load_data(self.c_task, 'task');
        self.load_data(self.c_talent, 'talent');
        self.load_data(self.c_horoscope, 'horoscope');
        self.load_data(self.c_competency, 'competency');
        self.load_data(self.c_payroll, 'payroll');

      },
      load_data: function(col_obj, col_name) { //加载数据
        $.mobile.loading("show");
        var login_people = $("#login_people").val();
        var cn = col_name + '_' + login_people
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
      init_views: function(self) {
        this.homeObjectiveView = new HomeObjectiveView({
          el: "#home-objective-list",
          collection: self.c_objectives
        });
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
        this.homeTaskView = new HomeTaskView({
          el: "#home-task-list",
          collection: self.c_task
        });
        this.homeMyTeamView = new HomeMyTeamView({
          el: "#home-myteam-list",
          collection: self.c_people
        });

        this.taskView = new TaskView({
          el: "#task",
          collection: self.c_task
        });

        this.taskEditView = new TaskEditView({
          el: "#task_edit",
        });

        this.taskDetailView = new TaskDetailView({
          el: "#task_detail",
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

        this.contactListlView = new ContactListView({
          el: "#contact_list-content",
          collection: self.c_people
        })
        this.contactDetaillView = new ContactDetailView({
          el: "#contact_detail-content"
        })
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
        this.payrollListView = new PayrollListView({
          el: "#salary_list-content",
          collection: self.c_payroll
        })
        this.payrollDetailView = new PayrollDetailView({
          el: "#salary_detail-content",
        })
        this.myProfileView = new MyProfileView({
          el: "#myprofile_basic-content",
        })
        this.competencyScoresView = new CompetencyScoresView({
          el: "#competency_scores-content",
        })
        this.competencySpiderChartView = new CompetencySpiderChartView({
          el: "#competency_spider_chart-content",
        })
        this.talent9GridsChartView = new Talent9GridsChartView({
          el: "#talent_9_grids_chart_container",
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
        this.myteamAllListView = new MyTeamAllListView({
          el: "#myteam_all_list-content",
          collection: self.c_people
        })
        this.taskForwardView = new TaskForwardView({
          el: "#task_forward-content",
        })
        this.taskForwardSelectPeoplePanelView = new TaskForwardSelectPeoplePanelView({
          el: "#panel-fwd-people",
          collection: self.c_people
        })

      },
      init_cols: function() {
        this.c_objectives = new ObjectiveCollection(); //目标计划
        this.c_assessment = new AssessmentCollection(); //考核计划
        this.c_assessment_v = new AssessmentVCollection(); //考核计划-版本
        this.c_assessment_myteam = new AssessmentCollection(); //团队成员的考核计划－获取的时候需要修改url，把下属的people id拼进去再fetch。
        this.c_assessment_v_myteam = new AssessmentVCollection(); //团队成员的考核计划－获取的时候需要修改url，把下属的people id拼进去再fetch。 －版本
        this.c_task = new TaskCollection(); //工作任务
        this.c_task_myteam = new TaskCollection(); //团队成员的工作任务－获取的时候需要修改url，把下属的people id拼进去再fetch。
        this.c_people = new PeopleCollection(); //人员
        this.c_talent = new TalentCollection(); //人才
        this.c_horoscope = new HoroscopeCollection(); //人才九宫图配置
        this.c_competency = new CompetencyCollection(); //能力素质
        this.c_payroll = new PayrollCollection(); //工资
        this.c_payroll_myteam = new PayrollCollection(); //团队成员的工资－获取的时候需要修改url，把下属的people id拼进去再fetch。
      },
      init_models: function() {
        this.m_Q360 = new Q360Model(); //360问卷的数据
      },
      start_auto_fetch: function(interval) { //启动定时坚持并刷新数据的计时器
        var self = this;
        if (interval) {
          self.interval_id = setInterval(function() {
            if (navigator.onLine) { //只有浏览器在线的情况下才执行获取数据的动作。
              //绩效数据 －－ 检查localstorage里面的内容。
              var assessments = [];
              for (i = 0; i < localStorage.length; i++) {
                if (localStorage.key(i).split('_')[0] == 'assessment') {
                  assessments.push(localStorage.key(i).split('_'))
                }
              }
              var tmp_assessment_col = new AssessmentCollection();
              async.times(assessments.length, function(n, next) {
                self.c_assessment_v.url = '/admin/pm/assessment_instance/get_my_assessments_v_4m?people=' + assessments[n][1];
                async.waterfall([

                  function(cb) {
                    self.c_assessment_v.fetch().done(function() { //获取版本
                      cb(null, self.c_assessment_v);
                    })
                  },
                  function(c, cb) { //取得本地数据版本，并与之前获取的版本进行比对
                    var cn = assessments[n].join('_'); //本地localStorage使用的key
                    var local_data = JSON.parse(LZString.decompressFromUTF16(localStorage.getItem(cn)) || null)
                    var change_flag = false;
                    for (var i = 0; i < local_data.length; i++) {
                      change_flag = !(local_data[i].lastModified == c.get(local_data[i]._id).get('lastModified'));
                      if (change_flag) {
                        break;
                      };
                    };
                    if (change_flag) { //发现有变化，重新fetch
                      tmp_assessment_col.url = '/admin/pm/assessment_instance/get_my_assessments_4m?people=' + assessments[n][1];
                      tmp_assessment_col.fetch().done(function() {
                        localStorage.setItem(cn, LZString.compressToUTF16(JSON.stringify(tmp_assessment_col)));
                        // $.mobile.loading("hide");
                        if (assessments[n][1] == $("#login_people").val()) { //如果是本人的，重新load一下data，以便通知各个view更新界面
                          self.load_data(self.c_assessment, 'assessment');
                        };
                        cb(null, 'fetch new version ok');
                      })
                    } else {
                      cb(null, 'no new version.')
                    };
                    // cb(null, 'fetch ok->' + assessments[n][1]);
                  }
                ], next);
              }, function(err, result) {
                console.log(result);
              })
            };
          }, interval); //10 seconds for test
        };
      },
      bind_events: function() {
        var self = this;
        // 设定自动同步数据的间隔，并重新启动计时器
        $("#config_refresh_interval").on('change', 'input[type=radio][name=config_refresh_interval_option]', function(event) {
          var $this = $(this);
          localStorage.setItem('refresh_interval', $this.val());
          clearInterval(self.interval_id);
          if ($this.val() != '0') { //重新启动计时器
            // console.log('timer stoped');
            self.start_auto_fetch(parseInt($this.val()) * 60 * 1000);
          }
        });
      }
    });
    //注册全局的帮助函数
    (function() {
      // Give the points a 3D feel by adding a radial gradient
      Highcharts.getOptions().colors = $.map(Highcharts.getOptions().colors, function(color) {
        return {
          radialGradient: {
            cx: 0.4,
            cy: 0.3,
            r: 0.5
          },
          stops: [
            [0, color],
            [1, Highcharts.Color(color).brighten(-0.2).get('rgb')]
          ]
        };
      });
      //注册handlebars的helper
      Handlebars.registerHelper('sprintf', function(sf, data) {
        return sprintf(sf, data);
      });
      Handlebars.registerHelper('inout', function(s, c) {
        return (s == c) ? 'in' : 'out';
      });
      Handlebars.registerHelper('eq', function(data1, data2, options) {
        if (data1 == data2) {
          return options.fn(this);
        } else {
          return options.inverse(this);
        };
      });
      Handlebars.registerHelper('plus1', function(data) {
        return parseInt(data) + 1;
      });
      Handlebars.registerHelper('cr2br', function(data) {
        return (data) ? data.replace(/\n/g, '<br>') : '';
      });
      Handlebars.registerHelper('fromNow', function(data, flag) {
        return moment(data).fromNow( !! flag);
      });
      Handlebars.registerHelper('fromStart2End', function(start, end, flag) {
        if (moment(end).format('YYYY-MM-DD') == '9999-12-31') {
          return moment(start).fromNow( !! flag);
        } else {
          return moment(start).from(moment(end), !! flag);
        };
      });
      Handlebars.registerHelper('Avatar', function(data) {
        return (data) ? '/gridfs/get/' + data : '/img/no-avatar.jpg';
      });
      Handlebars.registerHelper('toISOMD', function(date) {
        return (date) ? moment(date).format('MM/DD') : '';
      });
      Handlebars.registerHelper('toISODate', function(date) {
        return (date) ? moment(date).format('YYYY-MM-DD') : '';
      });
      Handlebars.registerHelper('toISOTime', function(date) {
        return (date) ? moment(date).format('HH:mm') : '';
      });
      Handlebars.registerHelper('toISODatetime', function(date) {
        return (date) ? moment(date).format('YYYY-MM-DD HH:mm') : '';
      });
      Handlebars.registerHelper('rateStar', function(data) {
        var ret = '';
        for (var i = 0; i < data; i++) {
          ret += '&#9733;';
        };
        for (var i = data; i < 5; i++) {
          ret += '&#9734;';
        };
        return ret;
      });
      Handlebars.registerHelper('toISODateRange', function(allday, start, end) {
        var s = moment(start);
        var e = moment(end);
        if (allday) {
          if (s.format('YYYY-MM-DD') == e.format('YYYY-MM-DD')) {
            return s.format('YYYY-MM-DD');
          } else if (s.format('YYYY') == e.format('YYYY')) {
            return s.format('YYYY-MM-DD') + '&rarr;' + e.format('MM-DD');
          } else {
            return s.format('YYYY-MM-DD') + '&rarr;' + e.format('YYYY-MM-DD');
          };
        } else {
          if (s.format('YYYY-MM-DD') == e.format('YYYY-MM-DD')) {
            return s.format('YYYY-MM-DD HH:mm') + '&rarr;' + e.format('HH:mm');
          } else if (s.format('YYYY') == e.format('YYYY')) {
            return s.format('YYYY-MM-DD HH:mm') + '&rarr;' + e.format('MM-DD HH:mm');
          } else {
            return s.format('YYYY-MM-DD HH:mm') + '&rarr;' + e.format('YYYY-MM-DD HH:mm');
          };
        };

      });
      Handlebars.registerHelper('toISODateRange2', function(start, end) {
        var s = moment(start);
        var e = moment(end);
        if (e.format('YYYY-MM-DD') == '9999-12-31') {
          return s.format('YYYY-MM-DD') + '&rarr;至今';
        } else {
          return s.format('YYYY-MM-DD') + '&rarr;' + e.format('YYYY-MM-DD');
        };

      });
      Handlebars.registerHelper('nowInRange', function(start, end, options) {
        var now = moment();
        var s = moment(start);
        var e = moment(end);
        if (now >= s && now <= e) {
          return options.fn(this);
        } else {
          return options.inverse(this);
        };
      });
    })();

    // Returns the Router class
    return MainRouter;

  });