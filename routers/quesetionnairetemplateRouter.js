// todo router
// ====================

define(["jquery", "backbone", "handlebars", "lzstring", "async",
        "../collections/QuestionnairTemplateClientCollection",
        "../models/QuestionnairTemplateClientModel",
        "../views/questionnair_template/TemplateList",
        "../views/questionnair_template/TemplateEditList",
        "../views/questionnair_template/IssueList",
        "../views/questionnair_template/ResultList"
    ],
    function($, Backbone, Handlebars, LZString, async,
        QuestionnairTemplateClientCollection,
        QuestionnairTemplateClientModel,
        TemplateList,
        TemplateEditList,
        IssueList,
        ResultList
    ) {

        var QuesetionnaireTemplateRouter = Backbone.Router.extend({
            initialize: function() {
                var self = this;
                self.init_data();
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
                "quesetionnair_template_result/:qt_id": "quesetionnair_template_result",
            },
            quesetionnair_template: function() { //我的待办
                var self = this;
                $("body").pagecontainer("change", "#quesetionnaire_template_list", {
                    reverse: false,
                    changeHash: false,
                });

                $.mobile.loading("show");
                self.templateList.pre_render();
                self.questionnairTemplateClients.people = $('#login_people').val();
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
                self.questionnairTemplateClient.peoples = self.peoples;
                self.questionnairTemplateClient.fetch().done(function() {
                    self.issueList.render();
                    $.mobile.loading("hide");
                })
            },
            quesetionnair_template_result: function(qt_id) {
                var self = this;
                $("body").pagecontainer("change", "#quesetionnaire_template_result_list", {
                    reverse: false,
                    changeHash: false,
                });
                $.mobile.loading("show");
                // self.resultList.pre_render();
                var find_data = {
                    q_category: '2',
                    qtc: qt_id,
                    type: 'N'

                }
                $.post('/admin/pm/questionnair_template/get_qt_instances', find_data, function(data) {
                    self.resultList.qtis = data.result
                    self.resultList.people = $('#login_people').val();
                    self.resultList.render();
                    $.mobile.loading("hide");
                })



            },
            init_data: function() { //初始化的时候，先从local storage里面恢复数据，如果localstorage里面没有，则去服务器fetch
                var self = this;
                $.get('/admin/im/get_peoples/' + $("#login_people").val(), function(peoples) {
                    self.peoples = peoples
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
                this.resultList = new ResultList({
                    el: "#quesetionnaire_template_result_list",
                    // model: self.questionnairTemplateClient,
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