// mbti mbti, 移动会议室
// ======================
define(["jquery", "backbone", "../models/MobileResourceModel"], function($, Backbone, MobileResourceModel) {
	// The Model constructor
	var Collection = Backbone.Collection.extend({
		url: function() {
			// mr_id
			console.log(this)
			return '/admin/pm/mobile_resource_calendar/bb';
		},
		model: MobileResourceModel,
	});

	// Returns the Model class
	return Collection;
})