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
            return "<span class='label-dange'>已终止</span>"
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


    var Quesetionnaire_manageListView = Backbone.View.extend({
        // The View Constructor
        initialize: function() {
            this.quesetionnaire_manage_template = Handlebars.compile($("#quesetionnaire_manage_list_view").html());
            this.quesetionnaire_my_manage_template = Handlebars.compile($("#quesetionnaire_my_manage_list_view").html());
            this.quesetionnaire_my_manage_datail_template = Handlebars.compile($("#quesetionnaire_my_datail_manage_list_view").html());



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
                        filters = data.qis;
                    }
                    $(x).find('span').html(filters.length || 0);
                })
            })

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
                var q_items = []
                _.each(self.qis, function(q) {
                    var obj = {};
                    obj.qt_id = q._id;
                    obj.qt_name = q.qt_name;
                    obj.period = q.period.period;
                    obj.period_id = q.period._id;
                    obj.total_score = Math.round(q.score * 100) / 100;

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
                obj.datas = q_items;
                $("#quesetionnaire_manage_list-content").html(self.quesetionnaire_my_manage_template(obj));
                $("#quesetionnaire_manage_list-content").trigger('create');
            } else {
                // var qt_id = $(this).data('qt_id');
                var qo = _.find(self.qis, function(q) {
                    return q._id == self.qt_id
                })

                var items = _.clone(qo.dimensions[0].items);
                //重新组装分类的得分
                var index = 0;
                _.each(items, function(x) {
                    var index2 = 0;
                    var item_sum_score = 0;
                    _.each(qo.dimensions, function(xx) {
                        item_sum_score += parseFloat(xx.items[index].score * xx.weight / 100);
                    });
                    x.score = item_sum_score;
                    x.f_score = parseFloat(item_sum_score / x.weight * 100);
                    index++;
                });
                //重新组装题目的得分
                var index1 = 0;
                _.each(items, function(x) {
                    var index2 = 0;
                    _.each(x.qtis, function(xx) {
                        var qti_sum_score = 0;
                        _.each(qo.dimensions, function(xxx) {
                            qti_sum_score += parseFloat(xxx.items[index1].qtis[index2].score * xxx.weight / 100);
                        });
                        xx.score = qti_sum_score;
                        xx.f_score = parseFloat(qti_sum_score / xx.qti_weight * 100);
                        index2++;
                    });
                    index1++;
                });
                var o = {};
                o.qt_name = qo.qt_name
                o.score = parseFloat(qo.score).toFixed(2);
                o.items = items
                self.my_items = o;
                $("#quesetionnaire_manage_list-content").html(self.quesetionnaire_my_manage_datail_template(o));
                $("#quesetionnaire_manage_list-content").trigger('create');
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
                self.view_mode = '4';
                var qt_id = $(this).data('qt_id');
                self.qt_id = qt_id;
                self.render();

            }).on('click', '#btn-quesetionnaire_manage_list-back', function() {
                event.preventDefault();
                // self.view_mode = '3';
                if (self.view_mode != '4') {
                    window.location = '#home'
                } else {
                    self.view_mode = '3';
                    self.render();
                }

            })
        },

    });

    // Returns the View class
    return Quesetionnaire_manageListView;

});