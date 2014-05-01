// Mobile Router
// =============

// Includes file dependencies
define(["jquery", "backbone", "handlebars", "lzstring",
    //首页
    "../views/HomeObjectiveView", "../collections/ObjectiveCollection",
    "../views/HomeAssessmentView", "../views/HomeAssessmentHistoryView", "../views/HomeAssessmentPIListView", "../collections/AssessmentCollection",
    "../views/HomeTaskView", "../views/HomeMyTeamView",
    //工作日历相关
    "../models/TaskModel", "../collections/TaskCollection", "../views/TaskView", "../views/TaskDetailView", "../views/TaskEditView",
    //人员和组织相关
    "../models/PeopleModel", "../collections/PeopleCollection", "../views/ContactListView", "../views/ContactDetailView",
    //我的团队相关
    "../views/MyTeamListView", "../views/MyTeamDetailView", "../views/MyTeamTaskView", "../views/MyTeamTaskDetailView", "../views/MyTeamTaskEditView",
    //绩效考核合同相关
    "../views/AssessmentDetailView", "../views/MyTeamAssessmentView",
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
    HomeAssessmentView, HomeAssessmentHistoryView, HomeAssessmentPIListView, AssessmentCollection,
    HomeTaskView, HomeMyTeamView,
    TaskModel, TaskCollection, TaskView, TaskDetailView, TaskEditView,
    PeopleModel, PeopleCollection, ContactListView, ContactDetailView,
    MyTeamListView, MyTeamDetailView, MyTeamTaskView, MyTeamTaskDetailView, MyTeamTaskEditView,
    AssessmentDetailView, MyTeamAssessmentView,
    TalentCollection, MyTeamTalentView, HoroscopeCollection, Talent9GridsChartView,
    CompetencyCollection, CompetencyScoresView, CompetencySpiderChartView, Q360Model,
    PayrollCollection, PayrollListView, PayrollDetailView,
    MyProfileView,
    async

  ) {
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
        // When #category? is on the url, the category method is called
        //任务日历相关的routes
        "task": "task",
        "task/refresh": "task_refresh",
        "task/cm": "task_cm",
        "task/cd": "task_cd",
        "task/:task_id": "task_detail",
        "task_edit/:task_id": "task_edit",
        //人员相关
        "contact_list": "contact_list",
        "contact_detail/:people_id": "contact_detail",
        //我的团队相关
        "myteam": "myteam_list",
        "myteam_detail/:people_id/:tab": "myteam_detail",
        "myteam_detail/:people_id/calendar/:task_id": "myteam_detail_calendar",
        "myteam_detail/:people_id/calendar/:task_id/edit": "myteam_detail_calendar_edit",
        "myteam_competency_scores/:people_id/:cid": "myteam_competency_scores",
        "myteam_salary_detail/:people_id/:pay_time": "myteam_salary_detail",
        "myteam_assessment_pi_list/:ai_id": "myteam_assessment_pi_list",
        "myteam_assessment_detail/:ai_id/:lx/:pi/:ol": "myteam_assessment_detail",

        // 更多功能的导航页面
        "more_functions": "more_functions",
        "more_functions/refresh_local_storage": "refresh_local_storage",
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

        $.mobile.changePage("#home", {
          reverse: false,
          changeHash: false,
          // transition: "flip",
        });
      },
      goto: function(pagename) {
        $("body").pagecontainer("change", "#" + pagename, {
          reverse: false,
          changeHash: false,
        });
      },
      more_functions: function() {
        $.mobile.changePage("#more_functions", {
          reverse: false,
          changeHash: false,
          // transition: "flip",
        });
      },
      task: function() { //任务日历
        $.mobile.changePage("#task", {
          reverse: false,
          changeHash: false,
          // transition: "flip",
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
        $.mobile.changePage("#task_detail", {
          reverse: false,
          changeHash: false,
          transition: "slide",
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

        $.mobile.changePage("#task_edit", {
          reverse: false,
          changeHash: false,
          transition: "slide",
        });
        //把 a 换成 span， 避免点那个滑块的时候页面跳走。
        $(".ui-flipswitch a").each(function() {
          $(this).replaceWith("<span class='" + $(this).attr('class') + "'></span>");
        });
      },
      assessment_pi_list: function(ai_id) {
        this.homeAssessmentPIListView.model = this.c_assessment.get(ai_id);
        this.homeAssessmentPIListView.render();
        $.mobile.changePage("#assessment_pi-list", {
          reverse: false,
          changeHash: false,
        });
      },
      assessment_detail: function(ai_id, lx, pi, ol) { //绩效合同－单条指标的查看界面
        this.assessmentDetailView.model = this.c_assessment.get(ai_id);
        this.assessmentDetailView.render(lx, pi, ol);
        $.mobile.changePage("#assessment_detail", {
          reverse: false,
          changeHash: false,
          transition: "slide",
        });

      },

      contact_list: function() { //企业通讯录，列表
        $.mobile.changePage("#contact_list", {
          reverse: false,
          changeHash: false,
          // transition: "slide",
        });
      },
      contact_detail: function(people_id) { //企业通讯录，单人详情
        this.contactDetaillView.model = this.c_people.get(people_id);
        this.contactDetaillView.render();
        $.mobile.changePage("#contact_detail", {
          reverse: false,
          changeHash: false,
          // transition: "slide",
        });
      },
      myteam_list: function() { //我的团队，列表界面
        $.mobile.changePage("#myteam_list", {
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


          $.mobile.changePage("#myteam_detail-basic", {
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

          $.mobile.changePage("#myteam_detail-task", {
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
          $.mobile.changePage("#myteam_task_edit", {
            reverse: false,
            changeHash: false,
            transition: "slide",
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
          $.mobile.changePage("#myteam_task_detail", {
            reverse: false,
            changeHash: false,
            transition: "slide",
          });
        };
      },
      myteam_detail_calendar_edit: function(people_id, task_id) {
        var self = this;
        self.myteamTaskEditView.model = self.c_task_myteam.get(task_id);
        self.myteamTaskEditView.render();
        $.mobile.changePage("#myteam_task_edit", {
          reverse: false,
          changeHash: false,
          transition: "slide",
        });
        //把 a 换成 span， 避免点那个滑块的时候页面跳走。
        $(".ui-flipswitch a").each(function() {
          $(this).replaceWith("<span class='" + $(this).attr('class') + "'></span>");
        });
      },
      // ------工资相关------ //
      salary_list: function() {

        $.mobile.changePage("#salary_list", {
          reverse: false,
          changeHash: false,
          transition: "slide",
        });
      },
      salary_detail: function(pay_time) {
        this.payrollDetailView.model = this.c_payroll.get(pay_time);
        this.payrollDetailView.render();
        $("#btn-salary_detail-back").attr('href', '#salary_list');
        $.mobile.changePage("#salary_detail", {
          reverse: false,
          changeHash: false,
        });
      },
      myteam_salary_detail: function(people_id, pay_time) {
        this.payrollDetailView.model = this.c_payroll_myteam.get(pay_time);
        this.payrollDetailView.render();
        $("#btn-salary_detail-back").attr('href', '#myteam_detail/' + people_id + '/basic');
        $.mobile.changePage("#salary_detail", {
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
        console.log(people_id, qi_id);
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

        $.mobile.changePage("#competency_spider_chart", {
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
          console.log(result);
          $.mobile.loading("hide");
          alert('同步完成');
        })
      },
      clear_local_storage: function() {
        if (confirm('此操作将清空所有本地缓存数据，为了提高访问速度，建议保留缓存数据。\n如需要刷新缓存数据，请使用“同步数据”功能。')) {
          var ldv = parseFloat(localStorage.getItem('data_version')) || 0;
          localStorage.clear();
          localStorage.setItem('data_version', ldv);
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
          el: "#assessment_detail"
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

      },
      init_cols: function() {
        this.c_objectives = new ObjectiveCollection(); //目标计划
        this.c_assessment = new AssessmentCollection(); //考核计划
        this.c_assessment_myteam = new AssessmentCollection(); //团队成员的考核计划－获取的时候需要修改url，把下属的people id拼进去再fetch。
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
      }
    });

    // Returns the Router class
    return MainRouter;

  });