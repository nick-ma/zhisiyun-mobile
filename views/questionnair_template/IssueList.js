// ToDo View
// =============

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "async"], function($, _, Backbone, Handlebars, async) {
    function save_data(self) {
        self.model.save(self.model.attributes).done(function(data) {
            self.model.fetch().done(function() {
                self.render();

            })
        })
    }

    var Quesetionnaire_Template_IssueView = Backbone.View.extend({
        // The View Constructor
        initialize: function() {
            this.quesetionnaire_template_issue = Handlebars.compile($("#quesetionnaire_template_issue_view").html());
            this.loading_template = Handlebars.compile($("#loading_template_view").html());
            this.people_select_template = Handlebars.compile($("#im_people_select_view").html());
            this.quesetionnaire_template_issue_pps = Handlebars.compile($("#quesetionnaire_template_issue_pps_view").html());

            this.model_view = '0';
            this.pps = [];
            this.bind_event();
        },
        pre_render: function() {
            var self = this;
            $("#quesetionnaire_template_issue_list-content").html(self.loading_template({
                info_msg: '数据加载中...请稍候'
            }));
            $("#quesetionnaire_template_issue_list-content").trigger('create');
            return this;
        },
        // Renders all of the Task models on the UI
        render: function() {
            var self = this;

            // self.qt_issue_back_url = localStorage.getItem('qt_issue_back_url') || null;
            // self.model.set('back_url', self.qt_issue_back_url);
            // if (self.qt_issue_back_url) { //有才设，没有则保持不变
            $("#btn-quesetionnaire_template_issue_list-back").attr('href', localStorage.getItem('qt_issue_back_url'));
            // }
            $("#quesetionnaire_template_issue_list #btn-quesetionnaire_template_issue_left-back").removeClass('ui-icon-back ui-icon-check').addClass('ui-icon-home')
            if (self.model_view == '0') {
                $("#quesetionnaire_template_issue_list #btn-quesetionnaire_template_issue_list-back").addClass('ui-icon-back btn_back_home').removeClass('ui-icon-check ui-icon-delete')
                rendered_data = self.quesetionnaire_template_issue(self.model.attributes);
            } else if (self.model_view == '1') {
                $("#quesetionnaire_template_issue_list #btn-quesetionnaire_template_issue_list-back").removeClass('ui-icon-back ui-icon-delete btn_back_home').addClass('ui-btn-icon-notext ui-icon-check')

                rendered_data = self.people_select_template({
                    people: self.model.peoples
                });
            } else if (self.model_view == '2') {
                $("#quesetionnaire_template_issue_list #btn-quesetionnaire_template_issue_left-back").removeClass('ui-icon-back ui-icon-home go-home').addClass('ui-icon-back')
                $("#quesetionnaire_template_issue_list #btn-quesetionnaire_template_issue_list-back").removeClass('ui-icon-back ui-btn-icon-notext ui-icon-check btn_back_home').addClass('ui-btn-icon-notext ui-icon-delete')
                rendered_data = self.quesetionnaire_template_issue_pps({
                    pps: self.pps
                });
            };
            $("#quesetionnaire_template_issue_list-content").html(rendered_data);
            $("#quesetionnaire_template_issue_list-content").trigger('create');
            return self;
        },
        bind_event: function() {
            var self = this
            var bool = true;
            $("#quesetionnaire_template_issue_list").on('click', '#show_peoples', function(event) {
                $.mobile.loading("show");
                self.model_view = '1';
                self.render();
                $.mobile.loading("hide");
            }).on('click', '#show_issued_peoples', function(event) {
                $.mobile.loading("show");
                $.get('/admin/pm/questionnair_template/qi_bb/' + self.model.get('_id'), function(data) {
                    self.pps = data
                    self.model_view = '2';
                    self.render();
                    $.mobile.loading("hide");
                })

            }).on('change', '#checked_all_people', function(event) {
                event.preventDefault();
                var bool = ($(this).attr('data-cacheval') == 'true' ? false : true);
                if (bool) {
                    var set = $("#quesetionnaire_template_issue_list-content input[type=checkbox]").each(function() {
                        $(this).attr('checked', true)
                        $(this).prev().removeClass('ui-checkbox-off').addClass('ui-checkbox-on')
                        $(this).attr("data-cacheval", false);
                    })
                } else {
                    var set = $("#quesetionnaire_template_issue_list-content input[type=checkbox]").each(function() {
                        $(this).attr('checked', false)
                        $(this).prev().removeClass('ui-checkbox-on').addClass('ui-checkbox-off')
                        $(this).attr("data-cacheval", true);
                    })
                }

            }).on('click', '.ui-icon-delete', function(event) {
                event.preventDefault();
                var people_selected = _.compact(_.map($("#quesetionnaire_template_issue_list-content input[type=checkbox]:checked"), function(x) {
                    return x.value
                }));
                if (people_selected.length == 0) {
                    alert("请选择要删除的数据！");
                } else {
                    // if (confirm('确认删除吗？\n删除成功后将返回发布界面')) {
                    //     $.mobile.loading("show");
                    //     $.post('/admin/pm/questionnair_template/qt_delete', {
                    //         qi_id: JSON.stringify(people_selected)
                    //     }, function(data) {
                    //         if (data.code == 'OK') {
                    //             self.model_view = '0';
                    //             self.render();
                    //             $.mobile.loading("hide");
                    //         };

                    //     })

                    // }

                    my_confirm('确认删除吗？\n删除成功后将返回发布界面', null, function() {
                        $.mobile.loading("show");
                        $.post('/admin/pm/questionnair_template/qt_delete', {
                            qi_id: JSON.stringify(people_selected)
                        }, function(data) {
                            if (data.code == 'OK') {
                                self.model_view = '0';
                                self.render();
                                $.mobile.loading("hide");
                            };

                        })
                    })



                }
            }).on('click', '.ui-icon-check', function(event) {
                event.preventDefault();
                var people_selected = _.compact(_.map($("#quesetionnaire_template_issue_list-content input[type=checkbox]:checked"), function(x) {
                    var f_d = _.find(self.model.peoples, function(pp) {
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
                self.model_view = '0';
                self.model.set('select_pps', people_selected);
                self.render();

            }).on('change', 'input[type="text"]', function(event) {
                event.preventDefault();
                self.model.set('days', $(this).val());
            }).on('click', '#btn-ssue-save', function(event) {
                event.preventDefault();
                var days = $("#quesetionnaire_template_issue_list-content #days").val();
                if (!days) {
                    alert('请填写回收天数！')
                    return false;
                };
                var re = /^[1-9]+[0-9]*]*$/;
                if (!re.test(days)) {
                    alert('回收天数为正整数！')
                    return false;
                };

                if (!self.model.get('select_pps') || self.model.get('select_pps').length == 0) {
                    alert('请选择发布对象！')
                    return false;
                };
                // if (confirm('确认发布吗？\n发布成功将转到模版管理！')) {
                //     var url = '/admin/pm/questionnair_template/common_release';

                //     var pps = _.map(self.model.get('select_pps'), function(pp) {
                //         return pp._id
                //     })

                //     var post_data = {
                //         qt_id: self.model.get('_id'),
                //         recycling_days: days,
                //         user_ids: pps.join(',')
                //     };
                //     $.mobile.loading("show");

                //     $.post(url, post_data, function(data) {
                //         if (data.code == 'OK') {
                //             $.mobile.loading("hide");
                //             alert('问卷发布成功！')
                //             window.location.href = localStorage.getItem('qt_issue_back_url')
                //         };
                //     }).fail(function() {
                //         $.mobile.loading("hide");
                //         alert('问卷发布失败！')
                //     });
                // }


                my_confirm('确认发布吗？\n发布成功将转到模版管理！', null, function() {
                    var url = '/admin/pm/questionnair_template/common_release';

                    var pps = _.map(self.model.get('select_pps'), function(pp) {
                        return pp._id
                    })

                    var post_data = {
                        qt_id: self.model.get('_id'),
                        recycling_days: days,
                        user_ids: pps.join(',')
                    };
                    $.mobile.loading("show");

                    $.post(url, post_data, function(data) {
                        if (data.code == 'OK') {
                            $.mobile.loading("hide");
                            setTimeout(function() {
                                alert('问卷发布成功！', function() {
                                    window.location.href = localStorage.getItem('qt_issue_back_url')
                                });
                            }, 1000);

                        };
                    }).fail(function() {
                        $.mobile.loading("hide");
                        setTimeout(function() {
                            alert('问卷发布失败！');
                        }, 100);
                    });
                })



            }).on('click', '#btn-quesetionnaire_template_issue_left-back', function(event) {
                if (self.model_view == '0') {
                    window.location.href = '#'
                } else {
                    self.model_view = '0';
                    self.render();
                }
            }).on('click', '.btn_back_home', function(event) {
                if (self.model_view == '0') {
                    window.location.href = localStorage.getItem('qt_issue_back_url')
                } else {
                    self.model_view = '0';
                    self.render();
                }
            })



        },

    });

    // Returns the View class
    return Quesetionnaire_Template_IssueView;

});