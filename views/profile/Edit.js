// MyProfile  View
// ===================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "../../models/PeopleModel"],
    function($, _, Backbone, Handlebars, PeopleModel) {

        // Extends Backbone.View
        var MyProfileEdit = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                this.template_01 = Handlebars.compile($("#hbtmp_myprofile_basic_edit_01_view").html());
                this.template_02 = Handlebars.compile($("#hbtmp_myprofile_basic_edit_02_view").html());
                this.template_03 = Handlebars.compile($("#hbtmp_myprofile_basic_edit_03_view").html());
                this.template_04 = Handlebars.compile($("#hbtmp_myprofile_basic_edit_04_view").html());
                this.edit_mode = '01';
                this.bind_events();
                this.update_people_url = "/admin/masterdata/people/people_update4m";
                this.update_password_url = "/profile/password";
            },

            // Renders all of the People models on the UI
            render: function() {
                var self = this;
                var render_data = self.model.toJSON();
                if (self.edit_mode == '01') {
                    $("#myprofile_edit_01-content").html(self.template_01(render_data));
                    $("#myprofile_edit_01-content").trigger('create');
                } else if (self.edit_mode == '03') {
                    $("#myprofile_edit_03-content").html(self.template_03({}));
                    $("#myprofile_edit_03-content").trigger('create');
                };

                return this;
            },
            bind_events: function() {
                var self = this;
                $("#myprofile_edit_01-content").on('click', '#btn-profile-save', function(event) {
                    event.preventDefault();
                    var data4post = {
                        people_id: self.model.get('_id')
                    };
                    _.each($("#myprofile_edit_01-content").find('input'), function(x) {
                        var $x = $(x);
                        if ($x.data('field')) {
                            data4post[$x.data('field')] = $x.val();
                        };
                    })
                    $.post(self.update_people_url, data4post, function(data) {
                        if (data) {
                            alert(data.msg);
                        };
                    })
                });

                $("#myprofile_edit_03-content").on('click', '#btn-profile-save', function(event) {
                    event.preventDefault();
                    //校验输入
                    var old_pwd = $("#myprofile_edit_03-content").find('#old_pwd').val();
                    var new_pwd = $("#myprofile_edit_03-content").find('#new_pwd').val();
                    var new_pwd2 = $("#myprofile_edit_03-content").find('#new_pwd2').val();
                    if (!old_pwd) {
                        alert('请输入原密码');
                        return;
                    };
                    if (new_pwd != new_pwd2) {
                        alert('两次输入的新密码不一致');
                        return;
                    };
                    if (new_pwd.length < 6) {
                        alert('新密码长度太短');
                        return;
                    };
                    var data4post = {
                        old_password: old_pwd,
                        password: new_pwd
                    };
                    $.post(self.update_password_url, data4post, function(data) {
                        if (data) {
                            alert(data.msg);
                        };
                    })

                });
            }

        });

        // Returns the View class
        return MyProfileEdit;

    });