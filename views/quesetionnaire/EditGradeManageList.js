// ToDo View
// =============

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "async"], function($, _, Backbone, Handlebars, async) {
    Handlebars.registerHelper('is_null', function(data, options) {
        if (data) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        };
    });
    Handlebars.registerHelper('delta', function(data, options) {
        if (data <= 0) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        };
    });

    Handlebars.registerHelper('rep_type', function(data) {
        if (data == '0') {
            return "<span class='label-info'>待提交</span>"
        } else if (data == '1') {
            return "<span class='label-success'>已提交</span>"
        } else {
            return "<span class='label-danger'>已终止</span>"
        }

    });
    Handlebars.registerHelper("addOne", function(index) {
        //利用+1的时机，在父级循环对象中添加一个_index属性，用来保存父级每次循环的索引
        this._index = index;
        //返回+1之后的结果
        return this._index;
    });
    Handlebars.registerHelper("parseFloat", function(data) {

        return parseFloat(data).toFixed(2);
    });
    Handlebars.registerHelper("my_result", function(result, options) {
        return options[result].option;
    });


    function forcechange(x) {
        var f_x = parseFloat(x);
        if (isNaN(f_x)) {
            return false;
        }
        var f_x = Math.round(x * 100) / 100;

        return f_x;
    }
    var ranks = [{
        num: '1',
        name: '自评'
    }, {
        num: '2',
        name: '上级'
    }, {
        num: '3',
        name: '同级'
    }, {
        num: '4',
        name: '下级'
    }, {
        num: '5',
        name: '上上级'
    }]
    var Quesetionnaire_manageListView = Backbone.View.extend({
        // The View Constructor
        initialize: function() {
            var self = this;
            this.quesetionnaire_manage_template = Handlebars.compile($("#quesetionnaire_manage_list_view").html());
            this.quesetionnaire_my_manage_template = Handlebars.compile($("#quesetionnaire_my_manage_list_view").html());
            this.quesetionnaire_survey_template = Handlebars.compile($("#quesetionnaire_survey_manage_list_view").html());
            this.quesetionnaire_exam_template = Handlebars.compile($("#quesetionnaire_exam_manage_list_view").html());

            this.collection.on("sync", this.render, this);
            this.view_mode = '1';
            this.date_typeset = '0'; //过滤类型
            this.period_set = null;
            this.qti_items = [];
            this.bind_event();

        },
        // Renders all of the Task models on the UI
        render: function() {
            var self = this;


            var rendered_data = '';
            var obj = {};

            var group_obj = _.groupBy(_.filter(self.collection.toJSON(), function(m) {
                return m.period
            }), function(s) {
                return s.period.period + '==' + s.period._id
            })
            var items = []
            items.push('<option value="" ' + (('' == self.period_set + '') ? 'selected' : '') + '>全部</option>')
            _.each(_.keys(group_obj), function(group) {

                items.push('<option value="' + group.split('==')[1] + '" ' + ((group.split('==')[1] == self.period_set) ? 'selected' : '') + '>' + group.split('==')[0] + '</option>')
            })

            $("#quesetionnaire_period_set").html(items.join(''))

            var data_items = _.filter(self.collection.toJSON(), function(x) {
                return self.date_typeset == '0' ? true : x.mark == self.date_typeset;
            })
            if (self.period_set) {
                data_items = _.filter(data_items, function(data) {
                    return (data.period ? data.period._id : null) == String(self.period_set)
                })
            };
            $.get('/admin/pm/questionnair_template/get_my_qis_report_json', function(data) {
                self.qis = data.qis;
                _.each($("#quesetionnaire_manage_list-left-panel label"), function(x) {
                    var state = $(x).data('state');
                    var filters = []
                    if (state == '0' || state == '1') {
                        filters = _.filter(self.collection.toJSON(), function(s) {
                            return s.status == state;
                        });
                    } else {
                        var nums = ['3', '4', '5']
                        var mbtis = _.filter(data_items, function(x) {
                            return !!~nums.indexOf(x.mark);
                        });
                        filters = _.flatten([self.qis, mbtis], true);
                    }
                    $(x).find('span').html(filters.length || 0);
                })

            })
            $("#quesetionnaire_manage_list-content_02").hide();
            $("#quesetionnaire_manage_list-content").show();
            if (self.view_mode == '1') {
                //待提交
                obj.datas = _.filter(data_items, function(x) {
                    return x.status == '0';
                });
                $("#quesetionnaire_manage_list-content").html(self.quesetionnaire_manage_template(obj));
                $("#quesetionnaire_manage_list-content").trigger('create');
                $("#show_tip").html('没有可提交问卷！')
            } else if (self.view_mode == '2') {
                //已评分
                obj.datas = _.filter(data_items, function(x) {
                    return x.status == '1';
                });
                $("#quesetionnaire_manage_list-content").html(self.quesetionnaire_manage_template(obj));
                $("#quesetionnaire_manage_list-content").trigger('create');
                $("#show_tip").html('没有已提交问卷！')
            } else if (self.view_mode == '3') {
                var nums = ['3', '4', '5']
                var mbtis = _.filter(data_items, function(x) {
                    return !!~nums.indexOf(x.mark);
                });
                var q_items = [];
                _.each(self.qis, function(q) {
                    var obj = {};
                    obj.qt_id = q._id;
                    obj.title = q.qt_name;
                    obj.period = q.period;
                    obj.period_id = q.period._id;
                    obj.createDate = q.createDate;
                    obj.due_date = q.lastDate;
                    obj.total_score = Math.round(q.score * 100) / 100;
                    obj.status = q.status;
                    var s1 = _.find(q.dimensions, function(i) {
                        return i.dimension == '1';
                    });
                    var s2 = _.find(q.dimensions, function(i) {
                        return i.dimension == '2';
                    });
                    var s3 = _.find(q.dimensions, function(i) {
                        return i.dimension == '3';
                    });
                    var s4 = _.find(q.dimensions, function(i) {
                        return i.dimension == '4';
                    });
                    var s5 = _.find(q.dimensions, function(i) {
                        return i.dimension == '5';
                    });
                    var s6 = _.find(q.dimensions, function(i) {
                        return i.dimension == '6';
                    });
                    obj.s1_score = (s1 ? Math.round(s1.score * 100) / 100 : '无');
                    obj.s2_score = (s2 ? Math.round(s2.score * 100) / 100 : '无');
                    obj.s3_score = (s3 ? Math.round(s3.score * 100) / 100 : '无');
                    obj.s4_score = (s4 ? Math.round(s4.score * 100) / 100 : '无');
                    obj.s5_score = (s5 ? Math.round(s5.score * 100) / 100 : '无');
                    obj.s6_score = (s6 ? Math.round(s6.score * 100) / 100 : '无');
                    q_items.push(obj);
                });

                var q_items = _.filter(q_items, function(x) {
                    return self.date_typeset == '0' ? true : '1' == self.date_typeset;
                })
                if (self.period_set) {
                    q_items = _.filter(q_items, function(data) {
                        return data.period_id == String(self.period_set)
                    })
                };

                obj.datas = _.flatten([q_items, mbtis], true);

                $("#quesetionnaire_manage_list-content").html(self.quesetionnaire_my_manage_template(obj));
                $("#quesetionnaire_manage_list-content").trigger('create');
            } else if (self.view_mode == '4') {

                $("#quesetionnaire_manage_list-content_02").show();
                $("#quesetionnaire_manage_list-content").hide();

                var q_insatnce = _.find(self.qis, function(q) {
                    return q._id == self.qt_id
                })
                if (q_insatnce) {
                    var dimensions = [];
                    var data = [];
                    _.each(q_insatnce.dimensions, function(d) {
                        var f_d = _.find(ranks, function(r) {
                            return r.num == d.dimension
                        })
                        dimensions.push({
                            name: f_d.name,
                            score: forcechange(d.f_score)
                        })
                        var o = {};
                        o.name = f_d.name;
                        o.data = [];
                        o.titles = [];
                        _.each(d.items, function(i) {
                            _.each(i.qtis, function(q) {
                                o.titles.push(q.qti_name);
                                o.data.push(forcechange(q.f_score));
                            })
                        })
                        data.push(o)
                    })
                    var titles = data[0].titles;
                    data = _.map(data, function(d) {
                        return _.omit(d, 'titles')
                    })
                    var sc_option = {
                        chart: {
                            renderTo: 'spider_chart_qt_container',
                            polar: true,
                            type: 'line',
                            // width: 288,
                            height: 300,
                        },
                        title: {
                            text: q_insatnce.qt_name,
                        },
                        subtitle: {
                            text: q_insatnce.period.period
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
                            size: '75%'
                        },

                        xAxis: {
                            categories: titles,
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
                            pointFormat: '<span style="color:{series.color}">{series.name}: <b>{point.y:,.0f}分</b><br/>'
                        },

                        legend: {
                            align: 'center',
                            verticalAlign: 'bottom',
                            // y: 70,
                            layout: 'horizontal'
                        },

                        series: data

                    };
                    var chart = new Highcharts.Chart(sc_option);
                    // 综合得分
                    var score_ret = [];
                    score_ret.push('<h2>综合得分:' + forcechange(q_insatnce.score) + '</h2>')
                    // var dimensions = self.model.get('dimensions');
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

                    $("#spider_chart_qt_score").html(score_ret.join(''));

                } else {
                    $("#spider_chart_qt_container").html("<h2>没有找到问卷数据</h2>");
                }

            } else if (self.view_mode == '5') {
                $("#quesetionnaire_manage_list #common_name").html('调研问卷')
                var q_insatnce = _.find(self.collection.toJSON(), function(q) {
                    return q.operation_id == self.operation_id
                })
                $.get('/admin/pm/questionnair_template/get_questionnair_survey_bblist/' + q_insatnce.qtc + '/' + q_insatnce.createDate, function(results) {

                    _.each(q_insatnce.datas, function(data) {
                        _.each(data.qti_options, function(qt) {
                            var f_d = _.find(results, function(rt) {
                                return rt.qt_name == data.qti_name && rt.op == qt.option
                            })
                            qt.pc = f_d.pc
                        })
                    })
                    $("#quesetionnaire_manage_list-content").html(self.quesetionnaire_survey_template(q_insatnce));
                    $("#quesetionnaire_manage_list-content").trigger('create');
                })

            } else if (self.view_mode == '6') {

                $("#quesetionnaire_manage_list #common_name").html('测试问卷')
                var q_insatnce = _.find(self.collection.toJSON(), function(q) {
                    return q.operation_id == self.operation_id
                })
                $("#quesetionnaire_manage_list-content").html(self.quesetionnaire_exam_template(q_insatnce));
                $("#quesetionnaire_manage_list-content").trigger('create');
                $('#quesetionnaire_manage_list-content .btn_dis').attr('disabled', true)
            }


            return self;
        },
        bind_event: function() {
            var self = this
            $("#quesetionnaire_manage_list").on('swiperight', function(event) { //向右滑动，打开左边的面板
                event.preventDefault();
                $("#quesetionnaire_manage_list-left-panel").panel("open");
            }).on('change', '#quesetionnaire_manage_list-left-panel input[name=quesetionnaire_manage]', function(event) {
                event.preventDefault();
                var $this = $(this);
                self.view_mode = $this.val();
                self.render();
                $("#quesetionnaire_manage_list-left-panel").panel("close");
            }).on('change', '#quesetionnaire_manage_list-left-panel select', function(event) {
                event.preventDefault();
                var $this = $(this);
                var field = $this.data("field");
                var value = $this.val();
                if (field == 'date_period') { //需要重新获取数据
                    $.mobile.loading("show");
                    self.period_set = value
                } else if (field == 'date_qt_type') {
                    $.mobile.loading("show");
                    self.date_typeset = value
                }
                self.render();
                $.mobile.loading("hide");
                // $("#colltask-left-panel").panel("close");
            }).on('click', '.btn_to_detail', function(event) {
                event.preventDefault();
                var type = $(this).data('type')
                var mark = $(this).data('mark')
                if (type && type == '4') {
                    window.location.href = '#godo/' + $(this).data('operation_id') + '/' + type
                } else if (type && type == '3') {
                    var operation_id = $(this).data('operation_id');
                    self.operation_id = operation_id;
                    if (mark == '3') {
                        self.view_mode = '5';
                        self.render();
                    } else {
                        self.view_mode = '6';
                        self.render();
                    }
                } else {
                    self.view_mode = '4';
                    var qt_id = $(this).data('qt_id');
                    self.qt_id = qt_id;
                    self.render();
                }


            }).on('click', '#btn-quesetionnaire_manage_list-back', function(event) {
                event.preventDefault();
                if (self.view_mode != '4' && self.view_mode != '5' && self.view_mode != '6') {
                    if ($("#req_ua").val() == 'normal') {
                        window.location.href = '#home';
                    } else {
                        window.location.href = '#';
                    };
                } else {
                    self.view_mode = '3';
                    self.render();
                }

            }).on('click', '#btn-quesetionnaire_manage-refresh', function(event) {
                event.preventDefault();
                $.mobile.loading("show");
                self.collection.fetch().done(function() {
                    self.render();
                    $.mobile.loading("hide");
                    $("#quesetionnaire_manage_list-left-panel").panel("close");
                })

            })
        },

    });

    // Returns the View class
    return Quesetionnaire_manageListView;

});