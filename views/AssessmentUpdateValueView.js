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
            $("#assessment_update_value-content").on('change', '#segment_select', function(event) {
                event.preventDefault();
                var $this = $(this);
                var lx = $this.data('lx');
                var pi = $this.data('pi');
                var ol = $this.data('ol');
                var pi_data = self.get_pi(lx, pi, ol);
                var segment = pi_data.segments[$this.val()];
                self.render(lx,pi,ol,segment);
                // console.log(pi_data, segment);

            });
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
        render: function(lx, pi, ol, current_seg) {
            var self = this;
            // console.log('render: ', lx, pi, ol);
            var render_data = {};
            render_data = self.get_pi(lx, pi, ol);
            render_data.lx = lx;
            render_data.pi = pi;
            render_data.ol = ol;
            render_data.login_people = $("#login_people").val();
            var now = moment();
            var now_seg = current_seg || _.find(render_data.segments, function(x) {
                return (now >= moment(x.start) && now <= moment(x.end))
            })
            render_data.now_seg = now_seg || render_data.segments[0]; //如果没找到当前期间，则给出第一个段。
            // render_data.comments
            $("#btn-assessment_update_value-back").attr('href', '#assessment_detail/' + self.model.get('_id') + '/' + lx + '/' + pi + '/' + ol);
            // console.log(render_data);
            $("#assessment_update_value-content").html(self.template(render_data));
            $("#assessment_update_value-content").trigger('create');
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
    return AssessmentUpdateValueView;

});