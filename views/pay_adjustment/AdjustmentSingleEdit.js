// ToDo View
// =============

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "async", "moment"], function($, _, Backbone, Handlebars, async, moment) {



    Handlebars.registerHelper('year_select_pay_roll', function(date) { //选择年

        var year = moment().get('year');
        var years = _.range(year - 1, year + 5);

        var current_year = moment(date).format('YYYY')
        var select_arr = [];

        select_arr.push('<select id="select_year" class="select_date"  style="margin: 0px;width: 85px;" >')

        for (var i = 1; i < years.length; i++) {
            if (years[i] == String(current_year)) {
                select_arr.push('<option value ="' + years[i] + '" selected>' + years[i] + '年</option>')
            } else {
                select_arr.push('<option value ="' + years[i] + '" >' + years[i] + '年</option>')

            }
        }
        select_arr.push('</select>');
        return select_arr.join('')
    });
    Handlebars.registerHelper('month_select_pay_roll', function(date) { //选择年
        var months = {
            '1': '一月',
            '2': '二月',
            '3': '三月',
            '4': '四月',
            '5': '五月',
            '6': '六月',
            '7': '七月',
            '8': '八月',
            '9': '九月',
            '10': '十月',
            '11': '十一月',
            '12': '十二月',
        }
        var current_year = moment(date).format('MM')
        var select_arr = [];
        select_arr.push('<select id="select_month" class="select_date"  style="margin: 0px;width: 85px;">')
        for (var i = 1; i <= 12; i++) {
            var num = String(current_year)
            if (Number(i) == Number(num)) {
                select_arr.push('<option value ="' + i + '" selected>' + months[i] + '</option>')
            } else {
                select_arr.push('<option value ="' + i + '" >' + months[i] + '</option>')

            }
        }
        select_arr.push('</select>');
        return select_arr.join('')

    });



    Handlebars.registerHelper('pay_in', function(obj, data) {
        var f_d = _.find(obj.items, function(it) {
            return it.pri._id == String(data)
        })
        return f_d ? f_d.amount : 0
    });



    Handlebars.registerHelper('is_in_pay', function(obj, data, options) {
        var f_d = _.find(obj.adds, function(it) {
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



    var get_effective_date = function(self) {
        var select_year = $('#select_year').val();
        var select_month = $('#select_month').val();
        var effective_date = '';
        if (select_month.length == 1) {
            effective_date = select_year + '-0' + select_month
        } else {
            effective_date = select_year + '-' + select_month
        }
        self.model.get('adjustment_single').effective_date = effective_date

    }


    var AdjustmentSingleView = Backbone.View.extend({
        // The View Constructor
        initialize: function() {
            this.adjustment_single_edit_template = Handlebars.compile($("#adjustment_single_edit_view").html());

            this.template = Handlebars.compile($("#trans_confirm_view").html()); //跳转页面
            this.adjustment_pay_last_detail_template = Handlebars.compile($("#adjustment_pay_last_detail_view").html()); //上月工资
            this.adjustment_pay_items_detail_template = Handlebars.compile($("#adjustment_pay_items_detail_view").html()); //工资项

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
            var adjustment_single = self.model.get('adjustment_single');
            var attachments = self.model.get('attachments');
            if (!!localStorage.getItem('to_do_back_url')) {
                self.to_do_back_url = localStorage.getItem('to_do_back_url');
                localStorage.removeItem('to_do_back_url');
            }
            //附件数据
            if (localStorage.getItem('upload_model_back')) { //有从上传页面发回来的数据
                adjustment_single = JSON.parse(localStorage.getItem('upload_model_back')).model;
                if (_.isUndefined(adjustment_single.attis)) {
                    adjustment_single.attis = [];
                    adjustment_single.attis.push(adjustment_single.attachments)
                } else {
                    adjustment_single.attis.push(adjustment_single.attachments)
                }
                attachments = _.map(attachments, function(att) {
                    if (att._id) {
                        return att._id
                    } else {
                        return att
                    }
                })
                self.model.set('adjustment_single', adjustment_single);
                _.each(adjustment_single.attis, function(ti) {
                    self.model.get('attachments').push(ti)
                })

                self.model.set('attachments', _.flatten([attachments, adjustment_single.attis], true))
                localStorage.removeItem('upload_model_back'); //用完删掉
            };
            var rendered_data = '';


            if (self.model_view == '0') {
                var year = moment().get('year');
                var years = _.range(year - 1, year + 5);

                var obj = self.model.attributes;
                obj.years = years
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
                rendered_data = self.adjustment_single_edit_template(obj);

            } else if (self.model_view == '1') {
                rendered_data = self.template(self.trans_data);
                if (self.trans_data.next_td.node_type == 'END') {
                    do_trans(self.trans_data);
                }
            };



            $("#adjustment_single_edit-content").html(rendered_data);
            $("#adjustment_single_edit-content").trigger('create');

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
            $("#adjustment_single_edit").on('click', '#adjustment_singles_last_pay', function(event) {
                event.preventDefault();
                option_rendered_data = self.adjustment_pay_last_detail_template(self.model.get('last_months'));
                $("#panel-pay_last_detail").html(option_rendered_data);
                $("#panel-pay_last_detail").trigger('create');
                $("#panel-pay_last_detail").panel('open').trigger("updatelayout");
            }).on('click', '#adjustment_singles_add_pay', function(event) {
                event.preventDefault();
                var obj = self.model.get('last_months');
                obj.adjustment_single = self.model.get('adjustment_single');
                option_rendered_data = self.adjustment_pay_items_detail_template(obj);
                $("#panel-pay_items_detail").html(option_rendered_data);
                $("#panel-pay_items_detail").trigger('create');
                $("#panel-pay_items_detail").panel('open').trigger("updatelayout");
            }).on('change', '.ratio_num', function(event) {
                event.preventDefault();
                var value_num = $(this).val();
                var pic = $(this).data('pic');
                var f_d = _.find(self.model.get('adjustment_single').adds, function(add) {
                    var p_id = add.pic._id ? add.pic._id : add.pic
                    return p_id == pic
                })
                if (f_d) {
                    f_d.ratio_value = value_num;
                    f_d.new_value = parseFloat(f_d.current_value) + f_d.current_value * value_num * 0.01 + parseFloat(f_d.add_value);
                };
                self.render();
            }).on('change', '.add_num', function(event) {
                event.preventDefault();
                var value_num = $(this).val();

                var pic = $(this).data('pic');

                var f_d = _.find(self.model.get('adjustment_single').adds, function(add) {
                    var p_id = add.pic._id ? add.pic._id : add.pic
                    return p_id == pic
                })
                if (f_d) {
                    f_d.add_value = value_num
                    f_d.new_value = parseFloat(f_d.current_value) + f_d.current_value * f_d.ratio_value * 0.01 + parseFloat(value_num);
                };
                self.render();
            }).on('change', '#effective_date', function(event) {
                event.preventDefault();
                self.model.get('adjustment_single').effective_date = moment($(this).val()).format('YYYY-MM')
            }).on('change', '#reason_type', function(event) {
                event.preventDefault();
                self.model.get('adjustment_single').reason_type = $(this).val();
            }).on('click', '.do_trans', function(event) {
                event.preventDefault();
                var adjustment_single = self.model.get('adjustment_single');
                var attachments = self.model.get('attachments');
                var $this = $(this);
                var bool = false;
                if (adjustment_single.adds.length) {
                    _.each(adjustment_single.adds, function(add) {
                        var ratio_value = add.ratio_value;
                        var add_value = add.add_value;
                        if ((ratio_value == '' || ratio_value == null) && ratio_value != 0) {
                            bool = true;
                        };
                        if ((add_value == '' || add_value == null) && add_value != 0) {
                            bool = true;
                        };
                    })
                } else {
                    alert('请添加调薪项！')
                    return false;
                }
                if (bool) {
                    alert('调薪比例/固定值不能为空！')
                    return false;
                };


                if ($("#adjustment_single_edit-content #ti_comment").val() == '') {
                    alert('请填写审批意见！');
                    return;
                };
                if (adjustment_single.adds.length == 0) {
                    alert('请添加调薪项')
                    return;
                };
                $(this).attr('disabled', true)
                $.mobile.loading("show");
                var process_define_id = $("#adjustment_single_edit-content #process_define_id").val();
                var task_define_id = $("#adjustment_single_edit-content #task_define_id").val();
                var process_instance_id = $("#adjustment_single_edit-content #process_instance_id").val();
                var task_process_url = $("#adjustment_single_edit-content #task_process_url").val();
                var task_instance_id = $("#adjustment_single_edit-content #task_instance_id").val();
                var adjustment_single_position = $("#adjustment_single_edit-content #adjustment_single_position").val();


                var direction = $this.data('direction');
                var target_id = $this.data('target_id');
                var task_name = $this.data('task_name');
                var name = $this.data('name');
                var roles_type = $this.data('roles_type');
                var position_form_field = $this.data('position_form_field');
                get_effective_date(self)

                self.model.id = $("#adjustment_single_edit-content #adjustment_single_id").val();
                self.model.save().done(function(data1) {
                    $.post('/admin/wf/trans_confirm_form_4m', {
                        process_define_id: process_define_id,
                        task_define_id: task_define_id,
                        process_instance_id: process_instance_id,
                        task_process_url: task_process_url,
                        position_id: adjustment_single_position,
                        next_tdname: task_name,
                        trans_name: name,
                        ti_comment: $("#adjustment_single_edit-content #ti_comment").val(),
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
                var adjustment_single = self.model.get('adjustment_single');
                var url = "im://userchat/" + adjustment_single.people._id;
                window.location.href = url;
            }).on('click', '#btn_upload_attachment', function(event) {
                //转到上传图片的页面
                get_effective_date(self)
                var adjustment_single = self.model.get('adjustment_single');
                localStorage.removeItem('upload_model_back'); //先清掉
                var next_url = '#upload_pic';
                localStorage.setItem('upload_model', JSON.stringify({
                    model: adjustment_single,
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
                var adjustment_single = self.model.get('adjustment_single');
                var bool = false;
                if (adjustment_single.adds.length) {
                    _.each(adjustment_single.adds, function(add) {
                        var ratio_value = add.ratio_value;
                        var add_value = add.add_value;
                        if ((ratio_value == '' || ratio_value == null) && ratio_value != 0) {
                            bool = true;
                        };
                        if ((add_value == '' || add_value == null) && add_value != 0) {
                            bool = true;
                        };
                    })
                } else {
                    alert('请添加调薪项！')
                    return false;
                }
                if (bool) {
                    alert('调薪比例/固定值不能为空！')
                    return false;

                };

                self.model.id = $("#adjustment_single_edit-content #adjustment_single_id").val();
                get_effective_date(self)
                self.model.save().done(function(data) {
                    if (data) {
                        alert('数据保存成功！！')
                    };
                })
            }).on('change', '.select_date', function(event) {
                event.preventDefault();
                get_effective_date(self)
            })



            $("#panel-pay_items_detail").on("panelclose", function(event, ui) {
                var adds = _.compact(_.map($("#panel-pay_items_detail input[type=checkbox]:checked"), function(x) {
                    var obj = {
                        pic: x.id,
                        pic_name: x.name,
                        current_value: x.value, //原值
                        ratio_value: 0, //百分比值
                        add_value: 0, //加多少
                        new_value: x.value //加后的值
                    }
                    return obj
                }));
                _.each(self.model.get('adjustment_single').adds, function(add) {
                    var f_d = _.find(adds, function(as) {
                        return as.pic == add.pic
                    })
                    if (f_d) {
                        f_d.current_value = add.current_value;
                        f_d.ratio_value = add.ratio_value;
                        f_d.add_value = add.add_value;
                        f_d.new_value = add.new_value;
                    };
                })
                self.model.get('adjustment_single').adds = adds;
                self.render();
            });

        },

    });

    // Returns the View class
    return AdjustmentSingleView;

});