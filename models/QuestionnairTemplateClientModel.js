//  选项模版创建
// =========================

define(["jquery", "backbone"], function($, Backbone) {
    // The Model constructor
    var Model = Backbone.Model.extend({
        idAttribute: "_id",
        rootUrl: '/admin/pm/questionnair_template/common_bb',
        url: function() {
            return this.rootUrl + '/' + this.id;
        },
        validate: function(attrs, options) {

        }
    });

    // Returns the Model class
    return Model;
})