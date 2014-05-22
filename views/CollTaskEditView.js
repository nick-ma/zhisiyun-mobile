// CollTask Edit View
// =================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars"],
    function($, _, Backbone, Handlebars) {

        // Extends Backbone.View
        var CollTaskEditView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                var self = this;
                this.template = Handlebars.compile($("#hbtmp_coll_task_edit_view").html());
                // The render method is called when CollTask Models are added to the Collection
                // this.collection.on("sync", this.render, this);
                // bind event
                self.bind_event();
            },

            // Renders all of the CollTask models on the UI
            render: function() {

                var self = this;
                self.ct_id = self.model.get('_id') || null;
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

                $("#colltask_edit-content").html(self.template(self.model.toJSON()));
                $("#colltask_edit-content").trigger('create');
                return this;

            },
            bind_event: function() {
                var self = this;
                $("#colltask_edit-content")
                    .on('click', '#btn-ct-remove', function(event) {
                        // event.preventDefault();
                        /* Act on the event */
                    })
                    .on('click', '#btn-ct-save', function(event) {
                        // event.preventDefault();
                        // self.model.set('task_name', $("#ct_task_name").val());
                        if (self.model.isValid()) {
                            self.model.save().done(function() { //保存
                                alert('任务保存成功')
                                window.setTimeout(function() {
                                    var next_page = "#colltask_detail/" + self.model.get('_id');
                                    window.location.href = next_page;
                                }, 100);
                            })
                        } else {
                            alert(self.model.validationError);
                        }
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
        return CollTaskEditView;

    });