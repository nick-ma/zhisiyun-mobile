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
    "../collections/TalentCollection", "../views/MyTeamTalentView", "../collections/HoroscopeCollection", "../views/Talent9GridsChartView",
    // 能力素质相关
    "../collections/CompetencyCollection", "../views/CompetencyScoresView", "../views/CompetencySpiderChartView", "../models/Q360Model",
    // 工资相关
    "../collections/PayrollCollection", "../views/PayrollListView", "../views/PayrollDetailView",
    // 个人档案
    "../views/MyProfileView",
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
    "./colltaskRouter",
    "./collprojectRouter",
    "./assessmentRouter",
    "./myteamRouter",
    //其他jquery插件
    "async", "moment", "sprintf", "highcharts"
  ],
  function($, Backbone, Handlebars, LZString,
    HomeObjectiveView, ObjectiveCollection,
    HomeTaskView, HomeMyTeamView, TaskVCollection,
    TaskModel, TaskCollection, TaskView, TaskDetailView, TaskEditView, TaskForwardView, TaskForwardSelectPeoplePanelView,
    PeopleModel, PeopleCollection, ContactListView, ContactDetailView,
    TalentCollection, MyTeamTalentView, HoroscopeCollection, Talent9GridsChartView,
    CompetencyCollection, CompetencyScoresView, CompetencySpiderChartView, Q360Model,
    PayrollCollection, PayrollListView, PayrollDetailView,
    MyProfileView,
    ScoringFormulaCollection, GradeGroupCollection,
    PeopleSelectView,
    // PISelectView,
    UploadPicView,
    CommentAddView,
    CollTaskRouter,
    CollProjectRouter,
    AssessmentRouter,
    MyTeamRouter,
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
        // Tells Backbone to start watching for hashchange events
        Backbone.history.start();
      },

      // Backbone.js Routes
      routes: {

        //首页
        "": "home",
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
        // 能力测评明细
        "competency_scores/:cid": "competency_scores",
        "competency_spider_chart/:people_id/:qi_id": "competency_spider_chart",
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
      // ------工资相关------ //
      salary_list: function() {
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
        var login_people = $("#login_people").val();
        this.myProfileView.model = this.c_people.get(login_people);
        this.myProfileView.render(this.c_competency.get(login_people), this.c_talent.get(login_people));
        $("body").pagecontainer("change", "#myprofile_basic", {
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
        this.peopleSelectView.render(mode);
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
        $("#fullscreen-overlay").on('click', function(event) {
          event.preventDefault();
          var $this = $(this);
          $this.fadeOut('fast', function() {
            $this.empty();
          });
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
        var roles = ['无', '决策者', '影响者', '参与者', '支持者', '中立者', '反对者', '合作伙伴', '供应商', '客户'];
        _.each(roles, function(x) {
          ret.push('<option value="' + x + '" ' + ((x == role) ? 'selected' : '') + '>');
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
    })();

    // Returns the Router class
    return MainRouter;

  });