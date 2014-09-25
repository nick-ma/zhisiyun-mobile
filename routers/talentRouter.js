// talent router
// ====================

define(["jquery", "backbone", "handlebars", "lzstring", "async",
        "../views/talent/TalentDevelopeListView",
        "../views/talent/TalentWfSuperiorTwitterView",
        "../views/talent/TalentPeopleSelectView",
        "../views/talent/SuperiorTwitterFormView",
        "../views/talent/SuperiorTwitterForm2View",
        "../collections/DevelopePlanCollection",
        "../collections/DevelopeDirectCollection",
        "../collections/DevelopeTypeCollection",
        "../collections/SuperiorTwitterCollection",
        "../collections/PeopleCollection",
        "../models/DevelopePlanModel",
        "../models/DevelopeDirectModel",
        "../models/DevelopeTypeModel",
        "../models/SuperiorTwitterModel"


    ],
    function($, Backbone, Handlebars, LZString, async,
        DevelopePlanListView, //我的培养计划
        TalentWfSuperiorTwitterView, //人才提名流程
        TalentPeopleSelectView, //人才选择界面
        SuperiorTwitterFormView, //人才提名流程表单
        SuperiorTwitterForm2View, //人才提名流程表单
        DevelopePlanCollection,
        DevelopeDirectCollection,
        DevelopeTypeCollection,
        SuperiorTwitterCollection,
        PeopleCollection,
        DevelopePlanModel,
        DevelopeDirectModel,
        DevelopeTypeModel,
        SuperiorTwitterModel
    ) {

        var TalentRouter = Backbone.Router.extend({
            initialize: function() {
                var self = this;
                self.init_models();
                self.init_collections();
                self.init_views();
                self.init_data();
                // self.bind_events();
                console.info('app message: TALENT router initialized');
            },
            routes: {
                "plan_list": "plan_list",
                "twitter_list": "twitter_list",
                "talent_twitter_people": "talent_twitter_people",
                "godo10/:op_id/:type": "go_do10",
                "godo10_view/:pi_id": "go_do10_view", //市区公干流程查看

            },
            plan_list: function() { //我的培养计划列表
                var self = this;
                $("body").pagecontainer("change", "#talent_develope_list", {
                    reverse: false,
                    changeHash: false,
                });
                $.mobile.loading("show");
                self.DevelopePlanListView.pre_render();
                var people = $("#login_people").val();
                self.DevelopePlanListView.people = people;
                self.ddCollection.fetch();
                self.dtCollection.fetch();
                self.DevelopePlanListView.direct = self.ddCollection.models;
                self.DevelopePlanListView.type = self.dtCollection.models;

                async.parallel({
                    status: function(cb) {
                        $.get('/admin/pm/talent_develope/people', function(data) {
                            if (data) {
                                self.DevelopePlanListView.people_data = data.data;
                                self.DevelopePlanListView.status_data = data.status;
                            }
                            cb(null, 'OK')
                        })
                    },

                }, function(err, result) {
                    self.DevelopePlanListView.collection.url = '/admin/pm/talent_develope/plan?people_id=' + people;
                    self.DevelopePlanListView.collection.fetch().done(function() {
                        self.DevelopePlanListView.render();
                        $.mobile.loading("hide");

                    })
                })

            },
            twitter_list: function() { //我的人才提名历史数据
                var self = this;
                $("body").pagecontainer("change", "#superior_twitter_list", {
                    reverse: false,
                    changeHash: false,
                });
                $.mobile.loading("show");
                self.SuperiorTwitterListView.pre_render();
                var people = $("#login_people").val();
                self.SuperiorTwitterListView.people = people;
                self.ddCollection.fetch();
                self.SuperiorTwitterListView.direct = self.ddCollection.models;
                // self.SuperiorTwitterListView.collection.url = '/admin/pm/talent_wf/superior4m?people=' + people;
                self.SuperiorTwitterListView.collection.fetch().done(function() {
                    self.SuperiorTwitterListView.render();
                    $.mobile.loading("hide");

                })

            },
            talent_twitter_people: function() {
                var self = this;
                self.peopleSelectView.people = $("#login_people").val();
                $("body").pagecontainer("change", "#talent_people_select", {
                    reverse: false,
                    changeHash: false,
                });
                self.peopleSelectView.render();
            },
            go_do10: function(op_id, type, mode) {
                var self = this;
                var ti_id = op_id.split("-")[0];
                var pd_id = op_id.split("-")[1];
                var pd_code = op_id.split("-")[2];
                $("body").pagecontainer("change", "#superior_twitter_form", {
                    reverse: false,
                    changeHash: false,
                });
                $.mobile.loading("show");
                self.SuperiorTwitterFormView.pre_render();
                var people = $("#login_people").val();
                self.ddCollection.fetch();
                self.SuperiorTwitterFormView.direct = self.ddCollection.models;
                self.SuperiorTwitterFormView.model = self.stModel;
                async.parallel({
                    data1: function(cb) {
                        $.get('/admin/pm/talent_wf/edit_m/' + ti_id, function(data) {
                            if (data) {
                                self.SuperiorTwitterFormView.wf_data = data;
                                if (data.task_state != 'FINISHED') {
                                    self.SuperiorTwitterFormView.people = data.twitter.superior._id;
                                    self.SuperiorTwitterFormView.collection.url = '/admin/pm/talent_wf/superior/' + data.ti.process_instance.collection_id;
                                    self.SuperiorTwitterFormView.collection.fetch().done(function() {
                                        cb(null, self.SuperiorTwitterFormView.wf_data)

                                    })
                                } else {
                                    cb(null, null)
                                }

                            } else {
                                cb(null, null);
                            }
                        })
                    }
                }, function(err, ret) {
                    if (self.SuperiorTwitterFormView.wf_data.task_state == 'FINISHED') {
                        window.location = '/m#godo10_view/' + self.SuperiorTwitterFormView.wf_data.process_instance
                    } else {
                        var is_self = self.SuperiorTwitterFormView.people == String($("#login_people").val());
                        if (is_self) {
                            self.SuperiorTwitterFormView.view_mode = '';

                        } else {
                            self.SuperiorTwitterFormView.view_mode = 'deal_with';

                        }
                        self.SuperiorTwitterFormView.is_self = is_self;
                        self.SuperiorTwitterFormView.render();
                        if (!is_self) {
                            $("#superior_twitter_form select").attr("disabled", true);
                        }
                        $.mobile.loading("hide");


                    }
                })

            },
            go_do10_view: function(pi_id) {
                var self = this;
                $("body").pagecontainer("change", "#superior_twitter_form2", {
                    reverse: false,
                    changeHash: false,
                });
                $.mobile.loading("show");
                self.SuperiorTwitterForm2View.pre_render();
                self.ddCollection.fetch();
                self.SuperiorTwitterForm2View.direct = self.ddCollection.models;
                self.SuperiorTwitterForm2View.model = self.stModel;
                async.parallel({
                    data1: function(cb) {
                        $.get('/admin/pm/talent_wf/view_m/' + pi_id, function(data) {
                            if (data) {
                                self.SuperiorTwitterForm2View.wf_data = data;
                                self.SuperiorTwitterForm2View.collection.url = '/admin/pm/talent_wf/superior/' + data.pi.collection_id;
                                self.SuperiorTwitterForm2View.collection.fetch().done(function() {
                                    cb(null, data)
                                })
                            } else {
                                cb(null, null);
                            }
                        })
                    }
                }, function(err, ret) {
                    self.SuperiorTwitterForm2View.render();
                    $("#superior_twitter_form_title2").html("人才提名流程查看")
                    $("#superior_twitter_form2 select").attr("disabled", true);
                    $.mobile.loading("hide");


                })
            },
            init_views: function() {
                var self = this;
                self.DevelopePlanListView = new DevelopePlanListView({
                    el: "#talent_develope_list-content",
                    collection: self.dpCollection
                });
                self.SuperiorTwitterListView = new TalentWfSuperiorTwitterView({
                    el: "#personal_superior_twitter-content",
                    collection: self.stCollection
                });
                this.peopleSelectView = new TalentPeopleSelectView({
                    el: "#talent_people_select-content",
                    collection: self.c_people,
                });
                this.SuperiorTwitterFormView = new SuperiorTwitterFormView({
                    el: "#superior_twitter_form-content",
                    collection: self.stModel,
                });
                this.SuperiorTwitterForm2View = new SuperiorTwitterForm2View({
                    el: "#superior_twitter_form2-content",
                    collection: self.stModel,
                })

            },
            init_models: function() {
                var self = this;
                self.dpModel = new DevelopePlanModel();
                self.ddModel = new DevelopeDirectModel();
                self.dtModel = new DevelopeTypeModel();
                self.stModel = new SuperiorTwitterModel();
                this.c_people = new PeopleCollection();

            },
            init_collections: function() {
                var self = this;
                self.dpCollection = new DevelopePlanCollection();
                self.ddCollection = new DevelopeDirectCollection();
                self.dtCollection = new DevelopeTypeCollection();
                self.stCollection = new SuperiorTwitterCollection();

            },
            init_data: function() { //初始化的时候，先从local storage里面恢复数据，如果localstorage里面没有，则去服务器fetch
                var self = this;
                self.load_data(self.c_people, 'people');
            },
            load_data: function(col_obj, col_name) { //加载数据
                $.mobile.loading("show");
                var login_people = $("#login_people").val();
                var cn = col_name
                var local_data = JSON.parse(LZString.decompressFromUTF16(localStorage.getItem(cn)) || null)
                    // var local_data = localStorage.getItem(cn);
                if (local_data) {
                    col_obj.reset(local_data);
                    col_obj.trigger('sync');
                    $.mobile.loading("hide");
                } else {
                    col_obj.fetch().done(function() {
                        localStorage.setItem(cn, LZString.compressToUTF16(JSON.stringify(col_obj)));
                        $.mobile.loading("hide");
                    })
                };
            },
        });

        return TalentRouter;
    })