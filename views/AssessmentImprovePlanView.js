// Assessment Improve Plan View 绩效合同的单条指标互动交流信息的查看与编辑页面
// =============================================================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "moment", "models/AssessmentModel", "models/CollTaskModel"],
    function($, _, Backbone, Handlebars, moment, AssessmentModel, CollTaskModel) {

        // Extends Backbone.View
        var AssessmentImprovePlanView = Backbone.View.extend({
            // The View Constructor
            initialize: function() {
                this.template = Handlebars.compile($("#hbtmp_assessment_improve_plan_view").html());
                this.bind_events();
                // The render method is called when Assessment Models are added to the Collection
                // this.model.on("sync", this.render, this);
                var self = this;

            },

            // Renders all of the Assessment models on the UI
            render: function(lx, pi) {
                var self = this;
                // console.log('render: ', lx, pi, ol);
                var render_data = {};
                render_data = self.get_pi(lx, pi);
                render_data.lx = lx;
                render_data.pi = pi;
                render_data.login_people = $("#login_people").val();
                render_data.ai_id = self.model.get('_id');
                render_data.ai_status = self.model.get('ai_status');
                // render_data.comments = _.sortBy(render_data.comments, function(x) {
                //     return -(new Date(x.createDate));
                // })
                render_data.wip_summary_all = _.clone(render_data.wip_summary);
                render_data.wip_summary_all = _.map(render_data.wip_summary_all, function(x) {
                    x.segment_name = '-';
                    return x;
                })
                if (render_data.segments.length) {
                    _.each(render_data.segments, function(x) {
                        if (x.segment_summary.length) {
                            _.each(x.segment_summary, function(y) {
                                var yy = _.clone(y);
                                yy.segment_name = x.segment_name;
                                render_data.wip_summary_all.push(yy);
                            })
                        };
                    })
                };
                render_data.wip_summary_all = _.sortBy(render_data.wip_summary_all, function(x) { //安时间倒叙排
                    return -(new Date(x.createDate));
                })
                // if (render_data.wip_summary_all.length) {
                //     render_data.improve_plan_last_update = render_data.wip_summary_all[0].createDate;
                // };
                // render_data.improve_plan_nums = render_data.wip_summary_all.length;
                // console.log(render_data.wip_summary_all);
                $("#btn-assessment_improve_plan-back").attr('href', '#assessment_detail/' + self.model.get('_id') + '/' + lx + '/' + pi);
                $("#btn-assessment_improve_plan-add").attr('href', '#assessment_improve_plan/' + self.model.get('_id') + '/' + lx + '/' + pi + '/new/-');
                // console.log(render_data);
                $("#assessment_improve_plan-content").html(self.template(render_data));
                $("#assessment_improve_plan-content").trigger('create');
                if (render_data.ai_status == '4') { //控制新增按钮的显示
                    $("#btn-assessment_improve_plan-add").show();
                } else {
                    $("#btn-assessment_improve_plan-add").hide();
                };
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

            bind_events: function() {
                var self = this;
                $("#assessment_improve_plan-content")
                    .on('click', '#btn-add-colltask-4-pi', function(event) {
                        event.preventDefault();
                        var $this = $(this);
                        var lx = $this.data('lx');
                        var pi = $this.data('pi');
                        var ai = $this.data('ai');
                        var ip_id = $this.data('ip_id');
                        var seg_name = $this.data('seg_name');
                        // console.log($this.data('lx'), $this.data('pi'), $this.data('ai'), $this.data('ip_id'), $this.data('seg_name'));
                        var pi_data = self.get_pi(lx, pi);
                        var pi_ws;
                        if (seg_name == '-') { //在指标层级来找
                            var ws = _.find(pi_data.wip_summary, function(x) {
                                return x._id == ip_id;
                            })
                            pi_ws = ws;
                        } else { //在小周期层级来找
                            //先找到小周期
                            var seg = _.find(pi_data.segments, function(x) {
                                return x.segment_name == seg_name;
                            })
                            if (seg) {
                                pi_ws = _.find(seg.segment_summary, function(x) {
                                    return x._id == ip_id;
                                })
                            };
                        };
                        if (pi_ws) { //找到对应的位置了，开始创建coll task
                            var new_coll_task = {
                                    task_name: '新建改进措施任务',
                                    task_descrpt: pi_ws.improvement_plan, //把改进措施作为任务的描述
                                    start: pi_ws.start,
                                    end: pi_ws.end,
                                    creator: $("#login_people").val(),
                                    th: $("#login_people").val(),
                                    pi: {
                                        ai_id: ai,
                                        pi_lx: lx, // 类型： dl：定量  dx：定性
                                        pi_id: pi,
                                        period_name: self.model.get('period_name'),
                                        pi_name: pi_data.pi_name
                                    }
                                }
                                // console.log(new_coll_task);
                            var ct = new CollTaskModel(new_coll_task);
                            ct.save().done(function() {
                                pi_ws.coll_tasks.push(ct.toJSON());
                                self.model.save().done(function() {
                                    self.model.fetch();
                                    alert('协作任务创建成功！')
                                    var url = '#colltask_edit/' + ct.get('_id');
                                    window.location.href = url;
                                })
                            })
                            // console.log(ct);
                        };
                        // console.log(self.model.toJSON(), pi_data, pi_ws);
                    });
            }

        });

        // Returns the View class
        return AssessmentImprovePlanView;

    });