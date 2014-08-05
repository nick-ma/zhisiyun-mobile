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
                this.bind_event();
                this.skill = null;
            },

            // Renders all of the CollTask models on the UI
            render: function() {
                var self = this;

                if (self.skill) {
                    var filters = _.filter(self.collection, function(filter) {
                        return filter.skill_name.indexOf(self.skill) == 0 ? true : false
                    })
                } else {
                    var filters = self.collection;
                }

                var render_data = {
                    people_id: $("#login_people").val(),
                    skills: _.sortBy(_.map(filters, function(x) {
                        return x;
                    }), function(x) {
                        return x.fl;
                    })
                }
                $("#show_skill_config-content").html(self.template(render_data));
                $("#show_skill_config-content").trigger('create');
                $("#is_show_filter").show();
                return this
            },
            bind_event: function() {
                var self = this
                $("#show_skill_config").on('keyup', '#filter_my_skill', function(event) {
                    event.preventDefault();
                    self.skill = $(this).val();
                    self.render();
                }).on('click', '#bt_my_create_skill', function(event) {
                    event.preventDefault();
                    var skill_name = $("#filter_my_skill").val();
                    self.model.set('type', 'C');
                    self.model.set('skill_name', skill_name);
                    self.model.save().done(function() {
                        self.model.fetch().done(function() {
                            self.skill = null;
                            $("#filter_my_skill").val('')
                            window.location = "#skill_config";
                        })

                    })
                })
            }
        });

        // Returns the View class
        return SkillBankView;

    });