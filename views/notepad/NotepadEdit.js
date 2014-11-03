// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "moment", "async"],
    function($, _, Backbone, Handlebars, moment, async) {
        // Extends Backbone.View
        var NotepadEdittView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                var self = this;

                self.template = Handlebars.compile($("#np_edit_view").html());
                self.loading_template = Handlebars.compile($("#loading_template_view").html());
                self.left_template = Handlebars.compile($("#np_edit_left_view").html());

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

                $("#np_edit_list-content").html(self.template(self.model.attributes));
                $("#np_edit_list-content").trigger('create');

                return this;
            },
            bind_event: function() {
                var self = this;
                $("#np_edit_list-content")
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
                            $('#btn-send-ok').attr('disabled',true);
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
                                _.each(pls,function(x){
                                    var rp = {};
                                    rp.people = x.people;
                                    rp.people_name = x.people_name;
                                    self.model.attributes.r_peoples.push(rp);
                                })
                                self.model.save().done(function(){
                                    alert('转发成功!');
                                    $('#btn-send-ok').attr('disabled',false);
                                })
                                $("#np_edit-left-panel").panel("close");
                            })
                        } else {
                            alert('请选择要转发的人员!')
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
                        })
                        rendered.people = pls;

                        $("#np_edit-left-panel-content").html(self.left_template(rendered));
                        $("#np_edit-left-panel-content").trigger('create');

                        $("#np_edit-left-panel").panel("open");
                    })
                    .on('click', '#btn-cancel', function(event) {
                        if (confirm("确认删除吗？一旦删除将无法恢复！")) {
                            self.model.destroy({
                                success: function() {
                                    alert('删除成功!');
                                    window.location.href = '#np_list';
                                }
                            });
                        };
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
            }
        });
        // Returns the View class
        return NotepadEdittView;
    });