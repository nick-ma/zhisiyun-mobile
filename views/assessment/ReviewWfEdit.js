// Assessment  Review Edit View 绩效面谈查看界面
// =============================================================

// Includes file dependencies
define(["jquery", "underscore", "async", "backbone", "handlebars", "moment", "../../models/AssessmentModel", "../../models/CollTaskModel"],
    function($, _, async, Backbone, Handlebars, moment, AssessmentModel, CollTask) {
        var people_ind_superiors, people_superiors, ai_id = null,
            pds = null,
            wfs = [];
        var do_trans = function(trans_data) {
                // save_form_data_b(function() {
                var post_data = {
                    process_instance_id: $("#review_wf_edit_form-content #process_instance_id").val(),
                    task_instance_id: $("#review_wf_edit_form-content #task_instance_id").val(),
                    process_define_id: $("#review_wf_edit_form-content #process_define_id").val(),
                    next_tdid: $("#review_wf_edit_form-content #next_tdid").val(),
                    next_user: $("#review_wf_edit_form-content #next_user_id").val() || $("#select_next_user").val(), //'516cf9a1d26ad4fe48000001', //以后从列表中选出
                    trans_name: $("#review_wf_edit_form-content #trans_name").val(), // 转移过来的名称
                    comment_msg: $("#review_wf_edit_form-content #comment_msg").val(), // 任务批注 
                    attachments: trans_data.attachments || null
                };
                var post_url = $("#review_wf_edit_form-content #task_process_url").val();
                post_url = post_url.replace('<TASK_ID>', $("#review_wf_edit_form-content #task_instance_id").val());
                $.post(post_url, post_data, function(data) {
                        if (data.code == 'OK') {
                            window.location = '#review';
                        } else {
                            window.location = '#review';

                        }
                    })
                    // })
            }
            // Extends Backbone.View
        var AssessmentReviewWfEditView = Backbone.View.extend({
            // The View Constructor
            initialize: function() {
                this.template = Handlebars.compile($("#psh_review_wf_edit_form_view").html());
                this.loading_template = Handlebars.compile($("#loading_template_view").html());
                this.trans_template = Handlebars.compile($("#trans_confirm_view").html());

                this.step1_template = Handlebars.compile($("#psh_review_wf_edit_step1_form_view").html()); //流程选择
                this.step2_template = Handlebars.compile($("#psh_review_wf_edit_step2_form_view").html()); //流程选择
                this.step3_template = Handlebars.compile($("#psh_review_wf_edit_step3_form_view").html()); //流程选择
                this.bind_events();
                var self = this;
            },
            pre_render: function() {
                var self = this;
                $("#review_wf_edit_form-content").html(self.loading_template({
                    info_msg: '数据加载中...请稍候'
                }));
                $("#review_wf_edit_form-content").trigger('create');
                return this;
            },
            // Renders all of the Assessment models on the UI
            render: function() {
                var self = this;
                var data = _.map(self.collection.models, function(x) {
                    return x.toJSON()
                })
                if (!data[0].review.initiator) {
                    data[0].review.initiator = {
                        _id: $("#login_people").val(),
                        "people_name": $("#login_people_name").val(),
                        "position_name": $("#login_position_name").val(),
                        "avatar": $("#login_avatar").val(),
                    }
                }

                $("#review_wf_edit_form #review_name").html("绩效面谈流程")

                //本地数据
                var sphb = JSON.parse(localStorage.getItem('sp_helper_back') || null);
                if (sphb) {
                    data[0].review.attendees = sphb.model.attendees;
                    localStorage.removeItem("sp_helper_back");

                }
                var sphb_upload = JSON.parse(localStorage.getItem('upload_model_back') || null);
                if (self.type == "edit") {
                    var is_initiator = data[0].review.initiator._id == String($("#login_people").val());
                    if (self.is_self) {
                        var is_edit = false;
                        var is_edit_self = true;
                        var is_edit_initiator = false;
                        var is_edit_step3 = false;

                    } else if (is_initiator) {
                        if (data[0].review.step221) {
                            var is_edit = false;
                            var is_edit_initiator = true;
                            var is_edit_self = false;
                            var is_edit_step3 = true;

                        } else {
                            var is_edit = true;
                            var is_edit_initiator = false;
                            var is_edit_self = false;
                            var is_edit_step3 = false;

                        }


                    }
                } else {
                    var is_edit = false;
                    var is_edit_initiator = false;
                    var is_edit_self = false;
                    var is_edit_step3 = false;

                }

                ai_id = data[0]._id;
                if (self.view_mode == 'trans') {
                    $("#review_wf_edit_form #review_name").html('数据处理人');

                    $("#review_wf_edit_form-content").html(self.trans_template(self.trans_data));
                    $("#review_wf_edit_form-content").trigger('create');

                    if (self.trans_data.next_td.node_type == 'END') {
                        do_trans(self.trans_data);
                    }
                } else {
                    //附件数据
                    if (sphb_upload) { //有从上传页面发回来的数据
                        var attachments = sphb_upload.model.attachments;
                        _.each(attachments, function(temp) {
                                var find_attachment = _.find(data[0].review.attachments, function(x) {
                                    if (x.file) {
                                        return x.file._id == String(temp)

                                    }
                                })
                                if (!find_attachment) {
                                    data[0].review.attachments.push({
                                        file: temp,
                                        people: $("#login_people").val()
                                    })
                                }
                            })
                            // data[0].review.attachments =[];
                        localStorage.removeItem('upload_model_back'); //用完删掉
                        _.each(data[0].review.attachments, function(x) {
                            if (x.file) {
                                x.file = x.file._id || x.file;
                            };
                            if (x.people) {
                                x.people = x.people._id || x.people;
                            };
                        })
                        if (data[0].review.initiator) {
                            data[0].review.initiator = data[0].review.initiator._id;
                        };
                        data[0].review.attendees = _.map(_.clone(data[0].review.attendees), function(x) {
                            return x._id;
                        })
                        self.collection.models[0].save(self.collection.models[0].attributes, {
                            success: function(model, response, options) {
                                self.collection.url = '/admin/pm/assessment_instance/review/bb/' + ai_id;
                                self.collection.fetch().done(function() {
                                    var render_data = {
                                        data: self.collection.models[0].attributes,
                                        is_edit: is_edit,
                                        is_edit_initiator: is_edit_initiator,
                                        is_edit_self: is_edit_self,
                                        is_edit_step3: is_edit_step3,
                                        type: self.type
                                    }
                                    render_data = _.extend(render_data, self.data);

                                    $("#review_wf_edit_form-content").html(self.template(render_data));
                                    $("#review_wf_edit_form-content").trigger('create');
                                })

                            }
                        });

                    } else {
                        var render_data = {
                            data: data[0],
                            is_edit: is_edit,
                            is_edit_initiator: is_edit_initiator,
                            is_edit_self: is_edit_self,
                            is_edit_step3: is_edit_step3,
                            type: self.type
                        }
                        render_data = _.extend(render_data, self.data);
                        $("#review_wf_edit_form-content").html(self.template(render_data));
                        $("#review_wf_edit_form-content").trigger('create');
                    }


                }


                //查找上级和间接上级数据
                async.series({
                    ind_sup: function(cb) {
                        self.get_ind_superiors(data[0].people.ind_superiors, cb);
                    },
                    sup: function(cb) {
                        self.get_superiors(data[0].people.superiors, cb);
                    }
                }, function(err, result) {
                    people_ind_superiors = result.ind_sup;
                    people_superiors = result.sup;

                })
                return this;

            },
            render_step1: function() {
                var self = this;
                var data = _.map(self.collection.models, function(x) {
                    return x.toJSON()
                })
                $("#review_wf_edit_form #review_name").html("上期绩效回顾")
                if (self.type == "edit") {
                    var is_initiator = data[0].review.initiator._id == String($("#login_people").val());
                    if (self.is_self) {
                        var is_edit = false;
                        var is_edit_self = true;
                        var is_edit_initiator = false;
                        var is_edit_step3 = false;

                    } else if (is_initiator) {
                        if (data[0].review.step221) {
                            var is_edit = false;
                            var is_edit_initiator = true;
                            var is_edit_self = false;
                            var is_edit_step3 = true;

                        } else {
                            var is_edit = true;
                            var is_edit_initiator = false;
                            var is_edit_self = false;
                            var is_edit_step3 = false;

                        }


                    }
                } else {
                    var is_edit = false;
                    var is_edit_initiator = false;
                    var is_edit_self = false;
                    var is_edit_step3 = false;

                }
                var render_data = {
                    data: data[0],
                    is_edit: is_edit,
                    is_edit_initiator: is_edit_initiator,
                    is_edit_self: is_edit_self,
                    is_edit_step3: is_edit_step3,
                    type: self.type
                }
                $("#review_wf_edit_form-content").html(self.step1_template(render_data));
                $("#review_wf_edit_form-content").trigger('create');
            },
            render_step2: function() {
                var self = this;
                var data = _.map(self.collection.models, function(x) {
                    return x.toJSON()
                })
                $("#review_wf_edit_form #review_name").html("面谈提纲撰写");

                if (self.type == "edit") {
                    var is_initiator = data[0].review.initiator._id == String($("#login_people").val());
                    if (self.is_self) {
                        var is_edit = false;
                        var is_edit_self = true;
                        var is_edit_initiator = false;
                        var is_edit_step3 = false;

                    } else if (is_initiator) {
                        if (data[0].review.step221) {
                            var is_edit = false;
                            var is_edit_initiator = true;
                            var is_edit_self = false;
                            var is_edit_step3 = true;

                        } else {
                            var is_edit = true;
                            var is_edit_initiator = false;
                            var is_edit_self = false;
                            var is_edit_step3 = false;

                        }


                    }
                } else {
                    var is_edit = false;
                    var is_edit_initiator = false;
                    var is_edit_self = false;
                    var is_edit_step3 = false;

                }
                var render_data = {
                    data: data[0],
                    is_edit: is_edit,
                    is_edit_initiator: is_edit_initiator,
                    is_edit_self: is_edit_self,
                    is_edit_step3: is_edit_step3,
                    type: self.type
                }
                $("#review_wf_edit_form-content").html(self.step2_template(render_data));
                $("#review_wf_edit_form-content").trigger('create');
            },
            render_step3: function() {
                var self = this;
                var data = _.map(self.collection.models, function(x) {
                    return x.toJSON()
                })
                $("#review_wf_edit_form #review_name").html("面谈沟通纪要")
                if (self.ai_status != 11 || self.is_self) {
                    var is_edit = false;
                } else {
                    var is_edit = true;

                }
                var peoples = [];
                peoples.push(data[0].review.initiator)
                _.each(data[0].review.attendees, function(x) {
                    peoples.push(x);
                })
                peoples.push(data[0].people);
                if (self.type == "edit") {
                    var is_initiator = data[0].review.initiator._id == String($("#login_people").val());
                    if (self.is_self) {
                        var is_edit = false;
                        var is_edit_self = true;
                        var is_edit_initiator = false;
                        var is_edit_step3 = false;

                    } else if (is_initiator) {
                        if (data[0].review.step221) {
                            var is_edit = false;
                            var is_edit_initiator = true;
                            var is_edit_self = false;
                            var is_edit_step3 = true;

                        } else {
                            var is_edit = true;
                            var is_edit_initiator = false;
                            var is_edit_self = false;
                            var is_edit_step3 = false;

                        }


                    }
                } else {
                    var is_edit = false;
                    var is_edit_initiator = false;
                    var is_edit_self = false;
                    var is_edit_step3 = false;

                }
                var render_data = {
                    data: data[0],
                    is_edit: is_edit,
                    is_edit_initiator: is_edit_initiator,
                    is_edit_self: is_edit_self,
                    is_edit_step3: is_edit_step3,
                    peoples: peoples,
                    type: self.type
                }
                $("#review_wf_edit_form-content").html(self.step3_template(render_data));
                $("#review_wf_edit_form-content").trigger('create');
            },
            render_wf: function(pds) {
                var self = this;
                var data = _.map(self.collection.models, function(x) {
                    return x.toJSON()
                })
                var render_data = {
                    pds: pds
                }
                $("#review_wf_edit_form #summary_name").html("启动审批流程");
                $("#review_wf_edit_form-content").html(self.wf_template(render_data));
                $("#review_wf_edit_form-content").trigger('create');
                return this;

            },
            bind_events: function() {
                var self = this;

                $("#review_wf_edit_form").on('click', '#add_attendees', function(event) { //第三层－指标总结入口
                    event.preventDefault();
                    var data = _.map(self.collection.models, function(x) {
                        return x.toJSON()
                    })
                    var url = '#people_select/m/attendees';
                    localStorage.setItem('sp_helper', JSON.stringify({
                        model: data[0].review,
                        back_url: window.location.hash,
                    })); //放到local storage里面，便于后面选择屏幕进行操作
                    window.location.href = url;
                }).on('click', '#review_href', function(event) { //返回定位
                    event.preventDefault();
                    window.location.href = "/m#review";
                }).on('click', '.btn-review_wf_edit_form-change_state', function(event) { //定位不足与改进及亮点分享
                    event.preventDefault();
                    var view_filter = $(this).data("view_filter");
                    $.mobile.loading('show');

                    if (view_filter == 'A') {

                        self.render();
                        $.mobile.loading('hide');

                    } else if (view_filter == 'B') {
                        self.render_step1();
                        $.mobile.loading('hide');

                    } else if (view_filter == 'C') {
                        self.render_step2();
                        $.mobile.loading('hide');

                    } else if (view_filter == 'D') {
                        self.render_step3();
                        $.mobile.loading('hide');
                    }
                }).on('click', '.delete_attendees', function(event) { //添加指标
                    event.preventDefault();
                    var people_id = $(this).data("up_id");
                    var data = _.map(self.collection.models, function(x) {
                        return x.toJSON()
                    });
                    data[0].review.attendees = _.filter(data[0].review.attendees, function(x) {
                        return x._id != String(people_id)
                    })
                    var data4save = _.clone(data[0]);
                    var type = "delete";
                    self.data_save(data4save, ai_id, type);

                }).on('click', '#btn_save', function(event) { //数据保存接口
                    event.preventDefault();
                    var ai_id = $(this).data("ai_id")||self.collection.models[0].attributes._id;
                    var data4save = _.clone(self.collection.models[0].attributes);
                    var type = "success";
                    self.data_save(data4save, ai_id, type);
                }).on('change', "textarea", function(event) {
                    event.preventDefault();
                    var field = String($(this).data("field")).split('-');
                    if (field) {
                        var comment = $(this).val();
                        if (self.collection.models[0].attributes[field[0]]) {
                            self.collection.models[0].attributes[field[0]][field[1]] = comment;
                            var data4save = _.clone(self.collection.models[0].attributes);
                            self.data_save(data4save, ai_id, "no_render"); //自评值的保存
                        }

                    }


                }).on('change', "#place", function(event) {
                    event.preventDefault();
                    var ai_id = ai_id || self.collection.models[0].attributes._id;
                    self.collection.models[0].attributes.review.place = $(this).val();
                    var data4save = _.clone(self.collection.models[0].attributes);
                    self.data_save(data4save, ai_id, null); //自评值的保存

                }).on('change', "#start,#end", function(event) {
                    event.preventDefault();
                    var field = $(this).data("field");
                    var start = self.collection.models[0].attributes.start;
                    var end = self.collection.models[0].attributes.end;

                    if (field == "start") {
                        // if (moment($(this).val()).isAfter(moment(end))) {
                        //     alert("面谈开始时间需小于面谈结束时间")
                        // } else {
                        self.collection.models[0].attributes.review[field] = moment($(this).val());

                        // }

                    } else if (field == "end") {
                        // if (moment($(this).val()).isBefore(moment(start))) {
                        //     alert("面谈结束时间需大于面谈开始时间")
                        // } else {
                        self.collection.models[0].attributes.review[field] = moment($(this).val());

                        // }

                    }
                    var data4save = _.clone(self.collection.models[0].attributes);
                    self.data_save(data4save, ai_id, null); //自评值的保存


                }).on('click', '#btn_upload_attachment', function(event) { //添加附件
                    event.preventDefault();
                    var data = _.map(self.collection.models, function(x) {
                            return x.toJSON()
                        })
                        //转到上传图片的页面
                    localStorage.removeItem('upload_model_back'); //先清掉
                    var next_url = '#upload_pic';
                    localStorage.setItem('upload_model', JSON.stringify({
                        model: {
                            attachments: []
                        },
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
                }).on('click', '.do_trans', function(event) {
                    event.preventDefault();
                    var $this = $(this);
                    if ($("#review_wf_edit_form-content #ti_comment").val() == '') {
                        alert('请填写审批意见！');
                        return;
                    }
                    if (self.is_self) {
                        if (String($("#review_wf_edit_form-content #step221").val()) == undefined || String($("#review_wf_edit_form-content #step222").val()) == undefined) {
                            alert('面谈接受人栏目不能为空！');
                            return;
                        }
                    }
                    $(this).attr('disabled', true)
                    $.mobile.loading("show");
                    var process_define_id = $("#review_wf_edit_form-content #process_define_id").val();
                    var task_define_id = $("#review_wf_edit_form-content #task_define_id").val();
                    var process_instance_id = $("#review_wf_edit_form-content #process_instance_id").val();
                    var task_process_url = $("#review_wf_edit_form-content #task_process_url").val();
                    var task_instance_id = $("#review_wf_edit_form-content #task_instance_id").val();

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
                            ti_comment: $("#review_wf_edit_form-content #ti_comment").val(),
                            task_instance_id: task_instance_id,
                            next_tdid: target_id,
                            direction: direction,
                            attachments: self.data.attachments,
                            people_id: $("#people_id").val() || self.collection.models[0].attributes.people._id

                        }, function(data) {
                            // if (data.direction == 'F' && roles_type == 'FREE') { //将被面谈人取出来，作为下一个任务的接收人
                            //     data.next_task_users.push(self.collection.models[0].attributes.people);
                            // };
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
                            ti_comment: $("#review_wf_edit_form-content #ti_comment").val(),
                            task_instance_id: task_instance_id,
                            next_tdid: target_id,
                            direction: direction,
                            attachments: self.data.attachments,
                            people_id: $("#people_id").val() || self.collection.models[0].attributes.people._id
                        }, function(data) {
                            // // 流程使用的用户出口函数
                            // if (data.direction == 'F' && roles_type == 'FREE') { //将被面谈人取出来，作为下一个任务的接收人
                            //     console.log(self.collection.models[0].attributes.people);

                            //     data.next_task_users.push(self.collection.models[0].attributes.people);
                            // };
                            self.view_mode = 'trans';
                            self.trans_data = data;
                            $.mobile.loading("hide");
                            self.render();
                        });


                    }


                }).on('click', '#btn_ok', function(e) {
                    $.mobile.loading("show");
                    if ($("#next_user_name").val() || $("#select_next_user").val()) {
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
                }).on('click', '#btn_wf_review_start_userchat', function(event) {
                    event.preventDefault();
                    var people = $(this).data("people") || self.collection.models[0].attributes.ai.people._id;
                    var url = "im://userchat/" + self.data.ai.people._id;
                    window.location.href = url;
                })

            },
            get_ind_superiors: function(people_id, cb) {

                $.get('/admin/masterdata/people/get/' + people_id, function(data) {
                    if (data.code == 'OK') {
                        cb(null, data.data);
                    } else {
                        cb(null, null);
                    };
                });

            },
            get_superiors: function(people_id, cb) {
                $.get('/admin/masterdata/people/get/' + people_id, function(data) {
                    if (data.code == 'OK') {
                        cb(null, data.data);
                    } else {
                        cb(null, null);
                    };
                });
            },

            data_save: function(data4save, ai_id, type) {
                var self = this;
                //回复populate出来的字段
                if (data4save.review.initiator) {
                    data4save.review.initiator = data4save.review.initiator._id;
                } else {
                    data4save.review.initiator = $("#login_people").val()
                };
                data4save.review.attendees = _.map(_.clone(data4save.review.attendees), function(x) {
                    return x._id;
                })

                _.each(data4save.review.attachments, function(x) {
                    if (x.file) {
                        x.file = x.file._id;
                    };
                    if (x.people) {
                        x.people = x.people._id;
                    };
                })
                self.collection.url = '/admin/pm/assessment_instance/review/bb/' + ai_id;

                self.collection.models[0].save(data4save, {
                    success: function(model, response, options) {
                        self.collection.fetch().done(function() {
                            if (type == "success") {
                                alert("数据保存成功!");
                                self.render();

                            } else if (type == "delete") {
                                alert("数据删除成功!");
                                self.render();

                            }
                        })

                    },
                    error: function(model, xhr, options) {}
                });
            },

        });

        // Returns the View class
        return AssessmentReviewWfEditView;

    });