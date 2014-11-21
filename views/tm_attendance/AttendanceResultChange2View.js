// PeopleAttendanceResult List View
// =================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "moment"],
	function($, _, Backbone, Handlebars, moment) {
		var times_configs = null,
			time_type = null,
			times = null;

		function is_work_on_off(data) {
			var time = null;

			_.each(times_configs, function(config) {
				var f_d = _.find(config.calendar_data, function(dt) {
					if (time_type == '2') {
						return moment(data).isBefore(dt.expire_off) && moment(data).isAfter(dt.expire_on)
					} else {
						return dt.job_date == moment(data).format('YYYY-MM-DD')
					}
				})
				if (f_d) {
					time = _.find(times, function(temp) {
						return temp._id == String(f_d.work_time)
					})
					return
				};
			})
			return time
		}


		// Extends Backbone.View
		var AttendanceResultChange2View = Backbone.View.extend({

			// The View Constructor
			initialize: function() {
				var self = this;
				this.template = Handlebars.compile($("#hbtmp_personal_wf_attend_view_task").html());
				// The render method is called when CollTask Models are added to the Collection
				this.bind_event();
			},

			// Renders all of the CollTask models on the UI
			render: function() {
				var self = this;
				//工作时间数据
				times_configs = self.times_configs;
				time_type = self.time_type;
				times = self.times;

				//流程数据
				var wf_data = self.wf_data;
				var attendance = self.attendance;
				var bool = false;
				var arr_change = [];
				var time = is_work_on_off(self.date);
				var data = self.model.attributes[0].data;
				var people = self.model.attributes[0].people;
				if (attendance) {
					if (!!~attendance.work_result.indexOf('NCM')) {

						arr_change.push(true);
					} else {
						arr_change.push(false);
					};
					if (!!~attendance.work_result.indexOf('NCA')) {
						arr_change.push(true);
					} else {
						arr_change.push(false);
					};
				}
				if (!!~arr_change.indexOf(true)) {
					var bool = true;
				}

				var temp = {};
				if (bool) {
					if (!!~attendance.work_result.indexOf("NCM")) {
						temp.change_no_card_on = true;
					} else {
						temp.change_no_card_on = false;

					}
					if (!!~attendance.work_result.indexOf("NCA")) {
						temp.change_no_card_off = true;

					} else {
						temp.change_no_card_off = false;

					}
					temp.change_reason = attendance.change_reason;
				} else {
					if (!!~temp.work_result.indexOf("NCM")) {
						temp.change_no_card_on = true;
					} else {
						temp.change_no_card_on = false;

					}
					if (!!~temp.work_result.indexOf("NCA")) {
						temp.change_no_card_off = true;

					} else {
						temp.change_no_card_off = false;

					}
					temp.change_reason = '';
				}
				temp.attachments = wf_data.attachments;
				temp.history_tasks = wf_data.history_tasks;
				temp = _.extend(temp, attendance);
				var obj = {
					time: time,
					attendance_data: [temp]
				}
				$("#personal_wf_attend_view-content").html(self.template(obj));
				$("#personal_wf_attend_view-content").trigger('create');
				return this;

				//把 a 换成 span， 避免点那个滑块的时候页面跳走。
				$(".ui-flipswitch a").each(function() {
					$(this).replaceWith("<span class='" + $(this).attr('class') + "'></span>");
				});



			},
			bind_event: function() {
				var self = this;
				$("#personal_wf_attend_view-content").on('click', 'img', function(event) {
						event.preventDefault();
						// var img_view = '<div class="img_view" style="background-image:url('+this.src+')"></div>';
						var img_view = '<img src="' + this.src + '">';
						// img_view += '<a href="'+this.src.replace('get','download')+'" target="_blank">保存到本地</a>';
						$("#fullscreen-overlay").html(img_view).fadeIn('fast');
					})
					// $("#wf_attendance")
			},
			get_datas: function() {

				var self = this;

			},
		});

		// Returns the View class
		return AttendanceResultChange2View;

	});