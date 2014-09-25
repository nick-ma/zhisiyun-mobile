// PeopleSelectt View
// =================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars"],
    function($, _, Backbone, Handlebars) {

        // Extends Backbone.View
        var SuperiorTwitterForm2View = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                this.template = Handlebars.compile($("#hbtmp_wf_superior_twitter_form2_view").html());
                this.loading_template = Handlebars.compile($("#loading_template_view").html());

                this.bind_event();
            },
            pre_render: function() {
                var self = this;
                $("#superior_twitter_form2-content").html(self.loading_template({
                    info_msg: '数据加载中...请稍候'
                }));
                $("#superior_twitter_form2-content").trigger('create');
                return this;
            },
            // Renders all of the PeopleSelectels on the UI
            render: function() {

                var self = this;
                var twitter_data = self.collection.attributes.twitter_data;
                //推荐培养方向
                var rendered_data = _.map(twitter_data, function(x) {
                        var direct_name = _.map(_.filter(self.direct, function(temp) {
                            var position_arr = [];
                            _.each(temp.attributes.data, function(data) {
                                if (data.des_position_data) {
                                    _.each(data.des_position_data, function(des) {
                                        if (des.can_position_data) {
                                            _.each(des.can_position_data, function(can) {
                                                position_arr.push(can.can_position)
                                            })
                                        }

                                    })
                                }

                            })
                            // console.log(position_arr);
                            return !!~position_arr.indexOf(x.position)
                        }), function(temp) {
                            var obj = {};
                            obj[temp.attributes._id] = temp.attributes.direct_name;
                            return obj
                        })
                        var direct_name_b = _.map(self.direct, function(temp) {
                            var obj = {};
                            obj[temp.attributes._id] = temp.attributes.direct_name;
                            return obj
                        })
                        var direct_data_a = _.filter(self.direct, function(temp) {
                            var position_arr = [];
                            _.each(temp.attributes.data, function(data) {
                                if (data.des_position_data) {
                                    _.each(data.des_position_data, function(des) {
                                        if (des.can_position_data) {
                                            _.each(des.can_position_data, function(can) {
                                                position_arr.push(can.can_position)
                                            })
                                        }

                                    })
                                }

                            })
                            // console.log(position_arr);
                            return !!~position_arr.indexOf(x.position)
                        })
                        var direct_data_b = self.direct;
                        x.direct_name = direct_name;
                        x.direct_name_b = direct_name_b;
                        //人才培养方向数据-已配置
                        x.direct_data_a = direct_data_a;
                        //人才培养方向数据-所有
                        x.direct_data_b = direct_data_b;
                        // console.log(x);
                        return x

                    })
                   

                var obj = _.extend({
                    form_data: self.collection.attributes
                }, self.wf_data);
                $("#superior_twitter_form2-content").html(self.template(obj));
                $("#superior_twitter_form2-content").trigger('create');
                return this;
            },
            bind_event: function() {
                var self = this;
                $("#superior_twitter_form2").on('click', 'img', function(event) {
                    event.preventDefault();
                    // var img_view = '<div class="img_view" style="background-image:url('+this.src+')"></div>';
                    var img_view = '<img src="' + this.src + '">';
                    // img_view += '<a href="'+this.src.replace('get','download')+'" target="_blank">保存到本地</a>';
                    $("#fullscreen-overlay").html(img_view).fadeIn('fast');
                })

            },

        });

        // Returns the View class
        return SuperiorTwitterForm2View;

    });