// ToDo View
// =============

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "../models/WFApproveModel"], function($, _, Backbone, Handlebars, WFApproveModel) {
    Handlebars.registerHelper('delta', function(data, options) {
        if (data <= 0) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        };
    });
    var pd, dm2;
    var ToDoListView = Backbone.View.extend({
        // The View Constructor
        initialize: function() {
            this.template = Handlebars.compile($("#todo_view").html());
            this.template2 = Handlebars.compile($("#finished_view").html());
            this.template3 = Handlebars.compile($("#hbtmp_my_workflow_view").html());
            this.template4 = Handlebars.compile($("#hbtmp_start_form_view").html());
            this.template5 = Handlebars.compile($("#hbtmp_wf_approve_list_view").html());
            this.loading_template = Handlebars.compile($("#loading_template_view").html());
            // this.collection.on("sync", this.render, this);
            this.bind_event();
            this.view_mode = '1';
            this.mode = '2';
            this.search_term = ''; //过滤条件
            this.date_offset = 30; //过滤条件
        },
        pre_render: function() {
            var self = this;
            $("#personal_wf_work_of_travel-content").html(self.loading_template({
                info_msg: '数据加载中...请稍候'
            }));
            $("#personal_wf_work_of_travel-content").trigger('create');
            return this;
        },
        // Renders all of the Task models on the UI
        render: function() {
            var self = this;

            var login_people = $("#login_people").val();
            var tmp = _.map(self.c_wf_approve.models, function(x) {
                return x.toJSON();
            });
            dm2 = _.filter(tmp, function(x) {
                return !!_.find(x.tasks, function(y) {
                    return y.people._id == login_people;
                }) && (!x.current_handler || x.current_handler._id != login_people)
            })

            if (self.view_mode == '1') {
                $("#btn-todo-back").show();
                $("#todo_name").html("待办事项");
                $("#todo_select").attr("style", "display:none");
                $("#todo_free_select").attr("style", "display:none");
                $("#todo_title").attr("style", "");
                var rendered_data = {
                    todos: _.map(self.collection.models, function(x) {
                        return x.toJSON();
                    })
                }
                $("#todo_list-content").html(self.template(rendered_data));
            } else if (self.view_mode == '2') {
                $("#btn-todo-back").hide();
                $("#todo_name").html("");
                $("#todo_select").attr("style", "display:block");
                $("#todo_free_select").attr("style", "display:none");
                $("#todo_title").attr("style", "padding: 0px;");
                var rendered_data = {
                    todos: _.map(self.tfList.models, function(x) {
                        return x.toJSON();
                    })
                }
                $("#todo_list-content").html(self.template2(rendered_data));
            } else if (self.view_mode == '3') {
                $("#btn-todo-back").hide();
                $("#todo_name").html("发起流程");
                $("#todo_select").attr("style", "display:none");
                $("#todo_free_select").attr("style", "display:none");
                $("#todo_title").attr("style", "");
                var render_data = {
                    pds: _.map(self.c_wf_my_workflow.models, function(x) {
                        return x.toJSON();
                    })
                };
                $("#todo_list-content").html(self.template3(render_data));
            } else if (self.view_mode == '4') {
                $("#btn-todo-back").hide();
                $("#todo_name").html("");
                $("#todo_select").attr("style", "display:none");
                $("#todo_free_select").attr("style", "display:block");
                $("#todo_title").attr("style", "padding: 0px;");

                // self.mode = $("#todo_list input[type=radio][name=wf_approve_view_mode]:checked").val() || '1';

                var models4render = [];
                var render_mode = '';
                var render_data;

                // console.log(tmp);
                //根据条件进行过滤
                // if (self.search_term) {
                //     var st = /./;
                //     st.compile(self.search_term);
                //     tmp = _.filter(tmp, function(x) {
                //         return st.test(x.name);
                //     })
                // };
                // var dm1 = _.filter(tmp, function(x) {
                //     return x.state == 'START' && x.current_handler._id == login_people;
                // });

                // var dm3 = _.filter(tmp, function(x) {
                //     return x.creator._id == login_people;
                // })
                // var dm4 = _.filter(tmp, function(x) {
                //     return x.state == 'END' && x.op == '通过' && !!_.find(x.cc_people, function(y) {
                //         return y == login_people;
                //     })
                // })
                // var ts_count = {
                //     '1': dm1.length,
                //     '2': dm2.length,
                //     '3': dm3.length,
                //     '4': dm4.length,
                // };
                // 整理前端需要渲染的数据
                // if (self.mode == '1') { //待办任务
                //     render_mode = 'todo';
                //     models4render = dm1;
                // } else if (self.mode == '2') { //已办任务
                //     render_mode = 'done';
                //     models4render = dm2;
                // } else if (self.mode == '3') { //我发起的流程
                //     render_mode = 'mywf';
                //     models4render = dm3
                // } else if (self.mode == '4') { //我发起的流程
                //     render_mode = 'ccwf';
                //     models4render = dm4
                // }

                render_mode = 'done';
                models4render = dm2;
                render_data = {
                    render_mode: render_mode,
                    fas: models4render
                }
                _.each($("#todo-left-panel label"), function(x) {
                    $(x).find('span').html(ts_count[$(x).data('mode')] || 0);
                })

                $("#todo_list-content").html(self.template5(render_data));
                $("#todo_list-content").trigger('create');
            } else {
                $("#todo_name").html("选择人员");
                $("#btn-todo-back").hide();
                $("#todo_select").attr("style", "display:none");
                $("#todo_title").attr("style", "");
                var render_data = pd.toJSON();
                render_data.people_name = $("#login_people_name").val();
                $("#todo_list-content").html(self.template4(render_data));
            }

            $("#todo_list-content").trigger('create');

            $("#todo_list").find("#td_num").html(self.collection.models.length);
            $("#todo_list").find("#tf_num").html(self.tfList.models.length);
            $("#todo_list").find("#fr_num").html(dm2.length);

            return self;
        },
        bind_event: function() {
            var self = this;
            $("#btn-todo-back").on('click', function(event) {
                event.preventDefault();
                $.mobile.loading("show");
                self.collection.fetch().done(function() {
                    self.render();
                    $.mobile.loading("hide");
                })
            })
            $("#todo_list").on('click', '.btn-change_state', function(event) {
                    var $this = $(this);

                    self.view_mode = $this.data('state');
                    self.render();

                    $('.btn-change_state').removeClass('ui-btn-active');
                    $this.addClass('ui-btn-active');
                })
                .on('change', '#todo_date_offset', function(event) {
                    var $this = $(this);

                    // if (self.view_mode == '2') {
                        self.tfList.date_offset = $this.val();
                        self.tfList.fetch().done(function() {
                            self.render();
                        })
                    // } else {
                    //     self.c_wf_approve.date_offset = $this.val();
                    //     self.c_wf_approve.fetch().done(function() {
                    //         self.render();
                    //     })
                    // }

                    // async.parallel({
                    //     data1: function(cb) {
                    //         self.tfList.date_offset = $this.val();
                    //         self.tfList.collection.fetch().done(function() {
                    //             cb(null, null);
                    //         });
                    //     },
                    //     data2: function(cb) {
                    //         self.c_wf_approve.date_offset = $this.val();
                    //         self.c_wf_approve.fetch().done(function() {
                    //             cb(null, null);
                    //         });
                    //     }
                    // }, function(err, ret) {
                    //     self.render();
                    // });
                })
                .on('change', '#todo_free_date_offset', function(event) {
                    var $this = $(this);

                    // if (self.view_mode == '2') {
                    //     self.tfList.date_offset = $this.val();
                    //     self.tfList.fetch().done(function() {
                    //         self.render();
                    //     })
                    // } else {
                        self.c_wf_approve.date_offset = $this.val();
                        self.c_wf_approve.fetch().done(function() {
                            self.render();
                        })
                    // }
                })
                .on('click', '#btn-wf_approve-add', function(event) { //新建一个流程
                    event.preventDefault();
                    var name = prompt("请输入报批流程的标题");
                    if (name) {
                        var new_wf = new WFApproveModel({
                            name: name,
                            content: '手机创建'
                        });
                        new_wf
                            .save()
                            .done(function() {
                                alert('流程启动成功');
                                var url = '#wf_approve_edit/' + new_wf.get('_id');
                                window.location.href = url;
                            })
                    } else {
                        alert("必须输入标题才启动报批流程");
                    };
                })
                // .on('change', '#wf_approve_view_mode', function(event) {
                //     event.preventDefault();
                //     self.mode = this.value;
                //     self.render();
                // })
                // .on('click', '.open-left-panel', function(event) {
                //     event.preventDefault();
                //     $("#todo-left-panel").panel("open");
                // })
                // .on('swiperight', function(event) { //向右滑动，打开左边的面板
                //     $("#todo-left-panel").panel("open");
                // })
                // .on('click', '#btn-wf_approve-refresh', function(event) {
                //     event.preventDefault();
                //     $.mobile.loading("show");
                //     self.c_wf_approve.fetch().done(function() {
                //         $.mobile.loading("hide");
                //         $("#todo-left-panel").panel("close");
                //     });
                // })
                // .on('change', '#todo-left-panel input[name=wf_approve_view_mode]', function(event) {
                //     event.preventDefault();
                //     var $this = $(this);
                //     self.mode = $this.val();
                //     self.render();
                //     $("#todo-left-panel").panel("close");
                //     // console.log($this.val());
                // })
                // .on('change', '#todo-left-panel select', function(event) {
                //     event.preventDefault();
                //     var $this = $(this);
                //     var field = $this.data("field");
                //     var value = $this.val();
                //     self[field] = value;
                //     if (field == 'date_offset') { //需要重新获取数据
                //         $.mobile.loading("show");
                //         self.c_wf_approve.date_offset = value;
                //         self.c_wf_approve.fetch().done(function() {
                //             $.mobile.loading("hide");
                //             self.render();
                //         })
                //     } else {
                //         self.render();
                //     };
                //     // $("#todo-left-panel").panel("close");
                //     // console.log($this.val());
                // })
                // .on('change', '#cf_wf_approve_name', function(event) {
                //     event.preventDefault();
                //     var $this = $(this);
                //     self.search_term = $this.val();
                //     self.render();
                // });
            $("#todo_list-content")
                .on('click', '.start_form', function(event) {
                    event.preventDefault();
                    var $this = $(this);
                    var _id = $this.data('up_id');

                    pd = _.find(self.c_wf_my_workflow.models, function(x) {
                        return x.attributes._id.toString() == _id;
                    });

                    self.view_mode = '4';
                    self.render();
                })
                .on('click', '#btn_cancel', function(event) {
                    event.preventDefault();

                    self.view_mode = '3';
                    self.render();
                })
                .on('click', '#btn_start', function(event) {
                    event.preventDefault();
                    var $this = $(this);
                    var up_id = $this.data('up_id');

                    if (confirm('确认以“' + pd.attributes.process_name + '”做为名称来启动流程吗？')) {
                        $this.attr('disabled', true);

                        var start_url = '/admin/wf/universal/start';
                        var post_data = {
                            process_define: up_id,
                            process_instance_name: pd.attributes.process_name,
                        };
                        $.post(start_url, post_data)
                            .done(function(data) {
                                alert('流程启动成功，稍后将转入编辑界面。');
                                var pd = data.pd;
                                var ti = data.ti;
                                window.location.href = '#handle_form/' + ti._id;
                            })
                            .fail(function(data) {
                                alert('流程启动失败：' + data);
                            })
                            .always(function() {
                                $this.attr('disabled', false);
                            });
                    };
                })
        }
    });

    // Returns the View class
    return ToDoListView;

});