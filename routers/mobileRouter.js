// Mobile Router
// =============

// Includes file dependencies
define(["jquery", "backbone", "handlebars",
    //首页
    "../views/HomeObjectiveView", "../collections/ObjectiveCollection",
    "../views/HomeAssessmentView", "../collections/AssessmentCollection",
    "../views/HomeTaskView",
    //工作日历相关
    "../models/TaskModel", "../collections/TaskCollection", "../views/TaskView", "../views/TaskDetailView", "../views/TaskEditView",
    //人员和组织相关

    //其他jquery插件
    "moment", "sprintf",
  ],
  function($, Backbone, Handlebars,
    HomeObjectiveView, ObjectiveCollection,
    HomeAssessmentView, AssessmentCollection,
    HomeTaskView,
    TaskModel, TaskCollection, TaskView, TaskDetailView, TaskEditView

  ) {
    //注册handlebars的helper
    Handlebars.registerHelper('sprintf', function(sf, data) {
      return sprintf(sf, data);
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
    Handlebars.registerHelper('toISODateRange', function(start, end) {
      var s = moment(start);
      var e = moment(end);
      if (s.format('YYYY-MM-DD') == e.format('YYYY-MM-DD')) {
        return s.format('YYYY-MM-DD HH:mm') + '&rarr;' + e.format('HH:mm');
      } else {
        return s.format('YYYY-MM-DD HH:mm') + '&rarr;' + e.format('YYYY-MM-DD HH:mm');
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

        this.taskView = new TaskView({
          el: "#task",
          collection: self.c_task
        });

        this.taskEditView = new TaskEditView({
          el: "#task_edit",
          // model: new TaskCollection()
        });
        // this.taskEditView.bind_events();
        this.taskDetailView = new TaskDetailView({
          el: "#task_detail",
          // model: new TaskCollection()
        });
        // this.taskDetailView.bind_events();

        // Tells Backbone to start watching for hashchange events
        Backbone.history.start();

      },

      // Backbone.js Routes
      routes: {

        // When there is no hash bang on the url, the home method is called
        "": "home",

        "assessment_detail/:ai_id/:lx/:pi/:ol": "assessment_detail",
        // When #category? is on the url, the category method is called

        "task": "task",
        "task/:task_id": "task_detail",
        "task_edit/:task_id": "task_edit",

      },

      // Home method
      home: function() { //首页

        if (!this.c_assessment.length) { //lazy load 绩效合同
          $.mobile.loading("show");
          this.c_assessment.fetch().done(function() {
            $.mobile.loading("hide");
          })
        };
        if (!this.c_task.length) { //lazy load 工作任务
          $.mobile.loading("show");
          this.c_task.fetch().done(function() {
            $.mobile.loading("hide");
          })
        };
        $.mobile.changePage("#home", {
          reverse: false,
          changeHash: false,
          transition: "flip",
        });
      },

      task: function() { //任务日历
        $.mobile.changePage("#task", {
          reverse: false,
          changeHash: false,
          transition: "flip",
        });
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
          var new_task = this.c_task.add({
            'title': '新建任务',
            'start': new Date(),
            'end': new Date(),
            'allDay': true,
            'is_complete': false,
          });
          // new_task.save().done(function() {
          taskEditView.model = new_task;
          taskEditView.render();
          // })
        } else {
          taskEditView.model = this.c_task.get(task_id);;
          taskEditView.render();
        };

        $.mobile.changePage("#task_edit", {
          reverse: false,
          changeHash: false,
          transition: "slide",
        });
        //把 a 换成 span， 避免点那个滑块的时候页面跳走。
        $(".ui-flipswitch a").each(function() {
          $(this).replaceWith("<span class='" + $(this).attr('class') + "'></span>")
        })
      },
      assessment_detail: function(ai_id, lx, pi, ol) { //绩效合同－单条指标的查看界面
        console.log(ai_id, lx, pi, ol);

      },


    });

    // Returns the Router class
    return MainRouter;

  });