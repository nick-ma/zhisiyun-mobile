// CountNumberDefineList View
// =================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "async", "../../models/CountNumberDefineModel"],
    function($, _, Backbone, Handlebars, async, CountNumberDefineModel) {
        var ui_select = "A";

        function send_msg(up_id, tag, cb) {
                var post_data = {
                    up_id: up_id,
                    tag: tag
                }
                $.post('/admin/pm/count_number_define/send_msg', function(data) {
                    if (data) {
                        cb();
                    } else {
                        cb();
                    }
                })
            }
            // Extends Backbone.View
        var CountNumberDefineList = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                this.template = Handlebars.compile($("#psh_count_number_define_list_view").html());
                this.template_instance = Handlebars.compile($("#psh_count_number_instance_list_view").html());
                this.template_define_form = Handlebars.compile($("#psh_count_number_define_form_view").html());
                this.loading_template = Handlebars.compile($("#loading_template_view").html());

                this.bind_event();
            },
            pre_render: function() {
                var self = this;
                $("#my_count_number-content").html(self.loading_template({
                    info_msg: '数据加载中...请稍候'
                }));
                $("#my_count_number-content").trigger('create');
                return this;
            },

            // Renders all of the CountNumberDefineList on the UI
            render: function(select) {

                var self = this;
                ui_select = select || "A";
                var login_people = $("#login_people").val();
                if (select) {
                    if (select == "A" || select == "B") { //未发布,已发布
                        var bool_obj = {
                            "A": false,
                            "B": true
                        }
                        var bool = bool_obj[select];
                        var count_number = _.map(_.sortBy(_.filter(self.collection.models, function(x) {
                            if (moment(x.attributes.count_number_end).isAfter(moment(new Date())) && !x.attributes.is_stop) {
                                x.sequence = 1;
                            } else if (x.attributes.is_stop) {
                                x.sequence = 2;
                            } else {
                                x.sequence = 3;
                            }
                            return x.attributes.creator == String($("#login_people").val()) && x.attributes.is_save == bool
                        }), function(s) {
                            return s.sequence;
                        }), function(x) {
                            if (moment(x.attributes.count_number_end).isBefore(moment(new Date()))) {
                                x.attributes.is_end = true;
                            }
                            return x.toJSON();
                        })
                    } else {
                        var count_number = _.map(_.filter(self.collection.models, function(x) {
                            var is_running = moment(x.attributes.count_number_end).isAfter(moment(new Date()));
                            var operator = _.map(x.attributes.count_number_operator, function(y) {
                                if (y) {
                                    if (y._id) {
                                        return String(y._id)

                                    } else {
                                        return String(y)
                                    }
                                }
                            })
                            return !!~operator.indexOf(String(login_people)) && x.attributes.is_save == true && is_running && !x.attributes.is_stop
                        }), function(x) {
                            return x.toJSON();
                        })
                    }

                } else {
                    var count_number = _.map(_.filter(self.collection.models, function(x) {
                        return x.attributes.creator == String($("#login_people").val()) && x.attributes.is_save == false
                    }), function(x) {
                        if (moment(x.attributes.count_number_end).isBefore(moment(new Date()))) {
                            x.attributes.is_end = true;
                        }
                        return x.toJSON();
                    })
                }


                var render_data = {
                    count_number: count_number,
                    ui_select: ui_select
                }
                $("#my_count_number-content").html(self.template(render_data));
                $("#my_count_number-content").trigger('create');
                return this;

            },
            render_instance: function(select) {
                var self = this;
                ui_select = select;
                var login_people = $("#login_people").val();
                if (select == "C") {
                    var count_number = _.map(_.filter(self.instance_data, function(x) {
                        var is_running = moment(x.attributes.count_number_end).isAfter(moment(new Date()));

                        return x.attributes.operator._id == String(login_people) && is_running && !x.attributes.is_stop
                    }), function(x) {
                        return x.toJSON();
                    })

                } else if (select == "D") {
                    var count_number = _.map(_.filter(self.instance_data, function(x) {

                        var is_running = moment(x.attributes.count_number_end).isAfter(moment(new Date()));
                        return x.attributes.operator._id == String(login_people)
                    }), function(x) {
                        return x.toJSON();
                    })

                }
                var render_data = {
                    count_number: count_number,
                    ui_select: ui_select
                }
                $("#my_count_number-content").html(self.template_instance(render_data));
                $("#my_count_number-content").trigger('create');
                return this;

            },
            bind_event: function() {
                var self = this;
                $("#my_count_number").on('click', '.open-left-panel', function(event) {
                    event.preventDefault();
                    $("#show_count_number-left-panel").panel("open");
                }).on('swiperight', function(event) { //向右滑动，打开左边的面板
                    event.preventDefault();
                    $("#show_count_number-left-panel").panel("open");
                }).on('click', '.count_number_view_mode', function(event) { //choice ,'A','B','C','D'
                    event.preventDefault();
                    var select_menu = $(this).data("select");
                    if (!!~["A", "B"].indexOf(String(select_menu))) {
                        self.render(select_menu);

                    } else {
                        self.render_instance(select_menu);

                    }
                }).on('click', '#btn_count_number_add', function(event) { //添加报数模版
                    event.preventDefault();
                    var name = "请输入报数模版名称";
                    my_prompt(name, null, null, function(data) {
                        if (name) {
                            var new_count_number = new CountNumberDefineModel({
                                count_number_name: data,
                                create_date: new Date(),
                                creator: $("#login_people").val(),
                                creator_name: $("#login_people_name").val(),
                                create_terminal: 'PC',
                                count_number_begin: new Date(),
                                count_number_end: new Date(),
                            });

                            new_count_number.save().done(function() {
                                var up_id = new_count_number.attributes._id;

                                var url = '/admin/pm/count_number_define/template_edit/' + up_id;
                                self.collection.fetch().done(function() {
                                    window.location.href = "/m#count_number_define/" + up_id + "/A";
                                })
                            });
                        }
                    })

                }).on('click', '#count_number_define_details', function(event) {
                    event.preventDefault();
                    var up_id = $(this).data("up_id");
                    // var single_instance = self.collection.get(up_id).attributes;
                    // self.render_form_edit(single_instance);
                    window.location.href = "/m#count_number_define/" + up_id + "/" + ui_select;
                }).on('click', '.btn_edit', function(event) {
                    event.preventDefault();
                    var href = $(this).data("href");
                    window.location = href;
                }).on('click', '.btn_delete', function(event) {
                    event.preventDefault();
                    var up_id = $(this).data("up_id");
                    my_confirm("确认删除该报数模版吗？一旦删除将无法恢复！", null, function() {
                        var count_number_define = _.find(self.collection.models, function(x) {
                                return x.attributes._id == String(up_id)
                            })
                            // var count_number_define = self.collection.models.get(up_id);
                        count_number_define.destroy({
                            success: function() {
                                setTimeout(function() {
                                    alert('报数模版删除成功');
                                    send_msg(up_id, "delete", function() {
                                        self.collection.url = "/admin/pm/count_number_define/bb";
                                        self.collection.fetch().done(function() {
                                            self.render(ui_select);
                                        })
                                    })
                                }, 1000);
                            }
                        });
                    })
                }).on('click', '.btn_stop', function(event) {
                    event.preventDefault();
                    var up_id = $(this).data("up_id");
                    my_confirm("确认终止该报数模版吗？一旦终止将无法恢复！", null, function() {
                        var count_number_define = _.find(self.collection.models, function(x) {
                            return x.attributes._id == String(up_id)
                        })
                        count_number_define.attributes.is_stop = true;
                        count_number_define.save(count_number_define.attributes, {
                            success: function(model, response, options) {
                                setTimeout(function() {
                                    alert('报数模版终止成功');
                                    send_msg(up_id, "stop", function() {
                                        self.collection.fetch().done(function() {
                                            self.render(ui_select);
                                        })
                                    })
                                }, 1000);
                            },
                            error: function(model, xhr, options) {
                                setTimeout(function() {
                                    alert("报数模版终止失败");
                                }, 1000);
                            }
                        });

                    })
                }).on('click', '.btn_submit', function(event) { //发布
                    event.preventDefault();
                    var $this = $(this);
                    var up_id = $(this).data("up_id");
                    var msg = "确认发布该报数模版吗？一旦发布将不能再次编辑！";
                    my_confirm(msg, null, function() {
                        var count_number_define = _.find(self.collection.models, function(x) {
                            return x.attributes._id == String(up_id)
                        });
                        if (count_number_define.attributes.count_number_operator.length > 0 && count_number_define.attributes.count_item.length > 0) {
                            var url = '/admin/pm/count_number_instance/create_count_number_instance/' + up_id
                            $.post(url, function(data) {
                                if (data.code == 'OK') {
                                    alert("报数模版发布成功")
                                    $this.attr("disabled", true);
                                    count_number_define.attributes.is_save = true;
                                    count_number_define.save(count_number_define.attributes, {
                                        success: function(model, response, options) {
                                            setTimeout(function() {
                                                alert('报数模版发布成功');
                                                send_msg(up_id, "submit", function() {
                                                    self.collection.fetch().done(function() {
                                                        self.render(ui_select);
                                                    })
                                                })
                                            }, 1000);
                                        },
                                        error: function(model, xhr, options) {
                                            setTimeout(function() {
                                                alert("报数模版发布失败");
                                            }, 1000);
                                        }
                                    });
                                } else {
                                    setTimeout(function() {
                                        alert('报数模版发布失败')

                                    }, 1000);
                                }
                            })
                        } else {
                            setTimeout(function() {
                                alert('请先添加报数执行人或者报数项目再发布！')

                            }, 1000);
                        }
                    })
                }).on('click', '.btn_clone', function(event) {
                    event.preventDefault();
                    var up_id = $(this).data("up_id");
                    var count_number_define = _.find(self.collection.models, function(x) {
                        return x.attributes._id == String(up_id)
                    })
                    var name = "请输入报数模版名称:",
                        msg = count_number_define.attributes.count_number_name + "(COPY)";
                    my_prompt(name, msg, null, function(data) {
                        var new_count_number = new CountNumberDefineModel({
                            count_number_name: data,
                            create_date: new Date(),
                            creator: $("#login_people").val(),
                            creator_name: $("#login_people_name").val(),
                            create_terminal: 'PC',
                            count_number_begin: new Date(),
                            count_number_end: new Date(),
                            count_number_frequency: count_number_define.attributes.count_number_frequency || "D",
                            count_item: count_number_define.attributes.count_item,
                            type_copy: "COPY"
                        });
                        new_count_number.save(new_count_number.attributes, {
                            success: function(model, response, options) {
                                setTimeout(function() {
                                    alert('报数模版克隆成功');
                                    self.collection.url = "/admin/pm/count_number_define/bb";
                                    self.collection.fetch().done(function() {
                                        self.render(ui_select);
                                    })
                                }, 1000);
                            },
                            error: function(model, xhr, options) {
                                setTimeout(function() {
                                    alert('报数模版克隆失败');
                                    self.render(ui_select);
                                }, 1000);
                            }
                        });
                    })

                }).on('click', '.btn_derive', function(event) {
                    event.preventDefault();
                    var $this = $(this);
                    var up_id = $(this).data("up_id");
                    var count_number_define = _.find(self.collection.models, function(x) {
                        return x.attributes._id == String(up_id)
                    })
                    if (moment(count_number_define.attributes.count_number_end).isAfter(moment(new Date())) && !count_number_define.attributes.is_stop) {
                        my_confirm("确认终止该报数模版并派生新报数模版吗?", null, function() {
                            var msg = count_number_define.attributes.count_number_name + "(派生)";
                            setTimeout(function() {
                                my_prompt("请输入报数模版名称:", msg, null, function(data) {
                                    if (data) {
                                        if (count_number_define.attributes.derive_arr.length > 0) {
                                            var lastSortBySourceSeq = _.last(_.sortBy(count_number_define.attributes.derive_arr, function(x) {
                                                return x.source_seq
                                            }))
                                            var derive_arr = count_number_define.attributes.derive_arr.derive_arr;
                                            derive_arr.push({
                                                source_seq: lastSortBySourceSeq.source_seq++,
                                                source_define: up_id
                                            })
                                        } else {
                                            var derive_arr = [];
                                            derive_arr.push({
                                                source_seq: 1,
                                                source_define: up_id
                                            })
                                        }

                                        var new_count_number = new CountNumberDefineModel({
                                            count_number_name: data,
                                            create_date: new Date(),
                                            creator: $("#login_people").val(),
                                            creator_name: $("#login_people_name").val(),
                                            create_terminal: 'PC',
                                            count_number_begin: new Date(),
                                            count_number_end: moment(new Date()).add("days", 10),
                                            count_number_frequency: count_number_define.attributes.count_number_frequency || "D",
                                            count_item: count_number_define.attributes.count_item,
                                            count_number_operator: count_number_define.attributes.count_number_operator,
                                            count_number_notify: count_number_define.attributes.count_number_notify,
                                            count_number_copy: count_number_define.attributes.count_number_copy,
                                            type_copy: "DERIVE",
                                            is_derive: true,

                                        });
                                        async.series({
                                            create: function(cb) {
                                                new_count_number.save(new_count_number.attributes, {
                                                    success: function(model, response, options) {
                                                        cb(null, "OK");

                                                    },
                                                    error: function(model, xhr, options) {
                                                        cb(null, "OK");
                                                    }
                                                });
                                            },
                                            update: function(cb) {
                                                var url = '/admin/pm/count_number_instance/stop_count_number_instance/' + up_id
                                                $.post(url, function(data) {
                                                    if (data.code == 'OK') {
                                                        $this.attr("disabled", true);
                                                        count_number_define.attributes.is_stop = true;
                                                        count_number_define.save(count_number_define.attributes, {
                                                            success: function(model, response, options) {
                                                                send_msg(up_id, "stop", function() {
                                                                    cb(null, "OK");
                                                                })

                                                            },
                                                            error: function(model, xhr, options) {
                                                                cb(null, "OK");

                                                            }
                                                        });
                                                    } else {
                                                        cb(null, "OK");

                                                    }
                                                })
                                            }
                                        }, function(err, result) {
                                            setTimeout(function() {
                                                alert('报数模版派生成功');
                                                self.collection.fetch().done(function() {
                                                    self.render(ui_select);
                                                })
                                            }, 1000);

                                        })

                                    }
                                })
                            }, 1000);
                        })


                    } else {
                        alert('该报数模版已结束或已终止!!!')
                    }

                }).on('click', '#count_number_instance_details', function(event) {
                    event.preventDefault();
                    var up_id = $(this).data("up_id");
                    var ui_select = $(this).data("ui_select");
                    switch (ui_select) {
                        case "C":
                            window.location = "/m#count_number_commit/" + up_id;
                            break;
                        case "D":
                            window.location = "/m#count_number_report/personal/" + up_id;
                            break;

                    }
                })

            },

        });

        // Returns the View class
        return CountNumberDefineList;

    });