// ToDo View
// =============

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "async"], function($, _, Backbone, Handlebars, async) {
    function save_data(self) {
        self.model.save(self.model.attributes).done(function(data) {
            self.model.fetch().done(function() {
                self.render();

            })
        })
    }

    var Quesetionnaire_Template_EditView = Backbone.View.extend({
        // The View Constructor
        initialize: function() {
            this.quesetionnaire_template_edit = Handlebars.compile($("#quesetionnaire_template_edit_view").html());
            this.loading_template = Handlebars.compile($("#loading_template_view").html());
            this.bind_event();
        },
        pre_render: function() {
            var self = this;
            $("#quesetionnaire_template_edit_list-content").html(self.loading_template({
                info_msg: '数据加载中...请稍候'
            }));
            $("#quesetionnaire_template_edit_list-content").trigger('create');
            return this;
        },
        // Renders all of the Task models on the UI
        render: function() {
            var self = this;

            //附件数据
            if (localStorage.getItem('upload_model_back')) { //有从上传页面发回来的数据
                var back_obj = JSON.parse(localStorage.getItem('upload_model_back')).model;
                var f_qti = _.find(self.model.get('option_items'), function(op) {
                    return op._id == back_obj.qti_id
                })
                var f_d = _.find(f_qti.qti_options, function(qt) {
                    return qt._id == back_obj._id
                })
                f_d.attachment = back_obj.attachments
                localStorage.removeItem('upload_model_back'); //用完删掉
            };



            rendered_data = self.quesetionnaire_template_edit(self.model.attributes);

            $("#quesetionnaire_template_edit_list-content").html(rendered_data);
            $("#quesetionnaire_template_edit_list-content").trigger('create');
            return self;
        },
        bind_event: function() {
            var self = this
            var bool = true;
            $("#quesetionnaire_template_edit_list").on('click', '.add_qti', function(event) {
                event.preventDefault();
                var item = {};
                var num = parseInt(self.model.attributes.option_items.length) + 1
                item.qti_name = '新建题目' + num;
                self.model.attributes.option_items.push(item);
                save_data(self)
            }).on('click', "#btn_save", function(event) {
                event.preventDefault();
                var radio_all = $('#quesetionnaire_eg_list-content').find('input[type=radio]').length;
                var radio_chk = $('#quesetionnaire_eg_list-content').find('input[type=radio]:checked').length;
                if (radio_all / radio_chk != 2) {
                    alert("请答完题目再提交!");
                    return false;
                } else {
                    self.model.save(self.model.attributes).done(function(data) {
                        self.model.fetch().done(function() {
                            self.render();

                        })
                    })
                }
            }).on('click', ".btn_remove_qti", function(event) {
                event.preventDefault();
                $this = $(this);
                event.preventDefault();
                var qti_id = $this.data('qti_id')
                self.model.attributes.option_items = _.filter(self.model.get('option_items'), function(op) {
                    return op._id != qti_id
                })
                save_data(self)
            }).on('click', '.btn_add_option', function(event) {
                event.preventDefault();
                var qti_id = $(this).data('qti_id')
                var f_qti = _.find(self.model.get('vote_items'), function(op) {
                    return op._id == qti_id
                })
                var option = {};
                var num = parseInt(f_qti.qti_options.length) + 1
                option.option = '选项' + num;
                option.option_description = '';
                f_qti.qti_options.push(option);
                save_data(self);
            }).on('click', '.btn_remove_option', function(event) {
                event.preventDefault();
                var qti_id = $(this).data('qti_id');
                var option_id = $(this).data('option_id');
                var f_qti = _.find(self.model.get('vote_items'), function(op) {
                    return op._id == qti_id
                })
                f_qti.qti_options = _.filter(f_qti.qti_options, function(qt) {
                    return qt._id != option_id
                })
                save_data(self);

            }).on('change', "input[type='text']", function(event) {
                event.preventDefault();
                var qt_id = $(this).data('qt_id');
                var qti_id = $(this).data('qti_id');
                var option_id = $(this).data('option_id');
                if (!_.isUndefined(option_id)) {
                    var f_qti = _.find(self.model.get('vote_items'), function(op) {
                        return op._id == qti_id
                    })
                    f_op = _.find(f_qti.qti_options, function(qt) {
                        return qt._id == option_id
                    })
                    f_op.option = $(this).val()
                } else if (!_.isUndefined(qt_id)) {
                    self.model.set('qt_name', $(this).val())
                } else {
                    var f_qti = _.find(self.model.get('vote_items'), function(op) {
                        return op._id == qti_id
                    })
                    f_qti.qti_name = $(this).val()
                }

            }).on('change', 'textarea', function(event) {
                event.preventDefault();
                var qt_id = $(this).data('qt_id');
                var qti_id = $(this).data('qti_id');
                var option_id = $(this).data('option_id');
                // if (!_.isUndefined(qt_id)) {
                self.model.set('qt_description', $(this).val())
                // } else {
                //     var f_qti = _.find(self.model.get('option_items'), function(op) {
                //         return op._id == qti_id
                //     })
                //     f_op = _.find(f_qti.qti_options, function(qt) {
                //         return qt._id == option_id
                //     })
                //     f_op.option_description = $(this).val()
                // }
            }).on('click', '#btn-save', function(event) {
                event.preventDefault();
                var $this = $(this);
                $.mobile.loading("show");
                $this.attr('disabled', true);
                self.model.save(self.model.attributes, {
                    success: function(model, response, options) {
                        self.model.fetch().done(function() {
                            $.mobile.loading("hide");
                            self.render();
                            alert('问卷制作保存成功!')
                            $this.removeAttr('disabled')
                        })
                    },
                    error: function(model, xhr, options) {
                        $.mobile.loading("hide");
                        alert('问卷制作保存失败!')
                        self.render();
                        $this.removeaAttr('disabled')
                    }
                })
            }).on('change', 'select', function(event) {
                event.preventDefault();
                var qti_id = $(this).data('qti_id');
                var field = $(this).data('field');
                if (!_.isUndefined(qti_id)) {
                    var f_qti = _.find(self.model.get('vote_items'), function(op) {
                        return op._id == qti_id
                    })
                    f_qti.qti_type = ($(this).val() == 'false' ? '1' : '2')
                } else {
                    self.model.set(field, $(this).val() == 'false' ? false : true)
                }
                $(".ui-flipswitch a").each(function() {
                    $(this).replaceWith("<span class='" + $(this).attr('class') + "'></span>");
                });

            }).on('click', '#btn_upload_attachment', function(event) {
                //转到上传图片的页面
                var leave = self.model.get('leave');
                localStorage.removeItem('upload_model_back'); //先清掉
                var next_url = '#upload_pic';
                localStorage.setItem('upload_model', JSON.stringify({
                    model: leave,
                    field: 'attachments',
                    back_url: window.location.hash
                }))
                window.location.href = next_url;

            }).on('click', 'img', function(event) {
                event.preventDefault();
                save_data(self)
                var qti_id = $(this).data('qti_id');
                var option_id = $(this).data('option_id');
                var f_qti = _.find(self.model.get('option_items'), function(op) {
                    return op._id == qti_id
                })
                var f_d = _.find(f_qti.qti_options, function(qt) {
                    return qt._id == option_id
                })
                f_d.qti_id = qti_id;
                localStorage.removeItem('upload_model_back'); //先清掉
                var next_url = '#upload_pic';
                localStorage.setItem('upload_model', JSON.stringify({
                    model: f_d,
                    field: 'attachments',
                    back_url: window.location.hash
                }))
                window.location.href = next_url;

                // var img_view = '<div class="img_view" style="background-image:url('+this.src+')"></div>';
                // var img_view = '<img src="' + this.src + '">';
                // // img_view += '<a href="'+this.src.replace('get','download')+'" target="_blank">保存到本地</a>';
                // $("#fullscreen-overlay").html(img_view).fadeIn('fast');
            }).on('click', '#btn-save_goto', function(event) {
                var $this = $(this);
                $.mobile.loading("show");
                $this.attr('disabled', true);
                self.model.save(self.model.attributes, {
                    success: function(model, response, options) {
                        $.mobile.loading("hide");
                        alert('问卷制作保存成功!')
                        var url = "#quesetionnair_template_issue/" + model.get("_id");
                        window.location.href = url;

                    },
                    error: function(model, xhr, options) {
                        $.mobile.loading("hide");
                        alert('问卷制作保存失败!')
                        self.render();
                        $this.removeaAttr('disabled')
                    }
                })
            })



        },

    });

    // Returns the View class
    return Quesetionnaire_Template_EditView;

});