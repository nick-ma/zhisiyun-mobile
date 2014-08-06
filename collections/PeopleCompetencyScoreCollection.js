// People Collection 企业人员
// =========================

// Includes file dependencies
define(["jquery", "backbone", "models/PeopleCompetencyScoreModel"], function($, Backbone, PeopleCompetencyScoreModel) {

	// Extends Backbone.Router
	var Collection = Backbone.Collection.extend({

		// The Collection constructor
		// initialize: function(models, options) {

		// },
		url: function() {
			return '/admin/pm/questionnair_template/pcs_bb/';
		},

		// Sets the Collection model property to be a People Model
		model: PeopleCompetencyScoreModel,
	});

	// Returns the Model class
	return Collection;

});