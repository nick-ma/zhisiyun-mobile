// comment Edit View
// =================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars"],
    function($, _, Backbone, Handlebars) {

        // Extends Backbone.View
        var CommentAddView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                var self = this;
                this.template = Handlebars.compile($("#hbtmp_comment_add_view").html());
                // The render method is called when comment Models are added to the Collection
                // this.collection.on("sync", this.render, this);
                // bind event
                self.bind_event();
            },

            // Renders all of the comment models on the UI
            render: function() {

                var self = this;
                var cm = JSON.parse(localStorage.getItem('comment_model'));
                console.log(cm);
                if (cm) {
                    self.model = cm.model;
                    self.field = cm.field;
                    self.back_url = cm.back_url;
                    $("#btn-comment_add-back").attr('href', cm.back_url);

                };
                if (localStorage.getItem('comment_new')) { //被通知新开一个，把原来的信息删掉
                    localStorage.removeItem('comment_new')
                    delete self.new_comment;
                };
                self.new_comment = self.new_comment || {
                    comment: '', //意见内容
                    // attachments: ['534d442a5adf0d86720001e6', '5385bb5682ec76e23e0000d1', '5385bb5682ec76e23e0000d1', '5385bb5682ec76e23e0000d1', '5385bb5682ec76e23e0000d1'], //附件。 
                    attachments: [], //附件。 
                    createDate: new Date(),
                    people_name: $("#login_people_name").val(),
                    position_name: $("#login_position_name").val(),
                    avatar: $("#login_avatar").val(),
                    creator: $("#login_people").val()
                };
                if (localStorage.getItem('upload_model_back')) { //有从上传页面发回来的数据
                    self.new_comment = JSON.parse(localStorage.getItem('upload_model_back')).model;
                    localStorage.removeItem('upload_model_back'); //用完删掉
                };
                // 人员选择
                var render_data = self.new_comment;

                $("#comment_add-content").html(self.template(render_data));
                $("#comment_add-content").trigger('create');
                return this;

            },
            bind_event: function() {
                var self = this;
                $("#comment_add-content")
                    .on('click', '#btn-comment-upload_pic', function(event) {
                        //转到上传图片的页面
                        localStorage.removeItem('upload_model_back'); //先清掉
                        var next_url = '#upload_pic';
                        var data4send = {
                            model: self.new_comment,
                            field: 'attachments',
                            back_url: '#comment_add'
                        }
                        if (self.model.task_name) { //如果是协作任务，就把任务的名称带过去做到水印上
                            data4send.watermark = true; //需要加水印
                            data4send.watermark_text = '任务:' + self.model.task_name;
                        };
                        localStorage.setItem('upload_model', JSON.stringify(data4send))
                        window.location.href = next_url;

                    })
                    .on('click', '#btn-comment-save', function(event) {
                        if (self.new_comment.comment) {
                            if (_.isArray(self.model[self.field])) {
                                self.model[self.field].push(self.new_comment);
                                self.model[self.field] = _.sortBy(self.model[self.field], function(x) {
                                    return -(new Date(x.createDate));
                                })
                                localStorage.setItem('comment_model_back', JSON.stringify({
                                    model: self.model
                                }));
                                localStorage.removeItem('comment_model'); //清掉
                                window.setTimeout(function() {
                                    window.location.href = self.back_url;
                                }, 10);

                            };
                        } else {
                            alert('请输入沟通内容');
                        };

                    })
                    .on('click', 'img', function(event) {
                        event.preventDefault();
                        // var img_view = '<div class="img_view" style="background-image:url('+this.src+')"></div>';
                        var img_view = '<img src="' + this.src + '">';
                        // img_view += '<a href="'+this.src.replace('get','download')+'" target="_blank">保存到本地</a>';
                        $("#fullscreen-overlay").html(img_view).fadeIn('fast');
                    })
                    .on('change', 'textarea', function(event) {
                        event.preventDefault();
                        var $this = $(this);
                        var field = $this.data('field');
                        var value = $this.val();
                        self.new_comment[field] = value;
                        // self.model.set(field, value);
                    });
            }

        });

        // Returns the View class
        return CommentAddView;

    });