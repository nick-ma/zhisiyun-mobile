// Includes file dependencies
define(["jquery", "backbone", "../models/CourseModel"], function($, Backbone, CourseModel) {
    // Extends Backbone.Router
    var Collection = Backbone.Collection.extend({
        url: function() {
            return '/admin/course/course/bb';
        },

        // Sets the Collection model property to be a People Model
        model: CourseModel,
    });

    // Returns the Model class
    return Collection;

});