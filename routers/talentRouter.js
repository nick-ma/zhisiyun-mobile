// talent router
// ====================

define(["jquery", "backbone", "handlebars", "lzstring", "async",
        "../views/talent/TalentDevelopeListView",
        "../collections/DevelopePlanCollection",
        "../collections/DevelopeDirectCollection",
        "../collections/DevelopeTypeCollection",
        "../models/DevelopePlanModel",
        "../models/DevelopeDirectModel",
        "../models/DevelopeTypeModel"


    ],
    function($, Backbone, Handlebars, LZString, async,
        DevelopePlanListView,
        DevelopePlanCollection,
        DevelopeDirectCollection,
        DevelopeTypeCollection,
        DevelopePlanModel,
        DevelopeDirectModel,
        DevelopeTypeModel
    ) {

        var TalentRouter = Backbone.Router.extend({
            initialize: function() {
                var self = this;
                self.init_models();
                self.init_collections();
                self.init_views();
                // self.bind_events();
                console.info('app message: TALENT router initialized');
            },
            routes: {
                "plan_list": "plan_list",

            },
            plan_list: function(people_id) { //我的报告列表
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
            init_views: function() {
                var self = this;
                self.DevelopePlanListView = new DevelopePlanListView({
                    el: "#talent_develope_list-content",
                    collection: self.dpCollection
                });


            },
            init_models: function() {
                var self = this;
                self.dpModel = new DevelopePlanModel();
                self.ddModel = new DevelopeDirectModel();
                self.dtModel = new DevelopeTypeModel();
            },
            init_collections: function() {
                var self = this;
                self.dpCollection = new DevelopePlanCollection();
                self.ddCollection = new DevelopeDirectCollection();
                self.dtCollection = new DevelopeTypeCollection();

            },
        });

        return TalentRouter;
    })