// MyTeam Assessment View 绩效合同的单条指标查看页面
// =====================================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "moment", "models/AssessmentModel"], function($, _, Backbone, Handlebars, moment, AssessmentModel) {

    // Extends Backbone.View
    var MyTeamAssessmentDetailView = Backbone.View.extend({
        // The View Constructor
        initialize: function() {
            this.template = Handlebars.compile($("#hbtmp_myteam_assessment_detail_view").html());
            // this.bind_events();
            // The render method is called when Assessment Models are added to the Collection
            // this.model.on("sync", this.render, this);

        },

        // Renders all of the Assessment models on the UI
        render: function(people_id, lx, pi, ol) {
            var self = this;
            // console.log('render: ', lx, pi, ol);
            var render_data = {};
            if (lx == 'dl') { //定量指标
                var dl_items = self.model.get('quantitative_pis').items;
                render_data = _.find(dl_items, function(x) {
                    if (ol) {
                        return (x.pi == pi && x.ol == ol);
                    } else {
                        return (x.pi == pi);
                    }
                })
            } else if (lx == 'dx') { //定性指标
                var dx_items = self.model.get('qualitative_pis').items;
                render_data = _.find(dx_items, function(x) {
                    if (ol) {
                        return (x.pi == pi && x.ol == ol);
                    } else {
                        return (x.pi == pi);
                    }
                })
            };
            $("#btn-myteam_assessment_detail-back").attr('href', '#myteam_assessment_pi_list/' + people_id + '/' + self.model.get('_id'));
            // console.log(render_data);
            $("#myteam_assessment_detail-content").html(self.template(render_data));
            $("#myteam_assessment_detail-content").trigger('create');
            // Maintains chainability
            return this;

        },

    });

    // Returns the View class
    return MyTeamAssessmentDetailView;

});