// Task View
// =============
// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "jqmcal", "formatdate"], function($, _, Backbone, Handlebars) {


    // var Handlebars = HB.
    // default;

    // console.log(jqmcal);
    // Extends Backbone.View
    var CalendarView = Backbone.View.extend({
        // The View Constructor
        initialize: function() {
            // this.template = Handlebars.compile($("script#taskItems").html());

            // The render method is called when Task Models are added to the Collection
            // this.collection.on('remove', function() {
            //     this.collection.fetch();
            // });
            // this.collection.on("sync", this.render, this);
            this.bind_event();
            this.mr_id = '';
            $("#mobile_resource_cal").jqmCalendar({
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
                route: '#mobile_resource' //pass current page route to widget, to avoid page change when click date.
            });
        },

        // Renders all of the Task models on the UI
        render: function() {
            var self = this;
            //jqmCalendar test
            console.log(self)
            var $cal = $("#mobile_resource_cal");
            var cal_events = $cal.data('jqmCalendar').settings.events;
            cal_events.length = 0;
            var items = []
            console.log('' == self.mr_id)
            items.push('<option value="" ' + (('' == self.mr_id) ? 'selected' : '') + '>全部</option>')
            _.each(self.mrs, function(mr) {

                items.push('<option value="' + mr._id + '"  ' + ((mr._id == self.mr_id) ? 'selected' : '') + ' >' + mr.mr_name + '</option>')
            })

            $("#moblie_resource_set").html(items.join(''))

            _.each(this.collection.models, function(x) {
                var tmp = x.toJSON();
                tmp.start = new Date(tmp.start);
                tmp.end = new Date(tmp.end);
                tmp.icon = "carat-r";
                if (self.mr_id) {
                    if (self.mr_id == tmp.mobile_resource._id) {
                        cal_events.push(tmp);
                    };
                } else {
                    cal_events.push(tmp);
                }

            });
            $cal.trigger('refresh');
            // console.log(cal_events);

            // Maintains chainability
            return this;

        },
        bind_event: function() {
            var self = this;
            $("#mobile_resource_list")
                .on('click', '.open-left-panel', function(event) {
                    event.preventDefault();
                    $("#show_mobile-left-panel").panel("open");
                }).on('swiperight', function(event) { //向右滑动，打开左边的面板
                    event.preventDefault();
                    $("#show_mobile-left-panel").panel("open");
                }).on('click', '#btn-im_showh-change_view', function(event) {
                    event.preventDefault();
                    window.location.href = '#im_list'
                    $("#show_mobile-left-panel").panel("close");
                }).on('click', '#btn-moblie_resource-change_view', function(event) {
                    event.preventDefault();
                    window.location.href = '#mobile_resource'
                    $("#show_mobile-left-panel").panel("close");
                }).on('change', "#moblie_resource_set", function(event) {
                    event.preventDefault();
                    console.log($(this).val())
                    self.mr_id = $(this).val()
                    self.render()
                    $("#show_mobile-left-panel").panel("close");

                })
        }

    });

    // Returns the View class
    return CalendarView;

});