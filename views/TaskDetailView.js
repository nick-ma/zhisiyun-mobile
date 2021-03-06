// Task View
// =============

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "moment", "models/TaskModel", "jqmcal", "formatdate"], function($, _, Backbone, Handlebars, moment, TaskModel) {


    Handlebars.registerHelper('wp_stype', function(type, origin_oid) {

        if (type == 'NOTICE') {
            return '#im_view_R/' + origin_oid;
        } else if (type == 'REPORT') {
            return '#wrdetail/' + origin_oid;
        } else {
            return '#colltask_detail/' + origin_oid;
        }

    });



    // Extends Backbone.View
    var TaskDetailView = Backbone.View.extend({
        // The View Constructor
        initialize: function() {
            this.template = Handlebars.compile($("#hbtmp_task_detail_view").html());
            this.bind_events();
            // The render method is called when Task Models are added to the Collection
            // this.model.on("sync", this.render, this);

        },

        // Renders all of the Task models on the UI
        render: function() {
            var self = this;
            $("#btn-task-edit").attr('href', "#task_edit/" + self.model.get('_id'));

            $.get('/admin/checkin/list/event/' + self.model.get('_id'), function(data) {
                var render_data = self.model.toJSON();
                if (data.code == 'OK') {
                    render_data.checkin_records = data.data;
                };
                $("#task_detail-content").html(self.template(render_data));
                $("#task_detail-content").trigger('create');
            })
            // Maintains chainability
            return this;
        },

        bind_events: function() {
            var self = this;
            self.$el
                .on('click', '#btn-task-markcomplete', function(event) {
                    event.preventDefault();
                    if (confirm('确认完成任务吗？')) {
                        self.model.set('is_complete', true);
                        self.model.save().done(function() {
                            $("#task_detail_msg").popup('open', { //弹出打分的对话框
                                transition: 'slidedown'
                            });
                        });
                    };

                })
                .on('click', '#btn-task-rate', function(event) {
                    event.preventDefault();
                    var rank = $("#task_rank").val();
                    self.model.set('rank', rank);
                    self.model.save().done(function() {
                        window.location.href = "#task";
                    });
                })
                .on('click', '#btn-task-checkin', function(event) {
                    event.preventDefault();
                    var now = new Date();
                    var end = new Date(self.model.get('end'));
                    if (self.model.get('is_complete')) {
                        alert('任务已完成，不能签到。');
                        return;
                    };
                    if (now.getTime() > end.getTime()) {
                        alert('已经超过任务截止时间，不能签到。');
                        return;
                    };
                    var syscmd_url = 'cmd://app/checkin/event/' + self.model.get('_id');
                    window.location.href = syscmd_url; //向app外壳发送消息，等待上钩
                });
        }


    });

    // Returns the View class
    return TaskDetailView;

});