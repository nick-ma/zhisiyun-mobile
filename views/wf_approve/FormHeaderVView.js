// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "moment"],
    function($, _, Backbone, Handlebars, moment) {
        // Extends Backbone.View
        var View = Backbone.View.extend({
            // The View Constructor
            initialize: function() {
                this.el = '#form_header';
                this.template = Handlebars.compile($("#tmp_form_header").html());
                this.bind_event();
            },

            // Renders all of the WFApprove models on the UI
            render: function() {
                var self = this;
                var render_data = {
                    pi: self.pi.toJSON(),
                    ti: self.ti,
                };
                $("#form_header").html(self.template(render_data));
                $("#form_header").trigger('create');
                return this;
            },
            bind_event: function() {
                var self = this;
            }

        });

        // Returns the View class
        return View;

    });