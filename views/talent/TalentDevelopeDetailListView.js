// Contact Detail View
// ===================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "async"],
    function($, _, Backbone, Handlebars, async) {
        var pri_state = 's';

        function get_data(id, talent) {
            var found = _.find(talent, function(temp) {
                return temp._id == String(id)
            })
            return found;
        }

        function format(date) {
            return moment(date).format("YYYYMMDD");
        }
        //im_send
        function im_send(temp_data, tag) {
            var require_data = [];
            require_data.push({
                'plan_id': temp_data._id,
                'plan_name': temp_data.plan_name,
                'develope_direct': temp_data.develope_direct,
                'people': temp_data.people,
                'people_no': temp_data.people_no,
                'people_name': temp_data.people_name,
                'period_start': temp_data.period_start,
                'period_end': temp_data.period_end,
                'des_career': temp_data.des_career,
                'des_career_name': temp_data.des_career_name,
                'des_position': temp_data.des_position,
                'des_position_name': temp_data.des_position_name,
            });
            var post_data = 'require_data=' + JSON.stringify(require_data);
            post_data += '&tag=' + tag;
            $.post('/admin/pm/talent_develope/im_send', post_data, function(data) {
                console.log(data)
            })
        }
        // Extends Backbone.View
        var DevelopePlanDetailListView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                this.template = Handlebars.compile($("#hbtmp_talent_develope_detail_list_view").html());
                // The render method is called when People Models are added to the Collection
                this.loading_template = Handlebars.compile($("#loading_template_view").html());

                // this.collection.on("sync", this.render, this);
                this.bind_event();
            },
            pre_render: function() {
                var self = this;
                $("#talent_develope_detail-content").html(self.loading_template({
                    info_msg: '数据加载中...请稍候'
                }));
                $("#talent_develope_detail-content").trigger('create');
                return this;
            },
            // Renders all of the People models on the UI
            render: function() {

                var self = this;
                var state = self.state || 3;
                var pass = (self.pass == "true") ? "true" : String($("#talent_develope_detail-basic-left-panel #talent_result").val());
                var talent_mentor = localStorage.getItem("TalentMentor");
                var talent_data = _.map(self.collection.models, function(x) {
                    var find_people = _.find(self.c_people.models, function(temp) {
                        return temp.attributes._id == String(x.attributes.people)
                    })
                    var find_direct = _.find(self.direct, function(temp) {
                            return temp.attributes._id == String(x.attributes.develope_direct)
                        })
                        //过滤与我相关中不是导师的明细计划；
                    var filter_plan_divide = x.attributes.plan_divide;
                    if (talent_mentor == 'True') {
                        filter_plan_divide = _.filter(x.attributes.plan_divide, function(temp) {
                            var mentor = _.map(temp.mentor, function(y) {
                                return String(y.people)
                            })
                            return !!~mentor.indexOf(String($("#login_people").val()));

                        })
                    }
                    //     //是否已到期
                    _.each(filter_plan_divide, function(temp) {
                        temp.is_disabled = false;
                        if (format(temp.plan_e) < format(moment(new Date()))) {
                            temp.is_disabled = true;
                            temp.state = '2';
                            temp.all_state = '3';
                        } else if (format(temp.plan_s) > format(moment(new Date()))) {
                            temp.state = '0'
                            temp.all_state = '3';

                        } else {
                            temp.state = '1';
                            temp.all_state = '3';

                        }
                        if (temp.creator == String($("#login_people").val())) {
                            temp.is_creator = true;
                        } else {
                            temp.is_creator = false;
                            temp.is_disabled = true;
                        }
                        temp.create_name = temp.creator ? self.people_id_name[String(temp.creator)] : "";
                    })
                    if (find_people) {
                        x.attributes.people_data = find_people.attributes;
                    }
                    if (find_direct) {
                        x.attributes.direct = find_direct.attributes;

                    }
                    x.attributes.plan_divide = filter_plan_divide
                    return x.toJSON();
                })
                var direct = _.map(self.direct, function(temp) {
                    return temp.attributes
                })
                var type = _.map(self.type, function(temp) {
                    return temp.attributes
                })
                var check = _.map(self.check, function(temp) {
                    return temp.attributes
                })
                var learn = _.map(self.learn, function(temp) {
                    return temp.attributes
                })

                var plan_divide_sort = _.sortBy(talent_data[0].plan_divide, function(temp) {
                    return temp.plan_s
                })
                plan_divide_sort.reverse();
                talent_data[0].plan_divide = plan_divide_sort;
                var obj = {
                        talent_data: talent_data[0],
                        status: self.status_data[String(self.people)],
                        direct: direct,
                        type: type,
                        check: check,
                        learn: learn
                    }
                    //@detect the login identifier
                    //个人权限和上级权限
                var per_pri = {};
                per_pri[talent_data[0].people_data._id] = 'p';
                var superior_pri = {};
                superior_pri[talent_data[0].people_data.superiors] = 's';
                superior_pri[talent_data[0].people_data.ind_superiors] = 's';
                var login_people = $("#login_people").val();
                if (per_pri[login_people] || superior_pri[login_people]) {
                    pri_state = per_pri[login_people] || superior_pri[login_people];
                }
                obj.pri_state = pri_state;
                //侧边栏个数显示
                var ts_count = _.countBy(talent_data[0].plan_divide, function(x) {
                    return x.state;
                });
                var ts_count_all = _.countBy(talent_data[0].plan_divide, function(x) {
                    return x.all_state;
                });
                _.each($("#talent_develope_detail-basic-left-panel label"), function(x) {
                    // console.log(x);
                    if ($(x).data('state') == '3') {
                        $(x).find('span').html(ts_count_all[$(x).data('state')] || 0);

                    } else {
                        $(x).find('span').html(ts_count[$(x).data('state')] || 0);

                    }

                })
                obj.talent_data.plan_divide = _.filter(obj.talent_data.plan_divide, function(temp) {
                    if (pass == "false") {
                        var bool = temp.pass == null || temp.pass == false
                    } else {
                        var bool = temp.pass == true;
                    }
                    if (state == '3') {
                        var bool2 = true;
                        return bool2
                    } else {
                        return temp.state == state && bool
                    }
                })
                $("#talent_develope_detail-content").html(self.template(obj));
                $("#talent_develope_detail-content").trigger('create');

                return this;

            },

            bind_event: function() {
                var self = this;
                var change = 1;

                $("#talent_develope_detail_list").on('click', "#btn_go_back", function(event) {
                    event.preventDefault();
                    window.location.href = "#plan_list";
                }).on('click', '.open-left-panel', function(event) {
                    event.preventDefault();
                    $("#talent_develope_detail-basic-left-panel").panel("open");
                }).on('swiperight', function(event) { //向右滑动，打开左边的面板
                    event.preventDefault();
                    $("#talent_develope_detail-basic-left-panel").panel("open");
                }).on('vmousemove', 'img', function(event) {
                    event.preventDefault();
                    var img_view = '<img src="' + this.src + '">';
                    $("#fullscreen-overlay").html(img_view).fadeIn('fast');
                }).on('change', '.chzn-select', function(event) {
                    event.preventDefault();
                    var up_id = $(this).data("up_id");
                    // var plans = plan.models[0].get("plan_divide");
                    var plans = self.collection.models[0].attributes.plan_divide;
                    var plan_id = self.collection.models[0].attributes._id;
                    var found = get_data(up_id, plans)
                    var field1 = $(this).data("field1")
                    var field2 = $(this).data("field2")
                    var _id = String($(this).val()).split(',')[0];
                    var name = String($(this).val()).split(',')[1]
                    if (found) {
                        found[field1] = _id;
                        found[field2] = name;
                        async.parallel({
                            save_data: function(cb) {
                                self.collection.models[0].save(self.collection.models[0].attributes, {
                                    success: function(model, response, options) {
                                        self.collection.url = '/admin/pm/talent_develope/plan/' + plan_id;
                                        self.collection.fetch();
                                        // plan.trigger('sync')
                                        self.render();
                                        cb(null, 'OK')
                                    },
                                    error: function(model, xhr, options) {
                                        cb(null, 'ERR')
                                    }
                                });
                            },
                            im_send: function(cb) { //im消息发送
                                if (change == 1) {
                                    change++;
                                    var require_data = [];
                                    var temp_data = self.collection.models[0].attributes;
                                    require_data.push({
                                        'plan_id': temp_data._id,
                                        'plan_name': temp_data.plan_name,
                                        'develope_direct': temp_data.develope_direct,
                                        'people': temp_data.people,
                                        'people_no': temp_data.people_no,
                                        'people_name': temp_data.people_name,
                                        'period_start': temp_data.period_start,
                                        'period_end': temp_data.period_end,
                                        'des_career': temp_data.des_career,
                                        'des_career_name': temp_data.des_career_name,
                                        'des_position': temp_data.des_position,
                                        'des_position_name': temp_data.des_position_name,
                                    });
                                    var post_data = 'require_data=' + JSON.stringify(require_data);
                                    post_data += '&tag=change';
                                    $.post('/admin/pm/talent_develope/im_send', post_data, cb)
                                } else {
                                    cb(null, 'ok')
                                }

                            }
                        })

                        // //通过Tag标签来控制与候选人培养计划的消息发送,共用一个接口
                        // if (change == 1) {
                        //     var require_data = [];
                        //     var temp_data = self.collection.models[0].attributes;
                        //     require_data.push({
                        //         'plan_name': temp_data.plan_name,
                        //         'develope_direct': temp_data.develope_direct,
                        //         'people': temp_data.people,
                        //         'people_no': temp_data.people_no,
                        //         'people_name': temp_data.people_name,
                        //         'period_start': temp_data.period_start,
                        //         'period_end': temp_data.period_end,
                        //         'des_career': temp_data.des_career,
                        //         'des_career_name': temp_data.des_career_name,
                        //         'des_position': temp_data.des_position,
                        //         'des_position_name': temp_data.des_position_name,
                        //     });
                        //     var post_data = 'require_data=' + JSON.stringify(require_data);
                        //     post_data += '&tag=change';
                        //     if (post_data) {
                        //         $.post('/admin/pm/talent_develope/email_send', post_data)
                        //     }
                        //     change++;
                        // }


                    }

                }).on('click', '#btn_delete', function(event) { //删除明细计划
                    event.preventDefault();
                    var plan_id = $(this).data("plan_id") || self.collection.models[0].attributes._id;
                    var divide_id = $(this).data("divide_id");
                    if (confirm("确认删除该明细计划吗?")) {
                        var filter_plan_data = _.filter(self.collection.models[0].attributes.plan_divide, function(x) {
                            return x._id != String(divide_id)
                        })
                        self.collection.models[0].attributes.plan_divide = filter_plan_data;
                        self.collection.models[0].save(self.collection.models[0].attributes, {
                            success: function(model, response, options) {
                                self.collection.url = '/admin/pm/talent_develope/plan/' + plan_id;
                                self.collection.fetch().done(function() {
                                    alert("该培养计划明细删除成功!")
                                    self.render();
                                    var temp_data = self.collection.models[0].attributes;
                                    im_send(temp_data, 'delete');
                                });


                            },
                            error: function(model, xhr, options) {
                                alert("内部服务器错误,请联系系统管理员!")
                            }
                        })
                    };
                }).on('click', '#btn_add_plan_detail', function(event) { //添加明细计划
                    event.preventDefault();
                    var plan_id = self.collection.models[0].attributes._id;
                    var periodTo = self.collection.models[0].attributes.period_end;
                    if (confirm("确认添加明细计划吗?")) {

                        if (moment().isAfter(moment(periodTo))) {
                            alert('该培养计划已结束，请重新添加培养计划!!!')
                        } else if (!moment().isAfter(moment(periodTo)) && moment(new Date()).add('d', 15).isAfter(moment(periodTo))) {
                            var obj = {
                                'plan_s': moment(),
                                'plan_e': moment(periodTo).subtract('d', 1),
                                'creator': $("#login_people").val(),
                                'create_time': new Date(),
                                'check_people': $("#login_people").val()
                            }
                            self.collection.models[0].attributes.plan_divide.push(obj);
                            self.collection.models[0].save(self.collection.models[0].attributes, {
                                success: function(model, response, options) {
                                    self.collection.url = '/admin/pm/talent_develope/plan/' + plan_id;
                                    self.collection.fetch().done(function() {
                                        alert('培养明细计划添加成功')
                                        self.render();
                                        var temp_data = self.collection.models[0].attributes;
                                        im_send(temp_data, 'add');
                                    });

                                },
                                error: function(model, xhr, options) {
                                    alert("内部服务器错误,请联系系统管理员!")
                                }
                            });
                        } else {
                            var obj = {
                                'plan_s': moment(),
                                'plan_e': moment(new Date()).add('d', 15),
                                'creator': $("#login_people").val(),
                                'create_time': new Date(),
                                'check_people': $("#login_people").val()


                            }
                            self.collection.models[0].attributes.plan_divide.push(obj);
                            self.collection.models[0].save(self.collection.models[0].attributes, {
                                success: function(model, response, options) {
                                    self.collection.url = '/admin/pm/talent_develope/plan/' + plan_id;
                                    self.collection.fetch().done(function() {
                                        alert('培养明细计划添加成功')
                                        self.render();
                                        var temp_data = self.collection.models[0].attributes;
                                        im_send(temp_data, 'add');
                                    });

                                },
                                error: function(model, xhr, options) {
                                    alert("内部服务器错误,请联系系统管理员!")
                                }
                            });
                        }
                    }

                }).on('click', '#btn_save', function(event) { //删除明细计划
                    event.preventDefault();
                    var plan_id = $(this).data("plan_id") || self.collection.models[0].attributes._id;
                    var divide_id = $(this).data("divide_id");
                    self.collection.models[0].save(self.collection.models[0].attributes, {
                        success: function(model, response, options) {
                            self.collection.url = '/admin/pm/talent_develope/plan/' + plan_id;
                            self.collection.fetch();
                            alert("数据保存成功!")
                            self.render();
                        },
                        error: function(model, xhr, options) {
                            alert("内部服务器错误,请联系系统管理员!")
                        }
                    });
                }).on('change', '#plan_s,#plan_e', function(event) {
                    event.preventDefault();
                    var plan_id = $(this).data("plan_id") || self.collection.models[0].attributes._id;
                    var divide_id = $(this).data("divide_id");
                    var field = $(this).data("field");
                    var period_start = moment(self.collection.models[0].attributes.period_start);
                    var period_end = moment(self.collection.models[0].attributes.period_end);
                    var date = $(this).val();
                    var filter_plan_data = _.find(self.collection.models[0].attributes.plan_divide, function(x) {
                        return x._id == String(divide_id)
                    })

                    if (field == "plan_s") {
                        if (moment(date).isBefore(period_start)) {
                            alert('计划分解开始时间需大于计划开始时间')
                        } else if (moment(date).isAfter(period_end)) {
                            alert('计划分解开始时间需小于于计划束时间')

                        } else {
                            filter_plan_data[field] = date;

                        }
                        self.collection.models[0].save(self.collection.models[0].attributes, {
                            success: function(model, response, options) {
                                self.collection.url = '/admin/pm/talent_develope/plan/' + plan_id;
                                self.collection.fetch();
                                self.render();
                            },
                            error: function(model, xhr, options) {
                                alert("内部服务器错误,请联系系统管理员!")
                            }
                        })
                    } else {
                        if (moment(date).isAfter(period_end)) {
                            alert('计划分解结束时间需小于计划结束时间')
                        } else if (moment(date).isBefore(period_start)) {
                            alert('计划分解结束时间需大于计划开始时间')

                        } else {
                            filter_plan_data[field] = date;

                        }
                        self.collection.models[0].save(self.collection.models[0].attributes, {
                            success: function(model, response, options) {
                                self.collection.url = '/admin/pm/talent_develope/plan/' + plan_id;
                                self.collection.fetch();
                                self.render();
                            },
                            error: function(model, xhr, options) {
                                alert("内部服务器错误,请联系系统管理员!")
                            }
                        })
                    }
                }).on('click', '#btn-talent-refresh', function(event) {
                    event.preventDefault();
                    var plan_id = self.collection.models[0].attributes._id;
                    $.mobile.loading("show");
                    self.collection.models[0].save(self.collection.models[0].attributes, {
                        success: function(model, response, options) {
                            self.collection.url = '/admin/pm/talent_develope/plan/' + plan_id;
                            self.collection.fetch();
                            self.render();
                            $("#talent_develope_detail-basic-left-panel").panel("close");
                            $.mobile.loading("hide");
                        },
                        error: function(model, xhr, options) {
                            alert("内部服务器错误,请联系系统管理员!")
                        }
                    })
                }).on('change', '#talent_develope_detail-basic-left-panel input[name=state]', function(event) {
                    event.preventDefault();
                    var $this = $(this);
                    self.state = $this.val();
                    self.pass = $("#talent_develope_detail-basic-left-panel #talent_result").val();
                    var plan_id = self.collection.models[0].attributes._id;
                    self.collection.fetch();
                    self.render();
                    $("#talent_develope_detail-basic-left-panel").panel("close");
                    $.mobile.loading("hide");
                }).on('change', '#talent_develope_detail-basic-left-panel select', function(event) {
                    event.preventDefault();
                    var $this = $(this);
                    var is_pass = $this.val();
                    self.state = $("#talent_develope_detail-basic-left-panel input[name=state]:checked").val();
                    self.pass = String(is_pass);
                    var plan_id = self.collection.models[0].attributes._id;
                    self.collection.url = '/admin/pm/talent_develope/plan/' + plan_id;
                    self.collection.fetch();
                    self.render();
                    $("#talent_develope_detail-basic-left-panel").panel("close");
                    $.mobile.loading("hide");
                })

            }

        });

        // Returns the View class
        return DevelopePlanDetailListView;

    });