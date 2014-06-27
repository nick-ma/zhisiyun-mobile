// coll task router
// ====================

define(["jquery", "backbone", "handlebars", "lzstring",
        // 协作任务
        "../models/CollProjectModel",
        "../collections/CollProjectCollection",
        "../views/CollProjectEditContactView",
        // "../views/CollProjectEditView",
        // 协作项目－配套协作任务的
        "../views/CollProjectListView", "../views/CollProjectListViewAll", "../views/CollProjectEditView", "../views/CollProjectDetailView",
    ],
    function($, Backbone, Handlebars, LZString,
        CollProjectModel,
        CollProjectCollection,
        CollProjectEditContactView,
        // CollTaskListView, CollTaskDetailView, CollTaskEditView,
        CollProjectListView, CollProjectListViewAll, CollProjectEditView, CollProjectDetailView
    ) {

        var CollProjectRouter = Backbone.Router.extend({
            initialize: function() {
                var self = this;
                // self.init_models();
                self.init_collections();
                self.init_views();
                // self.bind_events();
                console.log('message: collproject router initialized');
                // Backbone.history.start();
            },
            routes: {
                // 协作项目
                "projectlist": "projectlist",
                "collproject_detail/:cp_id": "collproject_detail",
                // "colltask_edit/:ct_id": "colltask_edit",
                // "colltask_edit/:ct_id(/:p_task)": "colltask_edit",
                // 协作任务的项目
                // "collproject/:ct_id/(:cp_id)": "collproject",
                "collproject_edit/:cp_id/contact/:index": "collproject_edit_contact",
            },

            //--------协作任务--------//
            projectlist: function() {
                // colltasklistView.
                if (!this.c_collproject.models.length) {
                    this.c_collproject.fetch();
                };
                $("body").pagecontainer("change", "#collproject", {
                    reverse: false,
                    changeHash: false,
                });
            },
            collproject_detail: function(cp_id) {
                var self = this;
                if (self.c_collproject.get(cp_id)) {
                    self.collProjectDetailView.model = self.c_collproject.get(cp_id);
                    self.collProjectDetailView.render();
                } else {
                    var tmp = new CollProjectModel({
                        _id: cp_id
                    });
                    tmp.fetch().done(function() {
                        self.c_collproject.push(tmp); //放到collection里面
                        self.collProjectDetailView.model = tmp;
                        self.collProjectDetailView.render();
                    })
                };
                $("body").pagecontainer("change", "#collproject_detail", {
                    reverse: false,
                    changeHash: false,
                });
            },
            collproject_edit_contact: function(cp_id, index) {
                var self = this;
                self.collProjectEditContactView.model = self.c_collproject.get(cp_id);
                self.collProjectEditContactView.index = index;
                self.collProjectEditContactView.render();
                $("body").pagecontainer("change", "#collproject_edit_contact", {
                    reverse: false,
                    changeHash: false,
                });
            },
            colltask_edit: function(ct_id, p_task) {
                var ct;
                var self = this;
                if (ct_id == 'add') { //新增
                    ct = self.c_colltask.add({
                        task_name: '',
                        start: new Date(),
                        end: moment().add(3, 'day').toDate(),
                        p_task: p_task || null,
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
                    self.collTaskEditView.model = ct;
                    self.collTaskEditView.render();
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
                this.c_collproject.fetch();
                this.collProjectListView.ct_id = ct_id;
                this.collProjectListView.ct_model = this.c_colltask.get(ct_id);
                this.collProjectListView.cp_id = cp_id;
                $("body").pagecontainer("change", "#collproject_list", {
                    reverse: false,
                    changeHash: false,
                });
            },
            collproject_edit: function(cp_id, ct_id) {
                var cp;
                if (cp_id == 'add') {
                    cp = this.c_collproject.add({
                        project_name: ''
                    });
                } else {
                    cp = this.c_collproject.get(cp_id);
                };
                this.collProjectEditView.ct_id = ct_id;
                this.collProjectEditView.model = cp;
                this.collProjectEditView.render();
                $("body").pagecontainer("change", "#collproject_edit", {
                    reverse: false,
                    changeHash: false,
                });
            },
            //
            init_views: function() {
                var self = this;
                // this.collTaskListView = new CollTaskListView({
                //     el: "#colltask-content",
                //     collection: self.c_colltask
                // })
                // this.collTaskEditView = new CollTaskEditView({
                //     el: "#colltask_edit-content",
                // })
                this.collProjectDetailView = new CollProjectDetailView({
                    el: "#collproject_detail-content",
                })
                // this.collProjectListView = new CollProjectListView({
                //     el: "#collproject_list-content",
                //     collection: self.c_collproject
                // })
                // this.collProjectEditView = new CollProjectEditView({
                //     el: "#collproject_edit-content",
                // })
                this.collProjectListViewAll = new CollProjectListViewAll({
                    el: "#collproject-content",
                    collection: self.c_collproject
                })
                this.collProjectEditContactView = new CollProjectEditContactView({
                    el: "#collproject_edit_contact-content",
                })
            },
            init_models: function() {

            },
            init_collections: function() {
                // this.c_colltask = new CollTaskCollection(); //协作任务
                this.c_collproject = new CollProjectCollection(); //协作项目
            },
            bind_events: function() {

            }
        });

        return CollProjectRouter;
    })