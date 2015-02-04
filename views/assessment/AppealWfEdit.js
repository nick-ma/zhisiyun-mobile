// Assessment  Appeal Edit View 绩效面谈查看界面
// =============================================================

// Includes file dependencies
define(["jquery", "underscore", "async", "backbone", "handlebars", "moment", "../../models/AssessmentModel", "../../models/CollTaskModel"],
    function($, _, async, Backbone, Handlebars, moment, AssessmentModel, CollTask) {
        var people_ind_superiors, people_superiors, ai_id = null,
            pds = null;
        var do_trans = function(trans_data) {
                // save_form_data_b(function() {
                var post_data = {
                    process_instance_id: $("#appeal_wf_edit_form-content #process_instance_id").val(),
                    task_instance_id: $("#appeal_wf_edit_form-content #task_instance_id").val(),
                    process_define_id: $("#appeal_wf_edit_form-content #process_define_id").val(),
                    next_tdid: $("#appeal_wf_edit_form-content #next_tdid").val(),
                    next_user: $("#appeal_wf_edit_form-content #next_user_id").val() || $("#select_next_user").val(), //'516cf9a1d26ad4fe48000001', //以后从列表中选出
                    trans_name: $("#appeal_wf_edit_form-content #trans_name").val(), // 转移过来的名称
                    comment_msg: $("#appeal_wf_edit_form-content #comment_msg").val(), // 任务批注 
                    attachments: trans_data.attachments || null
                };
                var post_url = $("#appeal_wf_edit_form-content #task_process_url").val();
                post_url = post_url.replace('<TASK_ID>', $("#appeal_wf_edit_form-content #task_instance_id").val());
                $.post(post_url, post_data, function(data) {
                        if (data.code == 'OK') {
                            window.location = '#appeal';
                        } else {
                            window.location = '#appeal';

                        }
                    })
                    // })
            }
            // Extends Backbone.View
        var AssessmentAppealWfEditView = Backbone.View.extend({
            // The View Constructor
            initialize: function() {
                this.template = Handlebars.compile($("#psh_appeal_wf_edit_form_view").html());
                this.loading_template = Handlebars.compile($("#loading_template_view").html());
                this.trans_template = Handlebars.compile($("#trans_confirm_view").html());

                this.index_template = Handlebars.compile($("#psh_appeal_item_select_view").html()); //指标选择
                this.reason_template = Handlebars.compile($("#psh_appeal_reason_view").html()); //申诉理由
                this.bind_events();
                var self = this;
            },
            pre_render: function() {
                var self = this;
                $("#appeal_wf_edit_form-content").html(self.loading_template({
                    info_msg: '数据加载中...请稍候'
                }));
                $("#appeal_wf_edit_form-content").trigger('create');
                return this;
            },
            // Renders all of the Assessment models on the UI
            render: function(index, type) {
                var self = this;

                if (!!localStorage.getItem('to_do_back_url')) {
                    self.to_do_back_url = localStorage.getItem('to_do_back_url');
                    localStorage.removeItem('to_do_back_url');
                }

                var data = _.map(self.collection.models, function(x) {
                    return x.toJSON()
                })
                var people = self.collection.models[0].get('people');
                if (self.view_status == "view") {
                    var is_edit = false;
                    $("#appeal_wf_edit_form #appeal_name").html("申诉流程查看")

                } else if (self.view_status == "edit") {
                    if (self.is_self) {
                        var is_status = false;
                    } else {
                        var is_status = true;
                    }
                    var is_edit = true;
                    $("#appeal_wf_edit_form #appeal_name").html("申诉流程编辑")

                }
                var rendered_content = [];
                var items = data[0].quantitative_pis.items; //ration=2 定量
                var mark_as_appeal_dl_num = 0,
                    mark_as_appeal_dx_num = 0, //指标个数；
                    mark_as_appeal_other1_num = 0,
                    mark_as_appeal_other2_num = 0,
                    mark_as_appeal_other3_num = 0,
                    exist_item = [];

                if (index == 'index_select') {
                    _.each(items, function(x) {
                        x.people = people;
                        x.ration = 2;
                        x.view_status = self.view_status;
                        rendered_content.push(x);
                        if (x.mark_as_appeal) {
                            mark_as_appeal_dl_num += 1;
                            exist_item.push(x)
                        }


                    })
                } else {
                    _.each(items, function(x) {
                        if (x.mark_as_appeal) {
                            x.people = people;
                            x.ration = 2;
                            x.view_status = self.view_status;
                            rendered_content.push(x);
                            mark_as_appeal_dl_num += 1;

                        };
                    })
                }


                var items = data[0].qualitative_pis.items; //ration=1 定性
                if (index == "index_select") {
                    _.each(items, function(x) {
                        x.people = people;
                        x.ration = 1;
                        x.view_status = self.view_status;
                        rendered_content.push(x);
                        if (x.mark_as_appeal) {
                            exist_item.push(x)
                            mark_as_appeal_dx_num += 1;
                        }

                    })
                } else {
                    _.each(items, function(x) {
                        if (x.mark_as_appeal) {
                            x.people = people;
                            x.ration = 1;
                            x.view_status = self.view_status;
                            rendered_content.push(x);
                            mark_as_appeal_dx_num += 1;
                        }
                    })
                }
                var others_content = [];
                //其它项
                var others = _.clone(data[0].others);
                //获取加分项
                var other1 = _.find(others, function(x) {
                    return x.item_type == '1';
                });
                //获取减分项
                var other2 = _.find(others, function(x) {
                    return x.item_type == '2';
                });
                //获取一票否决项
                var other3 = _.find(others, function(x) {
                    return x.item_type == '3';
                });
                if (index == "index_select") {
                    if (other1) {
                        var items = other1.items;
                        _.each(items, function(x) {
                            x.people = people;
                            x.item_type = 1;
                            x.view_status = self.view_status;
                            others_content.push(x);
                            if (x.mark_as_appeal) {
                                exist_item.push(x)
                                mark_as_appeal_other1_num += 1;
                            }

                        })
                    }
                    if (other2) {
                        var items = other2.items;
                        _.each(items, function(x) {
                            x.people = people;
                            x.item_type = 2;
                            x.view_status = self.view_status;
                            others_content.push(x);
                            if (x.mark_as_appeal) {
                                exist_item.push(x)
                                mark_as_appeal_other2_num += 1;
                            }

                        })
                    }
                    if (other3) {
                        var items = other3.items;
                        _.each(items, function(x) {
                            x.people = people;
                            x.item_type = 3;
                            x.view_status = self.view_status;
                            others_content.push(x);
                            if (x.mark_as_appeal) {
                                exist_item.push(x)
                                mark_as_appeal_other3_num += 1;
                            }

                        })
                    }

                } else {
                    if (other1) {
                        var items = other1.items;
                        _.each(items, function(x) {
                            if (x.mark_as_appeal) {
                                x.people = people;
                                x.item_type = 1;
                                x.view_status = self.view_status;
                                others_content.push(x);
                                mark_as_appeal_other1_num += 1;
                            }
                        })
                    }
                    if (other2) {
                        var items = other2.items;
                        _.each(items, function(x) {
                            if (x.mark_as_appeal) {
                                x.people = people;
                                x.item_type = 2;
                                x.view_status = self.view_status;
                                others_content.push(x);
                                mark_as_appeal_other2_num += 1;
                            }
                        })
                    }
                    if (other3) {
                        var items = other3.items;
                        _.each(items, function(x) {
                            if (x.mark_as_appeal) {
                                x.people = people;
                                x.item_type = 3;
                                x.view_status = self.view_status;
                                others_content.push(x);
                                mark_as_appeal_other3_num += 1;
                            }
                        })
                    }

                }
                ai_id = data[0]._id;

                var sphb_upload = JSON.parse(localStorage.getItem('upload_model_back') || null);
                //附件数据
                if (sphb_upload) { //有从上传页面发回来的数据
                    var attachments = sphb_upload.model.attachments;
                    var module = sphb_upload.model.data_source;
                    var item_id = sphb_upload.model.item_id;
                    var item_type = sphb_upload.model.item_type;
                    // data[0].review.attachments =[];
                    localStorage.removeItem('upload_model_back'); //用完删掉
                    _.each(self.collection.models[0].attributes.qualitative_pis.items, function(x) {
                        x.appeal.attachments = _.map(x.appeal.attachments, function(y) {
                            if (y) {
                                return y._id;

                            }
                        })
                    })
                    _.each(self.collection.models[0].attributes.quantitative_pis.items, function(x) {
                        x.appeal.attachments = _.map(x.appeal.attachments, function(y) {
                            if (y) {
                                return y._id;

                            }
                        })
                    })
                    _.each(self.collection.models[0].attributes.others, function(x) {
                        _.each(x.items, function(y) {
                            y.appeal.attachments = _.map(y.appeal.attachments, function(z) {
                                if (z) {
                                    return z._id;
                                }
                            })
                        })

                    })
                    if (module == "A") {
                        var ration = item_type;
                        var pi_id = item_id;
                        if (ration == '1') {

                            var items = self.collection.models[0].attributes.qualitative_pis.items;
                            var found = self.get_pi(items, pi_id);

                            found.appeal.attachments.push(attachments[0]);


                        } else if (ration == '2') {

                            var items = self.collection.models[0].attributes.quantitative_pis.items;
                            var found = self.get_pi(items, pi_id);

                            found.appeal.attachments.push(attachments[0]);

                        }
                    } else if (module == "B") {

                        var item = item_id;
                        if (item_type == '1') {
                            var others = self.collection.models[0].attributes.others;
                            var found = self.get_item(others, item_type, item);
                            found.appeal.attachments.push(attachments[0]);


                        } else if (item_type == '2') {
                            var others = self.collection.models[0].attributes.others;
                            var found = self.get_item(others, item_type, item);
                            found.appeal.attachments.push(attachments[0]);

                        } else if (item_type == '3') {
                            var others = self.collection.models[0].attributes.others;
                            var found = self.get_item(others, item_type, item);
                            found.appeal.attachments.push(attachments[0]);

                        }
                    }

                    self.collection.models[0].save(self.collection.models[0].attributes, {
                        success: function(model, response, options) {
                            self.collection.url = '/admin/pm/assessment_instance/appeal/bb/' + ai_id;
                            self.collection.fetch().done(function() {
                                var obj_status = {
                                    'A': 'edit',
                                    'B': 'view'
                                }
                                self.render_pi(module, obj_status['A'], item_id, item_type);
                            })

                        }
                    });

                } else {
                    var render_data = {
                        rendered_content: rendered_content,
                        others_content: others_content,
                        data: data[0],
                        is_edit: is_edit,
                        is_status: is_status,
                        type1_len: mark_as_appeal_dl_num,
                        type2_len: mark_as_appeal_dx_num,
                        type3_len: mark_as_appeal_other1_num,
                        type4_len: mark_as_appeal_other2_num,
                        type5_len: mark_as_appeal_other3_num
                    }
                    render_data = _.extend(render_data, self.data);

                    $("#appeal_href").attr("href", '/m#appeal');
                    if (index == 'index_select') {
                        $("#appeal_wf_edit_form #appeal_name").html("选择绩效申诉项目");
                        $("#appeal_wf_edit_form #appeal_href").data("module", "detail");
                        $("#appeal_wf_edit_form #add_pi").data("ai_id", data[0]._id);
                        $("#appeal_wf_edit_form #add_pi").show();
                        $("#appeal_wf_edit_form-content").html(self.index_template(render_data));
                        var $container = $("#appeal_wf_edit_form-content");

                        _.each(exist_item, function(x) {
                            $container.find("#cb-" + x._id).attr('checked', true);
                        })


                    } else {
                        if (self.view_mode == 'trans') {
                            $("#appeal_wf_edit_form #appeal_name").html('数据处理人');

                            $("#appeal_wf_edit_form-content").html(self.trans_template(self.trans_data));
                            // $("#summary_wf_edit_form-content").trigger('create');

                            if (self.trans_data.next_td.node_type == 'END') {
                                do_trans(self.trans_data);
                            }
                        } else {
                            $("#appeal_wf_edit_form #add_pi").hide();

                            $("#appeal_wf_edit_form-content").html(self.template(render_data));

                        }
                    }
                    $("#appeal_wf_edit_form-content").trigger('create');
                }


                return this;

            },
            render_pi: function(module, view_status, item_id, ration) {
                var self = this;
                $.mobile.loading("show");
                var data = _.map(self.collection.models, function(x) {
                        return x.toJSON()
                    })
                    //是否可以编辑
                if (self.view_status == 'edit' && self.is_self) {
                    var is_edit = true;
                } else {
                    var is_edit = false;

                }
                if (module == 'A') {
                    if (ration == '1') {
                        var items = data[0].qualitative_pis.items; //ration=1 定xing
                        var find_data = _.find(items, function(x) {
                            return x.pi == String(item_id)
                        })
                        find_data.ration = 1;
                    } else if (ration == '2') {
                        var items = data[0].quantitative_pis.items; //ration=2 定量
                        var find_data = _.find(items, function(x) {
                            return x.pi == String(item_id)
                        })
                        find_data.ration = 2;

                    }
                } else if (module == 'B') {
                    if (ration == '1') {
                        var others = data[0].others;
                        var find_data = self.get_item(others, ration, item_id);


                    } else if (ration == '2') {
                        var others = data[0].others;
                        var find_data = self.get_item(others, ration, item_id);

                    } else if (ration == '3') {
                        var others = data[0].others;
                        var find_data = self.get_item(others, ration, item_id);

                    }
                }


                var render_data = {
                    data: data[0],
                    find_data: find_data,
                    is_edit: is_edit,
                };
                //*module == 'A' 指标选择   'B':加减分项选择

                render_data.data_source = module;
                $("#appeal_wf_edit_form #appeal_href").data("module", module);
                $("#appeal_wf_edit_form #appeal_name").html("申诉理由及证据");
                $("#appeal_wf_edit_form-content").html(self.reason_template(render_data));
                $("#appeal_wf_edit_form-content").trigger('create');
                $.mobile.loading('hide');

                return this; //指标－绩效总结数据

            },
            bind_events: function() {
                var self = this;
                $("#appeal_wf_edit_form").on('click', '.appeal_pi', function(event) { //第三层－绩效指标选择
                    event.preventDefault();
                    var module = $(this).data("module");
                    var ai_id = $(this).data("ai_id");
                    var pi_id = $(this).data("pi_id");
                    var obj_status = {
                        'A': 'edit',
                        'B': 'view'
                    }
                    var view_status = $(this).data("view_status");
                    var ration = $(this).data("ration");
                    $.mobile.loading("show");
                    self.render_pi(module, obj_status[view_status], pi_id, ration);
                    $.mobile.loading('hide');


                }).on('click', '.item_type', function(event) { //第三层－加减分项选择
                    event.preventDefault();
                    var module = $(this).data("module");
                    var ai_id = $(this).data("ai_id");
                    var item = $(this).data("item");
                    var item_type = $(this).data("item_type");
                    var view_status = $(this).data("view_status");
                    var obj_status = {
                        'A': 'edit',
                        'B': 'view'
                    }
                    $.mobile.loading("show");
                    self.render_pi(module, obj_status[view_status], item, item_type);
                    $.mobile.loading('hide');


                }).on('click', '#appeal_href', function(event) { //返回定位
                    event.preventDefault();
                    if ($(this).data("module")) {
                        self.render();
                        $(this).data("module", "");
                    } else {
                        // window.location.href = "/m#appeal";
                        window.location.href = self.to_do_back_url;
                    }
                }).on('click', '#btn_add_appeal_item', function(event) { //指标选择－不足与改进
                    event.preventDefault();
                    var index = "index_select";
                    self.render(index)
                }).on('click', '#add_pi', function(event) { //添加绩效申诉项目
                    event.preventDefault();
                    var ai_id = $(this).data("ai_id");

                    var items_1 = self.collection.models[0].attributes.qualitative_pis.items;
                    _.each(items_1, function(i) {
                        i.mark_as_appeal = false;
                    })
                    var items_2 = self.collection.models[0].attributes.quantitative_pis.items;
                    _.each(items_2, function(i) {
                        i.mark_as_appeal = false;
                    })
                    var others = self.collection.models[0].attributes.others;
                    _.each(others, function(o) {
                        if (o) {
                            _.each(o.items, function(x) {
                                x.mark_as_appeal = false;
                            })
                        }

                    })
                    _.each($("#appeal_wf_edit_form input[class='appeal_item_select']:checked"), function(x) {
                        var type = $(x).data("type");
                        if (type == "ration") {
                            var ration = $(x).data("ration");
                            var pi_id = $(x).data("pi_id");
                            if (ration == '1') {
                                var items = self.collection.models[0].attributes.qualitative_pis.items;
                                var found = self.get_pi(items, pi_id);
                                found.mark_as_appeal = true;


                            } else if (ration == '2') {
                                var items = self.collection.models[0].attributes.quantitative_pis.items;
                                var found = self.get_pi(items, pi_id);
                                found.mark_as_appeal = true;

                            }
                        } else if (type == "item_type") {
                            var item_type = $(x).data("item_type");
                            var item = $(x).data("item");
                            if (item_type == '1') {
                                var others = self.collection.models[0].attributes.others;
                                var found = self.get_item(others, item_type, item);
                                found.mark_as_appeal = true;


                            } else if (item_type == '2') {
                                var others = self.collection.models[0].attributes.others;
                                var found = self.get_item(others, item_type, item);
                                found.mark_as_appeal = true;

                            } else if (item_type == '3') {
                                var others = self.collection.models[0].attributes.others;
                                var found = self.get_item(others, item_type, item);
                                found.mark_as_appeal = true;

                            }
                        }



                    })
                    var data4save = _.clone(self.collection.models[0].attributes);
                    self.data_save(data4save, ai_id, null);

                }).on('click', '#btn_save', function(event) { //数据保存接口
                    event.preventDefault();
                    var ai_id = $(this).data("ai_id") || self.collection.models[0].attributes._id;
                    var data4save = _.clone(self.collection.models[0].attributes);
                    var type = "success";
                    self.data_save(data4save, ai_id, type);
                }).on('change', "textarea", function(event) {
                    event.preventDefault();
                    var $this = $(this);
                    var module = $(this).data("field");
                    if (module == "A") {
                        var ration = $(this).data("ration");
                        var pi_id = $(this).data("pi_id");
                        if (ration == '1') {
                            var items = self.collection.models[0].attributes.qualitative_pis.items;
                            var found = self.get_pi(items, pi_id);
                            found.appeal.reason = $this.val();

                        } else if (ration == '2') {
                            var items = self.collection.models[0].attributes.quantitative_pis.items;
                            var found = self.get_pi(items, pi_id);
                            found.appeal.reason = $this.val();


                        }
                    } else if (module == "B") {
                        var item_type = $(this).data("item_type");
                        var item = $(this).data("item");
                        if (item_type == '1') {
                            var others = self.collection.models[0].attributes.others;
                            var found = self.get_item(others, item_type, item);
                            found.appeal.reason = $this.val();


                        } else if (item_type == '2') {
                            var others = self.collection.models[0].attributes.others;
                            var found = self.get_item(others, item_type, item);
                            found.appeal.reason = $this.val();

                        } else if (item_type == '3') {
                            var others = self.collection.models[0].attributes.others;
                            var found = self.get_item(others, item_type, item);
                            found.appeal.reason = $this.val();

                        }
                    }
                    var data4save = _.clone(self.collection.models[0].attributes);
                    self.data_save(data4save, ai_id, "no_render"); //自评值的保存

                }).on('click', '#btn_upload_attachment', function(event) { //添加附件
                    event.preventDefault();
                    var data = _.map(self.collection.models, function(x) {
                        return x.toJSON()
                    })
                    var data_source = $(this).data("field");
                    if (data_source == 'A') {
                        var _id = $(this).data("pi_id");
                        var item_type = $(this).data("ration");

                    } else {
                        var _id = $(this).data("item");
                        var item_type = $(this).data("item_type");


                    }
                    //转到上传图片的页面
                    localStorage.removeItem('upload_model_back'); //先清掉
                    var next_url = '#upload_pic';
                    localStorage.setItem('upload_model', JSON.stringify({
                        model: {
                            attachments: [],
                            data_source: data_source,
                            item_id: _id,
                            item_type: item_type

                        },
                        field: 'attachments',
                        back_url: window.location.hash
                    }))
                    window.location.href = next_url;
                }).on('click', '.do_trans', function(event) {
                    event.preventDefault();
                    var $this = $(this);
                    if ($("#appeal_wf_edit_form-content #ti_comment").val() == '') {
                        alert('请填写审批意见！');
                        return;
                    }
                    $(this).attr('disabled', true)
                    $.mobile.loading("show");
                    var process_define_id = $("#appeal_wf_edit_form-content #process_define_id").val();
                    var task_define_id = $("#appeal_wf_edit_form-content #task_define_id").val();
                    var process_instance_id = $("#appeal_wf_edit_form-content #process_instance_id").val();
                    var task_process_url = $("#appeal_wf_edit_form-content #task_process_url").val();
                    var task_instance_id = $("#appeal_wf_edit_form-content #task_instance_id").val();

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
                            ti_comment: $("#appeal_wf_edit_form-content #ti_comment").val(),
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
                            ti_comment: $("#appeal_wf_edit_form-content #ti_comment").val(),
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
                }).on('click', '#btn_wf_appeal_start_userchat', function(event) {
                    event.preventDefault();
                    var people = $(this).data("people") || self.collection.models[0].attributes.ai.people._id;
                    var url = "im://userchat/" + people;
                    window.location.href = url;
                }).on('change', '.is_agree', function(event) {
                    event.preventDefault();
                    var ai_id = self.collection.models[0].attributes._id;
                    var $this = $(this);
                    var module = $this.data("module");
                    var status = $this.data("status");
                    if (module == "A") {
                        var ration = $this.data("ration");
                        var pi_id = $this.data("pi_id");
                        if (ration == '1') {

                            var items = self.collection.models[0].attributes.qualitative_pis.items;
                            var found = self.get_pi(items, pi_id);

                            found.appeal.status = status;


                        } else if (ration == '2') {

                            var items = self.collection.models[0].attributes.quantitative_pis.items;
                            var found = self.get_pi(items, pi_id);

                            found.appeal.status = status;

                        }
                    } else if (module == "B") {

                        var item_type = $this.data("item_type");
                        var item = $this.data("item");
                        if (item_type == '1') {
                            var others = self.collection.models[0].attributes.others;
                            var found = self.get_item(others, item_type, item);
                            found.appeal.status = status;


                        } else if (item_type == '2') {
                            var others = self.collection.models[0].attributes.others;
                            var found = self.get_item(others, item_type, item);
                            found.appeal.status = status;

                        } else if (item_type == '3') {
                            var others = self.collection.models[0].attributes.others;
                            var found = self.get_item(others, item_type, item);
                            found.appeal.status = status;

                        }
                    }
                    var data4save = _.clone(self.collection.models[0].attributes);
                    self.data_save(data4save, ai_id, null);
                })

            },

            get_pi: function(items, pi_id) { // 得到指标对象
                var found = _.find(items, function(x) {
                    return x.pi == String(pi_id)
                })
                return found
            },
            get_item: function(others, item_type, item) { // 得到加减分项
                var found = null;
                var other = _.find(others, function(x) {
                    return x.item_type == String(item_type)
                })
                if (other) {
                    var found = _.find(other.items, function(x) {
                        return x.item == String(item)
                    })
                }
                return found
            },
            data_save: function(data4save, ai_id, type) {
                var self = this;
                _.each(data4save.quantitative_pis.items, function(x) {
                    // x.appeal.attachments = [];
                    x.appeal.attachments = _.map(x.appeal.attachments, function(y) {
                        if (y) {
                            return y._id;

                        }
                    })
                })
                _.each(data4save.qualitative_pis.items, function(x) {
                    // x.appeal.attachments = []
                    x.appeal.attachments = _.map(x.appeal.attachments, function(y) {

                        if (y) {
                            return y._id;

                        }
                    })
                })
                _.each(data4save.others, function(x) {
                    _.each(x.items, function(y) {
                        // y.appeal.attachments = [];
                        y.appeal.attachments = _.map(y.appeal.attachments, function(z) {

                            if (z) {
                                return z._id;
                            }
                        })
                    })

                })

                self.collection.models[0].save(data4save, {
                    success: function(model, response, options) {
                        self.collection.url = '/admin/pm/assessment_instance/appeal/bb/' + ai_id;
                        self.collection.fetch().done(function() {
                            if (type != "no_render") {
                                self.render();
                            } else if (type == "render") {
                                self.render();
                            }
                            if (type == "success") {
                                alert("数据保存成功!");
                                self.render();
                            }
                        })

                    },
                    error: function(model, xhr, options) {}
                });
            },

        });

        // Returns the View class
        return AssessmentAppealWfEditView;

    });