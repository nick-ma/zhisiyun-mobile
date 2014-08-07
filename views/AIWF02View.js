// 他人评估 View
// =============

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars"], function($, _, Backbone, Handlebars) {

    var dc_data;

    function update_dc(item_type, target_value, actual_value, e) {
        // var actual_value = $(e.children[0].children[0]).val();
        if (item_type == '1') {
            var num1 = Math.abs(parseFloat(actual_value) - parseFloat(target_value));
            var num2 = num1 / parseFloat(target_value);
            if (num2 > 0.4) {
                if (!confirm('实际值与目标值偏差超过40%，确认录入吗？')) {
                    // $(e.children[0].children[0]).val('');
                    return false;
                }
            }
        } else if (item_type == '4') {
            if (actual_value > 100) {
                alert('定性指标评分不能大于100!');
                $(e).val('');
                return false;
            }
        } else {
            if (parseFloat(actual_value) > parseFloat(target_value)) {
                alert('加减分项不能超过上限!');
                // $(e.children[0].children[0]).val('');
                return false;
            }
        }
        return true;
    }

    function save_form_data(cb) {
        var bool = false;
        _.each(dc_data.items, function(x) {
            _.each(x.sub_items, function(xx) {
                if (!xx.actual_value && xx.actual_value != 0) {
                    bool = true;
                }
            });
        });
        if (bool) {
            alert("实际值不能为空或输入实际值为非法字符！");
            $("#wf_btn_group button").removeAttr("disabled");
        } else {
            var url = '/admin/pm/assessment_instance/save_dc_by_dp';
            $.post(url, {
                dc_obj: JSON.stringify(dc_data)
            }, function(data) {
                cb();
            })
        }
    }

    var do_trans = function() {
        save_form_data(function() {
            var post_data = {
                process_instance_id: $("#process_instance_id").val(),
                task_instance_id: $("#task_instance_id").val(),
                process_define_id: $("#process_define_id").val(),
                next_tdid: $("#next_tdid").val(),
                next_user: $("#next_user_id").val() || null, //'516cf9a1d26ad4fe48000001', //以后从列表中选出
                trans_name: $("#trans_name").val(), // 转移过来的名称
                comment_msg: $("#comment_msg").val(), // 任务批注 
            };
            var post_url = $("#task_process_url").val();
            post_url = post_url.replace('<TASK_ID>', $("#task_instance_id").val());

            $.post(post_url, post_data, function(data) {
                if (data.code == 'OK') {

                    window.location = '#todo';
                };
            })
        })
    }

    var AIWF02View = Backbone.View.extend({
        // The View Constructor
        initialize: function() {
            this.bind_events();
        },
        bind_events: function() {
            var self = this;
            self.$el.on('click', '.do_trans', function(event) {
                if ($("#ti_comment").val() == '') {
                    alert('请填写审批意见！');
                    return;
                }

                event.preventDefault();
                var $this = $(this);

                var process_define_id = $("#process_define_id").val();
                var task_define_id = $("#task_define_id").val();
                var process_instance_id = $("#process_instance_id").val();
                var task_process_url = $("#task_process_url").val();
                var task_instance_id = $("#task_instance_id").val();

                var direction = $this.data('direction');
                var target_id = $this.data('target_id');
                var task_name = $this.data('task_name');
                var name = $this.data('name');
                var roles_type = $this.data('roles_type');
                var position_form_field = $this.data('position_form_field');

                $.post('/admin/wf/trans_confirm_form_4m', {
                    process_define_id: process_define_id,
                    task_define_id: task_define_id,
                    process_instance_id: process_instance_id,
                    task_process_url: task_process_url,
                    next_tdname: task_name,
                    trans_name: name,
                    ti_comment: $("#ti_comment").val(),
                    task_instance_id: task_instance_id,
                    next_tdid: target_id,
                    direction: direction
                }, function(data) {
                    self.view_mode = 'trans';
                    self.trans_data = data;
                    self.render();
                });
            })

            // $("#dc_wf-content").on('click', '#btn_ok', function(e) {
            //     if ($("#next_user_name").val()) {
            //         $("#btn_ok").attr("disabled", "disabled");

            //         do_trans();

            //     } else {
            //         alert('请选择下一任务的处理人');
            //     };
            // })

            $("#btn_dc_wf_cancel").on('click', function(event) {
                event.preventDefault();

                window.location.href = '#todo';
            })

            $("#dc_wf-content").on('blur', '.actual_value', function(event) {
                event.preventDefault();

                var $changed = $(this);

                var value = $changed.val();

                if (isNaN(value)) {
                    alert("请输入正确的实际值!");
                    return;
                }

                var item_id = $changed.data('item_id');
                var up_id = $changed.data('up_id');
                var item_type = $changed.data('item_type');
                var target_value = $changed.data('target_value');

                if (update_dc(item_type, target_value, value,this)) {
                    var item = _.find(dc_data.items, function(x) {
                        return x._id == item_id;
                    });

                    var sub_item = _.find(item.sub_items, function(x) {
                        return x._id == up_id;
                    });

                    sub_item.actual_value = parseFloat(value);
                    sub_item.creator = dc_data.people;
                    sub_item.createDate = moment();
                }
            })
        },
        // Renders all of the Task models on the UI
        render: function() {
            var self = this;

            dc_data = self.dc.attributes;

            var obj = {};
            obj.dc = dc_data;
            obj.tts = self.wf_data.attributes.tts;
            obj.td = self.wf_data.attributes.td;
            obj.ti = self.wf_data.attributes.ti;

            obj.pd = self.wf_data.attributes.pd;
            obj.history_tasks = self.wf_data.attributes.history_tasks;
            obj.flowchart_data = self.wf_data.attributes.flowchart_data;
            obj.attachments = self.wf_data.attributes.attachments;

            if (self.view_mode) {
                $("#ai_wf_title").html('数据处理人');

                this.template = Handlebars.compile($("#trans_confirm_view").html());
                $("#ai_wf-content").html(self.template(self.trans_data));
                $("#ai_wf-content").trigger('create');

                if (self.trans_data.next_td.node_type == 'END') {
                    do_trans();
                }
            } else {
                this.template = Handlebars.compile($("#wf02_view").html());
                $("#dc_wf-content").html(self.template(obj));
                $("#dc_wf-content").trigger('create');
            }

            return self;
        }
    });

    // Returns the View class
    return AIWF02View;
});