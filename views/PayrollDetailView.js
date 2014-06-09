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
                var render_data = (self.model) ? self.model.toJSON() : JSON.parse(localStorage.getItem('payroll_detail_data'));
                //设置返回的url
                $("#btn-salary_detail-back").attr('href', localStorage.getItem('payroll_detail_backurl'));
                $("#salary_detail-content").html(self.template(render_data));
                $("#salary_detail-content").trigger('create');
                //用完了删掉
                localStorage.removeItem('payroll_detail_data'); 
                localStorage.removeItem('payroll_detail_backurl'); 
                return this;

            }

        });

        // Returns the View class
        return PayrollDetailView;

    });