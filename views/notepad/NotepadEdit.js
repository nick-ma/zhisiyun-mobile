// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "moment", "async"],
    function($, _, Backbone, Handlebars, moment, async) {
        // Extends Backbone.View
        var NotepadEdittView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                var self = this;

                self.template = Handlebars.compile($("#np_edit_view").html());
                self.template2 = Handlebars.compile($("#hbtmp_tags_select_view").html());
                self.loading_template = Handlebars.compile($("#loading_template_view").html());
                self.left_template = Handlebars.compile($("#np_edit_left_view").html());
                self.mode_view = '0';

                self.bind_event();
            },
            pre_render: function() {
                var self = this;
                $("#np_edit_list-content").html(self.loading_template({
                    info_msg: '数据加载中...请稍候'
                }));
                $("#np_edit_list-content").trigger('create');
                return this;
            },
            render: function() {
                var self = this;

                if (self.mode_view == '0') {
                    //附件数据
                    if (localStorage.getItem('upload_model_back')) { //有从上传页面发回来的数据
                        var img_obj = JSON.parse(localStorage.getItem('upload_model_back')).model;
                        img_obj.attachments.push(img_obj.attachments_tmp);

                        self.model.set('content', img_obj.content);
                        self.model.set('attachments', img_obj.attachments);
                        localStorage.removeItem('upload_model_back'); //用完删掉

                        self.model.attributes.lastModified = new Date();
                        self.model.save();
                    };

                    $("body").pagecontainer("change", "#np_edit_list", {
                        reverse: false,
                        changeHash: false,
                    });

                    $("#np_edit_list-content").html(self.template(self.model.attributes));
                    $("#np_edit_list-content").trigger('create');
                    $("#np_content").trigger('change'); //根据内容调整文本框大小
                } else {

                    $("body").pagecontainer("change", "#tags_select", {
                        reverse: false,
                        changeHash: false,
                    });
                    var tags = self.mt.get('tags');
                    tags = _.sortBy(tags, function(x) {
                        return -x.frequency_of_usage;
                    })
                    $("#tags-content").html(self.template2(self.mt.attributes));
                    $("#tags-content").trigger('create');
                }

                return this;
            },
            bind_event: function() {
                var self = this;
                $("#np_edit_list-content")
                    .on('change', '#np_tags', function(event) {
                        var $this = $(this);
                        var field = $this.data('field');
                        var value = $this.val();

                        self.model.get(field).push(value);
                        self.model.attributes.lastModified = new Date();
                        self.model.save().done(function() {
                            //把标签添加到历史标签表
                            if (!!self.mt.attributes._id) {
                                var my_tags = self.mt.get('tags');
                                var tag = _.find(my_tags, function(x) {
                                    return x.tag == value;
                                })
                                if (!tag) {
                                    var tag_obj = {
                                        tag: value,
                                        frequency_of_usage: 1,
                                    }
                                    my_tags.push(tag_obj);
                                }
                                self.mt._id = self.mt.attributes._id;
                            } else {
                                var my_tags = {
                                    people: self.people,
                                    tags: [],
                                };
                                var tag_obj = {
                                    tag: value,
                                    frequency_of_usage: 1,
                                }
                                my_tags.tags.push(tag_obj);
                                self.mt.attributes = my_tags;
                            }
                            delete self.mt.people;
                            self.mt.save().done(function() {
                                self.render();
                            })
                        });
                    })
                    .on('click', '.remove_tags', function(event) {
                        var $this = $(this);
                        var index = $this.data('index');

                        self.model.get('tags').splice(index, 1);
                        self.model.attributes.lastModified = new Date();
                        self.model.save().done(function() {
                            self.render();
                        });
                    })
                    .on('click', '#btn_add_tags', function(event) {
                        event.preventDefault();

                        self.mode_view = '1';
                        self.render();
                    })
                    .on('change', '#np_content', function(event) {
                        var $this = $(this);
                        var field = $this.data('field');
                        var value = $this.val();

                        self.model.set(field, value);
                        self.model.attributes.lastModified = new Date();
                        self.model.save();
                    })
                    .on('click', 'img', function(event) {
                        event.preventDefault();
                        // var img_view = '<div class="img_view" style="background-image:url('+this.src+')"></div>';
                        var img_view = '<img src="' + this.src + '">';
                        // img_view += '<a href="'+this.src.replace('get','download')+'" target="_blank">保存到本地</a>';
                        $("#fullscreen-overlay").html(img_view).fadeIn('fast');
                    })

                $("#np_edit-left-panel-content")
                    .on('click', '#btn-send-ok', function(event) {
                        var pls = [];
                        _.each($(".send_np"), function(x) {
                            if ($(x).attr('data-cacheval') == 'false') {
                                var pl = {};
                                pl.people = $(x).val();
                                pl.people_name = $(x).data('people_name');
                                pls.push(pl);
                            }
                        })

                        if (pls.length) {
                            $('#btn-send-ok').attr('disabled', true);
                            async.times(pls.length, function(n, next) {
                                var p = pls[n];

                                var new_np = {
                                    people: p.people,
                                    people_name: p.people_name,
                                    content: self.model.attributes.content,
                                    source_people: self.model.attributes.people,
                                    source_people_name: self.model.attributes.people_name,
                                    attachments: self.model.attributes.attachments,
                                    createDate: new Date(),
                                    lastModified: new Date(),
                                };
                                var np = self.nps.add(new_np);

                                np.save().done(function() {
                                    next(null, null);
                                })
                            }, function(err, results) {
                                _.each(pls, function(x) {
                                    var rp = {};
                                    rp.people = x.people;
                                    rp.people_name = x.people_name;
                                    self.model.attributes.r_peoples.push(rp);
                                })
                                self.model.save().done(function() {
                                    alert('转发成功!');
                                    window.location.href = '#np_list';
                                    $('#btn-send-ok').attr('disabled', false);
                                })
                                $("#np_edit-left-panel").panel("close");
                            })
                        } else {
                            alert('请选择要转发的人员!')
                        }
                    })
                    .on('change', '#chk_all', function(event) {
                        event.preventDefault();
                        var bool = ($(this).attr('data-cacheval') == 'true' ? false : true);
                        if (bool) {
                            var set = $(".send_np").each(function() {
                                $(this).attr('checked', true)
                                $(this).prev().removeClass('ui-checkbox-off').addClass('ui-checkbox-on')
                                $(this).attr("data-cacheval", false);
                            })
                        } else {
                            var set = $(".send_np").each(function() {
                                $(this).attr('checked', false)
                                $(this).prev().removeClass('ui-checkbox-on').addClass('ui-checkbox-off')
                                $(this).attr("data-cacheval", true);
                            })
                        }
                    })

                $("#np_edit-footer")
                    .on('click', '#btn-add', function(event) {
                        var new_np = {
                            people: self.model.attributes.people,
                            people_name: self.model.attributes.people_name,
                            content: '新建的记事本',
                            createDate: new Date(),
                            lastModified: new Date(),
                        };
                        var np = self.nps.add(new_np);

                        np.save().done(function() {
                            self.model = np;
                            self.render();
                        })
                    })
                    .on('click', '#btn-send', function(event) {
                        var rendered = {};
                        var pls = _.filter(self.peoples, function(x) {
                            return x._id != self.model.attributes.people;
                        });
                        //把拼音重新组装，以便查询
                        _.each(pls, function(x) {
                            if (typeof(x.pinyin) != "string") {
                                var s = '';
                                _.each(x.pinyin, function(xx) {
                                    s += xx.toString() + ',';
                                })
                                x.pinyin = s;
                            }
                        })
                        rendered.people = pls;

                        $("#np_edit-left-panel-content").html(self.left_template(rendered));
                        $("#np_edit-left-panel-content").trigger('create');

                        $("#np_edit-left-panel").panel("open");
                    })
                    .on('click', '#btn-cancel', function(event) {
                        // if (confirm("确认删除吗？一旦删除将无法恢复！")) {
                        my_confirm("确认删除吗？", null, function() {
                            self.model.destroy({
                                success: function() {
                                    setTimeout(function() {
                                        alert('删除成功!', function() {
                                            window.location.href = '#np_list';
                                        });
                                    }, 1000);
                                }
                            });
                        });
                    })
                    .on('click', '#btn_upload_attachment', function(event) {
                        //转到上传图片的页面
                        // var leave = self.model.get('leave');
                        localStorage.removeItem('upload_model_back'); //先清掉
                        var next_url = '#upload_pic';
                        localStorage.setItem('upload_model', JSON.stringify({
                            model: self.model,
                            field: 'attachments_tmp',
                            back_url: window.location.hash
                        }))
                        window.location.href = next_url;

                    })

                $("#tags_select")
                    .on('click', '#btn-tags-back', function(event) {
                        self.mode_view = '0';
                        self.render();
                    })
                    .on('click', '#btn-tags-ok', function(event) {
                        _.each($(".checkbox_tags"), function(x) {
                            if ($(x).attr('data-cacheval') == 'false') {
                                self.model.get('tags').push($(x).data('tag'));
                            }
                        })
                        self.model.save().done(function() {
                            self.mode_view = '0';
                            self.render();
                        })
                    })
                    .on('click', '.remove_my_tags', function(event) {
                        my_confirm("确认删除历史标签吗？", null, function() {
                            var $this = $(this);
                            var up_id = $this.data('up_id');
                            var tags = self.mt.get('tags');
                            var tag = _.find(tags, function(x) {
                                return x._id == up_id;
                            })

                            tags.splice(tags.indexOf(tag), 1);
                            self.mt.save().done(function() {
                                self.render();
                            });
                        });
                    })
                    .on('change', '#chk_all_tags', function(event) {
                        event.preventDefault();

                        var bool = ($(this).attr('data-cacheval') == 'true' ? false : true);
                        if (bool) {
                            var set = $(".checkbox_tags").each(function() {
                                $(this).attr('checked', true)
                                $(this).prev().removeClass('ui-checkbox-off').addClass('ui-checkbox-on')
                                $(this).attr("data-cacheval", false);
                            })
                        } else {
                            var set = $(".checkbox_tags").each(function() {
                                $(this).attr('checked', false)
                                $(this).prev().removeClass('ui-checkbox-on').addClass('ui-checkbox-off')
                                $(this).attr("data-cacheval", true);
                            })
                        }
                    })
            }
        });
        // Returns the View class
        return NotepadEdittView;
    });