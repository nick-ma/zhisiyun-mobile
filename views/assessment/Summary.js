// Assessment  Summary View 绩效总结查看列表界面（我的下属及我的绩效总结当期和历史）
// =============================================================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "moment", "../../models/AssessmentModel", "../../models/CollTaskModel"],
    function($, _, Backbone, Handlebars, moment, AssessmentModel, CollTaskModel) {

        // Extends Backbone.View
        var AssessmentSummaryView = Backbone.View.extend({
            // The View Constructor
            initialize: function() {
                this.template = Handlebars.compile($("#psh_summary_list_view").html());
                this.left_template = Handlebars.compile($("#hbtmp_assessment_left_view").html());
                this.bind_events();
                var self = this;
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
                $("#summary_list-content").html(self.template(render_data));
                $("#summary_list-content").trigger('create');
                return this;

            },
            bind_events: function() {
                var self = this;

                $("#summary_list-footer").on('click', '.btn-assessment-change_state', function(event) {
                    var $this = $(this);
                    self.view_filter = $this.data('view_filter');
                    if (self.view_filter) {
                        self.peoples = _.filter(self.c_people.models, function(x) {
                            return x.attributes[self.view_filter];
                        })

                        var rendered = {
                            people: [],
                        };
                        _.each(self.peoples, function(x) {
                            rendered.people.push(x.attributes);
                        });

                        $("#summary_list-left-panel-content").html(self.left_template(rendered));
                        $("#summary_list-left-panel-content").trigger('create');

                        $("#summary_list-left-panel").panel("open");
                    } else { //自己侧边栏
                        self.collection.url = '/admin/pm/assessment_instance/summary/bb';
                        self.collection.fetch().done(function() {
                            self.render();
                        })
                    }
                    $('.btn-assessment-change_state').removeClass('ui-btn-active');
                    $this.addClass('ui-btn-active');
                });
                $("#summary_list-left-panel-content")
                    .on('change', '.goto_sub_assessment', function(event) {
                        var $this = $(this);
                        var people = $this.data('up_id');
                        $("#summary_name").html($this.data('people_name') + '的绩效总结');
                        self.collection.url = '/admin/pm/assessment_instance/summary/bb?people=' + people;
                        self.collection.fetch().done(function() {
                            self.render();
                        })
                        $("#summary_list-left-panel").panel("close");


                    });
            }

        });

        // Returns the View class
        return AssessmentSummaryView;

    });