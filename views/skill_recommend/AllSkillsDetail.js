// CollTask List View
// =================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "moment"],
    function($, _, Backbone, Handlebars, moment) {

        // Extends Backbone.View
        var ListAllSkillsView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                var self = this;
                this.template = Handlebars.compile($("#show_all_skills_view").html());
                // The render method is called when CollTask Models are added to the Collection

            },

            // Renders all of the CollTask models on the UI
            render: function() {
                var self = this;
                $('#btn-all_skills-back').attr('href', '#show_people_skill/' + self.model.get('_id'))
                var w_width = $(document.body).width();
                var w_num = parseInt(w_width / 40) - 1 //计算手机屏幕能放几个图片
                var all_skills = self.model.get('my_skills');
                var items = [];
                _.each(all_skills, function(skill) {
                    var o = {};
                    o.people_id = self.model.get('_id');
                    o.skill_id = skill.skill._id;
                    o.skill_name = skill.skill.skill_name;
                    var praise_peoples = skill.praise_peoples;
                    o.praise_peoples = praise_peoples.length;
                    o.tps = praise_peoples.length > 2 ? praise_peoples.slice(0, 2) : praise_peoples;
                    o.bls = praise_peoples.length > 2 ? praise_peoples.slice(1, praise_peoples.length) : 0;
                    if (o.bls) {
                        var bs = o.bls;

                        o.avatars = bs.length > w_num ? bs.slice(0, w_num) : bs
                        o.avatars_legnth = bs.length > w_num ? bs.length - w_num - 1 : 0
                    };
                    items.push(o)

                })
                $("#show_all_skills-content").html(self.template({
                    my_skills: items
                }));
                $("#show_all_skills-content").trigger('create');
                return this
            },

        });

        // Returns the View class
        return ListAllSkillsView;

    });