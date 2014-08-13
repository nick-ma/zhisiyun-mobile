// coll task router
// ====================

define(["jquery", "backbone", "handlebars", "lzstring",
        // 协作任务
        "../models/CollProjectModel",
        "../collections/CollProjectCollection",
        // 协作项目－配套协作任务的
        "../views/coll_project/EditContact",
        "../views/coll_project/EditExtend",
        "../views/coll_project/List", "../views/coll_project/ListAll", "../views/coll_project/Edit", "../views/coll_project/Detail",
    ],
    function($, Backbone, Handlebars, LZString,
        CollProjectModel,
        CollProjectCollection,

        CollProjectEditContactView,
        CollProjectEditExtendView,
        CollProjectListView, CollProjectListViewAll, CollProjectEditView, CollProjectDetailView
    ) {

        var CollProjectRouter = Backbone.Router.extend({
            initialize: function() {
                var self = this;
                // self.init_models();

                self.init_collections();

                self.init_views();
                self.init_config_data();
                // self.bind_events();
                console.info('app message: collproject router initialized');
                // Backbone.history.start();
            },
            routes: {
                // 协作项目
                "projectlist": "projectlist",
                "collproject_detail/:cp_id": "collproject_detail",
                // "colltask_edit/:ct_id": "colltask_edit",
                // "colltask_edit/:ct_id(/:p_task)": "colltask_edit",
                // 协作任务的项目
                "collproject_edit/add": "collproject_add",
                "collproject_edit/:cp_id/basic": "collproject_edit_basic",
                "collproject_edit/:cp_id/extend": "collproject_edit_extend",
                "collproject_edit/:cp_id/contact/:index": "collproject_edit_contact",
            },

            //--------协作任务--------//
            projectlist: function() {
                // colltasklistView.
                localStorage.setItem('collproject_detail_back_url', window.location.href);
                var self = this;
                $("body").pagecontainer("change", "#collproject", {
                    reverse: false,
                    changeHash: false,
                });
                $.mobile.loading("show");
                // if (!this.c_collproject.models.length) {
                this.c_collproject.fetch().done(function() {
                    self.collProjectListViewAll.cp_types = self.cp_types;
                    self.collProjectListViewAll.cpfd = self.cpfd;
                    // self.collProjectListViewAll.date_pj_typeset = '0'
                    self.collProjectListViewAll.render()
                    $.mobile.loading("hide");
                });
                // };
            },
            collproject_detail: function(cp_id) {
                var self = this;
                $("body").pagecontainer("change", "#collproject_detail", {
                    reverse: false,
                    changeHash: false,
                });
                $.mobile.loading("show");
                self.collProjectDetailView.cp_types = self.cp_types;
                self.collProjectDetailView.cpfd = self.cpfd;
                if (self.c_collproject.get(cp_id)) {
                    self.collProjectDetailView.model = self.c_collproject.get(cp_id);
                    self.collProjectDetailView.model.fetch().done(function() {
                        self.collProjectDetailView.render();
                        $.mobile.loading("hide");
                    })
                } else {
                    var tmp = new CollProjectModel({
                        _id: cp_id
                    });
                    tmp.fetch().done(function() {
                        self.c_collproject.set(tmp); //放到collection里面
                        self.collProjectDetailView.model = tmp;
                        self.collProjectDetailView.render();
                        $.mobile.loading("hide");
                    }).fail(function() { //针对手机app版
                        console.log('message fail');
                        $.mobile.loading("hide");
                        alert('项目已被删除')
                        window.location.href = "#"
                    })
                };
            },
            collproject_add: function() {
                console.log('message: collpeoject add route');
                var new_cp = this.c_collproject.add({
                    project_name: '新建项目',
                    project_descrpt: '手机端创建',
                    start: new Date(),
                    end: moment().add(10, 'day').toDate(),
                });
                new_cp.save().done(function() {
                    window.location.href = "/m#collproject_edit/" + new_cp.get("_id") + "/basic";
                })
            },
            collproject_edit_basic: function(cp_id) {
                var self = this;
                $("body").pagecontainer("change", "#collproject_edit", {
                    reverse: false,
                    changeHash: false,
                });
                $.mobile.loading("show");
                self.collProjectEditView.cp_types = self.cp_types;
                self.collProjectEditView.model = self.c_collproject.get(cp_id);

                self.collProjectEditView.render();
                $.mobile.loading("hide");
            },
            collproject_edit_extend: function(cp_id) {
                var self = this;
                $("body").pagecontainer("change", "#collproject_edit_extend", {
                    reverse: false,
                    changeHash: false,
                });
                $.mobile.loading("show");
                self.collProjectEditExtendView.cp_types = self.cp_types;
                self.collProjectEditExtendView.cpfd = self.cpfd;
                self.collProjectEditExtendView.model = self.c_collproject.get(cp_id);
                self.collProjectEditExtendView.render();
                $.mobile.loading("hide");
            },
            collproject_edit_contact: function(cp_id, index) {
                var self = this;
                $("body").pagecontainer("change", "#collproject_edit_contact", {
                    reverse: false,
                    changeHash: false,
                });
                $.mobile.loading("show");
                self.collProjectEditContactView.model = self.c_collproject.get(cp_id);
                self.collProjectEditContactView.index = index;
                self.collProjectEditContactView.render();
                $.mobile.loading("hide");
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
                this.collProjectEditView = new CollProjectEditView({
                    el: "#collproject_edit-content",
                })
                this.collProjectEditExtendView = new CollProjectEditExtendView({
                    el: "#collproject_edit_extend-content",
                })
                this.collProjectListViewAll = new CollProjectListViewAll({
                    el: "#collproject-content",
                    collection: self.c_collproject,
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

            },
            init_config_data: function() {
                var self = this;
                $.get("/admin/pm/coll_project_type/bb", function(data) {
                    self.cp_types = _.clone(data);
                })
                $.get("/admin/pm/coll_project_field/bb/getdata", function(data) {
                    self.cpfd = _.clone(data);
                })
            }
        });

        return CollProjectRouter;
    })