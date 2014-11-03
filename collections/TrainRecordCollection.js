// Talent Collection 企业人员
// =========================

// Includes file dependencies
define(["jquery", "backbone", "models/TrainRecordModel"], function($, Backbone, TrainRecordModel) {

    // Extends Backbone.Router
    var Collection = Backbone.Collection.extend({

        // The Collection constructor
        initialize: function(models, options) {

        },
        url: function() {
            return '/admin/course/train_record/bb';
        },
        // Sets the Collection model property to be a Talent Model
        model: TrainRecordModel,
    });

    // Returns the Model class
    return Collection;

});