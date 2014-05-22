// CollProject Edit View
// =================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars"],
    function($, _, Backbone, Handlebars) {

        // Extends Backbone.View
        var CollProjectEditView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                var self = this;
                this.template = Handlebars.compile($("#hbtmp_coll_project_edit_view").html());
                // The render method is called when CollProject Models are added to the Collection
                // this.collection.on("sync", this.render, this);
                // bind event
                self.bind_event();
            },

            // Renders all of the CollProject models on the UI
            render: function() {

                var self = this;
                // self.ct_id = self.model.get('_id') || null;
                // var rendered = ;
                // var render_data = {
                //         cts: _.sortBy(_.map(this.collection.models, function(x) {
                //             return x.toJSON();
                //         }), function(x) {
                //             return x.fl;
                //         })
                //     }
                // _.each(this.collection.models, function(x) {
                //     x.attributes.pi_count = x.attributes.qualitative_pis.items.length + x.attributes.quantitative_pis.items.length;
                //     rendered.push(self.template(x.attributes));
                // });
                // self.template(render_data);

                $("#collproject_edit-content").html(self.template(self.model.toJSON()));
                $("#collproject_edit-content").trigger('create');

                return this;

            },
            bind_event: function() {
                var self = this;
                $("#collproject_edit-content")
                    .on('click', '#btn-cp-save', function(event) {
                        // event.preventDefault();
                        // self.model.set('task_name', $("#ct_task_name").val());
                        if (self.model.isValid()) {
                            self.model.save().done(function() { //保存
                                alert('项目保存成功')
                                window.setTimeout(function() {
                                    var next_page = "#collproject/" + self.ct_id + "/" + self.model.get('_id');
                                    window.location.href = next_page;
                                }, 100);
                            })
                        } else {
                            alert(self.model.validationError);
                        }
                    })
                    .on('click', '#btn-cp-remove', function(event) {
                        // event.preventDefault();
                        // self.model.set('task_name', $("#ct_task_name").val());
                        if (confirm('确认删除项目吗？\n一旦删除，所有与之关联的任务将自动解除关联！')) {
                            var col_cp = self.model.collection;
                            // col_cp.remove(self.model);
                            // col_cp.trigger('sync');
                            self.model.destroy().done(function() { //保存
                                alert('项目删除成功')
                                window.setTimeout(function() {
                                    var next_page = "#collproject/" + self.ct_id + "/";
                                    window.location.href = next_page;
                                }, 100);
                            })
                        };

                    })
                    .on('change', 'input, textarea', function(event) {
                        event.preventDefault();
                        var $this = $(this);
                        var field = $this.data('field');
                        var value = $this.val();
                        self.model.set(field, value);
                    });
            }

        });

        // Returns the View class
        return CollProjectEditView;

    });