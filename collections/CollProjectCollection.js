// Coll Project Collection 项目
// ===========================

// Includes file dependencies
define(["jquery", "backbone", "models/CollProjectModel"], function($, Backbone, CollProjectModel) {

    // Extends Backbone.Router
    var Collection = Backbone.Collection.extend({

        // The Collection constructor
        initialize: function(models, options) {
            this.date_offset = 30; //默认取30天
        },
        url: function() {
            var url = '/admin/pm/coll_project/bb?date_offset=' + this.date_offset;
            if (this.date_pj_typeset) {
                url += '&date_pj_typeset=' + this.date_pj_typeset;
            };
            if (this.people_id) {
                url += '&people_id=' + this.people_id;
            };
            url += '&ct=' + (new Date()).getTime();
            return url;
        },
        // Sets the Collection model property to be a Task Model
        model: CollProjectModel,
    });

    // Returns the Model class
    return Collection;

});