// Assessment  Summary Edit View 绩效总结查看界面（不足与改进、突出的绩效亮点分享、总结陈述）
// =============================================================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "moment", "../../models/AssessmentModel", "../../models/CollTaskModel"],
    function($, _, Backbone, Handlebars, moment, AssessmentModel, CollTaskModel) {

        // Extends Backbone.View
        var AssessmentSummaryEditView = Backbone.View.extend({
            // The View Constructor
            initialize: function() {
                this.template = Handlebars.compile($("#psh_summary_edit_form_view").html());
                this.loading_template = Handlebars.compile($("#loading_template_view").html());
                this.pi_template = Handlebars.compile($("#psh_summary_index_view").html());

                this.bind_events();
                var self = this;
            },
            pre_render: function() {
                var self = this;
                $("#summary_edit_form-content").html(self.loading_template({
                    info_msg: '数据加载中...请稍候'
                }));
                $("#summary_edit_form-content").trigger('create');
                return this;
            },
            // Renders all of the Assessment models on the UI
            render: function() {
                var self = this;
                var data = _.map(self.collection.models, function(x) {
                    return x.toJSON()
                })
                var render_data = {
                    data: data
                };
                if (self.ai_status >= 10) {
                    $("#summary_edit_form #summary_name").html("绩效总结查看")

                } else {
                    $("#summary_edit_form #summary_name").html("绩效总结编辑")

                }
                $("#summary_href").attr("href", '/m#summary');
                $("#summary_edit_form-content").html(self.template(render_data));
                $("#summary_edit_form-content").trigger('create');
                return this;

            },
            render_pi: function(module) {
                var self = this;
                var data = _.map(self.collection.models, function(x) {
                    return x.toJSON()
                })
                var render_data = {
                    data: data
                };
                if (module == 'A') {
                    $("#summary_href").data("module", "A");
                    $("#summary_edit_form #summary_name").html("不足与改进")

                } else if (module == 'B') {
                    $("#summary_href").data("module", "B");
                    $("#summary_edit_form #summary_name").html("绩效亮点分享")

                }
                $("#summary_edit_form-content").html(self.pi_template(render_data));
                $("#summary_edit_form-footer").show();

                $("#summary_edit_form-content").trigger('create');
                $("#mark_as_watch").parent().addClass('mark_as_watch');
                return this;

            },
            bind_events: function() {
                var self = this;
                $("#summary_edit_form").on('click', '.summary_pi', function(event) {
                    event.preventDefault();
                    var module = $(this).data("module");
                    var ai_id = $(this).data("ai_id");
                    var pi_id = $(this).data("pi_id");
                    var ai_status = $(this).data("ai_status");
                    self.render_pi(module);


                }).on('click', '#summary_href', function(event) {
                    event.preventDefault();
                    if ($(this).data("module")) {
                        self.render();
                        $(this).data("module", "");
                        $("#summary_edit_form-footer").hide();
                    } else {
                        window.location.href = "/m#summary";
                    }
                }).on('click', '.btn-summary_edit_form-change_state', function(event) {
                    event.preventDefault();
                    var view_filter = $(this).data("view_filter");
                    if (view_filter == 'A') {
                        self.render_pi();
                    } else if (view_filter == 'B') {
                        self.render_wip();
                    }
                })

            }

        });

        // Returns the View class
        return AssessmentSummaryEditView;

    });