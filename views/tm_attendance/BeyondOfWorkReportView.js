// 我的加班统计报表
// =================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "moment"],
	function($, _, Backbone, Handlebars, moment) {
		var filter_month = moment().format("YYYY-MM");
		var months = {
			'1': '一月',
			'2': '二月',
			'3': '三月',
			'4': '四月',
			'5': '五月',
			'6': '六月',
			'7': '七月',
			'8': '八月',
			'9': '九月',
			'10': '十月',
			'11': '十一月',
			'12': '十二月',
		}
		// Extends Backbone.View
		var BeyondOfWorkReportView = Backbone.View.extend({

			// The View Constructor
			initialize: function() {
				var self = this;
				this.template = Handlebars.compile($("#hbtmp_beyond_of_work_list_view").html());
				// The render method is called when CollTask Models are added to the Collection
				this.bind_event();
			},

			// Renders all of the CollTask models on the UI
			render: function() {
				var self = this;
				var data = self.data;
				var temp_arr = [];
				_.each(data, function(temp) {
					_.each(temp.data, function(t) {
						var obj = {
							_id: temp._id,
							date: t.start_date,
							start_date: t.start_date,
							end_date: t.end_date,
							reason: temp.reason,
							format_time: moment(t.start_date).format("YYYYMMDD"),
							format_month: moment(t.start_date).format("YYYY-MM"),
							is_full_day: t.is_full_day,
							time_zone_s: t.time_zone_s,
							time_zone_e: t.time_zone_e,
							hours: t.total_time,
							absence_type: temp.absence_type,
							people: temp.people,
							destination: temp.destination,
							category: temp.category,
							is_exchange: temp.is_exchange,
							is_over: temp.is_over
						}
						temp_arr.push(obj);
					})

				})
				temp_arr = _.filter(temp_arr, function(temp) {
					return temp.format_month == String(filter_month)
				})
				var total_hours = _.reduce(_.map(temp_arr, function(temp) {
					return temp.hours
				}), function(mem, num) {
					return mem + num
				}, 0)

				var filter_data = _.sortBy(temp_arr, function(d) {
					return d.format_time
				})
				var obj = {
					data: filter_data.reverse(),
					total_hours: total_hours,
					filter_month: moment(filter_month).format("M")
				}

				$("#personal_beyond_of_work_report-content").html(self.template(obj));

				$("#personal_beyond_of_work_report-content").trigger('create');
				return this
			},
			bind_event: function() {
				var self = this;
				$("#show_beyond_of_work_report")
					.on('change', '#attendance_month_view_mode', function(event) {
						event.preventDefault();
						var select_month = Number($(this).val()) + 1;
						if (select_month / 10 >= 1) {
							select_month = moment().format("YYYY") + '-' + select_month;
						} else {
							select_month = moment().format("YYYY") + '-0' + select_month;

						}
						filter_month = select_month;
						self.render();
					})
			}
		});

		// Returns the View class
		return BeyondOfWorkReportView;

	});