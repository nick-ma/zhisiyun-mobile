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
        CountNumberDefineFormView //报数定义表单编辑
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
                "count_number_define/:_id": "count_number_define", //报数列表

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

            count_number_define: function(_id) { //报数定义
                var self = this;
                $("body").pagecontainer("change", "#my_count_number_define", {
                    reverse: false,
                    changeHash: false,
                });
                $.mobile.loading("show");
                self.CountNumberDefineFormView.pre_render();
                var people = $("#login_people").val();
                self.CountNumberDefineFormView.people = people;
                async.series({
                    cni: function(cb) {
                        self.cnitemCollection.fetch().done(function() {
                            cb(null, self)
                        });
                    },
                    c_people:function(cb){
                        self.c_people.fetch().done(function() {
                            cb(null, self)
                        }); 
                    }
                }, function(err, data) {
                    self.CountNumberDefineFormView.item_data = self.cnitemCollection.models; //保护项目数据
                    self.CountNumberDefineFormView.c_people = self.c_people.models; //保护项目数据

                    self.CountNumberDefineFormView.collection.url = '/admin/pm/count_number_define/bb/' + _id;
                    self.CountNumberDefineFormView.collection.fetch().done(function() {
                        console.log(self.CountNumberDefineFormView.collection);
                        self.CountNumberDefineFormView.render();
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


            },
            init_models: function() {
                var self = this;
                self.cndModel = new CountNumberDefineModel(); //报数定义
                self.cniModel = new CountNumberInstanceModel(); //报数实例
                self.cnitemModel = new CountNumberInstanceModel(); //报数项目


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