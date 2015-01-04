// CountNumber router
// ====================

define(["jquery", "backbone", "handlebars", "lzstring", "async",
        "../collections/CountNumberDefineCollection", //报数定义
        "../collections/CountNumberInstanceCollection", //报数实例
        "../collections/PeopleCollection",
        "../collections/CountNumberItemCollection", //报数项目
        "../models/CountNumberDefineModel",
        "../models/CountNumberInstanceModel",
        "../models/CountNumberItemModel", //报数项目
        "../views/count_number/CountNumberDefineListView",
        "../views/count_number/CountNumberDefineFormView", //报数表单编辑
        "../views/count_number/CountNumberCommitFormView", //报数提交
        "../views/count_number/CountNumberReportFormView", //报数提交
        "../views/count_number/CountNumberTeamReportFormView", //团队报表
    ],
    function($, Backbone, Handlebars, LZString, async,
        CountNumberDefineCollection, //报数定义
        CountNumberInstanceCollection, //报数实例
        PeopleCollection,
        CountNumberItemCollection,
        CountNumberDefineModel, //报数定义
        CountNumberInstanceModel, //报数实例
        CountNumberItemModel, //报数项目
        CountNumberDefineListView, //报数定义
        CountNumberDefineFormView, //报数定义表单编辑
        CountNumberCommitFormView,
        CountNumberReportFormView, //个人历史报数
        CountNumberTeamReportFormView //团队报数
    ) {

        var CountNumberRouter = Backbone.Router.extend({
            initialize: function() {
                var self = this;
                self.init_models();
                self.init_collections();
                self.init_views();
                self.init_data();
                // self.bind_events();
                console.info('app message: CountNumber router initialized');
            },
            routes: {
                "count_number_list": "count_number_list", //报数列表
                "count_number_define/:_id/:ui_select": "count_number_define", //报数列表
                "count_number_commit/:_id": "count_number_commit", //报数提交
                "count_number_report/:report_type/:_id": "count_number_report", //个人历史报数
                "count_number_report_all": "count_number_report_all", //报数报表

            },
            count_number_list: function() { //我的报数列表
                var self = this;
                $("body").pagecontainer("change", "#my_count_number", {
                    reverse: false,
                    changeHash: false,
                });
                $.mobile.loading("show");
                self.CountNumberDefineListView.pre_render();
                var people = $("#login_people").val();
                self.CountNumberDefineListView.people = people;
                async.series({
                    cni: function(cb) {
                        self.cniCollection.fetch().done(function() {
                            cb(null, self)
                        });
                    },
                }, function(err, data) {
                    self.CountNumberDefineListView.instance_data = self.cniCollection.models; //人员数据
                    self.CountNumberDefineListView.collection.fetch().done(function() {
                        self.CountNumberDefineListView.render();
                        $.mobile.loading("hide");
                    });
                })



            },

            count_number_define: function(_id, ui_select) { //报数定义
                var self = this;
                $("body").pagecontainer("change", "#my_count_number_define", {
                    reverse: false,
                    changeHash: false,
                });
                $.mobile.loading("show");
                self.CountNumberDefineFormView.pre_render();
                var people = $("#login_people").val();
                self.CountNumberDefineFormView.people = people;
                self.CountNumberDefineFormView.ui_select = ui_select;
                async.series({
                    cni: function(cb) {
                        self.cnitemCollection.fetch().done(function() {
                            cb(null, self)
                        });
                    },
                    c_people: function(cb) {
                        self.c_people.fetch().done(function() {
                            cb(null, self)
                        });
                    }
                }, function(err, data) {
                    self.CountNumberDefineFormView.item_data = self.cnitemCollection.models; //保护项目数据
                    self.CountNumberDefineFormView.c_people = self.c_people.models; //保护项目数据

                    self.CountNumberDefineFormView.collection.url = '/admin/pm/count_number_define/bb/' + _id;
                    self.CountNumberDefineFormView.collection.fetch().done(function() {
                        self.CountNumberDefineFormView.render();
                        $.mobile.loading("hide");
                        //把 a 换成 span， 避免点那个滑块的时候页面跳走。
                        $(".ui-flipswitch a").each(function() {
                            $(this).replaceWith("<span class='" + $(this).attr('class') + "'></span>");
                        });
                    });
                })



            },
            count_number_commit: function(_id) { //报数提交
                var self = this;
                $("body").pagecontainer("change", "#my_count_number_instance", {
                    reverse: false,
                    changeHash: false,
                });
                $.mobile.loading("show");
                self.CountNumberCommitFormView.pre_render();
                var people = $("#login_people").val();
                self.CountNumberCommitFormView.people = people;
                async.series({
                    cni: function(cb) {
                        self.cnitemCollection.fetch().done(function() {
                            cb(null, self)
                        });
                    },
                    cnd: function(cb) {
                        self.cndCollection.fetch().done(function() {
                            cb(null, self)
                        });
                    },
                }, function(err, data) {
                    self.CountNumberCommitFormView.item_data = self.cnitemCollection.models; //保护项目数据
                    self.CountNumberCommitFormView.define_data = self.cndCollection.models; //保护项目数据
                    self.CountNumberCommitFormView.collection.url = '/admin/pm/count_number_instance/bb/' + _id + '?type=mobile';
                    self.CountNumberCommitFormView.collection.fetch().done(function() {
                        self.CountNumberCommitFormView.render();
                        $.mobile.loading("hide");
                        //把 a 换成 span， 避免点那个滑块的时候页面跳走。
                        $(".ui-flipswitch a").each(function() {
                            $(this).replaceWith("<span class='" + $(this).attr('class') + "'></span>");
                        });
                    });
                })

            },
            count_number_report: function(report_type, _id) { //报数提交
                var self = this;
                $("body").pagecontainer("change", "#my_count_number_report", {
                    reverse: false,
                    changeHash: false,
                });
                $.mobile.loading("show");
                self.CountNumberReportFormView.pre_render();
                var people = $("#login_people").val();
                self.CountNumberReportFormView.people = people;
                async.series({
                    cnd: function(cb) {
                        self.cndCollection.fetch().done(function() {
                            cb(null, self)
                        });
                    },
                }, function(err, data) {
                    self.CountNumberReportFormView.define_data = self.cndCollection.models; //保护项目数据
                    self.CountNumberReportFormView.collection.url = '/admin/pm/count_number_instance/bb/' + _id + '?type=mobile';
                    self.CountNumberReportFormView.collection.fetch().done(function() {
                        self.CountNumberReportFormView.render();
                        $.mobile.loading("hide");
                        //把 a 换成 span， 避免点那个滑块的时候页面跳走。
                        $(".ui-flipswitch a").each(function() {
                            $(this).replaceWith("<span class='" + $(this).attr('class') + "'></span>");
                        });
                    });
                })

            },
            count_number_report_all: function() { //报数报表
                var self = this;
                $("body").pagecontainer("change", "#myteam_count_number_report", {
                    reverse: false,
                    changeHash: false,
                });
                $.mobile.loading("show");
                self.CountNumberTeamReportFormView.pre_render();
                var people = $("#login_people").val();
                self.CountNumberTeamReportFormView.people = people;
                async.series({
                    cnd: function(cb) {
                        self.cniCollection.fetch().done(function() {
                            cb(null, self)
                        });
                    },
                }, function(err, data) {
                    self.CountNumberTeamReportFormView.instance_data = self.cniCollection.models; //报数实例数据
                    self.CountNumberTeamReportFormView.collection.url = '/admin/pm/count_number_define/bb';
                    self.CountNumberTeamReportFormView.collection.fetch().done(function() {
                        self.CountNumberTeamReportFormView.render();
                        $.mobile.loading("hide");
                        //把 a 换成 span， 避免点那个滑块的时候页面跳走。
                        $(".ui-flipswitch a").each(function() {
                            $(this).replaceWith("<span class='" + $(this).attr('class') + "'></span>");
                        });
                    });
                })

            },

            init_views: function() {
                var self = this;
                self.CountNumberDefineListView = new CountNumberDefineListView({ //报数定义
                    el: "#my_count_number-content",
                    collection: self.cndCollection
                });
                self.CountNumberDefineFormView = new CountNumberDefineFormView({ //报数定义表单编辑
                    el: "#my_count_number_define-content",
                    collection: self.cndCollection
                });
                self.CountNumberCommitFormView = new CountNumberCommitFormView({ //报数定义表单编辑
                    el: "#my_count_number_instance-content",
                    collection: self.cniCollection
                });
                self.CountNumberReportFormView = new CountNumberReportFormView({ //报数定义表单编辑
                    el: "#my_report_list_container-content",
                    collection: self.cniCollection
                });
                self.CountNumberTeamReportFormView = new CountNumberTeamReportFormView({ //报数报表
                    el: "#myteam_count_number_report-content",
                    collection: self.cndCollection
                });

            },
            init_models: function() {
                var self = this;
                self.cndModel = new CountNumberDefineModel(); //报数定义
                self.cniModel = new CountNumberInstanceModel(); //报数实例
                self.cnitemModel = new CountNumberItemModel(); //报数项目


            },
            init_collections: function() {
                var self = this;
                self.cndCollection = new CountNumberDefineCollection(); //报数定义
                self.cniCollection = new CountNumberInstanceCollection(); //报数实例
                self.cnitemCollection = new CountNumberItemCollection(); //报数项目
                this.c_people = new PeopleCollection();

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

        return CountNumberRouter;
    })