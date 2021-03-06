// GradeGroup Collection 计分公式
// =============================

// Includes file dependencies
define(["jquery", "backbone", "models/GradeGroupModel"], function($, Backbone, GradeGroupModel) {

    // Extends Backbone.Router
    var Collection = Backbone.Collection.extend({

        // The Collection constructor
        initialize: function(models, options) {

        },
        url: function() {

            return '/admin/pm/performance_grade/gg_4m' + '?ct=' + (new Date()).getTime();
        },
        // Sets the Collection model property to be a GradeGroup Model
        model: GradeGroupModel,
    });
    // Returns the Model class
    return Collection;

});