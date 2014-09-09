// Tm Collection 时间管理
// =========================

// Includes file dependencies
define(["jquery", "backbone", "../models/TmAttendanceModel"], function($, Backbone, TmAttendanceModel) {

    // Extends Backbone.Router
    var Collection = Backbone.Collection.extend({

        // The Collection constructor
        initialize: function(models, options) {

        },
        url: function() {
            return '/admin/tm/cardrecord/bb';
        },

        model: TmAttendanceModel,
    });

    // Returns the Model class
    return Collection;

});