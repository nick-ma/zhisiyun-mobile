// Includes file dependencies
define(["jquery", "backbone", "models/NotepadModel"], function($, Backbone, NotepadModel) {

    // Extends Backbone.Router
    var Collection = Backbone.Collection.extend({
        url: function() {
            return '/admin/masterdata/people/np_bb';
        },
        
        model: NotepadModel,
    });
    // Returns the Model class
    return Collection;

});