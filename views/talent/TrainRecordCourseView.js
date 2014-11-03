// Contact Detail View
// ===================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars"],
    function($, _, Backbone, Handlebars) {

        // Extends Backbone.View
        var TrainRecordListView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                this.template = Handlebars.compile($("#train_record_course_operation_view").html());
                // The render method is called when People Models are added to the Collection
                this.loading_template = Handlebars.compile($("#loading_template_view").html());

                // this.collection.on("sync", this.render, this);
                this.bind_event();
            },
            pre_render: function() {
                var self = this;
                $("#talent_train_record_course-content").html(self.loading_template({
                    info_msg: '数据加载中...请稍候'
                }));
                $("#talent_train_record_course-content").trigger('create');
                return this;
            },
            // Renders all of the People models on the UI
            render: function() {

                var self = this;
                var obj = {
                    type: self.type,
                };
                obj = _.extend(obj, self.data);
                $("#talent_train_record_course_title").html("培训记录")
                $("#talent_train_record_course-content").html(self.template(obj));
                $("#talent_train_record_course-content").trigger('create');
                return this;

            },

            bind_event: function() {
                var self = this;
                $("#talent_train_record_course").on('click', '#btn-add_course_abstract', function(event) { //课程－课程自评
                    event.preventDefault();

                    var record_id = $(this).data("up_id") || self.record_id;
                    var course_abstract = $("#talent_train_record_course #course_abstract").val();
                    if (course_abstract) {
                        var obj = {
                            people: self.people,
                            message: course_abstract,
                            post_time: new Date(),
                            avatar: self.login_avatar,
                            people_name: self.login_people_name
                        }
                        self.collection.models[0].attributes.course_abstract.push(obj);
                        self.collection.models[0].save(self.collection.models[0].attributes, {
                            success: function(model, response, options) {
                                self.collection.url = '/admin/course/train_record/course/' + record_id;
                                self.collection.fetch().done(function() {
                                    $.get('/admin/course/train_record/trainging_record_bb_fetch_4m/' + record_id, function(data) {
                                        if (data) {
                                            self.data = data;
                                            self.render();
                                        }

                                    })
                                })

                            },
                            error: function(model, xhr, options) {}
                        });
                    } else {
                        alert('请输入课程心得数据!')
                    }
                }).on('click', '#btn-add_course_comment', function(event) { //课程－课程交流
                    event.preventDefault();
                    var record_id = $(this).data("up_id") || self.record_id;

                    var course_comments = $("#talent_train_record_course #course_comments").val();
                    if (course_comments) {
                        var obj = {
                            people: self.people,
                            message: course_comments,
                            post_time: new Date(),
                            avatar: self.login_avatar,
                            people_name: self.login_people_name
                        }
                        self.collection.models[0].attributes.comments.push(obj);
                        self.collection.models[0].save(self.collection.models[0].attributes, {
                            success: function(model, response, options) {
                                self.collection.url = '/admin/course/train_record/course/' + record_id;
                                self.collection.fetch().done(function() {
                                    $.get('/admin/course/train_record/trainging_record_bb_fetch_4m/' + record_id, function(data) {
                                        if (data) {
                                            self.data = data;
                                            self.render();
                                        }

                                    })
                                })
                            },
                            error: function(model, xhr, options) {}
                        });
                    } else {
                        alert('请输入交流数据!')
                    }
                }).on('click', '#btn-add_mentor_comment', function(event) { //课程－导师评估
                    event.preventDefault();
                    var record_id = $(this).data("up_id") || self.record_id;

                    var mentor_comment = $("#talent_train_record_course #mentor_comment").val();
                    // var message = $("#talent_develope_detail_operation_list #message").val();
                    if (mentor_comment) {
                        var obj = {
                            people: self.people,
                            message: mentor_comment,
                            post_time: new Date(),
                            avatar: self.login_avatar,
                            people_name: self.login_people_name
                        }
                        self.collection.models[0].attributes.mentor_comment.push(obj);
                        self.collection.models[0].save(self.collection.models[0].attributes, {
                            success: function(model, response, options) {
                                self.collection.url = '/admin/course/train_record/course/' + record_id;
                                self.collection.fetch().done(function() {
                                    $.get('/admin/course/train_record/trainging_record_bb_fetch_4m/' + record_id, function(data) {
                                        if (data) {
                                            self.data = data;
                                            self.render();
                                        }

                                    })
                                })
                            },
                            error: function(model, xhr, options) {}
                        });
                    } else {
                        alert('请输入评语!')
                    }
                }).on('click', '.talent_train_record', function(event) {
                    event.preventDefault();
                    window.history.go(-1);
                })
            }

        });

        // Returns the View class
        return TrainRecordListView;

    });