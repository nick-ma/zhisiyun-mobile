// CountNumberDefineList View
// =================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "../../models/CountNumberDefineModel"],
    function($, _, Backbone, Handlebars, CountNumberDefineModel) {
        // Extends Backbone.View
        var CountNumberDefineList = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                this.template = Handlebars.compile($("#psh_count_number_define_list_view").html());
                this.template_instance = Handlebars.compile($("#psh_count_number_instance_list_view").html());
                this.template_define_form = Handlebars.compile($("#psh_count_number_define_form_view").html());
                this.loading_template = Handlebars.compile($("#loading_template_view").html());

                this.bind_event();
            },
            pre_render: function() {
                var self = this;
                $("#my_count_number-content").html(self.loading_template({
                    info_msg: '数据加载中...请稍候'
                }));
                $("#my_count_number-content").trigger('create');
                return this;
            },

            // Renders all of the CountNumberDefineList on the UI
            render: function(select) {

                var self = this;
                var login_people = $("#login_people").val();
                if (select) {
                    if (select == "A" || select == "B") { //未发布,已发布
                        var bool_obj = {
                            "A": false,
                            "B": true
                        }
                        var bool = bool_obj[select];
                        var count_number = _.map(_.filter(self.collection.models, function(x) {
                            return x.attributes.creator == String($("#login_people").val()) && x.attributes.is_save == bool
                        }), function(x) {
                            if (moment(x.attributes.count_number_end).isBefore(moment(new Date()))) {
                                x.attributes.is_end = true;
                            }
                            return x.toJSON();
                        })
                    } else {
                        var count_number = _.map(_.filter(self.collection.models, function(x) {
                            var is_running = moment(x.attributes.count_number_end).isAfter(moment(new Date()));
                            var operator = _.map(x.attributes.count_number_operator, function(y) {
                                if (y) {
                                    if (y._id) {
                                        return String(y._id)

                                    } else {
                                        return String(y)
                                    }
                                }
                            })
                            return !!~operator.indexOf(String(login_people)) && x.attributes.is_save == true && is_running && !x.attributes.is_stop
                        }), function(x) {
                            return x.toJSON();
                        })
                    }

                } else {
                    var count_number = _.map(_.filter(self.collection.models, function(x) {
                        return x.attributes.creator == String($("#login_people").val())
                    }), function(x) {
                        if (moment(x.attributes.count_number_end).isBefore(moment(new Date()))) {
                            x.attributes.is_end = true;
                        }
                        return x.toJSON();
                    })
                }


                var render_data = {
                    count_number: count_number,
                }
                console.log(render_data);
                $("#my_count_number-content").html(self.template(render_data));
                $("#my_count_number-content").trigger('create');
                return this;

            },
            render_instance: function(select) {

                var self = this;
                console.log(self);
                var login_people = $("#login_people").val();
                if (select == "C") {
                    var count_number = _.map(_.filter(self.instance_data, function(x) {
                        var is_running = moment(x.attributes.count_number_end).isAfter(moment(new Date()));

                        return x.attributes.operator._id == String(login_people) && is_running && !x.attributes.is_stop
                    }), function(x) {
                        return x.toJSON();
                    })

                } else if (select == "D") {
                    var count_number = _.map(_.filter(self.instance_data, function(x) {
                        var is_running = moment(x.attributes.count_number_end).isAfter(moment(new Date()));

                        return x.attributes.operator._id == String(login_people)
                    }), function(x) {
                        return x.toJSON();
                    })

                }
                var render_data = {
                    count_number: count_number,
                }
                $("#my_count_number-content").html(self.template_instance(render_data));
                $("#my_count_number-content").trigger('create');
                return this;

            },
            render_form_edit: function(data) {
                var self = this;
                console.log(data);
                var render_data = {
                    define_data: data,
                }
                $("#my_count_number-content").html(self.template_define_form(render_data));
                $("#my_count_number-content").trigger('create');
                return this;
            },
            bind_event: function() {
                var self = this;
                $("#my_count_number").on('click', '.open-left-panel', function(event) {
                    event.preventDefault();
                    $("#show_count_number-left-panel").panel("open");
                }).on('swiperight', function(event) { //向右滑动，打开左边的面板
                    event.preventDefault();
                    $("#show_count_number-left-panel").panel("open");
                }).on('click', '.count_number_view_mode', function(event) { //choice ,'A','B','C','D'
                    event.preventDefault();
                    var select_menu = $(this).data("select");
                    if (!!~["A", "B"].indexOf(String(select_menu))) {
                        self.render(select_menu);

                    } else {
                        self.render_instance(select_menu);

                    }
                }).on('click', '#btn_count_number_add', function(event) { //添加报数模版
                    event.preventDefault();
                    var name = "请输入报数模版名称";
                    my_prompt(name, null, function(data) {
                        console.log(data);
                        if (name) {
                            console.log(self.collection.models);
                            var new_count_number = new CountNumberDefineModel({
                                count_number_name: data,
                                create_date: new Date(),
                                creator: $("#login_people").val(),
                                creator_name: $("#login_people_name").val(),
                                create_terminal: 'PC',
                                count_number_begin: new Date(),
                                count_number_end: new Date(),
                            });

                            new_count_number.save().done(function() {
                                var up_id = new_count_number.attributes._id;

                                var url = '/admin/pm/count_number_define/template_edit/' + up_id;
                                self.collection.fetch().done(function() {
                                    var single_instance = self.collection.get(up_id).attributes;
                                    self.render_form_edit(single_instance);
                                })
                            });
                        }
                    })

                }).on('click', '#count_number_define_details', function(event) {
                    event.preventDefault();
                    var up_id = $(this).data("up_id");
                    var single_instance = self.collection.get(up_id).attributes;
                    self.render_form_edit(single_instance);
                })

            },

        });

        // Returns the View class
        return CountNumberDefineList;

    });