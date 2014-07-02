// coll task router
// ====================

define(["jquery", "backbone", "handlebars", "lzstring",
        // 协作任务
        "../models/CollProjectModel",
        "../collections/CollProjectCollection",
        "../views/CollProjectEditContactView",
        "../views/CollProjectEditExtendView",
        // "../views/CollProjectEditView",
        // 协作项目－配套协作任务的
        "../views/CollProjectListView", "../views/CollProjectListViewAll", "../views/CollProjectEditView", "../views/CollProjectDetailView",
    ],
    function($, Backbone, Handlebars, LZString,
        CollProjectModel,
        CollProjectCollection,
        CollProjectEditContactView,
        CollProjectEditExtendView,
        // CollTaskListView, CollTaskDetailView, CollTaskEditView,
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
                "collproject_edit/:cp_id/basic": "collproject_edit_basic",
                "collproject_edit/:cp_id/extend": "collproject_edit_extend",
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
                self.collProjectDetailView.cp_types = self.cp_types;
                self.collProjectDetailView.cpfd = self.cpfd;
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
            collproject_edit_basic: function(cp_id) {
                var self = this;
                self.collProjectEditView.cp_types = self.cp_types;
                self.collProjectEditView.model = self.c_collproject.get(cp_id);

                self.collProjectEditView.render();
                $("body").pagecontainer("change", "#collproject_edit", {
                    reverse: false,
                    changeHash: false,
                });

            },
            collproject_edit_extend: function(cp_id) {
                var self = this;
                self.collProjectEditExtendView.cp_types = self.cp_types;
                self.collProjectEditExtendView.cpfd = self.cpfd;
                self.collProjectEditExtendView.model = self.c_collproject.get(cp_id);

                self.collProjectEditExtendView.render();
                $("body").pagecontainer("change", "#collproject_edit_extend", {
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