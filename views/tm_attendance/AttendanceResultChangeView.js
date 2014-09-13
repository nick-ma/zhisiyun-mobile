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

		function save_form_data(cb) {
			var url = '/admin/tm/tm_wf/edit_formdata';
			// var post_data = $("#frmWFAttendanceResultChange").serialize();
			// re-disabled the set of inputs that you previously enabled
			// disabled.attr('disabled', 'disabled');
			var change_result = [];
			if ($("#change_no_card_on").val() == 'NCM') {
				change_result.push('NCM');
			}
			if ($("#change_no_card_off").val() == 'NCA') {
				change_result.push('NCA');
			}

			var change_date = $("#change_date").val();
			var arr1 = [],
				arr2 = [];
			arr1.push(change_date);
			var time = is_work_on_off(change_date);
			if (time.work_on_time) {
				arr1.push(time.work_on_time);
			} else {
				arr2.push("09:00");
			}
			if (time.is_cross_day) {
				arr2.push(moment(change_date).add('days', 1).format("YYYY-MM-DD"));
			} else {
				arr2.push(change_date);

			}
			if (time.wokr_off_time) {
				arr2.push(time.work_on_time);

			} else {
				arr2.push("18:00");
			}
			var come_time = moment(arr1.join(" "));
			var leave_time = moment(arr2.join(" "));

			var post_data = 'change_result=' + JSON.stringify(change_result);
			post_data += '&change_reason=' + $('#change_reason').val();
			post_data += '&change_date=' + $('#change_date').val();
			post_data += '&attendance_id=' + $('#attendance_id').val();
			post_data += '&come_time=' + come_time;
			post_data += '&leave_time=' + leave_time;
			$.post(url, post_data, function(data) {
				cb(data)
			})
		}

		var do_trans = function() {
			save_form_data(function() {
				var post_data = {
					process_instance_id: $("#process_instance_id").val(),
					task_instance_id: $("#task_instance_id").val(),
					process_define_id: $("#process_define_id").val(),
					next_tdid: $("#next_tdid").val(),
					next_user: $("#next_user_id").val() || null, //'516cf9a1d26ad4fe48000001', //以后从列表中选出
					trans_name: $("#trans_name").val(), // 转移过来的名称
					comment_msg: $("#comment_msg").val(), // 任务批注 
				};
				var post_url = $("#task_process_url").val();
				post_url = post_url.replace('<TASK_ID>', $("#task_instance_id").val());

				$.post(post_url, post_data, function(data) {
					if (data.code == 'OK') {

						window.location = '#todo';
					};
				})
			})
		}

		// Extends Backbone.View
		var AttendanceResultChangeView = Backbone.View.extend({

			// The View Constructor
			initialize: function() {
				var self = this;
				this.template = Handlebars.compile($("#hbtmp_personal_wf_attend_view").html());
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
				if (self.view_mode) {
					if (self.view_mode == 'trans') {
						$("#wf_attendance_title").html('数据处理人');

						this.template = Handlebars.compile($("#trans_confirm_view").html());
						$("#personal_wf_attend-content").html(self.template(self.trans_data));
						$("#personal_wf_attend-content").trigger('create');

						if (self.trans_data.next_td.node_type == 'END') {
							do_trans();
						}
					} else if (self.view_mode == 'deal_with') {
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
						if (bool) {
							if (!!~attendance.work_result.indexOf("NCM")) {
								attendance.change_no_card_on = true;
							} else {
								attendance.change_no_card_on = false;

							}
							if (!!~attendance.work_result.indexOf("NCA")) {
								attendance.change_no_card_off = true;

							} else {
								attendance.change_no_card_off = false;

							}
						}
						attendance.job_date = attendance.change_date;
						attendance.tts = wf_data.tts;
						attendance.pd = wf_data.pd;
						attendance.td = wf_data.td;
						attendance.ti = wf_data.ti;
						attendance.history_tasks = wf_data.history_tasks;
						var rendered_data = [];
						rendered_data.push(attendance);
						var obj = {
							attendance_data: rendered_data,
						}

						$("#personal_wf_attend-content").html(self.template(obj));
						$("#personal_wf_attend-content").trigger('create');

						return this;
					}
				} else {
					// if (!self.attendance) {
					// 	$("#wf_attendance_title").html('异常处理流程');
					// 	self.get_datas();
					// 	console.log(self)
					// 	this.template = Handlebars.compile($("#hbtmp_personal_wf_attend_view").html());
					// }
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

					var filter_data = _.filter(data, function(temp) {
						var bool = !!~temp.work_result.indexOf("NCM") || !!~temp.work_result.indexOf("NCA");
						return bool && temp.is_job_day && moment(temp.job_date).format("YYYY-MM-DD") == String(self.date);
					})
					filter_data = _.each(filter_data, function(temp) {
						temp.format_time = moment(temp.job_date).format("YYYYMMDD");
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

						temp.tts = wf_data.tts;
						temp.pd = wf_data.pd;
						temp.td = wf_data.td;
						temp.ti = wf_data.ti;
						temp.history_tasks = wf_data.history_tasks;
					})
					var rendered_data = _.map(filter_data, function(x) {
						return x;
					})
					var obj = {
						attendance_data: rendered_data,
					}
					$("#personal_wf_attend-content").html(self.template(obj));
					$("#personal_wf_attend-content").trigger('create');
					return this;
				}



			},
			bind_event: function() {
				var self = this;
				$("#personal_wf_attend-content").on('click', '.do_trans', function(event) {
					if ($("#ti_comment").val() == '') {
						alert('请填写审批意见！');
						return;
					}

					event.preventDefault();
					var $this = $(this);

					var process_define_id = $("#process_define_id").val();
					var task_define_id = $("#task_define_id").val();
					var process_instance_id = $("#process_instance_id").val();
					var task_process_url = $("#task_process_url").val();
					var task_instance_id = $("#task_instance_id").val();

					var direction = $this.data('direction');
					var target_id = $this.data('target_id');
					var task_name = $this.data('task_name');
					var name = $this.data('name');
					var roles_type = $this.data('roles_type');
					var position_form_field = $this.data('position_form_field');
					if (self.view_mode) {
						$.post('/admin/wf/trans_confirm_form_4m', {
							process_define_id: process_define_id,
							task_define_id: task_define_id,
							process_instance_id: process_instance_id,
							task_process_url: task_process_url,
							next_tdname: task_name,
							trans_name: name,
							ti_comment: $("#ti_comment").val(),
							task_instance_id: task_instance_id,
							next_tdid: target_id,
							direction: direction
						}, function(data) {
							self.view_mode = 'trans';
							self.trans_data = data;
							self.render();
						});
					} else {
						save_form_data(function(data) {
							$.post('/admin/wf/trans_confirm_form_4m', {
								process_define_id: process_define_id,
								task_define_id: task_define_id,
								process_instance_id: process_instance_id,
								task_process_url: task_process_url,
								next_tdname: task_name,
								trans_name: name,
								ti_comment: $("#ti_comment").val(),
								task_instance_id: task_instance_id,
								next_tdid: target_id,
								direction: direction
							}, function(data) {
								self.view_mode = 'trans';
								self.trans_data = data;
								self.render();
							});
						})

					}


				})
				$("#personal_wf_attend-content").on('click', '#btn_ok', function(e) {
					if ($("#next_user_name").val()) {
						$("#btn_ok").attr("disabled", "disabled");
						if (!self.view_mode) {
							do_trans();
						} else {
							do_trans();
						}

					} else {
						alert('请选择下一任务的处理人');
					};
				})
				$("#personal_wf_attend-content").on('click', '#btn_trans_cancel', function(event) {
					event.preventDefault();
					window.location.reload();
				})
				$("#personal_wf_attend-content").on('click', '#btn_save', function(event) {
					event.preventDefault();
					save_form_data(function(data) {
						alert("数据保存成功");

					})
				})
				// $("#wf_attendance")
			},
			get_datas: function() {

				var self = this;

			},
		});

		// Returns the View class
		return AttendanceResultChangeView;

	});