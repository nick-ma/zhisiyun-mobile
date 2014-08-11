// Competency Scores  View
// =======================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "models/PeopleModel"],
    function($, _, Backbone, Handlebars, PeopleModel) {
        var type = 'self';
        // var self_obj = {};
        // Extends Backbone.View
        Handlebars.registerHelper('is_null', function(data, options) {
            if (data) {
                return options.fn(this);
            } else {
                return options.inverse(this);
            };
        });
        var CompetencyScoresView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                var self = this;
                this.template_detail = Handlebars.compile($("#hbtmp_competency_detail_view").html());

                $.get('/admin/om/competency_client/cl', function(data) {
                    self.cls = data;
                })
            },

            // Renders all of the People models on the UI
            render: function() {
                var self = this;
                if (self.people == 'self') { //根据不同的来源设置返回的页面
                    $("#btn-competency_scores-back").attr('href', '#competency_scores/' + self.ct_id);
                } else {
                    $("#btn-competency_scores-back").attr('href', '#myteam_competency_scores/' + self.people + '/' + self.ct_id);

                };
                var f_d = _.find(self.collection.toJSON(), function(cy) {
                    return cy._id == self.ct_id
                })
                var f_c = _.find(self.cls.levels, function(cl) {
                    return cl.level == f_d.level
                })
                f_d.items = [];
                _.each(f_c.level_title, function(tt) {
                    tt.code
                    var o = {};
                    o.name = tt.title + '(' + tt.low + '~' + tt.high + ')'
                    o.desc = f_d['l' + tt.code + '_descrpt']
                    f_d.items.push(o)

                });

                $("#competency_scores-content").html(self.template_detail(f_d));
                $("#competency_scores-content").trigger('create');
                return this;
            },

        });

        // Returns the View class
        return CompetencyScoresView;

    });