// ToDo View
// =============

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", ], function($, _, Backbone, Handlebars) {
    Handlebars.registerHelper('delta', function(data, options) {
        if (data <= 0) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        };
    });

    var ToDoListView = Backbone.View.extend({
        // The View Constructor
        initialize: function() {
            this.template = Handlebars.compile($("#todo_view").html());
            this.loading_template = Handlebars.compile($("#loading_template_view").html());
            // this.collection.on("sync", this.render, this);
            this.bind_event();
        },
        pre_render: function() {
            var self = this;
            $("#personal_wf_work_of_travel-content").html(self.loading_template({
                info_msg: '数据加载中...请稍候'
            }));
            $("#personal_wf_work_of_travel-content").trigger('create');
            return this;
        },
        // Renders all of the Task models on the UI
        render: function() {
            var self = this;
            var rendered_data = {
                todos: _.map(self.collection.models, function(x) {
                    return x.toJSON();
                })
            }
            $("#todo_list-content").html(self.template(rendered_data));
            $("#todo_list-content").trigger('create');

            return self;
        },
        bind_event: function() {
            var self = this;
            $("#btn-todo-back").on('click', function(event) {
                event.preventDefault();
                $.mobile.loading("show");
                self.collection.fetch().done(function() {
                    self.render();
                    $.mobile.loading("hide");
                })
            })
        }
    });

    // Returns the View class
    return ToDoListView;

});