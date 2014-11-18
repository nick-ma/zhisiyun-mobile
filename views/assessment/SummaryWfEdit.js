// Assessment  Summary Edit View 绩效总结查看界面（不足与改进、突出的绩效亮点分享、总结陈述）
// =============================================================

// Includes file dependencies
define(["jquery", "underscore", "async", "backbone", "handlebars", "moment", "../../models/AssessmentModel", "../../models/CollTaskModel"],
    function($, _, async, Backbone, Handlebars, moment, AssessmentModel, CollTask) {
        var people_ind_superiors, people_superiors, ai_id = null,
            pds = null;
        var do_trans = function(trans_data) {
                // save_form_data_b(function() {
                var post_data = {
                    process_instance_id: $("#summary_wf_edit_form-content #process_instance_id").val(),
                    task_instance_id: $("#summary_wf_edit_form-content #task_instance_id").val(),
                    process_define_id: $("#summary_wf_edit_form-content #process_define_id").val(),
                    next_tdid: $("#summary_wf_edit_form-content #next_tdid").val(),
                    next_user: $("#summary_wf_edit_form-content #next_user_id").val() || $("#select_next_user").val(), //'516cf9a1d26ad4fe48000001', //以后从列表中选出
                    trans_name: $("#summary_wf_edit_form-content #trans_name").val(), // 转移过来的名称
                    comment_msg: $("#summary_wf_edit_form-content #comment_msg").val(), // 任务批注 
                    attachments: trans_data.attachments || null
                };
                var post_url = $("#summary_wf_edit_form-content #task_process_url").val();
                post_url = post_url.replace('<TASK_ID>', $("#summary_wf_edit_form-content #task_instance_id").val());
                $.post(post_url, post_data, function(data) {
                        if (data.code == 'OK') {
                            window.location = '#summary';
                        } else {
                            window.location = '#summary';

                        }
                    })
                    // })
            }
            // Extends Backbone.View
        var AssessmentSummaryWfEditView = Backbone.View.extend({
            // The View Constructor
            initialize: function() {
                this.template = Handlebars.compile($("#psh_summary_wf_edit_form_view").html());
                this.loading_template = Handlebars.compile($("#loading_template_view").html());
                this.pi_template = Handlebars.compile($("#psh_summary_wf_index_view").html());
                this.trans_template = Handlebars.compile($("#trans_confirm_view").html());
                this.wip_template = Handlebars.compile($("#psh_summary_wf_wip_form_view").html());
                this.index_template = Handlebars.compile($("#pi_assessment_pi_select_view").html()); //指标选择
                this.bind_events();
                var self = this;
            },
            pre_render: function() {
                var self = this;
                $("#summary_wf_edit_form-content").html(self.loading_template({
                    info_msg: '数据加载中...请稍候'
                }));
                $("#summary_wf_edit_form-content").trigger('create');
                return this;
            },
            // Renders all of the Assessment models on the UI
            render: function(index, type) {
                var self = this;
                var data = _.map(self.collection.models, function(x) {
                        return x.toJSON()
                    })
                    //附件数据
                if (localStorage.getItem('upload_model_back')) { //有从上传页面发回来的数据
                    self.data = JSON.parse(localStorage.getItem('upload_model_back')).model;
                    localStorage.removeItem('upload_model_back'); //用完删掉
                };
                $("#summary_wf_edit_form #summary_name").html("绩效总结流程")

                var rendered_content = [];
                var items = data[0].quantitative_pis.items; //ration=2 定量
                var mark_as_summary_type1_num = 0,
                    mark_as_summary_type2_num = 0; //指标个数；
                var exist_pi_1 = [],
                    exist_pi_2 = [];
                if (index == 'index_select') {
                    _.each(items, function(x) {
                        x.people = self.collection.models[0].get('people');
                        x.ration = 2;
                        x.ai_status = self.ai_status;
                        rendered_content.push(x);
                        if (x.mark_as_summary_type1) {
                            mark_as_summary_type1_num += 1;
                            exist_pi_1.push(x)

                        }
                        if (x.mark_as_summary_type2) {
                            mark_as_summary_type2_num += 1;
                            exist_pi_2.push(x);

                        }

                    })
                } else {
                    _.each(items, function(x) {
                        if (x.mark_as_summary_type1 || x.mark_as_summary_type2) {
                            x.people = self.collection.models[0].get('people');
                            x.ration = 2;
                            x.ai_status = self.ai_status;
                            rendered_content.push(x);
                            if (x.mark_as_summary_type1) {
                                mark_as_summary_type1_num += 1;
                            }
                            if (x.mark_as_summary_type2) {
                                mark_as_summary_type2_num += 1;
                            }
                        };
                    })
                }


                var items = data[0].qualitative_pis.items; //ration=1 定性
                if (index == "index_select") {
                    _.each(items, function(x) {
                        x.people = self.collection.models[0].get('people');
                        x.ration = 1;
                        x.ai_status = self.ai_status;
                        rendered_content.push(x);
                        if (x.mark_as_summary_type1) {
                            exist_pi_1.push(x)

                            mark_as_summary_type1_num += 1;
                        }
                        if (x.mark_as_summary_type2) {
                            exist_pi_2.push(x)

                            mark_as_summary_type2_num += 1;
                        }
                    })
                } else {
                    _.each(items, function(x) {
                        if (x.mark_as_summary_type1 || x.mark_as_summary_type2) {
                            x.people = self.collection.models[0].get('people');
                            x.ration = 1;
                            x.ai_status = self.ai_status;
                            rendered_content.push(x);
                            if (x.mark_as_summary_type1) {
                                mark_as_summary_type1_num += 1;
                            }
                            if (x.mark_as_summary_type2) {
                                mark_as_summary_type2_num += 1;
                            }
                        }
                    })
                }

                if (self.is_self) {
                    var is_edit = true;
                } else {
                    var is_edit = false;

                };
                if (self.is_ind_superiors) {
                    var is_ind_superiors = true;
                } else {
                    var is_ind_superiors = false;

                };
                if (self.is_superiors) {
                    var is_superiors = true;
                } else {
                    var is_superiors = false;

                };
                ai_id = data[0]._id;
                var render_data = {
                    rendered_content: rendered_content,
                    data: data[0],
                    is_edit: is_edit,
                    is_ind_superiors: is_ind_superiors,
                    is_superiors: is_superiors,
                    type: self.type,
                    type1_len: mark_as_summary_type1_num,
                    type2_len: mark_as_summary_type2_num

                }
                render_data = _.extend(render_data, self.data);
                $("#summary_wf_edit_form #summary_href").attr("href", '/m#summary');
                if (index == 'index_select') {
                    $("#summary_wf_edit_form #summary_name").html("选择待总结的指标");
                    $("#summary_wf_edit_form #summary_href").data("module", "C");
                    $("#summary_wf_edit_form #add_pi").data("ai_id", data[0]._id);
                    $("#summary_wf_edit_form #add_pi").data("type", type);
                    $("#summary_wf_edit_form #add_pi").show();
                    $("#summary_wf_edit_form-content").html(self.index_template(render_data));
                    var $container = $("#summary_wf_edit_form-content");
                    if (type == '1') {
                        _.each(exist_pi_1, function(x) {
                            $container.find("#cb-" + x._id).attr('checked', true);
                        })
                    } else if (type == '2') {
                        _.each(exist_pi_2, function(x) {
                            $container.find("#cb-" + x._id).attr('checked', true);
                        })
                    }


                } else {
                    if (self.view_mode == 'trans') {
                        $("#summary_wf_edit_form #summary_name").html('数据处理人');

                        $("#summary_wf_edit_form-content").html(self.trans_template(self.trans_data));
                        // $("#summary_wf_edit_form-content").trigger('create');

                        if (self.trans_data.next_td.node_type == 'END') {
                            do_trans(self.trans_data);
                        }
                    } else {
                        $("#summary_wf_edit_form #add_pi").hide();

                        $("#summary_wf_edit_form-content").html(self.template(render_data));
                        // $("#summary_wf_edit_form-content").trigger('create');
                        // return this;
                    }

                    // $("#summary_wf_edit_form-content").html(self.template(render_data));
                }
                $("#summary_wf_edit_form-content").trigger('create');
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
            render_pi: function(module, pi_id, ration) {
                var self = this;
                $.mobile.loading("show");

                var data = _.map(self.collection.models, function(x) {
                    return x.toJSON()
                })
                if (ration == '1') {
                    var items = data[0].qualitative_pis.items; //ration=1 定xing
                    var find_pi = _.find(items, function(x) {
                        return x.pi == String(pi_id)
                    })
                    find_pi.ration = ration;

                } else if (ration == '2') {
                    var items = data[0].quantitative_pis.items; //ration=2 定量
                    var find_pi = _.find(items, function(x) {
                        return x.pi == String(pi_id)
                    })
                    find_pi.ration = ration;

                }
                //是否可以编辑
                if (self.is_self) {
                    var is_edit = true;
                } else {
                    var is_edit = false;

                }
                var render_data = {
                    data: data[0],
                    is_edit: is_edit,
                    is_ind_superiors: self.is_ind_superiors,
                    is_superiors: self.is_superiors,
                    type: self.type,

                    find_pi: find_pi
                };
                if (module == 'A') {
                    $("#summary_wf_edit_form #summary_href").data("module", "A");
                    $("#summary_wf_edit_form #summary_name").html("不足与改进");

                    render_data.module = 'A';

                } else if (module == 'B') {
                    $("#summary_wf_edit_form #summary_href").data("module", "B");
                    $("#summary_wf_edit_form #summary_name").html("绩效亮点分享")
                    render_data.module = 'B';

                }

                //页签切换时用
                $("#summary_wf_edit_form .btn-summary_wf_edit_form-change_state").data("module", module)
                $("#summary_wf_edit_form .btn-summary_wf_edit_form-change_state").data("pi_id", pi_id)
                $("#summary_wf_edit_form .btn-summary_wf_edit_form-change_state").data("ration", ration)

                $("#summary_wf_edit_form-content").html(self.pi_template(render_data));
                $("#summary_wf_edit_form-footer").show();

                $("#summary_wf_edit_form-content").trigger('create');
                $("#summary_wf_edit_form #mark_as_watch").parent().addClass('mark_as_watch');
                return this; //指标－绩效总结数据

            },
            render_wip: function(module, pi_id, ration) {
                var self = this;
                $.mobile.loading("show");

                var data = _.map(self.collection.models, function(x) {
                        return x.toJSON()
                    })
                    //是否可以编辑
                if (ration == '1') {
                    var items = data[0].qualitative_pis.items; //ration=1 定xing
                    var find_pi = _.find(items, function(x) {
                        return x.pi == String(pi_id)
                    })
                    find_pi.ration = ration;
                } else if (ration == '2') {
                    var items = data[0].quantitative_pis.items; //ration=2 定量
                    var find_pi = _.find(items, function(x) {
                        return x.pi == String(pi_id)
                    })
                    find_pi.ration = ration;

                }
                //是否可以编辑
                if (self.ai_status == '9' && self.is_self) {
                    var is_edit = true;
                } else {
                    var is_edit = false;

                }
                var render_data = {
                    data: data[0],
                    is_edit: is_edit,
                    is_ind_superiors: self.is_ind_superiors,
                    is_superiors: self.is_superiors,
                    type: self.type,
                    find_pi: find_pi
                };
                if (module == 'A') {
                    $("#summary_wf_edit_form #summary_href").data("module", "A");
                    $("#summary_wf_edit_form #summary_name").html("不足与改进")

                } else if (module == 'B') {
                    $("#summary_wf_edit_form #summary_href").data("module", "B");
                    $("#summary_wf_edit_form #summary_name").html("绩效亮点分享")

                }
                $("#summary_wf_edit_form-content").html(self.wip_template(render_data));
                $("#summary_wf_edit_form-footer").show();
                $("#summary_wf_edit_form-content").trigger('create');
                self.redraw_sparkline();
                return this; //绩效过程

            },

            bind_events: function() {
                var self = this;
                $("#summary_wf_edit_form").on('click', '.summary_pi', function(event) { //第三层－指标总结入口
                    event.preventDefault();
                    var module = $(this).data("module");
                    var ai_id = $(this).data("ai_id");
                    var pi_id = $(this).data("pi_id");
                    var ai_status = $(this).data("ai_status");
                    var ration = $(this).data("ration");
                    self.render_pi(module, pi_id, ration);
                    $.mobile.loading('hide');


                }).on('click', '#summary_href', function(event) { //返回定位
                    event.preventDefault();
                    if ($(this).data("module")) {
                        self.render();
                        $(this).data("module", "");
                        $("#summary_wf_edit_form #summary_edit_form-footer").hide();
                        $("#summary_wf_edit_form #add_pi").hide();
                    } else {
                        window.location.href = "/m#summary";
                    }
                }).on('click', '.btn-summary_wf_edit_form-change_state', function(event) { //定位不足与改进及亮点分享
                    event.preventDefault();
                    var view_filter = $(this).data("view_filter");
                    var module = $(this).data("module");
                    var pi_id = $(this).data("pi_id");
                    var ration = $(this).data("ration");
                    if (view_filter == 'A') {

                        self.render_pi(module, pi_id, ration);
                        $.mobile.loading('hide');

                    } else if (view_filter == 'B') {
                        self.render_wip(module, pi_id, ration);
                        $.mobile.loading('hide');

                    }
                }).on('click', '#btn_add_pi_ration_1', function(event) { //指标选择－不足与改进
                    event.preventDefault();
                    var index = "index_select";
                    self.render(index, '1')
                }).on('click', '#btn_add_pi_ration_2', function(event) { //指标选择
                    event.preventDefault();
                    var index = "index_select";
                    self.render(index, '2')
                }).on('click', '#add_pi', function(event) { //添加指标
                    event.preventDefault();
                    var ai_id = $(this).data("ai_id");
                    var type = $(this).data("type");
                    var items_1 = self.collection.models[0].attributes.qualitative_pis.items;

                    if (type == '1') {
                        _.each(items_1, function(i) {
                            i.mark_as_summary_type1 = false;
                        })
                    } else {
                        _.each(items_1, function(i) {
                            i.mark_as_summary_type2 = false;

                        })
                    }

                    var items_2 = self.collection.models[0].attributes.quantitative_pis.items;

                    if (type == '1') {
                        _.each(items_2, function(i) {
                            i.mark_as_summary_type1 = false;
                        })
                    } else {
                        _.each(items_2, function(i) {
                            i.mark_as_summary_type2 = false;

                        })
                    }
                    _.each($("#summary_wf_edit_form input[class='pi_select']:checked"), function(x) {
                        var ration = $(x).data("ration");
                        var pi_id = $(x).data("pi_id");

                        if (ration == '1') {
                            var items = self.collection.models[0].attributes.qualitative_pis.items;
                            var found = self.get_pi(items, pi_id);
                            if (type == '1') {
                                found.mark_as_summary_type1 = true;

                            } else {
                                found.mark_as_summary_type2 = true;

                            }
                        } else if (ration == '2') {
                            var items = self.collection.models[0].attributes.quantitative_pis.items;
                            var found = self.get_pi(items, pi_id);
                            if (type == '1') {
                                found.mark_as_summary_type1 = true;

                            } else {
                                found.mark_as_summary_type2 = true;

                            }
                        }
                    })
                    var data4save = _.clone(self.collection.models[0].attributes);
                    self.data_save(data4save, ai_id, null);

                }).on('click', '#btn_save', function(event) { //数据保存接口
                    event.preventDefault();

                    var data4save = _.clone(self.collection.models[0].attributes);
                    var type = "success";
                    self.data_save(data4save, data4save._id, type);
                }).on('change', "textarea", function(event) {
                    event.preventDefault();
                    var field = String($(this).data("field")).split('-')[0];
                    var field1 = String($(this).data("field")).split('-')[1];
                    var self_comment = $(this).val();
                    var ration = $(this).data("ration"); //定量 定性指标
                    var pi_id = $(this).data("pi_id"); //指标
                    if (ration == '1') {
                        var items = self.collection.models[0].attributes.qualitative_pis.items;
                        var found = self.get_pi(items, pi_id);
                    } else if (ration == '2') {
                        var items = self.collection.models[0].attributes.quantitative_pis.items;
                        var found = self.get_pi(items, pi_id);
                    }
                    if (field1 == "self_comment") { //自评数据
                        if (field == 'summary') {
                            self.collection.models[0].attributes.summary.self_comment = self_comment;
                        } else if (field == "gap_analysis") {
                            found.summary.gap_analysis.self_comment = self_comment;
                        } else if (field == "improvement_plan") {
                            found.summary.improvement_plan.self_comment = self_comment;

                        } else if (field == "performance_highlights") {
                            found.summary.performance_highlights.self_comment = self_comment;

                        }
                    } else { //上级评语

                        if (field == 'summary') {
                            self.collection.models[0].attributes.summary[field1]["comment"] = self_comment;
                            self.collection.models[0].attributes.summary[field1]["createDate"] = new Date();

                        } else if (field == "gap_analysis") {
                            found.summary.gap_analysis[field1]["comment"] = self_comment;
                            found.summary.gap_analysis[field1]["createDate"] = new Date();
                        } else if (field == "improvement_plan") {
                            found.summary.improvement_plan[field1]["comment"] = self_comment;
                            found.summary.improvement_plan[field1]["createDate"] = new Date();

                        } else if (field == "performance_highlights") {
                            found.summary.performance_highlights[field1]["comment"] = self_comment;
                            found.summary.performance_highlights[field1]["createDate"] = new Date();

                        }
                    }

                    var data4save = _.clone(self.collection.models[0].attributes);
                    self.data_save(data4save, ai_id, "no_render"); //自评值的保存

                }).on('click', 'img', function(event) {
                    event.preventDefault();
                    // var img_view = '<div class="img_view" style="background-image:url('+this.src+')"></div>';
                    var img_view = '<img src="' + this.src + '">';
                    // img_view += '<a href="'+this.src.replace('get','download')+'" target="_blank">保存到本地</a>';
                    $("#fullscreen-overlay").html(img_view).fadeIn('fast');
                }).on('click', '.do_trans', function(event) {
                    event.preventDefault();
                    var $this = $(this);
                    if ($("#summary_wf_edit_form-content #ti_comment").val() == '') {
                        alert('请填写审批意见！');
                        return;
                    }
                    $(this).attr('disabled', true)
                    $.mobile.loading("show");
                    var process_define_id = $("#summary_wf_edit_form-content #process_define_id").val();
                    var task_define_id = $("#summary_wf_edit_form-content #task_define_id").val();
                    var process_instance_id = $("#summary_wf_edit_form-content #process_instance_id").val();
                    var task_process_url = $("#summary_wf_edit_form-content #task_process_url").val();
                    var task_instance_id = $("#summary_wf_edit_form-content #task_instance_id").val();

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
                            ti_comment: $("#summary_wf_edit_form-content #ti_comment").val(),
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
                            ti_comment: $("#summary_wf_edit_form-content #ti_comment").val(),
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
                }).on('click', '#btn_upload_attachment', function(event) {

                    //转到上传图片的页面
                    localStorage.removeItem('upload_model_back'); //先清掉
                    var next_url = '#upload_pic';
                    localStorage.setItem('upload_model', JSON.stringify({
                        model: self.data,
                        field: 'attachments',
                        back_url: window.location.hash
                    }))
                    window.location.href = next_url;



                }).on('click', '#btn_wf_summary_start_userchat', function(event) {
                    event.preventDefault();
                    var people = $(this).data("people") || self.collection.models[0].attributes.ai.people._id;
                    var url = "im://userchat/" + self.data.ai.people._id;
                    window.location.href = url;
                }).on('click', "#btn_add_colltask", function(event) { //不足与改进中的创建任务
                    event.preventDefault();
                    var $this = $(this);
                    var confirm_msg = '确认为当前指标创建一个任务吗？';
                    if (confirm(confirm_msg)) { //优化一点效率
                        var pi_id = $this.data('pi_id');
                        var ration = $this.data('ration');
                        var found;
                        if (ration == '1') {
                            var items = self.collection.models[0].attributes.qualitative_pis.items;
                            found = self.get_pi(items, pi_id);
                        } else if (ration == '2') {
                            var items = self.collection.models[0].attributes.quantitative_pis.items;
                            found = self.get_pi(items, pi_id);
                        };
                        if (found) {

                            //新建一个coll task
                            var new_coll_task = {
                                task_name: '新建绩效总结任务-' + self.collection.models[0].attributes.ai_name,
                                task_descrpt: '指标:' + found.pi_name,
                                start: new Date(),
                                end: moment().add(10, 'day').toDate(),
                                th: $("#login_people").val(),
                                pi: { //关联的考核指标-跟绩效合同相关－只关联一个pi
                                    ai_id: ai_id || self.collection.models[0].attributes._id,
                                    pi_lx: (ration == "1") ? 'dx' : 'dl', // 类型： dl：定量  dx：定性
                                    pi_id: pi_id,
                                    period_name: self.collection.models[0].attributes.period_name,
                                    pi_name: found.pi_name,
                                    people_name: $("#login_people_name").val(),
                                },
                            };
                            var ct = new CollTask(new_coll_task);
                            ct.save().done(function() {
                                found.summary.coll_tasks.push(ct.toJSON());
                                var ai_id = ai_id || self.collection.models[0].attributes._id;
                                var data4save = _.clone(self.collection.models[0].attributes);
                                var type = "render_pi";
                                $.mobile.loading('show');

                                self.data_save(data4save, ai_id, type, 'A' + '/' + pi_id + '/' + ration);
                            })
                        };
                    }
                }).on('click', "#mark_as_watch", function(event) { //用change会触发多次事件
                    event.preventDefault();
                    var $this = $(this);
                    var pi_id = $this.data('pi_id');
                    var ration = $this.data('ration');
                    var found;
                    if (ration == '1') {
                        var items = self.collection.models[0].attributes.qualitative_pis.items;
                        found = self.get_pi(items, pi_id);
                    } else if (ration == '2') {
                        var items = self.collection.models[0].attributes.quantitative_pis.items;
                        found = self.get_pi(items, pi_id);
                    };
                    if (found) {
                        var if_mark_as_watch = $("#summary_wf_edit_form input[id='mark_as_watch']:checked");
                        if (if_mark_as_watch.length > 0) {
                            found.summary.mark_as_watch = true;

                        } else {
                            found.summary.mark_as_watch = false;
                        }
                        var ai_id = ai_id || self.collection.models[0].attributes._id;
                        var data4save = _.clone(self.collection.models[0].attributes);
                        var type = "render_pi";
                        $.mobile.loading('show');
                        self.data_save(data4save, ai_id, type, 'A' + '/' + pi_id + '/' + ration);

                    }
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
            redraw_sparkline: function() {
                _.each($(".sparkline-revise-history"), function(x) {
                    var $x = $(x);
                    var composite_values = $x.data("composite_values") + '';
                    var values = $x.attr("values") + '';
                    var bar_range_max;
                    if (composite_values) {
                        var max1 = parseFloat(_.max(values.split(','), function(x) {
                            return parseFloat(x);
                        }));
                        var max2 = parseFloat(_.max(composite_values.split(','), function(x) {
                            return parseFloat(x);
                        }));
                        // console.log(max1, max2);
                        if (max1 >= max2) {
                            bar_range_max = max1;
                        } else {
                            bar_range_max = max2;
                        };
                    };
                    // console.log('max:', bar_range_max);
                    $x.sparkline('html', {
                        type: 'bar',
                        width: '100%',
                        height: 30,
                        enableTagOptions: true,
                        barWidth: '10',
                        chartRangeMin: 0,
                        chartRangeMax: bar_range_max,
                        // zeroAxis: false,

                        tooltipFormatter: function(sp, ops, fields) {
                            var revise_date = $(sp.el).data('revise_date').split(',');
                            var value_obj = fields[0];
                            var tp = ['<div class="jqs jqstitle" style="text-shadow:none">更新日期：' + revise_date[value_obj.offset] + '</div>'];
                            // tp.push('<div class="jqsfield">更新内容：' + $.sprintf('%0.2f', Math.round(value_obj.value * 1000) / 1000) + '</div>');
                            tp.push('<div class="jqsfield" style="text-shadow:none">更新内容：' + value_obj.value + '</div>');
                            return tp.join('');
                        }
                    })
                    if (composite_values) { //发现需要覆盖的数据，画出图形
                        $x.sparkline(composite_values.split(','), {
                            composite: true,
                            // type: 'bar',
                            fillColor: false,
                            lineColor: 'red',
                            lineWidth: 3,
                            barColor: '#ff0000',
                            chartRangeMin: 0,
                            chartRangeMax: bar_range_max,
                            tooltipFormatter: function(sp, ops, fields) {
                                // console.log(fields);
                                var value_obj = fields;
                                var tp = [];
                                tp.push('<div class="jqsfield" style="text-shadow:none">目标值：' + value_obj.y + '</div>');
                                return tp.join('');
                            }
                        });

                    };
                })
            },
            get_pi: function(items, pi_id) { // 得到指标对象
                var found = _.find(items, function(x) {
                    return x.pi == String(pi_id)
                })
                return found
            },
            data_save: function(data4save, ai_id, type, render_type) {
                var self = this;
                //回复populate出来的字段
                _.each(data4save.quantitative_pis.items, function(x) {
                    if (x.scoringformula) {
                        x.scoringformula = x.scoringformula._id; //回复populate出来的字段
                    };
                    x.coll_tasks = _.map(_.clone(_.compact(x.coll_tasks)), function(y) {
                        return y._id;
                    });
                    x.coll_projects = _.map(_.clone(_.compact(x.coll_projects)), function(y) {
                        return y._id;
                    });
                    x.summary.coll_tasks = _.map(_.clone(_.compact(x.summary.coll_tasks)), function(y) {
                        return y._id;
                    });
                    _.each(x.wip_summary, function(y) {
                        y.coll_tasks = _.map(_.clone(_.compact(y.coll_tasks)), function(x) {
                            return z._id;
                        })
                    })
                    _.each(x.segments, function(y) {
                            _.each(y.segment_summary, function(z) {
                                z.coll_tasks = _.map(_.clone(_.compact(z.coll_tasks)), function(a) {
                                    return a._id;
                                });
                            })
                            y.coll_projects = _.map(_.clone(_.compact(y.coll_projects)), function(z) {
                                return z._id;
                            });
                        })
                        //更新创建人相关的信息
                        //绩效偏差及需要提升的能力分析 改进措施 亮点分享
                    if (people_ind_superiors) { //间接上级

                        x.summary.gap_analysis.upper_comment.people_name = x.summary.improvement_plan.upper_comment.people_name = x.summary.performance_highlights.upper_comment.people_name = people_ind_superiors.people_name;
                        x.summary.gap_analysis.upper_comment.position_name = x.summary.improvement_plan.upper_comment.position_name = x.summary.performance_highlights.upper_comment.position_name = people_ind_superiors.position_name;
                        x.summary.gap_analysis.upper_comment.ou_name = x.summary.improvement_plan.upper_comment.ou_name = x.summary.performance_highlights.upper_comment.ou_name = people_ind_superiors.ou_name;
                        x.summary.gap_analysis.upper_comment.avatar = x.summary.improvement_plan.upper_comment.avatar = x.summary.performance_highlights.upper_comment.avatar = people_ind_superiors.avatar;
                    };
                    if (people_superiors) { //直接上级
                        x.summary.gap_analysis.upper2_comment.people_name = x.summary.improvement_plan.upper2_comment.people_name = x.summary.performance_highlights.upper2_comment.people_name = people_superiors.people_name;
                        x.summary.gap_analysis.upper2_comment.position_name = x.summary.improvement_plan.upper2_comment.position_name = x.summary.performance_highlights.upper2_comment.position_name = people_superiors.position_name;
                        x.summary.gap_analysis.upper2_comment.ou_name = x.summary.improvement_plan.upper2_comment.ou_name = x.summary.performance_highlights.upper2_comment.ou_name = people_superiors.ou_name;
                        x.summary.gap_analysis.upper2_comment.avatar = x.summary.improvement_plan.upper2_comment.avatar = x.summary.performance_highlights.upper2_comment.avatar = people_superiors.avatar;
                    };

                })
                _.each(data4save.qualitative_pis.items, function(x) {
                        if (x.grade_group) {
                            x.grade_group = x.grade_group._id; //回复populate出来的字段
                        };
                        x.coll_tasks = _.map(_.clone(_.compact(x.coll_tasks)), function(y) {
                            return y._id;
                        });
                        x.coll_projects = _.map(_.clone(_.compact(x.coll_projects)), function(y) {
                            return y._id;
                        });
                        x.summary.coll_tasks = _.map(_.clone(_.compact(x.summary.coll_tasks)), function(y) {
                            return y._id;
                        });
                        _.each(x.wip_summary, function(y) {
                            y.coll_tasks = _.map(_.clone(_.compact(y.coll_tasks)), function(x) {
                                return z._id;
                            })
                        })
                        _.each(x.segments, function(y) {
                                _.each(y.segment_summary, function(z) {
                                    z.coll_tasks = _.map(_.clone(_.compact(z.coll_tasks)), function(a) {
                                        return a._id;
                                    });
                                })
                                y.coll_projects = _.map(_.clone(_.compact(y.coll_projects)), function(z) {
                                    return z._id;
                                });
                            })
                            //更新创建人相关的信息
                            //绩效偏差及需要提升的能力分析 改进措施 亮点分享
                        if (people_ind_superiors) { //间接上级
                            x.summary.gap_analysis.upper_comment.people_name = x.summary.improvement_plan.upper_comment.people_name = x.summary.performance_highlights.upper_comment.people_name = people_ind_superiors.people_name;
                            x.summary.gap_analysis.upper_comment.position_name = x.summary.improvement_plan.upper_comment.position_name = x.summary.performance_highlights.upper_comment.position_name = people_ind_superiors.position_name;
                            x.summary.gap_analysis.upper_comment.ou_name = x.summary.improvement_plan.upper_comment.ou_name = x.summary.performance_highlights.upper_comment.ou_name = people_ind_superiors.ou_name;
                            x.summary.gap_analysis.upper_comment.avatar = x.summary.improvement_plan.upper_comment.avatar = x.summary.performance_highlights.upper_comment.avatar = people_ind_superiors.avatar;
                        };
                        if (people_superiors) { //直接上级
                            x.summary.gap_analysis.upper2_comment.people_name = x.summary.improvement_plan.upper2_comment.people_name = x.summary.performance_highlights.upper2_comment.people_name = people_superiors.people_name;
                            x.summary.gap_analysis.upper2_comment.position_name = x.summary.improvement_plan.upper2_comment.position_name = x.summary.performance_highlights.upper2_comment.position_name = people_superiors.position_name;
                            x.summary.gap_analysis.upper2_comment.ou_name = x.summary.improvement_plan.upper2_comment.ou_name = x.summary.performance_highlights.upper2_comment.ou_name = people_superiors.ou_name;
                            x.summary.gap_analysis.upper2_comment.avatar = x.summary.improvement_plan.upper2_comment.avatar = x.summary.performance_highlights.upper2_comment.avatar = people_superiors.avatar;
                        };
                    })
                    //整体总结部分
                if (people_ind_superiors) { //间接上级
                    data4save.summary.upper_comment.people_name = people_ind_superiors.people_name;
                    data4save.summary.upper_comment.position_name = people_ind_superiors.position_name;
                    data4save.summary.upper_comment.ou_name = people_ind_superiors.ou_name;
                    data4save.summary.upper_comment.avatar = people_ind_superiors.avatar;
                };
                if (people_superiors) { //直接上级
                    data4save.summary.upper2_comment.people_name = people_superiors.people_name;
                    data4save.summary.upper2_comment.position_name = people_superiors.position_name;
                    data4save.summary.upper2_comment.ou_name = people_superiors.ou_name;
                    data4save.summary.upper2_comment.avatar = people_superiors.avatar;
                };
                self.collection.models[0].save(data4save, {
                    success: function(model, response, options) {
                        self.collection.url = '/admin/pm/assessment_instance/summary/bb/' + ai_id;
                        self.collection.fetch().done(function() {
                            if (type == "render_pi") {
                                var module = String(render_type).split('/')[0];
                                var pi_id = String(render_type).split('/')[1];
                                var ration = String(render_type).split('/')[2];
                                self.render_pi(module, pi_id, ration);
                                $.mobile.loading('hide');

                            } else if (type != "no_render") {
                                self.render();
                            } else if (type == "render") {
                                self.render();
                            }
                            if (type == "success") {
                                alert("数据保存成功!");
                            }
                        })

                    },
                    error: function(model, xhr, options) {}
                });
            }
        });

        // Returns the View class
        return AssessmentSummaryWfEditView;

    });