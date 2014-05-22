// CollProject List View
// =================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars"],
    function($, _, Backbone, Handlebars) {

        // Extends Backbone.View
        var CollProjectListView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                this.template = Handlebars.compile($("#hbtmp_coll_project_list_view").html());
                // The render method is called when CollProject Models are added to the Collection
                this.collection.on("sync", this.render, this);
                this.bind_event();
            },

            // Renders all of the CollProject models on the UI
            render: function() {

                var self = this;

                // var rendered = ;
                // var render_data = {
                //     cts: _.sortBy(_.map(_.filter(self.collection.models, function(x) {
                //         return !x.get('isfinished');
                //     }), function(x) {
                //         return x.toJSON();
                //     }), function(x) {
                //         return -new Date(x.end);
                //     }),
                //     cts_finished: _.sortBy(_.map(_.filter(self.collection.models, function(x) {
                //         return x.get('isfinished');
                //     }), function(x) {
                //         return x.toJSON();
                //     }), function(x) {
                //         return -new Date(x.end);
                //     })
                // };
                // _.each(render_data.cts, function(x) {
                //     x.sub_task_num = _.filter(self.collection.models, function(y) {
                //         return y.get('p_task') == x._id
                //     }).length;
                // });
                // _.each(render_data.cts_finished, function(x) {
                //     x.sub_task_num = _.filter(self.collection.models, function(y) {
                //         return y.get('p_task') == x._id
                //     }).length;
                // });
                // _.each(this.collection.models, function(x) {
                //     x.attributes.pi_count = x.attributes.qualitative_pis.items.length + x.attributes.quantitative_pis.items.length;
                //     rendered.push(self.template(x.attributes));
                // });
                // self.template(render_data);

                var render_data = {
                    projects: _.map(self.collection.models, function(x) {
                        return x.toJSON();
                    }),
                    cp_id: self.cp_id,
                }

                $("#btn-collproject_list-add").attr('href', '#collproject_edit/add/' + self.ct_id);

                $("#collproject_list-content").html(self.template(render_data));
                $("#collproject_list-content").trigger('create');
                return this;

            },
            bind_event: function() {
                var self = this;
                $("#collproject_list-content")
                    .on('click', '#btn-cp-select', function(event) {
                        event.preventDefault();
                        var selected = $("#collproject_list-content input[type=radio]:checked").val();
                        if (!selected) {
                            alert('请选择一个项目');
                        } else {
                            // set ct model's attributes
                            self.ct_model.set('cp', selected);
                            self.ct_model.set('cp_name', self.collection.get(selected).get('project_name'));
                            window.location.href = '#colltask_edit/' + self.ct_id;
                        };
                    })
                    .on('click', '#btn-cp-unlink', function(event) {
                        event.preventDefault();

                        self.ct_model.set('cp', null);
                        self.ct_model.set('cp_name', '');
                        window.location.href = '#colltask_edit/' + self.ct_id;

                    })
                $("#btn-collproject_list-edit").on('click', function(event) {
                    event.preventDefault();
                    var selected = $("#collproject_list-content input[type=radio]:checked").val();
                    if (!selected) {
                        alert('请选择一个项目');
                    } else {
                        window.location.href = '#collproject_edit/' + selected + '/' + self.ct_id;
                    };
                });
            },

        });

        // Returns the View class
        return CollProjectListView;

    });