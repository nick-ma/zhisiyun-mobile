// Mobile Router
// =============

// Includes file dependencies
define(["jquery", "backbone", "handlebars",
    //首页
    "../views/HomeObjectiveView", "../collections/ObjectiveCollection",
    "../views/HomeAssessmentView", "../collections/AssessmentCollection",
    "../views/HomeTaskView", "../views/HomeMyTeamView",
    //工作日历相关
    "../models/TaskModel", "../collections/TaskCollection", "../views/TaskView", "../views/TaskDetailView", "../views/TaskEditView",
    //人员和组织相关
    "../models/PeopleModel", "../collections/PeopleCollection", "../views/ContactListView", "../views/ContactDetailView",
    //绩效考核合同相关
    "../views/AssessmentDetailView",
    //其他jquery插件
    "async", "moment", "sprintf",
  ],
  function($, Backbone, Handlebars,
    HomeObjectiveView, ObjectiveCollection,
    HomeAssessmentView, AssessmentCollection,
    HomeTaskView, HomeMyTeamView,
    TaskModel, TaskCollection, TaskView, TaskDetailView, TaskEditView,
    PeopleModel, PeopleCollection, ContactListView, ContactDetailView,
    AssessmentDetailView,
    async

  ) {
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
    Handlebars.registerHelper('fromNow', function(data) {
      return moment(data).fromNow();
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

    // Extends Backbone.Router
    var MainRouter = Backbone.Router.extend({

      // The Router constructor
      initialize: function() {
        var self = this;
        //init collections
        this.c_objectives = new ObjectiveCollection(); //目标计划
        this.c_assessment = new AssessmentCollection(); //考核计划
        this.c_task = new TaskCollection(); //工作任务
        this.c_people = new PeopleCollection(); //人员



        //init views
        this.homeObjectiveView = new HomeObjectiveView({
          el: "#home-objective-list",
          collection: self.c_objectives
        });
        this.homeAssessmentView = new HomeAssessmentView({
          el: "#home-assessment-list",
          collection: self.c_assessment
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

        this.init_data();
        // Tells Backbone to start watching for hashchange events
        Backbone.history.start();

      },

      // Backbone.js Routes
      routes: {

        //首页
        "": "home",
        // 绩效合同相关页面
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

        // 更多功能的导航页面
        "more_functions": "more_functions",
        "more_functions/refresh_local_storage": "refresh_local_storage",
        "more_functions/clear_local_storage": "clear_local_storage",
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
          localStorage.setItem('task_' + login_people, JSON.stringify(self.c_task))
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
          transition: "slide",
        });
      },
      contact_detail: function(people_id) { //企业通讯录，单人详情
        this.contactDetaillView.model = this.c_people.get(people_id);
        this.contactDetaillView.render();
        $.mobile.changePage("#contact_detail", {
          reverse: false,
          changeHash: false,
          transition: "slide",
        });
      },
      refresh_local_storage: function() {
        var self = this;
        var login_people = $("#login_people").val();
        //刷新登录用户
        var login_peoples = JSON.parse(localStorage.getItem('login_people')) || [];
        var found = _.find(login_peoples, function(x) {
          return x._id == $("#login_people").val();
        })
        if (!found) {
          login_peoples.push({
            _id: $("#login_people").val()
          });
        }
        localStorage.setItem('login_people', JSON.stringify(login_peoples));
        $.mobile.loading("show");
        async.parallel({
          objective: function(cb) {
            // 刷新目标计划数据
            self.c_objectives.fetch().done(function() {
              localStorage.setItem('objectives_' + login_people, JSON.stringify(self.c_objectives))
              cb(null, 'OK');
            });
          },
          assessment: function(cb) {
            // 刷新考核数据
            self.c_assessment.fetch().done(function() {
              localStorage.setItem('assessment_' + login_people, JSON.stringify(self.c_assessment))
              cb(null, 'OK');
            })
          },
          task: function(cb) {
            // 刷新日历数据
            self.c_task.fetch().done(function() {
              localStorage.setItem('task_' + login_people, JSON.stringify(self.c_task))
              cb(null, 'OK');
            })
          },
          people: function(cb) {
            // 刷新通讯录数据
            self.c_people.fetch().done(function() {
              localStorage.setItem('people_' + login_people, JSON.stringify(self.c_people))
              cb(null, 'OK');
            })
          }
        }, function(err, result) {
          $.mobile.loading("hide");
          alert('同步完成');
        })
      },
      clear_local_storage: function() {
        if (confirm('此操作将清空所有本地缓存数据，为了提高访问速度，建议保留缓存数据。\n如需要刷新缓存数据，请使用“同步数据”功能。')) {
          localStorage.clear();
          alert('缓存清空完成')
        };
      },
      init_data: function() { //初始化的时候，先从local storage里面恢复数据，如果localstorage里面没有，则去服务器fetch
        var self = this;
        self.load_data(self.c_people, 'people');
        self.load_data(self.c_objectives, 'objectives');
        self.load_data(self.c_assessment, 'assessment');
        self.load_data(self.c_task, 'task');

      },
      load_data: function(col_obj, col_name) { //加载数据
        $.mobile.loading("show");
        var login_people = $("#login_people").val();
        var local_data = localStorage.getItem(col_name + '_' + login_people);
        if (local_data && local_data != 'undefined') {
          var local_tmp = JSON.parse(local_data);
          _.each(local_tmp, function(x) {
            col_obj.add(x);
          })
          col_obj.trigger('sync');
          $.mobile.loading("hide");
        } else {
          col_obj.fetch().done(function() {
            localStorage.setItem(col_name + '_' + login_people, JSON.stringify(col_obj))
            $.mobile.loading("hide");
          })
        };
      }
    });

    // Returns the Router class
    return MainRouter;

  });