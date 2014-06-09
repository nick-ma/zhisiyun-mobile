// Task Edit View
// =================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "moment", "models/TaskModel", "jqmcal", "formatdate"],
    function($, _, Backbone, Handlebars, moment, TaskModel) {

        // Extends Backbone.View
        var MyTeamTaskEditView = Backbone.View.extend({
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
                var $form = $("#myteam_task-edit");
                this.$form = $form;
                $form.find("#myteam_task-title").val(self.model.get('title'));
                $form.find("#myteam_task-location").val(self.model.get('location'));
                $form.find("#myteam_task-description").val(self.model.get('description'));
                $form.find("#myteam_task-comments").val(self.model.get('comments'));
                $form.find("#myteam_task-allday").val(self.model.get('allDay').toString()).trigger('change');
                if (self.model.get('allDay')) { //对于全天类型的任务，不显示时间字段部分。
                    $form.find("#myteam_task-start").attr('type', 'date').val(moment(self.model.get('start')).format('YYYY-MM-DD'));
                    $form.find("#myteam_task-end").attr('type', 'date').val(moment(self.model.get('end')).format('YYYY-MM-DD'));
                } else {
                    $form.find("#myteam_task-start").val(moment(self.model.get('start')).format('YYYY-MM-DDTHH:mm'));
                    $form.find("#myteam_task-end").val(moment(self.model.get('end')).format('YYYY-MM-DDTHH:mm'));
                }
                $form.find("#myteam_task-is_complete").val(self.model.get('is_complete').toString()).trigger('change');
                if (self.model.isNew()) {
                    $("#btn-back-from-myteam_task-edit").attr('href', '#myteam_detail/' + self.model.get('people') + '/calendar');
                } else {
                    $("#btn-back-from-myteam_task-edit").attr('href', '#myteam_detail/' + self.model.get('people') + '/calendar/' + self.model.get('_id'));
                }
                var backurl = '#myteam_detail/' + (_.isObject(self.model.get('people')) ? self.model.get('people')._id : self.model.get('people')) + '/calendar';
                if (self.model.get('_id')) {
                    backurl += '/' + self.model.get('_id');
                };
                $("#btn-myteam_task-edit-back").attr('href', backurl);
                // console.log(self.model);
                // Maintains chainability
                return this;

            },

            bind_events: function() {
                var self = this;

                self.$el
                    .on('click', '#btn-myteam_task-save', function(event) {
                        event.preventDefault();
                        var people = self.model.get('people')
                            //check valid
                        if (self.model.isValid()) {
                            self.model.save().done(function() {
                                // console.log('message: save task')
                                self.model.fetch().done(function() {
                                    localStorage.setItem('task_' + people, LZString.compressToUTF16(JSON.stringify(self.model.collection)))
                                    $.mobile.changePage("#myteam_detail-task", {
                                        reverse: false,
                                        changeHash: false,
                                    });
                                })
                            });
                        } else { //显示错误提示信息
                            alert(self.model.validationError);

                        };

                    })
                    .on('click', '#btn-myteam_task-remove', function(event) {
                        event.preventDefault();
                        var people = self.model.get('people')
                        var col = self.model.collection;
                        self.model.destroy().done(function() {
                            // col.url = '/admin/pm/work_plan/bb4m?people=' + people;
                            col.fetch().done(function() {
                                localStorage.setItem('task_' + people, LZString.compressToUTF16(JSON.stringify(col)))
                            }); //删除后重新获取collection
                            $.mobile.changePage("#myteam_detail-task", {
                                reverse: false,
                                changeHash: false,
                            });
                        });
                    })
                    .on('change', '#myteam_task-allday', function(event) {
                        var value = $(this).val();
                        if (value === 'true') {
                            self.$form.find("#myteam_task-start").attr('type', 'date').val(moment(self.model.get('start')).format('YYYY-MM-DD'));
                            self.$form.find("#myteam_task-end").attr('type', 'date').val(moment(self.model.get('end')).format('YYYY-MM-DD'));
                        } else {
                            self.$form.find("#myteam_task-start").attr('type', 'datetime-local').val(moment(self.model.get('start')).format('YYYY-MM-DDTHH:mm'));
                            self.$form.find("#myteam_task-end").attr('type', 'datetime-local').val(moment(self.model.get('end')).format('YYYY-MM-DDTHH:mm'));
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
        return MyTeamTaskEditView;

    });