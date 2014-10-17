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
                self.bind_event();
            },

            // Renders all of the WFApprove models on the UI
            render: function() {

                var self = this;
                self.ct_id = self.model.get('_id') || null;

                // 人员选择
                var sphb = JSON.parse(localStorage.getItem('sp_helper_back') || null);
                localStorage.removeItem('sp_helper_back'); //获取完之后，删掉，避免后面重复使用。
                if (sphb) {
                    // self.model.set(sphb.model);
                    var next_people = sphb.model.next_people
                    if (next_people && confirm('确认要将流程提交到“' + next_people.people_name + '”吗？')) {
                        self.do_approve(next_people);
                    }else{
                        self.model.set(sphb.model);
                    };
                };
                //上传界面
                if (localStorage.getItem('upload_model_back')) { //有从上传页面发回来的数据
                    var back_model = JSON.parse(localStorage.getItem('upload_model_back')).model;
                    localStorage.removeItem('upload_model_back'); //用完删掉
                    if (back_model && back_model.attachments && back_model.attachments.length) {
                        _.each(back_model.attachments, function(x) {
                            var attachments = self.model.get('attachments');
                            var attachment = {
                                file: x,
                                people: $("#login_people").val(),
                            };
                            attachments.push(attachment);
                        });
                        self.save_model(function() {
                            self.render();
                        });
                    };
                };
                var render_data = self.model.toJSON();

                render_data.login_people = $("#login_people").val();
                // console.log(render_data);
                $("#wf_approve_edit-content").html(self.template(render_data));
                $("#wf_approve_edit-content").trigger('create');
                //把 a 换成 span， 避免点那个滑块的时候页面跳走。
                $(".ui-flipswitch a").each(function() {
                    $(this).replaceWith("<span class='" + $(this).attr('class') + "'></span>");
                });
                return this;

            },
            bind_event: function() {
                var self = this;
                $("#wf_approve_edit-content")
                    .on('click', '#btn-fa-upload', function(event) {
                        //转到上传图片的页面
                        localStorage.removeItem('upload_model_back'); //先清掉
                        var next_url = '#upload_pic';
                        localStorage.setItem('upload_model', JSON.stringify({
                            model: {
                                attachments: []
                            },
                            field: 'attachments',
                            back_url: '#wf_approve_edit/' + self.model.get('_id')
                        }))
                        window.location.href = next_url;
                    })
                    .on('click', '#btn-fa-select-cc_people', function(event) {
                        event.preventDefault();
                        var url = '#people_select/m/cc_people';
                        localStorage.setItem('sp_helper', JSON.stringify({
                            model: self.model.toJSON(),
                            back_url: '#wf_approve_edit/' + self.model.get('_id'),
                        })); //放到local storage里面，便于后面选择屏幕进行操作
                        window.location.href = url;
                    })
                    .on('click', '#btn-fa-save', function(event) {
                        var vld = self.valid();
                        if (vld.flag) {
                            self.save_model(function() {
                                self.render();
                                alert('保存成功');
                            })
                        } else {
                            alert(vld.errmsg.join('\n'));
                        };
                    })
                    .on('click', '#btn-fa-approve', function(event) {
                        var vld = self.valid();
                        if (vld.flag) {
                            self.save_model(function() {
                                var url = '#people_select/s/next_people';
                                localStorage.setItem('sp_helper', JSON.stringify({
                                    model: self.model.toJSON(),
                                    back_url: '#wf_approve_edit/' + self.model.get('_id'),
                                })); //放到local storage里面，便于后面选择屏幕进行操作
                                window.location.href = url;
                            });
                        } else {
                            alert(vld.errmsg.join('\n'));
                        };
                    })
                    .on('click', '#btn-fa-reject', function(event) {
                        var vld = self.valid();
                        if (vld.flag) {
                            if (confirm("确认驳回本流程吗？")) {
                                self.save_model(function() {
                                    var url = '/admin/free_wf/approve/' + self.model.get('_id') + '/reject';
                                    var post_data = {
                                        current_task_no: self.model.get('current_task_no'),
                                    };
                                    $.post(url, post_data, function(data) {
                                        if (data.code == 'OK') {
                                            alert(data.msg);
                                            window.setTimeout(function() {
                                                window.location.href = '#wf_approve';
                                            }, 1500);
                                        };
                                    })
                                })
                            };
                        } else {
                            alert(vld.errmsg.join('\n'));
                        };
                    })
                    .on('click', '#btn-fa-end_approve', function(event) {
                        var vld = self.valid();
                        if (vld.flag) {
                            if (confirm("确认通过并结束本流程吗？")) {
                                self.save_model(function() {
                                    var url = '/admin/free_wf/approve/' + self.model.get('_id') + '/approve_done';
                                    var post_data = {
                                        current_task_no: self.model.get('current_task_no'),
                                    };
                                    $.post(url, post_data, function(data) {
                                        if (data.code == 'OK') {
                                            alert(data.msg);
                                            window.setTimeout(function() {
                                                window.location.href = '#wf_approve';
                                            }, 1500);
                                        };
                                    })
                                });
                            };
                        } else {
                            alert(vld.errmsg.join('\n'));
                        };
                    })
                    .on('click', '#btn-fa-end_reject', function(event) {
                        var vld = self.valid();
                        if (vld.flag) {
                            if (confirm("确认拒绝并结束本流程吗？")) {
                                self.save_model(function() {
                                    var url = '/admin/free_wf/approve/' + self.model.get('_id') + '/reject_done';
                                    var post_data = {
                                        current_task_no: self.model.get('current_task_no'),
                                    };
                                    $.post(url, post_data, function(data) {
                                        if (data.code == 'OK') {
                                            alert(data.msg);
                                            window.setTimeout(function() {
                                                window.location.href = '#wf_approve';
                                            }, 1500);
                                        };
                                    })
                                });
                            };
                        } else {
                            alert(vld.errmsg.join('\n'));
                        };
                    })
                    .on('change', 'input, textarea, select', function(event) {
                        event.preventDefault();
                        var $this = $(this);
                        var field = $this.data('field');
                        var value = $this.val();
                        self.model.set(field, value);
                    })

            },
            valid: function() {
                var flag = true,
                    errmsg = [];
                if (!$("#wf_approve_content").val()) {
                    errmsg.push('请输入报批事项详情');
                    flag = false;
                };
                if (!$("#wf_approve_task_comment").val()) {
                    errmsg.push('请输入审批意见');
                    flag = false;
                };
                return {
                    flag: flag,
                    errmsg: errmsg
                };
            },
            save_model: function(cb) {
                var self = this;
                //set current task comment
                var comment = $("#wf_approve_task_comment").val();
                var current_task = _.find(self.model.get('tasks'), function(x) {
                    return x.task_no == self.model.get('current_task_no');
                })
                if (current_task) {
                    current_task.comment = comment;
                };
                self.model.save().done(function() {
                    if (cb && typeof cb == 'function') {
                        cb();
                    };
                }).fail(function() {
                    alert('保存失败');
                })
            },
            do_approve: function(next_people) { //提交
                var self = this;
                var url = '/admin/free_wf/approve/' + self.model.get('_id') + '/approve';
                var post_data = {
                    current_task_no: self.model.get('current_task_no'),
                    next_people: next_people._id, //提交到的人
                };
                $.post(url, post_data, function(data) {
                    if (data.code == 'OK') {
                        alert(data.msg);
                        window.setTimeout(function() {
                            window.location.href = '#wf_approve';
                        }, 1500);
                    };
                })
            }

        });

        // Returns the View class
        return WFApproveEditView;

    });