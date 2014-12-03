// 绩效计划 View
// =============

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "async"], function($, _, Backbone, Handlebars, async) {
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

            function find_sc(pi) {
                var position_id = self.ai.attributes.position;
                var ou_id = self.ai.attributes.ou;
                var company_id = self.ai.attributes.company;

                var item_p = _.find(pi.sc_position_items, function(x) {
                    return x.position == position_id;
                })

                if (item_p) {
                    return item_p.scs;
                }

                var item_o = _.find(pi.sc_ou_items, function(x) {
                    return x.ou == ou_id;
                })

                if (item_o) {
                    return item_o.scs;
                }

                var item_c = _.find(pi.sc_company_items, function(x) {
                    return x.company == company_id;
                })

                if (item_c) {
                    return item_c.scs;
                }

                return [];
            }

            function find_pg(pi) {
                var position_id = self.ai.attributes.position;
                var ou_id = self.ai.attributes.ou;
                var company_id = self.ai.attributes.company;

                var item_p = _.find(pi.pg_position_items, function(x) {
                    return x.position == position_id;
                })

                if (item_p) {
                    return item_p.pgs;
                }

                var item_o = _.find(pi.pg_ou_items, function(x) {
                    return x.ou == ou_id;
                })

                if (item_o) {
                    return item_o.pgs;
                }

                var item_c = _.find(pi.pg_company_items, function(x) {
                    return x.company == company_id;
                })

                if (item_c) {
                    return item_c.pgs;
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

                var bool = false;
                _.each(self.ai.attributes.quantitative_pis.items, function(x) {
                    if (!x.weight) {
                        bool = true;
                    }
                })
                if (bool) {
                    alert('定量指标项中权重不能为0,请编辑或者删除后重试!');
                    return;
                }
                _.each(self.ai.attributes.qualitative_pis.items, function(x) {
                    if (!x.weight) {
                        bool = true;
                    }
                })
                if (bool) {
                    alert('定性指标项中权重不能为0,请编辑或者删除后重试!');
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
                } else if (self.view_mode == 'ai_pi_comment' || self.view_mode == 'ai_pi_sub') {
                    var dl_item = _.find(ai_data.quantitative_pis.items, function(x) {
                        return x.pi == self.item.pi;
                    })
                    if (dl_item) {
                        self.view_mode = 'pi_detail';
                    } else {
                        self.view_mode = 'pi_detail2';
                    }

                    self.render();
                } else if (self.view_mode == 'sub_pi_detail') {
                    self.view_mode = 'ai_pi_sub';
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

                var sfcs = [];
                var sfs = find_sf(pi_f);
                var sf_ids = [];
                _.each(sfs, function(x) {
                    sf_ids.push(x.sf);
                })
                _.each(sfcs_data, function(x) {
                    if (x._id.indexOf(sf_ids) != -1) {
                        sfcs.push(x);
                    }
                })

                self.item = item;
                self.item_obj = {};
                self.item_obj.people = self.ai.attributes.people;
                self.item_obj.ai_status = self.ai.attributes.ai_status;
                self.item_obj.pi = item;
                self.item_obj.pls = pls ? pls : [];
                self.item_obj.unit_data = unit_data;
                self.item_obj.unit_groups = unit_groups;
                // self.item_obj.sfcs_data = sfcs_data;//全部
                self.item_obj.sfcs_data = sfcs; //个人适用
                self.item_obj.pi_f = pi_f;
                self.item_obj.aiSubCollection = self.aiSubCollection.models;
                self.view_mode = 'pi_detail';
                self.pi_type = '1';
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

                var sccs = find_sc(pi_f);

                self.item = item2;
                self.item_obj = {};
                self.item_obj.people = self.ai.attributes.people;
                self.item_obj.ai_status = self.ai.attributes.ai_status;
                self.item_obj.pi = item2;
                self.item_obj.unit_data = unit_data;
                // self.item_obj.sccs_data = sccs_data;
                self.item_obj.sccs_data = sccs;
                self.item_obj.pi_f = pi_f;
                self.item_obj.aiSubCollection = self.aiSubCollection.models;
                self.view_mode = 'pi_detail2';
                self.pi_type = '2';
                self.render();
            });
            //向下分解
            $("#ai_wf1-content").on('click', '.add_pi2sub', function() {
                var $this = $(this);

                self.view_mode = 'ai_pi_sub';
                self.render();
            });
            $("#ai_wf1-content").on('change', '.ai_sub', function(e) {
                var $this = $(this);
                var up_id = $this.data('up_id');
                if ($("#" + up_id).attr("data-cacheval") == "true") {
                    $("#div_" + up_id).attr('style', 'display:none');
                } else {
                    $("#div_" + up_id).attr('style', 'display:block');
                }
            });

            $("#ai_wf1-content").on('click', '.ai_pi_comment', function() {
                self.view_mode = 'ai_pi_comment';

                self.render();
            });

            $("#ai_wf1-content").on('click', '.sub_pi_detail', function() {
                var $this = $(this);
                var up_id = $this.data('up_id');

                self.ai_sub = _.find(self.aiSubCollection.models, function(x) {
                    return x.attributes._id == up_id;
                })

                self.view_mode = 'sub_pi_detail';
                self.render();
            });

            $("#ai_wf1-content").on('click', '#btn_add_my_pi2sub', function() {
                var ids = [];
                _.each($('.sub_chk:checked'), function(x) {
                    ids.push($(x).data('up_id'));
                })
                if (ids.length) {
                    async.times(ids.length, function(n, next) {
                        var ai_id = ids[n];
                        var ai_sub = _.find(self.aiSubCollection.models, function(x) {
                            return x.attributes._id == ai_id;
                        })

                        var item = self.item;

                        //检查被分解的对象是否已经有了这个条目
                        var found1 = _.find(ai_sub.attributes.quantitative_pis.items, function(x) {
                            return x.pi == item.pi;
                        });
                        var found2 = _.find(ai_sub.attributes.qualitative_pis.items, function(x) {
                            return x.pi == item.pi;
                        });

                        var pi_f = _.find(pis_data, function(x) {
                            return x._id == item.pi;
                        });

                        if (!found1 && !found2) { //不存在，就添加这个条目
                            var bd_item = {
                                pi: item.pi,
                                pi_source: '2',
                                target_value: $('#target_value_' + ai_id).val(),
                                weight: $('#weight_' + ai_id).val(),
                                unit: $('#unit_' + ai_id).val(),
                                pi_name: item.pi_name ? item.pi_name : '',
                            };

                            if (!!item.ol) {
                                bd_item.ol = item.ol;
                                bd_item.ol_name = item.ol_name;
                            }

                            if (self.pi_type == '1') { //定量
                                //自己是否有配置计分公式
                                var sfs = find_sf(pi_f);
                                if (sfs.length == 1) {
                                    bd_item.scoringformula = sfs[0].sf;
                                } else {
                                    bd_item.scoringformula = item.scoringformula ? item.scoringformula : null;
                                }

                                //自己是否配有数据提供人
                                var pls = find_dp_peoples(item, pi_f);
                                if (pls.length == 1) {
                                    bd_item.dp_people = pls[0]._id;
                                } else {
                                    bd_item.dp_people = item.dp_people ? item.dp_people : null;
                                }

                                ai_sub.attributes.quantitative_pis.items.push(bd_item);
                            } else {
                                //自己是否有配置评分标准
                                var scs = find_sc(pi_f);
                                if (scs.length == 1) {
                                    bd_item.pi_sc_name = scs[0].sc_name;
                                    bd_item.pi_sc_description = scs[0].sc_description;
                                } else {
                                    bd_item.pi_sc_name = item.pi_sc_name ? item.pi_sc_name : '';
                                    bd_item.pi_sc_description = item.pi_sc_description ? item.pi_sc_description : '';
                                }

                                bd_item.grade_way = ai_sub.attributes.qualitative_pis.grade_way ? ai_sub.attributes.qualitative_pis.grade_way : '';

                                //自己是否配置了等级组
                                if (ai_sub.attributes.qualitative_pis.grade_way == 'G') {
                                    var pgs = find_pg(pi_f);
                                    //如果指标上配置了，指标优先
                                    if (pgs.length == 1) {
                                        bd_item.grade_group = pgs[0].grade_group;
                                    } else {
                                        bd_item.grade_group = self.ai.attributes.qualitative_pis.grade_group ? self.ai.attributes.qualitative_pis.grade_group : null;
                                    }
                                }

                                bd_item.self_weight = ai_sub.attributes.qualitative_pis.self_weight;
                                bd_item.indirect_weight = ai_sub.attributes.qualitative_pis.indirect_weight;
                                bd_item.superior_weight = ai_sub.attributes.qualitative_pis.superior_weight;
                                bd_item.superior_superior_weight = ai_sub.attributes.qualitative_pis.superior_superior_weight;
                                bd_item.other_weight = ai_sub.attributes.qualitative_pis.other_weight;

                                ai_sub.attributes.qualitative_pis.items.push(bd_item);
                            }
                        } else {
                            // if (confirm(ai_sub.attributes.people_name + '已经存在分解项，是否强行覆盖？')) {
                            my_confirm(ai_sub.attributes.people_name + '已经存在分解项，是否强行覆盖？', null, function() {
                                if (self.pi_type == '1') { //定量
                                    if (found1.pi_source == '3' || found1.pi_source == '4') {
                                        alert("指标来源为【公司】,不能覆盖!");
                                    } else {
                                        found1.pi_source = '2';

                                        //下级是否有配置计分公式
                                        var sfs = find_sf(pi_f);
                                        if (sfs.length == 1) {
                                            found1.scoringformula = sfs[0].sf;
                                        } else {
                                            found1.scoringformula = item.scoringformula ? item.scoringformula : null;
                                        }

                                        //自己是否配有数据提供人
                                        var pls = find_dp_peoples(item, pi_f);
                                        if (pls.length == 1) {
                                            found1.dp_people = pls[0]._id;
                                        } else {
                                            found1.dp_people = item.dp_people ? item.dp_people : null;
                                        }

                                        found1.target_value = $('#target_value_' + ai_id).val();
                                        found1.weight = $('#weight_' + ai_id).val();
                                        found1.unit = $('#unit_' + ai_id).val();
                                    }
                                } else {
                                    if (found2.pi_source == '3' || found2.pi_source == '4') {
                                        alert("指标来源为【公司】,不能覆盖!");
                                    } else {
                                        found2.pi_source = '2';
                                        found2.target_value = $('#target_value_' + ai_id).val();
                                        found2.weight = $('#weight_' + ai_id).val();
                                        found2.unit = $('#unit_' + ai_id).val();

                                        found2.grade_way = item.grade_way;

                                        var scs = find_sc(pi_f);
                                        if (scs.length == 1) {
                                            found2.pi_sc_name = scs[0].sc_name;
                                            found2.pi_sc_description = scs[0].sc_description;
                                        } else {
                                            found2.pi_sc_name = item.pi_sc_name ? item.pi_sc_name : '';
                                            found2.pi_sc_description = item.pi_sc_description ? item.pi_sc_description : '';
                                        }

                                        if (ai_sub.attributes.qualitative_pis.grade_way == 'G') {
                                            //下级是否配置了等级组
                                            var pgs = find_pg(pi_f);
                                            //如果指标上配置了，指标优先
                                            if (pgs.length == 1) {
                                                found2.grade_group = pgs[0].grade_group;
                                            } else {
                                                found2.grade_group = self.ai.attributes.qualitative_pis.grade_group ? self.ai.attributes.qualitative_pis.grade_group : null;
                                            }
                                        }
                                    }
                                }
                            });
                        }
                        ai_sub.url = '/admin/pm/assessment_instance/bb2_4m2/' + ai_id;
                        ai_sub.save().done(next);
                    }, function(err, ret) {
                        // alert('保存成功!');
                        $('#btn_ai_wf1_cancel').trigger('click');
                    })
                } else {
                    alert('请选择要分解的下级数据!');
                }
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
                var target = $this.data('target');

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

                var target_change = false;
                //如果是修改上级分解过来的目标值，则记录到沟通里
                if (pi.pi_source == '2' && target == 'target_value') {
                    //值改变了才发
                    if (pi[target] && (pi[target].toString() != $this.val())) {
                        var comment = {};
                        comment.comment = '我把目标值由【' + pi[target] + '】改为了【' + $this.val() + '】';
                        comment.creator = ai_data.people;
                        comment.createDate = moment();
                        pi.comments.push(comment);

                        target_change = true;
                    }
                }

                pi[target] = parseFloat($this.val());

                if (target_change) {
                    self.render();
                }
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

                // if (confirm('确认删除吗？')) {
                my_confirm("确认删除吗？", null, function() {
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
                        setTimeout(function() {
                            alert('删除成功!');
                            self.view_mode = '';
                            self.render();
                        }, 1000);
                    })
                })
            })

            $("#ai_wf1-footer").on('click', '#btn-ai_wf1-prev', function(event) {
                event.preventDefault();
                window.location.href = '#prev_ai';
            })

            $("#ai_wf1-footer").on('click', '#btn-ai_wf1-super', function(event) {
                event.preventDefault();
                window.location.href = '#super_ai';
            })

            $("#ai_wf1-footer").on('click', '#btn-ai_wf1-pis_select', function(event) {
                event.preventDefault();
                window.location.href = '#pis_select';
            })

            $("#ai_wf1-footer").on('click', '#btn-ai_wf1-create_pi', function(event) {
                event.preventDefault();
                window.location.href = '#create_pi';
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
            if (self.ai_prev.attributes.quantitative_pis || self.ai_prev.attributes.qualitative_pis) {
                obj.ai_prev = self.ai_prev.attributes;
            }
            if (self.ai_super.attributes.quantitative_pis || self.ai_super.attributes.qualitative_pis) {
                obj.ai_super = self.ai_super.attributes;
            }
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

                    //查看界面
                    if (self.mode) {
                        this.template = Handlebars.compile($("#assessment_dl_pi_detail_view2").html());
                    } else {
                        this.template = Handlebars.compile($("#assessment_dl_pi_detail_view").html());
                    }
                    $("#ai_wf1-content").html(self.template(self.item_obj));
                    $("#ai_wf1-content").trigger('create');

                } else if (self.view_mode == 'pi_detail2') {
                    $("#ai_wf_title").html('指标明细');

                    //查看界面
                    if (self.mode) {
                        this.template = Handlebars.compile($("#assessment_dx_pi_detail_view2").html());
                    } else {
                        this.template = Handlebars.compile($("#assessment_dx_pi_detail_view").html());
                    }

                    $("#ai_wf1-content").html(self.template(self.item_obj));
                    $("#ai_wf1-content").trigger('create');
                } else if (self.view_mode == 'ai_pi_comment') {
                    $("#ai_wf_title").html('沟通记录');

                    this.template = Handlebars.compile($("#pi_comment_view").html());
                    $("#ai_wf1-content").html(self.template(self.item));
                    $("#ai_wf1-content").trigger('create');
                } else if (self.view_mode == 'ai_pi_sub') {
                    $("#ai_wf_title").html('向下级分解');
                    this.template = Handlebars.compile($("#ai_sub_view").html());
                    var rendered_data = {
                        sub_ais: []
                    };
                    _.each(self.aiSubCollection.models, function(x) {
                        rendered_data.sub_ais.push(x.attributes);
                    })

                    rendered_data.pi = self.item;
                    rendered_data.unit_data = self.ai_datas.attributes.unit_data;

                    $("#ai_wf1-content").html(self.template(rendered_data));
                    $("#ai_wf1-content").trigger('create');
                } else if (self.view_mode == 'sub_pi_detail') {

                    this.template = Handlebars.compile($("#sub_pi_detail_view").html());

                    $("#ai_wf1-content").html(self.template(self.ai_sub.attributes));
                    $("#ai_wf1-content").trigger('create');
                }

                $("#ai_wf1-footer").hide();
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
                //查看界面
                if (self.mode) {
                    obj.mode = 'view';
                }

                this.template = Handlebars.compile($("#wf03_view").html());
                $("#ai_wf1-content").html(self.template(obj));
                $("#ai_wf1-content").trigger('create');

                if (($("#login_people").val() == self.ai.attributes.people.toString()) && !self.mode) {
                    $("#ai_wf1-footer").show();
                } else {
                    $("#ai_wf1-footer").hide();
                }
            }

            //对自己不显示发起聊天的按钮或者是查看界面
            if ($("#login_people").val() == ai_data.people) {
                $("#ai_wf-content").find('#btn_ai1_start_userchat').hide();
            };

            return self;
        }
    });

    // Returns the View class
    return AIWF03View;
});