// 绩效评估 View
// =============

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "async"], function($, _, Backbone, Handlebars, async) {
    var ai;
    var ai_data;
    var uu;
    var conver;
    var pscs_data;
    var tasks = [];
    var projects = [];

    // 记分公式 －》 开始
    var scoring_func = function(formula, x, r1, r2) {
        var dt = formula.data_table; //准备数值表的数据

        var ss = formula.subsection; //准备分段函数的数据

        ss = _.sortBy(ss, function(s) {
            return s.r1
        }); //按照区间从小到大排序
        // x：实际值，
        // 第一步
        if (formula.sf_type == '0') {
            x = F_0(x);
        } else if (formula.sf_type == 'A01') {
            x = F_A01(x, r1);
        } else if (formula.sf_type == 'A02') {
            x = F_A02(x, r1, r2, formula.max);
        } else if (formula.sf_type == 'A03') {
            x = F_A03(x, r1);
        } else if (formula.sf_type == 'B01') {
            x = F_B01(x, r1);
        } else if (formula.sf_type == 'B02') {
            x = F_B02(x, r1);
        } else if (formula.sf_type == 'B03') {
            x = F_B03(x, r1, r2, formula.max);
        } else if (formula.sf_type == 'B04') {
            x = F_B04(x, r1);
        };
        x = x * formula.magnification; //放大倍率
        // console.log(x);
        // 第二步
        if (formula.s_method == 'T') { //数值表
            var T = _.find(dt, function(t) {
                return (t.x == x);
            });
            // console.log(T);
            x = (T) ? T.y : null;
        } else if (formula.s_method == 'S') { //线性分段
            x = F2(x, ss);
        };
        // 第三步
        // base_score:最低分 caps_score:最高分 score_to_zero:低于归0

        return F3(x, formula.base_score, formula.caps_score, formula.score_to_zero);
    }

    // 第一步函数，设：
    // x：实际值，a：目标值（下限），b：目标值（上限），c：封顶分
    var F_0 = function(x) {
        return x;
    };
    var F_A01 = function(x, a) {
        return x / a * 100;
    };
    var F_A02 = function(x, a, b, c) {
        return c / (b - a) * (x - a);
    };
    var F_A03 = function(x, a) {
        return x - a;
    };
    var F_B01 = function(x, a) {
        return a / x * 100;
    };
    var F_B02 = function(x, a) {
        return ((a - x) / a + 1) * 100;
    };
    var F_B03 = function(x, a, b, c) {
        return c / (a - b) * (a - x);
    };
    var F_B04 = function(x, a) {
        return a - x;
    };

    // 第二步函数，
    var F2 = function(x, ss) {
        var s = _.find(ss, function(s) {
                return (x >= s.r1 && x < s.r2);
            })
            // console.log(s);
        if (s) { //找到所对应的区间
            if (s.ftype == 'F') {
                x = F2_F(x, s.fbody);
            } else if (s.ftype == 'L') {
                x = F2_L(x, s.fbody);
            };
        };
        return x;
    }

    var F2_L = function(x, fbody) { //线性函数
        return fbody.a * x + fbody.b;
    };
    var F2_F = function(x, fbody) { //固定值
        return fbody.y;
    };
    var F2_T = function(x, fbody) { //数值表
        var T = _.find(fbody, function(t) {
            return (t.x == x);
        });
        // console.log(T);
        return (T) ? T.y : null;
    };

    // 第三步函数
    var F3 = function(x, min, max, zero) { //判断上下限限制以及低于zero后归0
        x = parseFloat(x);
        min = parseFloat(min);

        if (_.isNumber(x) && !_.isNaN(x)) {
            x = (!_.isNumber(min) && x <= min) ? min : x;
            if (max != null && x >= max) { //为null就是不控制
                x = max;
            };
            if (zero != null && x < zero) { //为null就是不控制
                x = 0;
            };
        };
        return x;
    };

    // 记分公式 《－ 结束

    //重置各分类分数
    function reset_score_view() {
        ai_data.ai_score = 0;
        ai_data.ai_score += ai_data.quantitative_pis.sum_score;
        ai_data.ai_score += ai_data.qualitative_pis.sum_score;
        // ai_data.ai_score += ai_data.questionnairs.score;

        _.each(ai_data.others, function(o) {
            if (o.item_type == '3' && o.score == 1) {
                ai_data.ai_score = 0;
                return;
            }
            if (o.item_type == '1') {
                ai_data.ai_score += o.score;
            } else if (o.item_type == '2') {
                ai_data.ai_score = ai_data.ai_score - o.score;
            }

        })

        //重置总分,根据分制
        var ai_score_str = "得分:" + changeTwoDecimal(parseFloat(ai_data.ai_score / conver).toFixed(2));
        $("#ai_score").html(ai_score_str);
        //重置定量指标总分
        var score1_str = changeTwoDecimal(parseFloat(ai_data.quantitative_pis.sum_score / conver).toFixed(2));
        $("#score1").html(score1_str + '分)');
        //重置定性指标总分
        var score2_str = changeTwoDecimal(parseFloat(ai_data.qualitative_pis.sum_score / conver).toFixed(2));
        $("#score2").html(score2_str + '分)');
        //绩效等级
        var grade = '无对应等级';
        var psc = _.find(pscs_data, function(psc) {
            return psc._id == ai_data.points_system._id;
        });
        if (psc) {
            _.each(psc.grades, function(x) {
                if (parseFloat(ai_data.ai_score / conver) >= x.grade_low_value && parseFloat(ai_data.ai_score / conver) <= x.grade_high_value) {
                    grade = x.grade_name;
                    _.each(x.integrals, function(xx) {
                        if (xx.period_type == ai_data.period_type) {
                            ai_data.integral = xx.score;
                        }
                    });
                }
            });
        }
        ai_data.ai_grade = grade;
        $("#ai_grade").html("等级:" + grade);
    }

    function changeTwoDecimal(x) {
        var f_x = parseFloat(x);
        if (isNaN(f_x)) {
            return false;
        }
        var f_x = Math.round(x * 100) / 100;

        return f_x;
    }

    function reset_qualitative_pis_weight() {
        var superior_superior; //上上级
        var superior; //上级
        var indirect_superior; //间接上级

        //上上级
        if (!!ai_data.qualitative_pis.superior_superior_weight) {
            //判断是否上上级
            var superior;
            if (uu.length) {
                superior = _.find(peoples_data, function(p) {
                    return p._id == uu[0]._id;
                })
            }

            if (!!superior) {
                superior_superior = _.find(peoples_data, function(p) {
                    return p.position && p.position._id == superior.position.position_indirect_superior;
                })
                if (!superior_superior) {
                    superior_superior = _.find(peoples_data, function(p) {
                        return p.parttime_positions.indexOf(superior.position.position_indirect_superior) != -1;
                    })
                }
            }
        }
        //上级
        if (!!ai_data.qualitative_pis.superior_weight) {
            if (typeof(uu) != 'string') {
                superior = uu[0];
            }
        }
        //间接上级
        if (!!ai_data.qualitative_pis.indirect_weight) {
            //判断是否有间接上级
            var ai_people = _.find(peoples_data, function(p) {
                return p._id == ai_data.people;
            })
            indirect_superior = _.find(peoples_data, function(p) {
                return p.position && p.position._id == ai_people.position.position_indirect_superior;
            })
            if (!indirect_superior) {
                indirect_superior = _.find(peoples_data, function(p) {
                    return p.parttime_positions.indexOf(ai_people.position.position_indirect_superior) != -1;
                })
            }
        }

        _.each(ai_data.qualitative_pis.items, function(item) {
            if (!superior_superior) {
                item.superior_weight += item.superior_superior_weight;
                item.superior_superior_weight = 0;
                if (!superior) {
                    item.indirect_weight += item.superior_weight;
                    item.superior_weight = 0;
                }
                if (!indirect_superior) {
                    item.self_weight += item.indirect_weight;
                    item.indirect_weight = 0;
                }
            }
        })

    }
    //计算指标得分
    function item_score(pi) {
        ai_data.qualitative_pis.sum_score = ai_data.qualitative_pis.sum_score - pi.score;
        pi.score = 0;
        pi.score += changeTwoDecimal(pi.self_final_score);
        pi.score += changeTwoDecimal(pi.indirect_final_score);
        pi.score += changeTwoDecimal(pi.superior_final_score);
        pi.score += changeTwoDecimal(pi.superior_superior_final_score);
        pi.score += changeTwoDecimal(pi.other_final_score);
        //指标计分
        pi.f_score = pi.score;
        pi.score = changeTwoDecimal(pi.f_score * pi.weight / 100);
        ai_data.qualitative_pis.sum_score += pi.score;
    }
    //保存绩效实例
    function save_form_data(cb) {
        var ai_data_c = _.clone(ai_data);
        // _.each(ai_data_c.qualitative_pis.items,function(x){
        //     var i = _.find(ai_data.qualitative_pis.items,function(xx){
        //         return _.isEqual(x._id, xx._id);
        //     });
        //     x = _.clone(i);
        // });

        var ai_id = ai_data_c._id;
        //id删掉做修改
        delete ai_data_c._id;
        //保存时，把poulate后的重置为id保存
        ai_data_c.points_system = !!ai_data_c.points_system._id ? ai_data_c.points_system._id : ai_data_c.points_system;

        if (ai_data_c.qualitative_pis.grade_way == 'G') {
            _.each(ai_data_c.qualitative_pis.items, function(x) {
                x.grade_group = !!x.grade_group._id ? x.grade_group._id : x.grade_group;
            });
        }

        _.each(ai_data_c.quantitative_pis.items, function(x) {
            x.scoringformula = !!x.scoringformula._id ? x.scoringformula._id : x.scoringformula;
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

    function test_in(key, val, coll) {
        var flag = false;
        for (var i = 0; i < coll.length; i++) {
            flag = coll[i][key] == val;
            if (flag) {
                break;
            }
        };
        return flag;
    }

    function get_roles(a, b, c) { //判断当前登录用户的角色
        var ret = [0, 0, 0]; //创建人， 成员， 观察员
        var login_people = $("#login_people").val()
        if (login_people == a._id) {
            ret[0] = 1;
        };
        if (test_in('_id', login_people, b)) {
            ret[1] = 1;
        };
        if (test_in('_id', login_people, c)) {
            ret[2] = 1;
        };
        return ret;
    }

    function show_state(end, isfinished) {
        if (isfinished) {
            return '完成';
        } else {
            if (!end) {
                return '未设置结束日期';
            } else if (moment(end).endOf('day').toDate() >= new Date()) {
                return '正常';
            } else {
                return '超时';
            };
        };
    }

    function show_state2(end, status) {
        if (status == 'C') {
            return '完成';
        } else if (moment(end).endOf('day').toDate() >= new Date()) {
            return '正常';
        } else {
            return '超时';
        };
    }

    // var get_tasks = function(ai_id, pi_id, cb) {
    //     //取协作任务
    //     $.get("/admin/pm/get_coll_task", {
    //         ai_id: ai_id,
    //         pi_id: pi_id
    //     }, function(data) {
    //         if (data.msg.length > 0) {
    //             _.each(data.msg, function(temp) {
    //                 var task = {};
    //                 var roles = get_roles(temp.creator, temp.tms, temp.ntms);
    //                 var ret = [];
    //                 if (roles[0]) {
    //                     ret.push('创建人,');
    //                 };
    //                 if (roles[1]) {
    //                     ret.push('成员,');
    //                 };
    //                 if (roles[2]) {
    //                     ret.push('观察员,');
    //                 };
    //                 task._id = temp._id;
    //                 task.role = ret.join('');
    //                 task.task_name = temp.task_name;
    //                 task.comments_num = temp.comments.length;
    //                 task.attachments_num = temp.attachments.length;
    //                 task.end_time = moment(temp.end).format('YYYY-MM-DD');
    //                 task.avatar = temp.th.avatar;
    //                 task.people_name = temp.th.people_name;
    //                 task.update_time = moment(temp.lastModified).fromNow();
    //                 task.state = show_state(temp.end, temp.isfinished);
    //                 task.score = temp.score;

    //                 tasks.push(task);
    //             })
    //         }
    //         cb();
    //     })
    // }

    // var get_projects = function(ai_id, pi_id, cb) {
    //     //取协作项目
    //     $.get("/admin/pm/get_coll_project", {
    //         ai_id: ai_id,
    //         pi_id: pi_id
    //     }, function(data) {
    //         if (data.msg.length > 0) {
    //             _.each(data.msg, function(temp) {
    //                 var project = {};
    //                 var roles = get_roles(temp.creator, temp.pms, temp.npms);
    //                 var ret = [];
    //                 if (roles[0]) {
    //                     ret.push('创建人');
    //                 };
    //                 if (roles[1]) {
    //                     ret.push('成员');
    //                 };
    //                 if (roles[2]) {
    //                     ret.push('观察员');
    //                 };
    //                 project._id = temp._id;
    //                 project.role = ret.join('');
    //                 project.project_name = temp.project_name;
    //                 project.comments_num = temp.task_count ? temp.task_count : 0;
    //                 project.attachments_num = temp.attachments.length;
    //                 project.end_time = moment(temp.end).format('YYYY-MM-DD');
    //                 project.avatar = temp.pm.avatar;
    //                 project.people_name = temp.pm.people_name;
    //                 project.update_time = moment(temp.lastModified).fromNow();
    //                 project.state = show_state2(temp.end, temp.status);
    //                 project.score = temp.score;

    //                 projects.push(project);
    //             })
    //         }
    //         cb();
    //     })
    // }

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

    var AIWF01View = Backbone.View.extend({
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

            $("#ai_wf-content").on('click', '#btn_ok', function(e) {
                if ($("#next_user_name").val()) {
                    $("#btn_ok").attr("disabled", "disabled");

                    do_trans();

                } else {
                    alert('请选择下一任务的处理人');
                };
            })

            $("#btn_ai_wf_cancel").on('click', function(event) {
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

            $("#ai_wf-content").on('click', '#btn_trans_cancel', function(event) {
                event.preventDefault();

                self.view_mode = '';
                self.render();
            })

            $("#ai_wf-content").on('click', '.dlpi', function() {
                localStorage.setItem('colltask_detail_back_url', window.location.href);
                localStorage.setItem('collproject_detail_back_url', window.location.href);
                var $this = $(this);
                var pi_id = $this.data('pi_id');

                var item = _.find(self.ai.attributes.quantitative_pis.items, function(x) {
                    return pi_id == x.pi;
                });

                tasks.length = 0;
                projects.length = 0;
                // get_tasks(self.ai.attributes._id, pi_id, function() {
                //     get_projects(self.ai.attributes._id, pi_id, function() {
                //         self.item = item;
                //         self.item_obj = {};
                //         self.item_obj.ai_status = self.ai.attributes.ai_status;
                //         self.item_obj.pi = item;
                //         self.item_obj.tasks = tasks;
                //         self.item_obj.projects = projects;
                //         self.view_mode = 'pi_detail';
                //         self.render();
                //     });
                // });
                self.item = item;
                self.item_obj = {};
                self.item_obj.ai_status = self.ai.attributes.ai_status;
                self.item_obj.pi = item;
                self.view_mode = 'pi_detail';
                self.render();
            });

            $("#ai_wf-content").on('click', '.dxpi', function() {
                localStorage.setItem('colltask_detail_back_url', window.location.href);
                localStorage.setItem('collproject_detail_back_url', window.location.href);
                var $this = $(this);
                var pi_id = $this.data('pi_id');

                var item2 = _.find(self.ai.attributes.qualitative_pis.items, function(x) {
                    return pi_id == x.pi;
                });

                tasks.length = 0;
                projects.length = 0;
                // async.parallel({
                //     tasks: function(cb) {
                //         get_tasks(self.ai.attributes._id, pi_id, cb);
                //     },
                //     projects: function(cb) {
                //         get_projects(self.ai.attributes._id, pi_id, cb);
                //     },
                // }, function(err, ret) {
                //     self.item = item2;
                //     self.item_obj = {};
                //     self.item_obj.ai_status = self.ai.attributes.ai_status;
                //     self.item_obj.pi = item2;
                //     self.item_obj.tasks = tasks;
                //     self.item_obj.projects = projects;
                //     self.view_mode = 'pi_detail2';
                //     self.render();
                // });
                // get_tasks(self.ai.attributes._id, pi_id, function() {
                //     get_projects(self.ai.attributes._id, pi_id, function() {
                //         self.item = item2;
                //         self.item_obj = {};
                //         self.item_obj.ai_status = self.ai.attributes.ai_status;
                //         self.item_obj.pi = item2;
                //         self.item_obj.tasks = tasks;
                //         self.item_obj.projects = projects;
                //         self.view_mode = 'pi_detail2';
                //         self.render();
                //     });
                // });

                self.item = item2;
                self.item_obj = {};
                self.item_obj.ai_status = self.ai.attributes.ai_status;
                self.item_obj.pi = item2;
                self.view_mode = 'pi_detail2';
                self.render();
            });

            $("#ai_wf-content").on('change', '#self,#indirect,#superior,#superior_superior', function() {
                $this = $(this);
                var pi_id = $this.data('up_id');
                var type = $this.data('type');
                var item = _.find(ai_data.qualitative_pis.items, function(x) {
                    return x.pi == pi_id;
                });
                item[type + '_score'] = parseFloat($this.val());
                item[type + '_final_score'] = parseFloat(item[type + '_score'] * item[type + '_weight'] / 100);
                //重新计算指标得分
                item_score(item);
                self.render();
            })

            $("#ai_wf-content").on('click', '.ai_pi_comment', function() {
                var $this = $(this);
                // var pi_id = $this.data('pi_id');
                // var type = $this.data('type');

                // if(type == 'dl'){
                //     self.item_comment = item;
                // }else{
                //     self.item_comment = item2;
                // }
                self.view_mode = 'ai_pi_comment';
                self.render();
            });

            $("#ai_wf-content").on('change', '#ai_pi_new_comment', function() {
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

            $("#ai_wf-content").on('change', '#select_next_user', function() {
                var $this = $(this);

                $("#next_user_id").val($this.val());
                $("#next_user_name").val($this.find("option:selected").text());
            });

            $("#ai_wf-content").on('click', '#btn_ai2_start_userchat', function(event) {
                event.preventDefault();
                var url = "im://userchat/" + ai_data.people;
                console.log(url);
                window.location.href = url;
            })

            $("#ai_wf-content").on('click', '.btn_ai_comment', function(event) {
                event.preventDefault();
                var $this = $(this);
                var people_id = $this.data('people_id');
                var url = "im://userchat/" + people_id;
                console.log(url);
                window.location.href = url;
            })
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
            uu = self.team_data.attributes.data.u;
            conver = ai_data.points_system.conversion_centesimal_system;
            pscs_data = self.ai_datas.attributes.pscs;
            peoples_data = self.ai_datas.attributes.peoples;

            //当事人编辑绩效合同时，算分
            if (ai_data.ai_status == '7') {
                ai_data.quantitative_pis.sum_score = 0;
                _.each(ai_data.quantitative_pis.items, function(x) {
                    //记分
                    x.f_score = Math.round(scoring_func(x.scoringformula, parseFloat(x.actual_value), parseFloat(x.target_value)) * 100) / 100;
                    // 得分
                    x.score = Math.round(x.f_score * x.weight) / 100;
                    //定量指标得分之和
                    ai_data.quantitative_pis.sum_score += x.score;
                });
                //定性指标
                _.each(ai_data.qualitative_pis.items, function(pi) {
                    ai_data.qualitative_pis.sum_score = ai_data.qualitative_pis.sum_score - pi.score;
                    pi.score = 0;
                    pi.score += changeTwoDecimal(pi.self_final_score);
                    pi.score += changeTwoDecimal(pi.indirect_final_score);
                    pi.score += changeTwoDecimal(pi.superior_final_score);
                    pi.score += changeTwoDecimal(pi.superior_superior_final_score);
                    pi.score += changeTwoDecimal(pi.other_final_score);
                    //指标计分
                    pi.f_score = pi.score;
                    pi.score = changeTwoDecimal(pi.f_score * pi.weight / 100);
                    ai_data.qualitative_pis.sum_score += pi.score;
                })
                //重新分配权重
                reset_qualitative_pis_weight();

            }

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

            if (self.view_mode) {
                if (self.view_mode == 'trans') {
                    $("#ai_wf_title").html('数据处理人');

                    this.template = Handlebars.compile($("#trans_confirm_view").html());
                    $("#ai_wf-content").html(self.template(self.trans_data));
                    $("#ai_wf-content").trigger('create');

                    if (self.trans_data.next_td.node_type == 'END') {
                        do_trans();
                    }
                } else if (self.view_mode == 'pi_detail') {
                    $("#ai_wf_title").html('指标明细');

                    this.template = Handlebars.compile($("#assessment_dl_pi_detail_view").html());
                    $("#ai_wf-content").html(self.template(self.item_obj));
                    $("#ai_wf-content").trigger('create');

                } else if (self.view_mode == 'pi_detail2') {
                    $("#ai_wf_title").html('指标明细');

                    self.item = _.find(self.ai.attributes.qualitative_pis.items, function(x) {
                        return self.item.pi == x.pi;
                    });

                    self.item_obj.pi = self.item;

                    this.template = Handlebars.compile($("#assessment_dx_pi_detail_view").html());
                    $("#ai_wf-content").html(self.template(self.item_obj));
                    $("#ai_wf-content").trigger('create');

                    //判断是哪个环节，只要评估人对应的环节才能评分
                    //是自己
                    if ($("#login_people").val() == ai_data.people) {
                        $("#self").removeAttr("disabled");
                        if ($("#self-button").length) {
                            $("#self-button").attr("class", "ui-btn ui-icon-carat-d ui-btn-icon-right ui-corner-all ui-shadow");
                        } else {
                            $($("#self")[0].parentNode).attr("class", "ui-input-text ui-body-inherit ui-corner-all ui-shadow-inset");
                        }
                    }
                    //是间接上级
                    var ai_people = _.find(peoples_data, function(p) {
                        return p._id == ai_data.people;
                    })
                    var indirect_superior = _.find(peoples_data, function(p) {
                        return p.position._id == ai_people.position.position_indirect_superior || p.parttime_positions.indexOf(ai_people.position.position_indirect_superior) != -1;
                    })

                    if (indirect_superior && indirect_superior._id == $("#login_people").val()) {
                        $("#indirect").removeAttr("disabled");
                        if ($("#indirect-button").length) {
                            $("#indirect-button").attr("class", "ui-btn ui-icon-carat-d ui-btn-icon-right ui-corner-all ui-shadow");
                        } else {
                            $($("#indirect")[0].parentNode).attr("class", "ui-input-text ui-body-inherit ui-corner-all ui-shadow-inset");
                        }
                    }
                    //是上级
                    if (uu && uu[0]._id == $("#login_people").val()) {
                        $("#superior").removeAttr("disabled");
                        if ($("#superior-button").length) {
                            $("#superior-button").attr("class", "ui-btn ui-icon-carat-d ui-btn-icon-right ui-corner-all ui-shadow");
                        } else {
                            $($("#superior")[0].parentNode).attr("class", "ui-input-text ui-body-inherit ui-corner-all ui-shadow-inset");
                        }

                    }
                    //是上上级
                    var superior = _.find(peoples_data, function(p) {
                        return p._id == uu[0]._id;
                    })
                    if (!!superior) {
                        var superior_superior = _.find(peoples_data, function(p) {
                            return p.position._id == superior.position.position_indirect_superior || p.parttime_positions.indexOf(superior.position.position_indirect_superior) != -1;
                        })
                    }

                    if (superior_superior && superior_superior._id == $("#login_people").val()) {
                        $("#superior_superior").removeAttr("disabled");
                        if ($("#superior_superior-button").length) {
                            $("#superior_superior-button").attr("class", "ui-btn ui-icon-carat-d ui-btn-icon-right ui-corner-all ui-shadow");
                        } else {
                            $($("#superior_superior")[0].parentNode).attr("class", "ui-input-text ui-body-inherit ui-corner-all ui-shadow-inset");
                        }

                    }
                } else if (self.view_mode == 'ai_pi_comment') {
                    $("#ai_wf_title").html('沟通记录');

                    this.template = Handlebars.compile($("#pi_comment_view").html());
                    $("#ai_wf-content").html(self.template(self.item));
                    $("#ai_wf-content").trigger('create');
                }
            } else {
                $("#ai_wf_title").html('绩效评估');

                this.template = Handlebars.compile($("#wf01_view").html());
                $("#ai_wf-content").html(self.template(obj));
                $("#ai_wf-content").trigger('create');

                reset_score_view();
                //对自己不显示发起聊天的按钮
                if ($("#login_people").val() == ai_data.people) {
                    $("#ai_wf-content").find('#btn_ai2_start_userchat').hide();
                };
            }

            return self;
        }
    });

    // Returns the View class
    return AIWF01View;
});