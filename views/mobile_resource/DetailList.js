// Mobile View
// =============

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "moment", "jqmcal", "formatdate"], function($, _, Backbone, Handlebars, moment) {

    function times(start_date) {
        s_date = start_date.split('T')[0];
        s_zone = start_date.split('T')[1] || null;

        return s_date + ' ' + s_zone
    }
    Handlebars.registerHelper('mr_eq', function(data, data2, options) {
        if (data < data2) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        };
    });

    Handlebars.registerHelper('rp_type', function(data) {
        return data == 'M' ? '会议室资源' : '车辆资源'
    });

    // Extends Backbone.View
    var MobileDetailView = Backbone.View.extend({
        // The View Constructor
        initialize: function() {
            this.template = Handlebars.compile($("#mobile_resource_detail_view").html());
            this.template_edit = Handlebars.compile($("#mobile_resource_edit_view").html());
            this.people_select_template = Handlebars.compile($("#im_people_select_view").html());
            this.bind_events();
            this.model_view = '0';
            // The render method is called when Mobile Models are added to the Collection
            // this.model.on("sync", this.render, this);

        },

        // Renders all of the Mobile models on the UI
        render: function() {
            var self = this;
            //附件数据
            if (localStorage.getItem('upload_model_back')) { //有从上传页面发回来的数据
                leave = JSON.parse(localStorage.getItem('upload_model_back')).model;
                if (_.isUndefined(leave.attis)) {
                    leave.attis = [];
                    leave.attis.push(leave.attachments)
                } else {
                    leave.attis.push(leave.attachments)
                }
                self.model.set('attachments', _.flatten([self.model.get('attachments'), leave.attis], true))
                self.model.set('attachments', _.flatten([leave.attachments], true))
                localStorage.removeItem('upload_model_back'); //用完删掉
            };

            var rendered_data = '';
            if (self.model_view == '0') {
                $("#mobile_resource_detail #mobile_resource_back").addClass('ui-icon-back').removeClass('ui-icon-check')
                var obj = self.model.attributes;
                obj.mrs = self.mrs;


                obj.mr_types = [{
                    name: '会议室资源',
                    type: 'M'

                }, {
                    name: '车辆资源',
                    type: 'C'

                }]
                console.log(obj)

                if (self.login_people == self.model.get('people')) {
                    rendered_data = self.template_edit(obj)
                } else {
                    rendered_data = self.template(obj)
                }
            } else {
                $("#mobile_resource_detail #mobile_resource_back").removeClass('ui-icon-back').addClass('ui-btn-icon-notext ui-icon-check')
                rendered_data = self.people_select_template({
                    people: self.peoples
                })
            }
            $("#mobile_resource_detail-content").html(rendered_data);
            $("#mobile_resource_detail-content").trigger('create');

            // Maintains chainability
            return this;
        },

        bind_events: function() {
            var self = this;
            $('#mobile_resource_detail').on('change', 'textarea', function(event) {
                event.preventDefault();
                self.model.set($(this).data('field'), $(this).val())
            }).on('change', 'select', function(event) {
                event.preventDefault();
                self.model.set($(this).data('field'), $(this).val())
            }).on('change', 'input', function(event) {
                event.preventDefault();
                self.model.set($(this).data('field'), moment(times($(this).val())).toDate())
            }).on('click', '#btn-ct-save', function(event) {
                event.preventDefault();
                $this = $(this)
                    // if (!$('#mobile_resource_detail #mobile_resource').val()) {
                    //     alert('请选择会议室资源！会议室用途！会议开始时间，结束时间')
                    //     return false
                    // };
                if (!$('#mobile_resource_detail #meeting_desc').val()) {
                    alert('请填写用途！')
                    return false
                };
                // if (!$('#mobile_resource_detail #start').val()) {
                //     alert('请选择会议开始时间！')
                //     return false
                // };
                // if (!$('#mobile_resource_detail #end').val()) {
                //     alert('请选择结束时间')
                //     return false
                // };
                $.mobile.loading("show");
                $this.attr('disabled', true)
                self.model.save(self.model.attributes, {
                    success: function(model, response, options) {
                        $.mobile.loading("hide");
                        alert('资源预定保存成功!')
                        $this.removeAttr('disabled')
                    },
                    error: function(model, xhr, options) {
                        $.mobile.loading("hide");
                        alert('资源预定保存失败!')
                        $this.removeaAttr('disabled')
                    }
                })
            }).on('click', '#btn-ct-delete', function(event) {
                event.preventDefault();
                // if (confirm('确认删除本次会议室预定吗？\n删除成功后将跳转到预定界面！')) {
                //     self.model.destroy({
                //         success: function() {
                //             window.location.href = '#mobile_resource';
                //         },
                //         error: function(model, xhr, options) {
                //             alert('会议室预定删除失败!')
                //         }
                //     });

                // };

                my_confirm('确认删除本次资源预定吗？\n删除成功后将跳转到预定界面！', null, function() {
                    self.model.destroy({
                        success: function() {
                            window.location.href = '#mobile_resource';
                        },
                        error: function(model, xhr, options) {
                            setTimeout(function() {
                                alert('会议室预定删除失败!')
                            }, 1000);
                        }
                    });
                })



            }).on('click', '#show_peoples', function(event) {
                event.preventDefault();
                self.model_view = '1'
                self.render();
            }).on('change', '#checked_all_people', function(event) {
                event.preventDefault();
                var bool = ($(this).attr('data-cacheval') == 'true' ? false : true);
                if (bool) {
                    var set = $("#mobile_resource_detail-content input[type=checkbox]").each(function() {
                        $(this).attr('checked', true)
                        $(this).prev().removeClass('ui-checkbox-off').addClass('ui-checkbox-on')
                        $(this).attr("data-cacheval", false);
                    })
                } else {
                    var set = $("#mobile_resource_detail-content input[type=checkbox]").each(function() {
                        $(this).attr('checked', false)
                        $(this).prev().removeClass('ui-checkbox-on').addClass('ui-checkbox-off')
                        $(this).attr("data-cacheval", true);
                    })
                }

            }).on('click', '#mobile_resource_back', function(event) {
                event.preventDefault();
                if (self.model_view == '1') {
                    self.model_view = '0';
                    var people_selected = _.compact(_.map($("#mobile_resource_detail-content input[type=checkbox]:checked"), function(x) {
                        var f_d = _.find(self.peoples, function(pp) {
                            return pp._id == String(x.value)
                        })
                        if (f_d) {
                            return {
                                _id: f_d._id,
                                people_name: f_d.people_name
                            };
                        } else {
                            return null
                        }
                    }));
                    self.model.set('meeting_peoples', people_selected)
                    self.render();
                } else {
                    window.location.href = '#mobile_resource'
                }

            }).on('click', '#btn_upload_attachment', function(event) {
                //转到上传图片的页面
                // var leave = self.model.get('leave');
                localStorage.removeItem('upload_model_back'); 
                var next_url = '#upload_pic';
                localStorage.setItem('upload_model', JSON.stringify({
                    model: self.model,
                    field: 'attachments',
                    back_url: window.location.hash
                }))
                window.location.href = next_url;

            })
        }


    });

    // Returns the View class
    return MobileDetailView;

});