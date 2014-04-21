// Home Objective Part View
// =========================

define(["jquery", "underscore", "backbone", "handlebars",
        "collections/ObjectiveCollection",
    ],
    function($, _, Backbone, Handlebars, ObjectiveCollection) {
        var HomeObjectiveView = Backbone.View.extend({
            initialize: function() {
                this.template = Handlebars.compile($("#hbtmp_home_objective_view").html());
                this.collection.on("sync", this.render, this);
            },
            render: function() {
                var self = this;

                var rendered = '';
                var render_data = _.map(this.collection.models, function(x) {
                    return x.toJSON();
                })
                // console.log(render_data);
                rendered = self.template({
                    ols: render_data
                });
                // console.log(rendered);
                // _.each(this.collection.models,function  (x) {
                //     // console.log(x);
                //     rendered.push(self.template(x.attributes));
                // })
                // console.log(rendered);
                $("#home-objective-num").html(this.collection.length);
                $("#home-objective-list").html(rendered);
                $("#home-objective-list").trigger('create');
                return this;
            }
        });

        return HomeObjectiveView;
    });