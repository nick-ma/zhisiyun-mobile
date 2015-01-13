// Payroll List View
// =================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars"],
    function($, _, Backbone, Handlebars) {

        // Extends Backbone.View
        var PayrollListView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                this.template = Handlebars.compile($("#hbtmp_payroll_list_view").html());
                // The render method is called when Payroll Models are added to the Collection
                // this.collection.on("sync", this.render, this);
                this.bind_events();
            },

            // Renders all of the Payroll models on the UI
            render: function() {

                var self = this;

                // var rendered = ;
                var render_data = {
                        payrolls: _.map(this.collection.models, function(x) {
                            return x.toJSON();
                        })
                    }
                    // _.each(this.collection.models, function(x) {
                    //     x.attributes.pi_count = x.attributes.qualitative_pis.items.length + x.attributes.quantitative_pis.items.length;
                    //     rendered.push(self.template(x.attributes));
                    // });
                    // self.template(render_data);
                $("#salary_list-content").html(self.template(render_data));
                $("#salary_list-content").trigger('create');
                self.rendered = true;
                return this;

            },

            bind_events: function() {
                var self = this;
                $("#salary_list").on('click', '#btn_refresh_salary', function(event) {
                    event.preventDefault();
                    $.mobile.loading("show");
                    self.collection.fetch().done(function() {
                        self.render();
                        localStorage.setItem('payroll', LZString.compressToUTF16(JSON.stringify(self.collection.toJSON())));
                    }).fail(function() {
                        alert('')
                    }).always(function() {
                        $.mobile.loading("hide");
                    })
                });

            }

        });

        // Returns the View class
        return PayrollListView;

    });
