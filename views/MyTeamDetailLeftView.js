// MyTeam Detail Left View
// ===================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "models/PeopleModel"],
    function($, _, Backbone, Handlebars, PeopleModel) {

        // Extends Backbone.View
        var MyTeamDetailLeftView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                this.template = Handlebars.compile($("#myteam_detail_left_panel_view").html());
                this.template2 = Handlebars.compile($("#myteam_detail_footer_view").html());
                this.view_modes = [
                    'basic',
                    'task',
                    'assessment',
                    'talent'
                ];
            },

            // Renders all of the People models on the UI
            render: function() {
                var self = this;

                var render_data = {};
                render_data.people_id = self.people_id;
                _.each(self.view_modes, function(x) {
                    var $target = $("#myteam_detail-" + x + "-left-panel-content");
                    var $target2 = $("#myteam_detail-" + x + "-footer-content");
                    // $target.empty();
                    $target.html(self.template(render_data));
                    $target2.html(self.template2(render_data));
                    //设置active
                    _.each($target.find('a'), function(y) {
                        if ($(y).data('view_mode') == x) {
                            $(y).addClass('ui-btn-active');
                        }
                    })
                    // //设置active
                    // _.each($target2.find('a'), function(y) {
                    //     if ($(y).data('view_mode') == x) {
                    //         $(y).addClass('ui-btn-active');
                    //     }
                    // })
                    $target.trigger('create');
                    $target2.trigger('create');
                })

                return this;
            },
            bind_event: function() {
                var self = this;

            }

        });

        // Returns the View class
        return MyTeamDetailLeftView;

    });