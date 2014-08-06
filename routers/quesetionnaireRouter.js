// todo router
// ====================

define(["jquery", "backbone", "handlebars", "lzstring", "async",
        "../collections/Questionnair360Collection",
        "../collections/QuestionnairManageCollection",
        "../collections/PeopleCompetencyScoreCollection",
        "../collections/MBTIQuestionInstanceCollection",
        "../models/PeopleCompetencyScoreModel",
        "../models/QuestionnairInstanceModel",
        "../models/MBTIQuestionInstanceModel",
        "../views/quesetionnaire/EditGradeList",
        "../views/quesetionnaire/EditGradeCommonList",
        "../views/quesetionnaire/EditGradeManageList",
        "../views/quesetionnaire/EditGradeMBTIList"

    ],
    function($, Backbone, Handlebars, LZString, async,
        Questionnair360Collection,
        QuestionnairManageCollection,
        PeopleCompetencyScoreCollection,
        MBTIQuestionInstanceCollection,
        PeopleCompetencyScoreModel,
        QuestionnairInstanceModel,
        MBTIQuestionInstanceModel,
        EditGradeList,
        EditGradeCommonList,
        EditGradeManageList,
        EditGradeMBTIList

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
                // "my_qt_dateil/qt_id": "my_qt_dateil",
            },
            quesetionnaire_list: function(qi_id, type) { //我的待办
                var self = this;
                if (type == '2') {

                    self.questionnair360s.qi_id = qi_id;
                    self.questionnair360s.fetch().done(function() {
                        self.peopleCompetencyScores.fetch().done(function() {
                            self.editGradeList.peopleCompetencyScores = self.peopleCompetencyScores;
                            self.editGradeList.peopleCompetencyScore = self.peopleCompetencyScore;
                            self.editGradeList.render();
                            $("body").pagecontainer("change", "#quesetionnaire_list", {
                                reverse: false,
                                changeHash: false,
                            });
                        })
                    })

                } else if (type == '3') {
                    self.questionnairInstance.id = qi_id.split('-')[0];
                    self.questionnairInstance.fetch().done(function() {
                        self.editGradeCommonList.render();
                        $("body").pagecontainer("change", "#quesetionnaire_common_list", {
                            reverse: false,
                            changeHash: false,
                        });
                    })
                } else if (type == '4') {
                    self.MBTIQuestionInstance.id = qi_id;
                    self.MBTIQuestionInstance.fetch().done(function() {
                        self.MBTIQuestionInstances.fetch().done(function() {
                            self.editGradeMBTIList.collection = self.MBTIQuestionInstances;
                            self.editGradeMBTIList.render();
                            $("body").pagecontainer("change", "#quesetionnaire_nbti_list", {
                                reverse: false,
                                changeHash: false,
                            });
                        })

                    })
                }

            },
            qt_manage: function() {
                var self = this;
                self.questionnairManages.pp_id = $("#login_people").val();
                self.questionnairManages.fetch().done(function() {
                    // self.editGradeManageList.my_question = self.my_question;
                    self.editGradeManageList.render();

                    $("body").pagecontainer("change", "#quesetionnaire_manage_list", {
                        reverse: false,
                        changeHash: false,
                    });
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

            },
            init_models: function() {
                var self = this;
                self.questionnairInstance = new QuestionnairInstanceModel();
                self.peopleCompetencyScore = new PeopleCompetencyScoreModel();
                self.MBTIQuestionInstance = new MBTIQuestionInstanceModel()
            },
            init_collections: function() {
                var self = this;
                self.questionnair360s = new Questionnair360Collection();
                self.questionnairManages = new QuestionnairManageCollection();
                self.peopleCompetencyScores = new PeopleCompetencyScoreCollection();
                self.MBTIQuestionInstances = new MBTIQuestionInstanceCollection();
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