// Tm Collection 时间管理
// =========================

// Includes file dependencies
define(["jquery", "backbone", "../models/TMAbsenceOfThreeModel"], function($, Backbone, TMAbsenceOfThreeModel) {

    // Extends Backbone.Router
    var Collection = Backbone.Collection.extend({
        // The Collection constructor
        initialize: function(models, options) {
        },
        url: function() {
            return '/admin/tm/beyond_work/mobile_bb';
        },
        model: TMAbsenceOfThreeModel,
    });

    // Returns the Model class
    return Collection;

});