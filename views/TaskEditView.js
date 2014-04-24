// Task Edit View
// =================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "moment", "models/TaskModel", "jqmcal", "formatdate"], function($, _, Backbone, Handlebars, moment, TaskModel) {

    // Extends Backbone.View
    var TaskEditView = Backbone.View.extend({
        // The View Constructor
        initialize: function() {
            // this.template = Handlebars.compile($("script#taskItems").html());

            // The render method is called when Task Models are added to the Collection
            // this.model.on("sync", this.render, this);
            this.bind_events();

        },

        // Renders all of the Task models on the UI
        render: function() {
            var self = this;
            var $form = $("#task-edit");
            this.$form = $form;
            $form.find("#task-title").val(self.model.get('title'));
            $form.find("#task-location").val(self.model.get('location'));
            $form.find("#task-description").val(self.model.get('description'));
            $form.find("#task-comments").val(self.model.get('comments'));
            $form.find("#task-allday").val(self.model.get('allDay').toString()).trigger('change');
            if (self.model.get('allDay')) { //对于全天类型的任务，不显示时间字段部分。
                $form.find("#task-start").attr('type', 'date').val(moment(self.model.get('start')).format('YYYY-MM-DD'));
                $form.find("#task-end").attr('type', 'date').val(moment(self.model.get('end')).format('YYYY-MM-DD'));
            } else {
                $form.find("#task-start").val(moment(self.model.get('start')).format('YYYY-MM-DDTHH:mm'));
                $form.find("#task-end").val(moment(self.model.get('end')).format('YYYY-MM-DDTHH:mm'));
            }
            $form.find("#task-is_complete").val(self.model.get('is_complete').toString()).trigger('change');
            if (self.model.isNew()) {
                $("#btn-back-from-task-edit").attr('href', '#task');
            } else {
                $("#btn-back-from-task-edit").attr('href', '#task/' + self.model.get('_id'));
            }
            // Maintains chainability
            return this;

        },

        bind_events: function() {
            var self = this;

            self.$el
                .on('click', '#btn-task-save', function(event) {
                    event.preventDefault();
                    //check valid
                    if (self.model.isValid()) {
                        self.model.save().done(function() {
                            // console.log('message: save task')
                            var login_people = $("#login_people").val();
                            localStorage.setItem('task_' + login_people, JSON.stringify(self.model.collection))
                            $.mobile.changePage("#task", {
                                reverse: false,
                                changeHash: false,
                                transition: "flip",
                            });
                        });
                    } else { //显示错误提示信息
                        if (!$("#task_edit_msg").hasClass('text-danger')) {
                            $("#task_edit_msg").addClass('text-danger');
                        };
                        $("#task_edit_msg").html(self.model.validationError)
                            .popup('open', {
                                transition: 'slidedown'
                            });
                    };

                })
                .on('click', '#btn-task-remove', function(event) {
                    event.preventDefault();
                    var col = self.model.collection;
                    self.model.destroy().done(function() {
                        col.fetch().done(function() {
                            var login_people = $("#login_people").val();
                            localStorage.setItem('task_' + login_people, JSON.stringify(col))
                        }); //删除后重新获取collection
                        $.mobile.changePage("#task", {
                            reverse: false,
                            changeHash: false,
                            transition: "flip",
                        });
                    });
                })
                .on('change', '#task-allday', function(event) {
                    var value = $(this).val();
                    if (value === 'true') {
                        self.$form.find("#task-start").attr('type', 'date').val(moment(self.model.get('start')).format('YYYY-MM-DD'));
                        self.$form.find("#task-end").attr('type', 'date').val(moment(self.model.get('end')).format('YYYY-MM-DD'));
                    } else {
                        self.$form.find("#task-start").attr('type', 'datetime-local').val(moment(self.model.get('start')).format('YYYY-MM-DDTHH:mm'));
                        self.$form.find("#task-end").attr('type', 'datetime-local').val(moment(self.model.get('end')).format('YYYY-MM-DDTHH:mm'));
                    }
                })
                .on('change', 'input, textarea, select', function(event) {
                    var $this = $(this);
                    var field = $this.data('field');
                    var value = $this.val();
                    if (field === 'start' || field === 'end') {
                        value = value.replace('T', ' '); //把T换掉，保存UCT的时间
                    }
                    if (field === 'is_complete' || field === 'allDay') {
                        value = (value === 'true') ? true : false;
                    }
                    self.model.set(field, value);
                });

        }


    });

    // Returns the View class
    return TaskEditView;

});