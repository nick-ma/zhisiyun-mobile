// Competency SpiderChart  View
// ============================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars"],
    function($, _, Backbone, Handlebars) {

        // Extends Backbone.View
        var CompetencySpiderChartView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                this.template = Handlebars.compile($("#hbtmp_competency_spider_chart_view").html());
                // The render method is called when People Models are added to the Collection
                // this.collection.on("sync", this.render, this);
                $("#spider_chart_container").width($(document.body).width() - 32); //去掉2个em的距离
                $("#spider_chart_container").height($(document.body).width());
            },

            // Renders all of the People models on the UI
            render: function(people_id, qi_id) {
                var self = this;
                // console.log(self.model);
                // console.log(Highcharts); //test if Highcharts inplace


                // console.log($.highcharts);

                var title = self.model.get('qt_name');
                var subtitle = self.model.get('period_name');
                var categories = self.model.get('titles');
                var series = self.model.get('data');
                var sc_option = {

                    chart: {
                        renderTo: 'spider_chart_container',
                        polar: true,
                        type: 'line',
                        // width: 288,
                        // height: 300,
                    },

                    title: {
                        text: title,
                    },
                    subtitle: {
                        text: subtitle
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
                    pane: {
                        size: '80%'
                    },

                    xAxis: {
                        categories: categories,
                        tickmarkPlacement: 'on',
                        lineWidth: 0
                    },

                    yAxis: {
                        gridLineInterpolation: 'polygon',
                        lineWidth: 0,
                        min: 0
                    },

                    tooltip: {
                        shared: true,
                        pointFormat: '<span style="color:{series.color}">{series.name}: <b>${point.y:,.0f}</b><br/>'
                    },

                    legend: {
                        align: 'center',
                        verticalAlign: 'bottom',
                        // y: 70,
                        layout: 'horizontal'
                    },

                    series: series

                };
                var chart = new Highcharts.Chart(sc_option);
                // 综合得分
                var score_ret = [];
                score_ret.push('<h2>综合得分:' + self.model.get('score') + '</h2>')
                var dimensions = self.model.get('dimensions');
                var grad_css = ['', 'ui-grid-a', 'ui-grid-b', 'ui-grid-c'];
                var block_css = ['ui-block-a', 'ui-block-b', 'ui-block-c', 'ui-block-d'];
                if (dimensions.length > 1) {
                    score_ret.push('<div class="' + grad_css[dimensions.length] + '">')
                    for (var i = 0; i < dimensions.length; i++) {
                        score_ret.push('<div class="' + block_css[i] + '">')
                        score_ret.push('<p>' + dimensions[i].name + ':' + dimensions[i].score + '</p>');
                        score_ret.push('</div>');
                    };
                    score_ret.push('</div>');
                } else {
                    score_ret.push('<p>' + dimensions[0].name + ':' + dimensions[0].score + '</p>')
                };

                $("#spider_chart_score").html(score_ret.join(''));


                // console.log($("#spider_chart_container").width());
                return this;
            }

        });

        // Returns the View class
        return CompetencySpiderChartView;

    });