// CollTask List View
// =================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "moment"],
    function($, _, Backbone, Handlebars, moment) {

        // Extends Backbone.View
        var ListSkillConfigView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                var self = this;
                this.template = Handlebars.compile($("#show_skill_config_view").html());
                // The render method is called when CollTask Models are added to the Collection
                this.bind_event();
            },
            // Renders all of the CollTask models on the UI
            render: function() {
                var self = this;
                $("#show_skill_config-content").html(self.template(self.model.attributes));
                $("#show_skill_config-content").trigger('create');
                return this
            },
            bind_event: function() {
                var self = this;
                $("#show_skill_config-content").on('click', '#delete_skill', function(event) {
                    event.preventDefault();
                    self.model.set('type', 'D')
                    self.model.set('skill_id', $(this).attr("skill_id"))
                    self.model.save().done(function() {
                        self.model.fetch().done(function() {
                            self.render();
                        })
                    })
                })
            }
        });

        // Returns the View class
        return ListSkillConfigView;

    });