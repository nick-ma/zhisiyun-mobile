// MyTeam Detail Left View
// ===================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "models/PeopleModel"],
    function($, _, Backbone, Handlebars, PeopleModel) {

        // Extends Backbone.View
        var MyTeamDetailLeftView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                // this.template = Handlebars.compile($("#myteam_detail_left_panel_view").html());
                // The render method is called when People Models are added to the Collection
                // this.collection.on("sync", this.render, this);
                // this.bind_event();

            },

            // Renders all of the People models on the UI
            render: function() {
                var self = this;
                self.bind_event();

                var render_data = {};
                render_data.basic = 'myteam_detail_filter ui-btn ui-icon-info ui-btn-icon-left';
                render_data.calendar = 'myteam_detail_filter ui-btn ui-icon-grid ui-btn-icon-left';
                render_data.assessment = 'myteam_detail_filter ui-btn ui-icon-star ui-btn-icon-left';
                render_data.talent = 'myteam_detail_filter ui-btn ui-icon-tag ui-btn-icon-left';
                
                //设置active
                render_data[self.btn_mode] += ' ui-btn-active';

                self.el.html(self.template(render_data));
                self.el.trigger('create');

                return this;
            },
            bind_event: function() {
                var self = this;
                //new view时传递过来
                self.cont
                    .on('swiperight', function(event) { //向右滑动，打开左边的面板
                        event.preventDefault();
                        self.el.panel("open");
                    })
                    .on('click', '.myteam_detail_filter', function(event) {
                        event.preventDefault();
                        var $this = $(this);
                        self.view_filter = $this.data('view_mode');

                        self.el.panel("close");
                        window.location.href = "#myteam_detail/" + self.people_id + "/" + self.view_filter;
                        // console.log($this.val());
                    })
            }

        });

        // Returns the View class
        return MyTeamDetailLeftView;

    });