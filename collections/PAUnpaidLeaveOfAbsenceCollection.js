// pa unpaid_leave_of_absence_hr Collection 人员停薪留职数据集合
// =============================

// Includes file dependencies
define(["jquery", "backbone", "models/PAUnpaidLeaveOfAbsenceModel"], function($, Backbone, PAUnpaidLeaveOfAbsenceModel) {

    // Extends Backbone.Router
    var Collection = Backbone.Collection.extend({

        // The Collection constructor
        initialize: function(models, options) {
        },
        url: function() {

            return '/admin/pa/wf/unpaid_leave_of_absence_hr/bb';
        },
        // Sets the Collection model property to be a Assessment Model
        model: PAUnpaidLeaveOfAbsenceModel,
    });
    // Returns the Model class
    return Collection;

});