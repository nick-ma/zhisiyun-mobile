// MyTeam Assessment View 绩效合同的单条指标查看页面
// =====================================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "moment", "models/AssessmentModel"], function($, _, Backbone, Handlebars, moment, AssessmentModel) {

    // Extends Backbone.View
    var MyTeamAssessmentDetailView = Backbone.View.extend({
        // The View Constructor
        initialize: function() {
            this.template = Handlebars.compile($("#hbtmp_myteam_assessment_detail_view").html());

            // The render method is called when Assessment Models are added to the Collection
            // this.model.on("sync", this.render, this);
            this.bind_event();
        },

        // Renders all of the Assessment models on the UI
        render: function(people_id, lx, pi) {
            var self = this;
            // console.log('render: ', lx, pi, ol);
            // console.log(self.model);
            var render_data = self.get_pi(lx, pi);
            render_data._id = self.model.get('_id');
            render_data.lx = lx;
            render_data.people_id = people_id;
            // 把下面小周期的留言也加进来
            render_data.comments_all = _.clone(render_data.comments);
            if (render_data.segments.length) { //
                _.each(render_data.segments, function(x) {
                    if (x.comments.length) {
                        _.each(x.comments, function(y) {
                            var y2 = _.clone(y);

                            y2.comment = '[' + x.segment_name + ']' + y2.comment;
                            render_data.comments_all.push(y2);
                        })
                    };
                })
            };
            render_data.comments_all = _.sortBy(render_data.comments_all, function(x) { //安时间倒叙排
                return -(new Date(x.createDate));
            })
            if (render_data.comments_all.length) {
                render_data.comment_last_update = render_data.comments_all[0].createDate;
            };
            render_data.comment_nums = render_data.comments_all.length;
            // 实际值更新的统计数据
            if (render_data.actual_value_revise.length) {
                render_data.actual_value_last_update = render_data.actual_value_revise[render_data.actual_value_revise.length - 1].timestamp;
            };
            // 分析与改进的统计数据
            render_data.wip_summary_all = _.clone(render_data.wip_summary);
            if (render_data.segments.length) {
                _.each(render_data.segments, function(x) {
                    if (x.segment_summary.length) {
                        _.each(x.segment_summary, function(y) {
                            render_data.wip_summary_all.push(_.clone(y));
                        })
                    };
                })
            };
            render_data.wip_summary_all = _.sortBy(render_data.wip_summary_all, function(x) { //安时间倒叙排
                return -(new Date(x.createDate));
            })
            if (render_data.wip_summary_all.length) {
                render_data.improve_plan_last_update = render_data.wip_summary_all[0].createDate;
            };
            render_data.improve_plan_nums = render_data.wip_summary_all.length;
            // 计分公式或者评分标准
            // console.log(self.scoringformula);
            if (lx == 'dl') { //只有定量指标才有计分公式
                var found = _.find(self.scoringformula.models, function(x) {
                    return x.get('_id') == render_data.scoringformula;
                })
                render_data.pf = (found) ? found.get('sf_description') : '';
            } else if (lx == 'dx') {
                if (self.model.attributes.qualitative_pis.grade_way == 'G') { //手工打分
                    var found = _.find(self.gradegroup.models, function(x) {
                        // console.log(x.get('_id'), self.model.attributes.qualitative_pis.grade_group);
                        return x.get('_id') == self.model.attributes.qualitative_pis.grade_group;
                    })
                    render_data.pf = (found) ? found.get('gg_description') : '';
                } else {
                    render_data.pf = render_data.pi_sc_description;
                };
            };
            $("#btn-myteam_assessment_detail-back").attr('href', '#myteam_assessment_pi_list/' + people_id + '/' + self.model.get('_id'));
            // console.log(render_data);
            $("#myteam_assessment_detail-content").html(self.template(render_data));
            $("#myteam_assessment_detail-content").trigger('create');
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
        bind_event: function() {
            var self = this;
            $("#myteam_assessment_detail-content").on('click', '#btn_start_userchat', function(event) {
                event.preventDefault();
                var url = 'im://userchat/' + self.model.get('people');
                console.log(url);
                window.location.href = url;
            });
        }

    });

    // Returns the View class
    return MyTeamAssessmentDetailView;

});