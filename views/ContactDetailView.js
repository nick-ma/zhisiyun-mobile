// Contact Detail View
// ===================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "models/PeopleModel"],
    function($, _, Backbone, Handlebars, PeopleModel) {

        // Extends Backbone.View
        var ContactDetailView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                this.template = Handlebars.compile($("#hbtmp_contact_detail_view").html());
                // The render method is called when People Models are added to the Collection
                // this.collection.on("sync", this.render, this);
                this.bind_event();
            },

            // Renders all of the People models on the UI
            render: function() {

                var self = this;
                var contact_detail_back_url = localStorage.getItem('contact_detail_back_url') || '#contact_list';
                // console.log(localStorage.getItem('contact_detail_back_url'));
                // console.log(contact_detail_back_url);
                localStorage.removeItem('contact_detail_back_url');
                $("#btn-contact_detail-back").attr('href', contact_detail_back_url);
                $("#contact_detail-content").html(self.template(self.model.toJSON()));
                $("#contact_detail-content").trigger('create');
                //对自己不显示发起聊天的按钮
                if ($("#login_people").val() == self.model.get('_id')) {
                    $("#contact_detail-content").find('#btn_start_userchat').hide();
                };
                return this;

            },

            bind_event: function() {
                var self = this;
                $("#contact_detail-content")
                    .on('click', '#btn_start_userchat', function(event) {
                        event.preventDefault();
                        var url = "im://userchat/" + self.model.get('_id');
                        console.log(url);
                        window.location.href = url;
                    })
                    .on('click', '#btn_add_to_favorite', function(event) {
                        event.preventDefault();
                        var url = "/admin/masterdata/people/add_to_my_favorite";
                        var post_data = {
                            people_id: self.model.get('_id'),
                        };
                        $.post(url, post_data, function(data) {
                            alert('操作成功')
                            self.model.collection.fetch().done(function() {
                                // to do
                            });
                        }).fail(function(err) {
                            alert('操作失败')
                        })

                    })
                    .on('click', '#btn_remove_from_favorite', function(event) {
                        event.preventDefault();
                        var url = "/admin/masterdata/people/remove_from_my_favorite";
                        var post_data = {
                            people_id: self.model.get('_id'),
                        };
                        $.post(url, post_data, function(data) {
                            alert('操作成功')
                            self.model.collection.fetch().done(function() {
                                // to do
                            });
                        }).fail(function(err) {
                            alert('操作失败')
                        })

                    });
            }

        });

        // Returns the View class
        return ContactDetailView;

    });