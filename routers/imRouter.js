// myteam router
// ====================
define(["jquery", "backbone", "handlebars", "lzstring",
    "../collections/ImCollection",
    "../models/ImModel",
    "../views/im/ImList",
    "../views/im/ImEdit",
    "../views/im/ImCreate",

], function($, Backbone, Handlebars, LZString,
    ImCollection,
    ImModel,
    ImView,
    ImEditView,
    ImCreateView
) {
    var ImRouter = Backbone.Router.extend({
        initialize: function() {
            var self = this;
            self.init_models();
            self.init_collections();
            // self.data_collections = [];
            self.init_views();
            // this.init_data();
            // self.bind_events();
            console.info('app message: im recommand router initialized');
            // Backbone.history.start();
        },
        routes: {
            // 假期
            "im_list": "im_list",
            "im_view_R/:im_id": "im_view",
            "im_view_S/:im_id": "im_form",
        },


        im_list: function() {
            var self = this;
            $("body").pagecontainer("change", "#im_view_list", {
                reverse: false,
                changeHash: false,
            });
            $.mobile.loading("show");
            self.imView.pre_render();
            self.ims.fetch().done(function() {
                self.imView.people = $('#login_people').val();
                self.imView.render();
                $.mobile.loading("hide");
            })
        },
        im_view: function(im_id) {
            var self = this;
            $("body").pagecontainer("change", "#im_edit_list", {
                reverse: false,
                changeHash: false,
            });
            $.mobile.loading("show");
            self.imEditView.pre_render();
            self.im.id = im_id;
            self.im.fetch().done(function() {
                self.imEditView.render();
                $.mobile.loading("hide");
            })
        },
        im_form: function(im_id) {
            var self = this;
            $("body").pagecontainer("change", "#im_create_list", {
                reverse: false,
                changeHash: false,
            });
            $.mobile.loading("show");
            self.imCreateView.pre_render();
            self.imCreateView.people = $('#login_people').val();

            self.im.id = im_id;
            self.im.fetch().done(function() {
                self.imCreateView.render();
                $.mobile.loading("hide");
            })
        },
        init_views: function() {
            var self = this;
            this.imView = new ImView({
                el: "#im_list-content",
                collection: self.ims,
            });
            this.imEditView = new ImEditView({
                el: "#im_edit_list-content",
                model: self.im,
            });
            this.imCreateView = new ImCreateView({
                el: "#im_create_list-content",
                model: self.im,
            });

        },
        init_models: function() {
            this.im = new ImModel();
        },
        init_collections: function() {
            this.ims = new ImCollection(); //请假数据

        }


    });

    return ImRouter;
})