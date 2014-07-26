// CollTask List View
// =================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "moment"],
    function($, _, Backbone, Handlebars, moment) {

        // Extends Backbone.View
        var ListSkillAcceptView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                var self = this;
                this.template = Handlebars.compile($("#show_skill_accept_view").html());
                this.bind_event();
            },

            // Renders all of the CollTask models on the UI
            render: function() {
                var self = this;
                $('#people_skill').html(self.model.get('people_name') + '的技能');
                var login_people = $("#login_people").val()
                var self = this;
                var w_width = $(document.body).width();
                var w_num = parseInt(w_width / 40) - 1 //计算手机屏幕能放几个图片
                var all_skills = self.model.get('my_skills');
                var items = [];
                _.each(all_skills, function(skill) {
                    skill.is_in = 'ui-icon-plus';
                    skill.mark = '';
                    skill.margin_top = '2px';
                    skill.margin_up = '2px';
                    _.each(skill.praise_peoples, function(s) {
                        if (s.people._id == login_people) {
                            skill.is_in = 'ui-icon-minus';
                            skill.mark = '已认可';
                            skill.margin_top = '5px';
                            skill.margin_up = '-2px'
                        };
                        var f_d = _.find(items, function(item) {
                            return item._id == s.people._id
                        })
                        if (!f_d) {
                            items.push({
                                _id: s.people._id,
                                name: s.people.people_name,
                                avatar: s.people.avatar
                            })
                        };
                    })
                })
                var o = self.model.attributes;
                o.avatars = items.length > w_num ? items.slice(0, w_num) : items
                o.avatars_legnth = items.length > w_num ? items.length - w_num : 0
                $("#show_skill_accept-content").html(self.template(o));
                $("#show_skill_accept-content").trigger('create');
                return this
            },
            bind_event: function() {
                var self = this;
                $("#show_skill_accept-content").on('click', '#btn-skill-update', function(event) {
                    event.preventDefault();
                    self.model.set('type', 'P')
                    self.model.set('skill_id', $(this).attr("skill_id"))
                    self.model.save().done(function() {
                        self.model.fetch().done(function() {
                            self.render();
                        })
                    })
                }).on('change', 'ul', function(event) {
                    console.log('++++++++++');
                })
                $("#show_skill_accept")
                    .on('swiperight', function(event) { //向右滑动，打开左边的面板
                        event.preventDefault();
                        $("#show_skill_accept-left-panel").panel("open");
                    })
                    .on('click', '#btn-show_skill_accept-change_view', function(event) {
                        event.preventDefault();
                        window.location = '#skill_recommend/' + self.model.get('_id')
                        $("#show_skill_accept-left-panel").panel("close");
                    })
            }
        });

        // Returns the View class
        return ListSkillAcceptView;

    });