// Skill Model, 技能
// ======================
define(["jquery", "backbone"], function($, Backbone) {
    // The Model constructor
    var Model = Backbone.Model.extend({
        idAttribute: "_id",
        // rootUrl: '/admin/pm/skill/my_mobile_bb',
        url: function() {
            // return this.rootUrl + '/' + this.id;
            return null;
        },
        validate: function(attrs, options) {

        }
    });

    // Returns the Model class
    return Model;
})