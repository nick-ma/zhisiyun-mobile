// Talent 9 Grids Chart  View 人才盘点用的九宫图
// ============================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars"],
    function($, _, Backbone, Handlebars) {

        // Extends Backbone.View
        var CompetencySpiderChartView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                // this.template = Handlebars.compile($("#hbtmp_competency_spider_chart_view").html());
                // The render method is called when People Models are added to the Collection
                // this.collection.on("sync", this.render, this);
                $("#talent_9_grids_chart_container").width($(document.body).width() - 32); //去掉2个em的距离
                $("#talent_9_grids_chart_container").height($(document.body).width() - 50);
            },

            // Renders all of the People models on the UI
            render: function(horoscope, ai_score, score,people_id) {
                var self = this;
                // console.log(self.model);
                // console.log(Highcharts); //test if Highcharts inplace


                // console.log($.highcharts);
                function filter_color(type_val, horo) {
                    var found = _.find(horo, function(temp) {
                        return temp.block_name == type_val
                    })
                    return found;
                }

                var chart_option = {
                    chart: {
                        renderTo: 'talent_9_grids_chart_container',
                        type: 'scatter',
                        zoomType: 'xy'
                    },
                    title: {
                        text: null,
                        enabled: true,
                    },
                    exporting: {
                        enabled: false
                    },
                    subtitle: {
                        enabled: false
                    },
                    xAxis: {
                        title: {
                            text: horoscope.x_title
                        },
                        min: 0,
                        max: horoscope.xis_max,

                    },
                    legend: {
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
                    yAxis: {
                        min: 0,
                        max: horoscope.yis_max,
                        gridLineWidth: 0,
                        title: {
                            text: horoscope.y_title.split('').join('<br>'),
                            rotation: 0,
                        },
                    },

                    tooltip: {
                        headerFormat: '<span style="color:{series.color};font-size:10px">{series.name}</span><table>',
                        pointFormat: '<tr><td  style="padding:0"><b>绩效得分: {point.x}</b> </td></tr><tr><td style="padding:0"><b>能力得分: {point.y} </b></td></tr>',
                        footerFormat: '</table>',
                        shared: true,
                        useHTML: true
                    },
                    series: [{
                        data: [
                            [parseFloat(ai_score), parseFloat(score)],
                        ]
                    }]

                };
                var chart = new Highcharts.Chart(chart_option, function(chart) {
                    var X1 = horoscope.x_a;
                    var X2 = horoscope.x_b;
                    var x = horoscope.xis_max;
                    var y = horoscope.yis_max;
                    var Y2 = horoscope.y_b;
                    var Y1 = horoscope.y_a;
                    var color_title = horoscope.color;
                    var x0 = chart.xAxis[0].toPixels(0, false);
                    var x1 = chart.xAxis[0].toPixels(X1, false);
                    var x2 = chart.xAxis[0].toPixels(X2, false);
                    var x3 = chart.xAxis[0].toPixels(x, false);

                    var y0 = chart.yAxis[0].toPixels(y, false);
                    var y1 = chart.yAxis[0].toPixels(Y2, false);
                    var y2 = chart.yAxis[0].toPixels(Y1, false);
                    var y3 = chart.yAxis[0].toPixels(0, false);
                    var title_color1 = filter_color('1', color_title);
                    var title_color2 = filter_color('2', color_title);
                    var title_color3 = filter_color('3', color_title);

                    var title_color4 = filter_color('4', color_title);
                    var title_color5 = filter_color('5', color_title);
                    var title_color6 = filter_color('6', color_title);

                    var title_color7 = filter_color('7', color_title);
                    var title_color8 = filter_color('8', color_title);
                    var title_color9 = filter_color('9', color_title);
                    var color_d1 = chart.renderer.rect(x0, y2, x1 - x0, y3 - y2, 1).attr({
                        fill: title_color1.color_type,
                        id: 'color_d1_title',
                        title: title_color1.color_des_category + ':' + title_color1.color_description,
                        zIndex: 0
                    }).add();
                    chart.renderer.rect(x0, y1, x1 - x0, y2 - y1, 1).attr({
                        fill: title_color2.color_type,
                        id: 'color_d2',
                        title: title_color2.color_des_category + ':' + title_color2.color_description,
                        zIndex: 0
                    }).add();
                    chart.renderer.rect(x0, y0, x1 - x0, y1 - y0, 1).attr({
                        fill: title_color3.color_type,
                        id: 'color_d3',
                        title: title_color3.color_des_category + ':' + title_color3.color_description,
                        zIndex: 0
                    }).add();
                    chart.renderer.rect(x1, y2, x2 - x1, y3 - y2, 1).attr({
                        fill: title_color4.color_type,
                        title: title_color4.color_des_category + ':' + title_color4.color_description,
                        id: 'color_d4',
                        zIndex: 0
                    }).add();
                    chart.renderer.rect(x1, y1, x2 - x1, y2 - y1, 1).attr({
                        fill: title_color5.color_type,
                        id: 'color_d5',
                        title: title_color5.color_des_category + ':' + title_color5.color_description,
                        zIndex: 0
                    }).add();
                    chart.renderer.rect(x1, y0, x2 - x1, y1 - y0, 1).attr({
                        fill: title_color6.color_type,
                        id: 'color_d6',
                        title: title_color6.color_des_category + ':' + title_color6.color_description,
                        zIndex: 0
                    }).add();
                    chart.renderer.rect(x2, y2, x3 - x2, y3 - y2, 1).attr({
                        fill: title_color7.color_type,
                        id: 'color_d7',
                        title: title_color7.color_des_category + ':' + title_color7.color_description,
                        zIndex: 0
                    }).add();
                    chart.renderer.rect(x2, y1, x3 - x2, y2 - y1, 1).attr({
                        fill: title_color8.color_type,
                        id: 'color_d8',
                        title: title_color8.color_des_category + ':' + title_color8.color_description,
                        zIndex: 0
                    }).add();
                    chart.renderer.rect(x2, y0, x3 - x2, y1 - y0, 1).attr({
                        fill: title_color9.color_type,
                        id: 'color_d9',
                        title: title_color9.color_des_category + ':' + title_color9.color_description,
                        zIndex: 0
                    }).add();
                });
                // // 综合得分
                // var score_ret = [];
                // score_ret.push('<h2>综合得分:' + self.model.get('score') + '</h2>')
                // var dimensions = self.model.get('dimensions');
                // var grad_css = ['', 'ui-grid-a', 'ui-grid-b', 'ui-grid-c'];
                // var block_css = ['ui-block-a', 'ui-block-b', 'ui-block-c', 'ui-block-d'];
                // if (dimensions.length > 1) {
                //     score_ret.push('<div class="' + grad_css[dimensions.length] + '">')
                //     for (var i = 0; i < dimensions.length; i++) {
                //         score_ret.push('<div class="' + block_css[i] + '">')
                //         score_ret.push('<p>' + dimensions[i].name + ':' + dimensions[i].score + '</p>');
                //         score_ret.push('</div>');
                //     };
                //     score_ret.push('</div>');
                // } else {
                //     score_ret.push('<p>' + dimensions[0].name + ':' + dimensions[0].score + '</p>')
                // };

                // $("#spider_chart_score").html(score_ret.join(''));
                if (people_id=='self') {
                    $("#btn-talent_9_grids_chart-back").attr('href', '#goto/myprofile_basic')
                }else{
                    $("#btn-talent_9_grids_chart-back").attr('href', '#goto/myteam_detail-talent')
                };


                // console.log($("#spider_chart_container").width());
                return this;
            }

        });

        // Returns the View class
        return CompetencySpiderChartView;

    });