// ToDo View
// =============

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "async"], function($, _, Backbone, Handlebars, async) {
    function save_data(self) {
        self.model.save(self.model.attributes).done(function(data) {
            self.model.fetch().done(function() {
                self.render();

            })
        })
    }

    Handlebars.registerHelper('percent_num', function(data, data2) {


        return forcechangeTwoDecimal(data / data2 * 100)
    });

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

    var Quesetionnaire_Template_ResultView = Backbone.View.extend({
        // The View Constructor
        initialize: function() {
            this.quesetionnaire_template_rssult = Handlebars.compile($("#quesetionnaire_template_result_view").html());
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
            var rendered_data = '';
            self.qt_result_back_url = localStorage.getItem('qt_result_back_url') || null;
            localStorage.removeItem('qt_result_back_url'); //用完删掉 
            if (self.qt_result_back_url) { //有才设，没有则保持不变
                $("#btn-quesetionnaire_template_result_list-back").attr('href', self.qt_result_back_url);
            }

            var group = _.groupBy(self.qtis, function(qt) {
                return moment(qt.lastDate).format('YYYY-MM-DD')
            })
            var sorts = _.sortBy(_.keys(group), function(gp) {
                return gp
            })
            if (!self.current_time) {
                self.current_time = _.last(sorts);
            };

            var results = _.filter(group[self.current_time], function(ft) {
                return ft.status == '1';
            });

            var f_pp = _.find(results, function(rt) {
                return rt.people._id == self.people
            })
            console.log(f_pp)
            var my_result = [];
            if (f_pp) {
                _.each(_.first(f_pp.vote_items).results, function(rt) {
                    my_result.push(_.first(f_pp.vote_items).qti_options[rt.result].option)
                })
            };

            var num_sum = results.length + '/' + group[self.current_time].length;


            var items = []
            _.each(sorts.reverse(), function(k) {
                if (self.current_time == k) {
                    items.push('<option value=' + k + ' selected>' + k + '</option>')
                } else {

                    items.push('<option value=' + k + ' >' + k + '</option>')
                }
            })

            $("#quesetionnaire_template_result_select").html(items.join(''))

            $("#quesetionnaire_template_result_select").prev().html(self.current_time)

            var tts = [];
            if (results.length) {
                //列表
                var str = null;
                if (results[0].vote_items.length) {
                    str = "X";
                    var qtis = results[0].vote_items
                } else {
                    str = "Y";
                    var qtis = results[0].option_items
                }
                var items = []

                for (var i = 0; i < qtis.length; i++) {
                    var options = qtis[i].qti_options
                    var obj = {
                        qt: qtis[i].qti_name,
                        option: options,
                        results: []
                    }
                    for (var j = 0; j < results.length; j++) {
                        if (str == 'X') {
                            _.each(results[j].vote_items[i].results, function(rt) {
                                obj.results.push(rt.result)
                            })
                        } else {
                            _.each(results[j].option_items[i].results, function(rt) {
                                obj.results.push(rt.result)
                            })
                        }
                    };
                    items.push(obj)
                };


                for (var i = 0; i < items.length; i++) {
                    var options = items[i].option;
                    var results = items[i].results;
                    var o = {
                        qt: items[i].qt,
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
            }
            rendered_data = self.quesetionnaire_template_rssult({
                qt_name: self.qtis[0].qt_name,
                num_sum: num_sum,
                tts: tts,
                my_result: my_result
            });


            $("#quesetionnaire_template_result_list-content").html(rendered_data);
            $("#quesetionnaire_template_result_list-content").trigger('create');
            for (var i = 0; i < tts.length; i++) {
                var tis = tts[i].tis
                var obj = {
                    type: 'pie',
                    name: tts[i].qt,
                    data: []
                }

                for (var j = 0; j < tis.length; j++) {

                    obj.data.push([tis[j].op, tis[j].op_num])
                };

                var chart = new Highcharts.Chart({
                    chart: {
                        renderTo: "chart_" + i,
                        plotBackgroundColor: null,
                        plotBorderWidth: null,
                        plotShadow: false
                    },
                    title: {
                        text: tts[i].qt
                    },
                    tooltip: {
                        pointFormat: '<b>{point.percentage:.1f}%</b>'
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

                    plotOptions: {
                        pie: {
                            allowPointSelect: true,
                            cursor: 'pointer',
                            dataLabels: {
                                enabled: false
                            },
                            showInLegend: true
                        }
                    },
                    series: [obj]
                });
            };



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