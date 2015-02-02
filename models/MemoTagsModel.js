// Includes file dependencies
define(["jquery", "backbone"], function($, Backbone) {

    // The Model constructor
    var Model = Backbone.Model.extend({
        idAttribute: "_id",
        rootUrl: '/admin/masterdata/people/np_tags_bb',
        url: function() {
            if(this.people){
                return this.rootUrl + '/' + this.people;
            }else{
                return this.rootUrl + '/' + this.id;
            }
        },
    });

    // Returns the Model class
    return Model;
});