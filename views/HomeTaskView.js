// Task View 首页
// =============

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars"],
    function($, _, Backbone, Handlebars) {

        // Extends Backbone.View
        var TaskView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                this.template = Handlebars.compile($("#hbtmp_home_task_view").html());
                // The render method is called when Task Models are added to the Collection
                this.collection.on("sync", this.render, this);

            },

            // Renders all of the Task models on the UI
            render: function() {
                var self = this;
                // var rendered = [];
                var tasks = _.map(this.collection.models, function(x) {

                    return x.toJSON();
                })
                tasks = _.sortBy(tasks,function  (x) {
                    return x.start;
                })
                $("#home-task-num").html(this.collection.length);
                $("#home-task-list").html(self.template({
                    tasks: tasks
                }));
                $("#home-task-list").trigger('create');
                return this;

            }

        });

        // Returns the View class
        return TaskView;

    });