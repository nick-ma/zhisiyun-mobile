// CollTask Detail View
// =================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars"],
    function($, _, Backbone, Handlebars) {

        // Extends Backbone.View
        var CollTaskDetailView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                this.template = Handlebars.compile($("#hbtmp_coll_task_detail_view").html());
                // The render method is called when CollTask Models are added to the Collection
                // this.collection.on("sync", this.render, this);
                this.bind_event();
            },

            // Renders all of the CollTask models on the UI
            render: function() {

                var self = this;


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
                    $("#btn-colltask_detail-back").attr('href', '#colltask_detail/' + self.model.get('p_task'));
                } else {
                    $("#btn-colltask_detail-back").attr('href', '#colltask');
                };
                $("#colltask_detail-content").html(self.template(render_data));
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
                    });

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