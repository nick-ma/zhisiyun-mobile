define(["jquery", "backbone"], function($, Backbone) {
    // The Model constructor
    var Model = Backbone.Model.extend({
        idAttribute: "_id",
        url: function() {
            var url = '/admin/pm/assessment_instance/prev_ai_data_bb?period=' + this.period + '&people=' + this.people + '&position=' + this.position;
            return url;
        },
    });

    // Returns the Model class
    return Model;
})