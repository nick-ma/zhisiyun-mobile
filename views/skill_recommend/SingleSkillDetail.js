// CollTask List View
// =================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "moment"],
    function($, _, Backbone, Handlebars, moment) {

        // Extends Backbone.View
        var ListSingleSkillView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                var self = this;
                this.template = Handlebars.compile($("#show_skill_view").html());
                // The render method is called when CollTask Models are added to the Collection

            },

            // Renders all of the CollTask models on the UI
            render: function() {
                var self = this;
                $('#btn-single_skill-back').attr('href', '#show_people_skill/' + self.model.get('_id'))
                var skill_id = self.skill_id
                var people = self.model.toJSON();
                var f_d = _.find(people.my_skills, function(s) {
                    return s.skill._id == skill_id
                })
                $("#show_skill-content").html(self.template(f_d));
                $("#show_skill-content").trigger('create');
                return this
            },

        });

        // Returns the View class
        return ListSingleSkillView;

    });