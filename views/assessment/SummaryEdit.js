// Assessment  Summary Edit View 绩效总结查看界面（不足与改进、突出的绩效亮点分享、总结陈述）
// =============================================================

// Includes file dependencies
define(["jquery", "underscore", "async", "backbone", "handlebars", "moment", "../../models/AssessmentModel", "../../models/CollTaskModel"],
    function($, _, async, Backbone, Handlebars, moment, AssessmentModel, CollTask) {
        var people_ind_superiors, people_superiors, ai_id = null,
            pds = null,
            wfs = [];
        // Extends Backbone.View
        var AssessmentSummaryEditView = Backbone.View.extend({
            // The View Constructor
            initialize: function() {
                this.template = Handlebars.compile($("#psh_summary_edit_form_view").html());
                this.loading_template = Handlebars.compile($("#loading_template_view").html());
                this.pi_template = Handlebars.compile($("#psh_summary_index_view").html());
                this.wip_template = Handlebars.compile($("#psh_summary_wip_form_view").html());
                this.index_template = Handlebars.compile($("#pi_assessment_pi_select_view").html()); //指标选择
                this.wf_template = Handlebars.compile($("#pi_assessment_wf_select_view").html()); //流程选择

                this.bind_events();
                var self = this;
            },
            pre_render: function() {
                var self = this;
                $("#summary_edit_form-content").html(self.loading_template({
                    info_msg: '数据加载中...请稍候'
                }));
                $("#summary_edit_form-content").trigger('create');
                return this;
            },
            // Renders all of the Assessment models on the UI
            render: function(index, type) {
                var self = this;
                var data = _.map(self.collection.models, function(x) {
                    return x.toJSON()
                })
                if (self.ai_status >= 10) {
                    $("#summary_edit_form #summary_name").html("绩效总结查看")

                } else {
                    $("#summary_edit_form #summary_name").html("绩效总结编辑")

                }
                var rendered_content = [];
                var items = data[0].quantitative_pis.items; //ration=2 定量
                var mark_as_summary_type1_num = 0,
                    mark_as_summary_type2_num = 0; //指标个数；
                var exist_pi_1 = [],
                    exist_pi_2 = [];

                if (index == 'index_select') {
                    _.each(items, function(x) {
                        x.people = self.collection.models[0].get('people');
                        x.ration = 2;
                        x.ai_status = self.ai_status;
                        rendered_content.push(x);
                        if (x.mark_as_summary_type1) {
                            mark_as_summary_type1_num += 1;
                            exist_pi_1.push(x)
                        }
                        if (x.mark_as_summary_type2) {
                            mark_as_summary_type2_num += 1;
                            exist_pi_2.push(x);
                        }

                    })
                } else {
                    _.each(items, function(x) {
                        if (x.mark_as_summary_type1 || x.mark_as_summary_type2) {
                            x.people = self.collection.models[0].get('people');
                            x.ration = 2;
                            x.ai_status = self.ai_status;
                            rendered_content.push(x);
                            if (x.mark_as_summary_type1) {
                                mark_as_summary_type1_num += 1;
                            }
                            if (x.mark_as_summary_type2) {
                                mark_as_summary_type2_num += 1;
                            }
                        };
                    })
                }


                var items = data[0].qualitative_pis.items; //ration=1 定性
                if (index == "index_select") {
                    _.each(items, function(x) {
                        x.people = self.collection.models[0].get('people');
                        x.ration = 1;
                        x.ai_status = self.ai_status;
                        rendered_content.push(x);
                        if (x.mark_as_summary_type1) {
                            exist_pi_1.push(x)
                            mark_as_summary_type1_num += 1;
                        }
                        if (x.mark_as_summary_type2) {
                            exist_pi_2.push(x)

                            mark_as_summary_type2_num += 1;
                        }
                    })
                } else {
                    _.each(items, function(x) {
                        if (x.mark_as_summary_type1 || x.mark_as_summary_type2) {
                            x.people = self.collection.models[0].get('people');
                            x.ration = 1;
                            x.ai_status = self.ai_status;
                            rendered_content.push(x);
                            if (x.mark_as_summary_type1) {
                                mark_as_summary_type1_num += 1;
                            }
                            if (x.mark_as_summary_type2) {
                                mark_as_summary_type2_num += 1;
                            }
                        }
                    })
                }

                if (self.ai_status == '9' && self.is_self) {
                    var is_edit = true;
                } else {
                    var is_edit = false;

                }
                ai_id = data[0]._id;
                var render_data = {
                    rendered_content: rendered_content,
                    data: data[0],
                    is_edit: is_edit,
                    type1_len: mark_as_summary_type1_num,
                    type2_len: mark_as_summary_type2_num

                }
                $("#summary_href").attr("href", '/m#summary');
                if (index == 'index_select') {
                    $("#summary_edit_form #summary_name").html("选择待总结的指标");
                    $("#summary_edit_form #summary_href").data("module", "C");
                    $("#summary_edit_form #add_pi").data("ai_id", data[0]._id);
                    $("#summary_edit_form #add_pi").data("type", type);
                    $("#summary_edit_form #add_pi").show();
                    $("#summary_edit_form-content").html(self.index_template(render_data));
                    var $container = $("#summary_edit_form-content");
                    if (type == '1') {
                        _.each(exist_pi_1, function(x) {
                            $container.find("#cb-" + x._id).attr('checked', true);
                        })
                    } else if (type == '2') {
                        _.each(exist_pi_2, function(x) {
                            $container.find("#cb-" + x._id).attr('checked', true);
                        })
                    }


                } else {
                    $("#summary_edit_form #add_pi").hide();

                    $("#summary_edit_form-content").html(self.template(render_data));
                }
                $("#summary_edit_form-content").trigger('create');
                //查找上级和间接上级数据
                async.series({
                    ind_sup: function(cb) {
                        self.get_ind_superiors(data[0].people.ind_superiors, cb);
                    },
                    sup: function(cb) {
                        self.get_superiors(data[0].people.superiors, cb);
                    }
                }, function(err, result) {
                    people_ind_superiors = result.ind_sup;
                    people_superiors = result.sup;

                })
                return this;

            },
            render_pi: function(module, pi_id, ration) {
                var self = this;
                $.mobile.loading("show");

                var data = _.map(self.collection.models, function(x) {
                    return x.toJSON()
                })
                if (ration == '1') {
                    var items = data[0].qualitative_pis.items; //ration=1 定xing
                    var find_pi = _.find(items, function(x) {
                        return x.pi == String(pi_id)
                    })
                    find_pi.ration = 1;
                } else if (ration == '2') {
                    var items = data[0].quantitative_pis.items; //ration=2 定量
                    var find_pi = _.find(items, function(x) {
                        return x.pi == String(pi_id)
                    })
                    find_pi.ration = 2;

                }
                //是否可以编辑
                if (self.ai_status == '9' && self.is_self) {
                    var is_edit = true;
                } else {
                    var is_edit = false;

                }
                var render_data = {
                    data: data[0],
                    is_edit: is_edit,
                    find_pi: find_pi
                };
                if (module == 'A') {
                    $("#summary_edit_form #summary_href").data("module", "A");
                    $("#summary_edit_form #summary_name").html("不足与改进");

                    render_data.module = 'A';

                } else if (module == 'B') {
                    $("#summary_edit_form #summary_href").data("module", "B");
                    $("#summary_edit_form #summary_name").html("绩效亮点分享")
                    render_data.module = 'B';

                }

                //页签切换时用
                $("#summary_edit_form .btn-summary_edit_form-change_state").data("module", module)
                $("#summary_edit_form .btn-summary_edit_form-change_state").data("pi_id", pi_id)
                $("#summary_edit_form .btn-summary_edit_form-change_state").data("ration", ration)

                $("#summary_edit_form-content").html(self.pi_template(render_data));
                $("#summary_edit_form-footer").show();

                $("#summary_edit_form-content").trigger('create');
                $("#summary_edit_form #mark_as_watch").parent().addClass('mark_as_watch');
                $.mobile.loading('hide');

                return this; //指标－绩效总结数据

            },
            render_wip: function(module, pi_id, ration) {
                var self = this;
                $.mobile.loading("show");

                var data = _.map(self.collection.models, function(x) {
                        return x.toJSON()
                    })
                    //是否可以编辑
                if (ration == '1') {
                    var items = data[0].qualitative_pis.items; //ration=1 定xing
                    var find_pi = _.find(items, function(x) {
                        return x.pi == String(pi_id)
                    })
                    find_pi.ration = 1;

                } else if (ration == '2') {
                    var items = data[0].quantitative_pis.items; //ration=2 定量
                    var find_pi = _.find(items, function(x) {
                        return x.pi == String(pi_id)
                    })
                    find_pi.ration = 2;
                }
                //是否可以编辑
                if (self.ai_status == '9' && self.is_self) {
                    var is_edit = true;
                } else {
                    var is_edit = false;

                }
                var render_data = {
                    data: data[0],
                    is_edit: is_edit,
                    find_pi: find_pi
                };
                if (module == 'A') {
                    $("#summary_edit_form #summary_href").data("module", "A");
                    $("#summary_edit_form #summary_name").html("不足与改进")

                } else if (module == 'B') {
                    $("#summary_edit_form #summary_href").data("module", "B");
                    $("#summary_edit_form #summary_name").html("绩效亮点分享")

                }
                $("#summary_edit_form-content").html(self.wip_template(render_data));
                $("#summary_edit_form-footer").show();
                $("#summary_edit_form-content").trigger('create');
                self.redraw_sparkline();
                $.mobile.loading('hide');

                return this; //绩效过程

            },
            render_wf: function(pds) {
                var self = this;
                var data = _.map(self.collection.models, function(x) {
                    return x.toJSON()
                })
                var render_data = {
                    pds: pds
                }
                $("#summary_edit_form #summary_name").html("启动审批流程");
                $("#summary_edit_form-content").html(self.wf_template(render_data));
                $("#summary_edit_form-content").trigger('create');
                return this;

            },
            bind_events: function() {
                var self = this;
                $("#summary_edit_form").on('click', '.summary_pi', function(event) { //第三层－指标总结入口
                        event.preventDefault();
                        var module = $(this).data("module");
                        var ai_id = $(this).data("ai_id");
                        var pi_id = $(this).data("pi_id");
                        var ai_status = $(this).data("ai_status");
                        var ration = $(this).data("ration");
                        $.mobile.loading("show");
                        self.render_pi(module, pi_id, ration);
                        $.mobile.loading('hide');


                    }).on('click', '#summary_href', function(event) { //返回定位
                        event.preventDefault();
                        if ($(this).data("module")) {
                            self.render();
                            $(this).data("module", "");
                            $("#summary_edit_form #summary_edit_form-footer").hide();
                            $("#add_pi").hide();
                        } else {
                            window.location.href = "/m#summary";
                        }
                    }).on('click', '.btn-summary_edit_form-change_state', function(event) { //定位不足与改进及亮点分享
                        event.preventDefault();
                        var view_filter = $(this).data("view_filter");
                        var module = $(this).data("module");
                        var pi_id = $(this).data("pi_id");
                        var ration = $(this).data("ration");
                        if (view_filter == 'A') {
                            $.mobile.loading("show");

                            self.render_pi(module, pi_id, ration);
                            $.mobile.loading('hide');

                        } else if (view_filter == 'B') {
                            $.mobile.loading("show");

                            self.render_wip(module, pi_id, ration);
                            $.mobile.loading('hide');

                        }
                    }).on('click', '#btn_add_pi_ration_1', function(event) { //指标选择－不足与改进
                        event.preventDefault();
                        var index = "index_select";
                        self.render(index, '1')
                    }).on('click', '#btn_add_pi_ration_2', function(event) { //指标选择
                        event.preventDefault();
                        var index = "index_select";
                        self.render(index, '2')
                    }).on('click', '#add_pi', function(event) { //添加指标
                        event.preventDefault();
                        var ai_id = $(this).data("ai_id");
                        var type = $(this).data("type");

                        var items_1 = self.collection.models[0].attributes.qualitative_pis.items;

                        if (type == '1') {
                            _.each(items_1, function(i) {
                                i.mark_as_summary_type1 = false;
                            })
                        } else {
                            _.each(items_1, function(i) {
                                i.mark_as_summary_type2 = false;

                            })
                        }

                        var items_2 = self.collection.models[0].attributes.quantitative_pis.items;

                        if (type == '1') {
                            _.each(items_2, function(i) {
                                i.mark_as_summary_type1 = false;
                            })
                        } else {
                            _.each(items_2, function(i) {
                                i.mark_as_summary_type2 = false;

                            })
                        }


                        _.each($("#summary_edit_form input[class='pi_select']:checked"), function(x) {
                            var ration = $(x).data("ration");
                            var pi_id = $(x).data("pi_id");

                            if (ration == '1') {
                                var items = self.collection.models[0].attributes.qualitative_pis.items;
                                var found = self.get_pi(items, pi_id);
                                if (type == '1') {

                                    found.mark_as_summary_type1 = true;

                                } else {

                                    found.mark_as_summary_type2 = true;

                                }
                            } else if (ration == '2') {
                                var items = self.collection.models[0].attributes.quantitative_pis.items;
                                var found = self.get_pi(items, pi_id);
                                if (type == '1') {
                                    found.mark_as_summary_type1 = true;

                                } else {
                                    found.mark_as_summary_type2 = true;

                                }
                            }
                        })
                        var data4save = _.clone(self.collection.models[0].attributes);
                        self.data_save(data4save, ai_id, null);

                    }).on('click', '#btn_save', function(event) { //数据保存接口
                        event.preventDefault();
                        var ai_id = $(this).data("ai_id");
                        var data4save = _.clone(self.collection.models[0].attributes);
                        var type = "success";
                        self.data_save(data4save, ai_id, type);
                    }).on('change', "textarea", function(event) {
                        event.preventDefault();
                        var field = String($(this).data("field")).split('-')[0];
                        var self_comment = $(this).val();
                        var ration = $(this).data("ration");
                        var pi_id = $(this).data("pi_id");
                        if (ration == '1') {
                            var items = self.collection.models[0].attributes.qualitative_pis.items;
                            var found = self.get_pi(items, pi_id);
                        } else if (ration == '2') {
                            var items = self.collection.models[0].attributes.quantitative_pis.items;
                            var found = self.get_pi(items, pi_id);
                        }
                        if (field == 'summary') {
                            self.collection.models[0].attributes.summary.self_comment = self_comment;
                        } else if (field == "gap_analysis") {
                            found.summary.gap_analysis.self_comment = self_comment;
                        } else if (field == "improvement_plan") {
                            found.summary.improvement_plan.self_comment = self_comment;

                        } else if (field == "performance_highlights") {
                            found.summary.performance_highlights.self_comment = self_comment;

                        }
                        var data4save = _.clone(self.collection.models[0].attributes);
                        self.data_save(data4save, ai_id, "no_render"); //自评值的保存

                    })
                    // .on('click', "#btn_submit", function(event) {
                    //                     event.preventDefault();
                    //                     var pdcodes = ['AssessmentInstance_summary','AssessmentInstance_summary01' ]; //获取绩效总结流程数据，可能有多条，只能选一条
                    //                     async.times(pdcodes.length, function(n, next) {
                    //                         var url = '/admin/wf/process_define/get_json_by_code?process_code=' + pdcodes[n];
                    //                         $.get(url, function(data) {
                    //                             if (data.length) {
                    //                                 next(null, data[0]);
                    //                             } else {
                    //                                 next(null, null);
                    //                             };
                    //                         });
                    //                     }, function(err, results) {
                    //                         pds = _.compact(results);
                    //                         self.render_wf(pds);
                    //                     })
                    //                 }).on('click', "#do_submit", function(event) {
                    //                     event.preventDefault();
                    //                     var wf_select = $("input[class='wf_select']:checked");
                    //                     var pd_id = wf_select.val();
                    //                     var process_name = wf_select.data("process_name");
                    //                     $("#summary_edit_form #btn_save").trigger("click");
                    //                     var pd = _.find(pds, function(x) {
                    //                         return x._id == pd_id;
                    //                     })
                    //                     if (pd) {
                    //                         $("#do_submit").attr('disabled', 'disabled');
                    //                         var process_define = pd._id;
                    //                         var process_instance_name = self.collection.models[0].attributes.ai_name + '的总结审批流程';
                    //                         var url = pd.process_start_url;
                    //                         var post_data = {
                    //                             process_define: process_define,
                    //                             process_instance_name: process_instance_name,
                    //                             ai_id: ai_id,
                    //                         };
                    //                         $.post(url, post_data, function(data, textStatus, xhr) {
                    //                             if (data.code == 'OK') {
                    //                                 var task_id = data.data.ti._id + '-' + data.data.pd._id + '-' + data.data.pd.process_code;
                    //                                 window.location = '/m#godo12/' + task_id + '/edit';
                    //                             } else if (data.code == 'ERR') {
                    //                                 $("#do_submit").removeAttr('disabled');
                    //                                 console.log(data.err); //把错误信息输出到控制台，以便查找错误。
                    //                             }
                    //                         })

                //                     };
                //                 })
                .on('click', "#btn_add_colltask", function(event) { //不足与改进中的创建任务
                    event.preventDefault();
                    var $this = $(this);
                    var confirm_msg = '确认为当前指标创建一个任务吗？';
                    // if (confirm(confirm_msg)) { //优化一点效率
                    my_confirm(confirm_msg, null, function() {
                        $.mobile.loading("show");

                        var pi_id = $this.data('pi_id');
                        var ration = $this.data('ration');
                        var found;
                        if (ration == '1') {
                            var items = self.collection.models[0].attributes.qualitative_pis.items;
                            found = self.get_pi(items, pi_id);
                        } else if (ration == '2') {
                            var items = self.collection.models[0].attributes.quantitative_pis.items;
                            found = self.get_pi(items, pi_id);
                        };
                        if (found) {

                            //新建一个coll task
                            var new_coll_task = {
                                task_name: '新建绩效总结任务-' + self.collection.models[0].attributes.ai_name,
                                task_descrpt: '指标:' + found.pi_name,
                                start: new Date(),
                                end: moment().add(10, 'day').toDate(),
                                th: $("#login_people").val(),
                                pi: { //关联的考核指标-跟绩效合同相关－只关联一个pi
                                    ai_id: ai_id || self.collection.models[0].attributes._id,
                                    pi_lx: (ration == "1") ? 'dx' : 'dl', // 类型： dl：定量  dx：定性
                                    pi_id: pi_id,
                                    period_name: self.collection.models[0].attributes.period_name,
                                    pi_name: found.pi_name,
                                    people_name: $("#login_people_name").val(),
                                },
                            };
                            var ct = new CollTask(new_coll_task);
                            ct.save().done(function() {
                                found.summary.coll_tasks.push(ct.toJSON());
                                var ai_id = ai_id || self.collection.models[0].attributes._id;
                                var data4save = _.clone(self.collection.models[0].attributes);
                                var type = "render_pi";
                                // $.mobile.loading('show');

                                self.data_save(data4save, ai_id, type, 'A' + '/' + pi_id + '/' + ration);
                                $.mobile.loading('hide');

                            })
                        };
                    })
                }).on('click', "#mark_as_watch", function(event) { //用change会触发多次事件
                    event.preventDefault();
                    var $this = $(this);
                    var pi_id = $this.data('pi_id');
                    var ration = $this.data('ration');
                    var found;
                    if (ration == '1') {
                        var items = self.collection.models[0].attributes.qualitative_pis.items;
                        found = self.get_pi(items, pi_id);
                    } else if (ration == '2') {
                        var items = self.collection.models[0].attributes.quantitative_pis.items;
                        found = self.get_pi(items, pi_id);
                    };
                    if (found) {
                        var if_mark_as_watch = $("#summary_edit_form input[id='mark_as_watch']:checked");
                        if (if_mark_as_watch.length > 0) {
                            found.summary.mark_as_watch = true;

                        } else {
                            found.summary.mark_as_watch = false;
                        }
                        var ai_id = ai_id || self.collection.models[0].attributes._id;
                        var data4save = _.clone(self.collection.models[0].attributes);
                        var type = "render_pi";
                        $.mobile.loading('show');
                        self.data_save(data4save, ai_id, type, 'A' + '/' + pi_id + '/' + ration);

                    }
                }).on('click', "#btn_wf_view", function(event) {
                    event.preventDefault();
                    var ai_id = ai_id || self.collection.models[0].attributes._id;
                    self.get_wfs(ai_id);
                }).on('click', "#btn_submit", function(event) {
                    event.preventDefault();
                    var ai_id = self.collection.models[0].attributes._id;
                    var ai_name = self.collection.models[0].attributes.ai_name;
                    var post_data = {
                        ai_id: ai_id,
                        ai_name: ai_name,
                        type: 'summary'
                    }
                    $("#btn_submit").attr('disabled', "disabled");
                    var url = '/admin/pm/assessment_instance/appeal/wf_create';
                    // if (confirm("确认提交审批吗？")) {
                    my_confirm("确认发起流程吗?", null, function() {
                        $.mobile.loading("show");

                        $.post(url, post_data, function(data, textStatus, xhr) {
                            if (data.code == 'OK') {
                                var task_id = data.data.ti._id + '-' + data.data.pd._id + '-' + data.data.pd.process_code;
                                window.location = '/m#godo12/' + task_id + '/edit';
                                $.mobile.loading("hide");

                            } else if (data.code == 'ERR') {
                                $("#btn_submit").removeAttr('disabled');
                                console.log(data.err); //把错误信息输出到控制台，以便查找错误。
                            }
                        })
                    })

                })

            },
            get_ind_superiors: function(people_id, cb) {

                $.get('/admin/masterdata/people/get/' + people_id, function(data) {
                    if (data.code == 'OK') {
                        cb(null, data.data);
                    } else {
                        cb(null, null);
                    };
                });

            },
            get_superiors: function(people_id, cb) {
                $.get('/admin/masterdata/people/get/' + people_id, function(data) {
                    if (data.code == 'OK') {
                        cb(null, data.data);
                    } else {
                        cb(null, null);
                    };
                });
            },
            redraw_sparkline: function() {
                _.each($(".sparkline-revise-history"), function(x) {
                    var $x = $(x);
                    var composite_values = $x.data("composite_values") + '';
                    var values = $x.attr("values") + '';
                    var bar_range_max;
                    if (composite_values) {
                        var max1 = parseFloat(_.max(values.split(','), function(x) {
                            return parseFloat(x);
                        }));
                        var max2 = parseFloat(_.max(composite_values.split(','), function(x) {
                            return parseFloat(x);
                        }));
                        // console.log(max1, max2);
                        if (max1 >= max2) {
                            bar_range_max = max1;
                        } else {
                            bar_range_max = max2;
                        };
                    };
                    // console.log('max:', bar_range_max);
                    $x.sparkline('html', {
                        type: 'bar',
                        width: '100%',
                        height: 30,
                        enableTagOptions: true,
                        barWidth: '10',
                        chartRangeMin: 0,
                        chartRangeMax: bar_range_max,
                        // zeroAxis: false,

                        tooltipFormatter: function(sp, ops, fields) {
                            var revise_date = $(sp.el).data('revise_date').split(',');
                            var value_obj = fields[0];
                            var tp = ['<div class="jqs jqstitle" style="text-shadow:none">更新日期：' + revise_date[value_obj.offset] + '</div>'];
                            // tp.push('<div class="jqsfield">更新内容：' + $.sprintf('%0.2f', Math.round(value_obj.value * 1000) / 1000) + '</div>');
                            tp.push('<div class="jqsfield" style="text-shadow:none">更新内容：' + value_obj.value + '</div>');
                            return tp.join('');
                        }
                    })
                    if (composite_values) { //发现需要覆盖的数据，画出图形
                        $x.sparkline(composite_values.split(','), {
                            composite: true,
                            // type: 'bar',
                            fillColor: false,
                            lineColor: 'red',
                            lineWidth: 3,
                            barColor: '#ff0000',
                            chartRangeMin: 0,
                            chartRangeMax: bar_range_max,
                            tooltipFormatter: function(sp, ops, fields) {
                                // console.log(fields);
                                var value_obj = fields;
                                var tp = [];
                                tp.push('<div class="jqsfield" style="text-shadow:none">目标值：' + value_obj.y + '</div>');
                                return tp.join('');
                            }
                        });

                    };
                })
            },
            get_pi: function(items, pi_id) { // 得到指标对象
                var found = _.find(items, function(x) {
                    return x.pi == String(pi_id)
                })
                return found
            },
            data_save: function(data4save, ai_id, type, render_type) {
                var self = this;
                //回复populate出来的字段
                _.each(data4save.quantitative_pis.items, function(x) {
                    if (x.scoringformula) {
                        x.scoringformula = x.scoringformula._id; //回复populate出来的字段
                    };
                    x.coll_tasks = _.map(_.clone(_.compact(x.coll_tasks)), function(y) {
                        return y._id;
                    });
                    x.coll_projects = _.map(_.clone(_.compact(x.coll_projects)), function(y) {
                        return y._id;
                    });
                    x.summary.coll_tasks = _.map(_.clone(_.compact(x.summary.coll_tasks)), function(y) {
                        return y._id;
                    });
                    _.each(x.wip_summary, function(y) {
                        y.coll_tasks = _.map(_.clone(_.compact(y.coll_tasks)), function(x) {
                            return z._id;
                        })
                    })
                    _.each(x.segments, function(y) {
                            _.each(y.segment_summary, function(z) {
                                z.coll_tasks = _.map(_.clone(_.compact(z.coll_tasks)), function(a) {
                                    return a._id;
                                });
                            })
                            y.coll_projects = _.map(_.clone(_.compact(y.coll_projects)), function(z) {
                                return z._id;
                            });
                        })
                        //更新创建人相关的信息
                        //绩效偏差及需要提升的能力分析 改进措施 亮点分享
                    if (people_ind_superiors) { //间接上级

                        x.summary.gap_analysis.upper_comment.people_name = x.summary.improvement_plan.upper_comment.people_name = x.summary.performance_highlights.upper_comment.people_name = people_ind_superiors.people_name;
                        x.summary.gap_analysis.upper_comment.position_name = x.summary.improvement_plan.upper_comment.position_name = x.summary.performance_highlights.upper_comment.position_name = people_ind_superiors.position_name;
                        x.summary.gap_analysis.upper_comment.ou_name = x.summary.improvement_plan.upper_comment.ou_name = x.summary.performance_highlights.upper_comment.ou_name = people_ind_superiors.ou_name;
                        x.summary.gap_analysis.upper_comment.avatar = x.summary.improvement_plan.upper_comment.avatar = x.summary.performance_highlights.upper_comment.avatar = people_ind_superiors.avatar;
                    };
                    if (people_superiors) { //直接上级
                        x.summary.gap_analysis.upper2_comment.people_name = x.summary.improvement_plan.upper2_comment.people_name = x.summary.performance_highlights.upper2_comment.people_name = people_superiors.people_name;
                        x.summary.gap_analysis.upper2_comment.position_name = x.summary.improvement_plan.upper2_comment.position_name = x.summary.performance_highlights.upper2_comment.position_name = people_superiors.position_name;
                        x.summary.gap_analysis.upper2_comment.ou_name = x.summary.improvement_plan.upper2_comment.ou_name = x.summary.performance_highlights.upper2_comment.ou_name = people_superiors.ou_name;
                        x.summary.gap_analysis.upper2_comment.avatar = x.summary.improvement_plan.upper2_comment.avatar = x.summary.performance_highlights.upper2_comment.avatar = people_superiors.avatar;
                    };

                })
                _.each(data4save.qualitative_pis.items, function(x) {
                        if (x.grade_group) {
                            x.grade_group = x.grade_group._id; //回复populate出来的字段
                        };
                        x.coll_tasks = _.map(_.clone(_.compact(x.coll_tasks)), function(y) {
                            return y._id;
                        });
                        x.coll_projects = _.map(_.clone(_.compact(x.coll_projects)), function(y) {
                            return y._id;
                        });
                        x.summary.coll_tasks = _.map(_.clone(_.compact(x.summary.coll_tasks)), function(y) {
                            return y._id;
                        });
                        _.each(x.wip_summary, function(y) {
                            y.coll_tasks = _.map(_.clone(_.compact(y.coll_tasks)), function(x) {
                                return z._id;
                            })
                        })
                        _.each(x.segments, function(y) {
                                _.each(y.segment_summary, function(z) {
                                    z.coll_tasks = _.map(_.clone(_.compact(z.coll_tasks)), function(a) {
                                        return a._id;
                                    });
                                })
                                y.coll_projects = _.map(_.clone(_.compact(y.coll_projects)), function(z) {
                                    return z._id;
                                });
                            })
                            //更新创建人相关的信息
                            //绩效偏差及需要提升的能力分析 改进措施 亮点分享
                        if (people_ind_superiors) { //间接上级
                            x.summary.gap_analysis.upper_comment.people_name = x.summary.improvement_plan.upper_comment.people_name = x.summary.performance_highlights.upper_comment.people_name = people_ind_superiors.people_name;
                            x.summary.gap_analysis.upper_comment.position_name = x.summary.improvement_plan.upper_comment.position_name = x.summary.performance_highlights.upper_comment.position_name = people_ind_superiors.position_name;
                            x.summary.gap_analysis.upper_comment.ou_name = x.summary.improvement_plan.upper_comment.ou_name = x.summary.performance_highlights.upper_comment.ou_name = people_ind_superiors.ou_name;
                            x.summary.gap_analysis.upper_comment.avatar = x.summary.improvement_plan.upper_comment.avatar = x.summary.performance_highlights.upper_comment.avatar = people_ind_superiors.avatar;
                        };
                        if (people_superiors) { //直接上级
                            x.summary.gap_analysis.upper2_comment.people_name = x.summary.improvement_plan.upper2_comment.people_name = x.summary.performance_highlights.upper2_comment.people_name = people_superiors.people_name;
                            x.summary.gap_analysis.upper2_comment.position_name = x.summary.improvement_plan.upper2_comment.position_name = x.summary.performance_highlights.upper2_comment.position_name = people_superiors.position_name;
                            x.summary.gap_analysis.upper2_comment.ou_name = x.summary.improvement_plan.upper2_comment.ou_name = x.summary.performance_highlights.upper2_comment.ou_name = people_superiors.ou_name;
                            x.summary.gap_analysis.upper2_comment.avatar = x.summary.improvement_plan.upper2_comment.avatar = x.summary.performance_highlights.upper2_comment.avatar = people_superiors.avatar;
                        };
                    })
                    //整体总结部分
                if (people_ind_superiors) { //间接上级
                    data4save.summary.upper_comment.people_name = people_ind_superiors.people_name;
                    data4save.summary.upper_comment.position_name = people_ind_superiors.position_name;
                    data4save.summary.upper_comment.ou_name = people_ind_superiors.ou_name;
                    data4save.summary.upper_comment.avatar = people_ind_superiors.avatar;
                };
                if (people_superiors) { //直接上级
                    data4save.summary.upper2_comment.people_name = people_superiors.people_name;
                    data4save.summary.upper2_comment.position_name = people_superiors.position_name;
                    data4save.summary.upper2_comment.ou_name = people_superiors.ou_name;
                    data4save.summary.upper2_comment.avatar = people_superiors.avatar;
                };
                self.collection.models[0].save(data4save, {
                    success: function(model, response, options) {
                        self.collection.url = '/admin/pm/assessment_instance/summary/bb/' + ai_id;
                        self.collection.fetch().done(function() {
                            if (type == "render_pi") {
                                var module = String(render_type).split('/')[0];
                                var pi_id = String(render_type).split('/')[1];
                                var ration = String(render_type).split('/')[2];
                                $.mobile.loading("show");

                                self.render_pi(module, pi_id, ration);
                                $.mobile.loading('hide');

                            } else if (type != "no_render") {
                                self.render();
                            } else if (type == "render") {
                                self.render();
                            }
                            if (type == "success") {
                                alert("数据保存成功!");
                            }
                        })

                    },
                    error: function(model, xhr, options) {}
                });
            },
            get_wfs: function(ai_id) {
                $.get('/admin/wf/process_instance/get_pis_by_cid?cid=' + ai_id + '&codes=AssessmentInstance_summary,AssessmentInstance_summary01', function(data) {
                    if (data.code == 'OK') {
                        var wfs = data.data;
                        window.location.href = "/m#godo12/" + wfs[0]._id + '/view';
                    };
                });
            }
        });

        // Returns the View class
        return AssessmentSummaryEditView;

    });