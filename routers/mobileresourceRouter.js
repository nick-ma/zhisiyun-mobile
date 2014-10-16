// myteam router
// ====================
define(["jquery", "backbone", "handlebars", "lzstring",
    "../collections/MobileResourceCollection",
    // "../collections/BackLeaveOfAbsenceCollection",
    "../models/MobileResourceModel",
    "../views/mobile_resource/CalendarList",
    "../views/mobile_resource/DetailList",
    "../views/mobile_resource/CreateList",
], function($, Backbone, Handlebars, LZString,
    MobileResourceCollection,
    // BackLeaveOfAbsenceCollection,
    MobileResourceModel,
    CalendarView,
    DetailView,
    CreateList
) {
    var mobileRouter = Backbone.Router.extend({
        initialize: function() {
            var self = this;
            self.init_models();
            self.init_collections();
            // self.data_collections = [];
            self.init_views();
            self.init_data();
            // self.bind_events();
            console.info('app message: mobileRouter recommand router initialized');
            // Backbone.history.start();
        },
        routes: {
            // 假期
            "mobile_resource": "mobile_resource",
            "mobile_resource/refresh": "mobile_resource_refresh",
            "mobile_resource/cm": "mobile_resource_cm",
            "mobile_resource/cd": "mobile_resource_cd",

            "mobile_resource/:mr_id": "mobile_resource_detail",
            // "#task_edit/new": "calendar_add",
            "mobile_resource_create": "mobile_resource_create",
        },


        mobile_resource: function() {
            var self = this;
            $("body").pagecontainer("change", "#mobile_resource_list", {
                reverse: false,
                changeHash: false,
            });

            var self = this;
            self.calendarView.render(); //先用当前的数据做一次render
            window.setTimeout(function() { //1秒后再刷一次
                $.mobile.loading("show");
                self.mobileResources.fetch().done(function() {
                    var login_people = $("#login_people").val();
                    localStorage.setItem('mobileResources', LZString.compressToUTF16(JSON.stringify(self.mobileResources)))
                    self.calendarView.render();
                    $.mobile.loading("hide");
                })
            }, 1000);
        },
        mobile_resource_refresh: function() { //刷新任务数据
            $.mobile.loading("show");
            var self = this;
            self.mobileResources.fetch().done(function() {
                var login_people = $("#login_people").val();
                localStorage.setItem('mobileResources', LZString.compressToUTF16(JSON.stringify(self.mobileResources)))
                $.mobile.loading("hide");
            })
        },
        mobile_resource_cm: function() { //转到当前月
            $("#mobile_resource_cal").trigger('refresh', [new Date(), true]);
        },
        mobile_resource_cd: function() { //转到当天
            $("#mobile_resource_cal").trigger('refresh', [new Date()]);
        },
        mobile_resource_detail: function(mr_id) { //查看任务详情
            var self = this;
            $("body").pagecontainer("change", "#mobile_resource_detail", {
                reverse: false,
                changeHash: false,
            });
            localStorage.setItem('mobile_resource_detail_back_url', window.location.href);

            $.mobile.loading("show");
            var login_people = $("#login_people").val();
            if (self.mobileResources.get(mr_id)) {
                self.detailView.model = self.mobileResources.get(mr_id);
                self.detailView.model.fetch().done(function() {
                    self.detailView.login_people = login_people;
                    self.detailView.mrs = self.mrs
                    self.detailView.peoples = self.peoples

                    self.detailView.render();

                    $.mobile.loading("hide");
                })
            } else {
                var tmp = new TaskModel({
                    _id: mr_id
                });
                tmp.fetch().done(function() {

                    self.mobileResources.set(tmp); //放到collection里面
                    self.detailView.model = tmp;
                    self.detailView.render();
                    $.mobile.loading("hide");
                }).fail(function() { //针对手机app版
                    // console.log('message fail');
                    $.mobile.loading("hide");
                    alert('该记录已被删除')
                    window.location.href = "#"
                })
            };

        },
        mobile_resource_create: function() { //编辑任务详情
            var self = this;
            $("body").pagecontainer("change", "#mobile_resource_create", {
                reverse: false,
                changeHash: false,
            });
            var createList = this.createList;
            var new_task_date = $("#mobile_resource_cal a.ui-btn-active").data('date') || new Date();
            var new_task = this.mobileResources.add({
                // 'title': '新建任务',
                'start': moment(new_task_date).format('YYYY-MM-DD') + ' ' + '09:00',
                'end': moment(new_task_date).format('YYYY-MM-DD') + ' ' + '18:00',
                'allDay': false,
                'people': $("#login_people").val(),
                // 'is_complete': false,
                // 'startEditable': true,
                // 'durationEditable': true,
                // 'editable': true,
                // 'has_alarms': false,
            });
            // new_task.save().done(function() {
            createList.peoples = self.peoples
            createList.lists = self.mobileResources.toJSON();
            createList.mrs = self.mrs
            createList.model = new_task;
            createList.render();
            // })


            //把 a 换成 span， 避免点那个滑块的时候页面跳走。
            // $(".ui-flipswitch a").each(function() {
            //     $(this).replaceWith("<span class='" + $(this).attr('class') + "'></span>");
            // });
        },
        init_data: function() { //初始化的时候，先从local storage里面恢复数据，如果localstorage里面没有，则去服务器fetch
            var self = this;
            self.load_data(self.mobileResources, 'mobileResources');
            $.get('/admin/pm/mobile_resource/bb', function(data) {
                // console.log(data)
                self.mrs = data
            })

            $.get('/admin/im/get_peoples/' + $("#login_people").val(), function(peoples) {
                console.log(peoples)
                self.peoples = peoples
            })
            // self.load_data(self.c_objectives, 'objectives');
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

        init_views: function() {
            var self = this;
            this.calendarView = new CalendarView({
                el: "#leave_list-content",
                collection: self.mobileResources,
            });
            this.detailView = new DetailView({
                el: "#leave_list-content",
                model: self.mobileResource,
            });

            this.createList = new CreateList({
                el: "#leave_list-content",
                // model: self.mobileResource,
            });

        },
        init_models: function() {
            this.mobileResource = new MobileResourceModel();
            // this.backLeaveOfAbsence = new BackLeaveOfAbsenceModel();
        },
        init_collections: function() {
            this.mobileResources = new MobileResourceCollection(); //请假数据
            // this.backLeaveOfAbsences = new BackLeaveOfAbsenceCollection() //消假数据

        }


    });

    return mobileRouter;
})