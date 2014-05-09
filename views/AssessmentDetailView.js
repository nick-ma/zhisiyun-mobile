// Assessment View 绩效合同的单条指标查看页面
// =====================================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "moment", "models/AssessmentModel"], function($, _, Backbone, Handlebars, moment, AssessmentModel) {

    // Extends Backbone.View
    var AssessmentDetailView = Backbone.View.extend({
        // The View Constructor
        initialize: function() {
            this.template = Handlebars.compile($("#hbtmp_assessment_detail_view").html());
            // this.bind_events();
            // The render method is called when Assessment Models are added to the Collection
            // this.model.on("sync", this.render, this);

        },

        // Renders all of the Assessment models on the UI
        render: function(lx, pi, ol) {
            var self = this;
            // console.log('render: ', lx, pi, ol);
            var render_data = self.get_pi(lx, pi, ol);

            render_data._id = self.model.get('_id');
            render_data.lx = lx;
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
            $("#btn-assessment_detail-back").attr('href', '#assessment_pi_list/' + self.model.get('_id'));
            // console.log(render_data);
            $("#assessment_detail-content").html(self.template(render_data));
            $("#assessment_detail-content").trigger('create');
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
        }
    });

    // Returns the View class
    return AssessmentDetailView;

});