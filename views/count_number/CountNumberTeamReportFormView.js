// CountNumberReportForm Edit View
// =================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "highcharts", "../../models/CountNumberDefineModel"],
    function($, _, Backbone, Handlebars, Highcharts, CountNumberDefineModel) {

        // Extends Backbone.View
        var CountNumberTeamReportFormView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                this.template = Handlebars.compile($("#psh_count_number_report_list_view").html());
                this.loading_template = Handlebars.compile($("#loading_template_view").html());
                this.list_template = Handlebars.compile($("#psh_count_number_all_report_view").html());
                this.list_template2 = Handlebars.compile($("#psh_count_number_all_report2_view").html());

                this.bind_event();
            },
            pre_render: function() {
                var self = this;
                $("#myteam_count_number_report-content").html(self.loading_template({
                    info_msg: '数据加载中...请稍候'
                }));
                $("#myteam_count_number_report-content").trigger('create');
                return this;
            },

            // Renders all of the CountNumberDefineList on the UI
            render: function(select) {

                var self = this;
                var login_people = $("#login_people").val();
                var select = select || "A";
                if (select == "A") {
                    var count_number = _.map(_.filter(self.collection.models, function(x) {
                        return x.attributes.creator == String($("#login_people").val()) && !x.attributes.is_delete && x.attributes.is_save == true
                    }), function(x) {
                        if (moment(x.attributes.count_number_end).isBefore(moment(new Date()))) {
                            x.attributes.is_end = true;
                        }
                        return x.toJSON();
                    })

                } else if (select == "B") {
                    var count_number = _.map(_.filter(self.collection.models, function(x) {
                        var is_belong_my_team = false;
                        _.each(x.attributes.count_number_operator, function(c) { //报数执行者
                            if (!!~self.my_team.indexOf(String(c._id)) && login_people != String(c._id)) {
                                is_belong_my_team = true;
                            }
                        })
                        return !x.attributes.is_delete && x.attributes.is_save == true && is_belong_my_team
                    }), function(x) {
                        if (moment(x.attributes.count_number_end).isBefore(moment(new Date()))) {
                            x.attributes.is_end = true;
                        }
                        return x.toJSON();
                    })
                } else if (select == "C") {

                    var count_number = _.map(_.filter(self.collection.models, function(x) {
                        var copy_people_id = _.map(x.attributes.count_number_copy, function(c) {
                            return String(c._id)
                        })
                        return !!~copy_people_id.indexOf(String(login_people)) && !x.attributes.is_delete && x.attributes.is_save == true
                    }), function(x) {
                        if (moment(x.attributes.count_number_end).isBefore(moment(new Date()))) {
                            x.attributes.is_end = true;
                        }
                        return x.toJSON();
                    })
                }

                var render_data = {
                    count_number: count_number,
                    ui_select: select
                }
                $("#myteam_count_number_report-content").html(self.template(render_data));
                $("#myteam_count_number_report-content").trigger('create');
                //把 a 换成 span， 避免点那个滑块的时候页面跳走。
                $(".ui-flipswitch a").each(function() {
                    $(this).replaceWith("<span class='" + $(this).attr('class') + "'></span>");
                });
                return this;

            },
            render_list: function(up_id, count_instance, category, child_item_name, operator) {

                var self = this;
                var login_people = $("#login_people").val();
                var count_instance = _.clone(count_instance);
                var data = [];
                if (operator) {
                    count_instance = _.filter(count_instance, function(x) {
                        return x.operator == String(operator)
                    })
                }
                _.each(count_instance, function(x) {
                    _.each(x.count_item, function(z) {
                        if (z.item_type == 'S' && z.item_category_name == String(category)) {
                            if (z.child_item_name == String(child_item_name)) {
                                z.count_number_frequency = x.count_number_frequency;
                                z.count_date = x.count_date;
                                z.operator = x.operator;
                                data.push(z)
                            }
                        }
                        if (z.item_type == 'C' && z.item_C == String(category)) {
                            if (z.child_item_name == String(child_item_name)) {
                                z.count_number_frequency = x.count_number_frequency;
                                z.count_date = x.count_date;
                                z.operator = x.operator;

                                data.push(z)
                            }
                        }
                    })
                })
                data = _.sortBy(data, function(x) {
                    return x.count_date
                })
                data.reverse();
                var render_data = {
                    data: data
                }
                $("#myteam_count_number_report #my_report_list_container-content").html(self.list_template2(render_data));
                $("#myteam_count_number_report #my_report_list_container-content").trigger('create');
                //把 a 换成 span， 避免点那个滑块的时候页面跳走。
                $(".ui-flipswitch a").each(function() {
                    $(this).replaceWith("<span class='" + $(this).attr('class') + "'></span>");
                });
                return this;

            },


            bind_event: function() {
                var self = this;
                $("#myteam_count_number_report").on('click', '.count_number_view_mode', function(event) {
                    event.preventDefault();
                    var select_menu = $(this).data("select");
                    if (select_menu == "A" || select_menu == "C") {
                        self.render(select_menu);
                    } else {
                        $.get('/admin/pm/count_number_define/my_team', function(data) {
                            if (data.code = "OK") {
                                self.my_team = data.data;
                                self.render(select_menu);
                            }
                        })
                    }


                }).on('click', '#btn_go_back', function(event) {
                    event.preventDefault();
                    var up_id = $(this).data("up_id");
                    var href = localStorage.getItem("btn_go_back_href");
                    if (href) {
                        $("#myteam_count_number_report-content").show();
                        $("#myteam_count_number_report #myteam_count_number_report_footer").show();
                        $('#myteam_count_number_report #my_count_number_report-content').hide();
                        localStorage.removeItem("btn_go_back_href");
                    } else {
                        self.collection.url = '/admin/pm/count_number_define/bb';
                        self.collection.fetch().done(function() {
                            window.location = "/m#count_number_list";
                        })
                    }

                }).on('click', '.draw_report', function(event) {
                    event.preventDefault();
                    var up_id = $(this).data("up_id");
                    var report_source_id = []; //报表数据源
                    var select = $(this).data("select");
                    _.each($("#myteam_count_number_report-content").find("input[type='checkbox']:checked"), function(x) {
                        report_source_id.push(String($(x).data("up_id")))

                    })
                    if (report_source_id.length > 0) {
                        self.is_report_multi = true;
                        var count_number_instances_models = _.filter(self.instance_data, function(x) {
                            // return x.attributes.count_define_id == String(up_id)
                            var bool = true;
                            if (select == "B") {
                                var bool = !!~self.my_team.indexOf(String(x.attributes.operator._id))
                            }
                            return !!~report_source_id.indexOf(String(x.attributes.count_number_define._id)) && bool
                        })
                    } else {
                        var count_number_instances_models = _.filter(self.instance_data, function(x) {
                            var bool = true;
                            if (select == "B") {
                                var bool = !!~self.my_team.indexOf(String(x.attributes.operator._id))
                            }
                            return x.attributes.count_number_define._id == String(up_id) && bool
                        })
                    }
                    var count_instance = [];
                    _.each(count_number_instances_models, function(x) {
                        _.each(x.attributes.count_instance, function(y) {
                            y.operator = x.attributes.operator.people_name;
                            y.count_number_frequency = x.attributes.count_number_frequency;

                            count_instance.push(y);
                        })
                    })
                    self.draw_chart(count_instance, count_number_instances_models, up_id);
                    localStorage.setItem("btn_go_back_href", "/m#count_number_report_all");
                }).on('click', '.count_number_define_details', function(event) {
                    event.preventDefault();
                    var up_id = $(this).data("up_id");
                    localStorage.setItem("btn_go_back_href","/m#count_number_report_all");
                    window.location = "/m#count_number_define/" + up_id + "/B";
                })
            },
            draw_chart: function(data, count_number_instances_models, up_id) {
                var self = this;
                var count_instance = data;
                var parent_titles = [];
                var line_parent_datas = [];
                var count_item = [];
                _.each(count_instance, function(x) {

                        x.count_number_frequency = data.count_number_frequency;
                        _.each(x.count_item, function(y) {
                            count_item.push(y)
                        })
                    })
                    //自己创建的
                var filter_item_C = _.groupBy(_.filter(count_item, function(x) {
                        return x.item_type == 'C'
                    }), function(g) {
                        return g.item_C
                    })
                    //选择的
                var filter_item_S = _.groupBy(_.filter(count_item, function(x) {
                    return x.item_type == 'S'
                }), function(g) {
                    return g.item_category_name
                })
                _.each(_.uniq(_.keys(filter_item_C)), function(c) {
                    parent_titles.push(c)
                })
                var temp_zone_arr_a = [];
                _.each(_.values(filter_item_C), function(g) { //全部报数项目
                    _.each(g, function(z) {
                        temp_zone_arr_a.push(z);
                    })
                })
                var filter_item_C_child = _.groupBy(temp_zone_arr_a, function(x) {
                        return x.child_item_name
                    })
                    //通过报数项目分组得到单个项目的统计报数值。
                _.each(_.keys(filter_item_C_child), function(x) {
                    var chilid_item_num = _.reduce(_.map(filter_item_C_child[x], function(y) {
                        return Number(y.count_number)
                    }), function(mem, num) {
                        return mem + num
                    }, 0)
                    var obj = {};
                    obj.name = x, obj.data = [];
                    obj.title = x;
                    _.each(_.keys(filter_item_C), function(z) { //不属于这个报数类别的放0
                        if (z == String(filter_item_C_child[x][0].item_C)) {
                            obj.data.push(chilid_item_num)
                        } else {
                            obj.data.push(null);
                        }

                    })
                    _.each(_.uniq(_.keys(filter_item_S)), function(z) {
                        obj.data.push(null)
                    })
                    line_parent_datas.push(obj)
                });

                _.each(_.uniq(_.keys(filter_item_S)), function(c) {
                    parent_titles.push(c)
                })
                var temp_zone_arr = [];
                _.each(_.values(filter_item_S), function(g) { //全部报数项目
                    _.each(g, function(z) {
                        temp_zone_arr.push(z);
                    })
                })
                var filter_item_S_child = _.groupBy(temp_zone_arr, function(x) {
                        return x.child_item_name
                    })
                    //通过报数项目分组得到单个项目的统计报数值。
                _.each(_.keys(filter_item_S_child), function(x) {
                    var chilid_item_num = _.reduce(_.map(filter_item_S_child[x], function(y) {
                        return Number(y.count_number)
                    }), function(mem, num) {
                        return mem + num
                    }, 0)
                    var obj = {};
                    obj.name = x, obj.data = [];
                    obj.title = x;

                    _.each(_.uniq(_.keys(filter_item_C)), function(z) {
                        obj.data.push(null);
                    })
                    _.each(_.keys(filter_item_S), function(z) { //不属于这个报数类别的放0
                        if (z == String(filter_item_S_child[x][0].item_category_name)) {
                            obj.data.push(chilid_item_num)
                        } else {
                            obj.data.push(null);
                        }

                    })
                    line_parent_datas.push(obj)
                });
                $("#myteam_count_number_report-content").hide();
                $("#myteam_count_number_report #myteam_count_number_report_footer").hide();
                $('#myteam_count_number_report #my_count_number_report-content').show();
                if (parent_titles.length > 0 && line_parent_datas.length > 0) {
                    self.basic_column('myteam_report_data', parent_titles, line_parent_datas, up_id, count_instance, _.clone(count_number_instances_models));
                    var count_instance = _.sortBy(count_instance, function(x) {
                        return x.count_date
                    })
                    count_instance.reverse();
                    var render_data = {
                        data: count_instance
                    }
                    $("#my_count_number_report-content #my_report_list_container-content").html(self.list_template(render_data));
                    $("#my_count_number_report-content #my_report_list_container-content").trigger('create');
                } else {
                    $('#myteam_count_number_report #myteam_report_data').html("<div style='text-align:center;margin-top: 200px;color:blue;font-size:2em'>暂无汇总数据</div>")
                    var count_instance = _.sortBy(count_instance, function(x) {
                        return x.count_date
                    })
                    count_instance.reverse();
                    var render_data = {
                        data: count_instance
                    }
                    $("#my_count_number_report-content #my_report_list_container-content").html(self.list_template(render_data));
                    $("#my_count_number_report-content #my_report_list_container-content").trigger('create');

                }

            },
            basic_column: function(content, categories_data, series_data, up_id, count_instance, count_instance_model) {
                var self = this;
                var chart = new Highcharts.Chart({
                    chart: {
                        type: 'column',
                        renderTo: content,
                    },
                    title: {
                        text: '',
                        floating: true
                    },
                    exporting: {
                        enabled: false
                    },
                    xAxis: {
                        categories: categories_data
                    },
                    yAxis: {
                        min: 0,
                        title: {
                            text: ''
                        }
                    },
                    credits: {
                        enabled: true,
                        style: {
                            cursor: 'default',
                            color: '#909090',
                            fontSize: '11px'
                        },
                        href: '',
                        text: 'www.zhisiyun.com'
                    },
                    tooltip: {
                        get_data: function() {
                            return "abc"
                        },
                        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                        pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' + '<td style="padding:0"><b>{point.y} </b></td></tr>',
                        footerFormat: '</table>',
                        shared: true,
                        useHTML: true
                    },
                    plotOptions: {
                        column: {
                            cursor: 'pointer',
                            point: {
                                events: {
                                    click: function() {
                                        var point_item = this.series.name;
                                        var category = this.category;
                                        var children_titles = [point_item],
                                            children_data = [];
                                        if (self.is_report_multi) {
                                            //根据人员分组
                                            var count_instance_group = _.groupBy(count_instance_model, function(x) {
                                                return x.attributes.operator.people_name
                                            })
                                            _.each(_.keys(count_instance_group), function(x) {
                                                var count_instance = [];
                                                _.each(count_instance_group[String(x)], function(y) {
                                                    _.each(y.attributes.count_instance, function(z) {
                                                        count_instance.push(z);
                                                    })
                                                })
                                                var obj = {},
                                                    count_item_number = 0,
                                                    is_report = false; //是否报数了
                                                _.each(count_instance, function(y) {

                                                    _.each(y.count_item, function(z) {
                                                        if (z.item_type == 'S' && z.item_category_name == String(category) || z.item_type == 'C' && z.item_C == String(category)) {
                                                            if (z.child_item_name == String(point_item)) {
                                                                count_item_number += z.count_number;
                                                                is_report = true;
                                                            }
                                                        }
                                                    })
                                                })
                                                if (is_report) {
                                                    obj.name = x;
                                                    obj.data = [];
                                                    obj.data.push(count_item_number);
                                                    children_data.push(obj);
                                                }
                                            })

                                        } else {
                                            _.each(count_instance_model, function(x) {
                                                var obj = {},
                                                    count_item_number = 0,
                                                    is_report = false; //是否报数了
                                                _.each(x.attributes.count_instance, function(y) {

                                                    _.each(y.count_item, function(z) {
                                                        if (z.item_type == 'S' && z.item_category_name == String(category) || z.item_type == 'C' && z.item_C == String(category)) {
                                                            if (z.child_item_name == String(point_item)) {
                                                                count_item_number += z.count_number;
                                                                is_report = true;
                                                            }
                                                        }
                                                    })
                                                })
                                                if (is_report) {
                                                    obj.name = x.attributes.operator.people_name;
                                                    obj.data = [];
                                                    obj.data.push(count_item_number);
                                                    children_data.push(obj);
                                                }

                                            })

                                        }

                                        self.basic_column_children('myteam_report_data', children_titles, children_data, categories_data, series_data, up_id, count_instance, count_instance_model, category, point_item);
                                        self.render_list(up_id, count_instance, category, point_item)


                                    }
                                }
                            },
                            pointPadding: 0.2,
                            borderWidth: 0
                        }
                    },
                    series: series_data
                });
            },
            basic_column_children: function(content, categories_data, series_data, parent_title, parent_data, up_id, count_instance, count_instance_model, category, point_item, chart_type, table_type) {
                var self = this;
                var chart = new Highcharts.Chart({
                    chart: {
                        type: 'column',
                        renderTo: content,
                    },
                    title: {
                        text: '',
                        floating: true
                    },
                    credits: {
                        enabled: true,
                        style: {
                            cursor: 'default',
                            color: '#909090',
                            fontSize: '11px'
                        },
                        href: '',
                        text: 'www.zhisiyun.com'
                    },
                    exporting: {
                        enabled: false
                    },
                    xAxis: {
                        categories: categories_data
                    },
                    yAxis: {
                        min: 0,
                        title: {
                            text: ''
                        }
                    },
                    tooltip: {
                        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                        pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' + '<td style="padding:0"><b>{point.y} </b></td></tr>',
                        footerFormat: '</table>',
                        shared: true,
                        useHTML: true
                    },
                    plotOptions: {
                        column: {
                            cursor: 'pointer',
                            point: {
                                events: {
                                    click: function() {
                                        self.basic_column('myteam_report_data', parent_title, parent_data, up_id, count_instance, count_instance_model);

                                        var render_data = {
                                            data: count_instance
                                        }
                                        $("#my_count_number_report-content #my_report_list_container-content").html(self.list_template(render_data));
                                        $("#my_count_number_report-content #my_report_list_container-content").trigger('create');
                                    },
                                    mouseOver: function() {
                                        // init_datatable_b(table_type, up_id, count_instance, category, point_item, this.series.name);
                                        self.render_list(up_id, count_instance, category, point_item, this.series.name)

                                    },


                                }
                            },
                            pointPadding: 0.2,
                            borderWidth: 0
                        }
                    },
                    series: series_data
                });
            }



        });

        // Returns the View class
        return CountNumberTeamReportFormView;

    });