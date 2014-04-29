// Payroll Model, 个人工作日历
// ======================
define(["jquery", "backbone"], function($, Backbone) {
    // The Model constructor
    var Model = Backbone.Model.extend({
        idAttribute: "pay_time",
        // rootUrl: '/admin/pm/work_plan/bb',
        url: function() {
            return null;
        },
        validate: function(attrs, options) {
            
        }
    });

    // Returns the Model class
    return Model;
})