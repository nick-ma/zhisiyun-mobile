// coll task router
// ====================

define(["jquery", "backbone", "handlebars", "lzstring", "moment",
        // 协作任务
        "../models/CollTaskModel",
        "../collections/CollProjectCollection", "../collections/CollTaskCollection",
        "../views/coll_task/List", "../views/coll_task/Detail", "../views/coll_task/Edit",
        // 协作项目－配套协作任务的
        "../views/coll_project/List",
    ],
    function($, Backbone, Handlebars, LZString, moment,
        CollTaskModel,
        CollProjectCollection, CollTaskCollection,
        CollTaskListView, CollTaskDetailView, CollTaskEditView,
        CollProjectListView
    ) {

        var CollTaskRouter = Backbone.Router.extend({
            initialize: function() {
                var self = this;
                self.init_models();
                self.init_collections();
                self.init_views();
                self.bind_events();
                console.info('app message: colltask router initialized');
                // Backbone.history.start();
            },
            routes: {
                // 协作任务
                "colltask": "colltask",
                "colltask_detail/:ct_id": "colltask_detail",
                // "colltask_edit/:ct_id": "colltask_edit",
                "colltask_edit/:ct_id(/:p_task)": "colltask_edit",
                // 协作任务的项目
                "collproject/:ct_id/(:cp_id)": "collproject",
                // "collproject_edit/:ct_id(/:p_task)": "collproject_edit",
            },

            //--------协作任务--------//
            colltask: function() {
                // colltasklistView.
                // if (!this.c_colltask.models.length) {
                //     this.c_colltask.fetch();
                // } else {
                //     this.collTaskListView.render();
                // };
                localStorage.setItem('colltask_detail_back_url', window.location.href);
                var self = this;
                $("body").pagecontainer("change", "#colltask", {
                    reverse: false,
                    changeHash: false,
                });
                $.mobile.loading("show");
                self.c_colltask.fetch().done(function() {
                    self.collTaskListView.render();
                    $.mobile.loading("hide");
                })
            },
            colltask_detail: function(ct_id) {
                var self = this;
                $("body").pagecontainer("change", "#colltask_detail", {
                    reverse: false,
                    changeHash: false,
                });
                $.mobile.loading("show");
                self.collTaskDetailView.pre_render();
                if (self.c_colltask.get(ct_id)) {
                    self.collTaskDetailView.model = self.c_colltask.get(ct_id);
                    self.collTaskDetailView.model.fetch().done(function() {
                        self.collTaskDetailView.render();
                        $.mobile.loading("hide");
                    })
                } else {
                    var tmp = new CollTaskModel({
                        _id: ct_id
                    });
                    tmp.fetch().done(function() {
                        console.log('message done');
                        self.c_colltask.set(tmp); //放到collection里面
                        self.collTaskDetailView.model = tmp;
                        self.collTaskDetailView.render();
                        $.mobile.loading("hide");
                    }).fail(function() { //针对手机app版
                        console.log('message fail');
                        $.mobile.loading("hide");
                        alert('任务已被删除')
                        window.location.href = "#"
                    })
                };
            },
            colltask_edit: function(ct_id, p_task) {
                var ct;
                var self = this;
                if (ct_id == 'add') { //新增
                    ct = self.c_colltask.add({
                        task_name: '新建任务',
                        start: new Date(),
                        end: moment().add(3, 'day').toDate(),
                        allday: true,
                        p_task: p_task || null,
                        comments: [],

                    });
                    if (p_task) { //取出上级任务的相关信息
                        var pt = self.c_colltask.get(p_task);
                        // console.log(pt);
                        ct.set('root_task', pt.get('root_task'));
                        ct.set('cp', pt.get('cp'));
                        ct.set('cp_name', pt.get('cp_name'));
                    };
                    //设定上级为默认的观察员-改为服务器端获取
                    // var upper_people = JSON.parse($("#upper_people").val());
                    // if (upper_people) { //有上级的才放进去
                    //     ct.set('ntms', [upper_people]);
                    // };
                    ct.save().done(function() {
                        ct.fetch().done(function() {
                            self.collTaskEditView.model = ct;
                            self.collTaskEditView.render();
                        })
                    })

                } else {
                    ct = self.c_colltask.get(ct_id);
                    if (ct) {
                        self.collTaskEditView.model = ct;
                        self.collTaskEditView.render();

                    } else {
                        ct = new CollTaskModel({
                            _id: ct_id
                        });
                        ct.fetch().done(function() {
                            self.c_colltask.push(ct); //放到collection里面
                            self.collTaskEditView.model = ct;
                            self.collTaskEditView.render();
                        })
                    };
                };
                // console.log(ct_id, p_task, ct);
                $("body").pagecontainer("change", "#colltask_edit", {
                    reverse: false,
                    changeHash: false,
                });
            },
            collproject: function(ct_id, cp_id) {
                // collProjectListView
                var self = this;
                $("body").pagecontainer("change", "#collproject_list", {
                    reverse: false,
                    changeHash: false,
                });
                $.mobile.loading("show");
                self.collProjectListView.collection.fetch().done(function() {
                    self.collProjectListView.render();
                    self.collProjectListView.ct_id = ct_id;
                    self.collProjectListView.ct_model = self.c_colltask.get(ct_id);
                    self.collProjectListView.cp_id = cp_id;
                    $.mobile.loading("hide");
                });
            },
            // collproject_edit: function(cp_id, ct_id) {
            //     var cp;
            //     if (cp_id == 'add') {
            //         cp = this.c_collproject.add({
            //             project_name: ''
            //         });
            //     } else {
            //         cp = this.c_collproject.get(cp_id);
            //     };
            //     this.collProjectEditView.ct_id = ct_id;
            //     this.collProjectEditView.model = cp;
            //     this.collProjectEditView.render();
            //     $("body").pagecontainer("change", "#collproject_edit", {
            //         reverse: false,
            //         changeHash: false,
            //     });
            // },
            //
            init_views: function() {
                var self = this;
                this.collTaskListView = new CollTaskListView({
                    el: "#colltask-content",
                    collection: self.c_colltask
                })
                this.collTaskEditView = new CollTaskEditView({
                    el: "#colltask_edit-content",
                })
                this.collTaskDetailView = new CollTaskDetailView({
                    el: "#colltask_detail-content",
                })
                this.collProjectListView = new CollProjectListView({
                    el: "#collproject_list-content",
                    collection: self.c_collproject
                })
                // this.collProjectEditView = new CollProjectEditView({
                //     el: "#collproject_edit-content",
                // })
            },
            init_models: function() {

            },
            init_collections: function() {
                this.c_colltask = new CollTaskCollection(); //协作任务
                this.c_collproject = new CollProjectCollection(); //协作项目

                // this.c_colltask.on('sync', function(event) { //放到local storage


                // });
            },
            bind_events: function() {

            }
        });

        return CollTaskRouter;
    })