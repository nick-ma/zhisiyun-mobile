// People Model, 人员
// ======================
define(["jquery", "backbone"], function($, Backbone) {
    // The Model constructor
    var Model = Backbone.Model.extend({
        idAttribute: "_id",
        rootUrl: '/admin/pm/mbti/personal_bb',
        url: function() {
            return this.rootUrl + '/' + this.id;
        },
        validate: function(attrs, options) {

        }
    });

    // Returns the Model class
    return Model;
})