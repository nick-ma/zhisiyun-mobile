// MyTeam Assessment Comment View 绩效合同的单条指标互动交流信息的查看与编辑页面
// =============================================================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "moment", "models/AssessmentModel"], function($, _, Backbone, Handlebars, moment, AssessmentModel) {

    // Extends Backbone.View
    var MyTeamAssessmentCommentView = Backbone.View.extend({
        // The View Constructor
        initialize: function() {
            this.template = Handlebars.compile($("#hbtmp_myteam_assessment_comment_view").html());
            // this.bind_events();
            // The render method is called when Assessment Models are added to the Collection
            // this.model.on("sync", this.render, this);
            var self = this;
            $("#myteam_assessment_comment-content").on('change', '#pi_new_comment', function(event) {
                event.preventDefault();
                var $this = $(this);
                var lx = $this.data('lx');
                var pi = $this.data('pi');
                var ol = $this.data('ol');
                // console.log($this.val());
                var tmp_data = self.get_pi(lx, pi, ol);
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
                    self.render(self.people_id, lx, pi, ol);
                })
            });
        },

        // Renders all of the Assessment models on the UI
        render: function(people_id, lx, pi, ol) {
            var self = this;
            self.people_id = people_id;
            // console.log('render: ', lx, pi, ol);
            var render_data = {};
            render_data = self.get_pi(lx, pi, ol);
            render_data.lx = lx;
            render_data.pi = pi;
            render_data.ol = ol;
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
            $("#btn-myteam_assessment_comment-back").attr('href', '#myteam_assessment_detail/' + people_id + '/' + self.model.get('_id') + '/' + lx + '/' + pi + '/' + ol);
            // console.log(render_data);
            $("#myteam_assessment_comment-content").html(self.template(render_data));
            $("#myteam_assessment_comment-content").trigger('create');
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
    return MyTeamAssessmentCommentView;

});