// People Collection 企业人员
// =========================

// Includes file dependencies
define(["jquery", "backbone"], function($, Backbone) {

	// Extends Backbone.Router
	var Model = Backbone.Model.extend({
		idAttribute: "people",
		// rootUrl: '/admin/pm/mbti/personal_bb',
		// url: function() {
		// 	return this.rootUrl + '/' + this.id;
		// },
	});
	return Model;

});