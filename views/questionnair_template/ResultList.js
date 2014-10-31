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

    function draw_option() {

    }

    var Quesetionnaire_Template_ResultView = Backbone.View.extend({
        // The View Constructor
        initialize: function() {
            this.quesetionnaire_vote_template_result = Handlebars.compile($("#quesetionnaire_vote_template_result_view").html()); //投票问卷
            this.quesetionnaire_option_template_result = Handlebars.compile($("#quesetionnaire_option_template_result_view").html()); //选项问卷

            // this.quesetionnaire_item_template_result = Handlebars.compile($("#quesetionnaire_item_template_result_view").html()); //满意度问卷

            // this.quesetionnaire_test_template_result = Handlebars.compile($("#quesetionnaire_test_template_result_view").html()); //测验问卷

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
                var max = _.max(results, function(obj) {
                    return obj.score;
                });
                var min = _.min(results, function(obj) {
                    return obj.score;
                });
                var sum = 0;
                _.each(results, function(q) {
                    sum += q.score;
                });
                var avg = sum / results.length;

                var cdate = _.max(results, function(obj) {
                    return moment(obj.createDate).month();
                });
                var q = results[0];
                var createDate = moment(cdate.createDate).format("YYYY-MM-DD");
            }


            if (qt_type == '1') {
                $('#qt_result_name').html('满意度问卷分析');
                rendered_data = self.quesetionnaire_option_template_result({
                    qt_name: q.qtc.qt_name,
                    num_sum: results.length + '/' + self.qtis.length,
                    createDate: moment(cdate.createDate).format("YYYY-MM-DD"),
                    max: forcechangeTwoDecimal(max.score),
                    min: forcechangeTwoDecimal(min.score),
                    avg: forcechangeTwoDecimal(avg),
                });


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

            } else if (qt_type == '4') {

            } else if (qt_type == '5') {

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