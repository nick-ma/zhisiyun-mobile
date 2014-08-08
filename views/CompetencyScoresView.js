// Competency Scores  View
// =======================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "models/PeopleModel"],
    function($, _, Backbone, Handlebars, PeopleModel) {

        // Extends Backbone.View
        var CompetencyScoresView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                var self = this;
                this.template = Handlebars.compile($("#hbtmp_competency_scores_view").html());
                this.template_detail = Handlebars.compile($("#hbtmp_competency_detail_view").html());
                // The render method is called when People Models are added to the Collection
                // this.collection.on("sync", this.render, this);
                // this.model_view = '0';
                this.competencys = [];
                this.cls = {};
                self.ct_id = null;
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
                if (self.model_view == '0') {
                    var render_data = _.find(self.model.get('competencies'), function(x) {
                        return x._id == self.cid;
                    });
                    if (self.people_id == 'self') { //根据不同的来源设置返回的页面
                        $("#btn-competency_scores-back").attr('href', '#myprofile');
                    } else {
                        $("#btn-competency_scores-back").attr('href', '#myteam_detail/' + self.people_id + '/basic');

                    };
                    render_data.people_id = self.people_id;
                    render_temp = self.template(render_data)

                } else {
                    var f_d = _.find(this.competencys, function(cy) {
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
                    // console.log($(this).data('ct_id'));
                    // console.log('========');
                })
            }

        });

        // Returns the View class
        return CompetencyScoresView;

    });