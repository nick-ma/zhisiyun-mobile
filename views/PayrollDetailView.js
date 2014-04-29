// Payroll Detail View
// ===================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars"],
    function($, _, Backbone, Handlebars) {
        
        // Extends Backbone.View
        var PayrollDetailView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                this.template = Handlebars.compile($("#hbtmp_payroll_detail_view").html());
                // The render method is called when People Models are added to the Collection
                // this.collection.on("sync", this.render, this);

            },

            // Renders all of the People models on the UI
            render: function() {

                var self = this;

                $("#salary_detail-content").html(self.template(self.model.attributes));
                $("#salary_detail-content").trigger('create');
                return this;

            }

        });

        // Returns the View class
        return PayrollDetailView;

    });