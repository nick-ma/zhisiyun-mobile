// Assessment  Review Edit View 绩效面谈查看界面
// =============================================================

// Includes file dependencies
define(["jquery", "underscore", "async", "backbone", "handlebars", "moment", "../../models/AssessmentModel", "../../models/CollTaskModel", "../../models/TaskModel"],
    function($, _, async, Backbone, Handlebars, moment, AssessmentModel, CollTask, Event) {
        var people_ind_superiors, people_superiors, ai_id = null,
            pds = null,
            wfs = [];

        function post_to_work_plan(render_data, cb) {
                var ai_id = ai_id || render_data._id;
                var post_data = {
                    origin_oid: ai_id || render_data._id,
                    origin_cat: 'review'
                };
                $.post('/admin/pm/work_plan/remove_by_origin', post_data, function(data, textStatus, xhr) {
                    if (data.code == 'OK') { //删除成功
                        // return;
                        var create_event = function(people) {
                                var new_event = {
                                    creator: $("#login_people").val(),
                                    people: people,
                                    title: render_data.ai_name + '的绩效面谈会议',
                                    allDay: false,
                                    start: moment(render_data.review.start).format('YYYY-MM-DD HH:mm'),
                                    end: moment(render_data.review.end).format('YYYY-MM-DD HH:mm'),
                                    tags: '绩效面谈,' + render_data.ai_name,
                                    url: '/admin/pm/assessment_instance/review/bbform?ai_id=' + ai_id,
                                    origin_oid: ai_id,
                                    origin_cat: 'review',
                                    editable: false,
                                    startEditable: false,
                                    durationEditable: false,
                                    origin: '1',
                                };
                                new_event.description = '请与会人准时参加';
                                new Event(new_event).save();
                            }
                            // console.log(ai.attributes.review.initiator);
                            // 开始插入新的数据
                        if (render_data.review.initiator) { //发起人
                            create_event(render_data.review.initiator._id || render_data.review.initiator);
                        } else {
                            create_event($("#login_people").val());

                        };
                        create_event(render_data.people._id); //被约人
                        _.each(render_data.review.attendees, function(x) { //其他参与人--已经去掉了populate
                            // console.log(ai.attributes.review.initiator);
                            if (x._id != render_data.people._id && ($("#login_people").val() && $("#login_people").val() != x._id)) {
                                // console.log(x);
                                create_event(x._id);
                            };
                        })
                        cb(null, 'OK');
                    };
                });
            }
            // Extends Backbone.View
        var AssessmentReviewEditView = Backbone.View.extend({
            // The View Constructor
            initialize: function() {
                this.template = Handlebars.compile($("#psh_review_edit_form_view").html());
                this.loading_template = Handlebars.compile($("#loading_template_view").html());
                this.wf_template = Handlebars.compile($("#pi_assessment_wf_select_view").html()); //流程选择
                this.step1_template = Handlebars.compile($("#psh_review_edit_step1_form_view").html()); //流程选择
                this.step2_template = Handlebars.compile($("#psh_review_edit_step2_form_view").html()); //流程选择
                this.step3_template = Handlebars.compile($("#psh_review_edit_step3_form_view").html()); //流程选择
                this.bind_events();
                var self = this;
            },
            pre_render: function() {
                var self = this;
                $("#review_edit_form-content").html(self.loading_template({
                    info_msg: '数据加载中...请稍候'
                }));
                $("#review_edit_form-content").trigger('create');
                return this;
            },
            // Renders all of the Assessment models on the UI
            render: function() {
                var self = this;
                var data = _.map(self.collection.models, function(x) {
                    return x.toJSON()
                })
                if (!data[0].review.initiator) {
                    data[0].review.initiator = {
                        _id: $("#login_people").val(),
                        "people_name": $("#login_people_name").val(),
                        "position_name": $("#login_position_name").val(),
                        "avatar": $("#login_avatar").val(),
                    }
                }
                if (self.ai_status > 11) {
                    $("#review_edit_form #review_name").html("绩效面谈查看")

                } else {
                    $("#review_edit_form #review_name").html("绩效面谈编辑")

                }

                //本地数据
                var sphb = JSON.parse(localStorage.getItem('sp_helper_back') || null);
                if (sphb) {
                    data[0].review.attendees = sphb.model.attendees;
                    localStorage.removeItem("sp_helper_back");

                }
                var sphb_upload = JSON.parse(localStorage.getItem('upload_model_back') || null);
                if (self.ai_status != 11 || self.is_self) {
                    var is_edit = false;
                } else {
                    var is_edit = true;

                }
                ai_id = data[0]._id;
                //附件数据
                if (sphb_upload) { //有从上传页面发回来的数据
                    var attachments = sphb_upload.model.attachments;
                    _.each(attachments, function(temp) {
                            var find_attachment = _.find(data[0].review.attachments, function(x) {
                                if (x.file) {
                                    return x.file._id == String(temp)

                                }
                            })
                            if (!find_attachment) {
                                data[0].review.attachments.push({
                                    file: temp,
                                    people: $("#login_people").val()
                                })
                            }
                        })
                        // data[0].review.attachments =[];
                    localStorage.removeItem('upload_model_back'); //用完删掉
                    _.each(data[0].review.attachments, function(x) {
                        if (x.file) {
                            x.file = x.file._id || x.file;
                        };
                        if (x.people) {
                            x.people = x.people._id || x.people;
                        };
                    })
                    if (data[0].review.initiator) {
                        data[0].review.initiator = data[0].review.initiator._id;
                    };
                    data[0].review.attendees = _.map(_.clone(data[0].review.attendees), function(x) {
                        return x._id;
                    })
                    self.collection.models[0].save(self.collection.models[0].attributes, {
                        success: function(model, response, options) {
                            self.collection.url = '/admin/pm/assessment_instance/review/bb/' + ai_id;
                            self.collection.fetch().done(function() {
                                var render_data = {
                                    data: self.collection.models[0].attributes,
                                    is_edit: is_edit
                                }
                                $("#review_edit_form-content").html(self.template(render_data));
                                $("#review_edit_form-content").trigger('create');
                            })

                        }
                    });

                } else {
                    var render_data = {
                        data: data[0],
                        is_edit: is_edit
                    }
                    $("#review_edit_form-content").html(self.template(render_data));
                    $("#review_edit_form-content").trigger('create');
                }


                //查找上级和间接上级数据
                async.series({
                    ind_sup: function(cb) {
                        self.get_ind_superiors(data[0].people.ind_superiors, cb);
                    },
                    sup: function(cb) {
                        self.get_superiors(data[0].people.superiors, cb);
                    }
                }, function(err, result) {
                    people_ind_superiors = result.ind_sup;
                    people_superiors = result.sup;

                })
                return this;

            },
            render_step1: function() {
                var self = this;
                var data = _.map(self.collection.models, function(x) {
                    return x.toJSON()
                })
                $("#review_edit_form #review_name").html("上期绩效回顾")
                if (self.ai_status != 11 || self.is_self) {
                    var is_edit = false;
                } else {
                    var is_edit = true;

                }
                var render_data = {
                    data: data[0],
                    is_edit: is_edit
                }
                $("#review_edit_form-content").html(self.step1_template(render_data));
                $("#review_edit_form-content").trigger('create');
            },
            render_step2: function() {
                var self = this;
                var data = _.map(self.collection.models, function(x) {
                    return x.toJSON()
                })
                $("#review_edit_form #review_name").html("面谈提纲撰写")
                if (self.ai_status != 11 || self.is_self) {
                    var is_edit = false;
                } else {
                    var is_edit = true;

                }
                var render_data = {
                    data: data[0],
                    is_edit: is_edit
                }
                $("#review_edit_form-content").html(self.step2_template(render_data));
                $("#review_edit_form-content").trigger('create');
            },
            render_step3: function() {
                var self = this;
                var data = _.map(self.collection.models, function(x) {
                    return x.toJSON()
                })
                $("#review_edit_form #review_name").html("面谈沟通纪要")
                if (self.ai_status != 11 || self.is_self) {
                    var is_edit = false;
                } else {
                    var is_edit = true;

                }
                var peoples = [];
                peoples.push(data[0].review.initiator)
                _.each(data[0].review.attendees, function(x) {
                    peoples.push(x);
                })
                peoples.push(data[0].people)
                var render_data = {
                    data: data[0],
                    is_edit: is_edit,
                    peoples: peoples
                }
                $("#review_edit_form-content").html(self.step3_template(render_data));
                $("#review_edit_form-content").trigger('create');
            },
            render_wf: function(pds) {
                var self = this;
                var data = _.map(self.collection.models, function(x) {
                    return x.toJSON()
                })
                var render_data = {
                    pds: pds
                }
                $("#review_edit_form #summary_name").html("启动审批流程");
                $("#review_edit_form-content").html(self.wf_template(render_data));
                $("#review_edit_form-content").trigger('create');
                return this;

            },
            bind_events: function() {
                var self = this;

                $("#review_edit_form").on('click', '#add_attendees', function(event) { //第三层－指标总结入口
                        event.preventDefault();
                        var data = _.map(self.collection.models, function(x) {
                            return x.toJSON()
                        })
                        var url = '#people_select/m/attendees';
                        localStorage.setItem('sp_helper', JSON.stringify({
                            model: data[0].review,
                            back_url: window.location.hash,
                        })); //放到local storage里面，便于后面选择屏幕进行操作
                        window.location.href = url;
                    }).on('click', '#review_href', function(event) { //返回定位
                        event.preventDefault();
                        window.location.href = "/m#review";
                    }).on('click', '.btn-review_edit_form-change_state', function(event) { //定位不足与改进及亮点分享
                        event.preventDefault();
                        var view_filter = $(this).data("view_filter");
                        $.mobile.loading('show');

                        if (view_filter == 'A') {

                            self.render();
                            $.mobile.loading('hide');

                        } else if (view_filter == 'B') {
                            self.render_step1();
                            $.mobile.loading('hide');

                        } else if (view_filter == 'C') {
                            self.render_step2();
                            $.mobile.loading('hide');

                        } else if (view_filter == 'D') {
                            self.render_step3();
                            $.mobile.loading('hide');
                        }
                    }).on('click', '.delete_attendees', function(event) { //添加指标
                        event.preventDefault();
                        var people_id = $(this).data("up_id");
                        var data = _.map(self.collection.models, function(x) {
                            return x.toJSON()
                        });
                        data[0].review.attendees = _.filter(data[0].review.attendees, function(x) {
                            return x._id != String(people_id)
                        })
                        var data4save = _.clone(data[0]);
                        var type = "delete";
                        self.data_save(data4save, ai_id, type);

                    }).on('click', '#btn_save', function(event) { //数据保存接口
                        event.preventDefault();
                        var ai_id = $(this).data("ai_id") || self.collection.models[0].attributes._id;
                        var data4save = _.clone(self.collection.models[0].attributes);
                        var type = "success";
                        async.series({
                            create_plan: function(cb) {
                                post_to_work_plan(data4save, cb)
                            }
                        }, function(err, result) {
                            self.data_save(data4save, ai_id, type);

                        })
                    }).on('change', "textarea", function(event) {
                        event.preventDefault();
                        var field = String($(this).data("field")).split('-');
                        var comment = $(this).val();
                        self.collection.models[0].attributes[field[0]][field[1]] = comment;
                        var data4save = _.clone(self.collection.models[0].attributes);
                        self.data_save(data4save, ai_id, "no_render"); //自评值的保存

                    }).on('change', "#place", function(event) {
                        event.preventDefault();
                        var ai_id = ai_id || self.collection.models[0].attributes._id;
                        self.collection.models[0].attributes.review.place = $(this).val();
                        var data4save = _.clone(self.collection.models[0].attributes);
                        self.data_save(data4save, ai_id, null); //自评值的保存

                    }).on('change', "#start,#end", function(event) {
                        event.preventDefault();
                        var field = $(this).data("field");
                        var start = self.collection.models[0].attributes.start;
                        var end = self.collection.models[0].attributes.end;
                        var ai_id = ai_id || self.collection.models[0].attributes._id;
                        if (field == "start") {
                            // if (moment($(this).val()).isAfter(moment(end))) {
                            //     alert("面谈开始时间需小于面谈结束时间")
                            // } else {
                            self.collection.models[0].attributes.review.start = moment($(this).val());

                            // }

                        } else if (field == "end") {
                            // if (moment($(this).val()).isBefore(moment(start))) {
                            //     alert("面谈结束时间需大于面谈开始时间")
                            // } else {
                            self.collection.models[0].attributes.review.end = moment($(this).val());

                            // }

                        }
                        var data4save = _.clone(self.collection.models[0].attributes);
                        self.data_save(data4save, ai_id, "date"); //自评值的保存


                    })
                    // .on('click', "#btn_submit", function(event) {
                    //                     event.preventDefault();
                    //                     var pdcodes = ['AssessmentInstance_review', ]; //获取绩效总结流程数据，可能有多条，只能选一条
                    //                     async.times(pdcodes.length, function(n, next) {
                    //                         var url = '/admin/wf/process_define/get_json_by_code?process_code=' + pdcodes[n];
                    //                         $.get(url, function(data) {
                    //                             if (data.length) {
                    //                                 next(null, data[0]);
                    //                             } else {
                    //                                 next(null, null);
                    //                             };
                    //                         });
                    //                     }, function(err, results) {
                    //                         pds = _.compact(results);
                    //                         self.render_wf(pds);
                    //                     })
                    //                 }).on('click', "#do_submit", function(event) {
                    //                     event.preventDefault();
                    //                     var wf_select = $("input[class='wf_select']:checked");
                    //                     var pd_id = wf_select.val();
                    //                     var process_name = wf_select.data("process_name");
                    //                     $("#review_edit_form #btn_save").trigger("click");
                    //                     var pd = _.find(pds, function(x) {
                    //                         return x._id == pd_id;
                    //                     })
                    //                     if (pd) {
                    //                         $("#do_submit").attr('disabled', 'disabled');
                    //                         var process_define = pd._id;
                    //                         var process_instance_name = self.collection.models[0].attributes.ai_name + '的面谈审批流程';
                    //                         var url = pd.process_start_url;
                    //                         var post_data = {
                    //                             process_define: process_define,
                    //                             process_instance_name: process_instance_name,
                    //                             ai_id: ai_id,
                    //                         };
                    //                         $.post(url, post_data, function(data, textStatus, xhr) {
                    //                             if (data.code == 'OK') {
                    //                                 var task_id = data.data.ti._id + '-' + data.data.pd._id + '-' + data.data.pd.process_code;
                    //                                 window.location = '/m#godo13/' + task_id + '/edit';
                    //                             } else if (data.code == 'ERR') {
                    //                                 $("#do_submit").removeAttr('disabled');
                    //                                 console.log(data.err); //把错误信息输出到控制台，以便查找错误。
                    //                             }
                    //                         })

                //                     };
                //                 })
                .on('click', "#btn_wf_view", function(event) {
                    event.preventDefault();
                    var ai_id = ai_id || self.collection.models[0].attributes._id;
                    self.get_wfs(ai_id);
                }).on('click', '#btn_upload_attachment', function(event) { //添加附件
                    event.preventDefault();
                    var data = _.map(self.collection.models, function(x) {
                            return x.toJSON()
                        })
                        //转到上传图片的页面
                    localStorage.removeItem('upload_model_back'); //先清掉
                    var next_url = '#upload_pic';
                    localStorage.setItem('upload_model', JSON.stringify({
                        model: {
                            attachments: []
                        },
                        field: 'attachments',
                        back_url: window.location.hash
                    }))
                    window.location.href = next_url;
                }).on('click', "#btn_submit", function(event) {
                    event.preventDefault();
                    var ai_id = self.collection.models[0].attributes._id;
                    var ai_name = self.collection.models[0].attributes.ai_name;
                    var post_data = {
                        ai_id: ai_id,
                        ai_name: ai_name,
                        type: 'review'
                    }
                    $("#btn_submit").attr('disabled', "disabled");

                    var url = '/admin/pm/assessment_instance/appeal/wf_review_create';
                    // if (confirm("确认提交审批吗？")) {
                    my_confirm("确认发起流程吗?", null, function() {
                        $.mobile.loading("show");

                        $.post(url, post_data, function(data, textStatus, xhr) {
                            if (data.code == 'OK') {
                                var task_id = data.data.ti._id + '-' + data.data.pd._id + '-' + data.data.pd.process_code;
                                window.location = '/m#godo13/' + task_id + '/edit';
                                $.mobile.loading("hide");

                            } else if (data.code == 'ERR') {
                                $("#btn_submit").removeAttr('disabled');
                                console.log(data.err); //把错误信息输出到控制台，以便查找错误。
                            }
                        })
                    })

                })

            },
            get_ind_superiors: function(people_id, cb) {

                $.get('/admin/masterdata/people/get/' + people_id, function(data) {
                    if (data.code == 'OK') {
                        cb(null, data.data);
                    } else {
                        cb(null, null);
                    };
                });

            },
            get_superiors: function(people_id, cb) {
                $.get('/admin/masterdata/people/get/' + people_id, function(data) {
                    if (data.code == 'OK') {
                        cb(null, data.data);
                    } else {
                        cb(null, null);
                    };
                });
            },

            data_save: function(data4save, ai_id, type) {
                var self = this;
                //回复populate出来的字段
                if (data4save.review.initiator) {
                    data4save.review.initiator = data4save.review.initiator._id;
                } else {
                    data4save.review.initiator = $("#login_people").val()
                };
                data4save.review.attendees = _.map(_.clone(data4save.review.attendees), function(x) {
                    return x._id;
                })

                _.each(data4save.review.attachments, function(x) {
                    if (x.file) {
                        x.file = x.file._id;
                    };
                    if (x.people) {
                        x.people = x.people._id;
                    };
                })

                self.collection.models[0].save(data4save, {
                    success: function(model, response, options) {
                        self.collection.url = '/admin/pm/assessment_instance/review/bb/' + ai_id;

                        self.collection.fetch().done(function() {

                            if (type == "success") {
                                alert("数据保存成功!");
                                self.render();

                            } else if (type == "delete") {
                                alert("数据删除成功!");
                                self.render();

                            } else if (type == "date") {
                                self.render();

                            }
                        })

                    },
                    error: function(model, xhr, options) {}
                });
            },
            get_wfs: function(ai_id) {
                $.get('/admin/wf/process_instance/get_pis_by_cid?cid=' + ai_id + '&codes=AssessmentInstance_review', function(data) {
                    if (data.code == 'OK') {
                        var wfs = data.data;
                        if (wfs[0]) {
                            window.location.href = "/m#godo13/" + wfs[0]._id + '/view';

                        } else {
                            alert("未找到相关流程！")
                        }
                    };
                });
            }
        });

        // Returns the View class
        return AssessmentReviewEditView;

    });