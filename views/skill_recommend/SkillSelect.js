// Skill Select View
// =================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "moment"],
    function($, _, Backbone, Handlebars, moment) {

        // Extends Backbone.View
        var SkillSelectView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                var self = this;
                this.template_m = Handlebars.compile($("#hbtmp_skill_select_view").html()); //多选
                this.template_s = Handlebars.compile($("#hbtmp_skill_select_single_view").html()); //单选
                this.bind_event();
            },

            // Renders all of the CollTask models on the UI
            render: function(select_mode) {
                var self = this;
                self.select_mode = select_mode || 'm'; //默认多选
                var render_data = {
                    skills: _.map(self.collection.models, function(x) {
                        return x.toJSON();
                    }),
                    // cp_id: self.cp_id,
                }
                var first_el;
                if (self.select_mode == 'm') {
                    $("#skill_select-content").html(self.template_m(render_data));
                    //当前应该选中的变成选中
                    var skh = JSON.parse(localStorage.getItem('sk_helper'));
                    if (skh.model[self.target_field]) {
                        var $container = $("#skill_select-content");
                        _.each(skh.model[self.target_field], function(x) {
                            $container.find("#cb-skill-" + x._id).attr('checked', true);
                        })
                    };
                } else if (self.select_mode == 's') {
                    $("#skill_select-content").html(self.template_s(render_data));
                    var skh = JSON.parse(localStorage.getItem('sk_helper'));
                    if (skh.model[self.target_field]) {
                        $("#skill_select-content").find('#rd-skill-' + skh.model[self.target_field]['_id']).attr('checked', true);
                        first_el = '#rd-skill-' + skh.model[self.target_field]['_id'];
                    }
                };
                $("#skill_select-content").trigger('create');
                window.setTimeout(function() {
                    if ($("#skill_select-content input:checked").length && $("#skill_select-content input:checked").offset().top > 75) {
                        $.mobile.silentScroll($("#skill_select-content input:checked").offset().top - 75)
                    };
                }, 1000);
                return this
            },
            bind_event: function() {
                var self = this;
                $("#skill_select")
                    .on('click', '#btn-skill_select-ok', function(event) {
                        event.preventDefault();
                        console.log(self.collection);
                        if (self.select_mode == 'm') {
                            var skill_selected = _.map($("#skill_select-content input[type=checkbox]:checked"), function(x) {
                                console.log(x.value);
                                return self.collection.get(x.value);
                            });
                            console.log(skill_selected);
                            //获取相关的helper数据
                            var skh = JSON.parse(localStorage.getItem('sk_helper'));
                            skh.model[self.target_field] = _.map(skill_selected, function(x) {
                                return _.pick(x.toJSON(), ['_id', 'skill_name']);
                            })
                            //写回去
                            localStorage.setItem('sk_helper_back', JSON.stringify(skh));
                            window.location.href = skh.back_url; //返回调用界面
                        } else if (self.select_mode == 's') {
                            var skill_selected = self.collection.get($("#skill_select-content input[type=radio]:checked").val());
                            //获取相关的helper数据
                            var skh = JSON.parse(localStorage.getItem('sk_helper'));
                            skh.model[self.target_field] = _.pick(skill_selected.toJSON(), ['_id', 'skill_name']);
                            //写回去
                            localStorage.setItem('sk_helper_back', JSON.stringify(skh));
                            window.location.href = skh.back_url; //返回调用界面
                        };

                    })
                    .on('click', '#btn-skill_select-back', function(event) {
                        event.preventDefault();
                        //获取相关的helper数据
                        var skh = JSON.parse(localStorage.getItem('sk_helper'));
                        window.location.href = skh.back_url; //返回调用界面
                    });
            }
        });

        // Returns the View class
        return SkillSelectView;

    });