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
                self.watermark = um.watermark; //是否加水印
                self.watermark_text = um.watermark_text;
                self.model = um.model;
                self.field = um.field;
                self.back_url = um.back_url;
                self.new_width = um.new_width; //直接定义的新宽度
                // console.log(um); //need comment out when prd
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
                        // workaround for android 4.4~4.4.2
                        // var syscmd = 'cmd://app/choosefile/file4upload';
                        // console.log(syscmd);
                        // window.location.href = syscmd;
                        $("#upload_pic-content input[type=file]").trigger("click");
                    })
                    .on('click', '#choosefile2', function(event) {
                        event.preventDefault();
                        // workaround for android 4.4~4.4.2
                        if (window.AndroidUploader) {
                            if (window.AndroidUploader.upload) {
                                window.AndroidUploader.upload("javascript:android_uploader_callback('<file_id>')");
                            } else {
                                alert("当前系统不支持AndroidUploader.upload()");
                            };
                        } else {
                            alert("当前系统不支持Android本地上传功能");
                        };
                    })
                    .on('click', '#do_upload', function(event) {
                        event.preventDefault();
                        var file = $("#upload_pic-content input[type=file]")[0].files[0];
                        if (file) {
                            console.log(file);
                            $(this).text("正在上传...");
                            // $("#frmUploadPic").submit();
                            // change a new method for resize and upload images
                            if (window.File && window.FileReader && window.FileList && window.Blob) {
                                self.resizeAndUpload(file);
                            } else {
                                alert('The File APIs are not fully supported in this browser.');
                            }

                        } else {
                            alert('请选择照片或者拍照！');
                        };
                    })
                    .on('submit', '#frmUploadPic', function(event) {
                        event.preventDefault();
                        $.mobile.ajaxUpload.upload(this); //use form submit
                        return false;
                    })
                    .on('change', 'input[type=file]', function(event) {
                        var file = $("input[type=file]")[0].files[0];
                        console.log(file);
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
                $("body")
                    .on('pagecontainerload', function(event, ui) {
                        event.preventDefault();
                        if (ui.textStatus == 'success') {
                            var server_res = JSON.parse(ui.xhr.responseText);
                            if (server_res.success) {
                                // localStorage.setItem()
                                $("#do_upload").text('上传成功');
                                // 利用local storage传递数据
                                _.each(server_res.success, function(x) {
                                    if (_.isArray(self.model[self.field])) { //如果是数组，就push
                                        self.model[self.field].push(x._id);
                                    } else { //否则，直接替换－》人员头像
                                        self.model[self.field] = x._id;
                                    };
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
                    })
                    .on('change', '#android_upload_file_id', function(event) { //通过android上传器上传的文件的id
                        event.preventDefault();
                        var $this = $(this);
                        var file_id = $this.val();
                        if (_.isArray(self.model[self.field])) { //如果是数组，就push
                            self.model[self.field].push(file_id);
                        } else { //否则，直接替换－》人员头像
                            self.model[self.field] = file_id;
                        };
                        localStorage.setItem('upload_model_back', JSON.stringify({
                            model: self.model
                        }))
                        localStorage.removeItem('upload_model'); //用完删掉

                        // 返回调用页面

                        window.setTimeout(function() { //500毫秒后自动跳转回上一个界面
                            window.location.href = '/m' + self.back_url;
                        }, 200);
                        console.log('上传的文件id是： ' + $this.val());
                    });
            },
            displayAsImage3: function(file, containerid) {
                if (typeof FileReader !== "undefined") {
                    var container = document.getElementById(containerid),
                        img = document.createElement("img"),
                        reader;
                    img.id = 'preview_img';
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
            resizeAndUpload: function(file) {
                var self = this;
                $.canvasResize(file, {
                    width: self.new_width || 640,
                    height: 0,
                    crop: false,
                    quality: 90,
                    //rotate: 90,
                    callback: function(data, width, height) {
                        console.log(data, width, height);
                        var mimeString = data.split(',')[0].split(':')[1].split(';')[0];
                        console.log(mimeString);
                        // $("#upload_pic-content input[type=file]").attr('src', data);
                        // 在这里打上水印
                        var my_canvas = document.getElementById('my_canvas');
                        my_canvas.width = width;
                        my_canvas.height = height;
                        var ctx = my_canvas.getContext('2d');
                        var tmp_img = new Image();
                        tmp_img.onload = function(e) {
                            ctx.drawImage(tmp_img, 0, 0);
                            if (self.watermark) { //画水印
                                var text_01 = ['日期:' + moment().format('YYYY-MM-DD HH:mm:ss')];
                                text_01.push('上传人:' + $("#login_people_name").val());
                                ctx.font = "18px Arial";
                                ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
                                ctx.fillText(text_01.join('  '), 11, 21);
                                ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
                                ctx.fillText(text_01.join('  '), 10, 20);
                                if (self.watermark_text) { //有第二行的文字，画出来
                                    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
                                    ctx.fillText(self.watermark_text, 11, 41);
                                    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
                                    ctx.fillText(self.watermark_text, 10, 40);
                                };
                            };

                            // 回显到界面
                            var preview_img = document.getElementById('preview_img');
                            if (mimeString === 'image/png') {
                                preview_img.src = my_canvas.toDataURL('image/png');
                            } else {
                                preview_img.src = my_canvas.toDataURL('image/jpeg', 0.9);
                            };

                            // 上传

                            var xhr = new XMLHttpRequest();
                            xhr.onreadystatechange = function(ev) {
                                // document.getElementById('filesInfo').innerHTML = 'Done!';

                                if (ev.target.readyState == 4) {
                                    if (ev.target.status == 200) {
                                        $("#do_upload").text('上传成功');
                                        var res = JSON.parse(ev.target.responseText);

                                        // 利用local storage传递数据

                                        // self.model[self.field].push(res._id);

                                        if (_.isArray(self.model[self.field])) { //如果是数组，就push
                                            self.model[self.field].push(res._id);
                                        } else { //否则，直接替换－》人员头像
                                            self.model[self.field] = res._id;
                                        };

                                        localStorage.setItem('upload_model_back', JSON.stringify({
                                            model: self.model
                                        }))
                                        localStorage.removeItem('upload_model'); //用完删掉

                                        // 返回调用页面

                                        window.setTimeout(function() { //500毫秒后自动跳转回上一个界面
                                            window.location.href = '/m' + self.back_url;
                                        }, 200);
                                    } else {
                                        $("#do_upload").text('上传失败');
                                    };

                                    // console.log(res);
                                };
                                // console.log(ev);
                            };

                            xhr.open('POST', '/gridfs/put', true);
                            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                            var post_data = 'data=' + encodeURIComponent(preview_img.src.replace(/^data:image\/(png|jpg|jpeg);base64,/, ""));
                            // var post_data = 'data=' + data;
                            post_data += '&file_name=' + file.name;
                            post_data += '&file_type=' + file.type;
                            // console.log(post_data);
                            xhr.send(post_data);

                        }
                        tmp_img.src = data;

                    }
                });
                /*
                var reader = new FileReader();
                reader.onloadend = function() {

                    var tempImg = new Image();
                    tempImg.src = reader.result;
                    tempImg.onload = function() {
                        //resize by fixed width/height
                        // var MAX_WIDTH = 560;
                        // var MAX_HEIGHT = 320;
                        // var tempW = tempImg.width;
                        // var tempH = tempImg.height;
                        // if (tempW > tempH) {
                        //     if (tempW > MAX_WIDTH) {
                        //         tempH *= MAX_WIDTH / tempW;
                        //         tempW = MAX_WIDTH;
                        //     }
                        // } else {
                        //     if (tempH > MAX_HEIGHT) {
                        //         tempW *= MAX_HEIGHT / tempH;
                        //         tempH = MAX_HEIGHT;
                        //     }
                        // }
                        // resize by ratio
                        var ratio = .1;
                        var tempW = tempImg.width * ratio;
                        var tempH = tempImg.height * ratio;
                        var canvas = document.createElement('canvas');
                        canvas.width = tempW;
                        canvas.height = tempH;
                        var ctx = canvas.getContext("2d");
                        ctx.drawImage(this, 0, 0, tempW, tempH);
                        var dataURL = canvas.toDataURL("image/jpeg");
                        $("#upload_pic-content img").attr('src', dataURL);
                        console.log(dataURL);
                        var xhr = new XMLHttpRequest();
                        xhr.onreadystatechange = function(ev) {
                            // document.getElementById('filesInfo').innerHTML = 'Done!';
                            console.log(ev);
                            $("#do_upload").text('上传成功');
                        };

                        xhr.open('POST', '/gridfs/put', true);
                        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                        var post_data = 'data=' + encodeURIComponent(dataURL.replace(/^data:image\/(png|jpg|jpeg);base64,/, ""));
                        post_data += '&file_name=' + file.name;
                        post_data += '&file_type=' + file.type;
                        xhr.send(post_data);
                    }

                }
                reader.readAsDataURL(file);
*/
            },
            calcSize: function(size) {
                if (size < 1024) {
                    return sprintf('%0.2f B', size);
                } else if (size >= 1024 && size < 1048576) { //1024 * 1024
                    return sprintf('%0.2f KB', size / 1024);
                } else if (size >= 1048576 && size < 1073741824) { //1024^3
                    return sprintf('%0.2f MB', size / 1048576);
                } else if (size >= 1073741824) {
                    return sprintf('%0.2f GB', size / 1073741824);
                };
            },
            dataURLtoBlob: function(data) {
                var mimeString = data.split(',')[0].split(':')[1].split(';')[0];
                var byteString = atob(data.split(',')[1]);
                var ab = new ArrayBuffer(byteString.length);
                var ia = new Uint8Array(ab);
                for (var i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i);
                }
                var bb = (window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder);
                if (bb) {
                    //    console.log('BlobBuilder');        
                    bb = new(window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder)();
                    bb.append(ab);
                    return bb.getBlob(mimeString);
                } else {
                    //    console.log('Blob');  
                    bb = new Blob([ab], {
                        'type': (mimeString)
                    });
                    return bb;
                }
            },

        });

        // Returns the View class
        return UploadPicView;

    });