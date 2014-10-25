// ToDo View
// =============

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "async"], function($, _, Backbone, Handlebars, async) {
    Handlebars.registerHelper('is_G', function(data, options) {
        if (data != 'G') {
            return options.fn(this);
        } else {
            return options.inverse(this);
        };
    });

    Handlebars.registerHelper('index_eq', function(data, data2, options) {
        var f_d = _.find(data2, function(dt) {
            return dt.result == data
        })
        if (f_d) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        };
    });

    Handlebars.registerHelper('is_radio', function(data, options) {
        if (data == '1') {
            return options.fn(this);
        } else {
            return options.inverse(this);
        };
    });
    Handlebars.registerHelper('qtis_num', function(data) {
        return data.length
    });
    Handlebars.registerHelper("add_One", function(index) {
        //利用+1的时机，在父级循环对象中添加一个_index属性，用来保存父级每次循环的索引
        this._index = index;
        //返回+1之后的结果
        return this._index;
    });
    Handlebars.registerHelper("add", function(index) {
        //利用+1的时机，在父级循环对象中添加一个_index属性，用来保存父级每次循环的索引
        this._index = index + 1;
        //返回+1之后的结果
        return this._index;
    });
    Handlebars.registerHelper("eq_type", function(data) {
        var str = null;
        if (data == '1') {
            str = '单选'
        } else {
            str = '多选'
        }
        return str;
    });
    var Quesetionnaire_360ListView = Backbone.View.extend({
        // The View Constructor
        initialize: function() {
            this.quesetionnaire_grade_common_template = Handlebars.compile($("#quesetionnaire_grade_common_list_view").html());
            this.quesetionnaire_option_common_template = Handlebars.compile($("#quesetionnaire_option_common_list_view").html());
            this.quesetionnaire_test_common_template = Handlebars.compile($("#quesetionnaire_test_common_list_view").html());
            this.quesetionnaire_vote_common_template = Handlebars.compile($("#quesetionnaire_vote_common_list_view").html());


            this.loading_template = Handlebars.compile($("#loading_template_view").html());
            this.model.on("sync", this.render, this);
            this.bind_event();
        },
        // Renders all of the Task models on the UI
        pre_render: function() {
            var self = this;
            $("#quesetionnaire_common_list-content").html(self.loading_template({
                info_msg: '数据加载中...请稍候'
            }));
            $("#quesetionnaire_common_list-content").trigger('create');
            return this;
        },
        render: function() {
            var self = this;
            var rendered_data = '';
            $("#quesetionnaire_common_list #btn-quesetionnaire_common_list-back").attr('href', '#qt_manage');

            if (self.model.attributes.qtc.questionnair_category == '1') {
                $("#common_name").html('满意度调查问卷')
                var url = '/admin/pm/performance_level/grade_group_get_json_data_byId/' + self.model.attributes.qtc.grade_group;
                $.get(url, function(data) {
                    if (data.code = 'OK') {
                        self.gg_grades = data.data.gg_grades;
                        var obj = _.clone(self.model.attributes);
                        obj.gg_grades = self.gg_grades;
                        rendered_data = self.quesetionnaire_grade_common_template(obj);
                        $("#quesetionnaire_common_list-content").html(rendered_data);
                        $("#quesetionnaire_common_list-content").trigger('create');
                        if (self.model.get('status') !== '0') {
                            $('.btn_dis').attr('disabled', true)
                        };
                    }
                });
            } else if (self.model.attributes.qtc.questionnair_category == '2') {
                $("#common_name").html('选项统计问卷')
                rendered_data = self.quesetionnaire_option_common_template(self.model.attributes);
            } else if (self.model.attributes.qtc.questionnair_category == '3') {
                $("#common_name").html('测验问卷')
                rendered_data = self.quesetionnaire_test_common_template(self.model.attributes);
            } else if (self.model.attributes.qtc.questionnair_category == '6') {
                $("#common_name").html('投票问卷')
                rendered_data = self.quesetionnaire_vote_common_template(self.model.attributes);
            }

            $("#quesetionnaire_common_list-content").html(rendered_data);
            $("#quesetionnaire_common_list-content").trigger('create');
            if (self.model.get('status') !== '0') {
                $('.btn_dis').attr('disabled', true)
            };
            return self;
        },
        bind_event: function() {
            var self = this
            var bool = true;
            $("#quesetionnaire_common_list-content").on('change', 'input', function(event) {
                var $changed = $(event.currentTarget);
                var questionnair_category = self.model.attributes.qtc.questionnair_category;
                if (questionnair_category == '2' || questionnair_category == '6') {
                    event.preventDefault();
                    // var $changed = $(event.currentTarget);
                    var qti_id = $changed.attr('id');
                    var mark = $changed.attr('mark');
                    var bool = $changed[0].checked;
                    var category_num = $changed.data('category_num');


                    if (questionnair_category == '2') {
                        var option_items = self.model.attributes.option_items;
                    } else {
                        var option_items = self.model.attributes.vote_items;
                    }

                    var qi = _.find(option_items, function(x) {
                        return x._id == String(qti_id.split('-')[0]);
                    });
                    var num = parseInt(qti_id.split('-')[1])
                    if (mark == '1') {
                        qi.results = [{
                            result: num
                        }]
                    } else {
                        if (bool) {
                            qi.results.push({
                                result: num
                            })
                        } else {
                            qi.results = _.filter(qi.results, function(qt) {
                                return qt.result != num
                            })
                        }
                    }
                    self.model.trigger('change');
                } else if (questionnair_category == '3') {
                    // var is_answer = !!$changed.attr("checked") ? true : false;
                    var is_answer = $changed[0].checked;
                    var category_id = $changed.data('category_id');
                    var item = _.find(self.model.attributes.test_items, function(x) {
                        return x._id == category_id;
                    });

                    var qti_id = $changed.data('qti_id');
                    var qti = _.find(item.qtis, function(x) {
                        return x._id == qti_id;
                    });

                    var up_id = $changed.data('up_id');
                    var option = _.find(qti.qti_options, function(x) {
                        return x._id == up_id;
                    });
                    option.result = is_answer;
                    //单选题，选择一个选项以后，把其他的选项都改成false
                    if (qti.qti_type == '1') {
                        _.each(qti.qti_options, function(x) {
                            if (x._id != option._id) {
                                x.result = false;
                            }
                        });
                    }
                    self.model.trigger('change');
                };
            }).on('change', 'select', function(event) {
                event.preventDefault();
                var $changed = $(event.currentTarget);
                var value = $changed.val();
                if (isNaN(value)) {
                    alert("请输入合法的分数!");
                    $changed.val('');
                    return;
                }
                if (parseFloat(value) < 0 || parseFloat(value) > 100) {
                    alert("评分必须在0～100之间!");
                    $changed.val('');
                    return;
                }

                var qi_id = $changed.data('qi_id');
                var category_num = $changed.data('category_num');
                var qi = _.find(self.model.attributes.items[category_num].qtis, function(x) {
                    return x._id == qi_id;
                });
                qi.score = value
                self.model.trigger('change');
            }).on('click', '#btn-submit_grade_common-save', function(event) {
                var bl = true
                $("#quesetionnaire_common_list-content select").each(function() {
                    if (!$(this).val()) {
                        alert("还有题目未选择");
                        bl = false;
                        return false;
                    };
                })
                if (bl) {
                    if (confirm('确认提交吗?' + '\n' + '提交完成后，将跳转到问卷评分管理')) {
                        var score1 = 0; //分类总分
                        _.each(self.model.attributes.items, function(x) {
                            var score2 = 0; //题目总分
                            _.each(x.qtis, function(xx) {
                                score2 += parseFloat(xx.score);
                            });
                            x.score = parseFloat(score2 / x.qtis.length);
                            score1 += parseFloat(x.score);
                        });
                        self.model.attributes.score = parseFloat(score1 / self.model.attributes.items.length);
                        self.model.attributes.status = '1';
                        self.model.save(self.model.attributes, {
                            success: function(model, response, options) {
                                window.location = '#qt_manage';
                            }
                        })
                    }
                };
            }).on('click', '#btn-submit_option_common-save', function(event) {
                event.preventDefault();
                var option_num = self.model.attributes.option_items.length;
                var bool = true;
                _.each(self.model.attributes.option_items, function(it) {
                    if (it.results.length == 0) {
                        bool = false
                    };
                })
                if (bool) {
                    if (confirm('确认提交吗?' + '\n' + '提交完成后，将跳转到问卷评分管理')) {
                        self.model.attributes.status = '1';
                        self.model.save(self.model.attributes, {
                            success: function(model, response, options) {
                                window.location = '#qt_manage';
                            }
                        })
                    }
                } else {
                    alert("所有题目必须全部填写!");
                    return false;
                }


            }).on('click', '#btn-submit_test_common-save', function(event) {
                event.preventDefault();
                var valid = true;
                //验证是否答题完毕
                _.each(self.model.attributes.test_items, function(x) {
                    _.each(x.qtis, function(xx) {
                        var bool = false;
                        _.each(xx.qti_options, function(xxx) {
                            if (xxx.result) {
                                bool = true;
                                return;
                            }
                        });
                        if (!bool) {
                            valid = false;
                            return;
                        }
                    });
                    self.model.attributes.score += x.score;
                });
                if (valid) {
                    //算分
                    if (confirm('确认提交吗?' + '\n' + '提交完成后，将跳转到问卷评分管理')) {
                        _.each(self.model.attributes.test_items, function(x) {
                            _.each(x.qtis, function(xx) {
                                var bool = true;
                                _.each(xx.qti_options, function(xxx) {
                                    if (xxx.is_answer != xxx.result) {
                                        bool = false;
                                    }
                                });
                                if (bool) {
                                    xx.score = xx.qti_score_value;
                                    x.score += xx.score;
                                }
                            });
                            self.model.attributes.score += x.score;
                        });
                        self.model.attributes.status = '1';
                        self.model.save(self.model.attributes, {
                            success: function(model, response, options) {
                                window.location = '#qt_manage';
                            }
                        })
                    };
                } else {
                    alert("所有题目必须全部填写!");
                    return false;
                }

            })
        },

    });

    // Returns the View class
    return Quesetionnaire_360ListView;

});