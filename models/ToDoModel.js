// ToDo Model, 我的待办
// ======================
define(["jquery", "backbone"], function($, Backbone) {
    // The Model constructor
    var Model = Backbone.Model.extend({
        idAttribute: "_id",
        // rootUrl: '',
        // url: function() {
        //     return this.rootUrl + '/' + this.id;
        // },
    });

    // Returns the Model class
    return Model;
})