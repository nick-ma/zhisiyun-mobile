// CollTask Detail View
// =================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "moment",
        "../../models/TaskModel"
    ],
    function($, _, Backbone, Handlebars, moment,
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
                this.template_checkin = Handlebars.compile($("#hbtmp_coll_task_detail_view_checkin").html());
                // The render method is called when CollTask Models are added to the Collection
                // this.collection.on("sync", this.render, this);
                this.view_mode = 'basic'; //初始化为基本信息界面
                this.show_p_task = true;
                this.show_sub_tasks = true;
                this.show_checkin_records = true;
                this.show_comments = true;
                this.bind_event();
            },
            pre_render: function() { //预先render
                $("#colltask_detail-content").html('<div>正在加载数据...</div>');
                $("#colltask_detail-content").trigger('create');
            },
            // Renders all of the CollTask models on the UI
            render: function() {

                var self = this;
                self.show_p_task = true;
                self.show_sub_tasks = true;
                self.show_checkin_records = true;
                self.show_comments = true;
                // 判断是否更换了任务
                if (self.pre_model_id != self.model.get('_id')) {
                    self.view_mode = 'basic';
                    self.pre_model_id = self.model.get('_id');
                };

                if (!self.colltask_detail_back_url) {
                    self.colltask_detail_back_url = localStorage.getItem('colltask_detail_back_url') || null;
                    localStorage.removeItem('colltask_detail_back_url'); //用完删掉 
                }
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
                //设定列表的返回路径，自己或下属
                $("#btn-colltask_detail-list").attr('href', self.colltask_detail_back_url);
                //设定返回按钮的地址
                // if (!self.colltask_detail_back_url) {
                if (self.model.get('p_task')) { //有父级任务，返回
                    var p_task_detail = _.find(self.model.collection.models, function(x) {
                        return x.get('_id') == self.model.get('p_task')
                    })
                    render_data.p_task_detail = (p_task_detail) ? p_task_detail.toJSON() : null;
                    // self.colltask_detail_back_url = '#colltask_detail/' + self.model.get('p_task')
                }
                // else {
                //     self.colltask_detail_back_url = '#colltask';
                // };
                // };
                $("#btn-colltask_detail-back").attr('href', self.colltask_detail_back_url);

                var rendered = '';
                if (self.view_mode == 'basic') {
                    $.get('/admin/checkin/list/coll_task/' + self.model.get('_id'), function(data) {
                        if (data.code == 'OK') {
                            render_data.checkin_records = data.data;
                            rendered = self.template_basic(render_data)
                            $("#colltask_detail-content").html(rendered);
                            $("#colltask_detail-content").trigger('create');
                        };
                    })
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
                } else if (self.view_mode == 'checkin') { //获取签到信息列表
                    $.get('/admin/checkin/list/coll_task/' + self.model.get('_id'), function(data) {
                        if (data.code == 'OK') {
                            $("#colltask_detail-content").html(self.template_checkin({
                                checkin_records: data.data
                            }));
                            $("#colltask_detail-content").trigger('create');
                        };
                    })
                };
                $("#colltask_detail-content").html(rendered);
                $("#colltask_detail-content").trigger('create');
                if ($("#login_people").val() == self.model.attributes.th._id) {
                    $("#colltask_detail-footer").show();
                } else {
                    $("#colltask_detail-footer").hide();
                }

                //确定权限
                var login_people = $("#login_people").val();
                var rights = [0, 0, 0, 0];
                if (login_people == self.model.attributes.creator._id) { //创建人
                    var tmp_rights = [0, 1, 0, 0];
                    for (var i = 0; i < rights.length; i++) {
                        rights[i] = rights[i] || tmp_rights[i];
                    };
                }
                if (login_people == self.model.attributes.th._id) { //负责人
                    var tmp_rights = [1, 1, 1, 1];
                    for (var i = 0; i < rights.length; i++) {
                        rights[i] = rights[i] || tmp_rights[i];
                    };
                }
                if (self.test_in('_id', login_people, self.model.attributes.tms)) { //参与人
                    var tmp_rights = [1, 0, 0, 0];
                    for (var i = 0; i < rights.length; i++) {
                        rights[i] = rights[i] || tmp_rights[i];
                    };
                }
                if (self.test_in('_id', login_people, self.model.attributes.ntms)) { //观察员
                    var tmp_rights = [0, 0, 0, 0];
                    for (var i = 0; i < rights.length; i++) {
                        rights[i] = rights[i] || tmp_rights[i];
                    };
                };
                var state_rights = [0, 0, 0, 0];
                if (self.model.get('isfinished')) {
                    state_rights = [0, 0, 0, 1];
                } else {
                    state_rights = [1, 1, 1, 1];
                };
                var btns = ['#btn-ct-add_sub_task', '#btn-colltask_detail-edit', '#btn-colltask_detail-remove', '#btn-colltask_detail-complete'];
                for (var i = 0; i < rights.length; i++) {
                    var flag = rights[i] && state_rights[i];
                    if (i == 2) { //应用锁定删除
                        flag &= !self.model.get('lock_remove');
                    };
                    if (flag) {
                        $(btns[i]).removeAttr('disabled')
                    } else {
                        $(btns[i]).attr('disabled', true)
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

                //hold
                self.hold_back_url();

                //
                // if (self.show_checkin_records) {
                //     $("#colltask_detail-content li.checkin_records").show(200);
                // } else {
                //     $("#colltask_detail-content li.checkin_records").hide(200)
                // };
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
                        } else if (field == 'final_judgement') {
                            $.mobile.loading("show");
                            self.model.attributes.final_judgement = value;
                            self.model.save().done(function() {
                                self.render();
                                $.mobile.loading("hide");
                            })
                        };

                    })
                    .on('change', 'input, textarea', function(event) { //打分和评语
                        event.preventDefault();
                        var $this = $(this);
                        var field = $this.data('field');
                        var index = $this.data('index');
                        var value = $this.val();
                        var ff = (field) ? field.split('.') : [];
                        if (ff.length == 2) { //打分的输入框
                            $.mobile.loading("show");
                            if (index >= 0) {
                                self.model.attributes[ff[0]][ff[1]][index] = value;
                            } else {
                                self.model.attributes[ff[0]][ff[1]] = value;
                            };
                            self.model.save().done(function() {
                                self.model.fetch().done(function() {
                                    self.render();
                                    $.mobile.loading("hide");
                                })
                            })
                        };

                    })
                    .on('click', '#btn-ct-add_sub_task', function(event) {
                        event.preventDefault();
                        event.stopPropagation();
                        var url = '#colltask_edit/add/' + self.model.get('_id');
                        window.location.href = url;
                    })
                    .on('click', '#btn-ct-add_comment', function(event) {
                        event.preventDefault();
                        event.stopPropagation();
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
                        if ($("#req_ua").val() == 'normal') {
                            var img_view = '<img src="' + this.src + '">';
                            $("#fullscreen-overlay").html(img_view).fadeIn('fast');
                        } else { //让webview的钩子把它勾住
                            window.location.href = this.src;
                        };
                        // img_view += '<a href="'+this.src.replace('get','download')+'" target="_blank">保存到本地</a>';
                    })
                    .on('click', '#btn-ct-checkin', function(event) {
                        event.preventDefault();
                        event.stopPropagation();
                        var now = new Date();
                        var end = new Date(self.model.get('end'));
                        if (self.model.get('allday')) { //如果是全天任务，则取结束日期的最后时刻。
                            end = moment(end).endOf('day').toDate();
                        }
                        if (self.model.get('isfinished')) {
                            alert('任务已完成，不能签到。');
                            return;
                        };
                        if (now.getTime() > end.getTime()) {
                            alert('已经超过任务截止时间，不能签到。');
                            return;
                        };
                        var syscmd_url = 'cmd://app/checkin/coll_task/' + self.model.get('_id');
                        window.location.href = syscmd_url; //向app外壳发送消息，等待上钩

                    })
                    .on('click', '.toggle_p_task', function(event) {
                        event.preventDefault();
                        if (self.show_p_task) {

                            $("#colltask_detail-content li.p_task").fadeOut(200);
                            self.show_p_task = false;
                        } else {
                            $("#colltask_detail-content li.p_task").fadeIn(200)
                            self.show_p_task = true;
                        };
                    })
                    .on('click', '.toggle_sub_tasks', function(event) {
                        event.preventDefault();
                        if (self.show_sub_tasks) {

                            $("#colltask_detail-content li.sub_tasks").fadeOut(200);
                            self.show_sub_tasks = false;
                        } else {
                            $("#colltask_detail-content li.sub_tasks").fadeIn(200)
                            self.show_sub_tasks = true;
                        };
                    })
                    .on('click', '.toggle_checkin_records', function(event) {
                        event.preventDefault();
                        if (self.show_checkin_records) {

                            $("#colltask_detail-content li.checkin_records").fadeOut(200);
                            self.show_checkin_records = false;
                        } else {
                            $("#colltask_detail-content li.checkin_records").fadeIn(200)
                            self.show_checkin_records = true;
                        };
                    })
                    .on('click', '.toggle_comments', function(event) {
                        event.preventDefault();
                        if (self.show_comments) {

                            $("#colltask_detail-content li.comments").fadeOut(200);
                            self.show_comments = false;
                        } else {
                            $("#colltask_detail-content li.comments").fadeIn(200)
                            self.show_comments = true;
                        };
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
                        if (!x) { //准备关闭任务，提示打分
                            var th_score = prompt('请为本任务评分', 90);
                            if (th_score) {
                                var th_score_comment = prompt('您为本任务打了' + th_score + '分！\n请对本任务做出评价，以便让更多的人了解你。', '')
                                self.model.attributes.scores.th = th_score;
                                self.model.attributes.scores_comment.th = th_score_comment || '无';
                                self.model.set('isfinished', true);
                                self.model.save().done(function() {
                                    self.model.fetch().done(function() {
                                        alert('任务已完成');
                                        window.location.href = '#colltask';
                                    })
                                })
                            } else {
                                alert('请评分')
                            };
                        } else {
                            if (confirm('即将重新打开本任务。\n警告：一旦重新打开任务，之前所有的评分、评语、最终评定内容以及技能得分都将清空！')) {
                                self.model.set('isfinished', false);
                                self.model.set('score', 0);
                                self.model.attributes.scores.th = 0;
                                for (var i = 0; i < self.model.attributes.scores.tms.length; i++) {
                                    self.model.attributes.scores.tms[i] = 0;
                                };
                                for (var i = 0; i < self.model.attributes.scores.ntms.length; i++) {
                                    self.model.attributes.scores.ntms[i] = 0;
                                };
                                self.model.attributes.scores_comment.th = '';
                                for (var i = 0; i < self.model.attributes.scores_comment.tms.length; i++) {
                                    self.model.attributes.scores_comment.tms[i] = '';
                                };
                                for (var i = 0; i < self.model.attributes.scores_comment.ntms.length; i++) {
                                    self.model.attributes.scores_comment.ntms[i] = '';
                                };
                                self.model.attributes.final_judgement = ''; //清空评定内容。
                                self.model.save().done(function() {

                                    alert('任务已重新打开');
                                    self.render();

                                })
                            };

                        };

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
                                    allDay: self.model.get('allday'),
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
                                if (!new_event.allDay) {
                                    new_event.start = moment(self.model.get('start')).format('YYYY-MM-DD HH:mm');
                                    new_event.end = moment(self.model.get('end')).format('YYYY-MM-DD HH:mm');
                                };
                                new_event.description = self.model.get('task_descrpt');
                                new TaskModel(new_event).save().done(function() {
                                    alert('同步到日历项成功');
                                    $.mobile.loading("hide");
                                });
                            })
                        };
                        $("#colltask_detail-left-panel").panel('close');
                    })
                    .on('click', '#btn-colltask_detail-start_groupchat', function(event) { //发起讨论
                        event.preventDefault();
                        $.mobile.loading("show");
                        $.get('/admin/pm/coll_task/groupchat/' + self.model.get('_id'), function(data) {
                            if (data) {
                                var groupid = data.groupid;
                                var syscmd_url = 'im://groupchat/' + groupid;
                                // console.log(syscmd_url);
                                window.location.href = syscmd_url; //向app外壳发送消息，等待上钩
                            };

                            $.mobile.loading("hide");
                        })
                    });

                $("#colltask_detail")
                    .on('click', '.open-left-panel', function(event) {
                        event.preventDefault();
                        $("#colltask_detail-left-panel").panel("open");
                    })
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
            },
            hold_back_url: function() {
                if (this.colltask_detail_back_url.substr(0, 9) != '#colltask') {
                    localStorage.setItem('colltask_detail_back_url', this.colltask_detail_back_url);
                };
            }
        });

        // Returns the View class
        return CollTaskDetailView;

    });