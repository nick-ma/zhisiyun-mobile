// Mobile Router
// =============

// Includes file dependencies
define(["jquery", "backbone", "handlebars", "lzstring",
    //首页
    "../views/HomeObjectiveView", "../collections/ObjectiveCollection",
    // "../views/HomeAssessmentView", "../views/HomeAssessmentHistoryView", "../views/HomeAssessmentPIListView", "../collections/AssessmentCollection", "../views/AssessmentCommentView", "../views/AssessmentUpdateValueView", "../views/AssessmentImprovePlanView", "../views/AssessmentImprovePlanEditView", "../collections/AssessmentVCollection",
    "../views/HomeTaskView", "../views/HomeMyTeamView", "../collections/TaskVCollection",
    //工作日历相关
    "../models/TaskModel", "../collections/TaskCollection", "../views/TaskView", "../views/TaskDetailView", "../views/TaskEditView", "../views/TaskForwardView", "../views/TaskForwardSelectPeoplePanelView",
    //人员和组织相关
    "../models/PeopleModel", "../collections/PeopleCollection", "../views/ContactListView", "../views/ContactDetailView",
    // 人才盘点相关
    "../collections/TalentCollection", "../views/MyTeamTalentView", "../collections/HoroscopeCollection", "../views/Talent9GridsChartView", "../models/TalentModel",
    // 能力素质相关
    "../collections/CompetencyCollection", "../views/CompetencyScoresView", "../views/CompetencySpiderChartView", "../models/Q360Model", "../models/CompetencyModel",
    // 工资相关
    "../collections/PayrollCollection", "../views/PayrollListView", "../views/PayrollDetailView",
    // 个人档案
    "../views/profile/Detail", "../views/profile/Edit",
    // 计分公式和等级组
    "../collections/ScoringFormulaCollection", "../collections/GradeGroupCollection",
    // 人员选择界面
    "../views/PeopleSelectView",
    // 指标选择界面
    // "../views/PISelectView",
    // 上传图片界面
    "../views/UploadPicView",
    // 添加交流记录界面
    "../views/CommentAddView",
    "../views/CompetencyDetailView",

    "../collections/CompetencyDetalCollection",
    "./colltaskRouter",
    "./collprojectRouter",
    "./assessmentRouter",
    "./myteamRouter",
    "./skillrecommendRouter",
    "./todoRouter",
    "./quesetionnaireRouter",
    "./workreportRouter",
    "./tmattendanceRouter",
    "./absence",
    "./talentRouter",
    "./imRouter",
    //其他jquery插件
    "async", "moment", "sprintf", "highcharts",

  ],
  function($, Backbone, Handlebars, LZString,
    HomeObjectiveView, ObjectiveCollection,
    HomeTaskView, HomeMyTeamView, TaskVCollection,
    TaskModel, TaskCollection, TaskView, TaskDetailView, TaskEditView, TaskForwardView, TaskForwardSelectPeoplePanelView,
    PeopleModel, PeopleCollection, ContactListView, ContactDetailView,
    TalentCollection, MyTeamTalentView, HoroscopeCollection, Talent9GridsChartView, TalentModel,
    CompetencyCollection, CompetencyScoresView, CompetencySpiderChartView, Q360Model, CompetencyModel,
    PayrollCollection, PayrollListView, PayrollDetailView,
    MyProfileDetailView, MyProfileEditView,
    ScoringFormulaCollection, GradeGroupCollection,
    PeopleSelectView,
    // PISelectView,
    UploadPicView,
    CommentAddView,
    CompetencyDetailView,
    CompetencyDetalCollection,
    CollTaskRouter,
    CollProjectRouter,
    AssessmentRouter,
    MyTeamRouter,
    SkillRecommendRouter,
    ToDoRouter,
    QuesetionnaireRouter,
    WorkReportRouter,
    TmAttendanceRouter,
    Absence,
    TalentRouter,
    ImRouter,
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
        // this.start_auto_fetch(parseInt(localStorage.getItem('refresh_interval') || 0) * 60 * 1000);
        this.bind_events();
        // _.extend(this,CollTaskRouter);
        new CollTaskRouter();
        new CollProjectRouter();
        new AssessmentRouter();
        new MyTeamRouter();
        new SkillRecommendRouter();
        new ToDoRouter();
        new QuesetionnaireRouter();
        new WorkReportRouter();
        new TmAttendanceRouter();
        new Absence();
        new TalentRouter();
        new ImRouter()
        // Tells Backbone to start watching for hashchange events
        Backbone.history.start();
      },

      // Backbone.js Routes
      routes: {

        //首页
        "": "loading",
        "home": "home",
        // 返回上一个
        "goto/:pagename": "goto",
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
        "myprofile_edit_01": "myprofile_edit_01",
        "myprofile_edit_02": "myprofile_edit_02",
        "myprofile_edit_03": "myprofile_edit_03",
        "myprofile_edit_04": "myprofile_edit_04",
        // 能力测评明细
        "competency_scores/:cid": "competency_scores",
        "competency_spider_chart/:people_id/:qi_id": "competency_spider_chart",
        "competency_scores_datail/:people_id/:ct_id": "competency_scores_datail",
        //人才九宫图
        "talent9grides/:people_id/:ai_score/:score": "talent9grides",

        // 人员选择界面
        "people_select/:mode/:target_field": "people_select",
        // 指标选择界面
        // "pi_select/:mode/:target_field": "pi_select",

        // 上传文件
        "upload_pic": "upload_pic",
        // 添加交流记录
        "comment_add": "comment_add",
        //lazy load sub routers
        // "colltask/*subroute":"invokeCollTask",
        //默认的路由。当找不到路由的时候，转到首页。
        "*path": "home",
      },
      loading: function() {
        $("body").pagecontainer("change", "#loading", {
          reverse: false,
          changeHash: false,
        });
      },
      // Home method
      home: function() { //首页
        $("body").pagecontainer("change", "#home", {
          reverse: false,
          changeHash: false,
        });
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
        var self = this;
        self.taskView.render(); //先用当前的数据做一次render
        window.setTimeout(function() { //1秒后再刷一次
          $.mobile.loading("show");
          self.c_task.fetch().done(function() {
            var login_people = $("#login_people").val();
            localStorage.setItem('task', LZString.compressToUTF16(JSON.stringify(self.c_task)))
            self.taskView.render();
            $.mobile.loading("hide");
          })
        }, 1000);
      },
      task_refresh: function() { //刷新任务数据
        $.mobile.loading("show");
        var self = this;
        self.c_task.fetch().done(function() {
          var login_people = $("#login_people").val();
          localStorage.setItem('task', LZString.compressToUTF16(JSON.stringify(self.c_task)))
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
        var self = this;
        $("body").pagecontainer("change", "#task_detail", {
          reverse: false,
          changeHash: false,
        });
        localStorage.setItem('colltask_detail_back_url', window.location.href);

        $.mobile.loading("show");
        if (self.c_task.get(task_id)) {
          self.taskDetailView.model = self.c_task.get(task_id);
          self.taskDetailView.model.fetch().done(function() {
            self.taskDetailView.render();
            $.mobile.loading("hide");
          })
        } else {
          var tmp = new TaskModel({
            _id: task_id
          });
          tmp.fetch().done(function() {

            self.c_task.set(tmp); //放到collection里面
            self.taskDetailView.model = tmp;
            self.taskDetailView.render();
            $.mobile.loading("hide");
          }).fail(function() { //针对手机app版
            // console.log('message fail');
            $.mobile.loading("hide");
            alert('日历项目已被删除')
            window.location.href = "#"
          })
        };

      },
      task_forward: function(task_id) { //转发任务
        var self = this;
        if (!self.taskForwardSelectPeoplePanelView.rendered) {
          self.taskForwardSelectPeoplePanelView.render();
        };
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
            'has_alarms': false,
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
      contact_list: function() { //企业通讯录，列表
        // set detail page's back url every time 
        localStorage.setItem('contact_detail_back_url', '#contact_list')
        // if (!this.contactListlView.rendered) {
        this.contactListlView.render();
        // };
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
      // ------工资相关------ //
      salary_list: function() {
        if (!this.payrollListView.rendered) {
          this.payrollListView.render();
        };
        $("body").pagecontainer("change", "#salary_list", {
          reverse: false,
          changeHash: false,
        });
      },
      salary_detail: function(pay_time) {
        this.payrollDetailView.model = this.c_payroll.get(pay_time);
        localStorage.setItem('payroll_detail_backurl', '#salary_list');
        // $("#btn-salary_detail-back").attr('href', '#salary_list');
        this.payrollDetailView.render();
        $("body").pagecontainer("change", "#salary_detail", {
          reverse: false,
          changeHash: false,
        });
      },
      // ------个人相关------ //
      myprofile: function() {
        var self = this,
          people_id = $("#login_people").val();
        $("body").pagecontainer("change", "#myprofile_basic", {
          reverse: false,
          changeHash: false,
        });
        $.mobile.loading("show");
        async.parallel({
          people: function(cb) {
            if (self.c_people.get(people_id)) {
              var tmp = self.c_people.get(people_id);
              tmp.fetch().done(function() {
                cb(null, tmp);
              })
            } else {
              var tmp = new PeopleModel({
                _id: people_id
              })
              self.c_people.set(tmp);
              tmp.fetch().done(function() {
                cb(null, tmp);
              })
            };

            // cb(null, self.c_people.get(people_id));
          },
          // payroll: function(cb) {
          //   self.c_payroll_myteam.url = '/admin/py/payroll_people/get_payroll_instances?people=' + people_id + '&ct=' + (new Date()).getTime();
          //   self.c_payroll_myteam.fetch().done(function() {
          //     cb(null, self.c_payroll_myteam);
          //   })
          // },
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
          },
          talent: function(cb) {
            // self.c_competency.get(people_id)
            if (self.c_talent.get(people_id)) {
              var tmp = self.c_talent.get(people_id);
              tmp.fetch().done(function() {
                cb(null, tmp);
              })
            } else {
              var tmp = new TalentModel({
                people_id: people_id
              })
              self.c_talent.set(tmp);
              tmp.fetch().done(function() {
                cb(null, tmp);
              })
            };
          }
        }, function(err, result) {
          self.myProfileDetailView.model = result.people;
          self.myProfileDetailView.competency = result.competency;
          self.myProfileDetailView.talent = result.talent;
          self.myProfileDetailView.render();
          $.mobile.loading("hide");
        })
        // this.myProfileDetailView.model = this.c_people.get(login_people);
        // this.myProfileDetailView.render(this.c_competency.get(login_people), this.c_talent.get(login_people));
      },
      myprofile_edit_01: function() { //编辑基本信息
        var self = this;
        $("body").pagecontainer("change", "#myprofile_edit_01", {
          reverse: false,
          changeHash: false,
        });
        self.myProfileEditView.model = self.myProfileDetailView.model;
        self.myProfileEditView.edit_mode = '01';
        self.myProfileEditView.render();
      },
      myprofile_edit_02: function() { //编辑头像
        var self = this;
        $("body").pagecontainer("change", "#myprofile_edit_02", {
          reverse: false,
          changeHash: false,
        });
        self.myProfileEditView.model = self.myProfileDetailView.model;
        self.myProfileEditView.edit_mode = '02';
        self.myProfileEditView.render();
      },
      myprofile_edit_03: function() { //修改密码
        var self = this;
        $("body").pagecontainer("change", "#myprofile_edit_03", {
          reverse: false,
          changeHash: false,
        });
        self.myProfileEditView.model = self.myProfileDetailView.model;
        self.myProfileEditView.edit_mode = '03';
        self.myProfileEditView.render();
      },
      myprofile_edit_04: function() { //编辑地址信息
        var self = this;
        $("body").pagecontainer("change", "#myprofile_edit_04", {
          reverse: false,
          changeHash: false,
        });
      },
      competency_scores: function(cid) {
        var login_people = $("#login_people").val();
        this.competencyScoresView.model = this.c_competency.get(login_people);
        this.competencyScoresView.render('self', cid);
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
      competency_scores_datail: function(people_id, ct_id) {
        var self = this;
        if (self.competencyDetal.length) {
          self.competencyDetailView.render();
          $("body").pagecontainer("change", "#competency_scores", {
            reverse: false,
            changeHash: false,
          });
        } else {
          self.competencyDetal.fetch().done(function() {
            self.competencyDetailView.ct_id = ct_id;
            self.competencyDetailView.people = people_id;
            self.competencyDetailView.render();
            $("body").pagecontainer("change", "#competency_scores", {
              reverse: false,
              changeHash: false,
            });
          })
        }
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

      //----------人员选择----------//
      people_select: function(mode, target_field) {
        this.peopleSelectView.target_field = target_field;
        this.peopleSelectView.select_mode = mode;
        this.peopleSelectView.render();
        $("body").pagecontainer("change", "#people_select", {
          reverse: false,
          changeHash: false,
        });
      },

      //----------上传图片----------//
      upload_pic: function() {
        this.uploadPicView.render();
        $("body").pagecontainer("change", "#upload_pic", {
          reverse: false,
          changeHash: false,
        });
      },
      //----------添加交流----------//
      comment_add: function() {
        this.commentAddView.render();
        $("body").pagecontainer("change", "#comment_add", {
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


          // var login_people = $("#login_people").val();
          // //刷新登录用户
          // var login_peoples = JSON.parse(LZString.decompressFromUTF16(localStorage.getItem('login_people')) || null) || [];
          // var found = _.find(login_peoples, function(x) {
          //   return x._id == $("#login_people").val();
          // })
          // if (!found) {
          //   login_peoples.push({
          //     _id: $("#login_people").val()
          //   });
          // }
          // localStorage.setItem('login_people', LZString.compressToUTF16(JSON.stringify(login_peoples)));
          $.mobile.loading("show");
          async.parallel({
            objective: function(cb) {
              // 刷新目标计划数据
              self.c_objectives.fetch().done(function() {
                localStorage.setItem('objectives', LZString.compressToUTF16(JSON.stringify(self.c_objectives)))
                cb(null, 'OK');
              });
            },

            task: function(cb) {
              // 刷新日历数据
              self.c_task.fetch().done(function() {
                localStorage.setItem('task', LZString.compressToUTF16(JSON.stringify(self.c_task)))
                cb(null, 'OK');
              })
            },
            people: function(cb) {
              // 刷新通讯录数据
              self.c_people.fetch().done(function() {
                localStorage.setItem('people', LZString.compressToUTF16(JSON.stringify(self.c_people)))
                cb(null, 'OK');
              })
            },
            talent: function(cb) {
              // 刷新通讯录数据
              self.c_talent.fetch().done(function() {
                localStorage.setItem('talent', LZString.compressToUTF16(JSON.stringify(self.c_talent)))
                cb(null, 'OK');
              })
            },
            horoscope: function(cb) {
              // 刷新通讯录数据
              self.c_horoscope.fetch().done(function() {
                localStorage.setItem('horoscope', LZString.compressToUTF16(JSON.stringify(self.c_horoscope)))
                cb(null, 'OK');
              })
            },
            competency: function(cb) {
              // 刷新通讯录数据
              self.c_competency.fetch().done(function() {
                localStorage.setItem('competency', LZString.compressToUTF16(JSON.stringify(self.c_competency)))
                cb(null, 'OK');
              })
            },
            payroll: function(cb) {
              // 刷新通讯录数据
              self.c_payroll.fetch().done(function() {
                self.payrollListView.rendered = false;
                localStorage.setItem('payroll', LZString.compressToUTF16(JSON.stringify(self.c_payroll)))
                cb(null, 'OK');
              })
            },


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
        // self.load_data(self.c_objectives, 'objectives');
        self.load_data(self.c_task, 'task');
        self.load_data(self.c_talent, 'talent');
        self.load_data(self.c_horoscope, 'horoscope');
        self.load_data(self.c_competency, 'competency');
        self.load_data(self.c_payroll, 'payroll');
      },
      load_data: function(col_obj, col_name) { //加载数据
        // $.mobile.loading("show");
        // var login_people = $("#login_people").val();
        var cn = col_name
        var local_data = JSON.parse(LZString.decompressFromUTF16(localStorage.getItem(cn)) || null)
          // var local_data = localStorage.getItem(cn);
        if (local_data) {
          col_obj.reset(local_data);
          col_obj.trigger('sync');
          // $.mobile.loading("hide");
        } else {
          col_obj.fetch().done(function() {
            localStorage.setItem(cn, LZString.compressToUTF16(JSON.stringify(col_obj)));
            // $.mobile.loading("hide");
          })
        };
      },
      init_views: function(self) {


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


        this.contactListlView = new ContactListView({
          el: "#contact_list-content",
          collection: self.c_people
        })
        this.contactDetaillView = new ContactDetailView({
          el: "#contact_detail-content"
        })

        this.payrollListView = new PayrollListView({
          el: "#salary_list-content",
          collection: self.c_payroll
        })
        this.payrollDetailView = new PayrollDetailView({
          el: "#salary_detail-content",
        })
        this.myProfileDetailView = new MyProfileDetailView({
          el: "#myprofile_basic-content",
        })
        this.myProfileEditView = new MyProfileEditView({

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


        this.taskForwardView = new TaskForwardView({
          el: "#task_forward-content",
        })
        this.taskForwardSelectPeoplePanelView = new TaskForwardSelectPeoplePanelView({
          el: "#panel-fwd-people",
          collection: self.c_people
        })

        this.peopleSelectView = new PeopleSelectView({
          el: "#people_select-content",
          collection: self.c_people,
        })

        this.uploadPicView = new UploadPicView({
          el: "#upload_pic-content",

        })
        this.commentAddView = new CommentAddView({
          el: "#comment_add-content",

        })
        this.competencyDetailView = new CompetencyDetailView({
          el: "#competency_scores-content",
          collection: self.competencyDetal,
        })
      },
      init_cols: function() {
        this.c_objectives = new ObjectiveCollection(); //目标计划
        this.c_task = new TaskCollection(); //工作任务
        this.c_task_v = new TaskVCollection(); //工作任务
        this.c_people = new PeopleCollection(); //人员
        this.c_talent = new TalentCollection(); //人才
        this.c_horoscope = new HoroscopeCollection(); //人才九宫图配置
        this.c_competency = new CompetencyCollection(); //能力素质
        this.c_payroll = new PayrollCollection(); //工资
        this.competencyDetal = new CompetencyDetalCollection()
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
              async.timesSeries(assessments.length, function(n, next) {
                self.c_assessment_v.url = '/admin/pm/assessment_instance/get_my_assessments_v_4m?people=' + assessments[n][1] + '&ct=' + (new Date()).getTime();
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
                    change_flag = (local_data.length != c.length);
                    if (!change_flag) { //没发现长度不一致，继续往下判断
                      //应该以云端的数据为准
                      for (var i = 0; i < c.length; i++) {
                        var found = _.find(local_data, function(x) {
                          return x._id == c.models[i].get('_id');
                        })
                        if (!found) { //云端有，本地没找到，说明有变化。
                          change_flag = true;
                          break;
                        } else {
                          if (found.lastModified != c.models[i].get('lastModified')) { //找到了，但是最后更改时间戳不一致，说明有变化。
                            change_flag = true;
                            break;
                          };
                        };
                      };
                    };
                    if (change_flag) { //发现有变化，重新fetch
                      tmp_assessment_col.url = '/admin/pm/assessment_instance/get_my_assessments_4m?people=' + assessments[n][1] + '&ct=' + (new Date()).getTime();
                      tmp_assessment_col.fetch().done(function() {
                        localStorage.setItem(cn, LZString.compressToUTF16(JSON.stringify(tmp_assessment_col)));
                        // $.mobile.loading("hide");
                        if (assessments[n][1] == $("#login_people").val()) { //如果是本人的，重新load一下data，以便通知各个view更新界面
                          self.load_data(self.c_assessment, 'assessment');
                        };
                        cb(null, cn + ': fetch new version ok. ');
                      })
                    } else {
                      cb(null, cn + ': no new version.')
                    };
                    // cb(null, 'fetch ok->' + assessments[n][1]);
                  }
                ], next);
              }, function(err, result) {
                console.log('[', moment().format('YYYY-MM-DD HH:mm:SS'), ']', result.join('\n'));
              })
              //工作任务数据
              var tasks = [];
              for (i = 0; i < localStorage.length; i++) {
                if (localStorage.key(i).split('_')[0] == 'task') {
                  tasks.push(localStorage.key(i).split('_'))
                }
              }
              var tmp_task_col = new TaskCollection();
              async.timesSeries(tasks.length, function(n, next) {
                self.c_task_v.url = '/admin/pm/work_plan/bb_v_4m?people=' + tasks[n][1] + '&ct=' + (new Date()).getTime();
                async.waterfall([

                  function(cb) {
                    self.c_task_v.fetch().done(function() { //获取版本
                      cb(null, self.c_task_v);
                    })
                  },
                  function(c, cb) { //取得本地数据版本，并与之前获取的版本进行比对
                    var cn = tasks[n].join('_'); //本地localStorage使用的key
                    var local_data = JSON.parse(LZString.decompressFromUTF16(localStorage.getItem(cn)) || null)
                    var change_flag = false;
                    change_flag = (local_data.length != c.length);
                    if (!change_flag) { //没发现长度不一致，继续往下判断
                      //应该以云端的数据为准
                      for (var i = 0; i < c.length; i++) {
                        var found = _.find(local_data, function(x) {
                          return x._id == c.models[i].get('_id');
                        })
                        if (!found) { //云端有，本地没找到，说明有变化。
                          change_flag = true;
                          break;
                        } else {
                          if (found.lastModified != c.models[i].get('lastModified')) { //找到了，但是最后更改时间戳不一致，说明有变化。
                            change_flag = true;
                            break;
                          };
                        };
                      };
                    };
                    if (change_flag) { //发现有变化，重新fetch
                      tmp_task_col.url = '/admin/pm/work_plan/bb4m?people=' + tasks[n][1] + '&ct=' + (new Date()).getTime();
                      tmp_task_col.fetch().done(function() {
                        localStorage.setItem(cn, LZString.compressToUTF16(JSON.stringify(tmp_task_col)));
                        // $.mobile.loading("hide");
                        if (tasks[n][1] == $("#login_people").val()) { //如果是本人的，重新load一下data，以便通知各个view更新界面
                          self.load_data(self.c_task, 'task');
                        };
                        cb(null, cn + ': fetch new version ok');
                      })
                    } else {
                      cb(null, cn + ': no new version.')
                    };
                    // cb(null, 'fetch ok->' + tasks[n][1]);
                  }
                ], next);
              }, function(err, result) {
                console.log('[', moment().format('YYYY-MM-DD HH:mm:SS'), ']', result.join('\n'));
              })
            };
          }, interval); //10 seconds for test
        };
      },
      bind_events: function() {
        var self = this;
        // 设定自动同步数据的间隔，并重新启动计时器
        /* -- disabled
        $("#config_refresh_interval").on('change', 'input[type=radio][name=config_refresh_interval_option]', function(event) {
          var $this = $(this);
          localStorage.setItem('refresh_interval', $this.val());
          clearInterval(self.interval_id);
          if ($this.val() != '0') { //重新启动计时器
            // console.log('timer stoped');
            self.start_auto_fetch(parseInt($this.val()) * 60 * 1000);
          }
        });
        */
        $("#loading").on('click', '#btn_reload', function(event) {
          event.preventDefault();
          // alert(window.location.href);
          if ($("#req_ua").val() == 'normal') {
            window.location.href = '#home';
          } else {
            window.location.href = '#';
          }
        });

        $("#fullscreen-overlay").on('click', function(event) {
          event.preventDefault();
          var $this = $(this);
          $this.fadeOut('fast', function() {
            $this.empty();
          });
        });

        $("body")
          .on('click', 'button.go-home', function(event) {
            event.preventDefault();
            if ($("#req_ua").val() == 'normal') {
              window.location.href = '#home';
            } else {
              window.location.href = '#';
            };
          })


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
      Handlebars.registerHelper('sprintf', function(sf, data, default_value) {
        return data ? sprintf(sf, data) : default_value;
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
      Handlebars.registerHelper('segname', function(data) {
        return (data == '-') ? '' : '[' + data + ']';
      });
      Handlebars.registerHelper('plus1', function(data) {
        return parseInt(data) + 1;
      });
      Handlebars.registerHelper('cr2br', function(data) {
        return (data) ? data.replace(/\n/g, '<br>') : '';
      });
      Handlebars.registerHelper('task_status', function(isfinished, end, allday) {
        if (isfinished) {
          return '<span class="label-success">完成</span>';
        } else {
          if (!end || ((allday) ? moment(end).endOf('d').toDate() : moment(end).toDate()) >= new Date()) {
            return '<span class="label-info">正常</span>';
          } else {
            return '<span class="label-danger">超时</span>';
          };
        };
      });
      Handlebars.registerHelper('task_status2', function(end) {
        if (moment(end).endOf('d').toDate() < new Date()) {
          return '<span class="label-danger">已超时</span>';
        }
      });
      Handlebars.registerHelper('fromNow', function(data, flag) {
        return (data) ? moment(data).fromNow(!!flag) : '';
      });
      Handlebars.registerHelper('fromStart2End', function(start, end, flag) {
        if (moment(end).format('YYYY-MM-DD') == '9999-12-31') {
          return moment(start).fromNow(!!flag);
        } else {
          return moment(start).from(moment(end), !!flag);
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
      Handlebars.registerHelper('toISODatetime2', function(date) {
        return (date) ? moment(date).format('YYYY-MM-DD HH:mm:ss') : '';
      });
      Handlebars.registerHelper('toUTCDatetime', function(date) {
        return (date) ? moment(date).format('YYYY-MM-DDTHH:mm') : '';
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
      Handlebars.registerHelper('genReviseSparklineVal', function(data) {
        var values = [];
        _.each(data, function(x) {
          values.push(x.revised_value);
        })
        return values.join(',');
      });
      Handlebars.registerHelper('genReviseSparklineValC', function(data, data_t, target_value) { //根据实际值的时间去找对应的目标值，然后返回包含目标值的数组
        var values = [];
        if (data_t.length) {
          _.each(data, function(x) {
            var tmp = _.filter(data_t, function(y) {
                return moment(x.timestamp).diff(moment(y.timestamp)) >= 0;
              })
              // console.log(tmp);
            if (tmp.length) {
              var t_val = _.max(tmp, function(y) {
                return (new Date(y.timestamp))
              });
              values.push(t_val.revised_value);
            } else {
              values.push(target_value);
            };

          })
        } else {
          values = _.map(data, function(x) {
            return target_value
          })
        };
        return values.join(',');
      });
      Handlebars.registerHelper('genReviseSparklineDate', function(data) {
        var revise_date = [];
        _.each(data, function(x) {
          revise_date.push(moment(x.timestamp).format('YYYY-MM-DD HH:mm'));
        })
        return revise_date.join(',');
      });
      Handlebars.registerHelper('getDatePart', function(ds, p) {
        var dd = ds.split(' ');
        if (p == 'd') {
          return dd[0];
        } else {
          return dd[1];
        };
      });
      Handlebars.registerHelper('project_status', function(status, end) {
        if (status == 'C') {
          return '<span class="label-success">完成</span>';
        } else {
          if (!end || moment(end).endOf('d').toDate() >= new Date()) {
            return '<span class="label-info">正常</span>';
          } else {
            return '<span class="label-danger">超时</span>';
          };
        };
      });
      Handlebars.registerHelper('genContactRoleOptions', function(role) {
        var ret = [];
        var roles = ['无', '合作伙伴', '供应商', '客户', '决策者', '影响者', '参与者', '支持者', '中立者', '反对者'];
        _.each(roles, function(x) {
          ret.push('<option value="' + x + '" ' + ((x == role) ? 'selected' : '') + '>');
          ret.push(x);
          ret.push('</option>');
        })
        return ret.join('');
      });
      Handlebars.registerHelper('genContactCompanyRoleOptions', function(role) {
        var ret = [];
        var roles = ['无', '合作伙伴', '供应商', '客户'];
        _.each(roles, function(x) {
          ret.push('<option value="' + x + '" ' + ((x == role) ? 'selected' : '') + '>');
          ret.push(x);
          ret.push('</option>');
        })
        return ret.join('');
      });
      Handlebars.registerHelper('genCTImportanceOptions', function(importance) {
        var ret = [];
        var roles = ['一般', '重要', '很重要'];
        _.each(roles, function(x) {
          ret.push('<option value="' + x + '" ' + ((x == importance) ? 'selected' : '') + '>');
          ret.push(x);
          ret.push('</option>');
        })
        return ret.join('');
      });
      Handlebars.registerHelper('genCTUrgencyOptions', function(urgency) {
        var ret = [];
        var roles = ['一般', '紧急', '很紧急'];
        _.each(roles, function(x) {
          ret.push('<option value="' + x + '" ' + ((x == urgency) ? 'selected' : '') + '>');
          ret.push(x);
          ret.push('</option>');
        })
        return ret.join('');
      });
      Handlebars.registerHelper('genCPTypesOptions', function(cp_types, cp_type) {
        var ret = [];

        _.each(cp_types, function(x) {
          ret.push('<option value="' + x._id + '" ' + ((x._id == cp_type) ? 'selected' : '') + '>');
          ret.push(x.cp_type_name);
          ret.push('</option>');
        })
        return ret.join('');
      });
      Handlebars.registerHelper('showFinishState', function(dof, end, allday) {
        var ret = ['<div class="'];
        // console.log(dof, moment(end).endOf('day').toDate());
        var end_t = (allday) ? moment(end).endOf('day').toDate() : moment(end).toDate();
        if (new Date(dof) <= end_t) {
          ret.push('text-success');
          ret.push('">');
          ret.push('按时完成');
        } else {
          ret.push('text-danger');
          ret.push('">');
          ret.push('超时完成');
        };
        ret.push('</div>')
        return ret.join('');
      });
      Handlebars.registerHelper('getByIndex', function(arr, index, dft) {
        return (arr[index]) ? arr[index] : dft;
      });

      Handlebars.registerHelper('calcFileSize', function(data) {
        var size = parseInt(data);
        if (size < 1024) {
          return sprintf('%0.2f B', size);
        } else if (size >= 1024 && size < 1048576) { //1024 * 1024
          return sprintf('%0.2f KB', size / 1024);
        } else if (size >= 1048576 && size < 1073741824) { //1024^3
          return sprintf('%0.2f MB', size / 1048576);
        } else if (size >= 1073741824) {
          return springf('%0.2f GB', size / 1073741824);
        };
      });

      Handlebars.registerHelper('rp_num', function(data) {
        var f_ps = _.filter(data, function(d) {
          return d.is_show
        })
        return f_ps.length < 100 ? f_ps.length : '99+'
      });
      //索引排名
      Handlebars.registerHelper('ranking', function(num) {
        return num + 1;

      });
      Handlebars.registerHelper('getFileExtName', function(filename) {
        var fn_parts = filename.split('.');
        if (fn_parts.length > 1) {
          return fn_parts[fn_parts.length - 1];
        } else {
          return '';
        };

      });
      //绩效流程相关=====================》
      Handlebars.registerHelper('ai_inout', function(s) {
        return (s == $("#login_people").val()) ? 'in' : 'out';
      });

      Handlebars.registerHelper('isplan', function(data, options) {
        if (parseFloat(data) < 4) {
          return options.fn(this);
        } else {
          return options.inverse(this);
        };
      });

      Handlebars.registerHelper('task', function(data, options) {
        if (data == 'TASK') {
          return options.fn(this);
        } else {
          return options.inverse(this);
        };
      });

      Handlebars.registerHelper('turn', function(data, options) {
        if (data == 'F') {
          return options.fn(this);
        } else {
          return options.inverse(this);
        };
      });

      Handlebars.registerHelper('next_task_user0', function(data, options) {
        if (data.length == 0) {
          return options.fn(this);
        } else {
          return options.inverse(this);
        };
      });

      Handlebars.registerHelper('next_task_user1', function(data, options) {
        if (data.length == 1) {
          return options.fn(this);
        } else {
          return options.inverse(this);
        };
      });

      Handlebars.registerHelper('next_task_user', function(data, options) {
        if (data.length != 0 && data.length != 1) {
          return options.fn(this);
        } else {
          return options.inverse(this);
        };
      });

      Handlebars.registerHelper('grade_way', function(data, options) {
        if (data == 'P') {
          return options.fn(this);
        } else {
          return options.inverse(this);
        };
      });

      Handlebars.registerHelper('wr_can_submit', function(data, options) {
        if (moment() >= moment(data)) {
          return options.fn(this);
        } else {
          return options.inverse(this);
        };
      });
      //和登录人比较
      Handlebars.registerHelper('is_self', function(data, options) {
        if (data == $('#login_people').val()) {
          return options.fn(this);
        } else {
          return options.inverse(this);
        };
      });

      Handlebars.registerHelper('get_next_user_id', function(data) {
        return data[0]._id;
      });

      Handlebars.registerHelper('get_next_user_name', function(data) {
        return data[0].people_name;
      });
      //绩效流程相关=====================》
      Handlebars.registerHelper('ai_is_edit', function(data, options) {
        if (data == '2') {
          return options.fn(this);
        } else {
          return options.inverse(this);
        };
      });
      Handlebars.registerHelper('genAlarmSetMsg', function(offset) {
        var prefix = '',
          msg = '';

        if (offset < 0) {
          prefix = '开始前'
        } else if (offset > 0) {
          prefix = '开始后'
        } else {
          return '任务开始时'
        };
        offset = Math.abs(offset);
        if (offset > 0 && offset < 60) {
          msg = offset + '分钟';
        } else if (offset >= 60 && offset <= 120) {
          msg = offset / 60 + '小时';
        } else if (offset > 120 && offset <= 2880) {
          msg = offset / 60 / 24 + '天';
        } else if (offset > 2880) {
          msg = offset / 60 / 24 / 7 + '周';
        };
        return prefix + msg;
      });
      //移动考勤相关====================
      //TmAbsenceOfThreeView
      Handlebars.registerHelper('formatDate', function(start, end) {
        var format_start = moment(start).format("YYYY-MM-DD");
        var format_end = moment(end).format("YYYY-MM-DD");
        if (format_start != format_end) {
          return format_start + '~' + format_end
        } else {
          return format_start
        }

      });
      Handlebars.registerHelper('hour', function(time) {
        var total_value = 0;
        if (String(time).indexOf('.') != -1) {
          total_value = parseFloat(time).toFixed(2)
        } else {
          total_value = parseInt(time)
        }
        if (total_value > 0) {
          return total_value + '&nbsp;&nbsp;<span class="label label-warning">小时</span>'
        }

      });
      Handlebars.registerHelper('parse_float', function(total_value) {
        if (String(total_value).indexOf('.') != -1) {
          return parseFloat(total_value).toFixed(2)
        } else {
          return parseInt(total_value)
        }
        // if (time > 0) {
        //   return parseInt(time)
        // } else {
        //   return 0
        // }

      });
      Handlebars.registerHelper('travel', function(absence_type, destination) {
        if (absence_type == 'W') {
          var destinations = _.map(destination, function(t) {
            return t.city_name
          })
          if (destinations.length > 0) {
            return '<div class="ui-grid-b"><p style="margin-bottom:0px">目的地:&nbsp;<span class="text-info">' + destinations.join(' ') + '</span></p></div>'

          }
        }

      });
      //PeopleAttendanceResultView
      Handlebars.registerHelper('if_true', function(result, cond1) {
        if (!!~result.indexOf(String(cond1))) {
          // return '<a data-role="button" data-icon="check" ></a>'
          return '<span class="label label-info" style="color:red">是</span>'

        } else {
          return '<span class="label label-warning" style="color:red">否</span>'
        }

      });
      Handlebars.registerHelper('if_true2', function(result, cond1, cond2) {
        if (cond1 && cond2) {
          if (!!~result.indexOf(String(cond1)) && !!~result.indexOf(String(cond2))) {
            // return '<i class="icon-ok" style="color:red"></i>'
            return '<span class="label label-info" style="color:red">是</span>'

          } else {
            return '<span class="label label-warning" style="color:red">否</span>'
          }
        }

      });
      //BeyondOfWorkView
      Handlebars.registerHelper('work_category', function(num, category_mue) {
        return category_mue[num]
      });
      //BeyondOfWorkReportView
      Handlebars.registerHelper('month', function(filter_month) {
        var months = {
          '1': '一月',
          '2': '二月',
          '3': '三月',
          '4': '四月',
          '5': '五月',
          '6': '六月',
          '7': '七月',
          '8': '八月',
          '9': '九月',
          '10': '十月',
          '11': '十一月',
          '12': '十二月',
        }
        return months[String(filter_month)]

      });
      //WorkOfTravelView
      Handlebars.registerHelper('destination', function(destination) {
        var destination = _.map(destination, function(temp) {
          return temp.city_name
        })
        if (destination.length > 0) {
          return '<span class="text-success">' + destination.join(' ') + '</span>'
        }
      });
      //my card record list view
      Handlebars.registerHelper('sign_style', function(type) {
        var obj = {
          'P': '电脑',
          'I': '考勤机',
          'M': '移动'
        }
        return '<span class="label label-info">' + obj[String(type)] + '</span>'

      });
      //判断是否可以上传附件
      Handlebars.registerHelper('about_attach', function(about_attach) {

        if (about_attach == 'U') {
          return true;
        } else {
          return false;
        }

      });
      //判断是否可以上传附件
      Handlebars.registerHelper('attach', function(attachments) {

        if (attachments) {
          if (attachments._id) {
            return attachments._id
          } else {
            return attachments
          }
        } else {
          return null
        }

      });
      Handlebars.registerHelper('spanDate', function(start, end) {

        var spanDate = '<span class="label label-success btn-dp" style="cursor: pointer;">起</span><span style="padding-right:2px">' + moment(start).format('YYYY-MM-DD') + '</span><span class="label label-success btn-dp" style="cursor: pointer;">止</span><span style="padding-right:2px">' + moment(end).format('YYYY-MM-DD') + '</span>';
        return spanDate;

      });
      Handlebars.registerHelper('plan_num', function(plan_divide) {

        return plan_divide.length;

      });
      Handlebars.registerHelper('plan_state', function(start, end, is_delete) {
        var state_obj = {
          '1': '未开始',
          '2': '进行中',
          '3': '已到期',
          '4': '已废弃'

        }

        function span(num) {
          return '<span class="label label-info">' + state_obj[num] + '</span>'
        }

        function format(date) {
          return moment(date).format("YYYYMMDD")
        }
        if (is_delete) {
          return span('4');
        } else {
          if (format(new Date()) > format(end)) {
            return span('3')
          } else if (format(new Date()) < format(start)) {
            return span('1')
          } else {
            return span('2')
          }
        }

      });
      //人才管理
      Handlebars.registerHelper('people_trans', function(people, _id, field) {
        var filter_people = _.find(people, function(temp) {
          return temp._id == String(_id)
        })
        return filter_people ? filter_people[field] : '';

      });
      Handlebars.registerHelper('TalentFile', function(data, _id, field) {
        var filter_file = _.find(data, function(temp) {
          return temp._id == String(_id)
        })
        if (filter_file) {
          if (field == 'length') {
            var size = parseInt(filter_file.length);
            if (size < 1024) {
              return sprintf('%0.2f B', size);
            } else if (size >= 1024 && size < 1048576) { //1024 * 1024
              return sprintf('%0.2f KB', size / 1024);
            } else if (size >= 1048576 && size < 1073741824) { //1024^3
              return sprintf('%0.2f MB', size / 1048576);
            } else if (size >= 1073741824) {
              return springf('%0.2f GB', size / 1073741824);
            };
          } else if (field == 'uploadDate') {
            return moment(filter_file.uploadDate).format("YYYY-MM-DD")
          } else if (field == 'file_name') {
            var fn_parts = filter_file.filename.split('.');
            if (fn_parts.length > 1) {
              return fn_parts[fn_parts.length - 1];
            } else {
              return '';
            };
          }
        } else {
          return ''
        }


      });
      Handlebars.registerHelper('TalentAvatar', function(people, _id, field) {
        var filter_people = _.find(people, function(temp) {
          return temp._id == String(_id)
        })
        return (filter_people[field]) ? '/gridfs/get/' + filter_people[field] : '/img/no-avatar.jpg';
      });
      Handlebars.registerHelper('opt_ret', function(exist, data, data_b) {
        var item = [],
          id_arr = [],
          name_arr = [],
          id_arr_b = [],
          name_arr_b = [];
        _.each(data, function(temp) {
          id_arr.push(_.keys(temp))
          name_arr.push(_.values(temp))
        })
        _.each(data_b, function(temp) {
          id_arr_b.push(_.keys(temp))
          name_arr_b.push(_.values(temp))
        })
        var obj_temp = _.object(id_arr, name_arr);
        var obj_temp_b = _.object(id_arr_b, name_arr_b);
        if (exist) {
          item.push('<option data-name="' + obj_temp_b[exist] + '" value="' + exist + '" >' + obj_temp_b[exist] + '</option>')

        } else {
          if (data.length > 0 && data[0] != '') {
            _.each(id_arr, function(temp) {
              item.push('<option data-name="' + obj_temp[temp] + '" value="' + temp + '" >' + obj_temp[temp] + '</option>')
            })
          } else {
            item.push('<option></option>')
            _.each(id_arr_b, function(temp) {
              item.push('<option data-name="' + obj_temp_b[temp] + '" value="' + temp + '" >' + obj_temp_b[temp] + '</option>')
            })
          }

        }

        return item.join('');
      });
      Handlebars.registerHelper('opt_ret_car', function(direct, exist, position, data, data_b) {
        var
          item = [];
        if (exist) {
          //读取已有的数据
          var direct_data = _.find(data_b, function(temp) {
            return temp.attributes._id == String(direct)
          })
          if (direct_data) {
            var career_data = _.find(direct_data.attributes.data, function(temp) {
              return temp.des_career == String(exist)
            })
            if (career_data) {
              var temp_arr = [];
              temp_arr.push(career_data.des_career);
              temp_arr.push(career_data.des_career_name);
              item.push('<option value="' + temp_arr + '" >' + career_data.des_career_name + '</option>')

            }

          }


        } else {
          if (data.length > 0) {
            //当候选对象存在于多个培养方向时
            //选第一个培养方向中的推荐培养职务
            _.each(data[0].attributes.data, function(car) {
              var twitter_pos = _.find(car.des_position_data, function(pos) {
                var can_pos = [];
                _.each(pos.can_position_data, function(can) {
                  can_pos.push(String(can.can_position))
                })
                return !!~can_pos.indexOf(String(position))
              })
              var temp_arr = [];
              temp_arr.push(car.des_career);
              temp_arr.push(car.des_career_name)
              if (twitter_pos) {
                item.push('<option value="' + temp_arr + '" selected>' + car.des_career_name + '</option>')

              } else {
                item.push('<option value="' + temp_arr + '" >' + car.des_career_name + '</option>')

              }

            })


          }
        }


        return item.join('');


      });
      Handlebars.registerHelper('opt_ret_des', function(direct, career, exist, position, data, data_b) {
        var
          item = [];
        if (exist) {
          var direct_data = _.find(data_b, function(temp) {
            return temp.attributes._id == String(direct)
          })
          if (direct_data) {
            var career_data = _.find(direct_data.attributes.data, function(temp) {
              return temp.des_career == String(career)
            })
            if (career_data) {
              var pos_data = _.find(career_data.des_position_data, function(temp) {
                return temp.des_position == String(exist)
              })
              var temp_arr = [];
              if (pos_data) {
                temp_arr.push(pos_data.des_position);
                temp_arr.push(pos_data.des_position_name)
                item.push('<option value="' + temp_arr + '" selected>' + pos_data.des_position_name + '</option>')

              }


            }

          }

        } else {
          if (data.length > 0) {
            //当候选对象存在于多个培养方向时
            //选第一个培养方向中的推荐培养职务
            _.each(data[0].attributes.data, function(car) {
              var twitter_pos = _.find(car.des_position_data, function(pos) {
                  var can_pos = [];
                  _.each(pos.can_position_data, function(can) {
                    can_pos.push(String(can.can_position))
                  })
                  return !!~can_pos.indexOf(String(position))
                })
                //对应的目标职务
              if (twitter_pos) {
                _.each(car.des_position_data, function(pos) {
                  var temp_arr = [];
                  temp_arr.push(pos.des_position);
                  temp_arr.push(pos.des_position_name)
                  var can_pos_temp = _.find(pos.can_position_data, function(can) {
                    String(can.can_position) == String(position)
                  })
                  if (can_pos_temp) {
                    item.push('<option value="' + temp_arr + '" selected>' + pos.des_position_name + '</option>')
                  } else {
                    item.push('<option value="' + temp_arr + '" >' + pos.des_position_name + '</option>')

                  }
                })

              }

            })


          }
        }

        return item.join('');


      });
      //人才培养计划明细

      Handlebars.registerHelper('Status', function(plan_s, plan_e) {
        var status = null;
        if (moment(plan_s).isBefore(new Date()) && moment(plan_e).isAfter(new Date())) {
          status = '进行中'
        } else if (moment(plan_s).isAfter(new Date())) {
          status = '未开始'
        } else {
          status = '已结束'
        }
        return status;
      });
      Handlebars.registerHelper('Result', function(pass) {
        var status = null;
        if (pass) {
          status = '已通过'
        } else {
          status = '未通过'
        }
        return status;
      });
      Handlebars.registerHelper('FirstPosition', function(history) {
        var filter_position = _.first(_.sortBy(history, function(temp) {
          return temp.start_time
        }))
        return filter_position.position_name
      });
      //人才培养计划明细
      Handlebars.registerHelper('opt_ret', function(develope_type, type_data, pri_state) {
        var item = [];
        if (develope_type) {
          var type_temp = _.find(type_data, function(temp) {
              return temp._id == String(develope_type)
            })
            //过滤没有操作培养手段权限的培养方式
          var r_data = _.filter(type_data, function(r) {
            if (r.develope_style) {
              var f_data = _.filter(r.develope_style, function(d) {
                var data = [];
                if (d.priviledge) {
                  _.each(d.priviledge, function(temp) {
                    data.push(String(temp.pri));
                  })
                }
                return !!~data.indexOf(String(pri_state));


              })
              return f_data.length > 0
            }

          })
          _.each(r_data, function(temp) {
            var temp_arr = [];
            temp_arr.push(temp._id);
            temp_arr.push(temp.type_name)
            if (temp._id == String(develope_type)) {

              item.push('<option value="' + temp_arr + '" selected>' + temp.type_name + '</option>')

            } else {
              item.push('<option value="' + temp_arr + '" >' + temp.type_name + '</option>')

            }
          })
          // item.push('<option value="' + type_temp._id + '" >' + type_temp.type_name + '</option>')

        } else {
          item.push('<option>请选择培养方式</option>');
          var r_data = _.filter(type_data, function(r) {
            if (r.develope_style) {
              var f_data = _.filter(r.develope_style, function(d) {
                var data = [];
                if (d.priviledge) {
                  _.each(d.priviledge, function(temp) {
                    data.push(String(temp.pri));
                  })
                }
                return !!~data.indexOf(String(pri_state));


              })
              return f_data.length > 0
            }

          })
          _.each(r_data, function(temp) {
            var temp_arr = [];
            temp_arr.push(temp._id);
            temp_arr.push(temp.type_name)
            item.push('<option data-name="' + temp.type_name + '" value="' + temp_arr + '" >' + temp.type_name + '</option>')
          })
        }
        return item.join('');
      });
      Handlebars.registerHelper('opt_style_ret', function(develope_type, style_id, type_data, pri_state) {
        var item = [];
        if (develope_type) {
          var type_temp = _.find(type_data, function(temp) {
            return temp._id == String(develope_type)
          })
          if (style_id) {
            var style_temp = _.find(type_temp.develope_style, function(temp) {
                return temp._id == String(style_id)
              })
              // if(style_temp)
              // var temp_arr = [];
              // temp_arr.push(style_temp._id);
              // temp_arr.push(style_temp.style_name)
            item.push('<option>请选择培养手段</option>')

            _.each(type_temp.develope_style, function(temp) {
              var priviledge = _.map(temp.priviledge, function(p) {
                return String(p.pri)
              })
              if (!!~priviledge.indexOf(String(pri_state))) {
                var temp_arr = [];
                temp_arr.push(temp._id);
                temp_arr.push(temp.style_name);
                if (temp._id == String(style_id)) {
                  item.push('<option value="' + temp_arr + '" selected>' + style_temp.style_name + '</option>')

                } else {
                  item.push('<option value="' + temp_arr + '" >' + temp.style_name + '</option>')

                }
              }
            })

          } else {
            item.push('<option>请选择培养手段</option>')

            _.each(type_temp.develope_style, function(temp) {
              //判断权限
              var priviledge = _.map(temp.priviledge, function(p) {
                return String(p.pri)
              })
              if (!!~priviledge.indexOf(String(pri_state))) {

                var temp_arr = [];
                temp_arr.push(temp._id);
                temp_arr.push(temp.style_name)
                item.push('<option value="' + temp_arr + '" >' + temp.style_name + '</option>')
              }
            })

          }


        }
        return item.join('');
      });
      Handlebars.registerHelper('opt_learn_ret', function(develope_type, style_id, learn_style, type_data, learn, pri_state) {
        var item = [];
        if (develope_type && style_id) {
          var type_temp = _.find(type_data, function(temp) {
            return temp._id == String(develope_type)
          })
          var style_temp = _.find(type_temp.develope_style, function(temp) {
            return temp._id == String(style_id)
          })
          var obj = {};
          _.each(learn, function(temp) {
            obj[temp._id] = temp.type_name
          })
          if (learn_style) {
            // var learn_temp = _.find(style_temp.learn_style, function(temp) {
            //     return temp == String(learn_style)
            // })
            if (style_temp) {
              item.push('<option>请选择培养安排方式</option>');

              _.each(style_temp.learn_style, function(temp) {
                var temp_arr = [];
                temp_arr.push(temp);
                temp_arr.push(obj[temp])
                if (learn_style == String(temp)) {
                  item.push('<option value="' + temp_arr + '" selected>' + obj[temp] + '</option>')

                } else {
                  item.push('<option value="' + temp_arr + '">' + obj[temp] + '</option>')
                }

              })
            }

          } else {
            item.push('<option>请选择培养安排方式</option>')
            if (style_temp) {
              _.each(style_temp.learn_style, function(temp) {
                var temp_arr = [];
                temp_arr.push(temp);
                temp_arr.push(obj[temp])
                item.push('<option value="' + temp_arr + '" >' + obj[temp] + '</option>')
              })
            }

          }


        }
        return item.join('');
      });
      Handlebars.registerHelper('opt_check_ret', function(develope_type, style_id, check_style, type_data, check, pri_state) {
        var item = [];
        if (develope_type && style_id) {
          var type_temp = _.find(type_data, function(temp) {
            return temp._id == String(develope_type)
          })
          var style_temp = _.find(type_temp.develope_style, function(temp) {
            return temp._id == String(style_id)
          })
          var obj = {};
          _.each(check, function(temp) {
            obj[temp._id] = temp.type_name
          })
          if (check_style) {
            // var check_temp = _.find(style_temp.check_style, function(temp) {
            //     return temp == String(check_style)
            // })
            if (style_temp) {
              item.push('<option>请选择成果评估方式</option>');

              _.each(style_temp.check_style, function(temp) {
                var temp_arr = [];
                temp_arr.push(temp);
                temp_arr.push(obj[temp])
                if (check_style == String(temp)) {
                  item.push('<option value="' + temp_arr + '" selected>' + obj[temp] + '</option>')

                } else {
                  item.push('<option value="' + temp_arr + '">' + obj[temp] + '</option>')
                }

              })
            }

          } else {
            item.push('<option>请选择成果评估方式</option>');
            if (style_temp) {
              _.each(style_temp.check_style, function(temp) {
                var temp_arr = [];
                temp_arr.push(temp);
                temp_arr.push(obj[temp])
                item.push('<option value="' + temp_arr + '" >' + obj[temp] + '</option>')
              })
            }

          }


        }
        return item.join('');
      });
      Handlebars.registerHelper('toISODateRangeTalent', function(start, end) {
        return moment(start).format("YYYY-MM-DD") + '&rarr;' + moment(end).format("YYYY-MM-DD");
      });
      //我的工作计划
      Handlebars.registerHelper('bool', function(bool) {
        return bool ? '<span class="label label-warning" style="border-radius:10px">是<span>' : '<span class="label label-info" style="border-radius:10px">否</span>';
      });
      Handlebars.registerHelper('week', function(date, work_time) {
        var week = {
          '0': '星期日',
          '1': '星期一',
          '2': '星期二',
          '3': '星期三',
          '4': '星期四',
          '5': '星期五',
          '6': '星期六',
        };
        return week[moment(date).days()]
      })
      Handlebars.registerHelper('even_odd', function(date) {
        if (moment(date).weeks() % 2) {
          return '奇数周'
        } else {
          return '偶数周'
        }
      });
      Handlebars.registerHelper('hol', function(is_holiday) {
        return is_holiday ? '<span class="label label-info" style="border-radius:10px">是<span>' : '<span class="label label-warning" style="border-radius:10px">否</span>';
      });
      Handlebars.registerHelper('is_full_day', function(is_job_day, is_holiday, holiday_data) {
        if ((is_job_day && !is_holiday) || (is_job_day && is_holiday && holiday_data.property == 'f')) {
          var prop_f = '全';
        } else {
          var prop_h = '半';
        }
        return prop_f ? '<span class="label label-info" style="border-radius:10px">' + prop_f + '</span>' : '<span class="label label-warning" style="border-radius:10px">' + prop_h + '</span>';
      })
    })();

    (function() {
      var ezswipe_container, ezswipe_surface, i, style, _droid_swipe, _ezSwipes;
      _droid_swipe = function(el) {
        var dispatchEvent, _child;
        dispatchEvent = function(name, delta) {
          var event, settings;
          settings = {
            detail: {
              delta: delta,
              bubbles: false,
              cancelable: true
            }
          };
          el.parentNode.dispatchEvent(new CustomEvent(name, settings));
        };
        _child = el.querySelectorAll("._ezswipe_surface")[0];
        el.ezSwipe = {
          center: {
            x: (_child.clientWidth / 2) - (el.clientWidth / 2),
            y: (_child.clientHeight / 2) - (el.clientHeight / 2)
          },
          timer: null,
          scrolling: false,
          starttime: 0,
          last: {
            x: 0,
            y: 0,
            t: 0
          }
        };
        el.scrollLeft = el.ezSwipe.center.x;
        el.scrollTop = el.ezSwipe.center.y;
        el.onscroll = function(e) {
          var d, delta;
          d = new Date().getTime();
          if ((el.scrollLeft !== el.ezSwipe.center.x) || (el.scrollTop !== el.ezSwipe.center.y)) {
            if (!el.ezSwipe.scrolling) {
              delta = {
                x: 0,
                y: 0,
                t: 0
              };
              el.ezSwipe.starttime = d;
              el.ezSwipe.last = delta;
              dispatchEvent("swipeStart", delta);
              el.ezSwipe.scrolling = true;
            } else {
              delta = {
                x: el.ezSwipe.center.x - el.scrollLeft - el.ezSwipe.last.x,
                y: el.ezSwipe.center.y - el.scrollTop - el.ezSwipe.last.y,
                t: d - el.ezSwipe.starttime - el.ezSwipe.last.t
              };
              el.ezSwipe.last = {
                x: el.ezSwipe.center.x - el.scrollLeft,
                y: el.ezSwipe.center.y - el.scrollTop,
                t: d - el.ezSwipe.starttime
              };
              dispatchEvent("swipeMove", delta);
            }
            if (el.ezSwipe.timer) {
              clearTimeout(el.ezSwipe.timer);
            }
            el.ezSwipe.timer = setTimeout(function() {
              el.ezSwipe.timer = null;
              d = new Date().getTime();
              delta = {
                x: el.ezSwipe.center.x - el.scrollLeft,
                y: el.ezSwipe.center.y - el.scrollTop,
                t: d - el.ezSwipe.starttime
              };
              el.ezSwipe.last = delta;
              dispatchEvent("swipeEnd", delta);
              if (Math.abs(delta.y) > Math.abs(delta.x)) {
                if (delta.y < 0) {
                  dispatchEvent("swipeUp", delta);
                } else {
                  dispatchEvent("swipeDown", delta);
                }
              } else {
                if (delta.x < 0) {
                  dispatchEvent("swipeLeft", delta);
                } else {
                  dispatchEvent("swipeRight", delta);
                }
              }
              el.ezSwipe.scrolling = false;
              _droid_swipe(el);
            }, 100);
          }
        };
      };
      _ezSwipes = document.querySelectorAll("._ezswipe");
      i = 0;
      while (i < _ezSwipes.length) {
        ezswipe_container = document.createElement("div");
        ezswipe_container.classList.add("_ezswipe_container");
        _ezSwipes[i].style.overflow = "hidden";
        style = ezswipe_container.style;
        style.webkitUserSelect = "none";
        style.webkitOverflowScrolling = "touch";
        style.overflow = "auto";
        style.opacity = 0;
        style.top = 0;
        style.left = 0;
        style.position = "absolute";
        if (_ezSwipes[i].offsetWidth > document.width) {
          style.width = document.width + "px";
        } else {
          style.width = _ezSwipes[i].offsetWidth + "px";
        }
        if (_ezSwipes[i].offsetHeight > document.height) {
          style.height = document.height + "px";
        } else {
          style.height = _ezSwipes[i].offsetHeight + "px";
        }
        ezswipe_surface = document.createElement("div");
        ezswipe_surface.classList.add("_ezswipe_surface");
        style = ezswipe_surface.style;
        style.position = "relative";
        style.width = "300%";
        style.height = "300%";
        ezswipe_container.appendChild(ezswipe_surface);
        _droid_swipe(_ezSwipes[i].insertBefore(ezswipe_container, _ezSwipes[i].firstElementChild));
        i++;
      }
    })();


    // Returns the Router class
    return MainRouter;

  });