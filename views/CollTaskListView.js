// CollTask List View
// =================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars"],
    function($, _, Backbone, Handlebars) {

        // Extends Backbone.View
        var CollTaskListView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                this.template = Handlebars.compile($("#hbtmp_coll_task_list_view").html());
                // The render method is called when CollTask Models are added to the Collection
                this.collection.on("sync", this.render, this);

            },

            // Renders all of the CollTask models on the UI
            render: function() {

                var self = this;

                // var rendered = ;
                var render_data = {
                    cts: _.sortBy(_.map(_.filter(self.collection.models, function(x) {
                        return !x.get('isfinished');
                    }), function(x) {
                        return x.toJSON();
                    }), function(x) {
                        return new Date(x.end);
                    }),
                    cts_finished: _.sortBy(_.map(_.filter(self.collection.models, function(x) {
                        return x.get('isfinished');
                    }), function(x) {
                        return x.toJSON();
                    }), function(x) {
                        return -new Date(x.end);
                    })
                };
                _.each(render_data.cts, function(x) {
                    x.sub_task_num = _.filter(self.collection.models, function(y) {
                        return y.get('p_task') == x._id
                    }).length;
                });
                _.each(render_data.cts_finished, function(x) {
                    x.sub_task_num = _.filter(self.collection.models, function(y) {
                        return y.get('p_task') == x._id
                    }).length;
                });
                // _.each(this.collection.models, function(x) {
                //     x.attributes.pi_count = x.attributes.qualitative_pis.items.length + x.attributes.quantitative_pis.items.length;
                //     rendered.push(self.template(x.attributes));
                // });
                // self.template(render_data);
                $("#colltask-content").html(self.template(render_data));
                $("#colltask-content").trigger('create');
                return this;

            }

        });

        // Returns the View class
        return CollTaskListView;

    });