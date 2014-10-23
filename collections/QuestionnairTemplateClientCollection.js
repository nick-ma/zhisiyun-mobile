// People Collection 企业人员
// =========================

// Includes file dependencies
define(["jquery", "backbone", "../models/QuestionnairTemplateClientModel"], function($, Backbone, QuestionnairTemplateClientModel) {

    // Extends Backbone.Router
    var Collection = Backbone.Collection.extend({

        // The Collection constructor
        initialize: function(models, options) {

        },
        url: function() {
            return '/admin/pm/questionnair_template/common_bb'
        },

        // Sets the Collection model property to be a People Model
        model: QuestionnairTemplateClientModel,
    });

    // Returns the Model class
    return Collection;

});