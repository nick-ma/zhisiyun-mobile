// ======================
define(["jquery", "backbone"], function($, Backbone) {
    // The Model constructor
    var Collection = Backbone.Collection.extend({
        url: function() {
            return '/admin/pm/enneagram/qb_bb';
        },
    });

    // Returns the Model class
    return Collection;
})