// TmAbsenceOfThreeView List View
// =================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "moment"],
	function($, _, Backbone, Handlebars, moment) {
		var absence_type = 'B';
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
				var wf_data = self.wf_data;
				var temp_arr = [];
				_.each(wf_data, function(temp) {
					if (temp.absence_type == String(absence_type)) {
						var obj = {
							_id: temp._id,
							reason: temp.reason,
							create_start_date: temp.create_start_date,
							create_end_date: temp.create_end_date,
							format_time: moment(temp.create_start_date).format("YYYYMMDD"),
							absence_type: temp.absence_type,
							hours: temp.hours,
							people: temp.people,
							destination: temp.destination,
							category: temp.category,
							is_exchange: temp.is_exchange,
							is_over: temp.is_over,
							process_state: temp.process_state,
							pi_id: temp.pi_id,
							ti_id: temp.task_instance_id,
							pd_id: temp.pd_id,
							pd_code: temp.pd_code,
							state: (temp.process_state == 'END' ? true : false)
						}
						temp_arr.push(obj);
					}

				})
				var filter_data = _.sortBy(temp_arr, function(d) {
					return d.format_time
				})
				var rendered_data = _.map(filter_data, function(x) {
					return x;
				})
				var obj = {
					wf_absence_data: rendered_data.reverse()
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
						var temp_obj2 = {
							'B': '是否申请加班流程?',
							'W': '是否申请出差流程?',
							'C': '是否申请公干流程?'
						}
						if (confirm(temp_obj2[type])) {

							$.post('/admin/tm/beyond_work/wf_create', obj, function(data) {
								var goto_url = (data.ti._id + '-' + data.pd._id + '-') + (data.pd ? data.pd.process_code : '');
								console.log(goto_url);
								window.location.href = '/m' + temp_obj[type] + goto_url + '/' + 1;
							})
						}

					})
					.on('swiperight', function(event) { //向右滑动，打开左边的面板
						event.preventDefault();
						$("#show_attendance_result-left-panel").panel("open");
					})
					.on('click', '#btn-show_attendance_result-change_view', function(event) {
						event.preventDefault();
						window.location = '#attendance'
						$("#show_attendance_result-left-panel").panel("close");
					})
					.on('click', '#btn-show_card_record-change_view', function(event) {
						event.preventDefault();
						window.location = '#card_record'
						$("#show_attendance_result-left-panel").panel("close");
					})
					.on('click', '#btn-show_beyond_of_work_report-change_view', function(event) {
						event.preventDefault();
						window.location = '#attend_report'
						$("#show_attendance_result-left-panel").panel("close");
					}).on('click', '#wf_three_details', function(event) {
						event.preventDefault();
						var url = $(this).data("url");
						var absence_type = $(this).data("absence_type");
						var pi_id = $(this).data("pi_id");
						var temp_obj = {
							'B': '/m#godo5/',
							'W': '/m#godo6/',
							'C': '/m#godo7/'
						}
						var goto_url = temp_obj[String(absence_type)] + url;
						window.location.href = goto_url;

						// $.get('/admin/tm/beyond_work/wf_three_data_4_view_m/' + pi_id, function(data) {
						// 	var ti_id = data[0]._id;
						// 	var goto_url = temp_obj[String(absence_type)] + ti_id + url;
						// 	window.location.href = goto_url;
						// })

					})



			}
		});

		// Returns the View class
		return TMAbsenceOfThreeView;

	});