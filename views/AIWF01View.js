// 绩效评估 View
// =============

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "async"], function($, _, Backbone, Handlebars, async) {
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

                    self.do_trans();

                } else {
                    alert('请选择下一任务的处理人');
                };
            })

            $("#btn_ai_wf_cancel").on('click', function(event) {
                event.preventDefault();

                if (!self.view_mode) {
                    window.location.href = '#todo';
                } else if (self.view_mode == 'ai_pi_comment') {
                    var dl_item = _.find(self.ai.attributes.quantitative_pis.items, function(x) {
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

                var pi_f = _.find(self.ai_datas.attributes.pis, function(x) {
                    return x._id == item.pi;
                })

                self.item = item;
                self.item_obj = {};
                self.item_obj.ai_status = self.ai.attributes.ai_status;
                self.item_obj.pi = item;
                self.item_obj.pi_f = pi_f;
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

                var pi_f = _.find(self.ai_datas.attributes.pis, function(x) {
                    return x._id == item2.pi;
                })

                self.item = item2;
                self.item_obj = {};
                self.item_obj.ai_status = self.ai.attributes.ai_status;
                self.item_obj.pi = item2;
                self.item_obj.pi_f = pi_f;
                self.view_mode = 'pi_detail2';
                self.render();
            });

            $("#ai_wf-content").on('change', '#self,#indirect,#superior,#superior_superior', function() {
                $this = $(this);
                var pi_id = $this.data('up_id');
                var type = $this.data('type');
                var item = _.find(self.ai.attributes.qualitative_pis.items, function(x) {
                    return x.pi == pi_id;
                });
                item[type + '_score'] = parseFloat($this.val());
                item[type + '_final_score'] = parseFloat(item[type + '_score'] * item[type + '_weight'] / 100);
                item[type + '_is_grade'] = !!$this.val();
                //重新计算指标得分
                self.item_score(item);
                self.render();
            })

            $("#ai_wf-content").on('click', '.ai_pi_comment', function() {
                var $this = $(this);

                self.view_mode = 'ai_pi_comment';
                self.render();
            });

            $("#ai_wf-content").on('change', '#ai_pi_new_comment', function() {
                var comment = {};
                comment.comment = $("#ai_pi_new_comment").val();
                comment.createDate = moment();
                var people = _.find(self.peoples_data, function(x) {
                    return x._id == $("#login_people").val();
                })
                comment.people_name = people.people_name;
                comment.position_name = people.position.position_name;
                comment.creator = people._id;
                comment.avatar = people.avatar;

                self.item.comments.push(comment);
                self.save_form_data(function() {
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
                var url = "im://userchat/" + self.ai.attributes.people;
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

            if (self.view_mode) {
                if (self.view_mode == 'trans') {
                    $("#ai_wf_title").html('数据处理人');

                    this.template = Handlebars.compile($("#trans_confirm_view").html());
                    $("#ai_wf-content").html(self.template(self.trans_data));
                    $("#ai_wf-content").trigger('create');

                    if (self.trans_data.next_td.node_type == 'END') {
                        self.do_trans();
                    }
                } else if (self.view_mode == 'pi_detail') {
                    $("#ai_wf_title").html('指标明细');
                    if (self.mode) {
                        this.template = Handlebars.compile($("#assessment_dl_pi_detail_view2").html());
                    } else {
                        this.template = Handlebars.compile($("#assessment_dl_pi_detail_view").html());
                    }

                    $("#ai_wf-content").html(self.template(self.item_obj));
                    $("#ai_wf-content").trigger('create');

                } else if (self.view_mode == 'pi_detail2') {
                    $("#ai_wf_title").html('指标明细');

                    self.item = _.find(self.ai.attributes.qualitative_pis.items, function(x) {
                        return self.item.pi == x.pi;
                    });

                    self.item_obj.pi = self.item;

                    if (self.mode) {
                        this.template = Handlebars.compile($("#assessment_dx_pi_detail_view2").html());
                    } else {
                        this.template = Handlebars.compile($("#assessment_dx_pi_detail_view").html());
                    }

                    $("#ai_wf-content").html(self.template(self.item_obj));
                    $("#ai_wf-content").trigger('create');

                    if (!self.mode) {
                        //判断是哪个环节，只要评估人对应的环节才能评分
                        //是自己
                        if ($("#login_people").val() == self.ai.attributes.people) {
                            $("#self").removeAttr("disabled");
                            if ($("#self-button").length) {
                                $("#self-button").attr("class", "ui-btn ui-icon-carat-d ui-btn-icon-right ui-corner-all ui-shadow");
                            } else {
                                $($("#self")[0].parentNode).attr("class", "ui-input-text ui-body-inherit ui-corner-all ui-shadow-inset");
                            }
                        }
                        //是间接上级
                        var ai_people = _.find(self.peoples_data, function(p) {
                            return p._id == self.ai.attributes.people;
                        })
                        var indirect_superior = _.find(self.peoples_data, function(p) {
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
                        if (self.uu && self.uu[0]._id == $("#login_people").val()) {
                            $("#superior").removeAttr("disabled");
                            if ($("#superior-button").length) {
                                $("#superior-button").attr("class", "ui-btn ui-icon-carat-d ui-btn-icon-right ui-corner-all ui-shadow");
                            } else {
                                $($("#superior")[0].parentNode).attr("class", "ui-input-text ui-body-inherit ui-corner-all ui-shadow-inset");
                            }

                        }
                        //是上上级
                        var superior = _.find(self.peoples_data, function(p) {
                            return p._id == self.uu[0]._id;
                        })
                        if (!!superior) {
                            var superior_superior = _.find(self.peoples_data, function(p) {
                                // return p.position._id == superior.position.position_indirect_superior || p.parttime_positions.indexOf(superior.position.position_indirect_superior) != -1;
                                return p.position._id == superior.position.position_direct_superior || p.parttime_positions.indexOf(superior.position.position_direct_superior) != -1;
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
                    }
                } else if (self.view_mode == 'ai_pi_comment') {
                    $("#ai_wf_title").html('沟通记录');

                    this.template = Handlebars.compile($("#pi_comment_view").html());
                    $("#ai_wf-content").html(self.template(self.item));
                    $("#ai_wf-content").trigger('create');
                }
            } else {
                $("#ai_wf_title").html('绩效评估');
                if (!self.obj) {
                    self.get_datas();
                }

                //查看界面
                if (self.mode) {
                    self.obj.mode = 'view';
                }

                this.template = Handlebars.compile($("#wf01_view").html());
                $("#ai_wf-content").html(self.template(self.obj));
                $("#ai_wf-content").trigger('create');

                self.reset_score_view();
                //对自己不显示发起聊天的按钮
                if ($("#login_people").val() == self.ai.attributes.people) {
                    $("#ai_wf-content").find('#btn_ai2_start_userchat').hide();
                };
            }

            return self;
        },

        get_datas: function() {
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

            self.uu = self.team_data.attributes.data.u;
            self.conver = self.ai.attributes.points_system.conversion_centesimal_system;
            self.pscs_data = self.ai_datas.attributes.pscs;
            self.peoples_data = self.ai_datas.attributes.peoples;

            //当事人编辑绩效合同时，算分
            if (self.ai.attributes.ai_status == '7') {
                self.ai.attributes.quantitative_pis.sum_score = 0;
                _.each(self.ai.attributes.quantitative_pis.items, function(x) {
                    //记分
                    x.f_score = Math.round(self.scoring_func(x.scoringformula, parseFloat(x.actual_value), parseFloat(x.target_value)) * 100) / 100;
                    // 得分
                    x.score = Math.round(x.f_score * x.weight) / 100;
                    //定量指标得分之和
                    self.ai.attributes.quantitative_pis.sum_score += x.score;
                });
                //定性指标
                _.each(self.ai.attributes.qualitative_pis.items, function(pi) {
                        self.ai.attributes.qualitative_pis.sum_score = self.ai.attributes.qualitative_pis.sum_score - pi.score;
                        pi.score = 0;
                        pi.score += self.changeTwoDecimal(pi.self_final_score);
                        pi.score += self.changeTwoDecimal(pi.indirect_final_score);
                        pi.score += self.changeTwoDecimal(pi.superior_final_score);
                        pi.score += self.changeTwoDecimal(pi.superior_superior_final_score);
                        pi.score += self.changeTwoDecimal(pi.other_final_score);
                        //指标计分
                        pi.f_score = pi.score;
                        pi.score = self.changeTwoDecimal(pi.f_score * pi.weight / 100);
                        self.ai.attributes.qualitative_pis.sum_score += pi.score;
                    })
                    //重新分配权重
                self.reset_qualitative_pis_weight();

            }

            self.obj = {};
            self.obj.ai = self.ai.attributes;
            self.obj.other1 = other1;
            self.obj.other2 = other2;
            self.obj.other3 = other3;
            self.obj.tts = self.wf_data.attributes.tts;
            self.obj.td = self.wf_data.attributes.td;
            self.obj.ti = self.wf_data.attributes.ti;

            self.obj.pd = self.wf_data.attributes.pd;
            self.obj.history_tasks = self.wf_data.attributes.history_tasks;
            self.obj.flowchart_data = self.wf_data.attributes.flowchart_data;
            self.obj.attachments = self.wf_data.attributes.attachments;
            self.obj.login_people = $("#login_people").val();
        },

        scoring_func: function(formula, x, r1, r2) {
            var self = this;
            //-- 定义计算函数
            // 第一步函数，设：
            // x：实际值，a：目标值（下限），b：目标值（上限），c：封顶分
            var F_0 = function(x) {
                return x;
            };
            var F_A01 = function(x, z, a) {
                return (a == 0) ? z : x / a * 100;
            };
            var F_A02 = function(x, z, a, b, c) {
                return ((b - a) * (x - a) == 0) ? z : c / (b - a) * (x - a);
            };
            var F_A03 = function(x, z, a) {
                return x - a;
            };
            var F_B01 = function(x, z, a) {
                return (x == 0) ? z : a / x * 100;
            };
            var F_B02 = function(x, z, a) {
                return (a == 0) ? z : ((a - x) / a + 1) * 100;
            };
            var F_B03 = function(x, z, a, b, c) {
                return ((a - b) * (a - x) == 0) ? z : c / (a - b) * (a - x);
            };
            var F_B04 = function(x, z, a) {
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
            //--- 开始计算逻辑
            x = parseFloat(x);
            r1 = parseFloat(r1);
            r2 = parseFloat(r2);
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
                x = F_A01(x, formula.divide_by_zero_default, r1);
            } else if (formula.sf_type == 'A02') {
                x = F_A02(x, formula.divide_by_zero_default, r1, r2, formula.max);
            } else if (formula.sf_type == 'A03') {
                x = F_A03(x, formula.divide_by_zero_default, r1);
            } else if (formula.sf_type == 'B01') {
                x = F_B01(x, formula.divide_by_zero_default, r1);
            } else if (formula.sf_type == 'B02') {
                x = F_B02(x, formula.divide_by_zero_default, r1);
            } else if (formula.sf_type == 'B03') {
                x = F_B03(x, formula.divide_by_zero_default, r1, r2, formula.max);
            } else if (formula.sf_type == 'B04') {
                x = F_B04(x, formula.divide_by_zero_default, r1);
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
        },

        reset_score_view: function() {
            var self = this;
            self.ai.attributes.ai_score = 0;
            self.ai.attributes.ai_score += self.ai.attributes.quantitative_pis.sum_score;
            self.ai.attributes.ai_score += self.ai.attributes.qualitative_pis.sum_score;
            // self.ai.attributes.ai_score += self.ai.attributes.questionnairs.score;

            _.each(self.ai.attributes.others, function(o) {
                if (o.item_type == '3' && o.score == 1) {
                    self.ai.attributes.ai_score = 0;
                    return;
                }
                if (o.item_type == '1') {
                    self.ai.attributes.ai_score += o.score;
                } else if (o.item_type == '2') {
                    self.ai.attributes.ai_score = self.ai.attributes.ai_score - o.score;
                }

            })

            //重置总分,根据分制
            var ai_score_str = "得分:" + self.changeTwoDecimal(parseFloat(self.ai.attributes.ai_score / self.conver).toFixed(2));
            $("#ai_score").html(ai_score_str);
            //重置定量指标总分
            var score1_str = self.changeTwoDecimal(parseFloat(self.ai.attributes.quantitative_pis.sum_score / self.conver).toFixed(2));
            $("#score1").html(score1_str + '分)');
            //重置定性指标总分
            var score2_str = self.changeTwoDecimal(parseFloat(self.ai.attributes.qualitative_pis.sum_score / self.conver).toFixed(2));
            $("#score2").html(score2_str + '分)');
            //绩效等级
            var grade = '无对应等级';
            var psc = _.find(self.pscs_data, function(psc) {
                return psc._id == self.ai.attributes.points_system._id;
            });
            if (psc) {
                _.each(psc.grades, function(x) {
                    if (parseFloat(self.ai.attributes.ai_score / self.conver) >= x.grade_low_value && parseFloat(self.ai.attributes.ai_score / self.conver) <= x.grade_high_value) {
                        grade = x.grade_name;
                        _.each(x.integrals, function(xx) {
                            if (xx.period_type == self.ai.attributes.period_type) {
                                self.ai.attributes.integral = xx.score;
                            }
                        });
                    }
                });
            }
            self.ai.attributes.ai_grade = grade;
            $("#ai_grade").html("等级:" + grade);
        },

        changeTwoDecimal: function(x) {
            var self = this;
            var f_x = parseFloat(x);
            if (isNaN(f_x)) {
                return false;
            }
            var f_x = Math.round(x * 100) / 100;

            return f_x;
        },

        reset_qualitative_pis_weight: function() {
            var self = this;
            var superior_superior; //上上级
            var superior; //上级
            var indirect_superior; //间接上级

            //上上级
            if (!!self.ai.attributes.qualitative_pis.superior_superior_weight) {
                //判断是否上上级
                var superior;
                if (self.uu.length) {
                    superior = _.find(self.peoples_data, function(p) {
                        return p._id == self.uu[0]._id;
                    })
                }

                if (!!superior) {
                    superior_superior = _.find(self.peoples_data, function(p) {
                        // return p.position && p.position._id == superior.position.position_indirect_superior;
                        return p.position && p.position._id == superior.position.position_direct_superior || p.parttime_positions.indexOf(superior.position.position_direct_superior) != -1;
                    })
                    if (!superior_superior) {
                        superior_superior = _.find(self.peoples_data, function(p) {
                            return p.parttime_positions.indexOf(superior.position.position_indirect_superior) != -1;
                        })
                    }
                }
            }
            //上级
            if (!!self.ai.attributes.qualitative_pis.superior_weight) {
                if (typeof(self.uu) != 'string') {
                    superior = self.uu[0];
                }
            }
            //间接上级
            if (!!self.ai.attributes.qualitative_pis.indirect_weight) {
                //判断是否有间接上级
                var ai_people = _.find(self.peoples_data, function(p) {
                    return p._id == self.ai.attributes.people;
                })
                indirect_superior = _.find(self.peoples_data, function(p) {
                    return p.position && p.position._id == ai_people.position.position_indirect_superior;
                })
                if (!indirect_superior) {
                    indirect_superior = _.find(self.peoples_data, function(p) {
                        return p.parttime_positions.indexOf(ai_people.position.position_indirect_superior) != -1;
                    })
                }
            }

            _.each(self.ai.attributes.qualitative_pis.items, function(item) {
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
        },

        item_score: function(pi) {
            var self = this;
            self.ai.attributes.qualitative_pis.sum_score = self.ai.attributes.qualitative_pis.sum_score - pi.score;
            pi.score = 0;
            pi.score += self.changeTwoDecimal(pi.self_final_score);
            pi.score += self.changeTwoDecimal(pi.indirect_final_score);
            pi.score += self.changeTwoDecimal(pi.superior_final_score);
            pi.score += self.changeTwoDecimal(pi.superior_superior_final_score);
            pi.score += self.changeTwoDecimal(pi.other_final_score);
            //指标计分
            pi.f_score = pi.score;
            pi.score = self.changeTwoDecimal(pi.f_score * pi.weight / 100);
            self.ai.attributes.qualitative_pis.sum_score += pi.score;
        },

        save_form_data: function(cb) {
            var self = this;
            var ai_data_c = _.clone(self.ai.attributes);

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
                self.ai.fetch().done(function() {
                    cb();
                });
            })
        },

        do_trans: function() {
            var self = this;
            self.save_form_data(function() {
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
    });

    // Returns the View class
    return AIWF01View;
});