// Assessment  Appeal Edit View 绩效面谈查看界面
// =============================================================

// Includes file dependencies
define(["jquery", "underscore", "async", "backbone", "handlebars", "moment", "../../models/AssessmentModel", "../../models/CollTaskModel"],
    function($, _, async, Backbone, Handlebars, moment, AssessmentModel, CollTask) {
        var people_ind_superiors, people_superiors, ai_id = null,
            pds = null,
            wfs = [];
        // Extends Backbone.View
        var AssessmentAppealEditView = Backbone.View.extend({
            // The View Constructor
            initialize: function() {
                this.template = Handlebars.compile($("#psh_appeal_edit_form_view").html());
                this.loading_template = Handlebars.compile($("#loading_template_view").html());
                this.index_template = Handlebars.compile($("#psh_appeal_item_select_view").html()); //指标选择
                this.reason_template = Handlebars.compile($("#psh_appeal_reason_view").html()); //申诉理由
                this.bind_events();
                var self = this;
            },
            pre_render: function() {
                var self = this;
                $("#appeal_edit_form-content").html(self.loading_template({
                    info_msg: '数据加载中...请稍候'
                }));
                $("#appeal_edit_form-content").trigger('create');
                return this;
            },
            // Renders all of the Assessment models on the UI
            render: function(index, type) {
                var self = this;
                var data = _.map(self.collection.models, function(x) {
                    return x.toJSON()
                })
                var people = self.collection.models[0].get('people');
                if (self.view_status == "B") {
                    var is_edit = false;
                    $("#appeal_edit_form #appeal_name").html("绩效申诉查看")

                } else if (self.view_status == "A") {
                    var is_edit = true;
                    $("#appeal_edit_form #appeal_name").html("绩效申诉编辑")

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
                            return y._id;
                        })
                    })
                    _.each(self.collection.models[0].attributes.quantitative_pis.items, function(x) {
                        x.appeal.attachments = _.map(x.appeal.attachments, function(y) {
                            return y._id;
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
                                self.render_pi(module, 'A', item_id, item_type);
                            })

                        }
                    });

                } else {
                    var render_data = {
                        rendered_content: rendered_content,
                        others_content: others_content,
                        data: data[0],
                        is_edit: is_edit,
                        type1_len: mark_as_appeal_dl_num,
                        type2_len: mark_as_appeal_dx_num,
                        type3_len: mark_as_appeal_other1_num,
                        type4_len: mark_as_appeal_other2_num,
                        type5_len: mark_as_appeal_other3_num
                    }
                    $("#appeal_href").attr("href", '/m#appeal');
                    if (index == 'index_select') {
                        $("#appeal_edit_form #appeal_name").html("选择绩效申诉项目");
                        $("#appeal_edit_form #appeal_href").data("module", "detail");
                        $("#appeal_edit_form #add_pi").data("ai_id", data[0]._id);
                        $("#appeal_edit_form #add_pi").show();
                        $("#appeal_edit_form-content").html(self.index_template(render_data));
                        var $container = $("#appeal_edit_form-content");

                        _.each(exist_item, function(x) {
                            $container.find("#cb-" + x._id).attr('checked', true);
                        })


                    } else {
                        $("#appeal_edit_form #add_pi").hide();

                        $("#appeal_edit_form-content").html(self.template(render_data));
                    }
                    $("#appeal_edit_form-content").trigger('create');
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
                if (self.view_status == 'A') {
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
                $("#appeal_edit_form #appeal_href").data("module", module);
                $("#appeal_edit_form #appeal_name").html("申诉理由及证据");
                $("#appeal_edit_form-content").html(self.reason_template(render_data));
                $("#appeal_edit_form-content").trigger('create');
                $.mobile.loading('hide');

                return this; //指标－绩效总结数据

            },
            bind_events: function() {
                var self = this;
                $("#appeal_edit_form").on('click', '.appeal_pi', function(event) { //第三层－绩效指标选择
                    event.preventDefault();
                    var module = $(this).data("module");
                    var ai_id = $(this).data("ai_id");
                    var pi_id = $(this).data("pi_id");
                    var view_status = $(this).data("view_status");
                    var ration = $(this).data("ration");
                    $.mobile.loading("show");
                    self.render_pi(module, view_status, pi_id, ration);
                    $.mobile.loading('hide');


                }).on('click', '.item_type', function(event) { //第三层－加减分项选择
                    event.preventDefault();
                    var module = $(this).data("module");
                    var ai_id = $(this).data("ai_id");
                    var item = $(this).data("item");
                    var item_type = $(this).data("item_type");
                    var view_status = $(this).data("view_status");
                    $.mobile.loading("show");
                    self.render_pi(module, view_status, item, item_type);
                    $.mobile.loading('hide');


                }).on('click', '#appeal_href', function(event) { //返回定位
                    event.preventDefault();
                    if ($(this).data("module")) {
                        self.render();
                        $(this).data("module", "");
                    } else {
                        window.location.href = "/m#appeal";
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
                    _.each($("#appeal_edit_form input[class='appeal_item_select']:checked"), function(x) {
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
                    var ai_id = $(this).data("ai_id");
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

                }).on('click', "#btn_submit", function(event) {
                    event.preventDefault();
                    var ai_id = self.collection.models[0].attributes._id;
                    var ai_name = self.collection.models[0].attributes.ai_name;
                    var post_data = {
                        ai_id: ai_id,
                        ai_name: ai_name,
                        type: 'appeal'
                    }
                    var url = '/admin/pm/assessment_instance/appeal/wf_create';
                    // if (confirm("确认提交审批吗？")) {
                    my_confirm("确认发起流程吗?", null, function() {
                        $.mobile.loading("show");

                        $.post(url, post_data, function(data, textStatus, xhr) {
                            if (data.code == 'OK') {
                                $("#btn_submit").attr('disabled', "disabled");
                                var task_id = data.data.ti._id + '-' + data.data.pd._id + '-' + data.data.pd.process_code;
                                window.location = '/m#godo14/' + task_id + '/edit';
                                $.mobile.loading("hide");

                            } else if (data.code == 'ERR') {
                                $("#btn_submit").removeAttr('disabled');
                                console.log(data.err); //把错误信息输出到控制台，以便查找错误。
                            }
                        })
                    })

                }).on('click', "#btn_wf_view", function(event) {
                    event.preventDefault();
                    var ai_id = ai_id || self.collection.models[0].attributes._id;
                    self.get_wfs(ai_id);
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
                    // x.appeal.attachments =[];
                    x.appeal.attachments = _.map(x.appeal.attachments, function(y) {
                        if (y) {
                            return y._id;

                        }
                    })
                })
                _.each(data4save.qualitative_pis.items, function(x) {
                    x.appeal.attachments = _.map(x.appeal.attachments, function(y) {
                        if (y) {
                            return y._id;

                        }
                    })
                })
                _.each(data4save.others, function(x) {
                    _.each(x.items, function(y) {
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
                            }
                        })

                    },
                    error: function(model, xhr, options) {}
                });
            },
            get_wfs: function(ai_id) {
                $.get('/admin/wf/process_instance/get_pis_by_cid?cid=' + ai_id + '&codes=AssessmentInstance_appeal', function(data) {
                    if (data.code == 'OK') {
                        var wfs = data.data;
                        window.location.href = "/m#godo14/" + wfs[0]._id + '/view';
                    };
                });
            }
        });

        // Returns the View class
        return AssessmentAppealEditView;

    });