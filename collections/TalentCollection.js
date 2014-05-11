// Talent Collection 企业人员
// =========================

// Includes file dependencies
define(["jquery", "backbone", "models/TalentModel"], function($, Backbone, TalentModel) {

    // Extends Backbone.Router
    var Collection = Backbone.Collection.extend({

        // The Collection constructor
        initialize: function(models, options) {

        },
        url: function() {
            return '/user/report/lambda_data4m' + '?ct=' + (new Date()).getTime();
        },
        // Sets the Collection model property to be a Talent Model
        model: TalentModel,
    });

    // Returns the Model class
    return Collection;

});