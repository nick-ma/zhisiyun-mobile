// CollProject Edit Contact View
// =============================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "../../models/ContactModel"],
    function($, _, Backbone, Handlebars, ContactModel) {

        // Extends Backbone.View
        var CollProjectEditContactView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                var self = this;
                // this.template = Handlebars.compile($("#hbtmp_coll_project_edit_view_contact").html());
                // The render method is called when CollProject Models are added to the Collection
                // this.collection.on("sync", this.render, this);
                // bind event
                self.bind_event();
            },

            // Renders all of the CollProject models on the UI
            render: function() {

                var self = this;
                if (self.view_mode) {
                    self.template = Handlebars.compile($("#contact_list_view").html());
                    var rendered_data = [];
                    _.each(self.contacts_data, function(x) {
                        return rendered_data.push(x.attributes);
                    })
                    var data = {};
                    data.cs = rendered_data;
                    $("#collproject_edit_contact-content").html(self.template(data));
                    $("#collproject_edit_contact-content").trigger('create');
                } else {
                    var contacts = self.model.get('contacts')
                    var render_data = {
                        contact: contacts[self.index]
                    };
                    self.template = Handlebars.compile($("#hbtmp_coll_project_edit_view_contact").html());
                    $("#collproject_edit_contact-content").html(self.template(render_data));
                    $("#collproject_edit_contact-content").trigger('create');
                }
                return this;

            },
            bind_event: function() {
                var self = this;
                $("#collproject_edit_contact")
                    .on('click', '#btn-cp-contact-save', function(event) {
                        if (self.view_mode) { //联系人库选择联系人
                            var up_id = $("input[name='contact_radios']:checked").val();
                            var c = _.find(self.contacts_data, function(x) {
                                return x.attributes._id.toString() == up_id;
                            })
                            var contacts = self.model.get('contacts')
                            var cont = contacts[self.index];
                            cont.contact = c.attributes._id;
                            cont.name = c.attributes.name;
                            cont.role = c.attributes.role;
                            cont.company = c.attributes.company;
                            cont.company_role = c.attributes.company_role;
                            cont.position = c.attributes.position;
                            cont.tel = c.attributes.tel;
                            cont.cell = c.attributes.cell;
                            cont.email = c.attributes.email;
                            cont.address = c.attributes.address;
                            cont.comment = c.attributes.comment;
                            self.model.save().done(function() { //保存
                                var next_page = "#collproject_detail/" + self.model.get('_id');
                                window.location.href = next_page;
                            })
                        } else {
                            self.$el.find('select').trigger('change');
                            if (self.model.isValid()) {
                                //先同步联系人库
                                var contacts = self.model.get('contacts')
                                var cont = contacts[self.index];
                                //判断是修改还是新增
                                if (cont.contact) {
                                    c = self.c_contacts.get(cont.contact);
                                    var cid = c.attributes._id;
                                    var coll_projects = c.attributes.coll_projects;

                                    c.attributes = cont;
                                    c.attributes._id = cid;
                                    var cp = _.find(coll_projects, function(x) {
                                        return x.toString() == self.model.attributes._id.toString();
                                    })
                                    if (!cp) {
                                        coll_projects.push(self.model.attributes._id);
                                    }
                                    c.attributes.coll_projects = coll_projects;
                                } else {
                                    c = new ContactModel();
                                    c.attributes = cont;
                                    c.attributes.coll_projects = [];
                                    c.attributes.coll_projects.push(self.model.attributes._id);
                                }

                                c.save().done(function() {
                                    self.model.save().done(function() { //保存
                                        // alert('项目保存成功')
                                        // window.setTimeout(function() {
                                        var next_page = "#collproject_detail/" + self.model.get('_id');
                                        window.location.href = next_page;
                                        // }, 100);
                                    })
                                });
                            } else {
                                alert(self.model.validationError);
                            }
                        }
                    })
                    .on('click', '#btn_clib_add_contact', function(event) {
                        event.preventDefault();
                        self.contacts_data = _.filter(self.c_contacts.models, function(x) {
                            return x.attributes.is_show;
                        });
                        if (self.contacts_data.length) {
                            self.view_mode = 'contact_lib';
                            self.render();
                        } else {
                            alert('联系人库中没有记录!');
                        }
                    })
                $("#collproject_edit_contact-content")
                    .on('change', 'input, textarea, select', function(event) {
                        event.preventDefault();

                        var $this = $(this);
                        var field = $this.data('field');
                        var value = $this.val();
                        //检查联系人库是否存在，如存在则提示用户
                        var fields = ['name', 'tel', 'cell'];
                        if (fields.indexOf(field) != -1) {
                            self.contacts_data = _.filter(self.c_contacts.models, function(x) {
                                return x.attributes[field] == value && x.attributes.is_show;
                            })
                            if (self.contacts_data.length) {
                                my_confirm('在联系人库中匹配到' + self.contacts_data.length + '条记录,是否应用?', null, function() {
                                    self.view_mode = 'contact_lib';
                                    self.render();
                                })
                            }
                        }
                        var contacts = self.model.get('contacts')
                        contacts[self.index][field] = value;
                        self.model.set('contacts', contacts);
                    })

            }

        });

        // Returns the View class
        return CollProjectEditContactView;

    });