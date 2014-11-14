// Includes file dependencies
define(["jquery", "backbone"], function($, Backbone) {

    // Extends Backbone.Router
    var Collection = Backbone.Collection.extend({
        url: function() {
            return '/admin/wf/process_visual_define/bb?process_cat=USER&flag=U';
        },
    });

    // Returns the Model class
    return Collection;

});