// Objective Collection 目标管理
// ===================

// Includes file dependencies
define(["jquery", "backbone", "models/ObjectiveModel"], function($, Backbone, ObjectiveModel) {

    // Extends Backbone.Router
    var Collection = Backbone.Collection.extend({

        // The Collection constructor
        initialize: function(models, options) {

        },
        url: function() {

            return '/admin/pm/target_planning/get_target_planning_json_4m' + '?ct=' + (new Date()).getTime();
        },
        // Sets the Collection model property to be a Task Model
        model: ObjectiveModel,
    });

    // Returns the Model class
    return Collection;

});