// Task View
// =============

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "models/TaskModel", "jqmcal"], function($, _, Backbone, Handlebars, TaskModel) {


    // var Handlebars = HB.
    // default;

    // console.log(jqmcal);
    // Extends Backbone.View
    var TaskView = Backbone.View.extend({
        // The View Constructor
        initialize: function() {
            this.template = Handlebars.compile($("script#taskItems").html());

            // The render method is called when Task Models are added to the Collection
            this.collection.on("sync", this.render, this);
            $("#jqm_cal").jqmCalendar({
                events: [{
                    "summary": "第一个",
                    "begin": new Date('2014-04-01'),
                    "end": new Date('2014-04-08')
                }, {
                    "summary": "Test event",
                    "begin": new Date(),
                    "end": new Date()
                }],
                months: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
                days: ["日", "一", "二", "三", "四", "五", "六"],
                startOfWeek: 0,
                route: 'task' //pass current page route to widget, to avoid page change when click date.
            });
        },

        // Renders all of the Task models on the UI
        render: function() {
            var self = this;
            // Sets the view's template property
            // console.log(self.collection);
            var rendered = [];
            // rendered = _.map(this.collection.models, function(x) {
            //     // console.log(x);
            //     return self.template(x.attributes);
            // })
            // console.log(rendered);
            // Renders the view's template inside of the current listview element
            self.$el.find("ul").html(rendered.join(''));
            //jqmCalendar test


            // Maintains chainability
            return this;

        }

    });

    // Returns the View class
    return TaskView;

});