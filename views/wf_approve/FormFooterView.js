// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "moment"],
    function($, _, Backbone, Handlebars, moment) {
        function validate_form_data() {
            var ret = {
                pass: true,
                errs: []
            };
            _.each(pi.attributes.customize_fields,
                function(x) {
                    //检查必输项
                    if (x.require) { //设定为必输的
                        if (!x.data || (_.isArray(x.data) && !x.data.length)) {
                            ret.pass = false;
                            ret.errs.push('[' + x.title + ']不能为空');
                        };
                    };
                    // 检查数据类型
                    if (x.cat == 'num') {
                        var regexp_num = /^(-)?[0-9\.]*$/;
                        if (!regexp_num.test(x.data)) {
                            ret.pass = false;
                            ret.errs.push('[' + x.title + ']不是有效的数字');
                        };
                    } else if (x.cat == 'date') {

                    };
                })
            return ret;
        }

        function render_confirm_trans(render_data) { //渲染流程条的界面
            $("#confirm_trans").html(tmp_confirm_trans(render_data));
            $("#confirm_trans").trigger('create');
            $("#form_header").hide();
            $("#form_body").hide();
            $("#form_footer").hide();
            $("#confirm_trans").show();
        }

        Handlebars.registerHelper('genTransButtons', function(tts) {
            var tmp_btn = '<button class="ui-btn btn_do_trans btn %s" data-target="%s", data-direction="%s", data-trans_name="%s"><i class="%s"></i>  %s</button>';
            var ret = [];
            if (tts) {
                _.each(tts, function(x) {
                    var btn_class = (x.direction == 'F') ? 'btn-success' : 'btn-danger';
                    var btn = sprintf(tmp_btn, btn_class, x.target._id, x.direction, x.name, x.icon, x.name);
                    if (x.restrict == '') {
                        ret.push(btn);
                    } else if (x.restrict == '1' && supreme_leader) { //最高领导＋最高领导专用
                        ret.push(btn);
                    } else if (x.restrict == '2' && !supreme_leader) { //不是最高领导＋除最高领导外使用
                        ret.push(btn);
                    };
                })
            }
            return ret.join('');
        });
        Handlebars.registerHelper('getCCUsers', function(cc_users) {
            var ret_users = [];
            if (_.isArray(cc_users)) {
                _.each(cc_users, function(x) {
                    var found = _.find(users_data, function(y) {
                        return y.user == x
                    });
                    if (found) {
                        ret_users.push(found.people_name + '/' + found.position_name);
                    };
                })

            };
            return ret_users.join('; ');
        });

        var supreme_leader;
        var pi;
        var ti;
        var pd;
        var tmp_confirm_trans;
        var users_data;
        // Extends Backbone.View
        var View = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                this.el = '#form_footer';
                this.template = Handlebars.compile($("#tmp_form_footer").html());
                this.template2 = Handlebars.compile($("#ref_pis_select_view").html());
                this.template3 = Handlebars.compile($("#tmp_cc_users_view").html());
                this.template4 = Handlebars.compile($("#tmp_next_user_view").html());
                tmp_confirm_trans = Handlebars.compile($("#tmp_confirm_trans").html());
                this.view_mode = '1';
                this.bind_event();
            },

            // Renders all of the WFApprove models on the UI
            render: function() {
                var self = this;
                if (self.view_mode == '1') {
                    $("body").pagecontainer("change", "#wf_my_workflow_form", {
                        reverse: false,
                        changeHash: false,
                    });
                    //附件数据
                    if (localStorage.getItem('upload_model_back')) { //有从上传页面发回来的数据
                        var img_obj = JSON.parse(localStorage.getItem('upload_model_back')).model;
                        img_obj.attachments.push(img_obj.attachments_tmp);

                        self.pi.set('content', img_obj.content);
                        self.pi.set('attachments', img_obj.attachments);
                        localStorage.removeItem('upload_model_back'); //用完删掉

                        self.pi.attributes.lastModified = new Date();
                        self.pi.save();
                    };

                    pi = self.pi;
                    ti = self.ti;
                    pd = self.pd;
                    supreme_leader = self.supreme_leader;
                    users_data = self.users;
                    var render_data = {
                        pi: self.pi.toJSON(),
                        ti: self.ti,
                        pd: self.pd,
                        td: self.td,
                        tts: _.sortBy(self.tts, function(x) { //排个序，把提交的放在前面，驳回的操作放在后面
                            return -x.direction;
                        }),
                        history_tasks: self.history_tasks,
                        flowchart_data: self.flowchart_data,
                        attachments: self.attachments,
                        supreme_leader: supreme_leader,
                    };

                    // console.log(render_data);
                    $("#form_footer").html(self.template(render_data));
                } else if (self.view_mode == '2') {
                    $("body").pagecontainer("change", "#ref_pis_select", {
                        reverse: false,
                        changeHash: false,
                    });

                    var render_data = {
                        ref_pis: self.ref_pis,
                    }

                    $("#ref_pis_select-content").html(self.template2(render_data));
                    $("#ref_pis_select-content").trigger('create');
                } else if (self.view_mode == '3') {
                    $("body").pagecontainer("change", "#cc_users_select", {
                        reverse: false,
                        changeHash: false,
                    });

                    var render_data = {
                        people: self.users,
                    }

                    $("#cc_users_select-content").html(self.template3(render_data));
                    $("#cc_users_select-content").trigger('create');
                } else {
                    $("body").pagecontainer("change", "#next_user_select", {
                        reverse: false,
                        changeHash: false,
                    });

                    var render_data = {
                        people: self.users,
                    }

                    $("#next_user_select-content").html(self.template4(render_data));
                    $("#next_user_select-content").trigger('create');
                }
                return this;
            },
            bind_event: function() {
                var self = this;
                $('#form_footer')
                    .on('click', '.btn_save_pi', function(event) {
                        event.preventDefault();
                        pi.save().done(function() {
                            alert('保存成功');
                        }).fail(function() {
                            alert('保存失败');
                        });
                    })
                    .on('click', '.btn_do_trans', function(event) {
                        event.preventDefault();
                        var $this = $(this);
                        var next_td_id = $this.data('target');
                        var direction = $this.data('direction');
                        var trans_name = $this.data('trans_name');

                        $("#form_body select").trigger('change')
                            // $(".btn_save_pi").trigger('click');
                        var vr = validate_form_data();
                        if (vr.pass) { //表单验证通过
                            if ($("#comment").val()) {
                                $(".btn_save_pi").trigger('click');
                                var url = '/admin/wf/universal/get_trans/' + pi.get('_id') + '/' + ti._id + '/' + next_td_id + '/' + direction;
                                $.get(url, function(data) {
                                    var render_data = data;
                                    render_data.direction = direction;
                                    render_data.trans_name = trans_name;
                                    render_confirm_trans(render_data);
                                })
                            } else {
                                alert('请输入审批意见');
                            };

                        } else { //没过，显示错误信息
                            alert(vr.errs.join('\n'));
                        }
                    })
                    .on('click', '#btn_open_rel_pi', function(event) {
                        event.preventDefault();

                        self.view_mode = '2';
                        self.render();
                    })
                    .on('click', '#btn_remove_rel_pi', function(event) {
                        event.preventDefault();
                        if (confirm('确认要删除吗?')) {
                            pi.attributes.related_pis = [];
                            self.render();
                        }
                    })
                    .on('click', '#btn_open_cc_user', function(event) {
                        event.preventDefault();

                        self.view_mode = '3';
                        self.render();
                    })
                    .on('click', '#btn_remove_cc_user', function(event) {
                        event.preventDefault();
                        if (confirm('确认要删除吗?')) {
                            pi.attributes.cc_users = [];
                            self.render();
                        }
                    })
                    .on('click', '.btn_view_ref_pi', function(event) {
                        event.preventDefault();
                        var $this = $(this);
                        var pi_id = $this.data('pi_id');
                        // console.log(pi_id);
                        $.get('/admin/wf/universal/ref_pi_url?pi_id=' + pi_id, function(url) {
                            if (url) {
                                window.open(url);
                            };
                        })
                    })
                    .on('click', '.btn_remove_ref_pi', function(event) {
                        event.preventDefault();
                        var $this = $(this);
                        var pi_id = $this.data('pi_id');
                        if (pi_id && confirm("确定删除本流程吗？")) {
                            var related_pis = pi.get('related_pis');
                            var found = _.find(related_pis, function(x) {
                                return x._id == pi_id
                            })
                            if (found) {
                                related_pis.splice(related_pis.indexOf(found), 1);
                            };
                            pi.set('related_pis', related_pis);
                            ff_v.render();
                        };
                    })
                    .on('click', '#btn_open_attachments', function(event) {
                        event.preventDefault();

                        //转到上传图片的页面
                        // var leave = self.model.get('leave');
                        localStorage.removeItem('upload_model_back'); //先清掉
                        var next_url = '#upload_pic';
                        localStorage.setItem('upload_model', JSON.stringify({
                            model: pi,
                            field: 'attachments_tmp',
                            back_url: window.location.hash
                        }))
                        window.location.href = next_url;
                    })
                    .on('click', '#btn_remove_attachments', function(event) {
                        event.preventDefault();
                        if (confirm('确认要删除吗?')) {
                            pi.attributes.attachments = [];
                            self.render();
                        }
                    })
                    .on('click', '.btn_remove_attachment', function(event) {
                        event.preventDefault();
                        var $this = $(this);
                        var file_id = $this.data('id');
                        if (file_id && confirm("确定删除附件吗？")) {
                            var found = _.find(pi.attributes.attachments, function(x) {
                                return x._id == file_id;
                            })
                            if (found) {
                                pi.attributes.attachments.splice(pi.attributes.attachments.indexOf(found), 1);
                                pi.save().done(function() {
                                    $.post('/gridfs/delete/', {
                                        file_id: file_id
                                    }, function(data) {
                                        self.render();
                                        show_notify_msg('附件删除成功', 'OK');
                                    })
                                }).fail(function() {
                                    show_notify_msg('附件删除失败', 'ERR');
                                })
                            };
                            // console.log(found);
                        };
                    })
                    .on('change', '#comment', function(event) {
                        event.preventDefault();
                        ti.comment
                    });
                $("#confirm_trans")
                    .on('click', '#btn_cancel_do_trans', function(event) {
                        event.preventDefault();
                        $("#confirm_trans").html('').hide();
                        $("#form_body").show();
                        $("#form_footer").show();
                    })
                    .on('click', '#btn_confirm_do_trans', function(event) {
                        event.preventDefault();
                        //检查表单和各种内容的有效性
                        var $this = $(this);
                        var direction = $this.data('direction');
                        var trans_name = $this.data('trans_name');
                        var next_tdid = $this.data('next_tdid');
                        var url = '/admin/wf/universal/do_trans';


                        var post_data = {
                            piid: pi.get('_id'),
                            tiid: ti._id,
                            pdid: pd._id,
                            next_tdid: next_tdid,
                            trans_name: trans_name,
                            comment_msg: $("#comment").val(),
                        };
                        if (direction == 'F') {
                            post_data.next_user = $("#next_task_user").val();
                        } else {
                            post_data.next_user = $("#pre_task_user").val();

                        };
                        $.post(url, post_data, function(data) {
                            // console.log(data);
                            if (data.code == 'OK') {
                                alert(data.msg);
                                window.location.href = '#todo';
                            } else {
                                alert(data.msg);
                            };
                        }).fail(function() {
                            alert("error");
                        })
                    })
                    .on('click', '.btn_open_free_user', function(event) {
                        event.preventDefault();

                        self.view_mode = '4';
                        self.render();
                    });
                $('#ref_pis_select')
                    .on('click', '#btn-ref_pis_select-back', function(event) {
                        event.preventDefault();

                        self.view_mode = '1';
                        self.render();
                    })
                    .on('click', '#btn-ref_pis_select-ok', function(event) {
                        event.preventDefault();

                        if ($(".ref_pis:checked").length) {
                            var related_pis = pi.get('related_pis');
                            $(".ref_pis:checked").each(function() {
                                var rp = {};
                                rp._id = $(this).data("id");
                                rp.process_instance_name = $(this).data("process_instance_name");
                                related_pis.push(rp);
                            });
                            pi.set('related_pis', related_pis);

                            self.view_mode = '1';
                            self.render();
                        } else {
                            alert('请选择要关联的流程!');
                        }
                    })
                $('#cc_users_select')
                    .on('click', '#btn-cc_users_select-back', function(event) {
                        event.preventDefault();

                        self.view_mode = '1';
                        self.render();
                    })
                    .on('click', '#btn-cc_users_select-ok', function(event) {
                        event.preventDefault();

                        if ($(".cc_users:checked").length) {
                            var cc_users = [];
                            $(".cc_users:checked").each(function() {
                                cc_users.push({
                                    _id: $(this).data('up_id'),
                                });
                            });
                            pi.set('cc_users', cc_users);

                            pi.save().done(function() {
                                self.view_mode = '1';
                                self.render();
                            })
                        } else {
                            alert('请选择要抄送的人员!');
                        }
                    })

                $('#next_user_select')
                    .on('click', '#btn-next_user_select-back', function(event) {
                        event.preventDefault();

                        self.view_mode = '1';
                        self.render();
                    })
                    .on('click', '#btn-next_user_select-ok', function(event) {
                        event.preventDefault();

                        if ($("input[name='next_user']:checked").length) {
                            var _id = $("input[name='next_user']:checked").val();
                            var name = $("input[name='next_user']:checked").attr('people_name');

                            $("#confirm_trans").find("#next_task_user").val(_id);
                            $("#confirm_trans").find("#next_task_user_name").val(name);

                            self.view_mode = '1';
                            self.render();
                        } else {
                            alert('请选择人员!');
                        }
                    })
            }

        });

        // Returns the View class
        return View;

    });