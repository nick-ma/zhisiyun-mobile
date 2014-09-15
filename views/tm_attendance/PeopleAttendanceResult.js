// PeopleAttendanceResult List View
// =================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "moment"],
	function($, _, Backbone, Handlebars, moment) {
		var filter_month = moment().format("YYYY-MM");
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
				var people = self.model.attributes[0].people || $("#login_people").val();

				var filter_data = _.sortBy(_.filter(data, function(temp) {
					temp.format_time = moment(temp.job_date).format("YYYYMMDD");
					if (!!~temp.work_result.indexOf("NCM") || !!~temp.work_result.indexOf("NCA")) {
						temp.attendance_diff = true;
					} else {
						temp.attendance_diff = false;
					};
					temp.people = people;
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
						if (select_month / 10 >= 1) {
							select_month = moment().format("YYYY") + '-' + select_month;
						} else {
							select_month = moment().format("YYYY") + '-0' + select_month;

						}
						filter_month = select_month;
						self.render();
					})
					.on('click', '#attendance_result_change', function(event) {
						// var change_date = $(this).data("date");
						var obj = {
							change_date: $(this).data("date"),
							type: 'A'
						}
						if (confirm("是否申请处理考勤异常?")) {
							$.post('/admin/tm/beyond_work/wf_create', obj, function(data) {
								var goto_url = (data.ti._id + '-' + data.pd._id + '-') + (data.pd ? data.pd.process_code : '');
								window.location.href = '/m' + '#godo4/' + goto_url + '/' + 1;
							})

						}
					})
					.on('click','#go_back',function(event){
						event.preventDefault();
						window.location = '#wf_three';
					})
			}
		});

		// Returns the View class
		return MyAttendanceListView;

	});