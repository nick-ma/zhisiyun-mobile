// Upload Pic View 上传图片
// =================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars"],
    function($, _, Backbone, Handlebars) {

        // Extends Backbone.View
        var UploadPicView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                this.template = Handlebars.compile($("#hbtmp_upload_pic_view").html());
                // The render method is called when CollTask Models are added to the Collection
                // this.collection.on("sync", this.render, this);
                this.bind_event();
            },

            // Renders all of the CollTask models on the UI
            render: function() {

                var self = this;
                var um = JSON.parse(localStorage.getItem('upload_model'));
                self.model = um.model;
                self.field = um.field;
                self.back_url = um.back_url;

                var render_data = {};
                $("#btn-upload_pic-back").attr('href', self.back_url);
                $("#upload_pic-content").html(self.template(render_data));
                $("#upload_pic-content").trigger('create');

                return this;

            },
            bind_event: function() {
                var self = this;
                $("#upload_pic-content")
                    .on('click', '#choosefile', function(event) {
                        event.preventDefault();

                        $("#upload_pic-content input[type=file]").trigger("click");

                    })
                    .on('click', '#do_upload', function(event) {
                        event.preventDefault();
                        var file = $("#upload_pic-content input[type=file]")[0].files[0];
                        if (file) {
                            $(this).text("正在上传...");
                            $("#frmUploadPic").submit();
                        } else {
                            alert('请选择照片或者拍照！');
                        };
                    })
                    .on('submit', '#frmUploadPic', function(event) {
                        event.preventDefault();
                        $.mobile.ajaxUpload.upload(this);
                        return false;
                    })
                    .on('change', 'input[type=file]', function(event) {
                        var file = $("input[type=file]")[0].files[0];
                        $("#preview").empty();
                        self.displayAsImage3(file, "preview");

                        $fileinfo = $("#fileinfo");
                        $fileinfo.empty();
                        if (file && file.name) {
                            $fileinfo.append("<li>名称:<span>" + file.name + "</span></li>");
                        }
                        if (file && file.type) {
                            $fileinfo.append("<li>类型:<span>" + file.type + " </span></li>");
                        }
                        if (file && file.size) {
                            $fileinfo.append("<li>大小:<span>" + self.calcSize(file.size) + "</span></li>");
                        }
                        // if (file && file.lastModifiedDate) {
                        //     $fileinfo.append("<li>最后更改日期:<span>" + file.lastModifiedDate + " bytes</span></li>");
                        // }
                        $fileinfo.listview("refresh");

                    });
                $("body").on('pagecontainerload', function(event, ui) {
                    event.preventDefault();
                    if (ui.textStatus == 'success') {
                        var server_res = JSON.parse(ui.xhr.responseText);
                        if (server_res.success) {
                            // localStorage.setItem()
                            $("#do_upload").text('上传成功');
                            // 利用local storage传递数据
                            _.each(server_res.success, function(x) {
                                self.model[self.field].push(x._id);
                            })
                            localStorage.setItem('upload_model_back', JSON.stringify({
                                model: self.model
                            }))
                            localStorage.removeItem('upload_model'); //用完删掉

                            // 返回调用页面

                            window.setTimeout(function() { //500毫秒后自动跳转回上一个界面
                                window.location.href = '/m' + self.back_url;
                            }, 200);
                        };
                        // console.log(server_res);
                    };
                    // console.log(ui);
                });
            },
            displayAsImage3: function(file, containerid) {
                if (typeof FileReader !== "undefined") {
                    var container = document.getElementById(containerid),
                        img = document.createElement("img"),
                        reader;
                    container.appendChild(img);
                    reader = new FileReader();
                    reader.onload = (function(theImg) {
                        return function(evt) {
                            theImg.src = evt.target.result;
                        };
                    }(img));
                    reader.readAsDataURL(file);
                }
            },
            calcSize: function(size) {
                if (size < 1024) {
                    return sprintf('%0.2f B', size);
                } else if (size >= 1024 && size < 1048576) { //1024 * 1024
                    return sprintf('%0.2f KB', size / 1024);
                } else if (size >= 1048576 && size < 1073741824) { //1024^3
                    return sprintf('%0.2f MB', size / 1048576);
                } else if (size >= 1073741824) {
                    return springf('%0.2f GB', size / 1073741824);
                };
            },

        });

        // Returns the View class
        return UploadPicView;

    });