// Includes file dependencies
define(["jquery", "backbone", "models/NotificationModel"], function($, Backbone, NotificationModel) {

    // Extends Backbone.Router
    var Collection = Backbone.Collection.extend({
        date_offset: 365,
        // Sets the Collection model property to be a People Model
        model: NotificationModel,
        url: function() {
            return '/wxapp/005/bb?date_offset=' + this.date_offset;
        },
    });

    // Returns the Model class
    return Collection;
});