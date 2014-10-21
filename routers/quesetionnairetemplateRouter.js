// todo router
// ====================

define(["jquery", "backbone", "handlebars", "lzstring", "async",
        "../collections/QuestionnairTemplateClientCollection",
        "../models/QuestionnairTemplateClientModel",
        "../views/questionnair_template/TemplateList",
        "../views/questionnair_template/TemplateEditList",
        "../views/questionnair_template/IssueList"
    ],
    function($, Backbone, Handlebars, LZString, async,
        QuestionnairTemplateClientCollection,
        QuestionnairTemplateClientModel,
        TemplateList,
        TemplateEditList,
        IssueList
    ) {

        var QuesetionnaireTemplateRouter = Backbone.Router.extend({
            initialize: function() {
                var self = this;
                self.init_models();
                self.init_collections();
                self.init_views();
                // self.bind_events();
                console.log('message: Questionnair_template router initialized');
                // Backbone.history.start();
            },
            routes: {
                "quesetionnair_template": "quesetionnair_template",
                "quesetionnair_template/:qt_id": "quesetionnair_template_edit",
                "quesetionnair_template_issue/:qt_id": "quesetionnair_template_issue",
            },
            quesetionnair_template: function() { //我的待办
                var self = this;
                $("body").pagecontainer("change", "#quesetionnaire_template_list", {
                    reverse: false,
                    changeHash: false,
                });

                $.mobile.loading("show");
                self.templateList.pre_render();

                self.questionnairTemplateClients.fetch().done(function() {
                    self.templateList.render();
                    $.mobile.loading("hide");
                })

            },
            quesetionnair_template_edit: function(qt_id) {
                var self = this;
                $("body").pagecontainer("change", "#quesetionnaire_template_edit_list", {
                    reverse: false,
                    changeHash: false,
                });

                $.mobile.loading("show");
                self.templateEditList.pre_render();
                self.questionnairTemplateClient.id = qt_id
                self.questionnairTemplateClient.fetch().done(function() {
                    self.templateEditList.render();
                    $.mobile.loading("hide");
                })


            },
            quesetionnair_template_issue: function(qt_id) {
                var self = this;
                $("body").pagecontainer("change", "#quesetionnaire_template_issue_list", {
                    reverse: false,
                    changeHash: false,
                });

                $.mobile.loading("show");
                self.issueList.pre_render();
                self.questionnairTemplateClient.id = qt_id
                self.questionnairTemplateClient.fetch().done(function() {
                    self.issueList.render();
                    $.mobile.loading("hide");
                })
            },
            init_views: function() {
                var self = this;
                this.templateList = new TemplateList({
                    el: "#quesetionnaire_template_list",
                    collection: self.questionnairTemplateClients,
                })
                this.templateEditList = new TemplateEditList({
                    el: "#quesetionnaire_template_edit_list",
                    model: self.questionnairTemplateClient,
                })
                this.issueList = new IssueList({
                    el: "#quesetionnaire_template_issue_list",
                    model: self.questionnairTemplateClient,
                })

            },
            init_models: function() {
                var self = this;
                self.questionnairTemplateClient = new QuestionnairTemplateClientModel();
            },
            init_collections: function() {
                var self = this;
                self.questionnairTemplateClients = new QuestionnairTemplateClientCollection();
            },
        });

        return QuesetionnaireTemplateRouter;
    })