// Myteam Assessment Update Value View 绩效合同的单条指标更新实际值的页面
// 1、（由于是上级查看下属，所以不能输入新值）
// 2、segments.length>0，表明有小周期分解，需要渲染另外的模版。否则，就一个输入框。
// =============================================================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "moment", "models/AssessmentModel"], function($, _, Backbone, Handlebars, moment, AssessmentModel) {

    // Extends Backbone.View
    var MyTeamAssessmentUpdateValueView = Backbone.View.extend({
        // The View Constructor
        initialize: function() {
            this.template = Handlebars.compile($("#hbtmp_myteam_assessment_update_value_view").html());
            // this.bind_events();
            // The render method is called when Assessment Models are added to the Collection
            // this.model.on("sync", this.render, this);
            var self = this;
            self.number_pattern = /^[0-9]+(.[0-9]+)?$/;
            $("#myteam_assessment_update_value-content")
                .on('change', '#segment_select', function(event) {
                    event.preventDefault();
                    var $this = $(this);
                    var lx = $this.data('lx');
                    var pi = $this.data('pi');
                    var pi_data = self.get_pi(lx, pi);
                    var segment = pi_data.segments[$this.val()];
                    self.render(self.people_id, lx, pi, segment);
                    // console.log(pi_data, segment);

                })
                .on('change', '#pi_new_comment', function(event) { //小周期的沟通记录
                    event.preventDefault();
                    var $this = $(this);
                    // console.log($this.val());
                    if ($this.val()) {
                        var lx = $this.data('lx');
                        var pi = $this.data('pi');
                        var pi_data = self.get_pi(lx, pi);
                        var cur_seg = pi_data.segments[$("#myteam_assessment_update_value-content #segment_select").val()];
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
                            self.render(self.people_id, lx, pi, cur_seg, 'comment_pane');
                        })
                    }
                });
        },

        // Renders all of the Assessment models on the UI
        render: function(people_id, lx, pi, current_seg, opened_pane) {
            var self = this;
            self.people_id = people_id;
            // console.log('render: ', lx, pi, ol);
            var render_data = {};
            render_data = self.get_pi(lx, pi);
            render_data.ai_id = self.model.get('_id');
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
            $("#btn-myteam_assessment_update_value-back").attr('href', '#myteam_assessment_detail/' + people_id + '/' + self.model.get('_id') + '/' + lx + '/' + pi);
            // console.log(render_data);
            $("#myteam_assessment_update_value-content").html(self.template(render_data));
            $("#myteam_assessment_update_value-content").trigger('create');

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
    return MyTeamAssessmentUpdateValueView;

});