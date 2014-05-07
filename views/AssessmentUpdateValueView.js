// Assessment Update Value View 绩效合同的单条指标更新实际值的页面
// 1、判断ai_status=='4'才可以更新（输入新值）
// 2、segments.length>0，表明有小周期分解，需要渲染另外的模版。否则，就一个输入框。
// =============================================================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "moment", "models/AssessmentModel"], function($, _, Backbone, Handlebars, moment, AssessmentModel) {

    // Extends Backbone.View
    var AssessmentUpdateValueView = Backbone.View.extend({
        // The View Constructor
        initialize: function() {
            this.template = Handlebars.compile($("#hbtmp_assessment_update_value_view").html());
            // this.bind_events();
            // The render method is called when Assessment Models are added to the Collection
            // this.model.on("sync", this.render, this);
            var self = this;
            self.number_pattern = /^[0-9]+(.[0-9]+)?$/;
            $("#assessment_update_value-content")
                .on('change', '#segment_select', function(event) {
                    event.preventDefault();
                    var $this = $(this);
                    var lx = $this.data('lx');
                    var pi = $this.data('pi');
                    var ol = $this.data('ol');
                    var pi_data = self.get_pi(lx, pi, ol);
                    var segment = pi_data.segments[$this.val()];
                    self.render(lx, pi, ol, segment);
                    // console.log(pi_data, segment);

                })
                .on('change', '#pi_new_actual_value', function(event) {
                    event.preventDefault();
                    var $this = $(this);
                    if ($this.val()) {
                        if (self.number_pattern.test($this.val())) {
                            var lx = $this.data('lx');
                            var pi = $this.data('pi');
                            var ol = $this.data('ol');
                            var pi_data = self.get_pi(lx, pi, ol);
                            if (lx == 'dl') { //对定量指标的处理方式
                                //检查是有小周期还是not
                                if (pi_data.segments.length) { //有小周期
                                    var cur_seg = pi_data.segments[$("#assessment_update_value-content #segment_select").val()];
                                    if ($this.val() != cur_seg.actual_value) { //不想等，才认为是新值，保存
                                        var new_rv = {
                                            revised_value: parseFloat($this.val()),
                                            timestamp: new Date(),
                                        };
                                        // 付新值
                                        cur_seg.actual_value = parseFloat($this.val());
                                        cur_seg.actual_value_revise.push(new_rv);
                                        // 根据汇总规则，更新pi_data的数据
                                        if (pi_data.segments_sum_rule == 'S') {
                                            pi_data.actual_value = _.reduce(pi_data.segments, function(memo, n) {
                                                return memo += n.actual_value;
                                            }, 0);
                                            pi_data.actual_value_revise.push({
                                                revised_value: pi_data.actual_value,
                                                timestamp: new Date(),
                                            })
                                        } else if (pi_data.segments_sum_rule == 'M') { //根据当前时间点求均值
                                            var now = moment();
                                            var ff = _.filter(pi_data.segments, function(x) { //只对有效的期间进行计算
                                                return now.diff(moment(x.start)) >= 0;
                                            });
                                            if (ff.length) {
                                                pi_data.actual_value = Math.round((_.reduce(ff, function(memo, n) {
                                                    return memo += parseFloat(n.actual_value);
                                                }, 0)) / ff.length * 100) / 100;
                                            } else {
                                                pi_data.actual_value = 0;
                                            };
                                            pi_data.actual_value_revise.push({
                                                revised_value: pi_data.actual_value,
                                                timestamp: new Date(),
                                            })
                                        };
                                        // 重新算分 -TODO

                                        //save & render
                                        self.model.save().done(function() {
                                            self.render(lx, pi, ol, cur_seg);
                                        })
                                    };
                                } else { //没有小周期
                                    if ($this.val() != pi_data.actual_value) { //不想等，才认为是新值，保存
                                        pi_data.actual_value = parseFloat($this.val());
                                        pi_data.actual_value_revise.push({
                                            revised_value: pi_data.actual_value,
                                            timestamp: new Date(),
                                        })
                                        // 重新算分 -TODO

                                        //save & render
                                        self.model.save().done(function() {
                                            self.render(lx, pi, ol, cur_seg);
                                        })
                                    }
                                };
                            } else if (lx == 'dx') { //对定性指标的处理方式 -- TODO

                            };


                            $this.val(''); //用完后清空
                        } else {
                            alert('实际值为数字类型，请重新输入。');
                        };
                    };

                });
        },

        // Renders all of the Assessment models on the UI
        render: function(lx, pi, ol, current_seg) {
            var self = this;
            // console.log('render: ', lx, pi, ol);
            var render_data = {};
            render_data = self.get_pi(lx, pi, ol);
            render_data.lx = lx;
            render_data.pi = pi;
            render_data.ol = ol;
            render_data.login_people = $("#login_people").val();
            if (render_data.segments.length) { //加了判断
                var now = moment();
                var now_seg = current_seg || _.find(render_data.segments, function(x) {
                    return (now >= moment(x.start) && now <= moment(x.end))
                })
                render_data.now_seg = now_seg || render_data.segments[0]; //如果没找到当前期间，则给出第一个段。
            };
            // render_data.comments
            $("#btn-assessment_update_value-back").attr('href', '#assessment_detail/' + self.model.get('_id') + '/' + lx + '/' + pi + '/' + ol);
            // console.log(render_data);
            $("#assessment_update_value-content").html(self.template(render_data));
            $("#assessment_update_value-content").trigger('create');

            self.redraw_sparkline();
            window.setTimeout(function() { //must have this line to ensure the line over bars
                $.sparkline_display_visible();
            }, 500);
            // Maintains chainability
            return this;

        },

        get_pi: function(lx, pi, ol) {
            var self = this;
            if (lx == 'dl') { //定量指标
                var dl_items = self.model.get('quantitative_pis').items;
                return _.find(dl_items, function(x) {
                    if (ol) {
                        return (x.pi == pi && x.ol == ol);
                    } else {
                        return (x.pi == pi);
                    }
                })
            } else if (lx == 'dx') { //定性指标
                var dx_items = self.model.get('qualitative_pis').items;
                return _.find(dx_items, function(x) {
                    if (ol) {
                        return (x.pi == pi && x.ol == ol);
                    } else {
                        return (x.pi == pi);
                    }
                })
            };
        },
        calc_score: function() { //对当前的model重新算分， 大活啊，shit！

        },
        redraw_sparkline: function() {
            _.each($(".sparkline-revise-history"), function(x) {
                var $x = $(x);
                var composite_values = $x.data("composite_values") + '';
                var values = $x.attr("values") + '';
                // console.log(values);
                // var composite_revise_date = $x.data("composite_revise_date");
                // console.log(composite_values, composite_revise_date);
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
    return AssessmentUpdateValueView;

});