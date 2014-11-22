// pa ending probation ess View 人员转正流程（个人发起）
// =============================================================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "moment", "../../models/PAEndingProbation"],
    function($, _, Backbone, Handlebars, moment, PAEndingProbation) {
        var paep_id = null;
        var do_trans = function(trans_data) {
                var post_data = {
                    process_instance_id: $("#pa_ending_probation_ess_list-content #process_instance_id").val(),
                    task_instance_id: $("#pa_ending_probation_ess_list-content #task_instance_id").val(),
                    process_define_id: $("#pa_ending_probation_ess_list-content #process_define_id").val(),
                    next_tdid: $("#pa_ending_probation_ess_list-content #next_tdid").val(),
                    next_user: $("#pa_ending_probation_ess_list-content #next_user_id").val() || $("#select_next_user").val(), //'516cf9a1d26ad4fe48000001', //以后从列表中选出
                    trans_name: $("#pa_ending_probation_ess_list-content #trans_name").val(), // 转移过来的名称
                    comment_msg: $("#pa_ending_probation_ess_list-content #comment_msg").val(), // 任务批注 
                    attachments: trans_data.attachments || null
                };
                var post_url = $("#pa_ending_probation_ess_list-content #task_process_url").val();
                post_url = post_url.replace('<TASK_ID>', $("#pa_ending_probation_ess_list-content #task_instance_id").val());
                $.post(post_url, post_data, function(data) {
                    if (data.code == 'OK') {
                        window.location = '#todo';
                    } else {
                        window.location = '#todo';

                    }
                })
            }
            // Extends Backbone.View
        var PAEndingProbationESSView = Backbone.View.extend({
            // The View Constructor
            initialize: function() {
                this.template = Handlebars.compile($("#psh_pa_ending_probation_ess_view").html());
                this.loading_template = Handlebars.compile($("#loading_template_view").html());
                this.trans_template = Handlebars.compile($("#trans_confirm_view").html());
                this.bind_events();
                var self = this;
            },
            pre_render: function() {
                var self = this;
                $("#pa_ending_probation_ess_list-content").html(self.loading_template({
                    info_msg: '数据加载中...请稍候'
                }));
                $("#pa_ending_probation_ess_list-content").trigger('create');
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
                    is_self: is_self
                };
                render_data = _.extend(render_data, self.data);
                if (self.view_mode == 'trans') {
                    $("#pa_ending_probation_ess_list #pa_name").html('数据处理人');

                    $("#pa_ending_probation_ess_list-content").html(self.trans_template(self.trans_data));
                    if (self.trans_data.next_td.node_type == 'END') {
                        do_trans(self.trans_data);
                    }
                } else {
                    $("#pa_ending_probation_ess_list-content").html(self.template(render_data));

                }
                $("#pa_ending_probation_ess_list-content").trigger('create');
                return this;

            },
            bind_events: function() {
                var self = this;

                $("#pa_ending_probation_ess_list").on('click', '#btn_save', function(event) { //数据保存接口
                    event.preventDefault();
                    paep_id = paep_id || self.collection.models[0].attributes._id;
                    self.collection.models[0].attributes.ending_probation_date = moment($("#pa_ending_probation_ess_list #actual_ending_probation_date").val());
                    self.collection.models[0].attributes.self_evaluation = $("#pa_ending_probation_ess_list #self_evaluation").val();
                    self.collection.models[0].save(self.collection.models[0].attributes, {
                        success: function(model, response, options) {
                            self.collection.url = '/admin/pa/wf/ending_probation_hr/bb/' + paep_id;
                            self.collection.fetch().done(function() {
                                alert("数据保存成功!");
                                self.render();
                            })

                        },
                        error: function(model, xhr, options) {}
                    });
                }).on('change', "input", function(event) {
                    event.preventDefault();
                    var ending_probation_date = moment($(this).val());
                    paep_id = paep_id || self.collection.models[0].attributes._id;
                    self.collection.models[0].attributes.ending_probation_date = moment($("#actual_ending_probation_date").val());
                    self.collection.models[0].save(self.collection.models[0].attributes, {
                        success: function(model, response, options) {
                            self.collection.url = '/admin/pa/wf/ending_probation_hr/bb/' + paep_id;
                            self.collection.fetch().done(function() {
                                self.render();
                            })

                        },
                        error: function(model, xhr, options) {}
                    });

                }).on('change', "#self_evaluation", function(event) {
                    event.preventDefault();
                    var self_evaluation = $("#self_evaluation").val();
                    paep_id = paep_id || self.collection.models[0].attributes._id;
                    self.collection.models[0].attributes.self_evaluation = self_evaluation;
                    self.collection.models[0].save(self.collection.models[0].attributes, {
                        success: function(model, response, options) {
                            self.collection.url = '/admin/pa/wf/ending_probation_hr/bb/' + paep_id;
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
                    if ($("#pa_ending_probation_ess_list-content #ti_comment").val() == '') {
                        alert('请填写审批意见！');
                        return;
                    }
                    $(this).attr('disabled', true)
                    $.mobile.loading("show");
                    var process_define_id = $("#pa_ending_probation_ess_list-content #process_define_id").val();
                    var task_define_id = $("#pa_ending_probation_ess_list-content #task_define_id").val();
                    var process_instance_id = $("#pa_ending_probation_ess_list-content #process_instance_id").val();
                    var task_process_url = $("#pa_ending_probation_ess_list-content #task_process_url").val();
                    var task_instance_id = $("#pa_ending_probation_ess_list-content #task_instance_id").val();

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
                            ti_comment: $("#pa_ending_probation_ess_list-content #ti_comment").val(),
                            task_instance_id: task_instance_id,
                            next_tdid: target_id,
                            direction: direction,
                            attachments: self.data.attachments
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
                            ti_comment: $("#pa_ending_probation_ess_list-content #ti_comment").val(),
                            task_instance_id: task_instance_id,
                            next_tdid: target_id,
                            direction: direction,
                            attachments: self.data.attachments

                        }, function(data) {
                            self.view_mode = 'trans';
                            self.trans_data = data;
                            $.mobile.loading("hide");
                            self.render();
                        });


                    }
                }).on('click', '#btn_ok', function(e) {
                    $.mobile.loading("show");
                    if ($("#pa_ending_probation_ess_list-content #next_user_name").val() || $("#pa_ending_probation_ess_list-content #select_next_user").val()) {
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
                    var people = $(this).data("people") || self.collection.models[0].attributes.data.people._id;
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
        return PAEndingProbationESSView;

    });