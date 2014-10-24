// todo router
// ====================

define(["jquery", "backbone", "handlebars", "lzstring", "async",
        "../views/WorkReportListView", "../views/WorkReportDetailView",
        "../collections/WorkReportCollection",
        "../models/WorkReportModel",
        "../collections/PeopleCollection"
    ],
    function($, Backbone, Handlebars, LZString, async,
        WorkReportListView, WorkReportDetailView,
        WorkReportCollection,
        WorkReportModel,
        PeopleCollection
    ) {

        var WorkReportRouter = Backbone.Router.extend({
            initialize: function() {
                var self = this;
                self.init_models();
                self.init_collections();
                self.init_views();
                // self.bind_events();
                console.info('app message: workreport router initialized');
            },
            routes: {
                //我的报告列表
                "wrlist": "wrlist",
                "wrlist/:people_id": "wrlist",
                "wrdetail/:wr_id": "wrdetail",
            },
            wrlist: function(people_id) { //我的报告列表
                localStorage.setItem('wr_detail_back_url', window.location.href);
                var self = this;
                $("body").pagecontainer("change", "#wr_list", {
                    reverse: false,
                    changeHash: false,
                });
                $.mobile.loading("show");
                self.wrListView.pre_render();

                var p_id = people_id ? people_id : $('#login_people').val();
                self.wrListView.people_id = $('#login_people').val();
                self.wrListView.collection.url = '/admin/pm/work_report/bb?people_id=' + p_id;
                self.wrListView.collection.fetch().done(function() {
                    $.mobile.loading("hide");
                    self.wrListView.render();

                })

            },
            wrdetail: function(wr_id) {
                var self = this;
                $("body").pagecontainer("change", "#wr_detail", {
                    reverse: false,
                    changeHash: false,
                });


                $.mobile.loading("show");
                self.wrDetailView.pre_render();
                self.c_people.fetch().done(function() {
                    self.wrDetailView.model.id = wr_id;
                    self.wrDetailView.peoples = self.c_people.toJSON();
                    self.wrDetailView.model.fetch().done(function() {
                        $.mobile.loading("hide");
                        self.wrDetailView.render();

                    })
                })

            },
            init_views: function() {
                var self = this;
                self.wrListView = new WorkReportListView({
                    el: "#wr_list-content",
                    collection: self.wrList
                });


                self.wrDetailView = new WorkReportDetailView({
                    el: "#wr_detail-content",
                    model: self.wr
                });
            },
            init_models: function() {
                var self = this;
                self.wr = new WorkReportModel();
            },
            init_collections: function() {
                var self = this;
                self.wrList = new WorkReportCollection();
                self.c_people = new PeopleCollection(); //人员
            },
        });

        return WorkReportRouter;
    })