// ToDo View
// =============

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "async", "moment"], function($, _, Backbone, Handlebars, async, moment) {


    Handlebars.registerHelper('is_bluk_pay', function(obj, data, options) {

        var f_d = _.find(obj.last_items, function(it) {
            var p_id = it.pic._id ? it.pic._id : it.pic;
            return p_id == String(data)
        })
        if (f_d) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        };
    });


    var do_trans = function(trans_data) {
        var post_data = {
            process_instance_id: $("#process_instance_id").val(),
            task_instance_id: $("#task_instance_id").val(),
            process_define_id: $("#process_define_id").val(),
            next_tdid: $("#next_tdid").val() || trans_data.next_tdid,
            next_user: $("#next_user_id").val() || trans_data.next_user, //'516cf9a1d26ad4fe48000001', //以后从列表中选出
            trans_name: $("#trans_name").val() || trans_data.trans_name, // 转移过来的名称
            comment_msg: $("#comment_msg").val() || trans_data.comment_msg, // 任务批注 
            attachments: trans_data.attachments || []
                // 任务批注 
        };
        // console.log(post_data)
        var post_url = $("#task_process_url").val();
        post_url = post_url.replace('<TASK_ID>', $("#task_instance_id").val());
        $.post(post_url, post_data, function(data) {
            if (data.code == 'OK') {

                window.location = '#todo';
            };
        })
    }

    function forcechange(x) {
        var f_x = parseFloat(x);
        if (isNaN(f_x)) {
            return false;
        }
        var f_x = Math.round(x * 100) / 100;
        return f_x;
    }



    function get_pri_data(self, pri_id) {
        var adjustment_bulk = self.model.get('adjustment_bulk');
        var peopels = _.map(adjustment_bulk.peoples, function(pp) {
            return pp._id
        })
        var low_val = adjustment_bulk.low_val;
        var hight_val = adjustment_bulk.hight_val;
        $.get("/admin/py/payroll_adjustbulk/get_data_by_pri/" + peopels + '/' + pri_id, function(data) {
            if (data.code = 'OK') {
                self.people_data = data.data;
                var ratio_value = adjustment_bulk.pri_value ? adjustment_bulk.pri_value.ratio_value : 0;
                var nums = []
                    // _.each(data.data, function(pd) {
                    //     if (pd) {
                    //         nums.push(parseInt(pd.pri.amount))
                    //     };
                    //     // })
                    // var sum = _.reduce(nums, function(memo, num) {
                    //     return memo + num;
                    // }, 0);

                // if (ratio_value) {
                //     adjustment_bulk.total_val = sum * ratio_value * 0.01
                // } else {
                //     adjustment_bulk.total_val = sum
                // }
                // console.log(adjustment_bulk)
                // if (hight_val) {
                //     if (parseFloat(hight_val) < val) {
                //         val = hight_val;
                //     };
                // }


                _.each(self.people_data, function(pd) {
                    var val = 0;
                    if (ratio_value) {
                        val = forcechange(pd.pri.amount * ratio_value * 0.01);
                    } else {
                        val = parseFloat(pd.pri.amount)
                    }
                    if (low_val || low_val == 0) {
                        if (parseFloat(low_val) > val) {
                            val = parseFloat(low_val);
                        };
                    };
                    if (hight_val || hight_val == 0) {
                        if (parseFloat(hight_val) < val) {
                            val = parseFloat(hight_val);
                        };
                    }

                    adjustment_bulk.items.push({
                        people: pd.people._id,
                        people_name: pd.people.firstname + pd.people.lastname,
                        val: val
                    })

                    nums.push(val);


                })

                var sum = _.reduce(nums, function(memo, num) {
                    return memo + num;
                }, 0);
                adjustment_bulk.total_val = sum

                self.render();
            };
        })
    }


    function assembly_data(self) {
        var adjustment_bulk = self.model.get('adjustment_bulk');
        var low_val = adjustment_bulk.low_val;
        var hight_val = adjustment_bulk.hight_val;
        var ratio_value = adjustment_bulk.pri_value ? adjustment_bulk.pri_value.ratio_value : 0;
        var nums = [];
        _.each(self.people_data, function(pd) {
            var val = 0;
            if (ratio_value) {
                val = forcechange(pd.pri.amount * ratio_value * 0.01);
            } else {
                val = parseFloat(pd.pri.amount)
            }
            if (low_val || low_val == 0) {
                if (parseFloat(low_val) > val) {
                    val = parseFloat(low_val);
                };
            };
            if (hight_val || hight_val == 0) {
                if (parseFloat(hight_val) < val) {
                    val = parseFloat(hight_val);
                };
            }
            adjustment_bulk.items.push({
                people: pd.people._id,
                people_name: pd.people.firstname + pd.people.lastname,
                val: val
            })
            nums.push(val);
        })

        var sum = _.reduce(nums, function(memo, num) {
            return memo + num;
        }, 0);
        adjustment_bulk.total_val = sum

        self.render();
    }
    var AdjustmentbulkView = Backbone.View.extend({
        // The View Constructor
        initialize: function() {
            this.adjustment_bulk_edit_template = Handlebars.compile($("#adjustment_bulk_edit_view").html());

            this.template = Handlebars.compile($("#trans_confirm_view").html()); //跳转页面
            this.adjustment_pri_items_detail_template = Handlebars.compile($("#adjustment_pri_items_detail_view").html()); //工资项
            this.adjustment_pp_total_detail_template = Handlebars.compile($("#adjustment_pp_total_detail_view").html());
            this.adjustment_bulk_pris_detail_template = Handlebars.compile($("#adjustment_bulk_pris_detail_view").html());



            this.loading_template = Handlebars.compile($("#loading_template_view").html());



            this.bind_event();
            this.model_view = '0';
        },
        // Renders all of the Task models on the UI
        pre_render: function() {
            var self = this;
            $("#adjustment_list-content").html(self.loading_template({
                info_msg: '数据加载中...请稍候'
            }));
            $("#adjustment_list-content").trigger('create');
            return this;
        },
        // Renders all of the Task models on the UI
        render: function() {
            // $("#leaveofabsence_name").html('假期查看')
            var self = this;
            var adjustment_bulk = self.model.get('adjustment_bulk');
            var attachments = self.model.get('attachments');
            // if (!!localStorage.getItem('to_do_back_url')) {
            //     self.to_do_back_url = localStorage.getItem('to_do_back_url');
            //     localStorage.removeItem('to_do_back_url');
            // }
            //附件数据

            if (localStorage.getItem('upload_model_back')) { //有从上传页面发回来的数据
                adjustment_bulk = JSON.parse(localStorage.getItem('upload_model_back')).model;
                if (_.isUndefined(adjustment_bulk.attis)) {
                    adjustment_bulk.attis = [];
                    adjustment_bulk.attis.push(adjustment_bulk.attachments)
                } else {
                    adjustment_bulk.attis.push(adjustment_bulk.attachments)
                }
                attachments = _.map(attachments, function(att) {
                    if (att._id) {
                        return att._id
                    } else {
                        return att
                    }
                })
                self.model.set('adjustment_bulk', adjustment_bulk);
                _.each(adjustment_bulk.attis, function(ti) {
                    self.model.get('attachments').push(ti)
                })

                self.model.set('attachments', _.flatten([attachments, adjustment_bulk.attis], true))
                localStorage.removeItem('upload_model_back'); //用完删掉
            };
            var rendered_data = '';


            if (self.model_view == '0') {


                var obj = self.model.attributes;
                obj.reason_types = [{
                    name: '转正',
                    value: 'A'
                }, {
                    name: '岗位变动',
                    value: 'B'
                }, {
                    name: '计划内调薪',
                    value: 'C'
                }, {
                    name: '计划外调薪',
                    value: 'D'
                }, {
                    name: '合同续签',
                    value: 'E'
                }, {
                    name: '其它',
                    value: 'F'
                }]


                rendered_data = self.adjustment_bulk_edit_template(obj);

                if (!self.people_data && adjustment_bulk.pri_value && adjustment_bulk.pri_value.pri) {
                    get_pri_data(self, adjustment_bulk.pri_value.pri)
                };
            } else if (self.model_view == '1') {
                rendered_data = self.template(self.trans_data);
                if (self.trans_data.next_td.node_type == 'END') {
                    do_trans(self.trans_data);
                }
            };



            $("#adjustment_bulk_edit-content").html(rendered_data);
            $("#adjustment_bulk_edit-content").trigger('create');


            var obj = self.model.attributes;
            var readable_fields = obj.ti.task_define.readable_fields;
            $(readable_fields).attr('disabled', true)

            $(readable_fields).removeAttr('id'); //去掉a标签中的onclick事件



            return self;
        },
        bind_event: function() {
            var self = this
            var bool = true;
            var option_rendered_data = '';
            $("#adjustment_bulk_edit").on('click', '#add_pri', function(event) {
                event.preventDefault();
                option_rendered_data = self.adjustment_pri_items_detail_template(self.model.get('pri_items'));
                $("#panel-pri_items_detail").html(option_rendered_data);
                $("#panel-pri_items_detail").trigger('create');
                $("#panel-pri_items_detail").panel('open').trigger("updatelayout");
            }).on('click', '#adjustment_bulk_add_pay', function(event) {
                event.preventDefault();

                var obj = self.model.get('pri_items');
                obj.adjustment_bulk = self.model.get('adjustment_bulk');

                option_rendered_data = self.adjustment_bulk_pris_detail_template(obj);
                $("#panel-add_pris_detail").html(option_rendered_data);
                $("#panel-add_pris_detail").trigger('create');
                $("#panel-add_pris_detail").panel('open').trigger("updatelayout");
            }).on('change', '#ratio_value', function(event) { //幅度 
                event.preventDefault();
                var ratio_value = parseFloat($(this).val());
                self.model.get('adjustment_bulk').pri_value.ratio_value = ratio_value;
                assembly_data(self)

            }).on('change', '#low_val', function(event) { //  最小
                event.preventDefault();
                var low_val = $(this).val();
                var adjustment_bulk = self.model.get('adjustment_bulk');
                adjustment_bulk.low_val = parseFloat(low_val);
                if (adjustment_bulk.low_val > adjustment_bulk.hight_val && adjustment_bulk.hight_val) {
                    adjustment_bulk.low_val = adjustment_bulk.hight_val
                    alert('最小值不能大于最大值！')
                };
                assembly_data(self)
            }).on('change', '#hight_val', function(event) { // 最大 
                event.preventDefault();
                var hight_val = $(this).val();
                var adjustment_bulk = self.model.get('adjustment_bulk');
                adjustment_bulk.hight_val = parseFloat(hight_val);
                if (adjustment_bulk.low_val > adjustment_bulk.hight_val && adjustment_bulk.low_val) {
                    adjustment_bulk.hight_val = adjustment_bulk.low_val
                    alert('最大值不能小于最小值！')
                };
                assembly_data(self)

            }).on('change', '#fixed_value', function(event) { // 固定
                event.preventDefault();
                var value_num = $(this).val();
                var peopels = self.model.get('adjustment_bulk').peoples;
                self.model.get('adjustment_bulk').fixed_value = value_num;
                self.model.get('adjustment_bulk').total_val = value_num * peopels.length;
                self.render();
            }).on('change', 'input[name="checked_val"]', function(event) {
                event.preventDefault();
                self.model.get('adjustment_bulk').checked_val = $(this).val();
                self.model.get('adjustment_bulk').total_val = 0;

                if ($(this).val() == 'P') {
                    self.model.get('adjustment_bulk').pri_value = {};
                    self.model.get('adjustment_bulk').items = [];
                } else {
                    self.model.get('adjustment_bulk').fixed_value = 0;
                }
                self.render();
            }).on('change', '#effective_date', function(event) {
                event.preventDefault();
                self.model.get('adjustment_bulk').effective_date = moment($(this).val()).format('YYYY-MM')
            }).on('click', '#total_pp_show', function(event) {
                event.preventDefault();
                var adjustment_bulk = self.model.get('adjustment_bulk');

                var pp_items = []
                var ratio_value = adjustment_bulk.pri_value ? adjustment_bulk.pri_value.ratio_value : 0;
                var low_val = adjustment_bulk.low_val;
                var hight_val = adjustment_bulk.hight_val;
                _.each(self.people_data, function(pd) {
                    var val = 0;
                    if (ratio_value) {
                        val = forcechange(pd.pri.amount * ratio_value * 0.01)
                    } else {
                        val = parseFloat(pd.pri.amount)
                    }
                    if (low_val || low_val == 0) {
                        if (parseFloat(low_val) > val) {
                            val = low_val;
                        };
                    };
                    if (hight_val || hight_val == 0) {
                        if (parseFloat(hight_val) < val) {
                            val = hight_val;
                        };
                    }
                    pp_items.push({
                        people_name: pd.people.firstname + pd.people.lastname,
                        val: val
                    })
                })

                option_rendered_data = self.adjustment_pp_total_detail_template({
                    peoples: pp_items
                });
                $("#panel-pps_items_detail").html(option_rendered_data);
                $("#panel-pps_items_detail").trigger('create');
                $("#panel-pps_items_detail").panel('open').trigger("updatelayout");

            }).on('click', '.do_trans', function(event) {
                event.preventDefault();
                var $this = $(this);
                var attachments = self.model.get('attachments');
                var adjustment_bulk = self.model.get('adjustment_bulk');
                var pp_items = []
                var low_val = adjustment_bulk.low_val;
                var hight_val = adjustment_bulk.hight_val;
                var ratio_value = adjustment_bulk.pri_value ? adjustment_bulk.pri_value.ratio_value : 0;
                _.each(self.people_data, function(pd) {
                    var val = 0;
                    if (ratio_value) {
                        val = forcechange(pd.pri.amount * ratio_value * 0.01);
                    } else {
                        val = parseFloat(pd.pri.amount)
                    }
                    if (low_val || low_val == 0) {
                        if (parseFloat(low_val) > val) {
                            val = low_val;
                        };
                    };
                    if (hight_val || hight_val == 0) {
                        if (parseFloat(hight_val) < val) {
                            val = hight_val;
                        };
                    }
                    pp_items.push({
                        people: pd.people._id,
                        value: val //每个人要加多少
                    })
                })
                adjustment_bulk.items = pp_items



                if (adjustment_bulk.checked_val == 'P') {
                    if (adjustment_bulk.pri_value && !adjustment_bulk.pri_value.pri) {
                        alert('请选择加薪基数');
                        return false
                    };
                } else {
                    if (adjustment_bulk.fixed_value == '') {
                        alert('固定值不能为空！');
                        return false
                    };

                }

                if (adjustment_bulk.last_items.length) {
                    var num = 0;
                    _.each(adjustment_bulk.last_items, function(item) {
                        num += parseInt(item.ratio_value);
                    })

                    if (num != 100) {
                        alert('薪酬分配比例之和必须等于100');
                        return false
                    };
                } else {
                    alert('请添加调薪项！');
                    return false
                }

                if ($("#adjustment_bulk_edit-content #ti_comment").val() == '') {
                    alert('请填写审批意见！');
                    return;
                };

                $(this).attr('disabled', true)
                $.mobile.loading("show");
                var process_define_id = $("#adjustment_bulk_edit-content #process_define_id").val();
                var task_define_id = $("#adjustment_bulk_edit-content #task_define_id").val();
                var process_instance_id = $("#adjustment_bulk_edit-content #process_instance_id").val();
                var task_process_url = $("#adjustment_bulk_edit-content #task_process_url").val();
                var task_instance_id = $("#adjustment_bulk_edit-content #task_instance_id").val();
                var adjustment_bulk_position = $("#adjustment_bulk_edit-content #adjustment_bulk_position").val();


                var direction = $this.data('direction');
                var target_id = $this.data('target_id');
                var task_name = $this.data('task_name');
                var name = $this.data('name');
                var roles_type = $this.data('roles_type');
                var position_form_field = $this.data('position_form_field');


                self.model.id = $("#adjustment_bulk_edit-content #adjustment_bulk_id").val();
                self.model.save().done(function(data1) {
                    $.post('/admin/wf/trans_confirm_form_4m', {
                        process_define_id: process_define_id,
                        task_define_id: task_define_id,
                        process_instance_id: process_instance_id,
                        task_process_url: task_process_url,
                        position_id: adjustment_bulk_position,
                        next_tdname: task_name,
                        trans_name: name,
                        ti_comment: $("#adjustment_bulk_edit-content #ti_comment").val(),
                        task_instance_id: task_instance_id,
                        next_tdid: target_id,
                        direction: direction,
                        attachments: attachments,
                    }, function(data) {
                        self.model_view = '1';
                        self.trans_data = data;
                        $.mobile.loading("hide");
                        self.render();
                    });
                })

            }).on('click', '#btn_trans_cancel', function(event) {
                event.preventDefault();
                window.location.reload();
            }).on('click', '#btn_ok', function(e) {
                $.mobile.loading("show");
                if ($("#next_user_name").val()) {
                    $("#btn_ok").attr("disabled", "disabled");
                    do_trans(self.trans_data);
                    $.mobile.loading("hide");
                } else {
                    alert('请选择下一任务的处理人');
                };
            }).on('click', '#btn_wf_start_userchat', function(event) {
                event.preventDefault();
                var adjustment_bulk = self.model.get('adjustment_bulk');
                var url = "im://userchat/" + adjustment_bulk.people._id;
                window.location.href = url;
            }).on('click', '#btn_upload_attachment', function(event) {
                //转到上传图片的页面
                var adjustment_bulk = self.model.get('adjustment_bulk');
                localStorage.removeItem('upload_model_back'); //先清掉
                var next_url = '#upload_pic';
                localStorage.setItem('upload_model', JSON.stringify({
                    model: adjustment_bulk,
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
            }).on('click', '#btn-ct-save', function(event) {
                event.preventDefault();
                var adjustment_bulk = self.model.get('adjustment_bulk');
                var pp_items = []
                var low_val = adjustment_bulk.low_val;
                var hight_val = adjustment_bulk.hight_val;
                var ratio_value = adjustment_bulk.pri_value ? adjustment_bulk.pri_value.ratio_value : 0;
                _.each(self.people_data, function(pd) {
                    var val = 0;
                    if (ratio_value) {
                        val = forcechange(pd.pri.amount * ratio_value * 0.01)
                    } else {
                        val = parseFloat(pd.pri.amount)
                    }
                    if (low_val || low_val == 0) {
                        if (parseFloat(low_val) > val) {
                            val = low_val;
                        };
                    };
                    if (hight_val || hight_val == 0) {
                        if (parseFloat(hight_val) < val) {
                            val = hight_val;
                        };
                    }
                    pp_items.push({
                        people: pd.people._id,
                        value: val //每个人要加多少
                    })
                })
                adjustment_bulk.items = pp_items



                if (adjustment_bulk.checked_val == 'P') {
                    if (adjustment_bulk.pri_value && !adjustment_bulk.pri_value.pri) {
                        alert('请选择加薪基数');
                        return false
                    };
                } else {
                    if (adjustment_bulk.fixed_value == '') {
                        alert('固定值不能为空！');
                        return false
                    };

                }

                if (adjustment_bulk.last_items.length) {
                    var num = 0;
                    _.each(adjustment_bulk.last_items, function(item) {
                        num += parseInt(item.ratio_value);
                    })

                    if (num != 100) {
                        alert('薪酬分配比例之和必须等于100');
                        return false
                    };
                } else {
                    alert('请添加调薪项！');
                    return false
                }


                self.model.id = $("#adjustment_bulk_edit-content #adjustment_bulk_id").val();
                self.model.save().done(function(data) {
                    if (data) {
                        alert('数据保存成功！！')
                    };
                })
            }).on('change', '.ratio_last_item', function(event) {
                event.preventDefault();
                var ratio_value = $(this).val();
                var adjustment_bulk = self.model.get('adjustment_bulk');
                var pic = $(this).data('pic');
                var f_d = _.find(adjustment_bulk.last_items, function(as) {
                    return as.pic == String(pic)
                })
                if (f_d) {
                    f_d.ratio_value = ratio_value;
                };
                self.render();
            })


            $("#panel-pri_items_detail").on("panelclose", function(event, ui) {
                var pri_name = $("#panel-pri_items_detail input[type=radio]:checked").val();
                var pri_id = $("#panel-pri_items_detail input[type=radio]:checked").attr('id');
                var adjustment_bulk = self.model.get('adjustment_bulk');

                if (!adjustment_bulk.pri_value) {
                    adjustment_bulk.pri_value = {
                        pri: '',
                        pri_name: ''
                    }
                };
                adjustment_bulk.pri_value.pri = pri_id;
                adjustment_bulk.pri_value.pri_name = pri_name;
                if (pri_id) {
                    get_pri_data(self, pri_id);
                };
            });


            $("#panel-add_pris_detail").on("panelclose", function(event, ui) {
                var adds = _.compact(_.map($("#panel-add_pris_detail input[type=checkbox]:checked"), function(x) {
                    var obj = {
                        pic: x.id,
                        pic_name: x.name,
                        ratio_value: 0, //百分比值
                    }
                    return obj
                }));
                _.each(self.model.get('adjustment_bulk').last_items, function(add) {
                    var f_d = _.find(adds, function(as) {
                        return as.pic == add.pic
                    })
                    if (f_d) {
                        f_d.ratio_value = parseInt(add.ratio_value);
                    };
                })
                self.model.get('adjustment_bulk').last_items = adds;
                self.render();



            });



        },

    });

    // Returns the View class
    return AdjustmentbulkView;

});