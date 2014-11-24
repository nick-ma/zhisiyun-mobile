// pa terminate employment Collection 人员离职数据集合
// =============================

// Includes file dependencies
define(["jquery", "backbone", "models/PATerminationEmployment"], function($, Backbone, PATerminationEmployment) {

    // Extends Backbone.Router
    var Collection = Backbone.Collection.extend({

        // The Collection constructor
        initialize: function(models, options) {
        },
        url: function() {

            return '/admin/pa/wf/termination_employment/bb';
        },
        // Sets the Collection model property to be a Assessment Model
        model: PATerminationEmployment,
    });
    // Returns the Model class
    return Collection;

});