// Contact Detail View
// ===================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars"],
    function($, _, Backbone, Handlebars) {

        // Extends Backbone.View
        var DevelopePlanDetailOperationListView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                //导师与课程
                this.template_mentor = Handlebars.compile($("#hbtmp_talent_develope_detail_list_operation_mentor_view").html());
                //沟通记录
                this.template_comment = Handlebars.compile($("#hbtmp_talent_develope_detail_list_operation_comment_view").html());
                //考核评估
                this.template_check = Handlebars.compile($("#hbtmp_talent_develope_detail_list_operation_check_view").html());
                //相关附件
                this.template_attachment = Handlebars.compile($("#hbtmp_talent_develope_detail_list_operation_attachment_view").html());
                // The render method is called when People Models are added to the Collection
                this.loading_template = Handlebars.compile($("#loading_template_view").html());

                // this.collection.on("sync", this.render, this);
                this.bind_event();
            },
            pre_render: function() {
                var self = this;
                $("#talent_develope_detail_operation-content").html(self.loading_template({
                    info_msg: '数据加载中...请稍候'
                }));
                $("#talent_develope_detail_operation-content").trigger('create');
                return this;
            },
            // Renders all of the People models on the UI
            render: function() {

                var self = this;
                var talent_data = _.map(self.collection.models, function(x) {
                    var find_people = _.find(self.c_people.models, function(temp) {
                        return temp.attributes._id == String(x.attributes.people)
                    })
                    if (find_people) {
                        x.attributes.people_data = find_people.attributes;

                    }
                    return x.toJSON();
                })
                var divide_data = _.find(talent_data[0].plan_divide, function(p) {
                    return p._id == String(self.divide_id)
                })
                var people_data = _.map(self.c_people.models, function(x) {
                    return x.toJSON()
                })
                var filter_people = _.find(people_data, function(temp) {
                    return temp._id == String(self.people)
                })
                self.filter_people = filter_people;
                var obj = {
                    talent_data: talent_data[0],
                    divide_id: self.divide_id,
                    divide_data: divide_data,
                    people_data: people_data,
                    login_people: $("#login_people").val(),
                    file_data: self.file
                }
                obj.is_self = ($("#login_people").val() == talent_data[0].people);
                if (self.view_mode == 'comment') {
                    $("#talent_develope_detail_operation_title").html("沟通交流")
                    $("#talent_develope_detail_operation-content").html(self.template_comment(obj));

                } else if (self.view_mode == 'check') {
                    $("#talent_develope_detail_operation_title").html("考核评估")

                    $("#talent_develope_detail_operation-content").html(self.template_check(obj));

                } else if (self.view_mode == 'attachment') {
                    $("#talent_develope_detail_operation_title").html("相关附件")
                    //附件数据
                    if (localStorage.getItem('upload_model_back')) { //有从上传页面发回来的数据
                        var item = JSON.parse(localStorage.getItem('upload_model_back')).model;
                        var attachments = item.attachments;
                        localStorage.removeItem('upload_model_back'); //用完删掉
                        var plan_id = item.plan_id;
                        _.each(attachments, function(temp) {
                            var find_attachment = _.find(obj.divide_data.attachments, function(x) {
                                return x.file == String(temp)
                            })
                            if (!find_attachment) {
                                obj.divide_data.attachments.push({
                                    file: temp,
                                    people: self.people
                                })
                            }
                        })
                        divide_data.attachments = obj.divide_data.attachments;
                        self.collection.models[0].save(self.collection.models[0].attributes, {
                            success: function(model, response, options) {
                                $.get('/admin/pm/talent_develope/file', function(data) {
                                    if (data) {
                                        obj.file_data = data.data;
                                        $("#talent_develope_detail_operation-content").html(self.template_attachment(obj));
                                        $("#talent_develope_detail_operation-content").trigger('create');

                                    }
                                })
                            }
                        });

                    } else {
                        $("#talent_develope_detail_operation-content").html(self.template_attachment(obj));

                    };


                } else {
                    // 人员选择
                    var sphb = JSON.parse(localStorage.getItem('sp_helper_back') || null);
                    // 课程选择
                    var sphb_course = JSON.parse(localStorage.getItem('course_helper_back') || null);
                    if (sphb) {

                        obj.divide_data.mentor = [];
                        _.each(sphb.model, function(temp) {
                            obj.divide_data.mentor.push({
                                people: temp._id,
                                people_name: temp.people_name,
                                position_name: temp.position_name
                            })
                        })
                    }
                    if (sphb_course) {
                        obj.divide_data.course = sphb_course.model;
                    }

                    $("#talent_develope_detail_operation_title").html("导师与课程")

                    $("#talent_develope_detail_operation-content").html(self.template_mentor(obj));

                }
                $("#talent_develope_detail_operation-content").trigger('create');

                return this;

            },

            bind_event: function() {
                var self = this;
                $("#talent_develope_detail_operation_list").on('click', '.open-left-panel', function(event) {
                    event.preventDefault();
                    $("#talent_develope_detail_operation-basic-left-panel").panel("open");
                }).on('swiperight', function(event) { //向右滑动，打开左边的面板
                    event.preventDefault();
                    $("#talent_develope_detail_operation-basic-left-panel").panel("open");
                }).on('click', '.ui-btn-icon-left', function(event) {
                    event.preventDefault();
                    var view_mode = $(this).data("view_mode");
                    self.view_mode = view_mode;
                    self.render();
                    $("#talent_develope_detail_operation-basic-left-panel").panel("close");

                    //把 a 换成 span， 避免点那个滑块的时候页面跳走。
                    $(".ui-flipswitch a").each(function() {
                        $(this).replaceWith("<span class='" + $(this).attr('class') + "'></span>");
                    })

                }).on('taphold', '.mentor', function(event) {
                    event.preventDefault();
                    if (confirm("确认删除该导师吗？")) {
                        var mentor_id = $(this).data("up_id");
                        var plan_id = $(this).data("plan_id");
                        var divide_id = $(this).data("divide_id");
                        var divide_single_datas = _.find(self.collection.models[0].attributes.plan_divide, function(x) {
                            return x._id == String(divide_id)
                        })
                        var mentor = divide_single_datas.mentor;
                        var found = _.find(mentor, function(x) {
                                return x.people == String(mentor_id);
                            })
                            //删除grid fs的数据
                        mentor.splice(mentor.indexOf(found), 1); //删除
                        divide_single_datas.mentor = mentor;
                        self.collection.models[0].save(self.collection.models[0].attributes, {
                            success: function(model, response, options) {
                                self.collection.url = '/admin/pm/talent_develope/plan/' + plan_id;
                                self.collection.fetch();
                                self.render();
                            },
                            error: function(model, xhr, options) {}
                        });
                    }
                }).on('taphold', '.course', function(event) {
                    event.preventDefault();
                    if (confirm("确认删除该课程吗？")) {
                        var course_id = $(this).data("up_id");
                        var plan_id = $(this).data("plan_id");
                        var divide_id = $(this).data("divide_id");
                        var divide_single_datas = _.find(self.collection.models[0].attributes.plan_divide, function(x) {
                            return x._id == String(divide_id)
                        })
                        var course = divide_single_datas.course;
                        var found = _.find(course, function(x) {
                                return x._id == String(course_id);
                            })
                            //删除grid fs的数据
                        course.splice(course.indexOf(found), 1); //删除
                        divide_single_datas.course = course;
                        self.collection.models[0].save(self.collection.models[0].attributes, {
                            success: function(model, response, options) {
                                self.collection.url = '/admin/pm/talent_develope/plan/' + plan_id;
                                self.collection.fetch();
                                self.render();
                            },
                            error: function(model, xhr, options) {}
                        });
                    }
                }).on('click', '#btn-talent-add_mentor', function(event) {
                    event.preventDefault();
                    var plan_id = $(this).data("plan_id");
                    var divide_id = $(this).data("divide_id");
                    var divide_single_datas = _.find(self.collection.models[0].attributes.plan_divide, function(x) {
                        return x._id == String(divide_id)
                    })
                    var mentor = divide_single_datas.mentor;

                    var url = '#people_select/t/mentor';
                    localStorage.setItem('sp_helper', JSON.stringify({
                        model: mentor,
                        divide_id: divide_id,
                        paln_id: plan_id,
                        back_url: window.location.hash,
                    })); //放到local storage里面，便于后面选择屏幕进行操作
                    window.location.href = url;
                }).on('click', '#btn-talent-refresh', function(event) {
                    event.preventDefault();
                    $.mobile.loading("show");
                    localStorage.setItem('sp_helper_back', null);
                    localStorage.setItem('course_helper_back', null);
                    localStorage.setItem('sp_helper', null);
                    localStorage.setItem('course_helper', null);
                    $("#talent_develope_detail_operation-basic-left-panel").panel("close");
                    self.render();
                    $.mobile.loading("hide");
                }).on('click', '#btn_save', function(event) {
                    var plan_id = $(this).data("plan_id");
                    var divide_id = $(this).data("divide_id");
                    var divide_single_datas = _.find(self.collection.models[0].attributes.plan_divide, function(x) {
                        return x._id == String(divide_id)
                    })
                    self.collection.models[0].save(self.collection.models[0].attributes, {
                        success: function(model, response, options) {
                            self.collection.url = '/admin/pm/talent_develope/plan/' + plan_id;
                            self.collection.fetch();
                            self.render();
                            alert("数据保存成功!")
                        },
                        error: function(model, xhr, options) {}
                    });
                }).on('click', '#btn-ct-add_course', function(event) {
                    event.preventDefault();
                    var plan_id = $(this).data("plan_id");
                    var divide_id = $(this).data("divide_id");
                    var divide_single_datas = _.find(self.collection.models[0].attributes.plan_divide, function(x) {
                        return x._id == String(divide_id)
                    })
                    var course = divide_single_datas.course;
                    var url = '#course';
                    localStorage.setItem('course_helper', JSON.stringify({
                        model: course,
                        divide_id: divide_id,
                        paln_id: plan_id,
                        back_url: window.location.hash,
                    })); //放到local storage里面，便于后面选择屏幕进行操作
                    window.location.href = url;
                }).on('click', '#btn-talent-add_comment', function(event) {
                    event.preventDefault();
                    var plan_id = $(this).data("plan_id");
                    var divide_id = $(this).data("divide_id");
                    var divide_single_datas = _.find(self.collection.models[0].attributes.plan_divide, function(x) {
                        return x._id == String(divide_id)
                    })
                    var message = $("#talent_develope_detail_operation_list #message").val();
                    if (message) {
                        var obj = {
                            people: self.people,
                            message: message,
                            post_time: new Date(),
                            avatar: self.filter_people.avatar,
                            people_name: self.filter_people.people_name
                        }
                        divide_single_datas.comments.push(obj);
                        self.collection.models[0].save(self.collection.models[0].attributes, {
                            success: function(model, response, options) {
                                self.collection.url = '/admin/pm/talent_develope/plan/' + plan_id;
                                self.collection.fetch();
                                self.render();
                            },
                            error: function(model, xhr, options) {}
                        });
                    } else {
                        alert('请输入沟通记录!')
                    }

                }).on('click', '#btn-ct-add_comment', function(event) {
                    event.preventDefault();
                    var plan_id = $(this).data("plan_id");
                    var divide_id = $(this).data("divide_id");
                    var divide_single_datas = _.find(self.collection.models[0].attributes.plan_divide, function(x) {
                        return x._id == String(divide_id)
                    })
                    var message = $("#talent_develope_detail_operation_list #others_comment").val();
                    if (message) {
                        var obj = {
                            people: self.people,
                            message: message,
                            post_time: new Date(),
                            avatar: self.filter_people.avatar,
                            people_name: self.filter_people.people_name
                        }
                        divide_single_datas.others_comment.push(obj);
                        self.collection.models[0].save(self.collection.models[0].attributes, {
                            success: function(model, response, options) {
                                self.collection.url = '/admin/pm/talent_develope/plan/' + plan_id;
                                self.collection.fetch();
                                self.render();
                            },
                            error: function(model, xhr, options) {}
                        });
                    } else {
                        alert('请输入他评!')
                    }
                }).on('click', 'img', function(event) {
                    event.preventDefault();
                    // var img_view = '<div class="img_view" style="background-image:url('+this.src+')"></div>';
                    if ($("#req_ua").val() == 'normal') {
                        var img_view = '<img src="' + this.src + '">';
                        $("#fullscreen-overlay").html(img_view).fadeIn('fast');
                    } else { //让webview的钩子把它勾住
                        window.location.href = this.src;
                    };
                    // img_view += '<a href="'+this.src.replace('get','download')+'" target="_blank">保存到本地</a>';
                }).on('click', '#btn_upload_attachment', function(event) {
                    event.preventDefault();
                    var plan_id = $(this).data("plan_id");
                    var divide_id = $(this).data("divide_id");
                    var divide_single_datas = _.find(self.collection.models[0].attributes.plan_divide, function(x) {
                            return x._id == String(divide_id)
                        })
                        //转到上传图片的页面
                    localStorage.removeItem('upload_model_back'); //先清掉
                    var next_url = '#upload_pic';
                    localStorage.setItem('upload_model', JSON.stringify({
                        model: {
                            attachments: [],
                            divide_single_datas: divide_single_datas,
                            plan_id: plan_id,
                            divide_id: divide_id
                        },
                        field: 'attachments',
                        back_url: window.location.hash
                    }))
                    window.location.href = next_url;

                })

            }

        });

        // Returns the View class
        return DevelopePlanDetailOperationListView;

    });