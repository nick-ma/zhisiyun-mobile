// todo router
// ====================

define(["jquery", "backbone", "handlebars", "lzstring", "async",
        "../views/ToDoListView", "../views/AIWF01View", "../views/AIWF02View", "../views/AIWF03View", "../views/TransConfirmView",
        "../collections/ToDoListCollection",
        "../models/WFDataModel", "../models/AIModel", "../models/TeamModel", "../models/AIDatasModel", "../models/DataCollectionModel"
    ],
    function($, Backbone, Handlebars, LZString, async,
        ToDoListView, AIWF01View, AIWF02View, AIWF03View, TransConfirmView,
        ToDoListCollection,
        WFDataModel, AIModel, TeamModel, AIDatasModel, DataCollectionModel
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
                "godo1/:op_id/:type": "go_do1",
                "godo2/:op_id/:type": "go_do2",
                "godo3/:op_id/:type": "go_do3",
            },
            todo_list: function() { //我的待办
                var self = this;
                localStorage.setItem('view_mode_state', '1');
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
            go_do1: function(op_id, type) {
                var self = this;
                self.view_mode_state = localStorage.getItem('view_mode_state') || null;
                localStorage.removeItem('view_mode_state'); //用完删掉 
                var ti_id = op_id.split("-")[0];
                var pd_id = op_id.split("-")[1];
                var pd_code = op_id.split("-")[2];

                self.wf_data.id = ti_id;
                self.wf_data.fetch().done(function(data) {
                    self.ai.id = data.ti.process_instance.collection_id;
                    self.ai.fetch().done(function(data1) {
                        self.team_data.id = self.ai.attributes.people;
                        self.team_data.fetch().done(function(data2) {
                            self.ai_datas.url = '/admin/pm/assessment_instance/get_assessment_instance_json_4m';
                            self.ai_datas.fetch().done(function(data2) {
                                self.wf01View.wf_data = self.wf_data;
                                self.wf01View.ai = self.ai;
                                self.wf01View.team_data = self.team_data;
                                self.wf01View.ai_datas = self.ai_datas;
                                if (self.view_mode_state) {
                                    self.wf01View.view_mode = '';
                                }
                                self.wf01View.render();

                                $("body").pagecontainer("change", "#ai_wf", {
                                    reverse: false,
                                    changeHash: false,
                                });
                            })
                        })
                    });
                });

                // async.waterfall([

                //     function(cb) {
                //         self.wf_data.id = ti_id;
                //         self.wf_data.fetch(function(){
                //             cb(null,self.wf_data);
                //         });
                //     },
                //     function(wf_data, cb) {
                //         self.ai.id = wf_data.ti.process_instance.collection_id;
                //         self.ai.fetch().done(function(){
                //             cb(null,self.ai);
                //         });
                //     },
                //     function(ai, cb) {
                //         self.team_data.id = ai.people;
                //         self.team_data.fetch().done(function(){
                //             cb(null,self.team_data);
                //         });
                //     },
                //     function(data, cb) {
                //         self.ai_datas.url = '/admin/pm/assessment_instance/get_assessment_instance_json_4m';
                //         self.ai_datas.fetch().done(cb);
                //     },
                // ], function(err, ret) {
                //     self.wf01View.wf_data = self.wf_data;
                //     self.wf01View.ai = self.ai;
                //     self.wf01View.team_data = self.team_data;
                //     self.wf01View.ai_datas = self.ai_datas;
                //     if (self.view_mode_state) {
                //         self.wf01View.view_mode = '';
                //     }
                //     self.wf01View.render();

                //     $("body").pagecontainer("change", "#ai_wf", {
                //         reverse: false,
                //         changeHash: false,
                //     });
                // });
            },
            go_do2: function(op_id, type) {
                var self = this;
                self.view_mode_state = localStorage.getItem('view_mode_state') || null;
                localStorage.removeItem('view_mode_state'); //用完删掉 
                var ti_id = op_id.split("-")[0];
                var pd_id = op_id.split("-")[1];
                var pd_code = op_id.split("-")[2];

                self.wf_data.id = ti_id;
                self.wf_data.fetch().done(function(data) {
                    self.dc.id = data.ti.process_instance.collection_id;
                    self.dc.fetch().done(function(data1) {
                        self.wf02View.wf_data = self.wf_data;
                        self.wf02View.dc = self.dc;
                        if (self.view_mode_state) {
                            self.wf02View.view_mode = '';
                        }
                        self.wf02View.render();

                        $("body").pagecontainer("change", "#dc_wf", {
                            reverse: false,
                            changeHash: false,
                        });
                    });
                });
            },
            go_do3: function(op_id, type) {
                var self = this;
                self.view_mode_state = localStorage.getItem('view_mode_state') || null;
                localStorage.removeItem('view_mode_state'); //用完删掉 
                var ti_id = op_id.split("-")[0];
                var pd_id = op_id.split("-")[1];
                var pd_code = op_id.split("-")[2];

                self.wf_data.id = ti_id;
                self.wf_data.fetch().done(function(data) {
                    self.ai.id = data.ti.process_instance.collection_id;
                    self.ai.fetch().done(function(data1) {
                        self.team_data.id = self.ai.attributes.people;
                        self.team_data.fetch().done(function(data2) {
                            self.ai_datas.url = '/admin/pm/assessment_instance/get_assessment_instance_json_4m';
                            self.ai_datas.fetch().done(function(data2) {
                                self.wf03View.wf_data = self.wf_data;
                                self.wf03View.ai = self.ai;
                                self.wf03View.team_data = self.team_data;
                                self.wf03View.ai_datas = self.ai_datas;
                                if (self.view_mode_state) {
                                    self.wf03View.view_mode = '';
                                }
                                self.wf03View.render();

                                $("body").pagecontainer("change", "#ai_wf1", {
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

                this.wf02View = new AIWF02View({
                    el: "#dc_wf",
                })

                this.wf03View = new AIWF03View({
                    el: "#ai_wf1",
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
                self.dc = new DataCollectionModel();
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