// CollTask List View
// =================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "moment"],
    function($, _, Backbone, Handlebars, moment) {

        // Extends Backbone.View
        var ListSingleSkillView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                var self = this;
                this.single_show_skill_template = Handlebars.compile($("#show_skill_view").html());
                this.show_skill_ranking_template = Handlebars.compile($("#show_skill_ranking_view").html());
                this.skill_score_template = Handlebars.compile($("#show_skill_score_view").html());
                // The render method is called when CollTask Models are added to the Collection
                this.bind_event();
                this.view_mode = 'single_show_skill'; //初始化为点赞明细
                this.type_obj = {
                    '1': '任 务',
                    '2': '项 目',
                    '3': '课 程'
                }
            },

            // Renders all of the CollTask models on the UI
            render: function() {
                var self = this;
                $('#btn-single_skill-back').attr('href', '#show_people_skill/' + self.model.get('_id'))
                var skill_id = self.skill_id;
                var people = self.model.toJSON();
                var f_d = _.find(people.my_skills, function(s) {
                    return s.skill._id == skill_id
                })
                var rendered = '';
                if (self.view_mode == 'single_show_skill') {
                    $("#title_skill_show").html('技能认可明细')
                    rendered = self.single_show_skill_template(f_d)
                } else if (self.view_mode == 'show_skill_ranking') {
                    $("#title_skill_show").html('技能认可排名')
                    var peoples = self.skillrecommends.toJSON();
                    console.log(peoples);
                    var items = [];
                    _.each(peoples, function(people) {
                        var o = _.pick(people, '_id', 'people_name', 'avatar', 'position_name', 'ou_name')

                        var f_p = _.find(people.my_skills, function(skill) {
                            return skill.skill._id == skill_id
                        })
                        var f_pp = _.find(items, function(i) {
                            return i._id == o._id
                        })
                        if (!f_pp && f_p) {
                            o.skill_num = f_p.praise_peoples.length;
                            items.push(o)
                        };


                    })
                    var its = _.sortBy(items, function(item) {
                        return item.skill_num;
                    }).reverse();
                    f_d.skill_ranking = its;
                    rendered = self.show_skill_ranking_template(f_d);
                } else if (self.view_mode == 'skill_score') {
                    $("#title_skill_show").html('技能积分明细')
                    $.get("/admin/pm/skill/get_skill_integral/" + self.model.get('_id') + '/' + skill_id, function(data) {
                        var groups = _.groupBy(data, function(f) {
                            return f.psi_name + '/' + f.ref_object + '/' + f.psi_type
                        })
                        var items = [];
                        _.each(groups, function(ys, k) {
                            var sum_add = sum_value(_.pluck(ys, 'score_d'));
                            var sum_sub = sum_value(_.pluck(ys, 'score_c'));
                            var f_obj = _.first(ys);
                            var url = null;
                            if (_.last(k.split('/')) == '1') {
                                url = '#colltask_detail/' + f_obj.ref_object
                            } else if (_.last(k.split('/')) == '2') {
                                url = '#collproject_detail/' + f_obj.ref_object
                            } else {

                            }
                            var o = {
                                id: f_obj.ref_object,
                                type: self.type_obj[_.last(k.split('/'))],
                                url: url,
                                psi_name: _.first(k.split('/')),
                                score: sum_add - sum_sub,
                                role: f_obj.role
                            }
                            items.push(o)
                        })
                        f_d.tasks = items;
                        rendered = self.skill_score_template(f_d);
                        $("#show_skill-content").html(rendered);
                        $("#show_skill-content").trigger('create');
                    })
                };

                function sum_value(items) {
                    var sum = _.reduce(items, function(memo, num) {
                        return memo + num;
                    }, 0);
                    return sum;
                }


                $("#show_skill-content").html(rendered);
                $("#show_skill-content").trigger('create');
                return this
            },
            bind_event: function() {
                var self = this;
                $("#show_skill")
                    .on('swiperight', function(event) { //向右滑动，打开左边的面板
                        event.preventDefault();
                        $("#show_skill-left-panel").panel("open");
                    })
                    .on('click', '#btn-single_show_skill-change_view', function(event) {
                        event.preventDefault();
                        var $this = $(this);
                        self.view_mode = $this.data('view_mode');
                        self.render();
                        $("#show_skill-left-panel").panel("close");
                    })
                    .on('click', '#btn-show_skill_ranking-change_view', function(event) {
                        event.preventDefault();
                        var $this = $(this);
                        self.view_mode = $this.data('view_mode');
                        self.render();
                        $("#show_skill-left-panel").panel("close");
                    })
                    .on('click', '#btn-show_skill_score-change_view', function(event) {
                        event.preventDefault();
                        var $this = $(this);
                        self.view_mode = $this.data('view_mode');
                        self.render();
                        $("#show_skill-left-panel").panel("close");
                    })
            }
        });

        // Returns the View class
        return ListSingleSkillView;

    });