// 我的签到记录列表 List View
// =================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "moment"],
	function($, _, Backbone, Handlebars, moment) {
		// Extends Backbone.View
		var MyCardRecordView = Backbone.View.extend({

			// The View Constructor
			initialize: function() {
				var self = this;
				this.template = Handlebars.compile($("#hbtmp_my_card_record_list_view").html());
				// The render method is called when CollTask Models are added to the Collection
				this.bind_event();
			},

			// Renders all of the CollTask models on the UI
			render: function() {
				var self = this;

				var obj = {};
				obj.record_data = self.record_data;
				$("#personal_my_card_record-content").html(self.template(obj));

				$("#personal_my_card_record-content").trigger('create');
				return this
			},
			bind_event: function() {
				var self = this;
			}
		});

		// Returns the View class
		return MyCardRecordView;

	});