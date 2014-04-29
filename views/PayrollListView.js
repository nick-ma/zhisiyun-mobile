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
                this.collection.on("sync", this.render, this);

            },

            // Renders all of the Payroll models on the UI
            render: function() {

                var self = this;

                // var rendered = ;
                var render_data = {
                    payrolls: _.map(this.collection.models,function  (x) {
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
                return this;

            }

        });

        // Returns the View class
        return PayrollListView;

    });