// Task View
// =============

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "models/TaskModel","jqmcal"], function($, _, Backbone, HB, TaskModel, jqmcal) {

    
    var Handlebars = HB.
    default;

    console.log(jqmcal);
    // Extends Backbone.View
    var TaskView = Backbone.View.extend({
        // The View Constructor
        initialize: function() {
            this.template = Handlebars.compile($("script#taskItems").html());

            // The render method is called when Task Models are added to the Collection
            this.collection.on("sync", this.render, this);

        },

        // Renders all of the Task models on the UI
        render: function() {
            var self = this;
            // Sets the view's template property
            // console.log(self.collection);
            var rendered = [];
            rendered = _.map(this.collection.models, function(x) {
                // console.log(x);
                return self.template(x.attributes);
            })
            // console.log(rendered);
            // Renders the view's template inside of the current listview element
            self.$el.find("ul").html(rendered.join(''));

            // Maintains chainability
            return this;

        }

    });

    // Returns the View class
    return TaskView;

});