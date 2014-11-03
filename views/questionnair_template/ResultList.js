// ToDo View
// =============

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "async", "highcharts"], function($, _, Backbone, Handlebars, async, Highcharts) {

    Handlebars.registerHelper('qt_checked', function(data) {
        return data == '1' ? '单选' : '多选'
    });

    function save_data(self) {
        self.model.save(self.model.attributes).done(function(data) {
            self.model.fetch().done(function() {
                self.render();

            })
        })
    }

    function changeTwoDecimal(x) {
        var f_x = parseFloat(x);
        if (isNaN(f_x)) {
            return false;
        }
        var f_x = Math.round(x * 100) / 100;
        return f_x;
    }

    function forcechangeTwoDecimal(x) {
        var f_x = parseFloat(x);
        if (isNaN(f_x)) {
            return false;
        }
        var f_x = Math.round(x * 100) / 100;
        var s_x = f_x.toString();
        var pos_decimal = s_x.indexOf('.');
        if (pos_decimal < 0) {
            pos_decimal = s_x.length;
            s_x += '.';
        }
        while (s_x.length <= pos_decimal + 2) {
            s_x += '0';
        }
        return s_x;
    }
    //投票
    var chart_column = function(content, categories_data, series_data) {

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

            xAxis: {
                categories: categories_data,
                labels: {
                    rotation: -45,
                    align: 'right',
                    style: {
                        fontSize: '12px',
                        fontFamily: 'Verdana, sans-serif'
                    }
                }
            },
            yAxis: {
                title: {
                    text: ''
                }
            },
            legend: {
                enabled: false
            },
            plotOptions: {
                column: {
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        style: {
                            fontWeight: 'bold'
                        },
                        formatter: function() {
                            return this.y + '%';
                        }
                    }
                }
            },
            tooltip: {
                formatter: function() {
                    var point = this.point,
                        s = this.x + ':<b>' + this.y + '%</b><br/>';

                    return s;
                }
            },
            series: [{
                name: '',
                data: series_data,
                color: 'white'
            }],
            exporting: {
                enabled: false
            }
        });
    }

    //测试
    var basic_column = function(content, categories_data, series_data, q_category, query_reslut, grade) {
            var obj_data = {
                content: content,
                categories_data: categories_data,
                series_data: series_data,
                q_category: q_category,
                query_reslut: query_reslut,
                grade: grade
            };
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
                            events: {
                                click: function() {
                                    draw_category(obj_data)
                                }
                            }
                        },
                        pointPadding: 0.2,
                        borderWidth: 0
                    }
                },
                series: series_data
            });
        }
        //测试-分类
    var basic_column_category = function(content, categories_data, series_data, obj_data) {
            var content = obj_data.content;
            var q_category = obj_data.q_category;
            var query_reslut = obj_data.query_reslut;
            var grade = obj_data.grade;
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
                    categories: categories_data,
                    labels: {
                        rotation: -45,
                        align: 'right',
                        style: {
                            fontSize: '12px',
                            fontFamily: 'Verdana, sans-serif'
                        }
                    }
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
                                    // console.log(this.category)
                                    obj_data.category_name = this.category
                                    drawtopic(obj_data)
                                },
                                // mouseOver: function() {
                                //     category_name = this.category
                                //     drawPeopleTbl(this.category);
                                //     category_name = null;
                                // }
                            }
                        },
                        pointPadding: 0.2,
                        borderWidth: 0
                    }
                },
                series: series_data
            });
        }
        //测试-题目
    var basic_column_topic = function(content, categories_data, series_data, obj_data) {
        // console.log(categories_data)
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
                categories: categories_data,
                labels: {
                    rotation: -45,
                    align: 'right',
                    style: {
                        fontSize: '12px',
                        fontFamily: 'Verdana, sans-serif'
                    }
                }
            },
            yAxis: {
                min: 0,
                title: {
                    text: ''
                }
            },
            tooltip: {
                formatter: function() {
                    var table = [];
                    table.push('<span style="font-size:10px">' + q_titles_obj[this.x] + '</span><br><table>');
                    table.push('<tr><td style="color:' + this.series.color + ';padding:0">' + this.series.name + ': </td>' + '<td style="padding:0"><b>' + this.y + '</b></td></tr></table>');
                    return table.join('');
                }
            },
            plotOptions: {
                column: {
                    cursor: 'pointer',
                    point: {
                        events: {
                            click: function() {
                                basic_column("is_test_chart", obj_data.categories_data, obj_data.series_data, obj_data.q_category, obj_data.query_reslut, obj_data.grade)
                                draw_list(obj_data.q_category, obj_data.query_reslut)
                            },
                            mouseOver: function() {
                                // topic_name = q_titles_obj[this.category];
                                // drawPeople_topic()
                                // topic_name = null;
                            }
                        }
                    },
                    pointPadding: 0.2,
                    borderWidth: 0
                }
            },
            series: series_data
        });
    }

    function draw_category(obj_data) { //测试－分类

        var content = obj_data.content;
        var q_category = obj_data.q_category;
        var query_reslut = obj_data.query_reslut;
        var grade = obj_data.grade;

        var series_data_02 = [];
        var categories_data_02 = [];
        //判断模板分类
        var all_items = []

        var categorys = []
        if (q_category == '1') {
            categorys = query_reslut[0].items;
        } else {
            categorys = query_reslut[0].test_items;
        }
        if (categorys.length) {
            // console.log(categorys);
            for (var i = 0; i < categorys.length; i++) {
                var pp_items = [];
                for (var j = 0; j < query_reslut.length; j++) {
                    var o = {
                        people: query_reslut[j].people._id,
                        position_name: query_reslut[j].position_name,
                        name: categorys[i].category,
                    };
                    if (q_category == '1') {
                        o.score = query_reslut[j].items[i].score;
                    } else {
                        o.score = query_reslut[j].test_items[i].score;
                    }
                    pp_items.push(o)
                };
                all_items.push(pp_items)
            };
        };
        var sts = [];
        _.each(all_items, function(a) {
            var s_b = _.sortBy(a, function(num) {
                return num.score;
            });
            var num = 0;
            _.each(a, function(s) {
                num += s.score
            })
            var o = {}
            o.name = a[0].name;
            o.min_score = s_b[0].score;
            o.max_score = s_b.pop().score;
            o.average_score = num / a.length;
            sts.push(o);
        })
        // classification = sts;
        var title_names = ['最低分', '最高分', '平均分'];
        _.each(title_names, function(t) {
            var obj = {};
            obj.name = t;
            obj.data = [];
            obj.titles = [];
            _.each(sts, function(s) {
                obj.titles.push(s.name)
                if (t == '最低分') {
                    obj.data.push(changeTwoDecimal(s.min_score))
                } else if (t == '最高分') {
                    obj.data.push(changeTwoDecimal(s.max_score))
                } else {
                    obj.data.push(changeTwoDecimal(s.average_score))
                };
            })
            series_data_02.push(obj)
        })

        categories_data_02 = series_data_02[0].titles;
        // console.log(categories_data_02)
        // console.log(series_data_02)
        basic_column_category(content, categories_data_02, series_data_02, obj_data);
        var items = [];
        _.each(all_items, function(as) {
            _.each(as, function(a) {
                var f_d = _.find(query_reslut, function(q) {
                    return q.people._id == String(a.people)
                })
                if (f_d) {
                    var o = {};
                    o._id = f_d._id;
                    o.people = f_d.people;
                    o.score = a.score;
                    o.category_name = a.name;
                    o.position_name = a.position_name
                    items.push(o);
                };
            })
        })
        // query_reslut_01 = items
        drawPeopleTbl(query_reslut, q_category, items);
    }



    function drawtopic(obj_data) {

        var content = obj_data.content;
        var q_category = obj_data.q_category;
        var query_reslut = obj_data.query_reslut;
        var grade = obj_data.grade;
        var category_name = obj_data.category_name;
        var series_data_03 = [];
        var categories_data_03 = [];
        var query_reslut_03 = [];
        // var category = query_reslut[0].qtc.questionnair_category;
        var f_q = null;
        var all_items = []
        if (q_category == '1') {
            f_q = _.find(query_reslut[0].items, function(q) {
                return q.category == category_name
            })

        } else {
            f_q = _.find(query_reslut[0].test_items, function(q) {
                return q.category == category_name
            })
        }
        var qtis = f_q.qtis
        for (var i = 0; i < qtis.length; i++) {
            var items = [];
            for (var j = 0; j < query_reslut.length; j++) {
                var f_d_q = null;
                if (q_category == '1') {
                    f_d_q = _.find(query_reslut[j].items, function(q) {
                        return q.category == category_name
                    })

                } else {
                    f_d_q = _.find(query_reslut[j].test_items, function(q) {
                        return q.category == category_name
                    })
                }
                items.push({
                    people: query_reslut[j].people._id,
                    position_name: query_reslut[j].position_name,
                    qti_name: f_d_q.qtis[i].qti_name,
                    qti_score_value: f_d_q.qtis[i].qti_score_value || 0,
                    score: f_d_q.qtis[i].score,
                })
            };
            all_items.push(items)
        };

        var sts = [];
        var title_names = ['最低分', '最高分', '平均分'];
        _.each(all_items, function(a) {
            var s_b = _.sortBy(a, function(num) {
                return num.score;
            });
            var num = 0;
            _.each(a, function(s) {
                num += s.score
            })
            var o = {}
            o.name = a[0].qti_name;
            o.qti_score_value = a[0].qti_score_value;
            o.min_score = s_b[0].score;
            o.max_score = s_b.pop().score;
            o.average_score = num / a.length;
            if (q_category == '1') {
                o.grades = [];
                _.each(grade.gg_grades, function(g) {
                    var f_y = _.filter(a, function(y) {
                        return y.score == g.score
                    });
                    o.grades.push({
                        name: g.grade_name,
                        num: f_y.length + '/' + a.length,
                        score: g.score
                    })

                })
            };
            sts.push(o);
        })
        var s_obj = {};
        s_obj.type = 'spline';
        s_obj.name = '分值';
        s_obj.data = []
        s_obj.marker = {
            lineWidth: 2,
            lineColor: Highcharts.getOptions().colors[3],
            fillColor: 'white'
        }
        _.each(sts, function(s) {
            s_obj.data.push(s.qti_score_value)
        })
        _.each(title_names, function(t) {
            var obj = {};
            obj.name = t;
            obj.data = [];
            obj.titles = [];
            _.each(sts, function(s) {
                obj.titles.push(s.name)
                if (t == '最低分') {
                    obj.data.push(changeTwoDecimal(s.min_score))
                } else if (t == '最高分') {
                    obj.data.push(changeTwoDecimal(s.max_score))
                } else {
                    obj.data.push(changeTwoDecimal(s.average_score))
                };
            })

            series_data_03.push(obj);

        })
        if (q_category == '3') {
            series_data_03.push(s_obj)
        };
        var titles = series_data_03[0].titles;
        var f_name = [];
        var o_name = [];
        for (var i = 0; i < titles.length; i++) {
            f_name.push(titles[i]);
            o_name.push(titles[i]);
        };
        q_titles_obj = _.object(o_name, f_name)
        // console.log(o_name)
        // console.log(series_data_03)
        basic_column_topic('is_test_chart', o_name, series_data_03, obj_data);

        var items = [];
        _.each(all_items, function(as) {
            _.each(as, function(a) {
                var f_d = _.find(query_reslut, function(q) {
                    return q.people._id == String(a.people)
                })
                if (f_d) {
                    var o = {};
                    o._id = f_d._id;
                    o.people = f_d.people;
                    o.position_name = a.position_name;
                    o.score = a.score;
                    o.c_name = category_name;
                    o.q_name = a.qti_name;
                    o.qti_score_value = a.qti_score_value
                    items.push(o);
                };
            })
        })
        if (q_category == '1') {
            query_reslut_03 = sts
        } else {
            query_reslut_03 = items
        }
        drawPeople_topic(q_category, query_reslut_03);
    }



    var draw_list = function(q_category, query_reslut) {


        if (query_reslut.length > 0) {
            if (q_category == '1') {
                var tbody = $("#tblQuestion_tree tbody");
                tbody.empty();
                $('#tblQuestion_tree').show();
                $("#tblQuestionnairinstance").hide();
                $("#tblQuestionnairinstance_wrapper").css('display', 'none');


                var items = [];
                var type_name = null;
                for (var i = 0; i < filters.length; i++) {
                    var f_ds = _.filter(query_reslut, function(q) {
                        if (type_val == '1') {
                            type_name = '人事范围'
                            return !!~filters[i].indexOf(String(q.people.company))
                        } else if (type_val == '4') {
                            type_name = '人事子范围'
                            return !!~filters[i].indexOf(String(q.people.ou))
                        } else if (type_val == '2') {
                            type_name = '公司'
                            return filters[i] == String(q.people.company)
                        } else if (type_val == '3') {
                            type_name = '职级'
                            return filters[i] == q.people.joblevel
                        } else if (type_val == '5') {
                            type_name = '部门'
                            return filters[i] == String(q.people.ou)
                        };
                    })
                    var scores = []
                    var num = 0;
                    var results = [];
                    _.each(f_ds, function(q) {
                        num += q.score;
                        scores.push(q.score);
                        _.each(q.items, function(i) {
                            results.push(i.qtis)
                        })
                    })

                    var o = {};
                    o.name = filter_names[i];
                    o.max_score = scores.length > 0 ? _.max(scores) : 0;
                    o.min_score = scores.length > 0 ? _.min(scores) : 0;
                    o.average_score = scores.length > 0 ? num / scores.length : 0;
                    o.childrens = [];


                    results = _.flatten(results, true)
                    var gbs = _.groupBy(results, function(r) {
                            return r.qti_name
                        })
                        // console.log(gbs);
                    var questions = []
                    _.each(gbs, function(ys, k) {

                        var sorts = _.sortBy(ys, function(y) {
                            return y.score
                        })
                        var num = 0;
                        _.each(sorts, function(s) {
                            var score = s.score || 0
                            num += score
                        })
                        var q_o = {}
                        q_o.name = k;
                        q_o.min_score = _.first(sorts).score || 0;
                        q_o.max_score = _.last(sorts).score || 0;
                        q_o.average_score = ys.length > 0 ? num / ys.length : 0;
                        o.childrens.push(q_o)
                    })

                    items.push(o)
                }
                var tr = [];
                for (var i = 0; i < items.length; i++) {
                    tr.push($.sprintf('<tr  data-tt-id="%s"  data-tt-parent-id="">', i));
                    tr.push($.sprintf('<td id="2" data-tt-parent-id=""><span class="label label-important" style="padding:1px;">%s</span>%s</td>', type_name, items[i].name));
                    tr.push($.sprintf('<td>%s</td>', forcechangeTwoDecimal(items[i].max_score)));
                    tr.push($.sprintf('<td>%s</td>', forcechangeTwoDecimal(items[i].min_score)));
                    tr.push($.sprintf('<td>%s</td></tr>', forcechangeTwoDecimal(items[i].average_score)));
                    var tems = items[i].childrens;
                    for (var j = 0; j < tems.length; j++) {
                        tr.push($.sprintf('<tr data-tt-id="%s"  data-tt-parent-id="%s">', null, i));
                        tr.push($.sprintf('<td id="%s" data-tt-parent-id="%s"><span class="label label-success" style="padding:1px;">题目</span>%s</td>', null, i, tems[j].name));
                        tr.push($.sprintf('<td>%s</td>', forcechangeTwoDecimal(tems[j].max_score)));
                        tr.push($.sprintf('<td>%s</td>', forcechangeTwoDecimal(tems[j].min_score)));
                        tr.push($.sprintf('<td>%s</td></tr>', forcechangeTwoDecimal(tems[j].average_score)));
                    };
                };
                tbody.append(tr.join(''));
                $("#tblQuestion_tree").treetable({
                    expandable: true,
                    stringCollapse: '折叠',
                    stringExpand: '展开'
                }, true);
                // $("#tblQuestion_tree").treetable("expandAll");
                $("a, button, input, i,").tooltip();

            } else if (q_category == '3') {
                $('#is_test_list').children().remove();
                var peopletblData = [];

                _.each(query_reslut, function(x) {
                    var row = [];
                    row.push('<li class="ui-li-static ui-body-inherit">'); //col 1
                    row.push('<p> 工号: ' + x.people.people_no + "</p>"); //col 1
                    row.push('<p> 姓名: ' + x.people.people_name + "</p>"); //col 1
                    row.push('<p> 职位: ' + x.people.position_name + "</p>"); //col 1
                    row.push('<p> 部门: ' + x.people.ou_name + "</p>"); //col 1
                    row.push('<p> 问卷名称: ' + x.qtc.qt_name + "</p>"); //col 1
                    row.push('<p> 得分: ' + forcechangeTwoDecimal(x.score) + "</p>"); //col 1
                    row.push('</li>'); //col 1
                    $('#is_test_list').append(row.join(''))


                })
                //重新绘制表时，先销毁原来的内容


            } else {
                var tbody_statis = $("#tblQuestion_statistics tbody");
                tbody_statis.empty();
                var all_items = [];
                var results = query_reslut;
                // console.log(query_reslut)
                if (q_category == '2') {
                    var qtis = results[0].option_items
                } else {
                    var qtis = results[0].vote_items
                }

                var items = []
                var tts = [];
                for (var i = 0; i < qtis.length; i++) {
                    var options = qtis[i].qti_options
                    var obj = {
                        qt: qtis[i].qti_name,
                        qti_type: qtis[i].qti_type,
                        option: options,
                        results: []
                    }
                    if (q_category == '2') {
                        for (var j = 0; j < results.length; j++) {
                            _.each(results[j].option_items[i].results, function(rt) {
                                obj.results.push(rt.result)
                            })
                        };
                    } else {
                        for (var j = 0; j < results.length; j++) {
                            _.each(results[j].vote_items[i].results, function(rt) {
                                obj.results.push(rt.result)
                            })
                        };
                    }
                    items.push(obj)
                };


                for (var i = 0; i < items.length; i++) {
                    var options = items[i].option;
                    var results = items[i].results;
                    var o = {
                        qt: items[i].qt,
                        qti_type: items[i].qti_type,
                        tis: [],
                        sum: 0,
                    }
                    for (var j = 0; j < options.length; j++) {
                        var filtes = _.filter(results, function(op) {
                            return op == j
                        })
                        o.sum += filtes.length;
                        o.tis.push({
                            op: options[j].option,
                            op_num: filtes.length
                        })
                    };

                    tts.push(o);
                };
                var cats = [];
                _.each(tts, function(tt) {

                    var o = {};
                    o.name = tt.qt
                    o.qti_type = tt.qti_type
                    o.categories = [];
                    _.each(tt.tis, function(t) {
                        o.categories.push({
                            name: t.op,
                            num: t.op_num,
                            percentage: forcechangeTwoDecimal(t.op_num / query_reslut.length * 100)
                        });
                    })
                    cats.push(o)
                })
                var tr = [];
                for (var i = 0; i < cats.length; i++) {
                    tr.push($.sprintf('<tr  data-tt-id="%s"  data-tt-parent-id="">', i));
                    tr.push($.sprintf('<td id="2" data-tt-parent-id="" colspan=3 ><span class="label label-important" style="padding:1px;">题目</span>%s(%s)</td></tr>', cats[i].name, cats[i].qti_type == '1' ? '单选' : '多选'));
                    var tems = cats[i].categories;
                    for (var j = 0; j < tems.length; j++) {
                        tr.push($.sprintf('<tr data-tt-id="%s"  data-tt-parent-id="%s">', null, i));
                        tr.push($.sprintf('<td id="%s" class="can_break_down" data-tt-parent-id="%s"><span class="label label-success" style="padding:1px;">选项</span>%s</td>', null, i, tems[j].name));
                        tr.push($.sprintf('<td id="%s" class="can_break_down" data-tt-parent-id="%s">%s</td>', null, i, tems[j].num));
                        tr.push($.sprintf('<td id="%s" class="can_break_down" data-tt-parent-id="%s">%s</td>', null, i, tems[j].percentage + '%'));
                    };
                };
                tbody_statis.append(tr.join(''));
                $("#tblQuestion_statistics").treetable({
                    expandable: true,
                    stringCollapse: '折叠',
                    stringExpand: '展开'
                }, true);
                // $("#tblQuestion_statistics").treetable("expandAll");
                $("a, button, input, i,").tooltip();
            }
        };
    }
    var drawPeopleTbl = function(query_reslut, q_category, query_reslut_01) {
        //开始构建data-列,以期间为列
        if (query_reslut.length > 0) {
            if (q_category == '1') {

                var results = [];
                for (var i = 0; i < query_reslut.length; i++) {
                    var items = query_reslut[i].items
                    for (var j = 0; j < items.length; j++) {
                        var qtis = items[j].qtis
                        results.push(qtis)
                    };
                };
                results = _.flatten(results, true)
                var gbs = _.groupBy(results, function(r) {
                    return r.qti_name
                })

                var questions = []
                _.each(gbs, function(ys, k) {

                    var sorts = _.sortBy(ys, function(y) {
                        return y.score
                    })
                    var num = 0;
                    _.each(sorts, function(s) {
                        num += s.score
                    })
                    var o = {}
                    o.name = k;
                    o.min_score = _.first(sorts).score;
                    o.max_score = _.last(sorts).score;
                    o.average_score = num / ys.length;
                    o.grades = [];
                    _.each(grade.gg_grades, function(g) {
                        var f_y = _.filter(ys, function(y) {
                            return y.score == g.score
                        });
                        o.grades.push({
                            name: g.grade_name,
                            num: f_y.length + '/' + ys.length,
                            score: g.score
                        })
                    })
                    questions.push(o)
                })
                $("#tblQuestionnairinstance").children().remove();
                tblColumns.push({
                    "sTitle": "题 目"
                });
                _.each(questions[0].grades, function(g) {
                    tblColumns.push({
                        "sTitle": g.name + '(' + g.score + ')'
                    });
                })
                tblColumns.push({
                    "sTitle": "得 分"
                })


                var peopletblData = [];

                _.each(questions, function(x) {
                    var row = [];
                    row.push(x.name);
                    _.each(x.grades, function(g) {
                        row.push(g.num);
                    })
                    row.push(forcechangeTwoDecimal(x.average_score))
                    peopletblData.push(row);
                })
            } else if (q_category == '3') {
                if (query_reslut_01.length > 0) {
                    $('#is_test_list').children().remove();

                    var gys = _.groupBy(query_reslut_01, function(qy) {
                        return qy.people.people_no
                    })

                    _.each(gys, function(ys, x) {
                        var row = [];
                        row.push('<li class="ui-li-static ui-body-inherit">'); //col 1
                        row.push('<p> 工号: ' + ys[0].people.people_no + "</p>"); //col 1
                        row.push('<p> 姓名: ' + ys[0].people.people_name + "</p>"); //col 1
                        row.push('<p> 职位: ' + ys[0].people.position_name + "</p>"); //col 1
                        row.push('<p> 部门: ' + ys[0].people.ou_name + "</p>"); //col 1
                        row.push('<div class="ui-grid-a"><div class="ui-block-a" style="width:80%;vertical-align:middle;text-align:left;color: blue;">分类名称</div><div class="ui-block-b" style="width:20%;vertical-align:middle;text-align:right;color:blue">得分</div></div>');
                        _.each(ys, function(y) {
                            row.push('<div class="ui-grid-a"><div class="ui-block-a" style="width:80%;vertical-align:middle;text-align:left"><p style=" margin-bottom: 0px;">' + y.category_name + '</p></div><div class="ui-block-b" style="width:20%;vertical-align:middle;text-align:right"><p style=" margin-bottom: 0px;">' + forcechangeTwoDecimal(y.score) + '</p></div></div>'); //col 1
                        })
                        row.push('</li>'); //col 1
                        $('#is_test_list').append(row.join(''))


                    })



                };
            };

        };
    }
    var drawPeople_topic = function(q_category, query_reslut_03) {

        //开始构建data-列,以期间为列
        if (query_reslut_03.length > 0) {

            var pp_items = []
            pp_items = query_reslut_03;

            if (q_category == '1') {

                tblColumns.push({
                    "sTitle": "题 目"
                });
                _.each(pp_items[0].grades, function(g) {
                    tblColumns.push({
                        "sTitle": g.name + '(' + g.score + ')'
                    });
                })
                tblColumns.push({
                    "sTitle": "得 分"
                })
                var peopletblData = [];

                _.each(pp_items, function(x) {
                    var row = [];
                    row.push(x.name);
                    _.each(x.grades, function(g) {
                        row.push(g.num);
                    })
                    row.push(forcechangeTwoDecimal(x.average_score))
                    peopletblData.push(row);
                })
            } else {



                $('#is_test_list').children().remove();

                var gys = _.groupBy(pp_items, function(qy) {
                    return qy.people.people_no
                })

                _.each(gys, function(ys, x) {
                    var row = [];
                    row.push('<li class="ui-li-static ui-body-inherit">'); //col 1
                    row.push('<p> 工号: ' + ys[0].people.people_no + "</p>"); //col 1
                    row.push('<p> 姓名: ' + ys[0].people.people_name + "</p>"); //col 1
                    row.push('<p> 职位: ' + ys[0].people.position_name + "</p>"); //col 1
                    row.push('<p> 部门: ' + ys[0].people.ou_name + "</p>"); //col 1
                    var ca_gy = _.groupBy(ys, function(y) {
                        return y.c_name
                    })
                    _.each(ca_gy, function(cas, g) {
                        row.push('<div class="ui-grid-a"><div class="ui-block-a" style="width:10%;vertical-align:middle;text-align:left;color: blue;">分类：</div><div class="ui-block-b" style="width:90%;vertical-align:middle;text-align:right;color:blue">' + cas[0].c_name + '</div></div>');
                        _.each(cas, function(c) {
                            row.push('<div class="ui-grid-a"><div class="ui-block-a" style="width:20%;vertical-align:middle;text-align:right"><p style=" margin-bottom: 0px;">题目：</p></div><div class="ui-block-b" style="width:80%;vertical-align:middle;text-align:right"><p style=" margin-bottom: 0px;">' + c.q_name + '</p></div></div>'); //col 1
                            row.push('<div class="ui-grid-a"><div class="ui-block-a" style="width:30%;vertical-align:middle;text-align:right"><p style=" margin-bottom: 0px;">分值：</p></div><div class="ui-block-b" style="width:70%;vertical-align:middle;text-align:right"><p style=" margin-bottom: 0px;">' + forcechangeTwoDecimal(c.qti_score_value) + '</p></div></div>'); //col 1
                            row.push('<div class="ui-grid-a"><div class="ui-block-a" style="width:30%;vertical-align:middle;text-align:right"><p style=" margin-bottom: 0px;">得分：</p></div><div class="ui-block-b" style="width:70%;vertical-align:middle;text-align:right"><p style=" margin-bottom: 0px;">' + forcechangeTwoDecimal(c.score) + '</p></div></div>'); //col 1

                        })
                    })
                    row.push('</li>'); //col 1
                    $('#is_test_list').append(row.join(''))


                })

            }


        };
    }


    var Quesetionnaire_Template_ResultView = Backbone.View.extend({
        // The View Constructor
        initialize: function() {
            this.quesetionnaire_vote_template_result = Handlebars.compile($("#quesetionnaire_vote_template_result_view").html()); //投票问卷
            this.quesetionnaire_option_template_result = Handlebars.compile($("#quesetionnaire_option_template_result_view").html()); //选项问卷

            // this.quesetionnaire_item_template_result = Handlebars.compile($("#quesetionnaire_item_template_result_view").html()); //满意度问卷

            this.quesetionnaire_test_template_result = Handlebars.compile($("#quesetionnaire_test_template_result_view").html()); //测验问卷－个人

            this.quesetionnaire_exam_template_result = Handlebars.compile($("#quesetionnaire_exam_manage_list_view").html()); //测验问卷

            // this.quesetionnaire_exam_template = Handlebars.compile($("#quesetionnaire_exam_manage_list_view").html());

            this.loading_template = Handlebars.compile($("#loading_template_view").html());

            this.model_view = '0';
            this.current_time = '';
            // this.pps = [];
            this.bind_event();
        },
        pre_render: function() {
            var self = this;
            $("#quesetionnaire_template_result_list-content").html(self.loading_template({
                info_msg: '数据加载中...请稍候'
            }));
            $("#quesetionnaire_template_result_list-content").trigger('create');
            return this;
        },
        // Renders all of the Task models on the UI
        render: function() {
            var self = this;
            // console.log(self.qtis)
            var colors = Highcharts.getOptions().colors;
            var qt_type = self.qt_type;

            var rendered_data = '';
            self.qt_result_back_url = localStorage.getItem('qt_result_back_url') || null;
            localStorage.removeItem('qt_result_back_url'); //用完删掉 
            if (self.qt_result_back_url) { //有才设，没有则保持不变
                $("#btn-quesetionnaire_template_result_list-back").attr('href', self.qt_result_back_url);
                $("#btn-quesetionnaire_common_template_edit_list-back").attr('href', self.qt_result_back_url);
            }
            var results = _.filter(self.qtis, function(ft) {
                return ft.status != '0'; //完成
            });

            if (results.length > 0) {
                var cdate = _.max(results, function(obj) {
                    return moment(obj.createDate).month();
                });
                var q = results[0];
                var createDate = moment(cdate.createDate).format("YYYY-MM-DD");
            }


            if (qt_type == '1') {
                alert('抱歉，权限问题看不到结果');
                window.location.href = '#quesetionnair_common_template';

                // $('#qt_result_name').html('满意度问卷分析');
                // rendered_data = self.quesetionnaire_option_template_result({
                //     qt_name: q.qtc.qt_name,
                //     num_sum: results.length + '/' + self.qtis.length,
                //     createDate: moment(cdate.createDate).format("YYYY-MM-DD"),
                //     max: forcechangeTwoDecimal(max.score),
                //     min: forcechangeTwoDecimal(min.score),
                //     avg: forcechangeTwoDecimal(avg),
                // });


            } else if (qt_type == '2' || qt_type == '6') {


                var my_obj = _.find(results, function(rt) {
                    return rt.people._id == self.people
                })
                var all_items = [];
                if (qt_type == '2') {
                    $('#qt_result_name').html('选项问卷分析');
                    var qtis = results.length ? results[0].option_items : [];
                } else {
                    $('#qt_result_name').html('投票问卷分析');
                    var qtis = results.length ? results[0].vote_items : [];
                }
                var items = []
                var tts = [];
                for (var i = 0; i < qtis.length; i++) {
                    var options = qtis[i].qti_options
                    var obj = {
                        qt: qtis[i].qti_name,
                        qti_type: qtis[i].qti_type,
                        option: options,
                        results: [],
                        my_results: []
                    }
                    if (qt_type == '2') {
                        for (var j = 0; j < results.length; j++) {
                            _.each(results[j].option_items[i].results, function(rt) {
                                obj.results.push(rt.result);
                                if (results[j].people._id == self.people) {
                                    obj.my_results.push(rt.result)
                                };
                            })
                        };

                    } else {
                        for (var j = 0; j < results.length; j++) {
                            _.each(results[j].vote_items[i].results, function(rt) {
                                obj.results.push(rt.result);
                                if (results[j].people._id == self.people) {
                                    obj.my_results.push(rt.result)
                                };
                            })
                        };
                    }
                    items.push(obj)
                };
                for (var i = 0; i < items.length; i++) {
                    var options = items[i].option;
                    var result_items = items[i].results;
                    var my_results = items[i].my_results;
                    var o = {
                        qt: items[i].qt,
                        qti_type: items[i].qti_type,
                        tis: [],
                        sum: results.length,
                        my_result: []
                    }
                    for (var j = 0; j < options.length; j++) {
                        var filtes = _.filter(result_items, function(op) {
                            return op == j
                        })
                        var f_d = _.find(my_results, function(ls) {
                            return ls == j
                        })
                        if (f_d) {
                            o.my_result.push(options[j].option)
                        };
                        o.tis.push({
                            op: options[j].option,
                            op_num: filtes.length,
                            percent_num: changeTwoDecimal(filtes.length / results.length * 100),
                        })
                    };

                    tts.push(o);
                };
                rendered_data = self.quesetionnaire_option_template_result({
                    qt_name: self.qtis[0].qtc.qt_name,
                    num_sum: results.length + '/' + self.qtis.length,
                    createDate: moment(cdate ? cdate.createDate : self.qtis[0].createDate).format("YYYY-MM-DD"),
                    tts: tts,

                });
                $("#quesetionnaire_template_result_list-content").html(rendered_data);
                $("#quesetionnaire_template_result_list-content").trigger('create');


                for (var i = 0; i < tts.length; i++) {
                    var tis = tts[i].tis;
                    var categories_data = [];
                    var series_data = [];
                    for (var j = 0; j < tis.length; j++) {
                        categories_data.push(tis[j].op)
                        series_data.push({
                            y: tis[j].percent_num,
                            color: colors[j],
                        })
                    };
                    chart_column("chart_" + i, categories_data, series_data);
                };
            } else if (qt_type == '3') {
                $('#qt_result_name').html('测验问卷分析');

                //==个人成绩＝＝／／
                var q = _.find(results, function(rt) {
                    return self.people == rt.people._id
                })
                if (q) {
                    var obj = {
                        sort: moment().diff(moment(q.lastDate), "days"),
                        delta: moment() - moment(q.lastDate),
                        due_date: q.lastDate,
                        title: q.qtc.qt_name,
                        createDate: q.createDate,
                        operation_id: q._id + '-' + q.qtc.questionnair_category,
                        type: '3',
                        period: q.period,
                        status: q.status,
                        score: q.score,
                        qtc: q.qtc._id,
                        datas: q.test_items,
                        mark: '4',

                    }
                };

                rendered_data = self.quesetionnaire_exam_template_result(obj);
                //==个人成绩＝＝／／


                // console.log('-===========')
                // var categories_data_01 = [];
                // var series_data_01 = [];
                // categories_data_01.push(results[0].qtc.qt_name);
                // var scores = []
                // var num = 0;
                // _.each(results, function(q) {
                //     num += q.score;
                //     scores.push(q.score)
                // })
                // var max_score = _.max(scores);
                // var min_score = _.min(scores);
                // var average_score = num / scores.length;
                // var title_names = ['最低分', '最高分', '平均分'];

                // var max = 0;
                // var min = 0;
                // var avg = 0;
                // _.each(title_names, function(t) {
                //     var obj = {};
                //     obj.data = [];
                //     if (t == '最低分') {
                //         obj.name = t;
                //         min = changeTwoDecimal(min_score)
                //         obj.data.push(changeTwoDecimal(min_score))
                //     } else if (t == '最高分') {
                //         obj.name = t;
                //         max = changeTwoDecimal(max_score)
                //         obj.data.push(changeTwoDecimal(max_score))
                //     } else {
                //         obj.name = t;
                //         obj.data.push(changeTwoDecimal(average_score))
                //         avg = changeTwoDecimal(average_score)
                //     };
                //     series_data_01.push(obj)
                // })

                // rendered_data = self.quesetionnaire_test_template_result({
                //     qt_name: q.qtc.qt_name,
                //     num_sum: results.length + '/' + self.qtis.length,
                //     createDate: moment(cdate.createDate).format("YYYY-MM-DD"),
                //     max: max,
                //     min: min,
                //     avg: avg
                // });

                $("#quesetionnaire_template_result_list-content").html(rendered_data);
                $("#quesetionnaire_template_result_list-content").trigger('create');

                // var url = '/admin/pm/performance_level/grade_group_get_json_data_byId/' + results[0].qtc.grade_group;
                // $.get(url, function(data) {
                //     if (data.code) {
                //         grade = data.data
                //         draw_list('3', results)
                //         basic_column("is_test_chart", categories_data_01, series_data_01, '3', results, grade)

                //     };

                // })



            } else if (qt_type == '4') {
                alert('抱歉，权限问题看不到结果');
                window.location.href = '#quesetionnair_common_template';
            } else if (qt_type == '5') {
                alert('抱歉，权限问题看不到结果');
                window.location.href = '#quesetionnair_common_template';
            } else {
                $('#qt_result_name').html('投票问卷分析');
                rendered_data = self.quesetionnaire_option_template_result({
                    qt_name: q.qtc.qt_name,
                    num_sum: results.length + '/' + self.qtis.length,
                    createDate: moment(cdate.createDate).format("YYYY-MM-DD"),
                });
            }
            return self;

        },
        bind_event: function() {

            var self = this
            var bool = true;
            $("#quesetionnaire_template_result_list").on('change', '#quesetionnaire_template_result_select', function(event) {
                $("#quesetionnaire_template_result_num_list").html('');
                $("#quesetionnaire_template_result_container").html("");
                self.current_time = $(this).val();
                self.render();

            })



        },

    });

    // Returns the View class
    return Quesetionnaire_Template_ResultView;

});