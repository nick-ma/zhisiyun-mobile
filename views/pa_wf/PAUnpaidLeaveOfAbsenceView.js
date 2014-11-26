// pa unpaid  leave of absence hr View 人员停薪留职流程（hr发起）
// =============================================================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "moment", "../../models/PAUnpaidLeaveOfAbsenceModel"],
    function($, _, Backbone, Handlebars, moment, PAUnpaidLeaveOfAbsenceModel) {
        var paep_id = null;
        var do_trans = function(trans_data) {
                var post_data = {
                    process_instance_id: $("#pa_unpaid_leave_of_absence_hr_list-content #process_instance_id").val(),
                    task_instance_id: $("#pa_unpaid_leave_of_absence_hr_list-content #task_instance_id").val(),
                    process_define_id: $("#pa_unpaid_leave_of_absence_hr_list-content #process_define_id").val(),
                    next_tdid: $("#pa_unpaid_leave_of_absence_hr_list-content #next_tdid").val(),
                    next_user: $("#pa_unpaid_leave_of_absence_hr_list-content #next_user_id").val() || $("#select_next_user").val(), //'516cf9a1d26ad4fe48000001', //以后从列表中选出
                    trans_name: $("#pa_unpaid_leave_of_absence_hr_list-content #trans_name").val(), // 转移过来的名称
                    comment_msg: $("#pa_unpaid_leave_of_absence_hr_list-content #comment_msg").val(), // 任务批注 
                    attachments: trans_data.attachments || null
                };
                var post_url = $("#pa_unpaid_leave_of_absence_hr_list-content #task_process_url").val();
                post_url = post_url.replace('<TASK_ID>', $("#pa_unpaid_leave_of_absence_hr_list-content #task_instance_id").val());
                $.post(post_url, post_data, function(data) {
                    if (data.code == 'OK') {
                        window.location = '#todo';
                    } else {
                        window.location = '#todo';

                    }
                })
            }
            // Extends Backbone.View
        var PAUnpaidLeaveOfAbsenceView = Backbone.View.extend({
            // The View Constructor
            initialize: function() {
                this.template = Handlebars.compile($("#psh_pa_unpaid_leave_of_absence_hr_view").html());
                this.loading_template = Handlebars.compile($("#loading_template_view").html());
                this.trans_template = Handlebars.compile($("#trans_confirm_view").html());
                this.bind_events();
                var self = this;
            },
            pre_render: function() {
                var self = this;
                $("#pa_unpaid_leave_of_absence_hr_list-content").html(self.loading_template({
                    info_msg: '数据加载中...请稍候'
                }));
                $("#pa_unpaid_leave_of_absence_hr_list-content").trigger('create');
                return this;
            },
            // Renders all of the Assessment models on the UI
            render: function() {
                var self = this;
                var data = _.map(self.collection.models, function(x) {
                        return x.toJSON()
                    })
                    //附件数据
                if (localStorage.getItem('upload_model_back')) { //有从上传页面发回来的数据
                    self.data = JSON.parse(localStorage.getItem('upload_model_back')).model;
                    localStorage.removeItem('upload_model_back'); //用完删掉
                };
                paep_id = data[0]._id;
                var is_self = data[0].people._id == String($("#login_people").val());

                var render_data = {
                    data: data[0],
                    view_status: self.view_status,
                    is_self: is_self,
                    par_data: self.par_data
                };
                render_data = _.extend(render_data, self.data);
                if (self.view_mode == 'trans') {
                    $("#pa_unpaid_leave_of_absence_hr_list #pa_name").html('数据处理人');

                    $("#pa_unpaid_leave_of_absence_hr_list-content").html(self.trans_template(self.trans_data));
                    if (self.trans_data.next_td.node_type == 'END') {
                        do_trans(self.trans_data);
                    }
                } else {
                    $("#pa_unpaid_leave_of_absence_hr_list-content").html(self.template(render_data));

                }
                $("#pa_unpaid_leave_of_absence_hr_list-content").trigger('create');
                return this;

            },
            bind_events: function() {
                var self = this;

                $("#pa_unpaid_leave_of_absence_hr_list").on('click', '#btn_save', function(event) { //数据保存接口
                    event.preventDefault();
                    paep_id = paep_id || self.collection.models[0].attributes._id;
                    var data_clone = _.clone(self.collection.models[0].attributes);
                    self.collection.models[0].attributes.par = data_clone.par._id;
                    self.collection.models[0].attributes.validFrom = data_clone.validFrom;
                    self.collection.models[0].save(self.collection.models[0].attributes, {
                        success: function(model, response, options) {
                            self.collection.url = '/admin/pa/wf/unpaid_leave_of_absence_hr/bb/' + paep_id;
                            self.collection.fetch().done(function() {
                                alert("数据保存成功!");
                                self.render();
                            })

                        },
                        error: function(model, xhr, options) {}
                    });
                }).on('change', "#self_evaluation", function(event) {
                    event.preventDefault();
                    paep_id = paep_id || self.collection.models[0].attributes._id;
                    self.collection.models[0].attributes.self_evaluation = $("#pa_unpaid_leave_of_absence_hr_list #self_evaluation").val();
                    self.collection.models[0].save(self.collection.models[0].attributes, {
                        success: function(model, response, options) {
                            self.collection.url = '/admin/pa/wf/unpaid_leave_of_absence_hr/bb/' + paep_id;
                            self.collection.fetch().done(function() {
                                self.render();
                            })

                        },
                        error: function(model, xhr, options) {}
                    });

                }).on('change', "#leaveDate", function(event) {
                    event.preventDefault();
                    var leaveDate = moment($(this).val());
                    paep_id = paep_id || self.collection.models[0].attributes._id;
                    self.collection.models[0].attributes.validFrom = $("#pa_unpaid_leave_of_absence_hr_list #leaveDate").val();
                    self.collection.models[0].save(self.collection.models[0].attributes, {
                        success: function(model, response, options) {
                            self.collection.url = '/admin/pa/wf/unpaid_leave_of_absence_hr/bb/' + paep_id;
                            self.collection.fetch().done(function() {
                                self.render();
                            })

                        },
                        error: function(model, xhr, options) {}
                    });

                }).on('click', '#btn_upload_attachment', function(event) { //添加附件
                    event.preventDefault();
                    //转到上传图片的页面
                    localStorage.removeItem('upload_model_back'); //先清掉
                    var next_url = '#upload_pic';
                    localStorage.setItem('upload_model', JSON.stringify({
                        model: self.data,
                        field: 'attachments',
                        back_url: window.location.hash
                    }))
                    window.location.href = next_url;
                }).on('click', '.do_trans', function(event) {
                    event.preventDefault();
                    var $this = $(this);
                    if ($("#pa_unpaid_leave_of_absence_hr_list-content #ti_comment").val() == '') {
                        alert('请填写审批意见！');
                        return;
                    }
                    $(this).attr('disabled', true)
                    $.mobile.loading("show");
                    var process_define_id = $("#pa_unpaid_leave_of_absence_hr_list-content #process_define_id").val();
                    var task_define_id = $("#pa_unpaid_leave_of_absence_hr_list-content #task_define_id").val();
                    var process_instance_id = $("#pa_unpaid_leave_of_absence_hr_list-content #process_instance_id").val();
                    var task_process_url = $("#pa_unpaid_leave_of_absence_hr_list-content #task_process_url").val();
                    var task_instance_id = $("#pa_unpaid_leave_of_absence_hr_list-content #task_instance_id").val();

                    var direction = $this.data('direction');
                    var target_id = $this.data('target_id');
                    var task_name = $this.data('task_name');
                    var name = $this.data('name');
                    var roles_type = $this.data('roles_type');
                    var position_form_field = $this.data('position_form_field');
                    if (self.view_mode) {
                        $.post('/admin/wf/trans_confirm_form_4m', {
                            process_define_id: process_define_id,
                            task_define_id: task_define_id,
                            process_instance_id: process_instance_id,
                            task_process_url: task_process_url,
                            next_tdname: task_name,
                            trans_name: name,
                            ti_comment: $("#pa_unpaid_leave_of_absence_hr_list-content #ti_comment").val(),
                            task_instance_id: task_instance_id,
                            next_tdid: target_id,
                            direction: direction,
                            attachments: self.data.attachments,
                            people_id: $("#people_id").val() || self.collection.models[0].attributes.people._id,
                            position_id: $("#pa_unpaid_leave_of_absence_hr_list-content #dest_position_superior").val(),
                            roles_type: $("#pa_unpaid_leave_of_absence_hr_list-content #roles_type").val(),


                        }, function(data) {
                            self.view_mode = 'trans';
                            self.trans_data = data;
                            $.mobile.loading("hide");

                            self.render();
                        });
                    } else {

                        var obj = self.data;
                        $.post('/admin/wf/trans_confirm_form_4m', {
                            process_define_id: process_define_id,
                            task_define_id: task_define_id,
                            process_instance_id: process_instance_id,
                            task_process_url: task_process_url,
                            next_tdname: task_name,
                            trans_name: name,
                            ti_comment: $("#pa_unpaid_leave_of_absence_hr_list-content #ti_comment").val(),
                            task_instance_id: task_instance_id,
                            next_tdid: target_id,
                            direction: direction,
                            attachments: self.data.attachments,
                            people_id: $("#people_id").val() || self.collection.models[0].attributes.people._id,
                            position_id: $("#pa_unpaid_leave_of_absence_hr_list-content #dest_position_superior").val(),
                            roles_type: $("#pa_unpaid_leave_of_absence_hr_list-content #roles_type").val(),

                        }, function(data) {

                            self.view_mode = 'trans';
                            self.trans_data = data;
                            $.mobile.loading("hide");
                            self.render();
                        });


                    }
                }).on('click', '#btn_ok', function(e) {
                    $.mobile.loading("show");
                    if ($("#pa_unpaid_leave_of_absence_hr_list-content #next_user_name").val() || $("#pa_unpaid_leave_of_absence_hr_list-content #select_next_user").val()) {
                        $("#btn_ok").attr("disabled", "disabled");
                        if (!self.view_mode) {
                            do_trans(self.trans_data);
                        } else {
                            do_trans(self.trans_data);
                        }
                        $.mobile.loading("hide");

                    } else {
                        alert('请选择下一任务的处理人');
                    };
                }).on('click', '#btn_trans_cancel', function(event) {
                    event.preventDefault();
                    window.location.reload();
                }).on('click', '#btn_wf_start_userchat', function(event) {
                    event.preventDefault();
                    var people = $(this).data("people") || self.collection.models[0].attributes.people._id;
                    var url = "im://userchat/" + people;
                    window.location.href = url;
                }).on('click', 'img', function(event) {
                    event.preventDefault();
                    // var img_view = '<div class="img_view" style="background-image:url('+this.src+')"></div>';
                    var img_view = '<img src="' + this.src + '">';
                    // img_view += '<a href="'+this.src.replace('get','download')+'" target="_blank">保存到本地</a>';
                    $("#fullscreen-overlay").html(img_view).fadeIn('fast');
                })
            }

        });

        // Returns the View class
        return PAUnpaidLeaveOfAbsenceView;

    });