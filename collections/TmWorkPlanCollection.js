// Tm Collection 时间管理
// =========================

// Includes file dependencies
define(["jquery", "backbone", "../models/TmWorkPlanModel"], function($, Backbone, TmWorkPlanModel) {

    // Extends Backbone.Router
    var Collection = Backbone.Collection.extend({

        // The Collection constructor
        initialize: function(models, options) {

        },
        url: function() {
            return '/admin/tm/workplan/pep_bb';
        },

        model: TmWorkPlanModel,
    });

    // Returns the Model class
    return Collection;

});