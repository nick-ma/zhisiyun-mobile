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
                this.template = Handlebars.compile($("#hbtmp_competency_scores_view").html());
                this.template_detail = Handlebars.compile($("#hbtmp_competency_detail_view").html());
                // The render method is called when People Models are added to the Collection
                // this.collection.on("sync", this.render, this);
                this.competencys = [];
                this.cls = {};
                this.ct_id = null;
                this.bind_event();
                $.get('/admin/om/competency_client/bb', function(data) {
                    self.competencys = data
                });
                $.get('/admin/om/competency_client/cl', function(data) {
                    self.cls = data;
                })
            },

            // Renders all of the People models on the UI
            render: function() {
                var self = this;
                var render_temp = '';
                type = self.people_id;
                if (self.model_view == '0') {
                    var render_data = _.find(self.model.get('competencies'), function(x) {
                        return x._id == self.cid;
                    });

                    render_data.people_id = self.people_id;
                    render_temp = self.template(render_data)

                } else {
                    var f_d = _.find(self.competencys, function(cy) {
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
                    render_temp = self.template_detail(f_d)

                }
                $("#competency_scores-content").html(render_temp);
                $("#competency_scores-content").trigger('create');
                return this;
            },
            bind_event: function() {
                var self = this
                $('#competency_scores-content').on('click', '.btn_detail', function(event) {
                    event.preventDefault();
                    self.ct_id = $(this).data('ct_id')
                    self.model_view = '1';
                    self.render();
                })
                $('#competency_scores').on('click', '#btn-competency_scores-back', function(event) {
                    event.preventDefault();
                    if (self.model_view == '1') {
                        window.location.href = "#myprofile"
                    } else {
                        if (type == 'self') { //根据不同的来源设置返回的页面
                            window.location.href = "#myprofile"
                        } else {
                            window.location.href = '#myteam_detail/' + type + '/basic'

                        };
                    }


                })
            }

        });

        // Returns the View class
        return CompetencyScoresView;

    });