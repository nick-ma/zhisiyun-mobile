// Payroll Collection 个人工作日历
// ===================

// Includes file dependencies
define(["jquery", "backbone", "models/PayrollModel"], function($, Backbone, PayrollModel) {

    // Extends Backbone.Router
    var Collection = Backbone.Collection.extend({

        // The Collection constructor
        initialize: function(models, options) {

        },
        url: function() {
            return '/admin/py/payroll_people/get_payroll_instances' + '?ct=' + (new Date()).getTime();
        },
        // Sets the Collection model property to be a Payroll Model
        model: PayrollModel,
    });

    // Returns the Model class
    return Collection;

});