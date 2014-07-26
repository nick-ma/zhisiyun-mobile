// CollTask List View
// =================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "moment"],
    function($, _, Backbone, Handlebars, moment) {

        // Extends Backbone.View
        var SkillBankView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                var self = this;
                this.template = Handlebars.compile($("#show_skill_bank_view").html());
                // The render method is called when CollTask Models are added to the Collection
            },

            // Renders all of the CollTask models on the UI
            render: function() {
                var self = this;
                var render_data = {
                    people_id: $("#login_people").val(),
                    skills: _.sortBy(_.map(this.collection, function(x) {
                        return x;
                    }), function(x) {
                        return x.fl;
                    })
                }
                $("#show_skill_config-content").html(self.template(render_data));
                $("#show_skill_config-content").trigger('create');
                return this
            },

        });

        // Returns the View class
        return SkillBankView;

    });