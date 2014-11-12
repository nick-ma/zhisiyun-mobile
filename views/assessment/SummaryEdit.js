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
                this.wip_template = Handlebars.compile($("#psh_summary_wip_form_view").html());

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
                if (self.ai_status >= 10) {
                    $("#summary_edit_form #summary_name").html("绩效总结查看")

                } else {
                    $("#summary_edit_form #summary_name").html("绩效总结编辑")

                }
                var rendered_content = [];
                var items = data[0].quantitative_pis.items; //ration=2 定量
                var mark_as_summary_type1_num = 0,
                    mark_as_summary_type2_num = 0; //指标个数；
                _.each(items, function(x) {
                    if (x.mark_as_summary_type1 || x.mark_as_summary_type2) {
                        x.people = self.collection.models[0].get('people');
                        x.ration = 2;
                        x.ai_status = self.ai_status;
                        rendered_content.push(x);
                        if (x.mark_as_summary_type1) {
                            mark_as_summary_type1_num += 1;
                        }
                        if (x.mark_as_summary_type2) {
                            mark_as_summary_type2_num += 1;
                        }
                    };
                })

                var items = data[0].qualitative_pis.items; //ration=1 定性
                _.each(items, function(x) {
                    if (x.mark_as_summary_type1 || x.mark_as_summary_type2) {
                        x.people = self.collection.models[0].get('people');
                        x.ration = 1;
                        x.ai_status = self.ai_status;
                        rendered_content.push(x);
                        if (x.mark_as_summary_type1) {
                            mark_as_summary_type1_num += 1;
                        }
                        if (x.mark_as_summary_type2) {
                            mark_as_summary_type2_num += 1;
                        }
                    }
                })
                if (self.ai_status == '9' && self.is_self) {
                    var is_edit = true;
                } else {
                    var is_edit = false;

                }
                var render_data = {
                    rendered_content: rendered_content,
                    data: data[0],
                    is_edit: is_edit,
                    type1_len: mark_as_summary_type1_num,
                    type2_len: mark_as_summary_type2_num

                }
                $("#summary_href").attr("href", '/m#summary');
                $("#summary_edit_form-content").html(self.template(render_data));
                $("#summary_edit_form-content").trigger('create');
                return this;

            },
            render_pi: function(module, pi_id, ration) {
                var self = this;
                var data = _.map(self.collection.models, function(x) {
                    return x.toJSON()
                })
                if (ration == '1') {
                    var items = data[0].qualitative_pis.items; //ration=1 定xing
                    var find_pi = _.find(items, function(x) {
                        return x.pi == String(pi_id)
                    })

                } else if (ration == '2') {
                    var items = data[0].quantitative_pis.items; //ration=2 定量
                    var find_pi = _.find(items, function(x) {
                        return x.pi == String(pi_id)
                    })
                }
                //是否可以编辑
                if (self.ai_status == '9' && self.is_self) {
                    var is_edit = true;
                } else {
                    var is_edit = false;

                }
                var render_data = {
                    data: data[0],
                    is_edit: is_edit,
                    find_pi: find_pi
                };
                if (module == 'A') {
                    $("#summary_href").data("module", "A");
                    $("#summary_edit_form #summary_name").html("不足与改进");

                    render_data.module = 'A';

                } else if (module == 'B') {
                    $("#summary_href").data("module", "B");
                    $("#summary_edit_form #summary_name").html("绩效亮点分享")
                    render_data.module = 'B';

                }

                //页签切换时用
                $("#summary_edit_form .btn-summary_edit_form-change_state").data("module", module)
                $("#summary_edit_form .btn-summary_edit_form-change_state").data("pi_id", pi_id)
                $("#summary_edit_form .btn-summary_edit_form-change_state").data("ration", ration)

                $("#summary_edit_form-content").html(self.pi_template(render_data));
                $("#summary_edit_form-footer").show();

                $("#summary_edit_form-content").trigger('create');
                $("#mark_as_watch").parent().addClass('mark_as_watch');
                return this;

            },
            render_wip: function(module, pi_id, ration) {
                var self = this;
                var data = _.map(self.collection.models, function(x) {
                        return x.toJSON()
                    })
                    //是否可以编辑
                if (ration == '1') {
                    var items = data[0].qualitative_pis.items; //ration=1 定xing
                    var find_pi = _.find(items, function(x) {
                        return x.pi == String(pi_id)
                    })

                } else if (ration == '2') {
                    var items = data[0].quantitative_pis.items; //ration=2 定量
                    var find_pi = _.find(items, function(x) {
                        return x.pi == String(pi_id)
                    })
                }
                //是否可以编辑
                if (self.ai_status == '9' && self.is_self) {
                    var is_edit = true;
                } else {
                    var is_edit = false;

                }
                var render_data = {
                    data: data[0],
                    is_edit: is_edit,
                    find_pi: find_pi
                };
                if (module == 'A') {
                    $("#summary_href").data("module", "A");
                    $("#summary_edit_form #summary_name").html("不足与改进")

                } else if (module == 'B') {
                    $("#summary_href").data("module", "B");
                    $("#summary_edit_form #summary_name").html("绩效亮点分享")

                }
                $("#summary_edit_form-content").html(self.wip_template(render_data));
                $("#summary_edit_form-footer").show();
                $("#summary_edit_form-content").trigger('create');
                self.redraw_sparkline();
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
                    var ration = $(this).data("ration");
                    self.render_pi(module, pi_id, ration);


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
                    var module = $(this).data("module");
                    var pi_id = $(this).data("pi_id");
                    var ration = $(this).data("ration");
                    if (view_filter == 'A') {

                        self.render_pi(module, pi_id, ration);
                    } else if (view_filter == 'B') {
                        self.render_wip(module, pi_id, ration);
                    }
                })

            },
            redraw_sparkline: function() {
                _.each($(".sparkline-revise-history"), function(x) {
                    var $x = $(x);
                    var composite_values = $x.data("composite_values") + '';
                    var values = $x.attr("values") + '';
                    var bar_range_max;
                    if (composite_values) {
                        var max1 = parseFloat(_.max(values.split(','), function(x) {
                            return parseFloat(x);
                        }));
                        var max2 = parseFloat(_.max(composite_values.split(','), function(x) {
                            return parseFloat(x);
                        }));
                        // console.log(max1, max2);
                        if (max1 >= max2) {
                            bar_range_max = max1;
                        } else {
                            bar_range_max = max2;
                        };
                    };
                    // console.log('max:', bar_range_max);
                    $x.sparkline('html', {
                        type: 'bar',
                        width: '100%',
                        height: 30,
                        enableTagOptions: true,
                        barWidth: '10',
                        chartRangeMin: 0,
                        chartRangeMax: bar_range_max,
                        // zeroAxis: false,

                        tooltipFormatter: function(sp, ops, fields) {
                            var revise_date = $(sp.el).data('revise_date').split(',');
                            var value_obj = fields[0];
                            var tp = ['<div class="jqs jqstitle" style="text-shadow:none">更新日期：' + revise_date[value_obj.offset] + '</div>'];
                            // tp.push('<div class="jqsfield">更新内容：' + $.sprintf('%0.2f', Math.round(value_obj.value * 1000) / 1000) + '</div>');
                            tp.push('<div class="jqsfield" style="text-shadow:none">更新内容：' + value_obj.value + '</div>');
                            return tp.join('');
                        }
                    })
                    if (composite_values) { //发现需要覆盖的数据，画出图形
                        $x.sparkline(composite_values.split(','), {
                            composite: true,
                            // type: 'bar',
                            fillColor: false,
                            lineColor: 'red',
                            lineWidth: 3,
                            barColor: '#ff0000',
                            chartRangeMin: 0,
                            chartRangeMax: bar_range_max,
                            tooltipFormatter: function(sp, ops, fields) {
                                // console.log(fields);
                                var value_obj = fields;
                                var tp = [];
                                tp.push('<div class="jqsfield" style="text-shadow:none">目标值：' + value_obj.y + '</div>');
                                return tp.join('');
                            }
                        });

                    };
                })
            },
        });

        // Returns the View class
        return AssessmentSummaryEditView;

    });