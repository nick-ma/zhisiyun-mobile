// People Model, 人员
// ======================
define(["jquery", "backbone"], function($, Backbone) {
    // The Model constructor
    var Model = Backbone.Model.extend({
        idAttribute: "_id",
        // rootUrl: '/admin/masterdata/people/people4m',
        url: function() {
            return '/admin/masterdata/people/people_list4m?people_id=' + this.id + '&ct=' + (new Date()).getTime();
        },
        validate: function(attrs, options) {

        }
    });

    // Returns the Model class
    return Model;
})