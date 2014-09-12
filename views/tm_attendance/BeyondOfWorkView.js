// PeopleAttendanceResult List View
// =================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "moment"],
	function($, _, Backbone, Handlebars, moment) {
		Handlebars.registerHelper('category', function(num, category_mue) {
			return category_mue[num]
		});
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
		var BeyondOfWorkView = Backbone.View.extend({

			// The View Constructor
			initialize: function() {
				var self = this;
				this.template = Handlebars.compile($("#hbtmp_wf_beyond_of_work_list_view").html());
				this.details_template = Handlebars.compile($("#wf_three_details_view").html());
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
				console.log(self);
				//加班类别数据
				var category_mue = {
						'1': '正常工作日加班',
						'2': '休息日加班',
						'3': '法定节假日加班'
					},
					category_arr = [{
						"num": '1'
					}, {
						"num": '2'
					}, {
						"num": '3'
					}];

				var obj = _.extend(wf_data, {
					"category_arr": category_arr
				}, {
					"category_mue": category_mue
				});
				//是否全天任务判断
				var is_full_day = self.is_full_day;
				if (wf_data.leave.data > 0) {

					var is_full_day_data = _.find(leave.data, function(temp) {
						return temp.is_full_day == false
					})
					is_full_day = is_full_day_data ? false : true;

				}
				obj.is_full_day = is_full_day;
				//判断是否有开始和结束时间
				obj.leave.create_start_date = wf_data.leave.create_start_date ? wf_data.leave.create_start_date : new Date();
				obj.leave.create_end_date = wf_data.leave.create_end_date ? wf_data.leave.create_end_date : new Date();
				//当天工作时间
				var today_time = is_work_on_off(new Date());
				// console.log(today_time);
				// obj.work_time = today_time;
				var day_hours = 0;
				if (today_time) {
					day_hours = today_time.work_time_hour;
				}
				obj.leave.hours = wf_data.leave.hours ? wf_data.leave.hours : day_hours;
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
					console.log(obj)
					$("#personal_wf_beyond_of_work-content").html(self.template(obj));
					$("#personal_wf_beyond_of_work-content").trigger('create');
					return this;
				}



			},
			render2: function() {
				var self = this;
			},
			bind_event: function() {
				var self = this;
				$("#personal_wf_beyond_of_work-content").on('click', '.do_trans', function(event) {
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


				}).on('click', '#btn_ok', function(e) {
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
				}).on('click', '#btn_trans_cancel', function(event) {
					event.preventDefault();
					window.location.reload();
				}).on('click', '#btn_save', function(event) {
					event.preventDefault();
					save_form_data(function(data) {
						console.log(data)
						alert("数据保存成功");

					})
				}).on('change', '#is_full_day', function(event) {
					var is_full_day = $(this).val();
					self.is_full_day = is_full_day == "false" ? false : true;
					self.render();
				})
				// $("#wf_attendance")
			},
			get_datas: function() {

				var self = this;

			},
		});

		// Returns the View class
		return BeyondOfWorkView;

	});