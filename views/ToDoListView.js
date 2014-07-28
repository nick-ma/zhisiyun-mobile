// ToDo View
// =============

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars"], function($, _, Backbone, Handlebars) {
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
            this.collection.on("sync", this.render, this);
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
        }
    });

    // Returns the View class
    return ToDoListView;

});