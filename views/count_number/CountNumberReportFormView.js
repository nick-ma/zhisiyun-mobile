// CountNumberReportForm Edit View
// =================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "highcharts", "../../models/CountNumberDefineModel"],
    function($, _, Backbone, Handlebars, Highcharts, CountNumberDefineModel) {
        var basic_column = function(content, categories_data, series_data, up_id, count_instance) {
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
                                // events: {
                                //     click: function() {
                                //         var point_item = this.series.name;
                                //         var category = this.category;
                                //         init_list(up_id, count_instance, category, point_item);
                                //     }
                                // }
                            },
                            pointPadding: 0.2,
                            borderWidth: 0
                        }
                    },
                    series: series_data
                });
            }
            // Extends Backbone.View
        var CountNumberReportFormView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                this.template = Handlebars.compile($("#psh_count_number_personal_report_view").html());
                this.loading_template = Handlebars.compile($("#loading_template_view").html());

                this.bind_event();
            },
            pre_render: function() {
                var self = this;
                $("#my_report_list_container-content").html(self.loading_template({
                    info_msg: '列表数据加载中...请稍候'
                }));
                $("#my_report_list_container-content").trigger('create');
                return this;
            },

            // Renders all of the CountNumberDefineList on the UI
            render: function() {

                var self = this;
                var login_people = $("#login_people").val();
                var temp_model = self.collection.models[0].attributes;
                //画图
                self.draw_chart(temp_model);
                var render_data = {
                    data: temp_model.count_instance
                }
                $("#my_report_list_container-content").html(self.template(render_data));
                $("#my_report_list_container-content").trigger('create');
                //把 a 换成 span， 避免点那个滑块的时候页面跳走。
                $(".ui-flipswitch a").each(function() {
                    $(this).replaceWith("<span class='" + $(this).attr('class') + "'></span>");
                });
                return this;

            },
            bind_event: function() {
                var self = this;
                $("#my_count_number_report").on('click', '#btn_select_category', function(event) {
                    event.preventDefault();
                    var data = self.collection.models[0].attributes.count_number_define.count_item;
                    var render_data = {
                        data: data
                    }
                    $("#my_count_number_report-left-panel-content").html(self.item_template(render_data));
                    $("#my_count_number_report-left-panel-content").trigger('create');
                    $("#my_count_number_report-left-panel").panel("open");
                }).on('click', '#btn_go_back', function(event) {
                    event.preventDefault();
                    var up_id = $(this).data("up_id");
                    self.collection.url = '/admin/pm/count_number_define/bb';
                    self.collection.fetch().done(function() {
                        window.location = "/m#count_number_list";
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
            draw_chart: function(data) {
                var count_instance = data.count_instance;
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
                if (parent_titles.length > 0 && line_parent_datas.length > 0) {
                    var up_id = data._id;
                    basic_column('my_report_data', parent_titles, line_parent_datas, up_id, count_instance);

                } else {
                    $('#my_report_data').html("<div style='text-align:center;margin-top: 200px;color:blue;font-size:4em'>暂无汇总数据</div>")
                }

            }


        });

        // Returns the View class
        return CountNumberReportFormView;

    });