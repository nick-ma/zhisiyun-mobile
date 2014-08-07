// Talent Model, 人员
// ======================
define(["jquery", "backbone"], function($, Backbone) {
    // The Model constructor
    var Model = Backbone.Model.extend({
        idAttribute: "people_id",
        // rootUrl: '/admin/masterdata/people/people4m',
        url: function() { //不需要进行数据更新，仅仅作为model来存储数据。
            return '/user/report/lambda_data4m?people_id=' + this.id + '&ts=' + (new Date()).getTime();
        },
        validate: function(attrs, options) {

        }
    });

    // Returns the Model class
    return Model;
})