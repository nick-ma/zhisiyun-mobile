// GradeGroup Model
// ==================

// Includes file dependencies
define(["jquery", "backbone"], function($, Backbone) {

    // The Model constructor
    var Model = Backbone.Model.extend({
        idAttribute: "_id",
        // rootUrl: '/admin/pm/assessment_instance/bb_4m',
        url: function() {
            // return this.rootUrl + '/' + this.id;
            return null;
        },
    });

    // Returns the Model class
    return Model;

});

