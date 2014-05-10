// Assessment Improve Plan View 绩效合同的单条指标互动交流信息的查看与编辑页面
// =============================================================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "moment", "models/AssessmentModel"], function($, _, Backbone, Handlebars, moment, AssessmentModel) {

    // Extends Backbone.View
    var AssessmentImprovePlanView = Backbone.View.extend({
        // The View Constructor
        initialize: function() {
            this.template = Handlebars.compile($("#hbtmp_assessment_improve_plan_view").html());
            // this.bind_events();
            // The render method is called when Assessment Models are added to the Collection
            // this.model.on("sync", this.render, this);
            var self = this;
            // $("#assessment_comment-content").on('change', '#pi_new_comment', function(event) {
            //     event.preventDefault();
            //     var $this = $(this);
            //     var lx = $this.data('lx');
            //     var pi = $this.data('pi');
            //     var ol = $this.data('ol');
            //     // console.log($this.val());
            //     var tmp_data = self.get_pi(lx, pi, ol);
            //     //增加一条新留言
            //     tmp_data.comments.push({
            //         comment: $this.val(),
            //         people_name: $("#login_people_name").val(),
            //         position_name: $("#login_position_name").val(),
            //         avatar: $("#login_avatar").val(),
            //         creator: $("#login_people").val(),
            //         createDate: new Date()
            //     })
            //     tmp_data.comments = _.sortBy(tmp_data.comments, function(x) {
            //         return (new Date(x.createDate));
            //     })
            //     $this.val('');
            //     self.model.save().done(function() {
            //         self.render(lx, pi, ol);
            //     })
            // });
        },

        // Renders all of the Assessment models on the UI
        render: function(lx, pi, ol) {
            var self = this;
            // console.log('render: ', lx, pi, ol);
            var render_data = {};
            render_data = self.get_pi(lx, pi, ol);
            render_data.lx = lx;
            render_data.pi = pi;
            render_data.ol = ol;
            render_data.login_people = $("#login_people").val();
            render_data.ai_id = self.model.get('_id');
            // render_data.comments = _.sortBy(render_data.comments, function(x) {
            //     return -(new Date(x.createDate));
            // })
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
            // if (render_data.wip_summary_all.length) {
            //     render_data.improve_plan_last_update = render_data.wip_summary_all[0].createDate;
            // };
            // render_data.improve_plan_nums = render_data.wip_summary_all.length;
            console.log(render_data.wip_summary_all);
            $("#btn-assessment_improve_plan-back").attr('href', '#assessment_detail/' + self.model.get('_id') + '/' + lx + '/' + pi + '/' + ol);
            $("#btn-assessment_improve_plan-add").attr('href', '#assessment_improve_plan/' + self.model.get('_id') + '/' + lx + '/' + pi + '/' + ol + '/new/-');
            // console.log(render_data);
            $("#assessment_improve_plan-content").html(self.template(render_data));
            $("#assessment_improve_plan-content").trigger('create');
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
    return AssessmentImprovePlanView;

});