// ====================
define(["jquery", "backbone", "handlebars", "lzstring",
    "../collections/NotepadCollection",
    "../models/NotepadModel",
    "../views/notepad/NotepadList",
    "../views/notepad/NotepadEdit",

], function($, Backbone, Handlebars, LZString,
    NotepadCollection,
    NotepadModel,
    NotepadListView,
    NotepadEditView
) {
    var NotepadRouter = Backbone.Router.extend({
        initialize: function() {
            var self = this;

            self.init_data();
            self.init_models();
            self.init_collections();
            self.init_views();

            console.info('app message: notepad router initialized');
        },
        routes: {
            "np_list": "np_list",
            "np_view/:np_id": "np_form",
        },


        np_list: function() {
            var self = this;

            $("body").pagecontainer("change", "#np_view_list", {
                reverse: false,
                changeHash: false,
            });

            $.mobile.loading("show");
            self.npListView.pre_render();
            self.nps.fetch().done(function() {
                self.npListView.people = $('#login_people').val();
                self.npListView.people_name = $('#login_people_name').val();
                self.npListView.collection = self.nps;
                self.npListView.render();
                $.mobile.loading("hide");
            })
        },
        np_form: function(np_id) {
            var self = this;

            $("body").pagecontainer("change", "#np_edit_list", {
                reverse: false,
                changeHash: false,
            });
            $.mobile.loading("show");
            self.npEditView.pre_render();
            self.npEditView.people = $('#login_people').val();

            self.np.id = np_id;
            self.np.fetch().done(function() {
                self.npEditView.nps = self.nps;
                self.npEditView.peoples = self.peoples;
                self.npEditView.model = self.np;
                self.npEditView.render();

                $.mobile.loading("hide");
            })
        },
        init_views: function() {
            var self = this;

            this.npListView = new NotepadListView({
                el: "#np_list-content",
                collection: self.nps,
            });
            this.npEditView = new NotepadEditView({
                el: "#np_edit_list-content",
                model: self.np,
            });

        },
        init_models: function() {
            this.np = new NotepadModel();
        },
        init_collections: function() {
            this.nps = new NotepadCollection();
        },
        init_data: function() {
            var self = this;
            $.get('/admin/im/get_peoples/' + self.people, function(peoples) {
                self.peoples = peoples
            })
        }
    });

    return NotepadRouter;
})