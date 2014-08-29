// Includes file dependencies
define(["jquery", "backbone", "../models/WorkReportModel"], function($, Backbone, WorkReportModel) {
    // Extends Backbone.Router
    var Collection = Backbone.Collection.extend({
        url: function() {
            return '/admin/pm/work_report/bb';
        },

        // Sets the Collection model property to be a People Model
        model: WorkReportModel,
    });

    // Returns the Model class
    return Collection;

});