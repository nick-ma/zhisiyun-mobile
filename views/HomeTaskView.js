// Task View 首页
// =============

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "moment"],
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
                });
                var today = moment().startOf('day').toDate();
                var future = moment().add('d', 7).endOf('day').toDate();
                tasks = _.filter(tasks, function(x) {
                    var start_d = new Date(x.start);
                    var end_d = new Date(x.end);
                    //选出来，列在首页。（7天以内的任务，并且是未完成的）
                    var flag = (start_d < today && end_d >= today) || (start_d >= today && start_d <= future) && !x.is_complete;
                    return flag;
                });
                tasks = _.sortBy(tasks, function(x) {
                    return x.start;
                });
                $("#home-task-num").html(tasks.length);
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