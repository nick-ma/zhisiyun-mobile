// CollTask List View
// =================

// Includes file dependencies

define(["jquery", "underscore", "backbone", "handlebars", "moment"],
    function($, _, Backbone, Handlebars, moment) {

        function sort_im(items) {
            var sorts = _.sortBy(items, function(it) {
                return it.s_date
            })
            return sorts.reverse()
        }

        Handlebars.registerHelper('im_rp', function(data) {
            var str = data
            if (data == 'root' || !data) {
                str = '系统通知';
            }
            return str
        });
        // Extends Backbone.View
        var ImListView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                var self = this;
                this.template_im_create = Handlebars.compile($("#im_create_view").html());
                this.loading_template = Handlebars.compile($("#loading_template_view").html());
                this.people_select_template = Handlebars.compile($("#hbtmp_people_select_view").html());

                // The render method is called when CollTask Models are added to the Collection
                this.bind_event();
                this.model_view = '0';

            },
            pre_render: function() {
                var self = this;
                $("#im_create_list-content").html(self.loading_template({
                    info_msg: '数据加载中...请稍候'
                }));
                $("#im_create_list-content").trigger('create');
                return this;
            },
            render: function() {
                var self = this;

                var rendered_data = '';
                if (self.model_view == '0') {
                    $("#im_create_list #btn-create_list-back").addClass('ui-icon-back').removeClass('ui-icon-check')
                    console.log(self)
                    rendered_data = self.template_im_create(self.im)
                } else {
                    $("#im_create_list #btn-create_list-back").removeClass('ui-icon-back').addClass('ui-btn-icon-notext ui-icon-check')
                    rendered_data = self.people_select_template({
                        people: self.peoples
                    })
                }
                $("#im_create_list-content").html(rendered_data);
                $("#im_create_list-content").trigger('create');
                return this
            },
            bind_event: function() {
                var self = this;
                $("#im_create_list")
                    .on('click', '#show_peoples', function(event) {
                        $.get('/admin/im/get_peoples/' + self.people, function(peoples) {
                            self.model_view = '1';
                            self.peoples = peoples
                            self.render();
                        })
                    }).on('click', '#btn-create_list-back', function(event) {
                        event.preventDefault();
                        if (self.model_view == '1') {
                            self.model_view = '0';
                            var people_selected = _.map($("#im_create_list-content input[type=checkbox]:checked"), function(x) {
                                var f_d = _.find(self.peoples, function(pp) {
                                    return pp._id == String(x.value)
                                })
                                return f_d;
                            });
                            self.im.people_selected = people_selected;

                            console.log(people_selected)

                            self.render();
                        } else {
                            window.location.href = '#im_list'
                        }

                    }).on('change', 'input,textarea', function(event) {
                        event.preventDefault();
                        var field = $(this).data('field');
                        var val = $(this).val();
                        self.im[field] = val
                    }).on('change', 'select', function(event) {
                        event.preventDefault();
                        var field = $(this).data('field');
                        var val = $(this).val();
                        self.im[field] = (val == 'true' ? true : false)
                    }).on('click', '#btn-im_send', function(event) {
                        event.preventDefault();
                        if (!self.im.msg_theme || self.im.msg_theme == '') {
                            alert('主题不能为空!')
                            return false
                        };
                        if (!self.im.msg_body || self.im.msg_body == '') {
                            alert('发送内容不能为空!')
                            return false
                        };
                        if (self.im.people_selected.length == 0) {
                            alert('请选择发送对象!')
                            return false
                        };
                        if (confirm('确定发送通知吗?\n成功后将跳转到列表！')) {
                            $(this).attr('disabled', true);
                            $.mobile.loading("show");
                            $.post('/admin/im/send_im', self.im, function(data) {
                                console.log(data)
                                $.mobile.loading("hide");
                                window.location.href = '#im_list'
                            })
                        }
                    })

            }
        });

        // Returns the View class
        return ImListView;

    });