// PeopleAttendanceResult List View
// =================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "moment"],
	function($, _, Backbone, Handlebars, moment) {
		var absence_type = 'B';
		Handlebars.registerHelper('hour', function(time) {
			if (time > 0) {
				return time + '&nbsp;&nbsp;<span class="label label-warning">小时</span>'
			}

		});
		// Extends Backbone.View
		var TMAbsenceOfThreeView = Backbone.View.extend({

			// The View Constructor
			initialize: function() {
				var self = this;
				this.template = Handlebars.compile($("#hbtmp_wf_three_list_view").html());
				// The render method is called when CollTask Models are added to the Collection
				this.bind_event();
			},

			// Renders all of the CollTask models on the UI
			render: function() {
				var self = this;
				var wf_data = self.model.attributes;
				var temp_arr = [];
				_.each(wf_data, function(temp) {
					if (temp.absence_type == String(absence_type)) {
						_.each(temp.data, function(t) {
							var obj = {
								_id: temp._id,
								date: t.start_date,
								reason: temp.reason,
								format_time: moment(t.start_date).format("YYYYMMDD"),
								is_full_day: t.is_full_day,
								time_zone_s: t.time_zone_s,
								time_zone_e: t.time_zone_e,
								hours: t.total_time,
								absence_type: temp.absence_type,
								people: temp.people,
								destination: temp.destination,
								category: temp.category,
								is_exchange: temp.is_exchange
							}
							temp_arr.push(obj);
						})
					}

				})
				var filter_data = _.sortBy(temp_arr, function(d) {
					return d.format_time
				})
				var rendered_data = _.map(filter_data, function(x) {
					return x;
				})
				var obj = {
					wf_absence_data: rendered_data
				}
				$("#personal_wf_three_list-content").html(self.template(obj));

				$("#personal_wf_three_list-content").trigger('create');
				return this
			},
			bind_event: function() {
				var self = this;

				$("#wf_three").on('change', '#wf_three_view_mode', function(event) {
					event.preventDefault();
					absence_type = $(this).val();
					self.render();
				})
					.on('click', '#btn_wf_add', function(event) {
						event.preventDefault();
						var type = $("#wf_three_view_mode").val();
						var obj = {
							type: type
						}
						var temp_obj = {
							'B': '#godo5/',
							'W': '#godo6/',
							'C': '#godo7/'
						}
						$.post('/admin/tm/beyond_work/wf_create', obj, function(data) {
							var goto_url = (data.ti._id + '-' + data.pd._id + '-') + (data.pd ? data.pd.process_code : '');
							console.log(goto_url);
							window.location.href = '/m' + temp_obj[type] + goto_url + '/' + 1;
						})

					})


			}
		});

		// Returns the View class
		return TMAbsenceOfThreeView;

	});