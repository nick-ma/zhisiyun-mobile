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
                    var pi_data = self.get_pi(lx, pi);
                    var segment = pi_data.segments[$this.val()];
                    self.render(lx, pi, segment);
                    // console.log(pi_data, segment);

                })
                .on('change', '#pi_new_actual_value', function(event) {
                    event.preventDefault();
                    var $this = $(this);
                    if ($this.val()) {
                        if (self.number_pattern.test($this.val())) {
                            var lx = $this.data('lx');
                            var pi = $this.data('pi');
                            var pi_data = self.get_pi(lx, pi);
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
                                        self.calc_score();
                                        //save & render
                                        self.model.save().done(function() {
                                            self.render(lx, pi, cur_seg);
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
                                        self.calc_score();
                                        //save & render
                                        self.model.save().done(function() {
                                            self.render(lx, pi, null);
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

                })
                .on('change', '#pi_self_score', function(event) { //定性指标的自评
                    event.preventDefault();
                    var $this = $(this);
                    if ($this.val()) {
                        if (self.number_pattern.test($this.val())) {
                            var lx = $this.data('lx');
                            var pi = $this.data('pi');
                            var pi_data = self.get_pi(lx, pi);
                            // console.log($this.val());
                            if (pi_data.segments.length) { //有小周期
                                var cur_seg = pi_data.segments[$("#assessment_update_value-content #segment_select").val()];
                                if ($this.val() != cur_seg.self_score) { //不想等，才认为是新值，保存
                                    var new_rv = {
                                        revised_value: parseFloat($this.val()),
                                        timestamp: new Date(),
                                    };
                                    // 付新值
                                    cur_seg.self_score = parseFloat($this.val());
                                    cur_seg.actual_value_revise.push(new_rv);
                                    // 根据汇总规则，更新pi_data的数据
                                    //根据当前时间点求均值
                                    var now = moment();
                                    var ff = _.filter(pi_data.segments, function(x) { //只对有效的期间进行计算
                                        return now.diff(moment(x.start)) >= 0;
                                    });
                                    if (ff.length) {
                                        pi_data.self_score = Math.round((_.reduce(ff, function(memo, n) {
                                            return memo += parseFloat(n.self_score);
                                        }, 0)) / ff.length * 100) / 100;
                                    } else {
                                        pi_data.self_score = 0;
                                    };
                                    // pi_data.f_score = pi_data.self_score;
                                    pi_data.actual_value_revise.push({
                                        revised_value: pi_data.self_score,
                                        timestamp: new Date(),
                                    })

                                    // 重新算分 -TODO
                                    self.calc_score();
                                    //save & render
                                    self.model.save().done(function() {
                                        self.render(lx, pi, cur_seg);
                                    })
                                };
                            } else {
                                if ($this.val() != pi_data.self_score) { //不想等，才认为是新值，保存
                                    pi_data.self_score = parseFloat($this.val());
                                    pi_data.actual_value_revise.push({
                                        revised_value: pi_data.self_score,
                                        timestamp: new Date(),
                                    })
                                    // 重新算分 -TODO
                                    self.calc_score();
                                    //save & render
                                    self.model.save().done(function() {
                                        self.render(lx, pi, null);
                                    })
                                }
                            }
                            $this.val(''); //用完后清空
                        } else {
                            alert('自评分为数字类型，请重新输入。');
                        };
                    }
                })
                .on('change', '#pi_new_comment', function(event) { //小周期的沟通记录
                    event.preventDefault();
                    var $this = $(this);
                    // console.log($this.val());
                    if ($this.val()) {
                        var lx = $this.data('lx');
                        var pi = $this.data('pi');
                        var pi_data = self.get_pi(lx, pi);
                        var cur_seg = pi_data.segments[$("#assessment_update_value-content #segment_select").val()];
                        var new_message = {
                            comment: $this.val(),
                            people_name: $("#login_people_name").val(),
                            position_name: $("#login_position_name").val(),
                            avatar: $("#login_avatar").val(),
                            creator: $("#login_people").val(),
                            createDate: new Date()
                        }
                        cur_seg.comments.push(new_message);
                        cur_seg.comments = _.sortBy(cur_seg.comments, function(x) {
                            return (new Date(x.createDate));
                        })
                        self.model.save().done(function() {
                            self.render(lx, pi, cur_seg, 'comment_pane');
                        })
                    }
                });
        },

        // Renders all of the Assessment models on the UI
        render: function(lx, pi, current_seg, opened_pane) {
            var self = this;
            // console.log('render: ', lx, pi, ol);
            var render_data = {};
            render_data = self.get_pi(lx, pi);
            render_data.ai_id = self.model.get('_id');
            render_data.ai_status = self.model.get('ai_status');
            render_data.lx = lx;
            render_data.pi = pi;
            render_data.login_people = $("#login_people").val();
            if (render_data.segments.length) { //加了判断
                var now = moment();
                var now_seg = current_seg || _.find(render_data.segments, function(x) {
                    return (now >= moment(x.start) && now <= moment(x.end))
                })
                render_data.now_seg = now_seg || render_data.segments[0]; //如果没找到当前期间，则给出第一个段。
                render_data.now_seg.comments = _.sortBy(render_data.now_seg.comments, function(x) { //按时间倒叙
                    return -(new Date(x.createDate));
                })
            };
            if (lx == 'dx') { //定性指标，判断评分方式
                render_data.grade_way = self.model.attributes.qualitative_pis.grade_way;
                if (render_data.grade_way == 'G') { //取出等级组
                    var gg = self.gradegroup.get(self.model.attributes.qualitative_pis.grade_group);
                    // console.log(gg);
                    render_data.gg = gg.attributes;
                };
            };
            render_data.comment_pane_collapsed = (opened_pane == 'comment_pane') ? 'false' : 'true';
            render_data.improve_plan_pane_collapsed = (opened_pane == 'improve_plan_pane') ? 'false' : 'true';
            // console.log(render_data);
            // render_data.comments
            $("#btn-assessment_update_value-back").attr('href', '#assessment_detail/' + self.model.get('_id') + '/' + lx + '/' + pi);
            // console.log(render_data);
            $("#assessment_update_value-content").html(self.template(render_data));
            $("#assessment_update_value-content").trigger('create');

            self.redraw_sparkline();
            window.setTimeout(function() { //must have this line to ensure the line over bars
                $.sparkline_display_visible();
            }, 500);

            // console.log(self.scoringformula, self.gradegroup);
            // Maintains chainability

            return this;

        },

        get_pi: function(lx, pi) {
            var self = this;
            if (lx == 'dl') { //定量指标
                var dl_items = self.model.get('quantitative_pis').items;
                return _.find(dl_items, function(x) {
                    return (x.pi == pi);
                })
            } else if (lx == 'dx') { //定性指标
                var dx_items = self.model.get('qualitative_pis').items;
                return _.find(dx_items, function(x) {
                    return (x.pi == pi);
                })
            };
        },
        calc_score: function() { //对当前的model重新算分， 大活啊，shit！
            var self = this;
            if (self.scoringformula) { //确保计分公式的数据是穿进来的
                //根据计分公式来计算定量指标的得分
                self.model.attributes.quantitative_pis.sum_score = 0;
                _.each(self.model.attributes.quantitative_pis.items, function(x) {
                    var sf = self.scoringformula.get(x.scoringformula) //计分公式
                        // x.weight
                        // x.actual_value
                        // x.target_value
                        //记分
                    x['f_score'] = Math.round(self.scoring_func(sf.toJSON(), parseFloat(x['actual_value'] || 0), parseFloat(x['target_value'])) * 100) / 100;
                    // 得分
                    x['score'] = Math.round(x['f_score'] * x['weight']) / 100;
                    self.model.attributes.quantitative_pis.sum_score += x.score; //累加到定量指标的总得分
                    // console.log(x.f_score, x.score);
                    _.each(x.segments, function(y) { //对下面的小周期也进行计算
                        //记分
                        y['f_score'] = Math.round(self.scoring_func(sf.toJSON(), parseFloat(y['actual_value'] || 0), parseFloat(y['target_value'])) * 100) / 100;
                        // 得分
                        y['score'] = Math.round(y['f_score'] * x['weight']) / 100;
                        // console.log('   -> ', y.f_score, y.score);
                    })
                })
                // console.log(self.model.attributes.qualitative_pis);
                // console.log(self.scoring_func(self.scoringformula.models[0], 28));
            };
            // 计算定性指标的得分
            self.model.attributes.qualitative_pis.sum_score = 0;
            _.each(self.model.attributes.qualitative_pis.items, function(x) {
                x.f_score = Math.round(x.self_score / x.target_value * 10000) / 100; // 计分＝自评分/目标分 **过程管理的时候，只认自评分。
                x.score = Math.round(x.f_score * x.weight) / 100; //
                // console.log('定性指标：：',x.self_score, x.weight, x.score);
                self.model.attributes.qualitative_pis.sum_score += x.score;
                _.each(x.segments, function(y) { //对下面的小周期也进行计算
                    // 计分
                    y['f_score'] = Math.round(y['self_score'] / x['target_value'] * 10000) / 100; //使用self_score字段
                    // 得分
                    y['score'] = Math.round(y['f_score'] * x['weight']) / 100; //使用self_score字段
                })
            })
            // console.log('xxx->', self.model.attributes.qualitative_pis.sum_score);
            //整体合同的得分
            self.model.attributes.ai_score = self.model.attributes.quantitative_pis.sum_score + self.model.attributes.qualitative_pis.sum_score;
            // console.log('ai_score:', self.model.attributes.ai_score)
        },
        scoring_func: function(formula, x, r1, r2) {
            //-- 定义计算函数
            // 第一步函数，设：
            // x：实际值，a：目标值（下限），b：目标值（上限），c：封顶分
            var F_0 = function(x) {
                return x;
            };
            var F_A01 = function(x, a) {
                return x / a * 100;
            };
            var F_A02 = function(x, a, b, c) {
                return c / (b - a) * (x - a);
            };
            var F_A03 = function(x, a) {
                return x - a;
            };
            var F_B01 = function(x, a) {
                return a / x * 100;
            };
            var F_B02 = function(x, a) {
                return ((a - x) / a + 1) * 100;
            };
            var F_B03 = function(x, a, b, c) {
                return c / (a - b) * (a - x);
            };
            var F_B04 = function(x, a) {
                return a - x;
            };

            // 第二步函数，
            var F2 = function(x, ss) {
                var s = _.find(ss, function(s) {
                        return (x >= s.r1 && x < s.r2);
                    })
                    // console.log(s);
                if (s) { //找到所对应的区间
                    if (s.ftype == 'F') {
                        x = F2_F(x, s.fbody);
                    } else if (s.ftype == 'L') {
                        x = F2_L(x, s.fbody);
                    };
                };
                return x;
            }
            var F2_L = function(x, fbody) { //线性函数
                return fbody.a * x + fbody.b;
            };
            var F2_F = function(x, fbody) { //固定值
                return fbody.y;
            };
            var F2_T = function(x, fbody) { //数值表
                var T = _.find(fbody, function(t) {
                    return (t.x == x);
                });
                // console.log(T);
                return (T) ? T.y : null;
            };

            // 第三步函数
            var F3 = function(x, min, max, zero) { //判断上下限限制以及低于zero后归0
                x = parseFloat(x);
                min = parseFloat(min);

                if (_.isNumber(x) && !_.isNaN(x)) {
                    x = (!_.isNumber(min) && x <= min) ? min : x;
                    if (max != null && x >= max) { //为null就是不控制
                        x = max;
                    };
                    if (zero != null && x < zero) { //为null就是不控制
                        x = 0;
                    };
                };
                return x;
            };
            //--- 开始计算逻辑
            x = parseFloat(x);
            r1 = parseFloat(r1);
            r2 = parseFloat(r2);
            var dt = formula.data_table; //准备数值表的数据

            var ss = formula.subsection; //准备分段函数的数据

            ss = _.sortBy(ss, function(s) {
                return s.r1
            }); //按照区间从小到大排序
            // x：实际值，
            // 第一步
            if (formula.sf_type == '0') {
                x = F_0(x);
            } else if (formula.sf_type == 'A01') {
                x = F_A01(x, r1);
            } else if (formula.sf_type == 'A02') {
                x = F_A02(x, r1, r2, formula.max);
            } else if (formula.sf_type == 'A03') {
                x = F_A03(x, r1);
            } else if (formula.sf_type == 'B01') {
                x = F_B01(x, r1);
            } else if (formula.sf_type == 'B02') {
                x = F_B02(x, r1);
            } else if (formula.sf_type == 'B03') {
                x = F_B03(x, r1, r2, formula.max);
            } else if (formula.sf_type == 'B04') {
                x = F_B04(x, r1);
            };
            x = x * formula.magnification; //放大倍率
            // console.log(x);
            // 第二步
            if (formula.s_method == 'T') { //数值表
                var T = _.find(dt, function(t) {
                    return (t.x == x);
                });
                // console.log(T);
                x = (T) ? T.y : null;
            } else if (formula.s_method == 'S') { //线性分段
                x = F2(x, ss);
            };
            // 第三步
            // base_score:最低分 caps_score:最高分 score_to_zero:低于归0

            return F3(x, formula.base_score, formula.caps_score, formula.score_to_zero);
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