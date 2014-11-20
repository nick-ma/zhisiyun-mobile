// Assessment  Appeal View 绩效申诉查看列表界面（我的绩效申诉当期和历史）
// =============================================================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "moment", "../../models/AssessmentModel", "../../models/CollTaskModel"],
    function($, _, Backbone, Handlebars, moment, AssessmentModel, CollTaskModel) {

        // Extends Backbone.View
        var AssessmentAppealView = Backbone.View.extend({
            // The View Constructor
            initialize: function() {
                this.template = Handlebars.compile($("#psh_appeal_list_view").html());
                this.loading_template = Handlebars.compile($("#loading_template_view").html());
                this.bind_events();
                var self = this;
            },
            pre_render: function() {
                var self = this;
                $("#appeal_list-content").html(self.loading_template({
                    info_msg: '数据加载中...请稍候'
                }));
                $("#appeal_list-content").trigger('create');
                return this;
            },
            // Renders all of the Assessment models on the UI
            render: function(status) {
                var self = this;
                var data = _.map(self.collection.models, function(x) {
                    return x.toJSON()
                })
                var render_data = {
                    data: data
                };
                if (status) {
                    render_data.status = status;
                } else {
                    render_data.status = "A";

                }
                $("#appeal_list-content").html(self.template(render_data));
                $("#appeal_list-content").trigger('create');
                return this;

            },
            bind_events: function() {
                var self = this;

                $("#appeal_list-footer").on('click', '.btn-appeal-change_state', function(event) {
                    var $this = $(this);
                    self.view_filter = $this.data('view_filter');
                    if (self.view_filter == 'can_appeal') {
                        $("#appeal_list #appeal_name").html('当前可申诉');
                        self.collection.url = '/admin/pm/assessment_instance/appeal/bb';
                        self.collection.fetch().done(function() {
                            self.render("A");
                        })
                    } else if (self.view_filter == 'appeal_history') { //自己侧边栏
                        $("#appeal_list #appeal_name").html('申诉历史');

                        self.collection.url = '/admin/pm/assessment_instance/appeal/bb?source=m';
                        self.collection.fetch().done(function() {
                            self.render("B");
                        })
                    }
                    $('.btn-appeal-change_state').removeClass('ui-btn-active');
                    $this.addClass('ui-btn-active');
                });

                $("#appeal_list").on('click', '.go_back', function(event) {
                    event.preventDefault();
                    window.location = "/m#assessment_list";
                })
            }

        });

        // Returns the View class
        return AssessmentAppealView;

    });