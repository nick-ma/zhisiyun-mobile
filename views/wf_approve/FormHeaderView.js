// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "moment"],
    function($, _, Backbone, Handlebars, moment) {
        // Extends Backbone.View
        var View = Backbone.View.extend({
            // The View Constructor
            initialize: function() {
                this.el = '#form_header';
                this.template = Handlebars.compile($("#tmp_form_header").html());
                this.bind_event();
            },

            // Renders all of the WFApprove models on the UI
            render: function() {
                var self = this;
                var render_data = {
                    pi: self.pi.toJSON(),
                    ti: self.ti,
                };
                $("#form_header").html(self.template(render_data));
                $("#form_header").trigger('create');
                return this;
            },
            bind_event: function() {
                var self = this;
                // 绑定提交按你
                // $("#confirm_trans")
                    // .on('click', '#btn_cancel_do_trans', function(event) {
                    //     event.preventDefault();
                    //     $("#confirm_trans").html('').hide();
                    //     $("#form_body").show();
                    //     $("#form_footer").show();
                    // })
                    // .on('click', '#btn_confirm_do_trans', function(event) {
                    //     event.preventDefault();
                    //     //检查表单和各种内容的有效性
                    //     var $this = $(this);
                    //     var direction = $this.data('direction');
                    //     var trans_name = $this.data('trans_name');
                    //     var next_tdid = $this.data('next_tdid');
                    //     var url = '/admin/wf/universal/do_trans';


                    //     var post_data = {
                    //         piid: pi.get('_id'),
                    //         tiid: ti._id,
                    //         pdid: pd._id,
                    //         next_tdid: next_tdid,
                    //         trans_name: trans_name,
                    //         comment_msg: $("#comment").val(),
                    //     };
                    //     if (direction == 'F') {
                    //         post_data.next_user = $("#next_task_user").val();
                    //     } else {
                    //         post_data.next_user = $("#pre_task_user").val();

                    //     };
                    //     $.post(url, post_data, function(data) {
                    //         // console.log(data);
                    //         if (data.code == 'OK') {
                    //             alert(data.msg);
                    //             window.location.href = ' /admin/wf/todo_list';
                    //         } else {
                    //             alert(data.msg);
                    //         };
                    //     }).fail(function() {
                    //         alert("error");
                    //     })
                    // })
                    // .on('click', '#btn_open_free_user', function(event) {
                    //     event.preventDefault();
                    //     $("#ihModalFreeUser").modal('show');
                    // });

            }

        });

        // Returns the View class
        return View;

    });