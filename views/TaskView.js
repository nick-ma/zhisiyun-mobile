// Task View
// =============
//add one line to test git .
// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "models/TaskModel", "jqmcal", "formatdate"], function($, _, Backbone, Handlebars, TaskModel) {


    // var Handlebars = HB.
    // default;

    // console.log(jqmcal);
    // Extends Backbone.View
    var TaskView = Backbone.View.extend({
        // The View Constructor
        initialize: function() {
            // this.template = Handlebars.compile($("script#taskItems").html());

            // The render method is called when Task Models are added to the Collection
            // this.collection.on('remove', function() {
            //     this.collection.fetch();
            // });
            // this.collection.on("sync", this.render, this);
            $("#jqm_cal").jqmCalendar({
                events: [],
                months: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
                days: ["日", "一", "二", "三", "四", "五", "六"],
                startOfWeek: 1,
                weeksInMonth: 6,
                headerTheme: 'b',
                theme: 'a',
                dividerTheme: 'a',
                dateFormatTitle: "yyyy-MM-dd",
                dateFormat: "yyyy-MM-dd HH:mm",
                route: '#task' //pass current page route to widget, to avoid page change when click date.
            });
        },

        // Renders all of the Task models on the UI
        render: function() {
            var self = this;
            //jqmCalendar test
            var $cal = $("#jqm_cal");
            var cal_events = $cal.data('jqmCalendar').settings.events;
            cal_events.length = 0;
            _.each(this.collection.models, function(x) {
                var tmp = x.toJSON();
                tmp.start = new Date(tmp.start);
                tmp.end = new Date(tmp.end);
                tmp.icon = "carat-r";
                cal_events.push(tmp);

            });
            $cal.trigger('refresh');
            // console.log(cal_events);

            // Maintains chainability
            return this;

        }

    });

    // Returns the View class
    return TaskView;

});
