// WFApprove Edit View
// =================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "moment"],
    function($, _, Backbone, Handlebars, moment) {

        // Extends Backbone.View
        var WFApproveEditView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                var self = this;
                this.template = Handlebars.compile($("#hbtmp_wf_approve_edit_view").html());
                // The render method is called when WFApprove Models are added to the Collection
                // this.collection.on("sync", this.render, this);
                // bind event
                // self.bind_event();
            },

            // Renders all of the WFApprove models on the UI
            render: function() {

                var self = this;
                self.ct_id = self.model.get('_id') || null;
                // var rendered = ;
                // var render_data = {
                //         cts: _.sortBy(_.map(this.collection.models, function(x) {
                //             return x.toJSON();
                //         }), function(x) {
                //             return x.fl;
                //         })
                //     }
                // _.each(this.collection.models, function(x) {
                //     x.attributes.pi_count = x.attributes.qualitative_pis.items.length + x.attributes.quantitative_pis.items.length;
                //     rendered.push(self.template(x.attributes));
                // });
                // self.template(render_data);
                // 人员选择
                var sphb = JSON.parse(localStorage.getItem('sp_helper_back') || null);
                localStorage.removeItem('sp_helper_back'); //获取完之后，删掉，避免后面重复使用。
                if (sphb) {
                    self.model.set(sphb.model);
                };
                var render_data = self.model.toJSON();
                render_data.login_people = $("#login_people").val();
                $("#wf_approve_edit-content").html(self.template(self.model.toJSON(render_data)));
                $("#wf_approve_edit-content").trigger('create');
                //把 a 换成 span， 避免点那个滑块的时候页面跳走。
                $(".ui-flipswitch a").each(function() {
                    $(this).replaceWith("<span class='" + $(this).attr('class') + "'></span>");
                });
                return this;

            },
            bind_event: function() {
                var self = this;
                $("#wf_approve_edit_edit-content")
                    .on('click', '#btn-fa-upload', function(event) {

                    })
                    .on('click', '#btn-fa-save', function(event) {
                        //set current task comment
                        var comment = $("#faform #comment").val();
                        var current_task = _.find(fa.get('tasks'), function(x) {
                            return x.task_no == fa.get('current_task_no');
                        })
                        if (current_task) {
                            current_task.comment = comment;
                        };
                        fa.save().done(function() {
                            show_notify_msg('保存成功', 'OK');
                        }).fail(function() {
                            show_notify_msg('保存失败', 'ERR');
                        })
                    })
                    .on('click', '#btn-fa-approve', function(event) {

                    })
                    .on('click', '#btn-fa-reject', function(event) {

                    })
                    .on('click', '#btn-fa-end_approve', function(event) {

                    })
                    .on('click', '#btn-fa-end_reject', function(event) {

                    })
                    .on('change', 'input, textarea, select', function(event) {
                        event.preventDefault();
                        var $this = $(this);
                        var field = $this.data('field');
                        var value = $this.val();
                        self.model.set(field, value);
                    })

            }

        });

        // Returns the View class
        return WFApproveEditView;

    });