// PeopleAttendanceResult List View
// =================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "moment"],
	function($, _, Backbone, Handlebars, moment) {
		var filter_month = moment().format("YYYY-MM");
		Handlebars.registerHelper('if_true', function(result, cond1) {
			if (!!~result.indexOf(String(cond1))) {
				// return '<i class="icon-ok" style="color:red"></i>'
				return '<span class="label label-info" style="color:red">是</span>'

			} else {
				return false;
			}

		});
		Handlebars.registerHelper('if_true2', function(result, cond1, cond2) {
			if (cond1 && cond2) {
				if (!!~result.indexOf(String(cond1)) && !!~result.indexOf(String(cond2))) {
					// return '<i class="icon-ok" style="color:red"></i>'
					return '<span class="label label-info" style="color:red">是</span>'

				} else {
					return false;
				}
			}

		});
		// Extends Backbone.View
		var MyAttendanceListView = Backbone.View.extend({

			// The View Constructor
			initialize: function() {
				var self = this;
				this.template = Handlebars.compile($("#hbtmp_personal_attend_list_view").html());
				// The render method is called when CollTask Models are added to the Collection
				this.bind_event();
			},

			// Renders all of the CollTask models on the UI
			render: function() {
				var self = this;
				var data = self.model.attributes[0].data;
				var filter_data = _.sortBy(_.filter(data, function(temp) {
					temp.format_time = moment(temp.job_date).format("YYYYMMDD");
					return moment(temp.job_date).format("YYYY-MM") == String(filter_month) && temp.is_job_day
				}), function(s) {
					return s.format_time
				})
				var rendered_data = _.map(filter_data, function(x) {
					return x;
				})
				var obj = {
					attendance_data: rendered_data
				}
				console.log(obj);
				$("#personal_attend_list-content").html(self.template(obj));

				$("#personal_attend_list-content").trigger('create');
				return this
			},
			bind_event: function() {
				var self = this;
				$("#attendance")
					.on('change', '#attendance_month_view_mode', function(event) {
						event.preventDefault();
						var select_month = Number($(this).val()) + 1;
						console.log(select_month)
						if (select_month / 10 >= 1) {
							select_month = moment().format("YYYY") + '-' + select_month;
						} else {
							select_month = moment().format("YYYY") + '-0' + select_month;

						}
						filter_month = select_month;
						console.log(filter_month);
						self.render();
					})
			}
		});

		// Returns the View class
		return MyAttendanceListView;

	});