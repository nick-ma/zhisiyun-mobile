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
            var group = _.groupBy(self.qtis, function(qt) {
                return moment(qt.lastDate).format('YYYY-MM-DD')
            })
            var sorts = _.sortBy(_.keys(group), function(gp) {
                return gp
            })
            if (!self.current_time) {
                self.current_time = _.last(sorts);
            };

            var results = group[self.current_time];
            var items = []
            _.each(sorts.reverse(), function(k) {
                if (self.current_time == k) {
                    items.push('<option value=' + k + ' selected>' + k + '</option>')
                } else {

                    items.push('<option value=' + k + ' >' + k + '</option>')
                }
            })

            $("#quesetionnaire_template_result_select").html(items.join(''))

            if (results.length) {


                //列表
                var qtis = results[0].option_items
                var items = []

                for (var i = 0; i < qtis.length; i++) {
                    var options = qtis[i].qti_options
                    var obj = {
                        qt: qtis[i].qti_name,
                        option: options,
                        results: []
                    }
                    for (var j = 0; j < results.length; j++) {
                        _.each(results[j].option_items[i].results, function(rt) {
                            obj.results.push(rt.result)
                        })
                    };
                    items.push(obj)
                };

                var tts = [];
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

                console.log(tts)



                // if (tts.length > 0) {
                //     var trs = []
                //     _.each(tts, function(tt) {
                //         trs.push('<li class="ui-field-contain">');
                //         trs.push('<span class="label-info">题目</span><span  class="m-ud-0p2em">' + tt.qt + '</span>')
                //         _.each(tt.tis, function(t) {
                //             trs.push('<div class="ui-grid-b">');
                //             trs.push('<div class="ui-block-a" style="width:5%;vertical-align:middle;text-align:right"></div>');
                //             trs.push('<div class="ui-block-b" style="width:90%;vertical-align:middle;">');
                //             trs.push('<p style="font-size: 15px;">  <span class="label-success"> 选 项</span><span  class="m-ud-0p2em">' + t.op + '<span></p></div>')
                //             trs.push('</div>');

                //             trs.push('<div class="ui-grid-a">');
                //             trs.push('<div class="ui-block-a" style="width:40%;vertical-align:middle;text-align:right">数 量: ' + t.num + '</div>');
                //             trs.push('<div class="ui-block-b" style="width:50%;vertical-align:middle;text-align:right">占 比: ' + forcechangeTwoDecimal(t.num / tt.sum * 100) + '%</div>');
                //             trs.push('</div>');
                //         })

                //         trs.push('</li>')

                //     })
                // }

                // $("#quesetionnaire_template_result_num_list").html(trs.join(''));

            }
            rendered_data = self.quesetionnaire_template_rssult({
                tts: tts
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
                        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
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
                                enabled: true,
                                color: '#000000',
                                connectorColor: '#000000',
                                format: '<b>{point.name}</b>: {point.percentage:.1f} %'
                            }
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
            $("#quesetionnaire_template_result_list").on('click', '#show_peoples', function(event) {
                // $.mobile.loading("show");
                // self.model_view = '1';
                // self.render();
                // $.mobile.loading("hide");
            }).on('change', '#quesetionnaire_template_result_select', function(event) {
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