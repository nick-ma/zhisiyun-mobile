// ToDo View
// =============

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "async", "moment"], function($, _, Backbone, Handlebars, async, moment) {
    Handlebars.registerHelper('mark', function(data) {
        var mark = {
            'START': '流程开始',
            'RUNNING': '流程执行中 ',
            'END': '审批结束',
            'SUSPEND': '流程挂起',
            'TERMINATE': '流程终止',
            'DELETE': '流程删除'
        }
        return mark[data]
    });
    Handlebars.registerHelper('rp', function(data) {
        var str = '无假期类型'
        if (data) {
            str = data;
        };
        return str
    });
    Handlebars.registerHelper('show_date', function(st, ed) {
        var s = (st) ? moment(st).format('YYYY-MM-DD') : '';
        var e = (ed) ? moment(ed).format('YYYY-MM-DD') : '';
        if (s && e) {
            return s + '~' + e
        };

    });
    Handlebars.registerHelper('num', function(data) {
        var num = 0;
        if (data) {
            num = data
        };
        return num;
    });


    var AbsenceListView = Backbone.View.extend({
        // The View Constructor
        initialize: function() {
            // console.log(this);
            this.leave_template = Handlebars.compile($("#leaveofabsence_view_shwon").html());
            this.leave_details_template = Handlebars.compile($("#leave_details_view").html());
            this.leaves_list_template = Handlebars.compile($("#leaves_list_view").html());
            this.bind_event();
            this.model_view = '0';
        },
        // Renders all of the Task models on the UI
        render: function() {
            $("#leaveofabsence_name").html('假期查看')
            var self = this;
            var rendered_data = '';

            if (self.model_view == '0') {
                if (self.obj.leave.leaves.length) {
                    var first_data = _.first(self.obj.leave.leaves);
                    var last_data = _.last(self.obj.leave.leaves);
                    self.obj.leave.is_start = first_data.is_full_day
                    self.obj.leave.is_start_time = moment(first_data.start_date).format('YYYY-MM-DD') + ' ' + first_data.time_zone_s
                    self.obj.leave.is_last = last_data.is_full_day
                    self.obj.leave.is_end_time = moment(first_data.end_date).format('YYYY-MM-DD') + ' ' + first_data.time_zone_e
                };
                rendered_data = self.leave_template(self.obj);

            } else if (self.model_view == '1') {
                $("#leaveofabsence_name").html('假期累计明细');


                rendered_data = self.leave_details_template(self.obj);
            } else if (self.model_view == '2') {
                $("#leaveofabsence_name").html('请假明细');
                rendered_data = self.leaves_list_template(self.obj);
            }



            // console.log(self.collection.toJSON())
            $("#leave_view_list-content").html(rendered_data);
            $("#leave_view_list-content").trigger('create');
            var absence_code = self.obj.leave.absence_code
            if (absence_code == '001' || absence_code == '005') {
                $("#balance_show,#history").show();
                $("#detail_show,#ration_show").hide();

                $('#leave_balance').val(self.obj.leave.leave_balance + '小时')
            } else if (absence_code == '003' || absence_code == '002') {
                $("#detail_show,#history").show();
                $("#balance_show,#ration_show").hide();

                $('#aggregate_value').val(self.obj.leave.aggregate_value)

            } else if (absence_code == '004') {
                $("#ration_show,#history").show();
                $("#balance_show,#detail_show").hide();
                $("#ration").val(self.obj.leave.ration + '小时')


            } else {
                $("#balance_show,#detail_show,#ration_show").hide();
            }



            return self;
        },
        bind_event: function() {
            var self = this
            var bool = true;
            $("#leave_view_list").on('click', '#leave_details_show', function(event) {
                self.model_view = '1'
                self.render();
            }).on('click', '#leaves_list', function(event) {
                self.model_view = '2'
                self.render();
            }).on('click', '#btn-view_list-back', function(event) {
                if (self.model_view != '0') {
                    self.model_view = '0'
                    self.render();
                } else {
                    window.location.href = "/m#leave_list"
                }
            }).on('click', '#btn-create_back_leave', function(event) {
                var leave_id = $(this).attr('leave_id');
                if (confirm('确定启动消假流程 ？')) {
                    // window.location.href = '#back_leave_form_t/' + leave_id
                    console.log(leave_id)
                    $.post('/admin/tm/wf_back_after_leave_of_absence/bb/' + null, {
                        leave_id: leave_id
                    }, function(data) {
                        if (data) {
                            window.location.href = '#back_leave_form_t/' + data.ti + '/T'
                        };

                    })
                };
            }).on('click', 'img', function(event) {
                event.preventDefault();
                // var img_view = '<div class="img_view" style="background-image:url('+this.src+')"></div>';
                var img_view = '<img src="' + this.src + '">';
                // img_view += '<a href="'+this.src.replace('get','download')+'" target="_blank">保存到本地</a>';
                $("#fullscreen-overlay").html(img_view).fadeIn('fast');
            })

        },

    });

    // Returns the View class
    return AbsenceListView;

});