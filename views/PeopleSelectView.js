// PeopleSelectt View
// =================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars"],
    function($, _, Backbone, Handlebars) {

        // Extends Backbone.View
        var PeopleSelectView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                this.template_m = Handlebars.compile($("#hbtmp_people_select_view").html());
                this.template_s = Handlebars.compile($("#hbtmp_people_select_single_view").html());
                // The render method is called when PeopleSelectels are added to the Collection
                // this.collection.on("sync", this.render, this);
                this.bind_event();
            },

            // Renders all of the PeopleSelectels on the UI
            render: function(select_mode) {

                var self = this;
                // self.target_field = target_field;
                self.select_mode = select_mode || 'm'; //默认多选
                var render_data = {
                    people: _.map(self.collection.models, function(x) {
                        return x.toJSON();
                    }),
                    // cp_id: self.cp_id,
                }
                var first_el;
                if (self.select_mode == 'm') {
                    $("#people_select-content").html(self.template_m(render_data));
                    //当前应该选中的变成选中
                    var sph = JSON.parse(localStorage.getItem('sp_helper'));
                    if (sph.model[self.target_field]) {
                        var $container = $("#people_select-content");
                        _.each(sph.model[self.target_field], function(x) {
                            $container.find("#cb-" + x._id).attr('checked', true);
                        })
                    };
                } else if (self.select_mode == 's') {
                    $("#people_select-content").html(self.template_s(render_data));
                    var sph = JSON.parse(localStorage.getItem('sp_helper'));
                    if (sph.model[self.target_field]) {
                        $("#people_select-content").find('#rd-' + sph.model[self.target_field]['_id']).attr('checked', true);
                        first_el = '#rd-' + sph.model[self.target_field]['_id'];
                    }
                };
                $("#people_select-content").trigger('create');
                window.setTimeout(function() {
                    if ($("#people_select-content input:checked").length && $("#people_select-content input:checked").offset().top > 75) {
                        $.mobile.silentScroll($("#people_select-content input:checked").offset().top - 75)
                    }
                }, 1000);
                return this;

            },
            bind_event: function() {
                var self = this;
                $("#people_select")
                    .on('click', '#btn-people_select-ok', function(event) {
                        event.preventDefault();
                        if (self.select_mode == 'm') {
                            var people_selected = _.map($("#people_select-content input[type=checkbox]:checked"), function(x) {
                                return self.collection.get(x.value);
                            });
                            //获取相关的helper数据
                            var sph = JSON.parse(localStorage.getItem('sp_helper'));
                            sph.model[self.target_field] = _.map(people_selected, function(x) {
                                return _.pick(x.toJSON(), ['_id', 'people_name', 'position_name', 'ou_name', 'company_name']);
                            })
                            //写回去
                            localStorage.setItem('sp_helper_back', JSON.stringify(sph));
                            window.location.href = sph.back_url; //返回调用界面
                        } else if (self.select_mode == 's') {
                            var people_selected = self.collection.get($("#people_select-content input[type=radio]:checked").val());
                            //获取相关的helper数据
                            var sph = JSON.parse(localStorage.getItem('sp_helper'));
                            sph.model[self.target_field] = _.pick(people_selected.toJSON(), ['_id', 'people_name', 'position_name', 'ou_name', 'company_name']);
                            //写回去
                            localStorage.setItem('sp_helper_back', JSON.stringify(sph));
                            window.location.href = sph.back_url; //返回调用界面
                        };

                    })
                    .on('click', '#btn-people_select-back', function(event) {
                        event.preventDefault();
                        //获取相关的helper数据
                        var sph = JSON.parse(localStorage.getItem('sp_helper'));
                        window.location.href = sph.back_url; //返回调用界面
                    });

            },

        });

        // Returns the View class
        return PeopleSelectView;

    });