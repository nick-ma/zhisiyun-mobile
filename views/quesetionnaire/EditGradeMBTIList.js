// ToDo View
// =============

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "async"], function($, _, Backbone, Handlebars, async) {
    Handlebars.registerHelper('is_type', function(data, options) {
        if (data == '0') {
            return options.fn(this);
        } else {
            return options.inverse(this);
        };
    });

    Handlebars.registerHelper('show_name', function(data) {
        return '<span><b>' + data + '</b></span>'
    });
    Handlebars.registerHelper('cat', function(data) {

        if (data == '0') {
            str = '<span class="label label-success">系统用户</span>';
        } else {
            str = '<span class="label label-info">非系统用户</span>';
        }
        return str;
    });

    var Quesetionnaire_nbtiListView = Backbone.View.extend({
        // The View Constructor
        initialize: function() {
            this.quesetionnaire_mbti_template = Handlebars.compile($("#quesetionnaire_mbti_list_view").html());
            this.quesetionnaire_next_mbti_template = Handlebars.compile($("#quesetionnaire_next_mbti_list_view").html());
            this.quesetionnaire_mbti_result_template = Handlebars.compile($("#quesetionnaire_mbti_result_list_view").html());

            this.loading_template = Handlebars.compile($("#loading_template_view").html());
            this.model_view = '0';
            this.model.on("sync", this.render, this);
            this.bind_event();
            this.num1 = 0; //已完成数目
            this.num2 = 0; //题目总数
            this.config_items = [] //题目总数
        },

        pre_render: function() {
            var self = this;
            $("#quesetionnaire_nbti_list-content").html(self.loading_template({
                info_msg: '数据加载中...请稍候'
            }));
            $("#quesetionnaire_nbti_list-content").trigger('create');
            return this;
        },
        // Renders all of the Task models on the UI
        render: function() {
            var self = this;
            var rendered_data = '';
            $("#nbti_name").html('MBTI测试')
            var status = self.model.get('status');
            if (status == '1') {
                self.model_view = '2'

            };
            if (self.model_view == '0') {
                rendered_data = self.quesetionnaire_mbti_template(self.model.attributes);
            } else if (self.model_view == '1') {
                // num1 = 0; //已完成数目
                // num2 = 0; //题目总数
                self.num1 = 0; //已完成数目
                self.num2 = 0; //题目总数
                _.each(self.model.attributes.qb, function(x) {
                    self.num2 += x.qs.length;
                    _.each(x.qs, function(xx) {
                        if (xx.result) {
                            self.num1++;
                        }
                    });
                });

                var qt_tmp = self.model.attributes;
                self.obj = {};
                self.obj.items = [];
                for (var i = 0; i < qt_tmp.qb.length; i++) {
                    var x = qt_tmp.qb[i];
                    qs_tmp = _.filter(x.qs, function(xx) {
                        return !xx.result;
                    });
                    if (qs_tmp.length > 0) {
                        if (!self.obj.category_id) {
                            self.obj.category_id = x._id;
                            self.obj.category = x.category;
                        }

                        var index = 1;
                        _.each(x.qs, function(xxx) {
                            if (!xxx.result && self.obj.items.length < 2) {
                                xxx.sequence = self.num1 + index;
                                self.obj.items.push(xxx);
                                index++;
                            }
                        });
                        break;
                    }
                }

                rendered_data = self.quesetionnaire_next_mbti_template(self.obj);
            } else {
                $.get('/admin/pm/mbti/config_bb', function(data) {
                    var obj = self.model.attributes;
                    var f_d = _.find(data[0].md_items, function(item) {
                        return item.md_code == self.model.get('result')
                    })
                    obj.desc = f_d;
                    console.log(obj);
                    rendered_data = self.quesetionnaire_mbti_result_template(obj);
                    $("#quesetionnaire_nbti_list-content").html(rendered_data);
                    $("#quesetionnaire_nbti_list-content").trigger('create');
                })
            }

            $("#quesetionnaire_nbti_list-content").html(rendered_data);
            $("#quesetionnaire_nbti_list-content").trigger('create');
            $("#show_qti_num").html("已完成 " + self.num1 + " 题/共 " + self.num2 + " 题")
            // if (self.model.get('status') !== '0') {
            //     $('.btn_dis').attr('disabled', true)
            // };
            if (self.num2 - self.num1 == 2 && self.obj.items.length == 2) {
                $("#quesetionnaire_nbti_list-content #btn_submit").show();
                $("#quesetionnaire_nbti_list-content #btn_save").hide();
            } else if (self.num2 - self.num1 == 1) {
                $("#quesetionnaire_nbti_list-content #btn_submit").show();
                $("#quesetionnaire_nbti_list-content #btn_save").hide();
            }

            return self;
        },
        bind_event: function() {
            var self = this
            var bool = true;
            $("#quesetionnaire_nbti_list-content").on('click', '#btn_start', function(event) {
                event.preventDefault();
                self.model_view = '1';
                self.render()

            }).on('click', "#btn_save", function(event) {
                event.preventDefault();
                var ts = _.filter(self.obj.items, function(x) {
                    return !x.result;
                });
                if (ts.length > 0) {
                    alert("请答完题目再提交!");
                    return false;
                } else {
                    self.model.save(self.model.attributes).done(function(data) {
                        self.model.fetch().done(function() {
                            self.render();

                        })
                    })
                }
            }).on('change', 'input', function(event) {
                event.preventDefault();
                $changed = $(event.currentTarget);
                var value = $changed.val();

                var category_id = $changed.data('category_id');
                var qs_id = $changed.data('qs_id');

                var category = _.find(self.model.attributes.qb, function(x) {
                    return x._id == category_id;
                });
                var q = _.find(category.qs, function(xx) {
                    return xx._id == qs_id;
                });
                q.result = value;

                //设置result，以便判断是否都选中
                var item_tmp = _.find(self.obj.items, function(xx) {
                    return xx._id == qs_id;
                });
                item_tmp.result = value;
            }).on('click', "#btn_submit", function(event) {
                $this = $(this);
                event.preventDefault();
                self.model_view = '0';
                self.render();
                var ts = _.filter(self.obj.items, function(x) {
                    return !x.result;
                });
                if (ts.length > 0) {
                    alert("请答完题目再提交!");
                    return false;
                } else {
                    $this.attr("disabled", true)
                    var qt_result = '';
                    //计算性格结论
                    _.each(self.collection.models, function(x) {
                        var code1_num = 0;
                        var code2_num = 0;
                        var code1 = x.attributes.md_code1;
                        var code2 = x.attributes.md_code2;
                        _.each(self.model.attributes.qb, function(x) {
                            _.each(x.qs, function(xx) {
                                if (xx.result == code1) {
                                    code1_num++;
                                } else if (xx.result == code2) {
                                    code2_num++;
                                }
                            });
                        });

                        if (code1_num > code2_num) {
                            qt_result += code1;
                        } else {
                            qt_result += code2;
                        }
                    });

                    self.model.attributes.status = '1';
                    self.model.attributes.result = qt_result;
                    // qt.attributes.submitDate = moment();
                    self.model.save(self.model.attributes).done(function(data) {
                        var url = "/admin/pm/mbti/create_report";
                        $.post(url, {
                            qi: JSON.stringify(self.model.attributes),
                        }, function(data) {
                            window.location.href = "#qt_manage";
                        });

                    }).fail(function(data) {
                        alert('提交失败!');
                    });

                }
            });
        },

    });

    // Returns the View class
    return Quesetionnaire_nbtiListView;

});