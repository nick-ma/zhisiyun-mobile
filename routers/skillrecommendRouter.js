// myteam router
// ====================
define(["jquery", "backbone", "handlebars", "lzstring",
    "../collections/SkillRecommendCollection",
    // "../views/skill_recommend/ListEmpSkills",
    "../views/skill_recommend/ListMySkills",

], function($, Backbone, Handlebars, LZString,
    SkillRecommendCollection,
    // EmpSkillsListView,
    MySkillsListView


) {
    var SkillRecommendRouter = Backbone.Router.extend({
        initialize: function() {
            var self = this;
            // self.init_models();
            self.init_collections();
            self.init_views();
            // self.init_config_data();
            this.init_data();
            // self.bind_events();
            console.log('message: collproject router initialized');
            // Backbone.history.start();
        },
        routes: {
            // 协作项目
            "my_skills": "my_skills",
            // "collproject_detail/:cp_id": "collproject_detail",
            // "colltask_edit/:ct_id": "colltask_edit",
            // "colltask_edit/:ct_id(/:p_task)": "colltask_edit",
            // 协作任务的项目
            // "collproject_edit/add": "collproject_add",
            // "collproject_edit/:cp_id/basic": "collproject_edit_basic",
            // "collproject_edit/:cp_id/extend": "collproject_edit_extend",
            // "collproject_edit/:cp_id/contact/:index": "collproject_edit_contact",
        },

        //--------我的技能--------//
        my_skills: function() {
            var login_people = $("#login_people").val();
            this.mySkillsListView.model = this.skillrecommends.get(login_people);
            this.mySkillsListView.render();
            $("body").pagecontainer("change", "#my_skills", {
                reverse: false,
                changeHash: false,
            });
        },

        //
        init_views: function() {
            var self = this;
            this.mySkillsListView = new MySkillsListView({
                el: "#my_skills-content",
            })
        },
        init_models: function() {

        },
        init_collections: function() {
            console.log('++++++++++');
            this.skillrecommends = new SkillRecommendCollection(); //所有人
        },
        init_data: function() { //初始化的时候，先从local storage里面恢复数据，如果localstorage里面没有，则去服务器fetch
            var self = this;
            self.load_data(self.skillrecommends, 'skillrecommends');
            // self.load_data(self.c_objectives, 'objectives');

        },
        load_data: function(col_obj, col_name) { //加载数据
            $.mobile.loading("show");
            var login_people = $("#login_people").val();
            var cn = col_name + '_' + login_people
            console.log(cn);

            var local_data = JSON.parse(LZString.decompressFromUTF16(localStorage.getItem(cn)) || null)
                // var local_data = localStorage.getItem(cn);
            console.log(local_data);
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
        // bind_events: function() {

        // },
        // init_config_data: function() {
        //     var self = this;
        //     $.get("/admin/pm/coll_project_type/bb", function(data) {
        //         self.cp_types = _.clone(data);
        //     })
        //     $.get("/admin/pm/coll_project_field/bb/getdata", function(data) {
        //         self.cpfd = _.clone(data);
        //     })
        // }
    });

    return SkillRecommendRouter;
})