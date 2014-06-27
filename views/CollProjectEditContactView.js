// CollProject Edit Contact View
// =============================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars"],
    function($, _, Backbone, Handlebars) {

        // Extends Backbone.View
        var CollProjectEditContactView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                var self = this;
                this.template = Handlebars.compile($("#hbtmp_coll_project_edit_view_contact").html());
                // The render method is called when CollProject Models are added to the Collection
                // this.collection.on("sync", this.render, this);
                // bind event
                self.bind_event();
            },

            // Renders all of the CollProject models on the UI
            render: function() {

                var self = this;
                var contacts = self.model.get('contacts')
                var render_data = {
                    contact: contacts[self.index]
                };
                // $("#btn-collproject_edit-back").attr('href', "#collproject/" + self.ct_id + "/" + self.model.get('_id'));
                $("#collproject_edit_contact-content").html(self.template(render_data));
                $("#collproject_edit_contact-content").trigger('create');

                return this;

            },
            bind_event: function() {
                var self = this;
                $("#collproject_edit_contact")
                    .on('click', '#btn-cp-contact-save', function(event) {
                        // event.preventDefault();
                        // self.model.set('task_name', $("#ct_task_name").val());
                        if (self.model.isValid()) {
                            self.model.save().done(function() { //保存
                                alert('项目保存成功')
                                window.setTimeout(function() {
                                    var next_page = "#collproject_detail/" + self.model.get('_id');
                                    window.location.href = next_page;
                                }, 100);
                            })
                        } else {
                            alert(self.model.validationError);
                        }
                    })
                $("#collproject_edit_contact-content")
                    .on('change', 'input, textarea, select', function(event) {
                        event.preventDefault();
                        var $this = $(this);
                        var field = $this.data('field');
                        var value = $this.val();
                        var contacts = self.model.get('contacts')
                        contacts[self.index][field] = value;
                        self.model.set('contacts', contacts);
                    })

            }

        });

        // Returns the View class
        return CollProjectEditContactView;

    });