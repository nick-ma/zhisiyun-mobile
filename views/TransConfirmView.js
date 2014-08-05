// 绩效评估 View
// =============

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars"], function($, _, Backbone, Handlebars) {
    Handlebars.registerHelper('show', function(data, options) {
        if (data > 0) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        };
    });

    var AIWF01View = Backbone.View.extend({
        // The View Constructor
        initialize: function() {
            this.template = Handlebars.compile($("#wf01_view").html());
            this.bind_events();
        },
        bind_events: function() {
            var self = this;
            self.$el.on('click', '.do_trans', function(event) {
                event.preventDefault();
                var $this = $(this);

                var direction = $this.data('direction');
                var target_id = $this.data('target_id');
                var task_name = $this.data('task_name');
                var name = $this.data('name');
                var roles_type = $this.data('roles_type');
                var position_form_field = $this.data('position_form_field');

                function do_trans(direction, next_tdid, next_tdname, trans_name, roles_type, position_form_field) {
                    //用户出口 <- before do trans
                    //其他程序可以在提交之前做验证。如果验证不通过，需要终止提交动作的，就return false。
                    // if (typeof user_exit_before_do_trans != 'undefined') {
                    //     var ret = user_exit_before_do_trans(direction, next_tdid, next_tdname, trans_name, roles_type, position_form_field);
                    //     if (ret == false) { //如果返回false，就终止掉。
                    //         return;
                    //     };
                    // };
                    // 点击按钮后，把所有的流程操作按钮disabled
                    // $("#wf_btn_group button").attr("disabled", "disabled");
                    // 保存业务表单的数据，这个方法定义在业务流程具体的表单页面的js中。
                    // save_form_data(submit_wf_data);

                    function submit_wf_data() {
                        // //用户出口 <- before submit_wf_data
                        // if (typeof user_exit_before_submit_wf_data != 'undefined') {
                        //     user_exit_before_submit_wf_data(direction, next_tdid, next_tdname, trans_name, roles_type, position_form_field);
                        // };
                        // // 提交到确认页面
                        // $("#frmWFData").validate({
                        //     rules: {
                        //         ti_comment: {
                        //             required: true,
                        //         },
                        //     },
                        //     messages: {
                        //         ti_comment: {
                        //             required: "请输入审批意见",
                        //         },
                        //     }
                        // });

                        $("#frmWFData #next_tdid").val(next_tdid);
                        $("#frmWFData #next_tdname").val(next_tdname);
                        //next_user: next_user, //'516cf9a1d26ad4fe48000001', //以后从列表中选出
                        $("#frmWFData #trans_name").val(trans_name); // 转移过来的名称
                        $("#frmWFData #direction").val(direction); //转移的方向
                        if (roles_type == 'POSITION_SUPERIORS') {
                            var position_id = $(position_form_field).val();
                            $("#frmWFData #position_id").val(position_id);
                        };
                        // console.log($("#frmWFData").serialize());
                        //return;
                        $("#frmWFData").submit();
                        $("#wf_btn_group button").removeAttr("disabled");
                        //用户出口 <- after submit_wf_data
                        if (typeof user_exit_after_submit_wf_data != 'undefined') {
                            user_exit_after_submit_wf_data(direction, next_tdid, next_tdname, trans_name, roles_type, position_form_field);
                        };
                    }


                }

                do_trans(direction,target_id,task_name,name,roles_type,position_form_field);
            })
        },
        // Renders all of the Task models on the UI
        render: function() {
            var self = this;
            var obj = {};
            obj.ai = self.ai.attributes;
            obj.tts = self.wf_data.attributes.tts;

            $("#ai_wf-content").html(self.template(obj));
            $("#ai_wf-content").trigger('create');

            return self;
        }
    });

    // Returns the View class
    return AIWF01View;

});