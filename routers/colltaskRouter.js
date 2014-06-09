// coll task router
// ====================

define(["jquery", "backbone", "handlebars", "lzstring",
        // 协作任务
        "../collections/CollProjectCollection", "../collections/CollTaskCollection",
        "../views/CollTaskListView", "../views/CollTaskDetailView", "../views/CollTaskEditView",
        // 协作项目－配套协作任务的
        "../views/CollProjectListView", "../views/CollProjectEditView",
    ],
    function($, Backbone, Handlebars, LZString,
        CollProjectCollection, CollTaskCollection,
        CollTaskListView, CollTaskDetailView, CollTaskEditView,
        CollProjectListView, CollProjectEditView
    ) {

        var CollTaskRouter = Backbone.Router.extend({
            initialize: function() {
                var self = this;
                self.init_models();
                self.init_collections();
                self.init_views();
                self.bind_events();
                console.log('message: colltask router initialized');
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
                "collproject_edit/:ct_id(/:p_task)": "collproject_edit",
            },
            
            //--------协作任务--------//
            colltask: function() {
                // colltasklistView.
                this.c_colltask.fetch();
                $("body").pagecontainer("change", "#colltask", {
                    reverse: false,
                    changeHash: false,
                });
            },
            colltask_detail: function(ct_id) {
                this.collTaskDetailView.model = this.c_colltask.get(ct_id);
                this.collTaskDetailView.render();
                $("body").pagecontainer("change", "#colltask_detail", {
                    reverse: false,
                    changeHash: false,
                });
            },
            colltask_edit: function(ct_id, p_task) {
                var ct;
                if (ct_id == 'add') { //新增
                    ct = this.c_colltask.add({
                        task_name: '',
                        p_task: p_task || null,
                    });
                    if (p_task) { //取出上级任务的相关信息
                        var pt = this.c_colltask.get(p_task);
                        // console.log(pt);
                        ct.set('root_task', pt.get('root_task'));
                        ct.set('cp', pt.get('cp'));
                        ct.set('cp_name', pt.get('cp_name'));
                    };
                    //设定上级为默认的观察员
                    var upper_people = JSON.parse($("#upper_people").val());
                    if (upper_people) { //有上级的才放进去
                        ct.set('ntms', [upper_people]);
                    };
                } else {
                    ct = this.c_colltask.get(ct_id);
                };
                // console.log(ct_id, p_task, ct);
                this.collTaskEditView.model = ct;
                this.collTaskEditView.render();
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
                this.collProjectEditView = new CollProjectEditView({
                    el: "#collproject_edit-content",
                })
            },
            init_models: function() {

            },
            init_collections: function() {
                this.c_colltask = new CollTaskCollection(); //协作任务
                this.c_collproject = new CollProjectCollection(); //协作项目
            },
            bind_events: function() {

            }
        });

        return CollTaskRouter;
    })