// CollTask Detail View
// =================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars",
        "../models/TaskModel"
    ],
    function($, _, Backbone, Handlebars,
        TaskModel) {

        // Extends Backbone.View
        var CollTaskDetailView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                this.template_basic = Handlebars.compile($("#hbtmp_coll_task_detail_view_basic").html());
                this.template_comment = Handlebars.compile($("#hbtmp_coll_task_detail_view_comment").html());
                this.template_revise = Handlebars.compile($("#hbtmp_coll_task_detail_view_revise").html());
                this.template_attachment = Handlebars.compile($("#hbtmp_coll_task_detail_view_attachment").html());
                this.template_score = Handlebars.compile($("#hbtmp_coll_task_detail_view_score").html());
                // The render method is called when CollTask Models are added to the Collection
                // this.collection.on("sync", this.render, this);
                this.view_mode = 'basic'; //初始化为基本信息界面
                this.bind_event();
            },

            // Renders all of the CollTask models on the UI
            render: function() {

                var self = this;

                if (localStorage.getItem('comment_model_back')) {
                    self.model.set(JSON.parse(localStorage.getItem('comment_model_back')).model);
                    localStorage.removeItem('comment_model_back');
                    self.model.save().done(function() {
                        self.render();
                    })
                    return;
                };
                var render_data = self.model.toJSON();
                var ct_last_view = JSON.parse(localStorage.getItem('ct_last_view')) || [];
                var found = _.find(ct_last_view, function(x) {
                    return x._id == render_data._id;
                })
                if (found) { //找到了，根据里面记录的时间做计算
                    found.ts = new Date();
                };
                localStorage.setItem('ct_last_view', JSON.stringify(ct_last_view));
                //查找子任务
                render_data.sub_tasks = _.map(_.filter(self.model.collection.models, function(x) {
                    return x.get('p_task') == self.model.get('_id')
                }), function(x) {
                    return x.toJSON();
                })
                render_data.login_people = $("#login_people").val();

                //设定返回按钮的地址
                if (self.model.get('p_task')) { //有父级任务，返回
                    var p_task_detail = _.find(self.model.collection.models, function(x) {
                        return x.get('_id') == self.model.get('p_task')
                    })

                    render_data.p_task_detail = (p_task_detail) ? p_task_detail.toJSON() : null;

                    $("#btn-colltask_detail-back").attr('href', '#colltask_detail/' + self.model.get('p_task'));
                } else {
                    $("#btn-colltask_detail-back").attr('href', '#colltask');
                };
                var rendered = '';
                if (self.view_mode == 'basic') {
                    rendered = self.template_basic(render_data)
                } else if (self.view_mode == 'comment') {
                    rendered = self.template_comment(render_data)
                } else if (self.view_mode == 'revise') {
                    //渲染更改记录部分
                    var rh_data = _.sortBy(_.map(_.groupBy(self.model.get('revise_history'), function(x) {
                            return moment(x.timestamp).format('YYYY-MM-DD HH:mm')
                        }), function(val, key) {
                            return {
                                ts: key,
                                msgs: val
                            }
                        }), function(x) {
                            return -new Date(x.ts)
                        })
                        // console.log(rh_data);
                        // $("#coll_task_revise").html(self.template_revise({
                        //     revise_history: rh_data
                        // }))
                    rendered = self.template_revise({
                        revise_history: rh_data
                    })
                } else if (self.view_mode == 'attachment') {
                    rendered = self.template_attachment(render_data)
                } else if (self.view_mode == 'score') {
                    rendered = self.template_score(render_data)
                };
                $("#colltask_detail-content").html(rendered);
                $("#colltask_detail-content").trigger('create');
                //确定权限
                var login_people = $("#login_people").val();
                var rights = [0, 0, 0, 0];
                if (login_people == self.model.attributes.creator._id) { //创建人
                    rights = [1, 1, 1, 1];
                } else if (login_people == self.model.attributes.th._id) { //负责人
                    rights = [1, 1, 1, 1];
                } else if (self.test_in('_id', login_people, self.model.attributes.tms)) { //参与人
                    rights = [1, 0, 0, 1];
                } else if (self.test_in('_id', login_people, self.model.attributes.ntms)) { //观察员
                    rights = [0, 0, 0, 0];
                };
                var btns = ['#btn-ct-add_sub_task', '#btn-colltask_detail-edit', '#btn-colltask_detail-remove', '#btn-colltask_detail-complete'];
                for (var i = 0; i < rights.length; i++) {
                    if (rights[i] == 0) {
                        $(btns[i]).attr('disabled', true)
                    } else {
                        $(btns[i]).removeAttr('disabled')
                    };
                };
                // 设定完成按钮的文字
                if (self.model.get('isfinished')) {
                    $("#btn-colltask_detail-complete").html('打开');
                } else {
                    $("#btn-colltask_detail-complete").html('完成');
                };
                // 设定人员信息卡的返回地址
                localStorage.setItem('contact_detail_back_url', '#colltask_detail/' + self.model.get('_id'));
                return this;

            },
            bind_event: function() {
                var self = this;
                $("#colltask_detail-content")
                    .on('change', 'textarea', function(event) {
                        event.preventDefault();
                        var $this = $(this);
                        var field = $this.data('field');
                        var value = $this.val();
                        if (field == 'comments') { //增加一条新的留言
                            var new_comment = {
                                comment: value,
                                people_name: $("#login_people_name").val(),
                                position_name: $("#login_position_name").val(),
                                avatar: $("#login_avatar").val(),
                                creator: $("#login_people").val(),
                                createDate: new Date()
                            };
                            self.model.attributes.comments.push(new_comment);
                            self.model.attributes.comments = _.sortBy(self.model.attributes.comments, function(x) {
                                return -(new Date(x.createDate));
                            })
                            self.model.save().done(function() {
                                self.render();
                            })
                        };

                    })
                    .on('click', '#btn-ct-add_sub_task', function(event) {
                        event.preventDefault();
                        var url = '#colltask_edit/add/' + self.model.get('_id');
                        window.location.href = url;
                    })
                    .on('click', '#btn-ct-add_comment', function(event) {
                        event.preventDefault();
                        localStorage.removeItem('comment_model_back'); //先把返回值清掉
                        localStorage.setItem('comment_model', JSON.stringify({
                            model: self.model,
                            field: 'comments',
                            back_url: '#colltask_detail/' + self.model.get('_id'),
                        }));
                        localStorage.setItem('comment_new', '1'); //通知对方新开一个
                        var url = '#comment_add';
                        window.location.href = url;
                    })
                    .on('click', 'img', function(event) {
                        event.preventDefault();
                        // var img_view = '<div class="img_view" style="background-image:url('+this.src+')"></div>';
                        var img_view = '<img src="' + this.src + '">';
                        // img_view += '<a href="'+this.src.replace('get','download')+'" target="_blank">保存到本地</a>';
                        $("#fullscreen-overlay").html(img_view).fadeIn('fast');
                    });
                $("#colltask_detail-footer")
                    .on('click', '#btn-colltask_detail-remove', function(event) {
                        event.preventDefault();
                        if (confirm('确认删除本任务吗？')) { //确认是否删除
                            var coll = self.model.collection;
                            coll.remove(self.model);
                            coll.trigger('sync');

                            self.model.destroy().done(function() {
                                alert('任务删除成功');
                                window.location.href = '#colltask';

                            })
                        };
                    })
                    .on('click', '#btn-colltask_detail-complete', function(event) {
                        event.preventDefault();
                        var x = self.model.get('isfinished');
                        self.model.set('isfinished', !x);

                        self.model.save().done(function() {
                            if (x) {
                                alert('任务已重新打开');
                                self.render();
                            } else {
                                alert('任务已标记为完成');
                                window.location.href = '#colltask';
                            };

                        })
                    })
                    .on('click', '#btn-colltask_detail-edit', function(event) {
                        event.preventDefault();
                        var url = '#colltask_edit/' + self.model.get('_id');
                        window.location.href = url;
                    })
                $("#colltask_detail-left-panel")
                    .on('click', '#btn-colltask_detail-change_view', function(event) {
                        event.preventDefault();
                        var $this = $(this)
                        self.view_mode = $this.data('view_mode');
                        self.render();
                        $("#colltask_detail-left-panel").panel('close');
                    })
                    .on('click', '#btn-colltask_detail-sync_cal', function(event) { //发送到我的日历
                        event.preventDefault();
                        if (self.model && confirm('确认同步到我的工作日历吗？')) {
                            $.mobile.loading("show");
                            var login_people = $("#login_people").val();
                            var post_data = {
                                origin_oid: self.model.get('_id'),
                                origin_cat: 'coll_task',
                                people: login_people, //只删除当前登录用户的
                            };
                            $.post('/admin/pm/work_plan/remove_by_origin', post_data, function(data, textStatus, xhr) {
                                var new_event = {
                                    creator: login_people,
                                    people: login_people,
                                    title: self.model.get('task_name'),
                                    allDay: true,
                                    start: moment(self.model.get('start')).format('YYYY-MM-DD'),
                                    end: moment(self.model.get('end')).format('YYYY-MM-DD'),
                                    tags: '协作任务',
                                    // url: '/admin/pm/assessment_instance/wip/bbform?ai_id=' + ai_id,
                                    origin_oid: self.model.get('_id'),
                                    origin_cat: 'coll_task',
                                    editable: false,
                                    startEditable: false,
                                    durationEditable: false,
                                    origin: '1',
                                    is_complete: self.model.get('isfinished'),
                                };
                                new_event.description = self.model.get('task_descrpt');
                                new TaskModel(new_event).save().done(function() {
                                    alert('同步到日历项成功');
                                    $.mobile.loading("hide");
                                });
                            })
                        };
                        $("#colltask_detail-left-panel").panel('close');
                    });
                $("#colltask_detail")
                    .on('swiperight', function(event) { //向右滑动，打开左边的面板
                        event.preventDefault();
                        $("#colltask_detail-left-panel").panel('open');
                        // window.location.href = '#colltask'
                    })
            },
            test_in: function(key, val, coll) {
                var flag = false;
                for (var i = 0; i < coll.length; i++) {
                    flag = coll[i][key] == val;
                    if (flag) {
                        break;
                    }
                };
                return flag;
            }
        });

        // Returns the View class
        return CollTaskDetailView;

    });