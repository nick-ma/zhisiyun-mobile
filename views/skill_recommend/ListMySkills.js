// CollTask List View
// =================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "moment"],
    function($, _, Backbone, Handlebars, moment) {

        // Extends Backbone.View
        var MySkillsListView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                var self = this;
                this.template = Handlebars.compile($("#my_skills_view").html());
                // The render method is called when CollTask Models are added to the Collection
                this.bind_event();
            },

            // Renders all of the CollTask models on the UI
            render: function() {
                var self = this;
                var w_width = $(document.body).width();
                var w_num = parseInt(w_width / 40) - 1 //计算手机屏幕能放几个图片
                var all_skills = self.model.get('my_skills');
                var items = [];
                _.each(all_skills, function(skill) {
                    _.each(skill.praise_peoples, function(s) {
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
                $("#my_skills-content").html(self.template(o));
                $("#my_skills-content").trigger('create');
                return this
            },
            bind_event: function() {
                var self = this;
                $("#my_skills")
                    .on('swiperight', function(event) { //向右滑动，打开左边的面板
                        event.preventDefault();
                        $("#show_my_skills-left-panel").panel("open");
                    })
                    .on('click', '#btn-show_my_skills-change_view', function(event) {
                        event.preventDefault();
                        window.location = '#skill_config'
                        $("#show_my_skills-left-panel").panel("close");
                    })
            }
        });

        // Returns the View class
        return MySkillsListView;

    });