// People Collection 企业人员
// =========================

// Includes file dependencies
define(["jquery", "backbone", "../models/SkillRecommendModel"], function($, Backbone, SkillRecommendModel) {

    // Extends Backbone.Router
    var Collection = Backbone.Collection.extend({

        // The Collection constructor
        initialize: function(models, options) {

        },
        url: function() {
            return '/admin/pm/skill/my_mobile_bb';
        },

        // Sets the Collection model property to be a People Model
        model: SkillRecommendModel,
    });

    // Returns the Model class
    return Collection;

});