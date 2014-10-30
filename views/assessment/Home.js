// Assessment View
// =============

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "highcharts","moment", "../../models/AssessmentModel"],
    function($, _, Backbone, Handlebars, Highcharts,moment, AssessmentModel) {
        var p_parent_titles = [],
            p_children_datas = [],
            p_parent_datas = [];

        function changeTwoDecimal(x) {
            var f_x = parseFloat(x);
            if (isNaN(f_x)) {
                return false;
            }
            var f_x = Math.round(x * 100) / 100;
            return f_x;
        }
        var my_basic_performance_column = function(content, categories_data, series_data) {
            // content.highcharts({
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
                subtitle: {
                    enabled: false
                },
                legend: {
                    enabled: false
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: ''
                    }
                },
                series: series_data,
                tooltip: {
                    formatter: function() {
                        var point = this.point,
                            s = "绩效得分" + ':<b>' + this.y + '</b><br/>';
                        if (point) {
                            s += '单击查看指标';
                        } else {
                            s += '单击返回';
                        }
                        return s;
                    }
                },
                plotOptions: {
                    column: {
                        cursor: 'pointer',
                        point: {
                            events: {
                                click: function() {
                                    x = this.x
                                    var f_t = _.find(p_children_datas[this.x], function(f) {
                                        return f.type == 'column';
                                    })
                                    my_basic_performance_column_children('my_performance_data', f_t.titles, p_children_datas[this.x]);
                                }
                            }
                        },
                        pointPadding: 0.2,
                        borderWidth: 0
                    }
                },

            });
        }
        var my_basic_performance_column_children = function(content, categories_data, series_data) {
            // content.highcharts({
            var chart = new Highcharts.Chart({
                chart: {
                    zoomType: 'xy',
                    renderTo: content,
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
                title: {
                    text: '',
                    floating: true
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
                            fontSize: '13px',
                            fontFamily: 'Verdana, sans-serif'
                        }
                    }

                },
                yAxis: [{ // Primary yAxis
                    labels: {
                        formatter: function() {
                            return this.value;
                        },
                        style: {
                            color: '#89A54E'
                        }
                    },
                    title: {
                        text: '',
                        style: {
                            color: '#89A54E'
                        }
                    },
                    opposite: true,
                    min: 0,

                }, { // Secondary yAxis
                    gridLineWidth: 0,
                    title: {
                        text: '',
                        style: {
                            color: '#4572A7'
                        }
                    },
                    labels: {
                        formatter: function() {
                            return this.value;
                        },
                        style: {
                            color: '#4572A7'
                        }
                    },
                }],
                tooltip: {
                    formatter: function() {
                        var f_t = _.find(p_children_datas[x], function(f) {
                            return f.type == 'column'
                        })
                        var fullname_obj = _.object(f_t.titles, f_t.full_titles)
                        var table = [];
                        table.push('<span style="font-size:10px">' + fullname_obj[this.x] + '</span><br><table>');
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
                                    my_basic_performance_column('my_performance_data', p_parent_titles, p_parent_datas);
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
        var draw_my_performance = function(collection) {
                //我的绩效数据按周期类型分组
                p_parent_titles.length = 0;
                p_parent_datas.length = 0;
                p_children_datas.length = 0;
                var performance_g = _.groupBy(collection, function(p) {
                    return p.period_type
                })
                var p_t_k = _.keys(performance_g);
                var p_t_v = _.values(performance_g);
                var temp_obj = {};
                temp_obj.data = [];
                _.each(p_t_k, function(p) {
                    _.each(performance_g[p], function(q) {

                        p_parent_titles.push((q.period_name.length > 5) ? q.period_name.substring(5) : q.period_name);
                        temp_obj.data.push(changeTwoDecimal(q.ai_score) || 0);
                        var child_datas = [];
                        var f_qs = _.flatten([q.quantitative_pis.items, q.qualitative_pis.items], true)
                        var childs = [];
                        var child_objs = {};
                        child_objs.data = [];
                        child_objs.name = '计分';
                        child_objs.type = 'column';
                        child_objs.yAxis = 1;
                        child_objs.titles = [];
                        child_objs.full_titles = [];
                        var weight_objs = {};
                        weight_objs.data = [];
                        weight_objs.name = '权重';
                        weight_objs.type = 'spline';
                        weight_objs.color = '#89A54E';
                        _.each(f_qs, function(f) {
                            child_objs.data.push(changeTwoDecimal(f.f_score || 0));
                            weight_objs.data.push(f.weight || 0)
                            var f_piname = String(f.pi_name)
                            if (f.pi) {
                                child_objs.full_titles.push(f_piname);
                                child_objs.titles.push(f_piname.slice(0, 4));
                            };
                            if (q.questionnairs && q.questionnairs.score != 0) {
                                child_objs.data.push(changeTwoDecimal(q.questionnairs.score));
                                weight_objs.data.push(q.questionnairs.weight || 0)
                                child_objs.titles.push('360');
                                child_objs.full_titles.push('360');
                            };
                        })
                        childs.push(child_objs);
                        childs.push(weight_objs);
                        p_children_datas.push(childs);
                    })

                })
                p_parent_datas.push(temp_obj);
                my_basic_performance_column('my_performance_data', p_parent_titles, p_parent_datas);
            }
            // Extends Backbone.View
        var AssessmentView = Backbone.View.extend({
            // The View Constructor
            initialize: function() {
                this.template = Handlebars.compile($("#hbtmp_assessment_wip_view").html());
                this.history_template = Handlebars.compile($("#hbtmp_assessment_history_view").html());
                this.left_template = Handlebars.compile($("#hbtmp_assessment_left_view").html());
                this.view_mode = '1';
                // The render method is called when Assessment Models are added to the Collection
                // this.collection.on("sync", this.render, this);
                this.bind_event();
            },

            // Renders all of the Assessment models on the UI
            render: function() {

                var self = this;

                if (self.view_mode == '1') {
                    var rendered = [];
                    var aiws = _.filter(this.collection.models, function(x) {
                        return (parseInt(x.get('ai_status')) < 9); //找出来“考核中”的合同
                    })
                    _.each(aiws, function(x) {
                        // x.attributes.pi_count = x.attributes.qualitative_pis.items.length + x.attributes.quantitative_pis.items.length;
                        rendered.push(self.template(x.attributes));
                    });
                    $("#assessment_name").html('我的绩效目标');
                    $("#home-assessment_wip-num").html(aiws.length);
                    $("#home-assessment_wip-list").html(rendered.join(''));
                    $("#home-assessment_wip-list").trigger('create');

                    var my_performance_data = [];
                    _.each(this.collection.models, function(x) {
                        my_performance_data.push(x.attributes);
                    })
                    my_performance_data = _.sortBy(my_performance_data, function(x) {
                        return x.createDate;
                    })
                    draw_my_performance(my_performance_data);
                }

                return this;

            },

            bind_event: function() {
                var self = this;
                $("#assessment_list-footer")
                    .on('click', '.btn-assessment-change_state', function(event) {
                        var $this = $(this);
                        self.view_filter = $this.data('view_filter');

                        if (self.view_filter) {
                            self.peoples = _.filter(self.c_people.models, function(x) {
                                return x.attributes[self.view_filter];
                            })

                            var rendered = {
                                people: [],
                            };
                            _.each(self.peoples, function(x) {
                                rendered.people.push(x.attributes);
                            });

                            $("#assessment_list-left-panel-content").html(self.left_template(rendered));
                            $("#assessment_list-left-panel-content").trigger('create');

                            $("#assessment_list-left-panel").panel("open");
                        } else { //自己侧边栏
                            self.view_mode = '1';
                            self.render();
                            self.homeAssessmentHistoryView.view_mode = '1';
                            self.homeAssessmentHistoryView.render();
                        }
                        $('.btn-assessment-change_state').removeClass('ui-btn-active');
                        $this.addClass('ui-btn-active');
                    });
                $("#assessment_list-left-panel-content")
                    .on('change', '.goto_sub_assessment', function(event) {
                        var $this = $(this);
                        self.c_assessment_sub.people = $this.data('up_id');
                        $("#assessment_name").html($this.data('people_name') + '的绩效');

                        self.c_assessment_sub.fetch().done(function() {
                            var rendered1 = [];
                            var aiws = _.filter(self.c_assessment_sub.models, function(x) {
                                return (parseInt(x.get('ai_status')) < 9); //找出来“考核中”的合同
                            })
                            _.each(aiws, function(x) {
                                rendered1.push(self.template(x.attributes));
                            });
                            $("#home-assessment_wip-num").html(aiws.length);
                            $("#home-assessment_wip-list").html(rendered1.join(''));
                            $("#home-assessment_wip-list").trigger('create');

                            var rendered2 = [];
                            var aihs = _.filter(self.c_assessment_sub.models, function(x) {
                                return (parseInt(x.get('ai_status')) >= 9); //找出来“考核完成”的合同
                            })
                            _.each(aihs, function(x) {
                                rendered2.push(self.history_template(x.attributes));
                            });
                            $("#home-assessment_history-num").html(aihs.length);
                            $("#home-assessment_history-list").html(rendered2.join(''));
                            $("#home-assessment_history-list").trigger('create');

                            var my_performance_data = [];
                            _.each(self.c_assessment_sub.models, function(x) {
                                my_performance_data.push(x.attributes);
                            })

                            my_performance_data = _.sortBy(my_performance_data, function(x) {
                                return x.createDate;
                            })

                            draw_my_performance(my_performance_data);

                            self.view_mode = '2';
                            self.homeAssessmentHistoryView.view_mode = '2';

                            $("#assessment_list-left-panel").panel("close");
                        })
                    });
            }

        });

        // Returns the View class
        return AssessmentView;

    });