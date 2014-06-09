// Competency Model, 人员
// ======================
define(["jquery", "backbone"], function($, Backbone) {
    // The Model constructor
    var Model = Backbone.Model.extend({
        idAttribute: "people_id",
        // rootUrl: '/admin/masterdata/people/people4m',
        url: function() { //不需要进行数据更新，仅仅作为model来存储数据。
            return '/admin/om/competency_client/get_peoples_competency_json?people_id=' + this.id + '&ct=' + (new Date()).getTime();
        },
        validate: function(attrs, options) {

        }
    });

    // Returns the Model class
    return Model;
})