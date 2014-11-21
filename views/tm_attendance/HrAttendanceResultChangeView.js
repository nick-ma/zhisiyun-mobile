// PeopleAttendanceResult List View
// =================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "moment"],
	function($, _, Backbone, Handlebars, moment) {


		var do_trans = function(trans_data) {
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
				} else {
					window.location = '#todo';

				};
			})
		}

		// Extends Backbone.View
		var HrAttendanceResultChangeView = Backbone.View.extend({

			// The View Constructor
			initialize: function() {
				var self = this;
				this.template = Handlebars.compile($("#hbtmp_personal_wf_attend_batch_view").html());
				this.trans_template = Handlebars.compile($("#trans_confirm_view").html());

				// The render method is called when CollTask Models are added to the Collection
				this.bind_event();
			},

			// Renders all of the CollTask models on the UI
			render: function() {
				var self = this;

				//附件数据
				if (localStorage.getItem('upload_model_back')) { //有从上传页面发回来的数据
					self.wf_data = JSON.parse(localStorage.getItem('upload_model_back')).model;

					localStorage.removeItem('upload_model_back'); //用完删掉
				};
				//流程数据
				var wf_data = self.wf_data;
				var attendance = self.attendance;
				var bool = false;
				var arr_change = [];

				if (self.view_mode) {
					if (self.view_mode == 'trans') {
						$("#wf_attendance_batch_title").html('数据处理人');

						$("#personal_wf_attend_batch-content").html(self.trans_template(self.trans_data));
						$("#personal_wf_attend_batch-content").trigger('create');

						if (self.trans_data.next_td.node_type == 'END') {
							do_trans(self.trans_data);
						}
					} else if (self.view_mode == 'deal_with') {
						if (attendance) {
							if (!!~attendance.work_result.indexOf('L')) {

								arr_change.push(true);
							} else {
								arr_change.push(false);
							};
							if (!!~attendance.work_result.indexOf('E')) {
								arr_change.push(true);
							} else {
								arr_change.push(false);
							};
						}
						if (!!~arr_change.indexOf(true)) {
							var bool = true;
						}
						if (bool) {
							if (!!~attendance.work_result.indexOf("L")) {
								attendance.change_no_card_on = true;
							} else {
								attendance.change_no_card_on = false;

							}
							if (!!~attendance.work_result.indexOf("E")) {
								attendance.change_no_card_off = true;

							} else {
								attendance.change_no_card_off = false;

							}
						}
						attendance.people = attendance.people;
						attendance.job_date = attendance.change_date;
						attendance.tts = wf_data.tts;
						attendance.pd = wf_data.pd;
						attendance.td = wf_data.td;
						attendance.ti = wf_data.ti;
						attendance.attachments = wf_data.attachments;
						attendance.history_tasks = wf_data.history_tasks;
						var rendered_data = [];
						rendered_data.push(attendance);
						var obj = {
							attendance_data: rendered_data,
							attendance: attendance,
							view_mode: 'edit'

						}
						$("#personal_wf_attend_batch-content").html(self.template(obj));
						$("#personal_wf_attend_batch-content").trigger('create');
						$("#btn_save").hide();

						return this;
					} else if (self.view_mode == 'view') {
						if (attendance) {
							if (!!~attendance.work_result.indexOf('L')) {

								arr_change.push(true);
							} else {
								arr_change.push(false);
							};
							if (!!~attendance.work_result.indexOf('E')) {
								arr_change.push(true);
							} else {
								arr_change.push(false);
							};
						}
						if (!!~arr_change.indexOf(true)) {
							var bool = true;
						}
						if (bool) {
							if (!!~attendance.work_result.indexOf("L")) {
								attendance.change_no_card_on = true;
							} else {
								attendance.change_no_card_on = false;

							}
							if (!!~attendance.work_result.indexOf("E")) {
								attendance.change_no_card_off = true;

							} else {
								attendance.change_no_card_off = false;

							}
						}
						attendance.people = attendance.people;
						attendance.job_date = attendance.change_date;
						attendance.attachments = wf_data.attachments;
						attendance.history_tasks = wf_data.history_tasks;
						var rendered_data = [];
						rendered_data.push(attendance);
						var obj = {
							attendance_data: rendered_data,
							attendance: attendance,
							view_mode: 'view'
						}
						$("#personal_wf_attend_batch-content").html(self.template(obj));
						$("#personal_wf_attend_batch-content").trigger('create');
						$("#btn_save").hide();

						return this;
					}
				}
				//把 a 换成 span， 避免点那个滑块的时候页面跳走。
				$(".ui-flipswitch a").each(function() {
					$(this).replaceWith("<span class='" + $(this).attr('class') + "'></span>");
				});



			},
			bind_event: function() {
				var self = this;
				$("#personal_wf_attend_batch-content").on('click', '.do_trans', function(event) {
					event.preventDefault();
					var $this = $(this);
					if ($("#personal_wf_attend_batch-content #ti_comment").val() == '') {
						alert('请填写审批意见！');
						return;
					}
					$(this).attr('disabled', true)
					$.mobile.loading("show");
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
							ti_comment: $("#personal_wf_attend_batch-content #ti_comment").val(),
							task_instance_id: task_instance_id,
							next_tdid: target_id,
							direction: direction,
							attachments: self.wf_data.attachments

						}, function(data) {
							self.view_mode = 'trans';
							self.trans_data = data;
							$.mobile.loading("hide");

							self.render();
						});
					} else {
						$.post('/admin/wf/trans_confirm_form_4m', {
							process_define_id: process_define_id,
							task_define_id: task_define_id,
							process_instance_id: process_instance_id,
							task_process_url: task_process_url,
							next_tdname: task_name,
							trans_name: name,
							ti_comment: $("#personal_wf_attend_batch-content #ti_comment").val(),
							task_instance_id: task_instance_id,
							next_tdid: target_id,
							direction: direction,
							attachments: self.wf_data.attachments

						}, function(data) {
							self.view_mode = 'trans';
							self.trans_data = data;
							$.mobile.loading("hide");

							self.render();
						});

					}


				})
				$("#personal_wf_attend_batch-content").on('click', '#btn_ok', function(e) {
					$.mobile.loading("show");

					if ($("#next_user_name").val()) {
						$("#btn_ok").attr("disabled", "disabled");
						if (!self.view_mode) {
							do_trans(self.trans_data);
						} else {
							do_trans(self.trans_data);
						}
						$.mobile.loading("show");

					} else {
						alert('请选择下一任务的处理人');
					};
				})
				$("#personal_wf_attend_batch-content").on('click', '#btn_trans_cancel', function(event) {
					event.preventDefault();
					window.location.reload();
				})
				$("#personal_wf_attend_batch-content").on('click', '#btn_wf_start_userchat', function(event) {
						event.preventDefault();
						var url = "im://userchat/" + self.attendance.people;
						console.log(url);
						window.location.href = url;
					}).on('click', '#btn_upload_attachment', function(event) {
						//转到上传图片的页面
						localStorage.removeItem('upload_model_back'); //先清掉
						var next_url = '#upload_pic';
						localStorage.setItem('upload_model', JSON.stringify({
							model: self.wf_data,
							field: 'attachments',
							back_url: window.location.hash
						}))
						window.location.href = next_url;


					}).on('click', 'img', function(event) {
						event.preventDefault();
						// var img_view = '<div class="img_view" style="background-image:url('+this.src+')"></div>';
						var img_view = '<img src="' + this.src + '">';
						// img_view += '<a href="'+this.src.replace('get','download')+'" target="_blank">保存到本地</a>';
						$("#fullscreen-overlay").html(img_view).fadeIn('fast');
					})
					// $("#wf_attendance")
			},

		});

		// Returns the View class
		return HrAttendanceResultChangeView;

	});