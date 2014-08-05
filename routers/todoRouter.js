// todo router
// ====================

define(["jquery", "backbone", "handlebars", "lzstring",
        "../views/ToDoListView", "../views/AIWF01View", "../views/TransConfirmView",
        "../collections/ToDoListCollection",
        "../models/WFDataModel", "../models/AIModel", "../models/TeamModel", "../models/AIDatasModel"
    ],
    function($, Backbone, Handlebars, LZString,
        ToDoListView, AIWF01View, TransConfirmView,
        ToDoListCollection,
        WFDataModel, AIModel, TeamModel, AIDatasModel
    ) {

        var ToDoRouter = Backbone.Router.extend({
            initialize: function() {
                var self = this;
                self.init_models();
                self.init_collections();
                self.init_views();
                self.init_data();
                // self.bind_events();
                console.info('app message: todo router initialized');
                // Backbone.history.start();
            },
            routes: {
                //我的待办
                "todo": "todo_list",
                "godo1/:op_id/:type": "go_do",
            },
            todo_list: function() { //我的待办
                var self = this;
                // if (self.todoListView.collection.length) {
                //     self.todoListView.render();
                // } else {
                self.todoListView.collection.fetch().done(function() {
                    self.todoListView.render();
                })
                // }
                $("body").pagecontainer("change", "#todo_list", {
                    reverse: false,
                    changeHash: false,
                });
            },
            go_do: function(op_id, type) {
                var self = this;
                var ti_id = op_id.split("-")[0];
                var pd_id = op_id.split("-")[1];
                var pd_code = op_id.split("-")[2];

                self.wf_data.id = ti_id;
                self.wf_data.fetch().done(function(data) {
                    self.ai.id = data.ti.process_instance.collection_id;
                    self.ai.fetch().done(function(data1) {
                        self.team_data.id = self.ai.attributes.people;
                        self.team_data.fetch().done(function(data2) {
                            self.ai_datas.url = '/admin/pm/assessment_instance/get_assessment_instance_json?ai_id=' + self.ai.attributes._id;
                            self.ai_datas.fetch().done(function(data2) {
                                self.wf01View.wf_data = self.wf_data;
                                self.wf01View.ai = self.ai;
                                self.wf01View.team_data = self.team_data;
                                self.wf01View.ai_datas = self.ai_datas;
                                self.wf01View.render();
                                
                                $("body").pagecontainer("change", "#ai_wf", {
                                    reverse: false,
                                    changeHash: false,
                                });
                            })
                        })
                    });
                });
            },
            init_views: function() {
                var self = this;
                this.todoListView = new ToDoListView({
                    el: "#todo_list",
                    collection: self.todoList
                })

                this.wf01View = new AIWF01View({
                    el: "#ai_wf",
                })

                this.transConfirmView = new TransConfirmView({
                    el: "#trans_confirm",
                })
            },
            init_models: function() {
                var self = this;
                self.wf_data = new WFDataModel();
                self.ai = new AIModel();
                self.team_data = new TeamModel();
                self.ai_datas = new AIDatasModel();
            },
            init_collections: function() {
                var self = this;
                self.todoList = new ToDoListCollection();
            },
            init_data: function() {
                // var self = this;
                this.todoList.fetch();
            },
        });

        return ToDoRouter;
    })