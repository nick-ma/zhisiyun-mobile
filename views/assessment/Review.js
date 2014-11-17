// Assessment  Review View 绩效总结查看列表界面（我的下属及我的绩效面谈当期和历史）
// =============================================================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "moment", "../../models/AssessmentModel", "../../models/CollTaskModel"],
    function($, _, Backbone, Handlebars, moment, AssessmentModel, CollTaskModel) {

        // Extends Backbone.View
        var AssessmentReviewView = Backbone.View.extend({
            // The View Constructor
            initialize: function() {
                this.template = Handlebars.compile($("#psh_review_list_view").html());
                this.loading_template = Handlebars.compile($("#loading_template_view").html());
                this.left_template = Handlebars.compile($("#hbtmp_assessment_left_view").html());
                this.bind_events();
                var self = this;
            },
            pre_render: function() {
                var self = this;
                $("#review_list-content").html(self.loading_template({
                    info_msg: '数据加载中...请稍候'
                }));
                $("#review_list-content").trigger('create');
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
                $("#review_list-content").html(self.template(render_data));
                $("#review_list-content").trigger('create');
                return this;

            },
            bind_events: function() {
                var self = this;

                $("#review_list-footer").on('click', '.btn-assessment-change_state', function(event) {
                    var $this = $(this);
                    self.view_filter = $this.data('view_filter');
                    if (self.view_filter) {
                        if (self.view_filter == "myteam") {
                            self.peoples = _.filter(self.c_people.models, function(x) {
                                return x.attributes[self.view_filter];
                            })
                            var people = [],
                                position = [];
                            _.each(self.peoples, function(x) {
                                people.push(x.attributes._id);
                                position.push(x.attributes.position);
                            })
                            self.collection.url = '/admin/pm/assessment_instance/review/bb?people=' + people.join(',') + '&position=' + position.join(',') + '&source=m';
                            self.collection.fetch().done(function() {
                                self.render();
                                $("#review_list #review_name").html("一级下属");
                            })
                        } else {
                            self.peoples = _.filter(self.c_people.models, function(x) {
                                return x.attributes[self.view_filter];
                            })

                            var rendered = {
                                people: [],
                            };
                            _.each(self.peoples, function(x) {
                                rendered.people.push(x.attributes);
                            });

                            $("#review_list-left-panel-content").html(self.left_template(rendered));
                            $("#review_list-left-panel-content").trigger('create');

                            $("#review_list-left-panel").panel("open");
                        }

                    } else { //自己侧边栏
                        $("#review_list #review_name").html($("#login_people_name").val() + '的绩效面谈');

                        self.collection.url = '/admin/pm/assessment_instance/review/bb?source=m';
                        self.collection.fetch().done(function() {
                            self.render();
                        })
                    }
                    $('#review_list-footer .btn-assessment-change_state').removeClass('ui-btn-active');
                    $this.addClass('ui-btn-active');
                });
                $("#review_list-left-panel-content")
                    .on('change', '.goto_sub_assessment', function(event) {
                        var $this = $(this);
                        var people = $this.data('up_id');
                        var position = $this.data("position");
                        $("#review_list #review_name").html($this.data('people_name') + '的绩效面谈');
                        self.collection.url = '/admin/pm/assessment_instance/review/bb?people=' + people + '&position=' + position + '&source=m';
                        self.collection.fetch().done(function() {
                            self.render();
                        })
                        $("#review_list-left-panel").panel("close");


                    });
                $("#review_list").on('click', '.go_back', function(event) {
                    event.preventDefault();
                    window.location = "/m#assessment_list";
                })
            }

        });

        // Returns the View class
        return AssessmentReviewView;

    });