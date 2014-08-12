// 绩效计划 View
// =============

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars"], function($, _, Backbone, Handlebars) {
    var ai;
    var ai_data;
    var peoples_data;

    //保存绩效实例
    function save_form_data(cb) {
        var ai_data_c = _.clone(ai_data);

        var ai_id = ai_data_c._id;
        //id删掉做修改
        delete ai_data_c._id;
        //保存时，把poulate后的重置为id保存
        ai_data_c.points_system = !!ai_data_c.points_system._id ? ai_data_c.points_system._id : ai_data_c.points_system;

        if (ai_data_c.qualitative_pis.grade_way == 'G') {
            _.each(ai_data_c.qualitative_pis.items, function(x) {
                x.grade_group = !!x.grade_group._id ? x.grade_group._id : x.grade_group;
            });
        }

        _.each(ai_data_c.quantitative_pis.items, function(x) {
            x.scoringformula = !!x.scoringformula._id ? x.scoringformula._id : x.scoringformula;
            x.dp_people = !!x.dp_people._id ? x.dp_people._id : x.dp_people;
        });

        var url = '/admin/pm/assessment_instance/edit';
        var post_data = "ai_id=" + ai_id;

        post_data += '&ai_data=' + JSON.stringify(ai_data_c);

        $.post(url, post_data, function(data) {
            ai.fetch().done(function() {
                ai_data = ai.attributes;
                cb();
            });
        })

    }

    var do_trans = function() {
        save_form_data(function() {
            var post_data = {
                process_instance_id: $("#process_instance_id").val(),
                task_instance_id: $("#task_instance_id").val(),
                process_define_id: $("#process_define_id").val(),
                next_tdid: $("#next_tdid").val(),
                next_user: $("#next_user_id").val() || null, //'516cf9a1d26ad4fe48000001', //以后从列表中选出
                trans_name: $("#trans_name").val(), // 转移过来的名称
                comment_msg: $("#comment_msg").val(), // 任务批注 
            };
            var post_url = $("#task_process_url").val();
            post_url = post_url.replace('<TASK_ID>', $("#task_instance_id").val());

            $.post(post_url, post_data, function(data) {
                if (data.code == 'OK') {

                    window.location = '#todo';
                };
            })
        })
    }

    var AIWF03View = Backbone.View.extend({
        // The View Constructor
        initialize: function() {
            this.bind_events();
        },
        bind_events: function() {
            var self = this;
            self.$el.on('click', '.do_trans', function(event) {
                if ($("#ti_comment").val() == '') {
                    alert('请填写审批意见！');
                    return;
                }

                event.preventDefault();
                var $this = $(this);

                var process_define_id = $("#process_define_id").val();
                var task_define_id = $("#task_define_id").val();
                var process_instance_id = $("#process_instance_id").val();
                var task_process_url = $("#task_process_url").val();
                var task_instance_id = $("#task_instance_id").val();

                var direction = $this.data('direction');
                var target_id = $this.data('target_id');
                var task_name = $this.data('task_name');
                var name = $this.data('name');
                var roles_type = $this.data('roles_type');
                var position_form_field = $this.data('position_form_field');

                $.post('/admin/wf/trans_confirm_form_4m', {
                    process_define_id: process_define_id,
                    task_define_id: task_define_id,
                    process_instance_id: process_instance_id,
                    task_process_url: task_process_url,
                    next_tdname: task_name,
                    trans_name: name,
                    ti_comment: $("#ti_comment").val(),
                    task_instance_id: task_instance_id,
                    next_tdid: target_id,
                    direction: direction
                }, function(data) {
                    self.view_mode = 'trans';
                    self.trans_data = data;
                    self.render();
                });
            })

            $("#ai_wf1-content").on('click', '#btn_ok', function(e) {
                if ($("#next_user_name").val()) {
                    $("#btn_ok").attr("disabled", "disabled");

                    do_trans();

                } else {
                    alert('请选择下一任务的处理人');
                };
            })

            $("#btn_ai_wf1_cancel").on('click', function(event) {
                event.preventDefault();

                if (!self.view_mode) {
                    window.location.href = '#todo';
                } else if (self.view_mode == 'ai_pi_comment') {
                    var dl_item = _.find(ai_data.quantitative_pis.items, function(x) {
                        return x.pi == self.item.pi;
                    })
                    if (dl_item) {
                        self.view_mode = 'pi_detail';
                    } else {
                        self.view_mode = 'pi_detail2';
                    }

                    self.render();
                } else {
                    self.view_mode = '';
                    self.render();
                }
            })

            $("#ai_wf1-content").on('click', '#btn_trans_cancel', function(event) {
                event.preventDefault();

                self.view_mode = '';
                self.render();
            })

            $("#ai_wf1-content").on('click', '.dlpi', function() {

                var $this = $(this);
                var pi_id = $this.data('pi_id');

                var item = _.find(self.ai.attributes.quantitative_pis.items, function(x) {
                    return pi_id == x.pi;
                });

                self.item = item;
                self.item_obj = {};
                self.item_obj.ai_status = self.ai.attributes.ai_status;
                self.item_obj.pi = item;
                self.view_mode = 'pi_detail';
                self.render();
            });

            $("#ai_wf1-content").on('click', '.dxpi', function() {

                var $this = $(this);
                var pi_id = $this.data('pi_id');

                var item2 = _.find(self.ai.attributes.qualitative_pis.items, function(x) {
                    return pi_id == x.pi;
                });

                self.item = item2;
                self.item_obj = {};
                self.item_obj.ai_status = self.ai.attributes.ai_status;
                self.item_obj.pi = item2;
                self.view_mode = 'pi_detail2';
                self.render();
            });

            $("#ai_wf1-content").on('click', '.ai_pi_comment', function() {
                var $this = $(this);
                self.view_mode = 'ai_pi_comment';
                self.render();
            });

            $("#ai_wf1-content").on('change', '#ai_pi_new_comment', function() {
                var obj = {};
                obj.comment = $("#ai_pi_new_comment").val();
                obj.createDate = moment();
                var people = _.find(peoples_data, function(x) {
                    return x._id == $("#login_people").val();
                })
                obj.people_name = people.people_name;
                obj.position_name = people.position.position_name;
                obj.creator = people._id;
                obj.avatar = people.avatar;

                self.item.comments.push(obj);
                save_form_data(function() {
                    self.render();
                })
            });

            $("#ai_wf1-content").on('change', '#select_next_user', function() {
                var $this = $(this);

                $("#next_user_id").val($this.val());
                $("#next_user_name").val($this.find("option:selected").text());
            });
        },
        // Renders all of the Task models on the UI
        render: function() {
            var self = this;

            //克隆others，方便取加减分项
            var others = _.clone(self.ai.attributes.others);
            //获取加分项
            var other1 = _.find(others, function(x) {
                return x.item_type == '1';
            });
            //获取减分项
            var other2 = _.find(others, function(x) {
                return x.item_type == '2';
            });
            //获取一票否决项
            var other3 = _.find(others, function(x) {
                return x.item_type == '3';
            });

            ai = self.ai;
            ai_data = self.ai.attributes;
            peoples_data = self.ai_datas.attributes.peoples;

            var obj = {};
            obj.ai = ai_data;
            obj.other1 = other1;
            obj.other2 = other2;
            obj.other3 = other3;
            obj.tts = self.wf_data.attributes.tts;
            obj.td = self.wf_data.attributes.td;
            obj.ti = self.wf_data.attributes.ti;

            obj.pd = self.wf_data.attributes.pd;
            obj.history_tasks = self.wf_data.attributes.history_tasks;
            obj.flowchart_data = self.wf_data.attributes.flowchart_data;
            obj.attachments = self.wf_data.attributes.attachments;

            if (self.view_mode) {
                if (self.view_mode == 'trans') {
                    $("#ai_wf_title").html('数据处理人');

                    this.template = Handlebars.compile($("#trans_confirm_view").html());
                    $("#ai_wf1-content").html(self.template(self.trans_data));
                    $("#ai_wf1-content").trigger('create');

                    if (self.trans_data.next_td.node_type == 'END') {
                        do_trans();
                    }
                } else if (self.view_mode == 'pi_detail') {
                    $("#ai_wf_title").html('指标明细');

                    this.template = Handlebars.compile($("#assessment_dl_pi_detail_view").html());
                    $("#ai_wf1-content").html(self.template(self.item_obj));
                    $("#ai_wf1-content").trigger('create');

                } else if (self.view_mode == 'pi_detail2') {
                    $("#ai_wf_title").html('指标明细');

                    this.template = Handlebars.compile($("#assessment_dx_pi_detail_view").html());
                    $("#ai_wf1-content").html(self.template(self.item_obj));
                    $("#ai_wf1-content").trigger('create');
                } else if (self.view_mode == 'ai_pi_comment') {
                    $("#ai_wf_title").html('沟通记录');

                    this.template = Handlebars.compile($("#pi_comment_view").html());
                    $("#ai_wf1-content").html(self.template(self.item));
                    $("#ai_wf1-content").trigger('create');
                }
            } else {
                this.template = Handlebars.compile($("#wf03_view").html());
                $("#ai_wf1-content").html(self.template(obj));
                $("#ai_wf1-content").trigger('create');
            }

            return self;
        }
    });

    // Returns the View class
    return AIWF03View;
});