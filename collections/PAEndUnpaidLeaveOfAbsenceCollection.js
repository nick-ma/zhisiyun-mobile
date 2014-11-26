// pa end_unpaid_leave_of_absence Collection 人员结束停薪留职数据集合
// =============================

// Includes file dependencies
define(["jquery", "backbone", "models/PAEndUnpaidLeaveOfAbsenceModel"], function($, Backbone, PAEndUnpaidLeaveOfAbsenceModel) {

    // Extends Backbone.Router
    var Collection = Backbone.Collection.extend({

        // The Collection constructor
        initialize: function(models, options) {
        },
        url: function() {

            return '/admin/pa/wf/end_unpaid_leave_of_absence/bb';
        },
        // Sets the Collection model property to be a Assessment Model
        model: PAEndUnpaidLeaveOfAbsenceModel,
    });
    // Returns the Model class
    return Collection;

});