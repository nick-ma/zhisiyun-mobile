// 绩效计划 View
// =============

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars"], function($, _, Backbone, Handlebars) {
    var ai;
    var ai_data;
    var peoples_data;
    var unit_data;
    var pis_data;
    var unit_groups = {
        'Money': '金额',
        'Length': '长度',
        'Area': '面积',
        'Volume': '体积',
        'Weight': '重量',
        'Time': '时间',
        'Rate': '比率',
        'Others': '其他',
        'Others1': '自定义1',
        'Others2': '自定义2',
    };

    //保存绩效实例
    function save_form_data(cb) {
        var ai_data_c = _.clone(ai_data);

        var ai_id = ai_data_c._id;
        //id删掉做修改
        delete ai_data_c._id;
        //保存时，把poulate后的重置为id保存
        ai_data_c.points_system = !!ai_data_c.points_system._id ? ai_data_c.points_system._id : ai_data_c.points_system;

        if (ai_data_c.qualitative_pis.grade_way == 'G') {
            _.each(ai_data_c.qualitative_pis.items, function(x) {
                if (x.grade_group)
                    x.grade_group = !!x.grade_group._id ? x.grade_group._id : x.grade_group;
            });
        }

        _.each(ai_data_c.quantitative_pis.items, function(x) {
            if (x.scoringformula)
                x.scoringformula = !!x.scoringformula._id ? x.scoringformula._id : x.scoringformula;
            if (x.dp_people)
                x.dp_people = !!x.dp_people._id ? x.dp_people._id : x.dp_people;
        });

        var url = '/admin/pm/assessment_instance/edit';
        var post_data = "ai_id=" + ai_id;

        post_data += '&ai_data=' + JSON.stringify(ai_data_c);

        $.post(url, post_data, function(data) {
            ai.fetch().done(function() {
                ai_data = ai.attributes;
                cb();
            });
        })

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

    var AIWF03View = Backbone.View.extend({
        // The View Constructor
        initialize: function() {
            this.loading_template = Handlebars.compile($("#loading_template_view").html());
            this.bind_events();
        },
        bind_events: function() {
            var self = this;

            function find_dp_peoples(sii, pi) {
                var position_id = self.ai.attributes.position;
                var ou_id = self.ai.attributes.ou;
                var company_id = self.ai.attributes.company;

                var item_p = _.find(pi.dp_position_items, function(x) {
                    return x.position == position_id;
                })

                if (item_p) {
                    return get_select_peoples_data(sii, item_p);
                }

                var item_o = _.find(pi.dp_ou_items, function(x) {
                    return x.ou == ou_id;
                })

                if (item_o) {
                    return get_select_peoples_data(sii, item_o);
                }

                var item_c = _.find(pi.dp_company_items, function(x) {
                    return x.company == company_id;
                })

                if (item_c) {
                    return get_select_peoples_data(sii, item_c);
                }
            }

            function get_select_peoples_data(sii, item) {
                var pls = [];

                //遍历数据提供人
                _.each(item.dp_peoples, function(p) {
                    var obj = {};
                    obj._id = p._id;
                    obj.people_name = p.people_name;
                    pls.push(obj);
                });

                //遍历数据提供职位
                _.each(item.dp_positions, function(x) {
                    var peoples = _.filter(peoples_data, function(p) {
                        return (p.position._id == x.position);
                    });
                    _.each(peoples, function(p) {
                        var obj = {};
                        obj._id = p._id;
                        obj.people_name = p.people_name;
                        pls.push(obj);
                    })
                });

                //遍历数据提供部门，找出部门的负责人
                _.each(item.dp_ous, function(ou) {
                    var p = _.find(peoples_data, function(p) {
                        return (p.ou == ou.ou && p.position.position_manager);
                    });
                    if (p) {
                        var obj = {};
                        obj._id = p._id;
                        obj.people_name = p.people_name;
                        pls.push(obj);
                    }
                });

                return pls;
            }

            function find_sf(pi) {
                var position_id = self.ai.attributes.position;
                var ou_id = self.ai.attributes.ou;
                var company_id = self.ai.attributes.company;

                var item_p = _.find(pi.sf_position_items, function(x) {
                    return x.position == position_id;
                })

                if (item_p) {
                    return item_p.sfs;
                }

                var item_o = _.find(pi.sf_ou_items, function(x) {
                    return x.ou == ou_id;
                })

                if (item_o) {
                    return item_o.sfs;
                }

                var item_c = _.find(pi.sf_company_items, function(x) {
                    return x.company == company_id;
                })

                if (item_c) {
                    return item_c.sfs;
                }

                return [];
            }

            self.$el.on('click', '.do_trans', function(event) {
                var weight1 = self.ai.attributes.quantitative_pis.weight;
                var weight2 = self.ai.attributes.qualitative_pis.weight;
                var weight1_t = self.ai.attributes.quantitative_pis.weight_t;
                var weight2_t = self.ai.attributes.qualitative_pis.weight_t;
                var greater_or_less1 = self.ai.attributes.quantitative_pis.greater_or_less;
                var greater_or_less2 = self.ai.attributes.qualitative_pis.greater_or_less;

                if (greater_or_less1 == 'G') {
                    if (parseFloat(weight1) < parseFloat(weight1_t)) {
                        alert('定量指标必须>=' + weight1_t + '%');
                        return;
                    }
                } else {
                    if (parseFloat(weight1) > parseFloat(weight1_t)) {
                        alert('定量指标必须<=' + weight1_t + '%');
                        return;
                    }
                }

                if (greater_or_less2 == 'G') {
                    if (parseFloat(weight2) < parseFloat(weight2_t)) {
                        alert('定性指标必须>=' + weight2_t + '%');
                        return;
                    }
                } else {
                    if (parseFloat(weight2) > parseFloat(weight2_t)) {
                        alert('定性指标必须<=' + weight2_t + '%');
                        return;
                    }
                }

                if (parseFloat(weight1) + parseFloat(weight2) != 100) {
                    alert('定量指标和定性指标权重之后必须为100%');
                    return;
                }
                if (parseFloat(weight1) + parseFloat(weight2) != 100) {
                    alert('定量指标和定性指标权重之后必须为100%');
                    return;
                }
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

            $("#ai_wf1-content").on('click', '#btn_ok', function(e) {
                if ($("#next_user_name").val()) {
                    $("#btn_ok").attr("disabled", "disabled");

                    do_trans();

                } else {
                    alert('请选择下一任务的处理人');
                };
            })

            $("#btn_ai_wf1_cancel").on('click', function(event) {
                event.preventDefault();

                if (!self.view_mode) {
                    window.location.href = '#todo';
                } else if (self.view_mode == 'ai_pi_comment') {
                    var dl_item = _.find(ai_data.quantitative_pis.items, function(x) {
                        return x.pi == self.item.pi;
                    })
                    if (dl_item) {
                        self.view_mode = 'pi_detail';
                    } else {
                        self.view_mode = 'pi_detail2';
                    }

                    self.render();
                } else {
                    self.view_mode = '';
                    self.render();
                }
            })

            $("#ai_wf1-content").on('click', '#btn_trans_cancel', function(event) {
                event.preventDefault();

                self.view_mode = '';
                self.render();
            })

            $("#ai_wf1-content").on('click', '.dlpi', function() {

                var $this = $(this);
                var pi_id = $this.data('pi_id');

                var item = _.find(self.ai.attributes.quantitative_pis.items, function(x) {
                    return pi_id == x.pi;
                });
                //查找数据提供人
                var pi_f = _.find(pis_data, function(x) {
                    return x._id == item.pi;
                })

                var pls = find_dp_peoples(item, pi_f);

                self.item = item;
                self.item_obj = {};
                self.item_obj.people = self.ai.attributes.people;
                self.item_obj.ai_status = self.ai.attributes.ai_status;
                self.item_obj.pi = item;
                self.item_obj.pls = pls ? pls : [];
                self.item_obj.unit_data = unit_data;
                self.item_obj.unit_groups = unit_groups;
                self.item_obj.sfcs_data = sfcs_data;
                self.item_obj.pi_f = pi_f;
                self.view_mode = 'pi_detail';
                self.render();
            });

            $("#ai_wf1-content").on('click', '.dxpi', function() {

                var $this = $(this);
                var pi_id = $this.data('pi_id');

                var item2 = _.find(self.ai.attributes.qualitative_pis.items, function(x) {
                    return pi_id == x.pi;
                });

                var pi_f = _.find(pis_data, function(x) {
                    return x._id == item2.pi;
                })

                self.item = item2;
                self.item_obj = {};
                self.item_obj.people = self.ai.attributes.people;
                self.item_obj.ai_status = self.ai.attributes.ai_status;
                self.item_obj.pi = item2;
                self.item_obj.unit_data = unit_data;
                self.item_obj.sccs_data = sccs_data;
                self.item_obj.pi_f = pi_f;
                self.view_mode = 'pi_detail2';
                self.render();
            });

            $("#ai_wf1-content").on('click', '.ai_pi_comment', function() {
                var $this = $(this);
                self.view_mode = 'ai_pi_comment';
                self.render();
            });

            $("#ai_wf1-content").on('change', '#ai_pi_new_comment', function() {
                var obj = {};
                obj.comment = $("#ai_pi_new_comment").val();
                obj.createDate = moment();
                var people = _.find(peoples_data, function(x) {
                    return x._id == $("#login_people").val();
                })
                obj.people_name = people.people_name;
                obj.position_name = people.position.position_name;
                obj.creator = people._id;
                obj.avatar = people.avatar;

                self.item.comments.push(obj);
                save_form_data(function() {
                    self.render();
                })
            });

            $("#ai_wf1-content").on('change', '#select_next_user', function() {
                var $this = $(this);

                $("#next_user_id").val($this.val());
                $("#next_user_name").val($this.find("option:selected").text());
            });

            $("#ai_wf1-content").on('click', '#btn_ai1_start_userchat', function(event) {
                event.preventDefault();
                var url = "im://userchat/" + ai_data.people;
                console.log(url);
                window.location.href = url;
            })

            $("#ai_wf1-content").on('click', '.btn_ai_comment', function(event) {
                event.preventDefault();
                var $this = $(this);
                var people_id = $this.data('people_id');
                var url = "im://userchat/" + people_id;
                console.log(url);
                window.location.href = url;
            })

            $("#ai_wf1-content").on('change', '#target_value_dl,#weigth_dl,#target_value_dx,#weigth_dx', function(event) {
                event.preventDefault();
                var $this = $(this);

                if (isNaN($this.val())) {
                    alert('请输入合法的数字!');
                    $this.val('');
                    return;
                }

                var pi;
                if ($this.data('type') == '1') { //定量
                    pi = _.find(self.ai.attributes.quantitative_pis.items, function(x) {
                        return x.pi == $this.data('up_id');
                    })
                } else {
                    pi = _.find(self.ai.attributes.qualitative_pis.items, function(x) {
                        return x.pi == $this.data('up_id');
                    })
                }

                pi[$this.data('target')] = $this.val();
            })

            $("#ai_wf1-content").on('change', '#unit_dl,#unit_dx,#dp_people_dl,#sf_dl', function(event) {
                event.preventDefault();
                var $this = $(this);

                var pi;
                if ($this.data('type') == '1') { //定量
                    pi = _.find(self.ai.attributes.quantitative_pis.items, function(x) {
                        return x.pi == $this.data('up_id');
                    })
                } else {
                    pi = _.find(self.ai.attributes.qualitative_pis.items, function(x) {
                        return x.pi == $this.data('up_id');
                    })
                }

                pi[$this.data('target')] = $this.val();
            })

            $("#ai_wf1-content").on('change', '#sc_dx', function(event) {
                event.preventDefault();
                var $this = $(this);

                var pi = _.find(self.ai.attributes.qualitative_pis.items, function(x) {
                    return x.pi == $this.data('up_id');
                })

                pi.pi_sc_description = $this.val();
                pi.pi_sc_name = $(this[this.options.selectedIndex]).text();
            })

            $("#ai_wf1-content").on('click', '#btn_ai_dl_pi_save', function(event) {
                event.preventDefault();

                if (self.item.target_value == '' || self.item.target_value == null) {
                    alert('请输入目标值!');
                    return;
                }

                if (!self.item.weight) {
                    alert('请输入权重!');
                    return;
                }

                if ($('#unit_dl').val() == '') {
                    alert('请选择单位!');
                    return;
                }

                if ($('#sf_dl').val() == '') {
                    alert('请选择计分公式!');
                    return;
                }

                if ($('#dp_people_dl').val() == '') {
                    alert('请选择数据提供人!');
                    return;
                }

                //计算权重
                self.ai.attributes.quantitative_pis.weight = 0;
                self.ai.attributes.qualitative_pis.weight = 0;
                _.each(self.ai.attributes.quantitative_pis.items, function(x) {
                    self.ai.attributes.quantitative_pis.weight += parseFloat(x.weight);
                });
                _.each(self.ai.attributes.qualitative_pis.items, function(x) {
                    self.ai.attributes.qualitative_pis.weight += parseFloat(x.weight);
                });

                self.ai.save().done(function() {
                    alert('保存成功!');
                    $.mobile.loading("show");
                    self.pre_render();

                    self.view_mode = '';
                    self.render();

                    $.mobile.loading("hide");
                })
            })

            $("#ai_wf1-content").on('click', '#btn_ai_dx_pi_save', function(event) {
                event.preventDefault();

                if (self.item.target_value == '' || self.item.target_value == null) {
                    alert('请输入目标值!');
                    return;
                }

                if (!self.item.weight) {
                    alert('请输入权重!');
                    return;
                }

                if ($('#unit_dx').val() == '') {
                    alert('请选择单位!');
                    return;
                }

                if (self.item.grade_way == 'P') {
                    if ($('#sc_dx').val() == '') {
                        alert('请选择评分标准!');
                        return;
                    }
                }

                //计算权重
                self.ai.attributes.quantitative_pis.weight = 0;
                self.ai.attributes.qualitative_pis.weight = 0;
                _.each(self.ai.attributes.quantitative_pis.items, function(x) {
                    self.ai.attributes.quantitative_pis.weight += parseFloat(x.weight);
                });
                _.each(self.ai.attributes.qualitative_pis.items, function(x) {
                    self.ai.attributes.qualitative_pis.weight += parseFloat(x.weight);
                });

                self.ai.save().done(function() {
                    alert('保存成功!');
                    $.mobile.loading("show");
                    self.pre_render();

                    self.view_mode = '';
                    self.render();

                    $.mobile.loading("hide");
                })
            })

            $("#ai_wf1-content").on('click', '#btn_ai_dl_pi_remove,#btn_ai_dx_pi_remove', function(event) {
                event.preventDefault();
                var $this = $(this);

                if (confirm('确认删除吗？')) {
                    if ($this.data('type') == '1') { //定量
                        var pi = _.find(self.ai.attributes.quantitative_pis.items, function(x) {
                            return x.pi == $this.data('up_id');
                        })
                        self.ai.attributes.quantitative_pis.items.splice(self.ai.attributes.quantitative_pis.items.indexOf(pi), 1);
                    } else {
                        var pi = _.find(self.ai.attributes.qualitative_pis.items, function(x) {
                            return x.pi == $this.data('up_id');
                        })
                        self.ai.attributes.qualitative_pis.items.splice(self.ai.attributes.qualitative_pis.items.indexOf(pi), 1);
                    }

                    //计算权重
                    self.ai.attributes.quantitative_pis.weight = 0;
                    self.ai.attributes.qualitative_pis.weight = 0;
                    _.each(self.ai.attributes.quantitative_pis.items, function(x) {
                        self.ai.attributes.quantitative_pis.weight += parseFloat(x.weight);
                    });
                    _.each(self.ai.attributes.qualitative_pis.items, function(x) {
                        self.ai.attributes.qualitative_pis.weight += parseFloat(x.weight);
                    });

                    self.ai.save().done(function() {
                        alert('删除成功!');
                        self.view_mode = '';
                        self.render();
                    })
                }
            })
        },
        pre_render: function() {
            var self = this;

            $("#ai_wf1-content").html(self.loading_template({
                info_msg: '数据加载中...请稍候'
            }));
            $("#ai_wf1-content").trigger('create');
            return self;
        },
        // Renders all of the Task models on the UI
        render: function() {
            var self = this;

            //克隆others，方便取加减分项
            var others = _.clone(self.ai.attributes.others);
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

            ai = self.ai;
            ai_data = self.ai.attributes;
            peoples_data = self.ai_datas.attributes.peoples;
            unit_data = self.ai_datas.attributes.unit_data;
            pis_data = self.ai_datas.attributes.pis;
            sfcs_data = self.ai_datas.attributes.sfcs;
            sccs_data = self.ai_datas.attributes.sccs;
            ais = self.ai_datas.attributes.ais;

            var obj = {};
            obj.ai = ai_data;
            obj.other1 = other1;
            obj.other2 = other2;
            obj.other3 = other3;
            obj.tts = self.wf_data.attributes.tts;
            obj.td = self.wf_data.attributes.td;
            obj.ti = self.wf_data.attributes.ti;

            obj.pd = self.wf_data.attributes.pd;
            obj.history_tasks = self.wf_data.attributes.history_tasks;
            obj.flowchart_data = self.wf_data.attributes.flowchart_data;
            obj.attachments = self.wf_data.attributes.attachments;
            obj.login_people = $("#login_people").val();

            //设置加减分项数据提供人
            _.each(obj.ai.others, function(o) {
                if (o.item_type != '3') {
                    _.each(o.items, function(oi) {
                        var aitem = _.find(ais, function(xx) {
                            return xx._id.toString() == oi.item.toString();
                        })
                        if (!oi.dp_peoples) {
                            var people;
                            if (aitem.dp_peoples) {
                                people = _.find(peoples_data, function(x) {
                                    return x._id.toString() == aitem.dp_peoples.toString();
                                });
                            } else if (aitem.dp_ous) {
                                people = _.find(peoples_data, function(x) {
                                    return x.ou == aitem.dp_ous && x.position.position_manager;
                                });
                            } else {
                                var pl = _.find(peoples_data, function(x) {
                                    return x._id == ai_data.people;
                                })
                                people = _.find(peoples_data, function(x) {
                                    return x.position == pl.position.position_indirect_superior;
                                });
                            }

                            if (people) {
                                oi.dp_peoples = people._id;
                                oi.dp_people_name = people.people_name;
                            }
                        }
                        oi.ai_score_toplimit = aitem.ai_score_toplimit;
                        oi.ai_description = aitem.ai_description;
                    })
                }
            })

            if (self.view_mode) {
                if (self.view_mode == 'trans') {
                    $("#ai_wf_title").html('数据处理人');

                    this.template = Handlebars.compile($("#trans_confirm_view").html());
                    $("#ai_wf1-content").html(self.template(self.trans_data));
                    $("#ai_wf1-content").trigger('create');

                    if (self.trans_data.next_td.node_type == 'END') {
                        do_trans();
                    }
                } else if (self.view_mode == 'pi_detail') {
                    $("#ai_wf_title").html('指标明细');

                    this.template = Handlebars.compile($("#assessment_dl_pi_detail_view").html());
                    $("#ai_wf1-content").html(self.template(self.item_obj));
                    $("#ai_wf1-content").trigger('create');

                } else if (self.view_mode == 'pi_detail2') {
                    $("#ai_wf_title").html('指标明细');

                    this.template = Handlebars.compile($("#assessment_dx_pi_detail_view").html());
                    $("#ai_wf1-content").html(self.template(self.item_obj));
                    $("#ai_wf1-content").trigger('create');
                } else if (self.view_mode == 'ai_pi_comment') {
                    $("#ai_wf_title").html('沟通记录');

                    this.template = Handlebars.compile($("#pi_comment_view").html());
                    $("#ai_wf1-content").html(self.template(self.item));
                    $("#ai_wf1-content").trigger('create');
                }
            } else {
                //计算权重
                obj.ai.quantitative_pis.weight = 0;
                obj.ai.qualitative_pis.weight = 0;
                _.each(obj.ai.quantitative_pis.items, function(x) {
                    obj.ai.quantitative_pis.weight += parseFloat(x.weight);
                });
                _.each(obj.ai.qualitative_pis.items, function(x) {
                    obj.ai.qualitative_pis.weight += parseFloat(x.weight);
                });

                this.template = Handlebars.compile($("#wf03_view").html());
                $("#ai_wf1-content").html(self.template(obj));
                $("#ai_wf1-content").trigger('create');
            }

            //对自己不显示发起聊天的按钮
            if ($("#login_people").val() == ai_data.people) {
                $("#ai_wf-content").find('#btn_ai1_start_userchat').hide();
            };

            return self;
        }
    });

    // Returns the View class
    return AIWF03View;
});