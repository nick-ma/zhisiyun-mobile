// PeopleSelectt View
// =================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars"],
    function($, _, Backbone, Handlebars) {
        function direct_car_select(direct, $this) {
            var car_id = "#des_car" + $this.data("up_id");
            var pos_id = "#des_pos" + $this.data("up_id");
            var data = _.find(direct, function(temp) {
                return temp.attributes._id == String($this.val())
            })
            var position = $this.data("position")
            var
                item = [],
                item_pos = [];
            if (data) {
                _.each(data.attributes.data, function(car) {
                    var twitter_pos = _.find(car.des_position_data, function(pos) {
                        var can_pos = [];
                        _.each(pos.can_position_data, function(can) {
                            can_pos.push(String(can.can_position))
                        })
                        return !!~can_pos.indexOf(String(position))
                    })
                    var temp_arr = [];
                    temp_arr.push(car.des_career);
                    temp_arr.push(car.des_career_name)
                    if (twitter_pos) {
                        item.push('<option value="' + temp_arr + '" selected>' + car.des_career_name + '</option>')
                        _.each(twitter_pos.des_position_data, function(pos) {
                            var temp_arr_pos = [];
                            temp_arr_pos.push(pos.des_position);
                            temp_arr_pos.push(pos.des_position_name)
                            var can_pos_temp = _.find(pos.can_position_data, function(can) {
                                String(can.can_position) == String(position)
                            })
                            if (can_pos_temp) {
                                item_pos.push('<option value="' + temp_arr_pos + '" selected>' + pos.des_position_name + '</option>')
                            } else {
                                item_pos.push('<option value="' + temp_arr_pos + '" >' + pos.des_position_name + '</option>')

                            }
                        })

                    } else {
                        item.push('<option value="' + temp_arr + '" selected>' + car.des_career_name + '</option>')
                        _.each(car.des_position_data, function(pos) {
                            var temp_arr_pos = [];
                            temp_arr_pos.push(pos.des_position);
                            temp_arr_pos.push(pos.des_position_name)
                            var can_pos_temp = _.find(pos.can_position_data, function(can) {
                                String(can.can_position) == String(position)
                            })
                            if (can_pos_temp) {
                                item_pos.push('<option value="' + temp_arr_pos + '" selected>' + pos.des_position_name + '</option>')
                            } else {
                                item_pos.push('<option value="' + temp_arr_pos + '" >' + pos.des_position_name + '</option>')

                            }
                        })
                    }

                })
            }
            $(car_id + " option").remove();
            $(pos_id + " option").remove();
            $(car_id).html(item.join(''));
            $(car_id).trigger("liszt:updated");
            $(car_id).trigger("change");
            $(pos_id).html(item_pos.join(''));
            $(pos_id).trigger("liszt:updated");
            $(pos_id).trigger("change");

        }

        function direct_pos_select(direct, $this) {
            var pos_id = "#des_pos" + $this.data("up_id");
            var direct_id = "#direct_name" + $this.data("up_id");
            var data = _.find(direct, function(temp) {
                return temp.attributes._id == String($(direct_id).val())
            })
            var position = $this.data("position")
            var
                item_pos = [];
            if (data) {
                var twitter_pos = _.find(data.attributes.data, function(car) {
                    return String(car.des_career) == String($this.val()).split(',')[0]

                })
                if (twitter_pos) {
                    _.each(twitter_pos.des_position_data, function(pos) {
                        var temp_arr_pos = [];
                        temp_arr_pos.push(pos.des_position);
                        temp_arr_pos.push(pos.des_position_name)
                        item_pos.push('<option value="' + temp_arr_pos + '">' + pos.des_position_name + '</option>')
                    })

                }

            }
            $(pos_id + " option").remove();
            $(pos_id).append(item_pos.join(''));
            $(pos_id).trigger("liszt:updated");
        }

        function filter_twitter_data(twitter, _id, develope_direct) {
            var single_data = _.find(twitter.twitter_data, function(temp) {
                return temp._id == String(_id)
            })
            if (single_data) {
                single_data.develope_direct = develope_direct
            }
            _.each(twitter.twitter_data, function(temp) {
                delete temp.direct_data_a;
                delete temp.direct_data_b;
                delete temp.direct_name;
                delete temp.direct_name_b;
            })
            return twitter
        }

        function save_form_data(cb) {
            var develope_direct = [];
            var twitter_data = [];
            $("#superior_twitter_form-content select[name='direct_name']").each(function(e) {
                var develope_direct_s = $("#direct_name" + $(this).data("up_id")).val();
                var des_career = String($("#des_car" + $(this).data("up_id")).val()).split(',')[0];
                var des_career_name = String($("#des_car" + $(this).data("up_id")).val()).split(',')[1];
                var des_position = String($("#des_pos" + $(this).data("up_id")).val()).split(',')[0];
                var des_position_name = String($("#des_pos" + $(this).data("up_id")).val()).split(',')[1];
                var obj = {
                    people: $(this).data("people"),
                    position: $(this).data("position"),
                    develope_direct: develope_direct_s,
                    des_career: des_career,
                    des_career_name: des_career_name,
                    des_position: des_position,
                    des_position_name: des_position_name
                }
                twitter_data.push(obj);
                if (!$(this).val()) {
                    var bool = true;
                    develope_direct.push(bool)
                }
            })
            if (develope_direct.length > 0) {
                alert("不能有未选择培养方向的候选人,请选择好培养方向后再操作！！！")
            } else {
                var url = '/admin/pm/talent_wf/edit_formdata';
                var post_data = 'twitter_id=' + $("#twitter_id").val();
                post_data += '&twitter_data=' + JSON.stringify(twitter_data);
                $.post(url, post_data, function(data) {
                    cb(data)
                }).fail(function(err) {
                    cb(null);
                })
            }

        }
        var do_trans = function(trans_data) {
                // save_form_data_b(function() {
                var post_data = {
                    process_instance_id: $("#superior_twitter_form-content #process_instance_id").val(),
                    task_instance_id: $("#superior_twitter_form-content #task_instance_id").val(),
                    process_define_id: $("#superior_twitter_form-content #process_define_id").val(),
                    next_tdid: $("#superior_twitter_form-content #next_tdid").val(),
                    next_user: $("#superior_twitter_form-content #next_user_id").val() || $("#select_next_user").val(), //'516cf9a1d26ad4fe48000001', //以后从列表中选出
                    trans_name: $("#superior_twitter_form-content #trans_name").val(), // 转移过来的名称
                    comment_msg: $("#superior_twitter_form-content #comment_msg").val(), // 任务批注 
                    attachments: trans_data.attachments || null
                };
                var post_url = $("#superior_twitter_form-content #task_process_url").val();
                post_url = post_url.replace('<TASK_ID>', $("#superior_twitter_form-content #task_instance_id").val());
                $.post(post_url, post_data, function(data) {
                    if (data.code == 'OK') {
                        window.location = '#todo';
                    } else {
                        window.location = '#todo';

                    }
                })
                // })
            }
            // Extends Backbone.View
        var SuperiorTwitterFormView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                this.template = Handlebars.compile($("#hbtmp_wf_superior_twitter_form_view").html());
                this.trans_template = Handlebars.compile($("#trans_confirm_view").html());
                this.loading_template = Handlebars.compile($("#loading_template_view").html());

                this.bind_event();
            },
            pre_render: function() {
                var self = this;
                $("#superior_twitter_form-content").html(self.loading_template({
                    info_msg: '数据加载中...请稍候'
                }));
                $("#superior_twitter_form-content").trigger('create');
                return this;
            },
            // Renders all of the PeopleSelectels on the UI
            render: function() {

                var self = this;
                var twitter_data = self.collection.attributes.twitter_data;
                //推荐培养方向
                var rendered_data = _.map(twitter_data, function(x) {
                        var direct_name = _.map(_.filter(self.direct, function(temp) {
                            var position_arr = [];
                            _.each(temp.attributes.data, function(data) {
                                if (data.des_position_data) {
                                    _.each(data.des_position_data, function(des) {
                                        if (des.can_position_data) {
                                            _.each(des.can_position_data, function(can) {
                                                position_arr.push(can.can_position)
                                            })
                                        }

                                    })
                                }

                            })
                            // console.log(position_arr);
                            return !!~position_arr.indexOf(x.position)
                        }), function(temp) {
                            var obj = {};
                            obj[temp.attributes._id] = temp.attributes.direct_name;
                            return obj
                        })
                        var direct_name_b = _.map(self.direct, function(temp) {
                            var obj = {};
                            obj[temp.attributes._id] = temp.attributes.direct_name;
                            return obj
                        })
                        var direct_data_a = _.filter(self.direct, function(temp) {
                            var position_arr = [];
                            _.each(temp.attributes.data, function(data) {
                                if (data.des_position_data) {
                                    _.each(data.des_position_data, function(des) {
                                        if (des.can_position_data) {
                                            _.each(des.can_position_data, function(can) {
                                                position_arr.push(can.can_position)
                                            })
                                        }

                                    })
                                }

                            })
                            // console.log(position_arr);
                            return !!~position_arr.indexOf(x.position)
                        })
                        var direct_data_b = self.direct;
                        x.direct_name = direct_name;
                        x.direct_name_b = direct_name_b;
                        //人才培养方向数据-已配置
                        x.direct_data_a = direct_data_a;
                        //人才培养方向数据-所有
                        x.direct_data_b = direct_data_b;
                        // console.log(x);
                        return x

                    })
                    //附件数据
                if (localStorage.getItem('upload_model_back')) { //有从上传页面发回来的数据
                    self.wf_data = JSON.parse(localStorage.getItem('upload_model_back')).model;
                    localStorage.removeItem('upload_model_back'); //用完删掉
                };

                var obj = _.extend({
                    form_data: self.collection.attributes
                }, self.wf_data);
                obj.is_self = self.is_self;
                if (self.view_mode) {
                    if (self.view_mode == 'trans') {
                        $("#superior_twitter_form_title").html('数据处理人');

                        $("#superior_twitter_form-content").html(self.trans_template(self.trans_data));
                        $("#superior_twitter_form-content").trigger('create');

                        if (self.trans_data.next_td.node_type == 'END') {
                            do_trans(self.trans_data);
                        }
                    } else if (self.view_mode == 'deal_with') {
                        $("#superior_twitter_form-content").html(self.template(obj));
                        $("#superior_twitter_form-content").trigger('create');
                        return this;
                    }
                } else {
                    $("#superior_twitter_form-content").html(self.template(obj));
                    $("#superior_twitter_form-content").trigger('create');
                    return this;
                }


                return this;

            },
            bind_event: function() {
                var self = this;
                $("#superior_twitter_form").on('change', '.direct_name', function(event) {
                    event.preventDefault();
                    var $this = $(this);
                    // var twitter_fetch = self.collection.attributes;
                    // var filter_data = filter_twitter_data(twitter_fetch, $this.data("up_id"), $this.val());
                    // console.log(twitter_fetch)
                    var direct = self.direct;
                    // self.collection.url = '/admin/pm/talent_wf/superior/' + twitter_fetch._id;
                    // self.collection.save(twitter_fetch).done(function(data) {
                    //     if (data.code == 'OK') {
                    //         direct_select(direct,$this);
                    //         self.render();
                    //     }
                    // })
                    direct_car_select(direct, $this);



                }).on('change', '.des_car', function(event) {
                    event.preventDefault();
                    var $this = $(this);
                    var direct = self.direct;


                    direct_pos_select(direct, $this)
                }).on('click', '#btn_upload_attachment', function(event) {
                    save_form_data(function(data) {
                        //转到上传图片的页面
                        localStorage.removeItem('upload_model_back'); //先清掉
                        var next_url = '#upload_pic';
                        localStorage.setItem('upload_model', JSON.stringify({
                            model: self.wf_data,
                            field: 'attachments',
                            back_url: window.location.hash
                        }))
                        window.location.href = next_url;
                    })


                }).on('click', 'img', function(event) {
                    event.preventDefault();
                    // var img_view = '<div class="img_view" style="background-image:url('+this.src+')"></div>';
                    var img_view = '<img src="' + this.src + '">';
                    // img_view += '<a href="'+this.src.replace('get','download')+'" target="_blank">保存到本地</a>';
                    $("#fullscreen-overlay").html(img_view).fadeIn('fast');
                }).on('click', '.do_trans', function(event) {
                    event.preventDefault();
                    var $this = $(this);
                    if ($("#superior_twitter_form-content #ti_comment").val() == '') {
                        alert('请填写审批意见！');
                        return;
                    }
                    $(this).attr('disabled', true)
                    $.mobile.loading("show");



                    var process_define_id = $("#superior_twitter_form-content #process_define_id").val();
                    var task_define_id = $("#superior_twitter_form-content #task_define_id").val();
                    var process_instance_id = $("#superior_twitter_form-content #process_instance_id").val();
                    var task_process_url = $("#superior_twitter_form-content #task_process_url").val();
                    var task_instance_id = $("#superior_twitter_form-content #task_instance_id").val();

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
                            ti_comment: $("#superior_twitter_form-content #ti_comment").val(),
                            task_instance_id: task_instance_id,
                            next_tdid: target_id,
                            direction: direction,
                            attachments: self.wf_data.attachments
                        }, function(data) {
                            self.view_mode = 'trans';
                            self.trans_data = data;
                            $.mobile.loading("hide");

                            self.render();
                        });
                    } else {
                        var obj = self.wf_data;
                        save_form_data(function(data) {
                            $.post('/admin/wf/trans_confirm_form_4m', {
                                process_define_id: process_define_id,
                                task_define_id: task_define_id,
                                process_instance_id: process_instance_id,
                                task_process_url: task_process_url,
                                next_tdname: task_name,
                                trans_name: name,
                                ti_comment: $("#superior_twitter_form-content #ti_comment").val(),
                                task_instance_id: task_instance_id,
                                next_tdid: target_id,
                                direction: direction,
                                attachments: self.wf_data.attachments

                            }, function(data) {
                                self.view_mode = 'trans';
                                self.trans_data = data;
                                $.mobile.loading("hide");
                                self.render();
                            });
                        })

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
                }).on('click', '#btn_save', function(event) {
                    event.preventDefault();
                    var obj = self.wf_data;
                    save_form_data(function(data) {
                        if (data) {
                            alert("数据保存成功");

                        } else {
                            alert("数据保存失败");

                        }
                    })
                }).on('click', '#btn_wf_talent_start_userchat', function(event) {
                    event.preventDefault();
                    var url = "im://userchat/" + self.wf_data.people;
                    console.log(url);
                    window.location.href = url;
                })

            },

        });

        // Returns the View class
        return SuperiorTwitterFormView;

    });