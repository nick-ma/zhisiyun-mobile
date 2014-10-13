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

        function times(start_date) {
            s_date = start_date.split('T')[0];
            s_zone = start_date.split('T')[1] || null;
            var o = {
                date: s_date,
                zone: s_zone,
            }
            return o
        }


        function do_save(self, type) {


            $.mobile.loading("show");
            var imgs = []
            _.each(self.model.get('attachments'), function(att) {
                if (att._id) {
                    imgs.push(att._id)
                } else {
                    imgs.push(att)
                }
            })



            self.model.set('r_users', _.compact(_.pluck(self.model.get('r_users'), '_id')));
            self.model.set('attachments', imgs);

            self.model.save(self.model.attributes, {
                success: function(model, response, options) {
                    // fetch_im(im_id)
                    var str = (type == 'S' ? '通知保存成功！！' : '通知发送成功！！')
                    $.mobile.loading("hide");
                    if (type == 'S') {
                        alert(str)
                    } else {
                        window.location.href = '/m#im_list'
                    }

                },
                error: function(model, xhr, options) {
                    var str = (type == 'S' ? '通知保存失败！！' : '通知发送失败！！')
                    $.mobile.loading("hide");
                    alert(str)

                }
            })

        }
        // Extends Backbone.View
        var ImListView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                var self = this;
                this.template_im_create = Handlebars.compile($("#im_create_view").html());
                this.loading_template = Handlebars.compile($("#loading_template_view").html());
                this.people_select_template = Handlebars.compile($("#im_people_select_view").html());

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
                console.log(self)

                //附件数据
                if (localStorage.getItem('upload_model_back')) { //有从上传页面发回来的数据
                    var img_obj = JSON.parse(localStorage.getItem('upload_model_back')).model;
                    self.model.set('attachments', img_obj.attachments)
                    localStorage.removeItem('upload_model_back'); //用完删掉
                };

                if (self.model_view == '0') {
                    $("#im_create_list #btn-create_list-back").addClass('ui-icon-back').removeClass('ui-icon-check')
                    rendered_data = self.template_im_create(self.model.attributes)
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
                        $.mobile.loading("show");
                        // $.get('/admin/im/get_peoples/' + self.people, function(peoples) {
                        self.model_view = '1';
                        // self.peoples = peoples
                        self.render();
                        $.mobile.loading("hide");
                        // })
                    }).on('click', '#btn-create_list-back', function(event) {
                        event.preventDefault();
                        if (self.model_view == '1') {
                            self.model_view = '0';
                            var people_selected = _.compact(_.map($("#im_create_list-content input[type=checkbox]:checked"), function(x) {
                                var f_d = _.find(self.peoples, function(pp) {
                                    return pp._id == String(x.value)
                                })
                                if (f_d) {
                                    return {
                                        _id: f_d.user,
                                        people_name: f_d.people_name
                                    };
                                } else {
                                    return null
                                }
                            }));
                            self.model.set('r_users', people_selected)
                            self.render();
                        } else {
                            window.location.href = '#im_list'
                        }

                    }).on('change', 'input,textarea', function(event) {
                        event.preventDefault();
                        var field = $(this).data('field');
                        var val = $(this).val();
                        self.model.set(field, val)
                    }).on('change', 'select', function(event) {
                        event.preventDefault();
                        var field = $(this).data('field');
                        var la = $(this).val();
                        self.model.set(field, (la == 'false' ? false : true))
                        self.render();
                        //把 a 换成 span， 避免点那个滑块的时候页面跳走。
                        $(".ui-flipswitch a").each(function() {
                            $(this).replaceWith("<span class='" + $(this).attr('class') + "'></span>");
                        });
                    }).on('change', '#m_start_date, #m_end_date', function(event) {
                        event.preventDefault();
                        var type = $(this).data('type');
                        var field = $(this).data('field');
                        var current_date = $(this).val();
                        var is_all_day = self.model.get('is_all_day');
                        if (is_all_day) {
                            self.model.set(field, times(current_date).date)
                        } else {
                            self.model.set(field, times(current_date).date + ' ' + times(current_date).zone)
                        }
                        if (type == "S") {
                            self.model.set('time_zone_s', times(current_date).zone)
                        } else {
                            self.model.set('time_zone_e', times(current_date).zone)
                        }
                    }).on('click', '#btn-save', function(event) {
                        event.preventDefault();
                        self.model.set('is_send', false);
                        if (self.model.get('msg_theme') == null || self.model.get('msg_theme') == '') {
                            alert('主题不能为空!')
                            return false
                        };
                        if (self.model.get('msg_body') == null || self.model.get('msg_body') == '') {
                            alert('发送内容不能为空!')
                            return false
                        };
                        do_save(self, 'S');
                    }).on('click', '#btn-save_send', function(event) {
                        event.preventDefault();
                        self.model.set('is_send', true);
                        if (self.model.get('r_users').length == 0) {
                            alert('请选择发送对象!')
                            return false
                        };
                        if (self.model.get('msg_theme') == null || self.model.get('msg_theme') == '') {
                            alert('主题不能为空!')
                            return false
                        };
                        if (self.model.get('msg_body') == null || self.model.get('msg_body') == '') {
                            alert('发送内容不能为空!')
                            return false
                        };

                        if (confirm('确定发送通知吗?\n发送成功将跳转到列表！')) {
                            do_save(self, 'T');
                        }
                    }).on('click', '#btn_upload_attachment', function(event) {
                        //转到上传图片的页面
                        // var leave = self.model.get('leave');
                        localStorage.removeItem('upload_model_back'); //先清掉
                        var next_url = '#upload_pic';
                        localStorage.setItem('upload_model', JSON.stringify({
                            model: self.model,
                            field: 'attachments',
                            back_url: window.location.hash
                        }))
                        window.location.href = next_url;

                    }).on('click', 'img', function(event) {
                        event.preventDefault();
                        // var img_view = '<div class="img_view" style="background-image:url('+this.src+')"></div>';
                        var img_view = '<img src="' + this.src + '">';
                        // img_view += '<a href="'+this.src.replace('get','download')+'" target="_blank">保存到本地</a>';
                        $("#fullscreen-overlay").html(img_view).fadeIn('fast');
                    }).on('change', '#checked_all_people', function(event) {
                        event.preventDefault();
                        var bool = ($(this).attr('data-cacheval') == 'true' ? false : true);
                        if (bool) {
                            var set = $("#im_create_list-content input[type=checkbox]").each(function() {
                                $(this).attr('checked', true)
                                $(this).prev().removeClass('ui-checkbox-off').addClass('ui-checkbox-on')
                                $(this).attr("data-cacheval", false);
                            })
                        } else {
                            var set = $("#im_create_list-content input[type=checkbox]").each(function() {
                                $(this).attr('checked', false)
                                $(this).prev().removeClass('ui-checkbox-on').addClass('ui-checkbox-off')
                                $(this).attr("data-cacheval", true);
                            })
                        }

                    })

            }
        });

        // Returns the View class
        return ImListView;

    });