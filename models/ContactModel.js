// ======================
define(["jquery", "backbone"], function($, Backbone) {
    // The Model constructor
    var Model = Backbone.Model.extend({
        idAttribute: "_id",
        rootUrl: '/admin/pm/coll_project_contact/bb',
        url: function() {
            return this.rootUrl + '/' + this.id;
        },
    });

    // Returns the Model class
    return Model;
})