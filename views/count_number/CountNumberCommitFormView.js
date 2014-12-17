// CountNumberCommitForm Edit View
// =================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "../../models/CountNumberDefineModel"],
    function($, _, Backbone, Handlebars, CountNumberDefineModel) {
        var temp_cache = {};

        function find_count_item(count_number_define, item_id) {
                var found = _.find(count_number_define, function(x) {
                    return x._id == String(item_id)
                })
                return found;

            }
            //格式化日期
        function format(date) {
            return moment(date).format("YYYY-MM-DD")
        }

        function format_date(date) {
                return moment(date).format("YYYY-MM-DD HH:mm")
            }
            // Extends Backbone.View
        var CountNumberCommitFormView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                this.template = Handlebars.compile($("#psh_count_number_commit_form_view").html());
                this.loading_template = Handlebars.compile($("#loading_template_view").html());
                this.item_template = Handlebars.compile($("#psh_count_number_commit_left_view").html());

                this.bind_event();
            },
            pre_render: function() {
                var self = this;
                $("#my_count_number_instance-content").html(self.loading_template({
                    info_msg: '数据加载中...请稍候'
                }));
                $("#my_count_number_instance-content").trigger('create');
                return this;
            },

            // Renders all of the CountNumberDefineList on the UI
            render: function() {

                var self = this;
                var login_people = $("#login_people").val();
                var temp_model = self.collection.models[0];
                var count_item = temp_model.attributes.count_number_define.count_item;
                temp_model.attributes.count_define_id = temp_model.attributes.count_number_define._id;

                //将最近一次报数存进去当成默认值。
                var sortCountInstance = _.sortBy(temp_model.attributes.count_instance, function(c) {
                    return c.count_date
                })
                var last_sort_item = sortCountInstance[sortCountInstance.length - 1];
                self.set_latest_item(last_sort_item.count_item);
                if (last_sort_item) {
                    if (!!~["1H", "2H", "3H"].indexOf(String(temp_model.attributes.count_number_frequency))) {
                        temp_model.attributes.latest_count_date = new Date();

                    } else {
                        temp_model.attributes.latest_count_date = last_sort_item.count_date;

                    }
                    _.each(last_sort_item.count_item, function(y) {

                        var found_count_item = _.find(count_item, function(z) {
                            //后面的布尔值是防止不同的报数分类有相同的报数项目
                            return z.child_item_name == String(y.child_item_name) && (z.item_C == String(y.item_C) || z.item_category_name == String(y.item_category_name))
                        })
                        if (found_count_item) {
                            found_count_item.count_number = y.count_number;

                        }
                    })
                } else {
                    temp_model.attributes.latest_count_date = new Date();
                }
                var filter_item_C = _.groupBy(_.filter(count_item, function(x) {
                    return x.item_type == 'C'
                }), function(g) {
                    return g.item_C
                })
                var filter_item_S = _.groupBy(_.filter(count_item, function(x) {
                    return x.item_type == 'S'
                }), function(g) {
                    return g.item_category_name
                })
                temp_model.attributes.filter_item_S = filter_item_S;
                temp_model.attributes.filter_item_S_key = _.keys(filter_item_S);
                temp_model.attributes.filter_item_C = filter_item_C;
                temp_model.attributes.filter_item_C_key = _.keys(filter_item_C);
                //判断是否当天内报数，如果是，则时间不能编辑
                temp_model.attributes.is_hour = !!~["1H", "2H", "3H"].indexOf(String(temp_model.attributes.count_number_frequency));

                var render_data = JSON.parse(JSON.stringify(temp_model.attributes));
                $("#my_count_number_instance-content").html(self.template(render_data));
                $("#my_count_number_instance-content").trigger('create');
                //把 a 换成 span， 避免点那个滑块的时候页面跳走。
                $(".ui-flipswitch a").each(function() {
                    $(this).replaceWith("<span class='" + $(this).attr('class') + "'></span>");
                });
                return this;

            },
            bind_event: function() {
                var self = this;
                $("#my_count_number_instance").on('click', '#btn_select_category', function(event) {
                    event.preventDefault();
                    var data = self.collection.models[0].attributes.count_number_define.count_item;
                    var render_data = {
                        data: data
                    }
                    $("#my_count_number_commit-left-panel-content").html(self.item_template(render_data));
                    $("#my_count_number_commit-left-panel-content").trigger('create');
                    $("#my_count_number_commit-left-panel").panel("open");
                }).on('click', '#btn_submit', function(event) {
                    event.preventDefault();
                    event.stopPropagation();
                    var $this = $(this);
                    var up_id = $(this).data("up_id");
                    var count_date = $("#count_date").val();
                    if (!temp_cache.count_date) {
                        temp_cache = JSON.parse(localStorage.getItem("temp_cache"));
                    }
                    var instance_attr = self.collection.models[0].attributes;
                    var count_number_submit = instance_attr.count_instance;
                    var define_id = instance_attr.count_number_define._id;

                    if (_.isArray(count_number_submit) && count_number_submit.length > 0) {
                        //判断是否小时报数
                        if (instance_attr.is_hour) {
                            //找到的当天数据进行排序
                            var sortCountInstance = _.sortBy(_.filter(count_number_submit, function(x) {
                                    return format(x.count_date) == String(format(new Date()))
                                }), function(s) {
                                    return s.count_date
                                })
                                //离上一次报数的时间间隔
                            var time_distance = moment(new Date()).diff(moment(_.last(sortCountInstance).count_date), "hours");
                            switch (instance_attr.count_number_frequency) {
                                case "1H":
                                    if (time_distance > 1) {
                                        temp_cache.count_date = new Date(); //取当前时间
                                        instance_attr.count_instance.push(_.clone(temp_cache));
                                        save_data()
                                    } else {
                                        alert("距离上一次报数时间不足1小时,请" + (1 - time_distance) + "小时后再报数。")
                                    }
                                    break;


                                case "2H":
                                    if (time_distance > 2) {
                                        temp_cache.count_date = new Date(); //取当前时间
                                        instance_attr.count_instance.push(_.clone(temp_cache));
                                        save_data()

                                    } else {
                                        alert("距离上一次报数时间不足2小时,请" + (2 - time_distance) + "小时后再报数。")
                                    }

                                    break;
                                case "4H":
                                    if (time_distance > 4) {
                                        temp_cache.count_date = new Date(); //取当前时间
                                        instance_attr.count_instance.push(_.clone(temp_cache));
                                        save_data()

                                    } else {
                                        alert("距离上一次报数时间不足4小时,请" + (4 - time_distance) + "小时后再报数。")
                                    }

                                    break;
                            }

                        } else {

                            var find_number_submit = _.find(count_number_submit, function(x) {
                                return format(x.count_date) == String(format(count_date))
                            })
                            if (find_number_submit) { //是同一天的话，只更新值，不覆盖。
                                var temp_count_item = find_number_submit.count_item;
                                _.each(temp_cache.count_item, function(x) {
                                    var find_count_item = _.find(temp_count_item, function(y) {
                                        return y.child_item_name == String(x.child_item_name)
                                    })
                                    if (find_count_item) {
                                        find_count_item.count_number = x.count_number;
                                        find_count_item.comment = x.comment;
                                    } else {
                                        temp_count_item.push(x);
                                    }
                                })
                            } else {
                                temp_cache.count_date = count_date;
                                instance_attr.count_instance.push(_.clone(temp_cache));

                            }
                            save_data();

                        }
                    } else {
                        var temp_arr = [];

                        //判断是否小时报数
                        if (instance_attr.is_hour) {
                            temp_cache.count_date = new Date(); //取当前时间
                            temp_arr.push(_.clone(temp_cache));
                            instance_attr.count_instance = temp_arr;
                        } else {
                            temp_cache.count_date = count_date; //取选择的时间
                            temp_arr.push(_.clone(temp_cache));
                            instance_attr.count_instance = temp_arr;
                        }
                        save_data();
                    }

                    function save_data() {
                        self.collection.models[0].save(instance_attr, {
                            success: function(model, response, options) {
                                self.fetch(self.collection.models[0].attributes._id)
                            },
                            error: function(model, xhr, options) {
                                self.fetch(self.collection.models[0].attributes._id)
                            }
                        });
                    }



                }).on('change', '.editable', function(event) {
                    event.preventDefault();
                    var $this = $(this);
                    var value = $(this).val();
                    var ele_type = $(this).data("ele_type");
                    var up_id = self.collection.models[0].attributes._id;
                    //报数项目id
                    var item_id = $this.data("up_id");

                    //报数实例数据
                    var count_number_submit = self.collection.models[0].attributes.count_instance;
                    var count_number_define = _.clone(self.collection.models[0].attributes.count_number_define.count_item)
                        // var count_number_define = _.clone(count_number_defines.get(define_id).attributes.count_item);
                    var found_count_item = find_count_item(count_number_define, item_id);
                    if (found_count_item) {
                        if (ele_type == "input") {
                            found_count_item.count_number = value;

                        } else {
                            found_count_item.comment = value;

                        }
                    }
                    //数据暂存区,改为提交报数时再保存，否则不保存
                    temp_cache = {
                        count_date: new Date(),
                        is_accumulate: self.collection.models[0].attributes.count_number_define.is_accumulate,
                        is_average: self.collection.models[0].attributes.count_number_define.is_average
                    };
                    temp_cache.count_item = [];
                    _.each(count_number_define, function(x) {
                        if (x.count_number || x.count_number == '0') {
                            temp_cache.count_item.push({
                                item_type: x.item_type,
                                item: x.item ? x.item._id : null,
                                item_category_name: x.item_category_name,
                                item_C: x.item_C,
                                child_item: x.child_item ? x.child_item : null,
                                child_item_name: x.child_item_name,
                                unit: x.unit,
                                count_number: x.count_number,
                                comment: x.comment || ''
                            })
                        }

                    })
                }).on('click', "#btn_go_back", function(event) {
                    event.preventDefault();
                    window.location.href = "/m#count_number_list";
                })
                $("#my_count_number_commit-left-panel").on("panelclose", function(event) {
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
                })
            },
            fetch: function(up_id) {
                var self = this;
                self.collection.url = '/admin/pm/count_number_instance/bb/' + up_id + '?type=mobile';
                self.collection.fetch().done(function() {
                    self.render();
                })
            },
            set_latest_item: function(latest_data) {
                var self = this;
                localStorage.removeItem("temp_cache");
                //数据暂存区,改为提交报数时再保存，否则不保存
                var temp_caches = {
                    count_date: new Date(),
                    is_accumulate: self.collection.models[0].attributes.count_number_define.is_accumulate,
                    is_average: self.collection.models[0].attributes.count_number_define.is_average
                };
                temp_caches.count_item = [];
                _.each(latest_data, function(x) {
                    if (x.count_number || x.count_number == '0') {
                        temp_caches.count_item.push({
                            item_type: x.item_type,
                            item: x.item ? x.item._id : null,
                            item_category_name: x.item_category_name,
                            item_C: x.item_C,
                            child_item: x.child_item ? x.child_item : null,
                            child_item_name: x.child_item_name,
                            unit: x.unit,
                            count_number: x.count_number,
                            comment: x.comment || ''
                        })
                    }

                })
                localStorage.setItem("temp_cache", JSON.stringify(temp_caches));
            }

        });

        // Returns the View class
        return CountNumberCommitFormView;

    });