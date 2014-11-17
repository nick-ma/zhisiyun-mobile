// WF Approve Collection 协作任务
// =============================

// Includes file dependencies
define(["jquery", "backbone", "models/WFApproveModel"], function($, Backbone, WFApproveModel) {

    // Extends Backbone.Router
    var Collection = Backbone.Collection.extend({

        // The Collection constructor
        initialize: function(models, options) {
            this.date_offset = 30; //默认取30天
        },
        url: function() {
            return '/admin/free_wf/approve/bb?date_offset=' + this.date_offset + '&ct=' + (new Date()).getTime();
        },
        // Sets the Collection model property to be a Task Model
        model: WFApproveModel,
    });

    // Returns the Model class
    return Collection;

});