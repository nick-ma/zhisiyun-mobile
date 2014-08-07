// Assessment Comment View 绩效合同的单条指标互动交流信息的查看与编辑页面
// =============================================================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "moment", "../../models/AssessmentModel"], function($, _, Backbone, Handlebars, moment, AssessmentModel) {

    // Extends Backbone.View
    var AssessmentCommentView = Backbone.View.extend({
        // The View Constructor
        initialize: function() {
            this.template = Handlebars.compile($("#hbtmp_assessment_comment_view").html());
            // this.bind_events();
            // The render method is called when Assessment Models are added to the Collection
            // this.model.on("sync", this.render, this);
            var self = this;
            self.bind_event();

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
            render_data.comments_all = _.clone(render_data.comments);
            // 把下面小周期的留言也加进来
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
            // console.log(render_data);
            $("#btn-assessment_comment-back").attr('href', '#assessment_detail/' + self.model.get('_id') + '/' + lx + '/' + pi);
            // console.log(render_data);
            $("#assessment_comment-content").html(self.template(render_data));
            $("#assessment_comment-content").trigger('create');
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
            $("#assessment_comment-content").on('change', '#pi_new_comment', function(event) {
                event.preventDefault();
                var $this = $(this);
                var lx = $this.data('lx');
                var pi = $this.data('pi');
                // console.log($this.val());
                var tmp_data = self.get_pi(lx, pi);
                //增加一条新留言
                tmp_data.comments.push({
                    comment: $this.val(),
                    people_name: $("#login_people_name").val(),
                    position_name: $("#login_position_name").val(),
                    avatar: $("#login_avatar").val(),
                    creator: $("#login_people").val(),
                    createDate: new Date()
                })
                tmp_data.comments = _.sortBy(tmp_data.comments, function(x) {
                    return (new Date(x.createDate));
                })
                $this.val('');
                self.model.save().done(function() {
                    self.render(lx, pi);
                })
            });
        }

    });

    // Returns the View class
    return AssessmentCommentView;

});