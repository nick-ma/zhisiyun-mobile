// CountNumberDefineForm Edit View
// =================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "async", "../../models/CountNumberDefineModel"],
    function($, _, Backbone, Handlebars, async, CountNumberDefineModel) {
        function send_msg(up_id, tag, cb) {
                var post_data = {
                    up_id: up_id,
                    tag: tag
                }
                $.post('/admin/pm/count_number_define/send_msg', post_data, function(data) {
                    if (data) {
                        cb();
                    } else {
                        cb();
                    }
                })
            }
            // Extends Backbone.View
        var CountNumberDefineFormView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                this.template = Handlebars.compile($("#psh_count_number_define_form_view").html());
                this.loading_template = Handlebars.compile($("#loading_template_view").html());
                this.item_template = Handlebars.compile($("#psh_count_number_left_view").html());
                this.left_template = Handlebars.compile($("#psh_count_number_people_left_view").html());

                this.bind_event();
            },
            pre_render: function() {
                var self = this;
                $("#my_count_number_define-content").html(self.loading_template({
                    info_msg: '数据加载中...请稍候'
                }));
                $("#my_count_number_define-content").trigger('create');
                return this;
            },

            // Renders all of the CountNumberDefineList on the UI
            render: function() {

                var self = this;
                var login_people = $("#login_people").val();
                var temp_model = self.collection.models[0];
                var count_item = temp_model.attributes.count_item;
                var filter_item_C = _.groupBy(_.filter(count_item, function(x) {
                    return x.item_type == 'C'
                }), function(g) {
                    return g.item_C
                })
                var filter_item_S = _.groupBy(_.filter(count_item, function(x) {
                    return x.item_type == 'S'
                }), function(g) {
                    return g.item.item_category_name
                })
                temp_model.attributes.filter_item_S = filter_item_S;
                temp_model.attributes.filter_item_S_key = _.keys(filter_item_S);
                temp_model.attributes.filter_item_C = filter_item_C;
                temp_model.attributes.filter_item_C_key = _.keys(filter_item_C);
                var render_data = JSON.parse(JSON.stringify(temp_model.attributes));
                render_data.ui_select = self.ui_select;
                $("#my_count_number_define-content").html(self.template(render_data));
                $("#my_count_number_define-content").trigger('create');
                //把 a 换成 span， 避免点那个滑块的时候页面跳走。
                $(".ui-flipswitch a").each(function() {
                    $(this).replaceWith("<span class='" + $(this).attr('class') + "'></span>");
                });
                if (self.ui_select != "A") {
                    _.each($("#my_count_number_define-content").find("input"), function(x) {
                        $(x).attr("disabled", true);
                    })
                    _.each($("#my_count_number_define-content").find("button"), function(x) {
                        $(x).attr("disabled", true);
                    })
                    _.each($("#my_count_number_define-content").find("a"), function(x) {
                        $(x).data("field", null);
                    })
                }
                return this;

            },
            bind_event: function() {
                var self = this;
                var count_arr = count_tools(100);

                function count_tools(num) {
                    var count_tool = [];
                    for (var i = num; i > 0; i--) {
                        count_tool.push(i);
                    }
                    return count_tool;
                }
                $("#my_count_number_define").on('click', '#btn_select_category', function(event) {
                    event.preventDefault();
                    var data = _.map(self.item_data, function(x) {
                        return x.toJSON()
                    })

                    var render_data = {
                        data: data
                    }
                    $("#my_count_number_define-left-panel-content").html(self.item_template(render_data));
                    $("#my_count_number_define-left-panel-content").trigger('create');
                    $("#my_count_number_define-left-panel").panel("open");
                }).on('click', '#btn_go_back', function(event) {
                    event.preventDefault();
                    var up_id = $(this).data("up_id");
                    var href = localStorage.getItem("btn_go_back_href");
                    if (href) {
                        localStorage.removeItem("btn_go_back_href");
                        window.location = href;
                    } else {
                        self.collection.url = '/admin/pm/count_number_define/bb';
                        self.collection.fetch().done(function() {
                            window.location = "/m#count_number_list";
                        })
                    }

                }).on('change', '.editable', function(event) {
                    event.preventDefault();
                    var $this = $(this);
                    var item_id = $this.data('up_id');
                    var field = $this.data("field");
                    var value = $(this).val();
                    var single_count_number_defines = self.collection.models[0].attributes;
                    if (field == 'item_C') {
                        var item_C = $this.data("item");
                        var find_item = _.filter(single_count_number_defines.count_item, function(x) {
                            return x.item_C == String(item_C)
                        })
                        if (find_item.length > 0) {
                            _.each(find_item, function(x) {
                                x[field] = value;
                            })
                        };
                    } else {
                        var find_item = _.find(single_count_number_defines.count_item, function(x) {
                            return x._id == String(item_id)
                        })
                        if (find_item) {
                            find_item[field] = value;
                        };

                    }
                    self.collection.models[0].save(self.collection.models[0].attributes, {
                        success: function(model, response, options) {
                            self.render();
                            console.log('DATA SAVE SUCCESSED');
                        },
                        error: function(model, xhr, options) {
                            console.log('DATA SAVE FAILED');
                        }
                    }); //明细项目编辑

                }).on('change', "#is_accumulate", function(event) {
                    event.preventDefault();
                    var count_number_define = self.collection.models[0].attributes;
                    if ($(this).val() == 'true') {
                        var bool_val = true;
                    } else {
                        var bool_val = false;
                    }
                    count_number_define.is_accumulate = bool_val;
                    self.collection.models[0].save(self.collection.models[0].attributes, {
                        success: function(model, response, options) {
                            self.render();
                            console.log('DATA SAVE SUCCESSED');
                        },
                        error: function(model, xhr, options) {
                            console.log('DATA SAVE FAILED');
                        }
                    }); //明细项目编辑
                }).on('change', "#is_average", function(event) {
                    event.preventDefault();
                    var count_number_define = self.collection.models[0].attributes;
                    if ($(this).val() == 'true') {
                        var bool_val = true;
                    } else {
                        var bool_val = false;
                    }
                    count_number_define.is_average = bool_val;
                    self.collection.models[0].save(self.collection.models[0].attributes, {
                        success: function(model, response, options) {
                            self.render();
                            console.log('DATA SAVE SUCCESSED');
                        },
                        error: function(model, xhr, options) {
                            console.log('DATA SAVE FAILED');
                        }
                    });
                }).on('change', '#count_number_name', function(event) {
                    event.preventDefault();
                    var up_id = $(this).data("up_id");
                    var count_number_define = self.collection.models[0].attributes;
                    count_number_define.count_number_name = $(this).val();
                    self.collection.models[0].save(self.collection.models[0].attributes, {
                        success: function(model, response, options) {
                            self.render();
                            console.log('DATA SAVE SUCCESSED');
                        },
                        error: function(model, xhr, options) {
                            console.log('DATA SAVE FAILED');
                        }
                    });
                }).on('change', '#count_number_begin', function(event) {
                    event.preventDefault();
                    var up_id = $(this).data("up_id");
                    var count_number_define = self.collection.models[0].attributes;

                    if (moment($(this).val()).isAfter(moment($("#count_number_end").val()))) {
                        alert('开始时间不能大于结束时间')
                    } else if (moment($(this).val()).isAfter(moment(new Date()))) {
                        alert("开始时间需大于当前时间")
                    } else {
                        count_number_define.count_number_begin = $(this).val();
                        self.collection.models[0].save(self.collection.models[0].attributes, {
                            success: function(model, response, options) {
                                self.render();
                                console.log('DATA SAVE SUCCESSED');
                            },
                            error: function(model, xhr, options) {
                                console.log('DATA SAVE FAILED');
                            }
                        });
                    }

                }).on('change', '#count_number_end', function(event) {
                    event.preventDefault();
                    var count_number_define = self.collection.models[0].attributes;
                    var up_id = $(this).data("up_id");
                    if (moment($(this).val()).isBefore(moment($("#count_number_begin").val()))) {
                        alert('结束时间不能小于开始时间');
                    } else {
                        count_number_define.count_number_end = $(this).val();
                        self.collection.models[0].save(self.collection.models[0].attributes, {
                            success: function(model, response, options) {
                                self.render();
                                console.log('DATA SAVE SUCCESSED');
                            },
                            error: function(model, xhr, options) {
                                console.log('DATA SAVE FAILED');
                            }
                        });
                    }

                }).on('change', '#count_number_frequency', function(event) {
                    event.preventDefault();
                    var up_id = $(this).data("up_id");
                    var count_number_define = self.collection.models[0].attributes;

                    count_number_define.count_number_frequency = $(this).val();
                    self.collection.models[0].save(self.collection.models[0].attributes, {
                        success: function(model, response, options) {
                            self.render();
                            console.log('DATA SAVE SUCCESSED');
                        },
                        error: function(model, xhr, options) {
                            console.log('DATA SAVE FAILED');
                        }
                    });


                }).on('click', ".btn_remove_row", function(event) { //删除报数项目明细
                    event.preventDefault();
                    var item = $(this).data("item");
                    var type = $(this).data("type");
                    var count_number_define = self.collection.models[0].attributes;

                    count_number_define.count_item = _.filter(count_number_define.count_item, function(x) {
                        if (type == 'C') {
                            return x.item_C != String(item)

                        } else if (type == 'S') {
                            return x.item.item_category_name != String(item)

                        }
                    })
                    self.collection.models[0].save(self.collection.models[0].attributes, {
                        success: function(model, response, options) {
                            self.fetch(self.collection.models[0].attributes._id);
                            console.log('DATA SAVE SUCCESSED');
                        },
                        error: function(model, xhr, options) {
                            console.log('DATA SAVE FAILED');
                        }
                    });

                }).on('click', ".btn_remove_row_item", function(event) { //删除报数项目
                    event.preventDefault();
                    var up_id = $(this).data("up_id");
                    var count_number_define = self.collection.models[0].attributes;
                    count_number_define.count_item = _.filter(count_number_define.count_item, function(x) {
                        return x._id != String(up_id)
                    })
                    self.collection.models[0].save(self.collection.models[0].attributes, {
                        success: function(model, response, options) {
                            self.fetch(self.collection.models[0].attributes._id);
                            console.log('DATA SAVE SUCCESSED');
                        },
                        error: function(model, xhr, options) {
                            console.log('DATA SAVE FAILED');
                        }
                    });

                }).on('click', "#btn_add_category", function(event) {
                    event.preventDefault();
                    var count_number_define = self.collection.models[0].attributes;
                    count_number_define.count_item.push({
                        item_C: '新建项目类别' + count_arr.pop(),
                        item_type: 'C',
                        child_item_name: '新建项目' + count_arr.pop()
                    });
                    self.collection.models[0].save(self.collection.models[0].attributes, {
                        success: function(model, response, options) {
                            self.fetch(self.collection.models[0].attributes._id);
                            console.log('DATA SAVE SUCCESSED');
                        },
                        error: function(model, xhr, options) {
                            console.log('DATA SAVE FAILED');
                        }
                    });
                }).on('click', ".btn_add_row", function(event) {
                    event.preventDefault();
                    var item_C = $(this).data("item");
                    var count_number_define = self.collection.models[0].attributes;
                    count_number_define.count_item.push({
                        item_C: item_C,
                        item_type: 'C',
                        child_item_name: '新建项目' + count_arr.pop()
                    });
                    self.collection.models[0].save(self.collection.models[0].attributes, {
                        success: function(model, response, options) {
                            self.fetch(self.collection.models[0].attributes._id);
                            console.log('DATA SAVE SUCCESSED');
                        },
                        error: function(model, xhr, options) {
                            console.log('DATA SAVE FAILED');
                        }
                    });
                }).on('click', '.count_number_people', function(event) {
                    event.preventDefault();
                    $.mobile.loading("show");
                    var field = $(this).data("field");
                    console.log(field);
                    var count_number_define = self.collection.models[0].attributes;
                    // self.peoples = _.filter(self.c_people, function(x) {
                    //     return x.attributes.myteama;
                    // })
                    var rendered = {
                        people: [],
                    };
                    _.each(self.c_people, function(x) {
                        rendered.people.push(x.attributes);
                    });

                    $("#my_count_number_define-left-panel2").html(self.left_template(rendered));
                    $("#my_count_number_define-left-panel2").trigger('create');
                    $("#my_count_number_define-left-panel2").panel("open");
                    $.mobile.loading("hide");
                    var $container = $("#my_count_number_define");
                    if (field == "operator") {
                        var count_number_operator = count_number_define.count_number_operator;
                        console.log(count_number_operator);
                        _.each(count_number_operator, function(x) {
                            $container.find("#rd-" + x._id).attr('checked', true);
                        })
                    } else if (field == "notify") {
                        var count_number_notify = count_number_define.count_number_notify;
                        _.each(count_number_notify, function(x) {
                            $container.find("#rd-" + x._id).attr('checked', true);
                        })
                    } else if (field == "copy") {
                        var count_number_copy = count_number_define.count_number_copy;
                        _.each(count_number_copy, function(x) {
                            $container.find("#rd-" + x._id).attr('checked', true);
                        })
                    }
                    $("#my_count_number_define-left-panel2").data("field", field);
                    window.setTimeout(function() {
                        if ($("#my_count_number_define-left-panel2 input:checked").length && $("#my_count_number_define-left-panel2 input:checked").offset().top > 75) {
                            $.mobile.silentScroll($("#my_count_number_define-left-panel2 input:checked").offset().top - 95)
                        }
                    }, 1000);


                }).on('click', '#btn_submit', function(event) { //发布报数模版
                    event.preventDefault();
                    event.stopPropagation();
                    var $this = $(this);
                    var up_id = $(this).data("up_id");
                    var msg = "确认发布该报数模版吗？一旦发布将不能再次编辑！";
                    my_confirm(msg, null, function() {
                        var count_number_define = self.collection.models[0].attributes;
                        if (count_number_define.count_number_operator.length > 0 && count_number_define.count_item.length > 0) {
                            var url = '/admin/pm/count_number_instance/create_count_number_instance/' + up_id
                            $.post(url, function(data) {
                                if (data.code == 'OK') {
                                    $this.attr("disabled", true);
                                    alert("报数模版发布成功");
                                    count_number_define.is_save = true;
                                    async.parallel({
                                        send_msg: function(cb) {
                                            send_msg(up_id, "submit", function() {
                                                cb(null, "OK");
                                            })
                                        }
                                    }, function(err, data) {
                                        self.collection.models[0].save(count_number_define, {
                                            success: function(model, response, options) {
                                                setTimeout(function() {
                                                    self.collection.url = "/admin/pm/count_number_define/bb";
                                                    self.collection.fetch().done(function() {
                                                        window.location = "/m#count_number_list";

                                                    })
                                                }, 1000);
                                            },
                                            error: function(model, xhr, options) {
                                                setTimeout(function() {
                                                    alert("报数模版发布失败");
                                                }, 1000);
                                            }
                                        });
                                    })

                                } else {
                                    alert("报数模版发布失败");

                                }
                            })
                        } else {
                            alert('请先添加报数执行人或者报数项目再发布！')
                        }
                    })

                })
                $("#my_count_number_define-left-panel").on("panelclose", function(event) {
                    event.preventDefault();
                    var count_item = [],
                        exist_item = [];
                    var count_number_define = _.clone(self.collection.models[0].attributes);

                    _.each(count_number_define.count_item, function(x) {
                        if (x.item) {
                            exist_item.push(String(x.child_item))
                            return x.item._id;
                        }
                    })
                    _.each($("#my_count_number_define input[class='item_select']:checked"), function(x) {
                        var $this = $(x);
                        if (!~exist_item.indexOf(String($this.val()))) {
                            count_item.push({
                                item: $this.data("item"),
                                child_item_name: $this.data("item_name"),
                                child_item: $this.val(),
                                item_type: 'S',
                                unit: $this.data("unit"),
                                item_category_name: $this.data("item_category_name")
                            })
                        }
                    });
                    _.each(count_item, function(x) {
                        self.collection.models[0].attributes.count_item.push(x);
                    })
                    self.collection.models[0].save(self.collection.models[0].attributes, {
                        success: function(model, response, options) {
                            self.fetch(self.collection.models[0].attributes._id);
                            console.log('DATA SAVE SUCCESSED');
                        },
                        error: function(model, xhr, options) {
                            console.log('DATA SAVE FAILED');
                        }
                    });
                })
                $("#my_count_number_define-left-panel2").on("panelclose", function(event) { //-人员面板关闭
                    event.preventDefault();
                    var field = $(this).data("field");
                    var count_number_define = self.collection.models[0].attributes;
                    var field_data;
                    field_data = _.map($("#my_count_number_define input[class='count_number_people']:checked"), function(x) {
                        var $this = $(x);
                        return {
                            _id: $this.val(),
                            people_name: $this.data("people_name"),
                            position_name: $this.data("position_name"),
                            ou_name: $this.data("ou_name"),
                            company_name: $this.data("company_name"),
                            superiors: $this.data("superiors")
                        }
                    })
                    if (field == 'operator') {
                        count_number_define.count_number_operator = field_data;
                        var exist_notify = _.map(count_number_define.count_number_notify, function(x) {
                            return String(x._id)
                        })
                        _.each(field_data, function(x) {
                            if (!~exist_notify.indexOf(x.superiors)) {
                                count_number_define.count_number_notify.push(x.superiors);
                                exist_notify.push(x.superiors);
                            }
                        })
                    } else if (field == 'notify') {
                        count_number_define.count_number_notify = field_data;
                    } else if (field == 'copy') {
                        count_number_define.count_number_copy = field_data;
                    }
                    self.collection.models[0].save(self.collection.models[0].attributes, {
                        success: function(model, response, options) {
                            self.fetch(self.collection.models[0].attributes._id);
                            console.log('DATA SAVE SUCCESSED');
                        },
                        error: function(model, xhr, options) {
                            console.log('DATA SAVE FAILED');
                        }
                    });
                })
            },
            fetch: function(up_id) {
                var self = this;
                self.collection.url = '/admin/pm/count_number_define/bb/' + up_id;
                self.collection.fetch().done(function() {
                    self.render();
                })
            }


        });

        // Returns the View class
        return CountNumberDefineFormView;

    });