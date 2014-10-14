// Contact Detail View
// ===================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars"],
    function($, _, Backbone, Handlebars) {
        var temp_plan_detail_id = null;

        function format(date) {
            return moment(date).format("YYYYMMDD");
        }
        //im_send
        function im_send(temp_data, divide_id, tag, name, cb) {
            var require_data = [];
            var obj = {
                'plan_data': temp_data,
                'plan_id': temp_data._id,
                'divide_id': divide_id,
                'plan_name': temp_data.plan_name,
                'develope_direct': temp_data.develope_direct,
                'people': temp_data.people,
                'people_no': temp_data.people_no,
                'people_name': temp_data.people_name,
                'period_start': temp_data.period_start,
                'period_end': temp_data.period_end,
                'des_career': temp_data.des_career,
                'des_career_name': temp_data.des_career_name,
                'des_position': temp_data.des_position,
                'des_position_name': temp_data.des_position_name,
            }
            if (tag == 'delete_mentor') {
                obj.mentor = name;
            } else if (tag == 'delete_course') {
                obj.course = name;
            } else if (tag == 'add_comment') {
                obj.comment = name;
            } else if (tag == 'detail_pass') {
                obj.integral = name;
            } else if (tag == 'course_pass') {
                obj.found = name;
            }
            require_data.push(obj);
            var post_data = 'require_data=' + JSON.stringify(require_data);
            post_data += '&tag=' + tag;
            $.post('/admin/pm/talent_develope/im_send_detail', post_data, function(data) {
                console.log(data)
                if (data.code == 'OK') {
                    cb(data.data)
                } else {
                    cb(null)
                }
            })
        }
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
                    //     //是否已到期
                    _.each(x.attributes.plan_divide, function(temp) {
                        temp.is_disabled = false;
                        if (format(temp.plan_e) < format(moment(new Date()))) {
                            temp.is_disabled = true;
                        } else if (format(temp.plan_s) > format(moment(new Date()))) {
                            temp.is_disabled = false;
                        } else {
                            temp.is_disabled = false;
                        }
                    })

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
                    //取积分上下限数据
                var type_data = _.map(self.type, function(p) {
                    return p.toJSON()
                })
                var single_type_data = _.find(type_data, function(temp) {
                    return temp._id == String(divide_data.develope_type)
                })
                if (single_type_data) {
                    var single_style_data = _.find(single_type_data.develope_style, function(temp) {
                        return temp._id == String(divide_data.style_id)
                    })
                }

                self.filter_people = filter_people;
                temp_plan_detail_id = talent_data[0]._id;
                var obj = {
                    talent_data: talent_data[0],
                    divide_id: self.divide_id,
                    divide_data: divide_data,
                    people_data: people_data,
                    login_people: $("#login_people").val(),
                    file_data: self.file,
                    type_data: type_data,
                    single_style_data: single_style_data ? single_style_data : null
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

                }).on('taphold', '.mentor', function(event) { //删除导师
                    event.preventDefault();
                    if (confirm("确认删除该导师吗？")) {
                        var mentor_id = $(this).data("up_id");
                        var plan_id = $(this).data("plan_id") || self.collection.models[0].attributes._id;
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
                                self.collection.fetch().done(function() {
                                    var temp_data = self.collection.models[0].attributes;
                                    im_send(temp_data, divide_id, 'delete_mentor', found.people_name, function(data) {
                                        self.render();
                                    })
                                });
                            },
                            error: function(model, xhr, options) {}
                        });
                    }
                }).on('taphold', '.course', function(event) { //删除课程
                    event.preventDefault();
                    if (confirm("确认删除该课程吗？")) {
                        var course_id = $(this).data("up_id");
                        var plan_id = $(this).data("plan_id") || self.collection.models[0].attributes._id;
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
                                self.collection.fetch().done(function() {
                                    var temp_data = self.collection.models[0].attributes;
                                    im_send(temp_data, divide_id, 'delete_course', found.c_name, function(data) {
                                        self.render();
                                    })
                                });
                            },
                            error: function(model, xhr, options) {}
                        });
                    }
                }).on('click', '#btn-talent-add_mentor', function(event) { //添加导师
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
                    var temp_data = self.collection.models[0].attributes;
                    im_send(temp_data, divide_id, 'add_mentor', null, function(data) {
                        window.location.href = url;
                    })

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
                            localStorage.setItem('sp_helper_back', null);
                            localStorage.setItem('course_helper_back', null);
                            localStorage.setItem('sp_helper', null);
                            localStorage.setItem('course_helper', null);
                            self.render();
                            alert("数据保存成功!")
                        },
                        error: function(model, xhr, options) {}
                    });
                }).on('click', '#btn-ct-add_course', function(event) { //添加课程
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
                    var temp_data = self.collection.models[0].attributes;
                    im_send(temp_data, divide_id, 'add_course', null, function(data) {
                        window.location.href = url;
                    })
                }).on('click', '#btn-talent-add_comment', function(event) { //添加交流记录
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
                                self.collection.fetch().done(function() {
                                    var temp_data = self.collection.models[0].attributes;
                                    im_send(temp_data, divide_id, 'add_message', message, function(data) {
                                        self.render();
                                    })
                                });
                            },
                            error: function(model, xhr, options) {}
                        });
                    } else {
                        alert('请输入沟通记录!')
                    }

                }).on('click', '#btn-ct-add_comment', function(event) { //添加他评
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
                                self.collection.fetch().done(function() {
                                    var temp_data = self.collection.models[0].attributes;
                                    im_send(temp_data, divide_id, 'add_comment', message, function(data) {
                                        self.render();
                                    })
                                });
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
                }).on('click', '#btn_upload_attachment', function(event) { //添加附件
                    event.preventDefault();
                    var plan_id = $(this).data("plan_id") || self.collection.models[0].attributes._id;
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
                    var temp_data = self.collection.models[0].attributes;
                    im_send(temp_data, divide_id, 'add_attachment', null, function(data) {
                        window.location.href = next_url;
                    })
                }).on('click', '.open-left-panel', function(event) {
                    event.preventDefault();
                    $("#talent_develope_detail_operation-basic-left-panel").panel("open");
                }).on('change', '#check_summary', function(event) {
                    event.preventDefault();
                    var plan_id = $(this).data("plan_id");
                    var divide_id = $(this).data("divide_id");
                    var divide_single_datas = _.find(self.collection.models[0].attributes.plan_divide, function(x) {
                        return x._id == String(divide_id)
                    })
                    var check_summary = $("#talent_develope_detail_operation_list #check_summary").val();
                    if (check_summary) {

                        divide_single_datas.check_summary = check_summary;
                        self.collection.models[0].save(self.collection.models[0].attributes, {
                            success: function(model, response, options) {
                                self.collection.url = '/admin/pm/talent_develope/plan/' + plan_id;
                                self.collection.fetch();
                                self.render();
                            },
                            error: function(model, xhr, options) {}
                        });
                    } else {
                        alert('请输入自评!')
                    }
                }).on('click', "#go_back", function(event) {
                    event.preventDefault();
                    window.location.href = '#plan_list_detail/' + temp_plan_detail_id;
                    // window.history.go(-1);
                }).on('change', "#pass", function(event) {
                    event.preventDefault();
                    var pass = $(this).val();
                    var plan_id = $(this).data("plan_id");
                    var divide_id = $(this).data("divide_id");
                    var divide_single_datas = _.find(self.collection.models[0].attributes.plan_divide, function(x) {
                        return x._id == String(divide_id)
                    })

                    divide_single_datas.pass = !divide_single_datas.pass;
                    self.collection.models[0].save(self.collection.models[0].attributes, {
                        success: function(model, response, options) {
                            self.collection.url = '/admin/pm/talent_develope/plan/' + plan_id;
                            self.collection.fetch().done(function() {
                                //明细计划通过
                                if (pass == "true") {
                                    var temp_data = self.collection.models[0].attributes;

                                    im_send(temp_data, divide_id, 'detail_pass', null, function(data) {
                                        self.render();
                                    })
                                } else {
                                    self.render();
                                }


                            });
                            // self.render();
                            //把 a 换成 span， 避免点那个滑块的时候页面跳走。
                            $(".ui-flipswitch a").each(function() {
                                $(this).replaceWith("<span class='" + $(this).attr('class') + "'></span>");
                            })
                        },
                        error: function(model, xhr, options) {}
                    });
                }).on('change', ".integral", function(event) {
                    event.preventDefault();
                    var plan_id = $(this).data("plan_id");
                    var divide_id = $(this).data("divide_id");
                    var integral_up = $(this).data("integral_up");
                    var integral_down = $(this).data("integral_down");
                    var current_val = $(this).val();
                    if (current_val < integral_up || current_val > integral_down) {
                        alert("该积分值不在区间内,请重新输入!")
                        $(this).val("");
                    } else {
                        var divide_single_datas = _.find(self.collection.models[0].attributes.plan_divide, function(x) {
                            return x._id == String(divide_id)
                        })
                        divide_single_datas.integral = $(this).val();
                        //已通过课程积分总和
                        //
                        var course_pass = _.filter(divide_single_datas.course, function(c) {
                            return !!c.is_pass
                        })
                        var integral_pass = _.map(course_pass, function(c) {
                                return c.integral
                            })
                            //总和
                        var integral_count = parseInt(_.reduce(integral_pass, function(mem, num) {
                            return mem + num
                        }, 0))
                        integral_count += parseInt(divide_single_datas.integral);

                        if (parseInt(integral_count) > parseInt(integral_down)) {
                            divide_single_datas.integral_total = parseInt(integral_down)

                        } else {
                            divide_single_datas.integral_total = parseInt(integral_count)

                        }
                        var integral_map = _.map(self.collection.models[0].attributes.plan_divide, function(temp) {
                            return temp.integral_total
                        })

                        var total_integral = _.reduce(integral_map, function(mem, num) {
                            return mem + num
                        }, 0)
                        self.collection.models[0].attributes.integral = total_integral;
                        self.collection.models[0].save(self.collection.models[0].attributes, {
                            success: function(model, response, options) {
                                self.collection.url = '/admin/pm/talent_develope/plan/' + plan_id;
                                self.collection.fetch().done(function() {
                                    //明细计划通过
                                    var temp_data = self.collection.models[0].attributes;
                                    im_send(temp_data, divide_id, 'detail_pass', divide_single_datas.integral, function(data) {
                                        self.render();
                                    })

                                });
                            },
                            error: function(model, xhr, options) {}
                        });
                    }

                }).on('change', ".course_pass", function(event) {
                    event.preventDefault();
                    var pass = $(this).val();
                    var plan_id = $(this).data("plan_id");
                    var divide_id = $(this).data("divide_id");
                    var course_id = $(this).data("up_id");
                    //积分上下限;
                    var integral_up = $(this).data("integral_up");
                    var integral_down = $(this).data("integral_down");
                    var divide_single_datas = _.find(self.collection.models[0].attributes.plan_divide, function(x) {
                        return x._id == String(divide_id)
                    })
                    var course = divide_single_datas.course;
                    var found = _.find(course, function(x) {
                        return x._id == String(course_id);
                    })
                    if (pass == "true") {
                        found.is_pass = true;
                        found.integral = $(this).data("integral")
                    } else {

                        found.is_pass = false;
                        found.integral = 0;
                    }
                    //已通过课程积分总和
                    //
                    var course_pass = _.filter(divide_single_datas.course, function(c) {
                        return !!c.is_pass
                    })
                    var integral_pass = _.map(course_pass, function(c) {
                            return c.integral
                        })
                        //总和
                    var integral_count = parseInt(_.reduce(integral_pass, function(mem, num) {
                        return mem + num
                    }, 0))
                    integral_count += parseInt(divide_single_datas.integral);

                    if (parseInt(integral_count) > parseInt(integral_down)) {
                        divide_single_datas.integral_total = parseInt(integral_down)

                    } else {
                        divide_single_datas.integral_total = parseInt(integral_count)

                    }
                    var integral_map = _.map(self.collection.models[0].attributes.plan_divide, function(temp) {
                        return temp.integral_total
                    })

                    var total_integral = _.reduce(integral_map, function(mem, num) {
                        return mem + num
                    }, 0)
                    self.collection.models[0].attributes.integral = total_integral;
                    self.collection.models[0].save(self.collection.models[0].attributes, {
                        success: function(model, response, options) {
                            self.collection.url = '/admin/pm/talent_develope/plan/' + plan_id;
                            self.collection.fetch().done(function() {
                                //明细计划通过
                                if (pass == "true") {
                                    var temp_data = self.collection.models[0].attributes;
                                    im_send(temp_data, divide_id, 'course_pass', found, function(data) {
                                        self.render();
                                    })
                                } else {
                                    self.render();
                                }


                            });
                            //把 a 换成 span， 避免点那个滑块的时候页面跳走。
                            $(".ui-flipswitch a").each(function() {
                                $(this).replaceWith("<span class='" + $(this).attr('class') + "'></span>");
                            })
                        },
                        error: function(model, xhr, options) {}
                    });
                })

            }

        });

        // Returns the View class
        return DevelopePlanDetailOperationListView;

    });