// Includes file dependencies
define(["jquery", "backbone"], function($, Backbone) {
    // Extends Backbone.Router
    var Collection = Backbone.Collection.extend({
        url: function() {
            return '/admin/tm/wf_back_after_leave_of_absence/bb';
        },

        // Sets the Collection model property to be a People Model
        // model: LeaveOfAbsenceModel,
    });

    // Returns the Model class
    return Collection;

});