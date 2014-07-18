// Assessment Improve Plan Edit View 绩效合同的单条指标互动交流信息的查看与编辑页面
// =============================================================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "moment", "async", "../../models/AssessmentModel", "../../models/TaskModel"], function($, _, Backbone, Handlebars, moment, async, AssessmentModel, TaskModel) {

    // Extends Backbone.View
    var AssessmentImprovePlanEditView = Backbone.View.extend({
        // The View Constructor
        initialize: function() {
            this.template = Handlebars.compile($("#hbtmp_assessment_improve_plan_edit_view").html());
            this.bind_events();
            // The render method is called when Assessment Models are added to the Collection
            // this.model.on("sync", this.render, this);
            var self = this;

        },

        // Renders all of the Assessment models on the UI
        render: function(lx, pi, ip_id, seg_name) {
            var self = this;
            // console.log('render: ', lx, pi, ol);
            self.lx = lx;
            self.pi = pi;
            self.ip_id = ip_id;
            self.seg_name = seg_name;
            var render_data = {};
            self.pi_data = render_data = self.get_pi(lx, pi);
            render_data.lx = lx;
            render_data.pi = pi;
            render_data.ip_id = ip_id;
            render_data.seg_name = seg_name;
            render_data.login_people = $("#login_people").val();
            //ip_id==new
            if (ip_id == 'new') { //指标层级新增一条
                render_data.ws = { //加一条空的，起至都是当前日期
                    gap_analysis: "",
                    improvement_plan: "",
                    start: new Date(),
                    end: new Date(),
                    finished: false,
                    comments: [],

                }
            } else {
                if (seg_name == '-') { //在指标层级来找
                    var ws = _.find(render_data.wip_summary, function(x) {
                        return x._id == ip_id;
                    })
                    render_data.ws = ws;
                } else { //在小周期层级来找
                    //先找到小周期
                    var seg = _.find(render_data.segments, function(x) {
                        return x.segment_name == seg_name;
                    })
                    if (seg) {
                        render_data.ws = _.find(seg.segment_summary, function(x) {
                            return x._id == ip_id;
                        })
                    };
                };
            };

            // if (render_data.wip_summary_all.length) {
            //     render_data.improve_plan_last_update = render_data.wip_summary_all[0].createDate;
            // };
            // render_data.improve_plan_nums = render_data.wip_summary_all.length;
            // console.log(render_data.ws);
            $("#btn-assessment_improve_plan_edit-back").attr('href', '#assessment_improve_plan/' + self.model.get('_id') + '/' + lx + '/' + pi);
            // $("#btn-assessment_improve_plan-add").attr('href', '#assessment_improve_plan/' + self.model.get('_id') + '/' + lx + '/' + pi + '/' + ol + '/add');
            // console.log(render_data);
            $("#assessment_improve_plan_edit-content").html(self.template(render_data));
            $("#assessment_improve_plan_edit-content").trigger('create');
            // Maintains chainability
            //把 a 换成 span， 避免点那个滑块的时候页面跳走。
            $(".ui-flipswitch a").each(function() {
                $(this).replaceWith("<span class='" + $(this).attr('class') + "'></span>");
            });
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
        post_to_work_plan: function(cb) { //同步到个人工作计划中。
            var self = this;
            var post_data = {
                origin_oid: self.model.get('_id'),
                origin_cat: 'wip'
            };
            $.post('/admin/pm/work_plan/remove_by_origin', post_data, function(data, textStatus, xhr) {
                if (data.code == 'OK') { //删除成功
                    // return;
                    var create_event = function(title, description, start, end, finished) {
                            var new_event = {
                                creator: $("#login_people").val(),
                                people: self.model.get('people'),
                                title: title,
                                allDay: true,
                                start: moment(start).format('YYYY-MM-DD'),
                                end: moment(end).format('YYYY-MM-DD'),
                                tags: '绩效过程,改进措施,' + self.model.get('ai_name'),
                                url: '/admin/pm/assessment_instance/wip/bbform?ai_id=' + self.model.get('_id'),
                                origin_oid: self.model.get('_id'),
                                origin_cat: 'wip',
                                editable: false,
                                startEditable: false,
                                durationEditable: false,
                                origin: '1',
                                is_complete: finished,
                            };
                            new_event.description = description;
                            new TaskModel(new_event).save(); //<- need todo
                        }
                        //定量指标
                    _.each(self.model.attributes.quantitative_pis.items, function(x) {
                        if (x.wip_summary.length) { //单指标，整体的改进措施
                            _.each(x.wip_summary, function(y) {
                                var title = '改进措施:' + y.improvement_plan;
                                var description = [
                                    '偏差分析:' + y.gap_analysis,
                                    '改进措施:' + y.improvement_plan,
                                    '考核指标:' + x.pi_name,
                                    '支撑目标:' + x.ol_name,
                                    '绩效合同:' + self.model.get('ai_name'),
                                ];
                                create_event(title, description.join('\n'), y.start, y.end, y.finished);
                            })
                        };
                        if (x.segments.length) { //对于有小周期的情况
                            _.each(x.segments, function(y) {
                                if (y.segment_summary.length) {
                                    _.each(y.segment_summary, function(z) {
                                        var title = '改进措施:' + z.improvement_plan;
                                        var description = [
                                            '偏差分析:' + z.gap_analysis,
                                            '改进措施:' + z.improvement_plan,
                                            '小周期名:' + y.segment_name,
                                            '考核指标:' + x.pi_name,
                                            '支撑目标:' + x.ol_name,
                                            '绩效合同:' + self.model.get('ai_name'),
                                        ];
                                        create_event(title, description.join('\n'), z.start, z.end, z.finished);
                                    })
                                };
                            })
                        };
                    })
                    //定量指标
                    _.each(self.model.attributes.qualitative_pis.items, function(x) {
                        if (x.wip_summary.length) { //单指标，整体的改进措施
                            _.each(x.wip_summary, function(y) {
                                var title = '改进措施:' + y.improvement_plan;
                                var description = [
                                    '偏差分析:' + y.gap_analysis,
                                    '改进措施:' + y.improvement_plan,
                                    '考核指标:' + x.pi_name,
                                    '支撑目标:' + x.ol_name,
                                    '绩效合同:' + self.model.get('ai_name'),
                                ];
                                create_event(title, description.join('\n'), y.start, y.end, y.finished);
                            })
                        };
                        if (x.segments.length) { //对于有小周期的情况
                            _.each(x.segments, function(y) {
                                if (y.segment_summary.length) {
                                    _.each(y.segment_summary, function(z) {
                                        var title = '改进措施:' + z.improvement_plan;
                                        var description = [
                                            '偏差分析:' + z.gap_analysis,
                                            '改进措施:' + z.improvement_plan,
                                            '小周期名:' + y.segment_name,
                                            '考核指标:' + x.pi_name,
                                            '支撑目标:' + x.ol_name,
                                            '绩效合同:' + self.model.get('ai_name'),
                                        ];
                                        create_event(title, description.join('\n'), z.start, z.end, z.finished);
                                    })
                                };
                            })
                        };
                    })
                    cb(null, 'OK');
                };
            });
        },
        bind_events: function() {
            var self = this;
            $("#assessment_improve_plan_edit-content")
                .on('click', '#btn-pi_ip-save', function(event) {
                    event.preventDefault();
                    var $this = $(this);
                    var $C = $("#assessment_improve_plan_edit-content");
                    //从表单取值
                    var tmp_ws = {};
                    tmp_ws.gap_analysis = $C.find("#pi_gap_analysis").val();
                    tmp_ws.improvement_plan = $C.find("#pi_improvement_plan").val();
                    tmp_ws.start = $C.find("#pi_start").val();
                    tmp_ws.end = $C.find("#pi_end").val();
                    tmp_ws.finished = $C.find("#pi_finished").val() == 'true' ? true : false;
                    tmp_ws.createDate = new Date();
                    //validate form data
                    if (!tmp_ws.gap_analysis) {
                        alert('请输入偏差分析的内容');
                        return;
                    };
                    if (!tmp_ws.improvement_plan) {
                        alert('请输入改进措施的内容');
                        return;
                    };
                    if (new Date(tmp_ws.start) > new Date(tmp_ws.end)) {
                        alert('开始时间不能大于结束时间');
                        return;
                    };
                    // console.log(tmp_ws);
                    //保存
                    if (self.ip_id == 'new') { //新加的一条，push进去
                        if (self.seg_name == '-') { //在指标层级来找
                            self.pi_data.wip_summary.push(tmp_ws);
                        } else { //在小周期层级来找
                            var tmp = self.get_pi(self.lx, self.pi);
                            //先找到小周期
                            var seg = _.find(tmp.segments, function(x) {
                                return x.segment_name == self.seg_name;
                            })
                            if (seg) {
                                seg.segment_summary.push(tmp_ws);
                            };
                        };
                    } else {
                        var tmp = self.get_pi(self.lx, self.pi);
                        var found;
                        if (self.seg_name == '-') { //在指标层级来找
                            found = _.find(tmp.wip_summary, function(x) {
                                return x._id == self.ip_id;
                            })

                        } else { //在小周期层级来找
                            //先找到小周期
                            var seg = _.find(tmp.segments, function(x) {
                                return x.segment_name == self.seg_name;
                            })
                            if (seg) {
                                found = _.find(seg.segment_summary, function(x) {
                                    return x._id == self.ip_id;
                                })
                            };
                        };
                        if (found) {
                            found.gap_analysis = tmp_ws.gap_analysis;
                            found.improvement_plan = tmp_ws.improvement_plan;
                            found.start = tmp_ws.start;
                            found.end = tmp_ws.end;
                            found.finished = tmp_ws.finished;
                        };
                        // console.log(found);
                    };

                    // console.log(self.model.attributes.quantitative_pis);
                    async.series({
                        save_ip: function(cb) {
                            self.model.save().done(function() {
                                cb(null, 'OK')
                            })
                        },
                        save_task: function(cb) {
                            self.post_to_work_plan(cb);
                        },
                    }, function(err, result) {
                        // $("#assessment_improve_plan_edit_msg_content").html('保存成功！')
                        // $("#btn-assessment_improve_plan_edit_msg_ok").attr('href', '#assessment_improve_plan/' + self.model.get('_id') + '/' + self.lx + '/' + self.pi)
                        // $("#assessment_improve_plan_edit_msg").popup('open', {
                        //     transition: 'slidedown'
                        // });
                        alert('保存成功');
                        window.setTimeout(function() {
                            window.location.href = '#assessment_improve_plan/' + self.model.get('_id') + '/' + self.lx + '/' + self.pi;
                        }, 100);
                    })
                    // self.model.save().done(function() {

                    //     // self.render(self.lx, self.pi, self.ol, self.ip_id, self.seg_name);

                    // })
                })
                .on('click', '#btn-pi_ip-remove', function(event) {
                    event.preventDefault();
                    if (self.ip_id == 'new') {
                        alert('新建时不能删除！\n如果要取消新建，请点击右上角的后退按钮。')
                    } else {
                        if (confirm('确认删除吗？')) {
                            var tmp = self.get_pi(self.lx, self.pi);
                            var found;
                            if (self.seg_name == '-') { //在指标层级来找
                                found = _.find(tmp.wip_summary, function(x) {
                                    return x._id == self.ip_id;
                                })
                                if (found) { //找到了，删掉
                                    tmp.wip_summary.splice(tmp.wip_summary.indexOf(found), 1);
                                };

                            } else { //在小周期层级来找
                                //先找到小周期
                                var seg = _.find(tmp.segments, function(x) {
                                    return x.segment_name == self.seg_name;
                                })
                                if (seg) {
                                    found = _.find(seg.segment_summary, function(x) {
                                        return x._id == self.ip_id;
                                    })
                                    if (found) { //找到了，删掉
                                        seg.segment_summary.splice(seg.segment_summary.indexOf(found), 1);
                                    };
                                };
                            };

                            // console.log(self.model.attributes.quantitative_pis);
                            self.model.save().done(function() {
                                // $("#assessment_improve_plan_edit_msg_content").html('删除成功！')
                                // $("#btn-assessment_improve_plan_edit_msg_ok").attr('href', '#assessment_improve_plan/' + self.model.get('_id') + '/' + self.lx + '/' + self.pi)
                                // $("#assessment_improve_plan_edit_msg").popup('open', {
                                //     transition: 'slidedown'
                                // });
                                alert('删除成功');
                                window.setTimeout(function() {
                                    window.location.href = '#assessment_improve_plan/' + self.model.get('_id') + '/' + self.lx + '/' + self.pi;
                                }, 100);
                                // self.render(self.lx, self.pi, self.ol, self.ip_id, self.seg_name);

                            })
                        };
                    };

                });

        }
    });

    // Returns the View class
    return AssessmentImprovePlanEditView;

});