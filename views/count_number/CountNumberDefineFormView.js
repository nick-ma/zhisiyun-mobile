// CountNumberDefineForm Edit View
// =================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "../../models/CountNumberDefineModel"],
    function($, _, Backbone, Handlebars, CountNumberDefineModel) {
        // Extends Backbone.View
        var CountNumberDefineFormView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                this.template = Handlebars.compile($("#psh_count_number_define_form_view").html());
                this.loading_template = Handlebars.compile($("#loading_template_view").html());
                this.bind_event();
            },
            pre_render: function() {
                var self = this;
                $("#my_count_number_define-content").html(self.loading_template({
                    info_msg: '数据加载中...请稍候'
                }));
                $("#my_count_number_define-content").trigger('create');
                return this;
            },

            // Renders all of the CountNumberDefineList on the UI
            render: function(select) {

                var self = this;
                var login_people = $("#login_people").val();
                console.log(self);
                var render_data=self.collection.models[0].attributes
                $("#my_count_number_define-content").html(self.template(render_data));
                $("#my_count_number_define-content").trigger('create');
                return this;

            },
            bind_event: function() {
                var self = this;
                $("#my_count_number_define").on('click', '.open-left-panel', function(event) {
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
        return CountNumberDefineFormView;

    });