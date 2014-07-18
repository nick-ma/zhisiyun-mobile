// CollTask List View
// =================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "moment"],
    function($, _, Backbone, Handlebars, moment) {

        // Extends Backbone.View
        var MySkillsListView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                var self = this;
                this.template = Handlebars.compile($("#my_skills_view").html());
                // The render method is called when CollTask Models are added to the Collection

            },

            // Renders all of the CollTask models on the UI
            render: function() {
                var self = this;
                $("#my_skills-content").html(self.template(self.model.attributes));
                $("#my_skills-content").trigger('create');
                return this
            },
            // bind_event: function() {
            //     var self = this;
            //     $("#colltask")
            //         .on('change', '#colltask_view_mode', function(event) {
            //             event.preventDefault();
            //             self.mode = this.value;
            //             self.render();
            //         })
            //         .on('swiperight', function(event) { //向右滑动，打开左边的面板
            //             event.preventDefault();
            //             $("#colltask-left-panel").panel("open");
            //         })
            //         .on('click', '#btn-colltask-refresh', function(event) {
            //             event.preventDefault();
            //             $.mobile.loading("show");
            //             self.collection.fetch().done(function() {
            //                 $.mobile.loading("hide");
            //                 $("#colltask-left-panel").panel("close");
            //             });
            //         })
            //         .on('change', '#colltask-left-panel input[name=colltask_state]', function(event) {
            //             event.preventDefault();
            //             var $this = $(this);
            //             self.state = $this.val();
            //             self.render();
            //             $("#colltask-left-panel").panel("close");
            //             // console.log($this.val());
            //         })
            //         .on('change', '#colltask-left-panel select', function(event) {
            //             event.preventDefault();
            //             var $this = $(this);
            //             var field = $this.data("field");
            //             var value = $this.val();
            //             self[field] = value;
            //             if (field == 'date_offset') { //需要重新获取数据
            //                 $.mobile.loading("show");
            //                 self.collection.date_offset = value;
            //                 self.collection.fetch().done(function() {
            //                     $.mobile.loading("hide");
            //                     self.render();
            //                 })
            //             } else {
            //                 self.render();
            //             };
            //             // $("#colltask-left-panel").panel("close");
            //             // console.log($this.val());
            //         })
            //         .on('change', '#cf_task_name', function(event) {
            //             event.preventDefault();
            //             var $this = $(this);
            //             self.search_term = $this.val();
            //             self.render();
            //         });
            // }

        });

        // Returns the View class
        return MySkillsListView;

    });