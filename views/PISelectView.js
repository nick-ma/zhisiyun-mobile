// PI Selectt View
// =================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars"],
    function($, _, Backbone, Handlebars) {

        // Extends Backbone.View
        var PISelectView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                this.template_m = Handlebars.compile($("#hbtmp_pi_select_view").html());
                this.template_s = Handlebars.compile($("#hbtmp_pi_select_single_view").html());
                // The render method is called when PeopleSelectels are added to the Collection
                // this.collection.on("sync", this.render, this);
                this.bind_event();
            },

            // Renders all of the PeopleSelectels on the UI
            render: function(select_mode) {

                var self = this;
                // self.target_field = target_field;
                self.select_mode = select_mode || 'm'; //默认多选
                var s4 = _.filter(self.collection.models, function(x) { //先取出处于过程管理状态的绩效合同
                    return x.get('ai_status') == '4'
                });
                var render_data = {
                    pis: []
                };
                _.each(s4, function(x) {
                    // 取定量指标
                    _.each(x.get('quantitative_pis').items, function(y) {
                        var pi = _.pick(y, ['pi', 'pi_name', 'target_value', 'actual_value', 'unit', 'weight', 'score', 'f_score']);
                        pi.ai_id = x.get('_id');
                        pi.pi_lx = 'dl';
                        pi.period_name = x.get('period_name');
                        render_data.pis.push(pi);
                    })
                    // 去定性指标
                    _.each(x.get('qualitative_pis').items, function(y) {
                        var pi = _.pick(y, ['pi', 'pi_name', 'target_value', 'unit', 'weight', 'score', 'f_score']);
                        pi.ai_id = x.get('_id');
                        pi.pi_lx = 'dx';
                        pi.period_name = x.get('period_name');
                        render_data.pis.push(pi);
                    })
                })
                // console.log(render_data);
                // var render_data = {
                //     people: _.map(self.collection.models, function(x) {
                //         return x.toJSON();
                //     }),
                //     // cp_id: self.cp_id,
                // }
                var first_el;
                if (self.select_mode == 'm') {
                    $("#pi_select-content").html(self.template_m(render_data));
                    // 当前应该选中的变成选中
                    var sph = JSON.parse(localStorage.getItem('spi_helper'));
                    if (sph.model[self.target_field]) {
                        var $container = $("#pi_select-content");
                        _.each(sph.model[self.target_field], function(x) {
                            $container.find("#cb-" + x.ai_id + '-' + x.pi_id).attr('checked', true);
                        })
                    };
                } else if (self.select_mode == 's') {
                    $("#pi_select-content").html(self.template_s(render_data));
                    var sph = JSON.parse(localStorage.getItem('spi_helper'));
                    if (sph.model[self.target_field]) {
                        $("#pi_select-content").find('#rd-' + sph.model[self.target_field]['ai_id'] + '-' + sph.model[self.target_field]['pi_id']).attr('checked', true);

                    }
                };
                $("#pi_select-content").trigger('create');
                window.setTimeout(function() {
                    if ($("#pi_select-content input:checked").length) {
                        $.mobile.silentScroll($("#pi_select-content input:checked").offset().top - 75)
                    };
                }, 1000);
                return this;

            },
            bind_event: function() {
                var self = this;
                $("#pi_select")
                    .on('click', '#btn-pi_select-ok', function(event) {
                        event.preventDefault();
                        if (self.select_mode == 'm') {
                            var pi_selected = _.map($("#pi_select-content input[type=checkbox]:checked"), function(x) {
                                var $x = $(x);
                                return self.get_pi($x.data('ai_id'), $x.data('lx'), $x.data('pi'));
                                // return self.collection.get(x.value);
                            });
                            //获取相关的helper数据
                            var sph = JSON.parse(localStorage.getItem('spi_helper'));
                            sph.model[self.target_field] = _.map(pi_selected, function(x) {
                                return x;
                            })
                            //写回去
                            localStorage.setItem('spi_helper_back', JSON.stringify(sph));
                            window.location.href = sph.back_url; //返回调用界面
                        } else if (self.select_mode == 's') {
                            var $x = $("#pi_select-content input[type=radio]:checked");
                            var pi_selected = self.get_pi($x.data('ai_id'), $x.data('lx'), $x.data('pi'));
                            // var pi_selected = self.collection.get($("#pi_select-content input[type=radio]:checked").val());
                            //获取相关的helper数据
                            var sph = JSON.parse(localStorage.getItem('spi_helper'));
                            sph.model[self.target_field] = pi_selected;
                            //写回去
                            localStorage.setItem('spi_helper_back', JSON.stringify(sph));
                            window.location.href = sph.back_url; //返回调用界面
                        };

                    })
                    .on('click', '#btn-pi_select-back', function(event) {
                        event.preventDefault();
                        var sph = JSON.parse(localStorage.getItem('spi_helper'));
                        window.location.href = sph.back_url; //返回调用界面
                    });

            },
            get_pi: function(ai_id, lx, pi) {
                var self = this;
                var m = self.collection.get(ai_id);
                var ret = {
                    ai_id: ai_id,
                    pi_lx: lx,
                    pi_id: pi,
                    period_name: m.get('period_name'),
                };
                if (lx == 'dl') {
                    var found = _.find(m.get('quantitative_pis').items, function(x) {
                        return x.pi == pi
                    })
                    if (found) {
                        ret.pi_name = found.pi_name;
                    };
                } else if (lx == 'dx') {
                    var found = _.find(m.get('qualitative_pis').items, function(x) {
                        return x.pi == pi
                    })
                    if (found) {
                        ret.pi_name = found.pi_name;
                    };
                };
                return ret;
            }

        });

        // Returns the View class
        return PISelectView;

    });