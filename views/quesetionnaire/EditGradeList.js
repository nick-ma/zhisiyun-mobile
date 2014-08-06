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
    Handlebars.registerHelper('qtis_num', function(data) {
        return data.length
    });
    Handlebars.registerHelper("addOne", function(index) {
        //利用+1的时机，在父级循环对象中添加一个_index属性，用来保存父级每次循环的索引
        this._index = index;
        //返回+1之后的结果
        return this._index;
    });
    var setQIScoreAndSave = function(qi, pcss, pcs, cb) {
        var qi_obj = qi.attributes;
        var weigth_loss = 0;

        var pcs_obj = pcss.get(qi_obj.people._id);

        var dimens = ['', 'self_weight', 'superior_weight', 'sibling_weight', 'subordinate_weight', 'superior_superior_weight', 'others_weight'];
        var index = 0;

        _.each(dimens, function(x) {
            if (x != '') {
                if (qi_obj[x] > 0) {
                    var dimension = _.find(qi_obj.dimensions, function(xx) {
                        return xx.dimension == index;
                    });
                    if (!dimension || dimension.number_of_people == 0) {
                        weigth_loss += parseFloat(qi_obj[x]);
                    }
                }
            }
            index++;
        });

        if (weigth_loss > 0) {
            //剩余权重总和
            var weight = 100 - weigth_loss;
            var superior = _.find(qi_obj.dimensions, function(xx) {
                return xx.dimension == '2';
            });
            if (qi_obj.weight_loss_rule == '1' && superior) { //分摊给上级
                superior.weight += parseFloat(weigth_loss);
            } else { //按比列分配
                // _.each(items, function(item) {
                _.each(qi_obj.dimensions, function(xx) {
                    xx.weight += parseFloat((xx.weight / weight) * weigth_loss);
                });
                // });
            }
        }

        //开始算分
        var sum_score = 0;
        _.each(qi_obj.dimensions, function(xx) {
            xx.score = parseFloat(xx.f_score * xx.weight / 100);
            sum_score += parseFloat(xx.f_score * xx.weight / 100);
        });
        qi_obj.score = sum_score;
        qi_obj.status = '1';

        qi.save(qi.attributes, {
            success: function(model, response, options) {
                //按题目组装得分
                var items = _.clone(qi_obj.dimensions[0].items);
                var index1 = 0;
                _.each(items, function(x) {
                    var index2 = 0;
                    _.each(x.qtis, function(xx) {
                        var qti_sum_score = 0;
                        _.each(qi_obj.dimensions, function(xxx) {
                            qti_sum_score += parseFloat(xxx.items[index1].qtis[index2].score * xxx.weight / 100);
                        });
                        xx.score = qti_sum_score;
                        xx.f_score = parseFloat(qti_sum_score / xx.qti_weight * 100);
                        index2++;
                    });
                    index1++;
                });

                var set_pcs = function(pcs) {
                    _.each(items, function(x) {
                        _.each(x.qtis, function(xx) {
                            if (xx.source == '3') {
                                score_obj = {};
                                score_obj.qi = qi_obj._id;
                                score_obj.score = xx.f_score;

                                var cc = _.find(pcs.ccs, function(xxx) {
                                    return xxx.competencyclient == xx.competencyclient;
                                });
                                if (!!cc) {
                                    cc.scores.push(score_obj);
                                } else {
                                    var cc_obj = {};
                                    cc_obj.competencyclient = xx.competencyclient;
                                    cc_obj.scores = [];

                                    cc_obj.scores.push(score_obj);
                                    pcs.ccs.push(cc_obj);
                                }
                            }
                        });
                    });
                }

                if (!!pcs_obj) { //找到则push
                    pcs.attributes = pcs_obj.attributes;
                    set_pcs(pcs.attributes);
                    pcs.url = '/admin/pm/questionnair_template/pcs_bb/' + pcs.attributes._id;
                } else { //没找到则create
                    pcs.idAttribute = "_id";
                    pcs.attributes.people = qi_obj.people._id;
                    pcs.attributes.ccs = [];

                    set_pcs(pcs.attributes);
                    pcs.url = '/admin/pm/questionnair_template/pcs_bb/undefined';
                }

                pcs.save(pcs.attributes, {
                    success: function(model, response, options) {
                        cb(null, null);
                    }
                });
            }
        })
    }
    var Quesetionnaire_360ListView = Backbone.View.extend({
        // The View Constructor
        initialize: function() {
            this.quesetionnaire_360_template = Handlebars.compile($("#quesetionnaire_360_list_view").html());
            this.quesetionnaire_360_qt_template = Handlebars.compile($("#quesetionnaire_360_grade_list_view").html());
            this.collection.on("sync", this.render, this);
            this.dimension_enum = ['', '自评', '下级', '同级', '上级', '下下级', '他评'];
            this.model_view = '0';
            this.bind_event();
        },
        // Renders all of the Task models on the UI
        render: function() {
            var self = this;
            var rendered_data = '';
            var grade_way = self.collection.models[0].attributes.grade_way;
            if (self.model_view == '0') {
                var tab = parseInt(self.qti ? self.qti.index1 : 0) + 1
                var obj = _.first(self.collection.toJSON())
                var cate_items = [];
                var index1 = 0;
                var people_id = $("#login_people").val();
                var items = obj.dimensions[0].items;
                for (var i = 0; i < items.length; i++) {
                    var o = {};
                    o.category = items[i].category;
                    o.qtis = [];
                    var qtis = items[i].qtis
                    for (var j = 0; j < qtis.length; j++) {
                        var bool = true;
                        var q_o = {};
                        q_o.qti_name = qtis[j].qti_name;
                        var models = self.collection.models
                        for (var x = 0; x < models.length; x++) {
                            var dimensions = models[x].get('dimensions')
                            for (var y = 0; y < dimensions.length; y++) {

                                var f_d = _.find(dimensions[y].items[i].qtis[j].peoples, function(pp) {
                                    return pp.people == String(people_id)
                                })
                                if (f_d && !f_d.f_score && f_d.f_score != 0) {
                                    bool = false
                                };
                            };
                        };
                        q_o.bl = bool;
                        o.qtis.push(q_o)
                    };
                    cate_items.push(o)
                };
                var obj = _.first(self.collection.toJSON())
                var data = {
                    qt_name: obj.qt_name,
                    datas: cate_items
                }
                self.$el.find("#wrapper").children('div').eq(tab).attr('data-collapsed', false);
                rendered_data = self.quesetionnaire_360_template(data);
                if (grade_way == 'G') {
                    var url = '/admin/pm/performance_level/grade_group_get_json_data_byId/' + self.collection.models[0].attributes.grade_group;
                    $.get(url, function(data) {
                        if (data && data.code == 'OK') {
                            self.gg_grades = data.data.gg_grades;
                        };
                    })

                };
            } else if (self.model_view == '1') {
                var obj = _.first(self.qti_detail);
                self.qti = obj;
                obj.grade_way = grade_way;
                // obj.qt_name = obj.qt_name;
                obj.datas = self.qti_detail;
                rendered_data = self.quesetionnaire_360_qt_template(obj)
            }
            $("#quesetionnaire_list-content").html(rendered_data);
            $("#quesetionnaire_list-content").trigger('create');

            var bool = true;
            _.each(self.collection.toJSON(), function(x) {
                _.each(x.dimensions, function(di) {
                    _.each(di.items[0].qtis[0].peoples, function(p) {
                        if (p.people.toString() == $("#login_people").val() && x.status == '0' && p.status == '0') {
                            bool = false;
                        }
                        // if (p.people.toString() == $("#login_people").val() && p.status == '1') {
                        //     bool = true;
                        // }
                    });
                });
            });
            if (bool) {
                $('.btn_dis').attr('disabled', true)
            };
            return self;
        },
        bind_event: function() {
            var self = this
            var bool = true;
            $("#btn-quesetionnaire_list-back").on('click', function(event) {
                event.preventDefault();
                if (self.model_view == '0') {
                    window.location = '#qt_manage'
                } else {
                    self.model_view = '0';
                    self.render();
                }

            })
            $("#quesetionnaire_list-content").on('click', '#btn_go_to', function(event) {
                event.preventDefault();
                var qti_id = $(this).attr('qti_id');
                var cate_id = qti_id.split("-")[0];
                var qi_id = qti_id.split("-")[1];
                var people_id = $("#login_people").val();
                var qi_items = []
                _.each(self.collection.models, function(model) {
                    var o = {};
                    o.q_id = model.get('_id');
                    o.people = model.get('people');
                    _.each(model.get('dimensions'), function(dime) {
                        var f_d = _.find(dime.items[cate_id].qtis[qi_id].peoples, function(pp) {
                            return pp.people == String(people_id)
                        })
                        if (f_d) {
                            o.index1 = cate_id;
                            o.index2 = qi_id;
                            o.f_score = f_d.f_score;
                            o.dimension_num = dime.dimension;
                            o.dimension = self.dimension_enum[dime.dimension];
                            o.qt = dime.items[cate_id].qtis[qi_id];
                            o.gg_grades = self.gg_grades;
                            qi_items.push(o)
                        };
                    })
                })
                self.qti_detail = qi_items;
                self.model_view = '1';
                self.render();
            }).on('change', 'input', function(event) {
                event.preventDefault();
                var $changed = $(event.currentTarget);
                var value = $changed.val();
                if (isNaN(value)) {
                    alert("请输入合法的分数!");
                    $changed.val('');
                    bool = false;
                    return;
                } else {
                    bool = true;
                }
                if (parseFloat(value) < 0 || parseFloat(value) > 100) {
                    alert("评分必须在0～100之间!");
                    $changed.val('');
                    bool = false;
                    return;
                } else {
                    bool = true;
                }
                var qi_id = $changed.data('qi_id');
                var dimension = $changed.data('dimension');
                var index1 = $changed.data('index1');
                var index2 = $changed.data('index2');

                var qi = _.find(self.collection.models, function(x) {
                    return x.attributes._id == qi_id;
                });
                var dimen = _.find(qi.attributes.dimensions, function(xx) {
                    return xx.dimension == dimension;
                });
                var item = dimen.items[index1];
                var qti = item.qtis[index2];
                var people = _.find(qti.peoples, function(p) {
                    return p.people == $("#login_people").val();
                });
                people.f_score = value;

                qi.trigger('change');
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
                var dimension = $changed.data('dimension');
                var index1 = $changed.data('index1');
                var index2 = $changed.data('index2');

                var qi = _.find(self.collection.models, function(x) {
                    return x.attributes._id == qi_id;
                });
                var dimen = _.find(qi.attributes.dimensions, function(xx) {
                    return xx.dimension == dimension;
                });
                var item = dimen.items[index1];
                var qti = item.qtis[index2];
                var people = _.find(qti.peoples, function(p) {
                    return p.people == $("#login_people").val();
                });
                people.f_score = value;

                qi.trigger('change');
            }).on('click', '#btn-quesetionnaire_360_grade-save', function(event) {
                if (bool) {
                    var bl = true
                    $("#quesetionnaire_list-content input").each(function() {
                        if (!$(this).val()) {
                            alert("还有人未被评分");
                            bl = false;
                            return false;
                        };
                    })
                    if (bl) {

                        async.timesSeries(self.collection.models.length, function(n, next) {
                            var qi = self.collection.models[n];
                            qi.save(qi.attributes).done(function() {
                                next(null, qi)
                            });
                        }, function(err, results) {
                            self.model_view = '0';
                            self.render();
                        })
                    };
                }
            }).on('click', '#btn-submit_qti-save', function(event) {
                event.preventDefault();
                var bool = true;
                var $self = $(this);
                $("#quesetionnaire_list-content a[id='btn_go_to']").each(function() {
                    if ($(this).attr("bool") != 'true') {
                        bool = false
                    };
                })
                if (bool) {
                    if (confirm('确认提交吗?' + '\n' + '提交完成后，将跳转到问卷评分管理')) {
                        $self.attr('disabled', true)
                        async.times(self.collection.models.length, function(n, next) {
                            var x = self.collection.models[n];
                            //找到评分人所属分类dimension
                            var d;
                            _.each(x.attributes.dimensions, function(di) {
                                _.each(di.items, function(i) {
                                    _.each(i.qtis, function(q) {
                                        _.each(q.peoples, function(p) {
                                            if (p.people.toString() == $("#login_people").val()) {
                                                d = di;
                                                return;
                                            }
                                        });
                                    });
                                });
                            });

                            //dimensions评分标记,如果所有分类都已评分,则为true
                            var d_score_flag = true;
                            //所有分类的总和
                            var d_sum_score = 0;

                            _.each(d.items, function(i) {
                                //分类评分标记,如果所有题目都已评分,则为true
                                var i_score_flag = true;
                                //所有题目的总和
                                var qti_sum_score = 0;

                                _.each(i.qtis, function(q) {
                                    //评分标记，如果所有人都提交，则不变为true
                                    var score_flag = true;
                                    //所有评分人的总和
                                    var peoples_sum_score = 0;

                                    _.each(q.peoples, function(p) {
                                        if (p.people.toString() == $("#login_people").val()) {
                                            p.status = '1';
                                            p.submitDate = moment();
                                        }
                                        peoples_sum_score += parseFloat(p.f_score);
                                        //如果有未提交的人，评分标记改为false
                                        if (p.status == '0') {
                                            score_flag = false;
                                        }
                                    });

                                    if (score_flag) {
                                        if (x.attributes.score_sampling_rule == '2' && q.peoples.length > 2) { //去掉最高分和最低分
                                            //最高分的评分人
                                            var max_people = _.max(q.peoples, function(qp) {
                                                return qp.f_score;
                                            });
                                            //最低分的评分人
                                            var min_people = _.min(q.peoples, function(qp) {
                                                return qp.f_score;
                                            });

                                            peoples_sum_score = peoples_sum_score - max_people.f_score - min_people.f_score;

                                            q.f_score = parseFloat(peoples_sum_score / (q.peoples.length - 2));
                                        } else { //全部平均
                                            q.f_score = parseFloat(peoples_sum_score / q.peoples.length);
                                        }
                                        q.score = parseFloat(q.f_score * q.qti_weight / 100);
                                        q.status = '1';
                                    }

                                    if (q.status == '0') {
                                        i_score_flag = false;
                                    }

                                    qti_sum_score += parseFloat(q.score);
                                });

                                if (i.category && i_score_flag) {
                                    i.score = qti_sum_score;
                                    i.status = '1';
                                    i.f_score = qti_sum_score / i.weight * 100;
                                }

                                if (i.status == '0') {
                                    d_score_flag = false;
                                }
                                d_sum_score += parseFloat(i.score);
                            });

                            if (d_score_flag) {
                                d.f_score = d_sum_score;
                                d.status = '1';
                                d.score = d_sum_score * d.weight / 100;
                            }
                            d.actual_number_of_people += 1;

                            //整份问卷的评分标记，如果是评分人为组后一个人，则为true，否则设为false
                            var x_score_flag = true;

                            _.each(x.attributes.dimensions, function(di) {
                                if (di.number_of_people > 0 && di.status == '0') {
                                    x_score_flag = false;
                                }
                            });

                            //计算问卷总分，并处理权重丢失情况
                            if (x_score_flag) {
                                x.attributes.actual_number_of_people += 1;
                                setQIScoreAndSave(x, self.peopleCompetencyScores, self.peopleCompetencyScore, next);
                            } else {
                                x.attributes.actual_number_of_people += 1;
                                // x.save();
                                // x.attributes.status = '1';
                                x.save(x.attributes, {
                                    success: function(model, response, options) {
                                        next(null, null);
                                    }
                                })
                            }
                        }, function(err, results) {
                            window.location = '#qt_manage'
                        })
                    }
                } else {
                    alert("评分必须全部填写!");
                    return false
                }
            })
        },

    });

    // Returns the View class
    return Quesetionnaire_360ListView;

});