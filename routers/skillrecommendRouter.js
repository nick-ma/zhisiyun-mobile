// myteam router
// ====================
define(["jquery", "backbone", "handlebars", "lzstring",
    "../collections/SkillRecommendCollection",
    "../collections/SkillCollection",
    "../views/skill_recommend/ListEmpSkills",
    "../views/skill_recommend/ListMySkills",
    "../views/skill_recommend/SingleSkillDetail",
    "../views/skill_recommend/AllSkillsDetail",
    "../views/skill_recommend/AllSkillsAcceptDetail",
    "../views/skill_recommend/ListPeopleSearch",
    "../views/skill_recommend/ListSkillConfig",
    "../views/skill_recommend/AllSkillsBank",
    "../models/SkillRecommendModel",
], function($, Backbone, Handlebars, LZString,
    SkillRecommendCollection,
    SkillCollection,
    EmpSkillsListView,
    MySkillsListView,
    SingleSkillDetailView,
    AllSkillsDetailView,
    AllSkillsAcceptDetailView,
    ListPeopleSearchView,
    ListSkillConfigView,
    AllSkillsBankView,
    SkillRecommendModel
) {
    var SkillRecommendRouter = Backbone.Router.extend({
        initialize: function() {
            var self = this;
            self.init_models();
            self.init_collections();
            // self.data_collections = [];
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
            "show_skill/:people_id/:skill_id": "show_skill",
            "show_all_skills/:people_id": "show_all_skills",
            "show_people_skill/:people_id": "show_people_skill",
            "people_search": "people_search",
            "skill_config": "skill_config",
            "show_skills_bank": "show_skills_bank",
            "save_skill/:people_id/:skill_id": "save_skill",
            "skill_recommend/:people_id": "skill_recommend",
        },

        //--------我的技能--------//
        my_skills: function() {
            var self = this
            var login_people = $("#login_people").val();
            this.skillrecommend.url = '/admin/pm/skill/my_mobile_bb/' + login_people;
            this.skillrecommend.fetch().done(function() {
                self.skillrecommends.remove(self.skillrecommend);
                self.skillrecommends.push(self.skillrecommend);
                self.mySkillsListView.model = self.skillrecommend;
                self.mySkillsListView.render();
                $("body").pagecontainer("change", "#my_skills", {
                    reverse: false,
                    changeHash: false,
                });
            })
        },
        show_skill: function(people_id, skill_id) {
            this.singleSkillDetailView.model = this.skillrecommends.get(people_id);
            this.singleSkillDetailView.skillrecommends = this.skillrecommends;
            this.singleSkillDetailView.skill_id = skill_id;
            this.singleSkillDetailView.view_mode = 'single_show_skill'; //初始化为点赞明细 
            this.singleSkillDetailView.render();
            $("body").pagecontainer("change", "#show_skill", {
                reverse: false,
                changeHash: false,
            });
        },
        show_all_skills: function(people_id) {
            var login_people = $("#login_people").val();
            if (people_id == login_people) {
                this.allSkillsDetailView.model = this.skillrecommends.get(people_id);
                this.allSkillsDetailView.render();
                $("body").pagecontainer("change", "#show_all_skills", {
                    reverse: false,
                    changeHash: false,
                });
            } else {
                this.allSkillsAcceptDetailView.model = this.skillrecommends.get(people_id);
                this.allSkillsAcceptDetailView.render();
                $("body").pagecontainer("change", "#show_all_skills_accept", {
                    reverse: false,
                    changeHash: false,
                });
            }
        },
        show_people_skill: function(people_id) {
            var self = this;
            var login_people = $("#login_people").val();

            this.skillrecommend.url = '/admin/pm/skill/my_mobile_bb/' + people_id;

            this.skillrecommend.fetch().done(function() {
                self.skillrecommends.remove(self.skillrecommend);
                self.skillrecommends.push(self.skillrecommend);
                if (people_id == login_people) {
                    self.mySkillsListView.model = self.skillrecommends.get(login_people);
                    self.mySkillsListView.render();
                    $("body").pagecontainer("change", "#my_skills", {
                        reverse: false,
                        changeHash: false,
                    });
                } else {
                    self.empSkillsListView.model = self.skillrecommends.get(people_id);
                    self.empSkillsListView.render();
                    $("body").pagecontainer("change", "#show_skill_accept", {
                        reverse: false,
                        changeHash: false,
                    });
                }
            })

        },
        people_search: function() {
            this.listPeopleSearchView.collection = this.skillrecommends;
            this.listPeopleSearchView.render();
            $("body").pagecontainer("change", "#show_peoples_search", {
                reverse: false,
                changeHash: false,
            });
        },
        skill_config: function() {
            var login_people = $("#login_people").val();
            this.listSkillConfigView.type = 'DE';
            this.listSkillConfigView.model = this.skillrecommends.get(login_people);
            this.listSkillConfigView.render();
            $("body").pagecontainer("change", "#show_skill_config", {
                reverse: false,
                changeHash: false,
            });
        },
        show_skills_bank: function() {
            var login_people = $("#login_people").val();
            var people = this.skillrecommends.get(login_people);
            var skills = people.get('my_skills');
            var items = [];
            this.skills.each(function(skill) {
                var f_d = _.find(skills, function(s) {
                    return s.skill._id == skill.get('_id')
                })
                if (!f_d) {
                    items.push({
                        _id: skill.get('_id'),
                        skill_name: skill.get('skill_name')
                    })
                };
            })
            this.allSkillsBankView.collection = items;
            this.allSkillsBankView.render();
            $("body").pagecontainer("change", "#show_skill_config", {
                reverse: false,
                changeHash: false,
            });
        },
        save_skill: function(people_id, skill_id) {
            var login_people = $("#login_people").val();
            var self = this
            var people = this.skillrecommends.get(people_id);
            people.set('skill_id', skill_id)
            people.set('type', 'A')
            people.save().done(function() {
                people.fetch().done(function() {
                    if (login_people == people_id) {
                        self.show_skills_bank()
                    } else {
                        self.skill_recommend(people_id)
                    }
                })
            })
        },
        skill_recommend: function(people_id) {
            var people = this.skillrecommends.get(people_id);
            this.listSkillConfigView.type = 'RE';
            this.listSkillConfigView.model = people;
            var skills = people.get('my_skills');
            var items = [];
            this.skills.each(function(skill) {
                var f_d = _.find(skills, function(s) {
                    return s.skill._id == skill.get('_id')
                })
                if (!f_d) {
                    items.push({
                        _id: skill.get('_id'),
                        skill_name: skill.get('skill_name')
                    })
                };
            })
            this.listSkillConfigView.collection = items;
            this.listSkillConfigView.skills = this.skills;
            this.listSkillConfigView.render();
            $("body").pagecontainer("change", "#show_skill_recommend", {
                reverse: false,
                changeHash: false,
            });
        },
        init_views: function() {
            var self = this;
            this.mySkillsListView = new MySkillsListView({
                el: "#my_skills-content",
            });
            this.singleSkillDetailView = new SingleSkillDetailView({
                el: "#show_skill-content",
            });
            this.allSkillsDetailView = new AllSkillsDetailView({
                el: "#show_all_skills-content",
            });
            this.empSkillsListView = new EmpSkillsListView({
                el: "#show_skill_accept-content",
            });
            this.allSkillsAcceptDetailView = new AllSkillsAcceptDetailView({
                el: "#show_all_skills_accept-content",
            });
            this.listPeopleSearchView = new ListPeopleSearchView({
                el: "#show_all_skills_accept-content",
            });
            this.listSkillConfigView = new ListSkillConfigView({
                el: "#show_skill_config-content",
            });
            this.allSkillsBankView = new AllSkillsBankView({
                el: "#show_skill_config-content",
            });

        },
        init_models: function() {
            this.skillrecommend = new SkillRecommendModel();
        },
        init_collections: function() {
            this.skillrecommends = new SkillRecommendCollection(); //所有人
            this.skills = new SkillCollection(); //所有技能
            this.skillrecommend_datas = new SkillRecommendCollection(); //所有人
        },
        init_data: function() { //初始化的时候，先从local storage里面恢复数据，如果localstorage里面没有，则去服务器fetch
            var self = this;
            // self.skillrecommends.fetch()
            // self.skills.fetch()
            // console.log('=======999999999999');/
            self.load_data(self.skillrecommends, 'skillrecommends');
            self.load_data(self.skills, 'skills');

        },
        load_data: function(col_obj, col_name) { //加载数据
            $.mobile.loading("show");
            var login_people = $("#login_people").val();
            var cn = col_name + '_' + login_people
            var local_data = JSON.parse(LZString.decompressFromUTF16(localStorage.getItem(cn)) || null)
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