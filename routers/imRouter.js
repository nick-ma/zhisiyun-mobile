// myteam router
// ====================
define(["jquery", "backbone", "handlebars", "lzstring",
    "../collections/ImCollection",
    "../models/ImModel",
    "../views/im/ImList",
    "../views/im/ImEdit",
    "../views/im/ImCreate",
    //按照新的表结构调整
    "../collections/NotificationCollection",
    "../models/NotificationModel",

], function($, Backbone, Handlebars, LZString,
    ImCollection,
    ImModel,
    ImView,
    ImEditView,
    ImCreateView,
    NotificationCollection,
    NotificationModel
) {
    var ImRouter = Backbone.Router.extend({
        initialize: function() {
            var self = this;
            self.init_models();
            self.init_collections();
            // self.data_collections = [];
            self.init_views();
            self.init_data();
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
                //标记为已读
                var pl = _.find(self.im.get('r_peoples'), function(x) {
                    return x.people.toString() == $('#login_people').val();
                })
                if (pl && !pl.mark_read) {
                    pl.mark_read = true;
                    pl.read_date = new Date();
                    _.each(self.im.get('tasks'), function(x) {
                        x.people = x.people._id ? x.people._id : x.people;
                    })
                    _.each(self.im.get('attachments'), function(x) {
                        x.file = x.file._id ? x.file._id : x.file;
                    })
                    self.im.save().done(function() {
                        self.imEditView.render();
                        $.mobile.loading("hide");
                    })
                } else {
                    self.imEditView.render();
                    $.mobile.loading("hide");
                }
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
                self.imCreateView.model_view = '0';
                self.imCreateView.peoples = self.peoples
                self.imCreateView.peoples2 = self.peoples2
                self.imCreateView.mrs = self.mrs

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
            // this.im = new ImModel();
            this.im = new NotificationModel();
        },
        init_collections: function() {
            // this.ims = new ImCollection(); //请假数据
            this.ims = new NotificationCollection();
        },
        init_data: function() {
            var self = this;
            //公司权限的peoples
            $.get('/admin/im/get_peoples/' + self.people, function(peoples) {
            // $.get('/admin/masterdata/people_contact/get_contacts?people_id=' + $('#login_people').val(), function(peoples) {
                self.peoples = peoples
            })
            //通讯录的peoples
            $.get('/admin/masterdata/people_contact/get_contacts?people_id=' + $('#login_people').val(), function(peoples) {
                self.peoples2 = peoples
            })

            $.get('/admin/pm/mobile_resource/bb?mr_type=M', function(data) {
                self.mrs = data
            })



        }

    });

    return ImRouter;
})