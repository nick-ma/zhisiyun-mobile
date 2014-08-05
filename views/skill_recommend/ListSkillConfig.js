// CollTask List View
// =================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "moment"],
    function($, _, Backbone, Handlebars, moment) {

        // Extends Backbone.View
        var ListSkillConfigView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                var self = this;
                this.template = Handlebars.compile($("#show_skill_config_view").html());
                this.skill_recommend_template = Handlebars.compile($("#show_skill_recommend_view").html());
                // The render method is called when CollTask Models are added to the Collection
                this.bind_event();
            },
            // Renders all of the CollTask models on the UI
            render: function() {
                var self = this;
                if (self.type == 'RE') {
                    $("#filter_skill").val('')
                    $("#btn-skill_recommend-back").attr('href', '#show_people_skill/' + self.model.get("_id"))
                    var render_data = {
                        people_id: self.model.get("_id"),
                        skills: _.map(this.collection, function(x) {
                            return x;
                        })
                    }
                    $("#show_skill_recommend-content").html(self.skill_recommend_template(render_data));
                    $("#show_skill_recommend-content").trigger('create');
                } else if (self.type == 'DE') {
                    $("#is_active").addClass('ui-btn-active');
                    $("#is_skill_bank").removeClass('ui-btn-active');
                    $("#show_skill_config-content").html(self.template(self.model.attributes));
                    $("#show_skill_config-content").trigger('create');
                    $("#is_show_filter").hide();
                }

                return this
            },
            bind_event: function() {
                var self = this;
                $("#show_skill_config-content").on('click', '#delete_skill', function(event) {
                    event.preventDefault();
                    if (confirm('确认删除此技能吗？')) {
                        self.model.set('type', 'D')
                        self.model.set('skill_id', $(this).attr("skill_id"))
                        self.model.save().done(function() {
                            self.model.fetch().done(function() {
                                self.render();
                            })
                        })
                    }
                })
                $("#show_skill_recommend").on('keyup', '#filter_skill', function(event) {
                    event.preventDefault();
                    var skill = $(this).val();
                    if (skill) {
                        var filters = _.filter(self.collection, function(filter) {

                            return filter.skill_name.indexOf(skill) == 0 ? true : false
                        })
                    } else {
                        var filters = self.collection;
                    }
                    var render_data = {
                        people_id: self.model.get("_id"),
                        skills: _.sortBy(_.map(filters, function(x) {
                            return x;
                        }), function(x) {
                            return x.fl;
                        })
                    }
                    $("#show_skill_recommend-content").html(self.skill_recommend_template(render_data));
                    $("#show_skill_recommend-content").trigger('create');
                }).on('click', '#bt_create_skill', function(event) {
                    event.preventDefault();
                    var skill_name = $("#filter_skill").val();
                    self.model.set('type', 'C');
                    self.model.set('skill_name', skill_name);
                    self.model.save().done(function() {
                        self.model.fetch().done(function() {
                            self.skills.fetch().done(function() {
                                window.location = "#show_people_skill/" + self.model.get("_id")
                            })
                        })
                    })
                }).on('swiperight', function(event) { //向右滑动，打开左边的面板
                    event.preventDefault();
                    $("#show_skill_recommend-left-panel").panel("open");
                }).on("click", '#btn-skill_recommend-change_view', function(event) {
                    event.preventDefault();
                    self.skills.fetch().done(function() {
                        var skills = self.model.get('my_skills');
                        self.type = 'RE';
                        var items = []
                        self.skills.each(function(skill) {
                            var f_d = _.find(skills, function(s) {
                                return s.skill._id == skill.get('_id')
                            })
                            if (!f_d) {
                                items.push({
                                    _id: skill.get('_id'),
                                    skill_name: skill.get('skill_name')
                                })
                            };
                        })

                        self.collection = items;
                        self.render();

                        $("#show_skill_recommend-left-panel").panel("close");
                    })
                })

            }
        });

        // Returns the View class
        return ListSkillConfigView;

    })