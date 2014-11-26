// PA end_unpaid_leave_of_absence Model 人员结束停薪留职数据
// ==================

// Includes file dependencies
define(["jquery", "backbone"], function($, Backbone) {

    // The Model constructor
    var Model = Backbone.Model.extend({
        idAttribute: "_id",
        rootUrl: '/admin/pa/wf/end_unpaid_leave_of_absence/bb',
        url: function() {
            return this.rootUrl + '/' + this.id;
        },
    });

    // Returns the Model class
    return Model;

});