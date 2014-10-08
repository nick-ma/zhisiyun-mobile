// todo router
// ====================

define(["jquery", "backbone", "handlebars", "lzstring", "async",
        "../collections/Questionnair360Collection",
        "../collections/QuestionnairManageCollection",
        "../collections/PeopleCompetencyScoreCollection",
        "../collections/MBTIQuestionInstanceCollection",
        "../collections/EGQuestionInstanceCollection",
        "../collections/QICharacterCollection",
        "../models/PeopleCompetencyScoreModel",
        "../models/QuestionnairInstanceModel",
        "../models/MBTIQuestionInstanceModel",
        "../models/EGQuestionInstanceModel",
        "../views/quesetionnaire/EditGradeList",
        "../views/quesetionnaire/EditGradeCommonList",
        "../views/quesetionnaire/EditGradeManageList",
        "../views/quesetionnaire/EditGradeMBTIList",
        "../views/quesetionnaire/EditGradeEGList",
        "../views/quesetionnaire/QISubListView"

    ],
    function($, Backbone, Handlebars, LZString, async,
        Questionnair360Collection,
        QuestionnairManageCollection,
        PeopleCompetencyScoreCollection,
        MBTIQuestionInstanceCollection,
        EGQuestionInstanceCollection,
        QICharacterCollection,
        PeopleCompetencyScoreModel,
        QuestionnairInstanceModel,
        MBTIQuestionInstanceModel,
        EGQuestionInstanceModel,
        EditGradeList,
        EditGradeCommonList,
        EditGradeManageList,
        EditGradeMBTIList,
        EditGradeEGList,
        QISubListView
    ) {

        var QuesetionnaireRouter = Backbone.Router.extend({
            initialize: function() {
                var self = this;
                self.init_my_data();
                self.init_models();
                self.init_collections();
                self.init_views();
                self.init_my_data();
                // self.bind_events();
                console.log('message: Questionnair360 router initialized');
                // Backbone.history.start();
            },
            routes: {
                "godo/:qi_id/:type": "quesetionnaire_list",
                "qt_manage": "qt_manage",
                "qi_sub/:people_id": "qi_sub",
                // "my_qt_dateil/qt_id": "my_qt_dateil",
            },
            quesetionnaire_list: function(qi_id, type) { //我的待办
                var self = this;
                if (type == '2') {

                    $("body").pagecontainer("change", "#quesetionnaire_list", {
                        reverse: false,
                        changeHash: false,
                    });

                    $.mobile.loading("show");
                    self.editGradeList.pre_render();

                    self.questionnair360s.qi_id = qi_id;
                    self.questionnair360s.fetch().done(function() {
                        self.peopleCompetencyScores.fetch().done(function() {
                            self.editGradeList.peopleCompetencyScores = self.peopleCompetencyScores;
                            self.editGradeList.peopleCompetencyScore = self.peopleCompetencyScore;
                            self.editGradeList.render();
                            $.mobile.loading("hide");
                        })
                    })

                } else if (type == '3') {

                    $("body").pagecontainer("change", "#quesetionnaire_common_list", {
                        reverse: false,
                        changeHash: false,
                    });
                    $.mobile.loading("show");
                    self.editGradeCommonList.pre_render();



                    self.questionnairInstance.id = qi_id.split('-')[0];
                    self.questionnairInstance.fetch().done(function() {
                        self.editGradeCommonList.render();
                        $.mobile.loading("hide");
                        // $("body").pagecontainer("change", "#quesetionnaire_common_list", {
                        //     reverse: false,
                        //     changeHash: false,
                        // });
                    })
                } else if (type == '4') {

                    $("body").pagecontainer("change", "#quesetionnaire_nbti_list", {
                        reverse: false,
                        changeHash: false,
                    });
                    $.mobile.loading("show");
                    self.editGradeMBTIList.pre_render();



                    self.MBTIQuestionInstance.id = qi_id;
                    self.MBTIQuestionInstance.fetch().done(function() {
                        self.MBTIQuestionInstances.fetch().done(function() {
                            self.editGradeMBTIList.collection = self.MBTIQuestionInstances;
                            self.editGradeMBTIList.render();

                            $.mobile.loading("hide");
                            // $("body").pagecontainer("change", "#quesetionnaire_nbti_list", {
                            //     reverse: false,
                            //     changeHash: false,
                            // });
                        })

                    })
                } else if (type == '5') {

                    $("body").pagecontainer("change", "#quesetionnaire_eg_list", {
                        reverse: false,
                        changeHash: false,
                    });
                    $.mobile.loading("show");
                    self.editGradeEGList.pre_render();


                    self.EGQuestionInstance.id = qi_id;
                    self.EGQuestionInstance.fetch().done(function() {
                        self.EGQuestionInstances.fetch().done(function() {
                            self.editGradeEGList.collection = self.EGQuestionInstances;
                            self.editGradeEGList.render();
                            $.mobile.loading("hide");
                            // $("body").pagecontainer("change", "#quesetionnaire_eg_list", {
                            //     reverse: false,
                            //     changeHash: false,
                            // });
                        })

                    })
                }

            },
            qt_manage: function() {
                localStorage.setItem('quesetionnaire_list_back_url', window.location.href);
                var self = this;
                $("body").pagecontainer("change", "#quesetionnaire_manage_list", {
                    reverse: false,
                    changeHash: false,
                });
                $.mobile.loading("show");
                self.editGradeManageList.pre_render();

                self.questionnairManages.pp_id = $("#login_people").val();
                self.questionnairManages.fetch().done(function() {
                    // self.editGradeManageList.my_question = self.my_question;
                    self.editGradeManageList.render();
                    $.mobile.loading("hide");
                    // $("body").pagecontainer("change", "#quesetionnaire_manage_list", {
                    //     reverse: false,
                    //     changeHash: false,
                    // });
                })

            },
            qi_sub: function(people_id) {
                localStorage.setItem('quesetionnaire_list_back_url', window.location.href);
                var self = this;
                $("body").pagecontainer("change", "#qi_sub_list", {
                    reverse: false,
                    changeHash: false,
                });
                $.mobile.loading("show");
                self.qiSubListView.people_id = people_id;
                self.qiSubListView.pre_render();

                self.qiCharacters.pp_id = people_id;
                self.qiCharacters.fetch().done(function() {
                    self.qiSubListView.render();
                    $.mobile.loading("hide");
                })

            },
            // my_qt_dateil: function(qt_id) {

            // },
            init_views: function() {
                var self = this;
                this.editGradeList = new EditGradeList({
                    el: "#quesetionnaire_list",
                    collection: self.questionnair360s,
                })
                this.editGradeCommonList = new EditGradeCommonList({
                    el: "#quesetionnaire_common_list",
                    model: self.questionnairInstance,
                })
                this.editGradeManageList = new EditGradeManageList({
                    el: "#quesetionnaire_common_list",
                    collection: self.questionnairManages,
                })
                this.editGradeMBTIList = new EditGradeMBTIList({
                    el: "#quesetionnaire_nbti_list",
                    model: self.MBTIQuestionInstance,
                })
                this.editGradeEGList = new EditGradeEGList({
                    el: "#quesetionnaire_eg_list",
                    model: self.EGQuestionInstance,
                })
                this.qiSubListView = new QISubListView({
                    el: "#qi_sub_list",
                    collection: self.qiCharacters,
                })
            },
            init_models: function() {
                var self = this;
                self.questionnairInstance = new QuestionnairInstanceModel();
                self.peopleCompetencyScore = new PeopleCompetencyScoreModel();
                self.MBTIQuestionInstance = new MBTIQuestionInstanceModel();
                self.EGQuestionInstance = new EGQuestionInstanceModel()
            },
            init_collections: function() {
                var self = this;
                self.questionnair360s = new Questionnair360Collection();
                self.questionnairManages = new QuestionnairManageCollection();
                self.peopleCompetencyScores = new PeopleCompetencyScoreCollection();
                self.MBTIQuestionInstances = new MBTIQuestionInstanceCollection();
                self.EGQuestionInstances = new EGQuestionInstanceCollection();
                self.qiCharacters = new QICharacterCollection();
            },
            init_my_data: function() {
                var self = this;
                // $.get("/admin/pm/questionnair_template/get_my_qis_report_json", function(data) {
                //     self.my_question = _.clone(data);
                // })

            }
        });

        return QuesetionnaireRouter;
    })