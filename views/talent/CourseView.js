// PeopleSelectt View
// =================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars"],
    function($, _, Backbone, Handlebars) {
        // Extends Backbone.View
        var CourseSelectView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                this.template = Handlebars.compile($("#hbtmp_course_select_view").html());
                this.bind_event();
            },

            // Renders all of the PeopleSelectels on the UI
            render: function() {

                var self = this;
                var course = _.map(self.collection.models, function(x) {
                    return x.toJSON();
                })
                var render_data = {
                    course: course,
                }
                $("#course_select-content").html(self.template(render_data));
                var sph = JSON.parse(localStorage.getItem('course_helper'));
                if (sph.course) {
                    var $container = $("#course_select-content");
                    _.each(sph.course, function(x) {
                        $container.find("#cb-" + x.course).attr('checked', true);
                    })
                };
                $("#course_select-content").trigger('create');

                window.setTimeout(function() {
                    if ($("#course_select-content input:checked").length && $("#course_select-content input:checked").offset().top > 75) {
                        $.mobile.silentScroll($("#course_select-content input:checked").offset().top - 95)
                    }
                }, 1000);
                return this;

            },
            bind_event: function() {
                var self = this;
                $("#course_select").on('click', '#btn-course_select-back', function(event) {
                    event.preventDefault();
                    //获取相关的helper数据
                    var sph = JSON.parse(localStorage.getItem('course_helper'));
                    window.location.href = sph.back_url; //返回调用界面
                }).on('click', '#btn-course_select-ok', function(event) {
                    event.preventDefault();
                    var people_selected = _.map($("#course_select-content input[type=checkbox]:checked"), function(x) {
                        return self.collection.get(x.value);
                    }); //获取相关的helper数据
                    var sph = JSON.parse(localStorage.getItem('course_helper'));
                    // sph.model = _.map(people_selected, function(x) {
                    //     return _.pick(x.toJSON(), ['_id', 'c_name', 'c_lecturer', 'duration', 'integral']);
                    // }) //写回去
                    _.each(people_selected, function(x) {
                        var x_data = x.toJSON();
                        var is_exist = _.find(sph.model, function(temp) {
                            return temp.course == String(x_data._id)
                        })
                        if (!is_exist) {
                            if (!sph.model) {
                                sph.model = [];
                            }
                            sph.model.push({
                                course: x_data._id,
                                c_name: x_data.c_name,
                                c_lecturer: x_data.c_lecturer,
                                target_url: x_data.target_url,
                                duration: x_data.duration,
                                integral: x_data.integral,
                                creator: $("#login_people").val(),
                                c_start: sph.c_start,
                                c_end: sph.c_end,
                                is_delete: true,
                                is_edit: true

                            })
                        }
                    })
                    localStorage.setItem('course_helper_back', JSON.stringify(sph));
                    window.location.href = sph.back_url; //返回调用界面
                })

            },

        });

        // Returns the View class
        return CourseSelectView;

    });