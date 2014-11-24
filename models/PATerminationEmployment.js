// PA Termination Employment Model 人员离职数据
// ==================

// Includes file dependencies
define(["jquery", "backbone"], function($, Backbone) {

    // The Model constructor
    var Model = Backbone.Model.extend({
        idAttribute: "_id",
        rootUrl: '/admin/pa/wf/termination_employment/bb',
        url: function() {
            return this.rootUrl + '/' + this.id;
        },
    });

    // Returns the Model class
    return Model;

});