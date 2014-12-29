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



    function show_time_mark(self) {
        var mobile_resource = $('#mobile_resource_create #mobile_resource').val();
        var start = $('#mobile_resource_create #start').val();
        var end = $('#mobile_resource_create #end').val();
        var start = moment($('#start').val()).format('YYYY-MM-DD');
        var end = moment($('#end').val()).format('YYYY-MM-DD');
        var times = calculate_hours_d(start, end)
        var filters = _.filter(self.lists, function(tt) {
            var tt_start = moment(tt.start).format('YYYY-MM-DD');
            var tt_end = moment(tt.end).format('YYYY-MM-DD');
            var mr_id = tt.mobile_resource ? tt.mobile_resource._id : null;
            return mr_id == mobile_resource && (!!~times.indexOf(tt_start) || !!~times.indexOf(tt_end))
        })
        var maps = _.map(filters, function(fl) {
            return '<p style="margin-top: 0px; margin-bottom: 0px;">' + moment(fl.start).format('YYYY-MM-DD HH:mm') + ' ~ ' + moment(fl.end).format('YYYY-MM-DD HH:mm') + '</p>'
        })
        if (maps.length) {
            maps.unshift('<p style="margin-top: 0px; margin-bottom: 0px;">已用时间段：</p>')
            $("#mobile_resource_create .is_show").show()
        } else {
            $("#mobile_resource_create .is_show").hide()
        }

        $(".is_show").html(maps.join('\n'))
    }

    function calculate_hours_d(start_time, end_time) {
        var days_between = moment(end_time).diff(moment(start_time), 'days');
        var items = [];
        for (var i = 0; i <= days_between; i++) {
            var iterate_date = moment(start_time).add('days', i).format('YYYY-MM-DD');
            items.push(iterate_date)
        };
        return items
    }

    // Extends Backbone.View
    var MobileCreateView = Backbone.View.extend({
        // The View Constructor
        initialize: function() {
            this.template = Handlebars.compile($("#mobile_resource_save_view").html());
            this.people_select_template = Handlebars.compile($("#im_people_select_view").html());
            this.bind_events();
            this.model_view = '0';
            this.mr_type = 'M';
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

                self.model.set('start', leave.start)
                self.model.set('end', leave.end)
                self.model.set('mobile_resource', leave.mobile_resource)
                self.model.set('meeting_desc', leave.meeting_desc)
                self.model.set('meeting_peoples', leave.meeting_peoples)
                localStorage.removeItem('upload_model_back'); //用完删掉
            };


            var rendered_data = '';
            if (self.model_view == '0') {
                $("#mobile_resource_create #mobile_resource_back").addClass('ui-icon-back').removeClass('ui-icon-check')
                var obj = self.model.attributes;
                obj.mrs = _.filter(self.mrs, function(mr) {
                    return mr.mr_type == self.mr_type
                });
                obj.mr_types = [{
                    name: '会议室资源',
                    type: 'M'

                }, {
                    name: '车辆资源',
                    type: 'C'

                }]

                obj.mr_type = self.mr_type;
                console.log(self)
                rendered_data = self.template(obj)
            } else {
                $("#mobile_resource_create #mobile_resource_back").removeClass('ui-icon-back').addClass('ui-btn-icon-notext ui-icon-check')
                rendered_data = self.people_select_template({
                    people: self.peoples
                })
            }
            $("#mobile_resource_create-content").html(rendered_data);
            $("#mobile_resource_create-content").trigger('create');
            show_time_mark(self);
            // Maintains chainability
            return this;
        },

        bind_events: function() {
            var self = this;
            $('#mobile_resource_create').on('change', 'textarea', function(event) {
                event.preventDefault();
                self.model.set($(this).data('field'), $(this).val())
            }).on('change', 'select[name="mobile_resource"]', function(event) {
                event.preventDefault();
                show_time_mark(self)
                self.model.set($(this).data('field'), $(this).val())
            }).on('change', 'input', function(event) {
                event.preventDefault();
                show_time_mark(self)
                self.model.set($(this).data('field'), moment(times($(this).val())).toDate())
            }).on('click', '#btn-ct-save', function(event) {
                event.preventDefault();
                $this = $(this)
                var mobile_resource = $('#mobile_resource_create #mobile_resource').val();
                self.model.set('mobile_resource', mobile_resource)
                    // if (!$('#mobile_resource_create #mobile_resource').val()) {
                    //     alert('请选择会议室资源！会议室用途！会议开始时间，结束时间')
                    //     return false
                    // };
                if (!$('#mobile_resource_create #meeting_desc').val()) {
                    alert('请填写用途！')
                    return false
                };
                var start = $('#mobile_resource_create #start').val();
                var end = $('#mobile_resource_create #end').val();

                if (!start) {
                    alert('请选择开始时间！')
                    return false
                };
                if (!end) {
                    alert('请选择结束时间')
                    return false
                };
                var e_date = moment(end).toDate();
                var s_date = moment(start).toDate();
                if (e_date < s_date) {
                    alert('结束日期不能小于开始日期')
                    return false
                }
                var filters = _.filter(self.lists, function(tt) {
                    var tt_start = moment(tt.start).toDate();
                    var tt_end = moment(tt.end).toDate();
                    var bool = (tt_start < s_date) && (s_date < tt_end)
                    var bool_02 = (tt_start < e_date) && (e_date < tt_end)
                    var bool_03 = (tt_start >= s_date) && (tt_end <= e_date)
                    var bl = (bool || bool_02);
                    var mr_id = tt.mobile_resource ? tt.mobile_resource._id : null
                    return mr_id == mobile_resource && (bool || bool_02 || bool_03)
                })

                if (filters.length) {
                    alert('请选择空余时间段!')
                    return false
                };



                // if (confirm('确认保存吗？\n保存成功后将跳转到会议室预定界面！')) {
                //     $.mobile.loading("show");
                //     $this.attr('disabled', true)
                //     self.model.save(self.model.attributes, {
                //         success: function(model, response, options) {
                //             $.mobile.loading("hide");
                //             window.location.href = '#mobile_resource';
                //             $this.removeAttr('disabled')
                //         },
                //         error: function(model, xhr, options) {
                //             $.mobile.loading("hide");
                //             alert('会议室预定保存失败!')
                //             $this.removeaAttr('disabled')
                //         }
                //     })
                // }
                my_confirm('确认保存吗？\n保存成功后将跳转到预定界面！', null, function() {
                    $.mobile.loading("show");
                    $this.attr('disabled', true)
                    self.model.save(self.model.attributes, {
                        success: function(model, response, options) {
                            $.mobile.loading("hide");
                            window.location.href = '#mobile_resource';
                            $this.removeAttr('disabled')
                        },
                        error: function(model, xhr, options) {
                            $.mobile.loading("hide");
                            setTimeout(function() {
                                alert('资源预定保存失败!')
                            }, 1000);
                            $this.removeaAttr('disabled')
                        }
                    })
                })



            }).on('click', '#show_peoples', function(event) {
                event.preventDefault();
                self.model_view = '1'
                self.render();
            }).on('change', '#checked_all_people', function(event) {
                event.preventDefault();
                var bool = ($(this).attr('data-cacheval') == 'true' ? false : true);
                if (bool) {
                    var set = $("#mobile_resource_create-content input[type=checkbox]").each(function() {
                        $(this).attr('checked', true)
                        $(this).prev().removeClass('ui-checkbox-off').addClass('ui-checkbox-on')
                        $(this).attr("data-cacheval", false);
                    })
                } else {
                    var set = $("#mobile_resource_create-content input[type=checkbox]").each(function() {
                        $(this).attr('checked', false)
                        $(this).prev().removeClass('ui-checkbox-on').addClass('ui-checkbox-off')
                        $(this).attr("data-cacheval", true);
                    })
                }

            }).on('click', '#mobile_resource_back', function(event) {
                event.preventDefault();
                if (self.model_view == '1') {
                    self.model_view = '0';
                    var people_selected = _.compact(_.map($("#mobile_resource_create-content input[type=checkbox]:checked"), function(x) {
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
                localStorage.removeItem('upload_model_back'); //先清掉
                var next_url = '#upload_pic';
                localStorage.setItem('upload_model', JSON.stringify({
                    model: self.model,
                    field: 'attachments',
                    back_url: window.location.hash
                }))
                window.location.href = next_url;

            }).on('change', 'select[name="mobile_resource_type"]', function(event) {
                event.preventDefault();
                self.mr_type = $(this).val();
                self.render();
            })
        }


    });

    // Returns the View class
    return MobileCreateView;

});