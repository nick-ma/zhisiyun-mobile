// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars"],
    function($, _, Backbone, Handlebars) {

        Handlebars.registerHelper('be_submit', function(data) {

            var f_d = _.find(data, function(dt) {
                var people_id = dt.people ? dt.people._id : '';
                return !dt.is_submit && people_id == $('#login_people').val();
            })
            if (f_d) {
                return f_d.comment
            } else {
                return ''
            };
        });
        Handlebars.registerHelper('be_submit_show', function(data, options) {
            var f_d = _.find(data, function(dt) {
                var people_id = dt.people ? dt.people._id : '';
                return !dt.is_submit && people_id == $('#login_people').val();
            })

            if (f_d) {
                return options.fn(this);
            } else {
                return options.inverse(this);
            };
        });

        var WorkReportDetailView = Backbone.View.extend({

            initialize: function() {
                var self = this;
                self.template = Handlebars.compile($("#tmp_wr_detail_view").html());
                self.template_task = Handlebars.compile($("#hbtmp_coll_task_list_view").html());
                self.template_project = Handlebars.compile($("#hbtmp_coll_project_list_view_all").html());

                this.template_select_people = Handlebars.compile($("#hbtmp_people_select_single_view").html());

                this.loading_template = Handlebars.compile($("#loading_template_view").html());
                self.model_view = '0';
                self.task_items = [];
                self.project_items = [];
                self.back_url = '';
                self.select_pp = null;
                self.bind_events();
            },
            pre_render: function() {
                var self = this;
                $("#wr_detail-content").html(self.loading_template({
                    info_msg: '数据加载中...请稍候'
                }));
                $("#wr_detail-content").trigger('create');
                return this;
            },
            // Renders all of the People models on the UI
            render: function() {
                var self = this;
                // self.wr_detail_back_url = localStorage.getItem('wr_detail_back_url') || null;
                // localStorage.removeItem('wr_detail_back_url'); //用完删掉 
                // if (self.wr_detail_back_url) {
                // $("#btn-wr_detail-back").attr('href', self.wr_detail_back_url);
                // }
                var render_data = '';
                if (self.model_view == '0') {
                    $('#wr_name').html('工作报告')
                    render_data = self.template(self.model.attributes);

                } else if (self.model_view == '1') {
                    $('#wr_name').html('任务列表')
                    render_data = self.template_task({
                        cts: self.task_items,
                        render_mode: 'task'
                    });
                } else if (self.model_view == '2') {
                    $('#wr_name').html('项目列表')

                    render_data = self.template_project({
                        cps: self.project_items,
                        render_mode: 'project'
                    });
                }

                var pp_maps = _.compact(_.map(self.model.get('comments'), function(ct) {
                    return ct.people ? ct.people._id : null
                }))

                pp_maps.push(self.model.get('people'))
                var pp_items = _.compact(_.map(self.peoples, function(pp) {
                    if (!!~pp_maps.indexOf(pp._id)) {
                        return null
                    } else {
                        return pp
                    }
                }))
                pp_items = _.sortBy(pp_items, function(pt) {
                    return pt.people_no
                })
                $('#panel-wr_detail-people').html(self.template_select_people({
                    people: pp_items
                }))
                $('#panel-wr_detail-people').trigger('create');
                $("#wr_detail-content").html(render_data);
                $("#wr_detail-content").trigger('create');
                return this;
            },
            bind_events: function() {
                var self = this;
                $("#wr_detail").on('change', 'textarea', function(event) {
                    event.preventDefault();
                    var $this = $(this);
                    var val = $this.val();
                    var field = $this.data('field');
                    self.model.set(field, val);
                }).on('click', '#btn_wr_ok', function(event) {
                    event.preventDefault();
                    var wr_comment = $("#wr_detail-content #wr_comment").val()
                    if (!wr_comment) {
                        alert('请填写审批意见！');
                        return false;

                    };

                    self.model.set('is_sub_submit', "S");
                    self.model.set('comment', wr_comment)
                    self.model.save().done(function() {
                        alert('保存成功');
                        self.model.fetch().done(function() {
                            self.render();
                        })
                    })
                }).on('click', '#btn_wr_submit', function(event) {
                    event.preventDefault();

                    var wr_comment = $("#wr_detail-content #wr_comment").val()
                    if (!wr_comment) {
                        alert('请填写审批意见！');
                        return false;

                    };
                    self.model.set('is_sub_submit', "C");
                    self.model.set('comment', wr_comment);
                    if (confirm('确定提交吗 ？\n提交成功将转到列表')) {
                        $.mobile.loading("show");
                        self.model.save().done(function() {
                            $.mobile.loading("hide");
                            alert('提交成功');
                            window.location.href = localStorage.getItem('wr_detail_back_url')
                        })
                    }
                }).on('click', '#btn_wr_ok_sub', function(event) {
                    event.preventDefault();

                    //保存时，重置populate的id
                    // _.each(self.model.attributes.comments, function(x) {
                    //     if (!!x.people._id) {
                    //         x.people = x.people._id;
                    //     }
                    // })
                    var wr_comment = $("#wr_detail-content #wr_comment").val()
                    if (!wr_comment) {
                        alert('请填写审批意见！');
                        return false;

                    };
                    self.model.set('is_sub_submit', "T")
                    self.model.set('comment', wr_comment);
                    if (confirm('确定提交吗 ？\n提交成功将转到列表')) {
                        $.mobile.loading("show");
                        self.model.save().done(function() {
                            $.mobile.loading("hide");
                            alert('提交成功');
                            window.location.href = localStorage.getItem('wr_detail_back_url')
                        })
                    }
                }).on('click', '#view_task_list', function(event) {
                    event.preventDefault();
                    $.mobile.loading("show");
                    $.post('/admin/pm/coll_task/get_task_json', self.model.attributes, function(data) {
                        $.mobile.loading("hide");
                        self.task_items = data
                        self.model_view = '1'
                        self.render();
                    })
                }).on('click', '#view_project_list', function(event) {
                    event.preventDefault();
                    $.mobile.loading("show");
                    $.post('/admin/pm/coll_task/get_project_json', self.model.attributes, function(data) {
                        $.mobile.loading("hide");
                        self.project_items = data
                        self.model_view = '2'
                        self.render();
                    })
                }).on('click', "#btn-wr_detail-back", function(event) {
                    event.preventDefault();
                    if (self.model_view == '2' || self.model_view == '1') {
                        self.model_view = '0'
                        self.render();
                    } else {
                        if (localStorage.getItem('wr_detail_back_url')) {
                            window.location.href = localStorage.getItem('wr_detail_back_url')
                        } else {
                            window.location.href = '#wrlist'
                        }
                    }
                }).on('click', '#btn_wr_self_ok', function(event) {
                    event.preventDefault();
                    if (!self.model.attributes.body_current_plan) {
                        alert('本期计划不能为空！')
                        return false
                    };
                    if (!self.model.attributes.body_info) {
                        alert('本期总结不能为空！')
                        return false
                    };
                    if (!self.model.attributes.body_last_plan) {
                        alert('下期计划不能为空！')
                        return false
                    };
                    self.model.save().done(function() {
                        alert('保存成功');
                        self.model.fetch().done(function() {
                            self.render();
                        })
                    })
                }).on('click', '#btn_wr_self_submit', function(event) {
                    event.preventDefault();
                    if (!self.model.attributes.body_current_plan) {
                        alert('本期计划不能为空！')
                        return false
                    };
                    if (!self.model.attributes.body_info) {
                        alert('本期总结不能为空！')
                        return false
                    };
                    if (!self.model.attributes.body_last_plan) {
                        alert('下期计划不能为空！')
                        return false
                    };
                    self.model.set('is_submit', true);
                    self.model.save().done(function() {
                        alert('保存成功');
                        self.model.fetch().done(function() {
                            self.render();
                        })
                    })
                }).on('click', '#btn_wr_ok_other', function(event) {
                    event.preventDefault();
                    if (!self.select_pp) {
                        alert('请选择转发对象')
                    };

                    var wr_comment = $("#wr_detail-content #wr_comment").val()
                    if (!wr_comment) {
                        alert('请填写审批意见！');
                        return false;

                    };
                    self.model.set('select_people', self.select_pp);
                    self.model.set('is_sub_submit', "Z");
                    self.model.set('comment', wr_comment)
                    self.model.save().done(function() {
                        alert('提交成功');
                        window.location.href = localStorage.getItem('wr_detail_back_url')
                        // self.model.fetch().done(function() {
                        //     self.render();
                        // })
                    })

                }).on('click', '#btn_wr_to_pp', function(event) {
                    event.preventDefault();
                    $("#panel-wr_detail-people").panel('open').trigger("updatelayout");
                })


                $("#panel-wr_detail-people").on("panelclose", function(event, ui) {
                    var pp_id = $("#panel-wr_detail-people input[type=radio]:checked").val();
                    var f_d = _.find(self.peoples, function(pp) {
                        return pp._id == pp_id
                    })
                    if (f_d) {
                        self.select_pp = f_d._id
                        $('#select_people').html('转发对象：' + f_d.people_name + '/' + f_d.position_name + '/' + f_d.ou_name)
                    };
                });
            },

        });

        // Returns the View class
        return WorkReportDetailView;

    });