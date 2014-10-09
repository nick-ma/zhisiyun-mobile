// PeopleAttendanceResult List View
// =================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "moment"],
	function($, _, Backbone, Handlebars, moment) {
		var times_configs = null,
			time_type = null,
			times = null;

		function time_parse(start_date) {
			s_date = start_date.split('T')[0];
			s_zone = start_date.split('T')[1] || null;
			var o = {
				date: s_date,
				zone: s_zone,
			}
			return o
		}
		//判断这天是不是半天
		function compare(st_zone, ed_zone, ost_zone, oed_zone) {
			var bool = false
			if (st_zone == ost_zone && ed_zone == oed_zone) {
				return true
			}
			return bool;
		}
		//计算时间
		function calculate_hours(time, start_time, s_hour, end_time, e_hour) {
			var time_long = null;
			var s_hour = moment.duration(s_hour);
			var e_hour = moment.duration(e_hour);
			var work_on_time = moment.duration(time.work_on_time);
			var work_off_time = moment.duration(time.work_off_time);
			var rest_start = moment.duration(time.rest_start);
			var rest_end = moment.duration(time.rest_end);
			var s_up = s_hour >= work_on_time && s_hour <= rest_start;
			var e_up = e_hour >= work_on_time && e_hour <= rest_start; //同在上午

			var s_down = s_hour >= rest_end && s_hour <= work_off_time;
			var e_down = e_hour >= rest_end && e_hour <= work_off_time; //同在下午

			var s_center = s_hour >= work_on_time && s_hour <= work_off_time; //同在上班时间段(包括上边两个判断了)
			var e_center = e_hour >= work_on_time && e_hour <= work_off_time;
			if (s_up && e_up || s_down && e_down) {
				time_long = (e_hour - s_hour) / 60000 / 60
			} else if (s_center && e_center) {
				time_long = ((rest_start - s_hour) + (e_hour - rest_end)) / 60000 / 60
			} else {
				time_long = (e_hour - s_hour) / 60000 / 60

			}


			return time_long
		}

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
				if (f_d && f_d.is_job_day) {
					time = _.find(times, function(temp) {
						return temp._id == String(f_d.work_time)
					})
					return
				}

			})
			return time
		}

		function assemble(self, st, ed) {
			if (st.zone == 'null' || st.zone == null) {
				var time = is_work_on_off(st.date);
				if (time) {
					st.zone = time.work_on_time
				}
			};
			if (ed.zone == 'null' || ed.zone == null) {
				var time = is_work_on_off(ed.date);
				if (time) {
					ed.zone = time.work_off_time
				}
			};
			if (st.date && ed.date) {
				var days_between = moment(ed.date).diff(moment(st.date), 'days');
				var date_items = [];
				if (days_between == 0) {
					var time = is_work_on_off(st.date);
					if (time) {
						date_items.push({
							is_full_day: compare(st.zone, ed.zone, time.work_on_time, time.work_off_time),
							start_date: st.date,
							end_date: ed.date,
							work_on_time: time.work_on_time,
							work_off_time: time.work_off_time,
							time_zone_s: st.zone,
							time_zone_e: ed.zone,
							total_time: calculate_hours(time, st.date, st.zone, ed.date, ed.zone),

						})
					};
				} else {
					var num = null;
					for (var i = 0; i <= days_between; i++) {
						var iterate_date = moment(st.date).add('days', i).format('YYYY-MM-DD');
						var time = is_work_on_off(iterate_date, self.is_full_day);
						if (time) {

							var o = {
								is_full_day: compare(st.zone, ed.zone, time.work_on_time, time.work_off_time),
								start_date: iterate_date,
								end_date: iterate_date,
								work_on_time: time.work_on_time,
								work_off_time: time.work_off_time,
							}
							if (i == 0) {
								o.time_zone_s = st.zone;
								o.time_zone_e = time.work_off_time;
								o.is_full_day = compare(st.zone, time.work_off_time, time.work_on_time, time.work_off_time);
								o.total_time = calculate_hours(time, iterate_date, st.zone, iterate_date, time.work_off_time);

							} else if (i == days_between) {
								o.time_zone_s = time.work_on_time;
								o.time_zone_e = ed.zone;
								o.is_full_day = compare(time.work_on_time, ed.zone, time.work_on_time, time.work_off_time);
								o.total_time = calculate_hours(time, iterate_date, time.work_on_time, iterate_date, ed.zone);
							} else {

								o.time_zone_s = time.work_on_time;
								o.time_zone_e = time.work_off_time;
								o.is_full_day = compare(time.work_on_time, time.work_off_time, time.work_on_time, time.work_off_time);
								o.total_time = calculate_hours(time, iterate_date, time.work_on_time, iterate_date, time.work_off_time);

							}
							date_items.push(o)
						};

					};

				}
				var total_value = 0;
				_.each(date_items, function(dt) {
					total_value += dt.total_time
				})
				if (date_items.length > 0) {
					self.wf_data.leave.create_start_date = _.first(date_items).start_date + ' ' + _.first(date_items).time_zone_s;
					self.wf_data.leave.create_end_date = _.last(date_items).end_date + ' ' + _.last(date_items).time_zone_e;

				}
				self.wf_data.leave.data = date_items;
				self.wf_data.leave.hours = total_value;
				if (String(total_value).indexOf('.') != -1) {
					$('#hours').val(parseFloat(total_value).toFixed(2) + '小时');
				} else {
					$('#hours').val(parseInt(total_value) + '小时');

				}
				//判断公干时间需在上班时间内。
				// if (!self.is_full_day && date_items.length == 1) {
				// 	if (moment.duration(date_items[0].time_zone_s) < moment.duration(date_items[0].work_on_time) || moment.duration(date_items[0].time_zone_e) > moment.duration(date_items[0].work_off_time)) {
				// 		alert('公干时间需在上班时间内!');

				// 		self.wf_data.leave.data = [];
				// 		self.wf_data.leave.hours = 0;
				// 		$('#hours').val('');
				// 		$("#create_end_date").val(moment(new Date()).format('YYYY-MM-DDTHH:mm'));
				// 		$("#create_start_date").val(moment(new Date()).format('YYYY-MM-DDTHH:mm'));
				// 	}
				// }

			};

		}


		function format(date) {
			return moment(date).format("YYYY-MM-DD");
		}

		function save_form_data(wf_data, cb) {
			var url = '/admin/tm/work_city/edit_formdata';
			var leaves = wf_data.leave.data;
			var leave_id = wf_data.leave._id;
			var obj = {
				leaves: JSON.stringify(leaves),
				leave_id: leave_id,
			}
			var post_data = _.extend(obj, wf_data.leave);
			post_data.reason = $("#reason").val()
			$.post(url, post_data, function(data) {
				cb(data)
			})
		}

		var do_trans = function(trans_data) {
			// save_form_data_b(function() {
			var post_data = {
				process_instance_id: $("#personal_wf_work_of_city-content #process_instance_id").val(),
				task_instance_id: $("#personal_wf_work_of_city-content #task_instance_id").val(),
				process_define_id: $("#personal_wf_work_of_city-content #process_define_id").val(),
				next_tdid: $("#personal_wf_work_of_city-content #next_tdid").val(),
				next_user: $("#personal_wf_work_of_city-content #next_user_id").val() || null, //'516cf9a1d26ad4fe48000001', //以后从列表中选出
				trans_name: $("#personal_wf_work_of_city-content #trans_name").val(), // 转移过来的名称
				comment_msg: $("#personal_wf_work_of_city-content #comment_msg").val(), // 任务批注 
				attachments: trans_data.attachments || null

			};
			var post_url = $("#personal_wf_work_of_city-content #task_process_url").val();
			post_url = post_url.replace('<TASK_ID>', $("#personal_wf_work_of_city-content #task_instance_id").val());

			$.post(post_url, post_data, function(data) {
				if (data.code == 'OK') {

					window.location = '#todo';
				};
			})
			// })
		}

		// Extends Backbone.View
		var WorkOfCityView = Backbone.View.extend({

			// The View Constructor
			initialize: function() {
				var self = this;
				this.template = Handlebars.compile($("#hbtmp_wf_work_of_city_list_view").html());
				this.details_template = Handlebars.compile($("#wf_three_details_view").html());
				this.trans_template = Handlebars.compile($("#trans_confirm_view").html());
				this.loading_template = Handlebars.compile($("#loading_template_view").html());

				// The render method is called when CollTask Models are added to the Collection
				this.bind_event();
			},
			pre_render: function() {
				var self = this;
				$("#personal_wf_work_of_city-content").html(self.loading_template({
					info_msg: '数据加载中...请稍候'
				}));
				$("#personal_wf_work_of_city-content").trigger('create');
				return this;
			},
			// Renders all of the CollTask models on the UI
			render: function() {
				var self = this;
				//工作时间数据
				times_configs = self.times_configs;
				time_type = self.time_type;
				times = self.times;
				//附件数据
				if (localStorage.getItem('upload_model_back')) { //有从上传页面发回来的数据
					self.wf_data = JSON.parse(localStorage.getItem('upload_model_back')).model;
					localStorage.removeItem('upload_model_back'); //用完删掉
				};
				//流程数据
				var wf_data = self.wf_data;
				var obj = _.extend(wf_data, {});
				//是否全天任务判断
				var is_full_day = self.wf_data.is_full_day;
				// if (wf_data.leave.data.length > 0) {
				// 	var is_full_day_data = _.find(wf_data.leave.data, function(temp) {
				// 		return temp.is_full_day == false
				// 	})
				// 	is_full_day = is_full_day_data == undefined ? false : true;
				// }
				obj.is_full_day = is_full_day;
				//判断是否有开始和结束时间
				var start_date = moment(wf_data.leave.create_start_date || new Date).format('YYYY-MM-DD');
				var end_date = moment(wf_data.leave.create_end_date || new Date).format('YYYY-MM-DD');
				var time_zone_s = _.first(wf_data.leave.data) ? _.first(wf_data.leave.data).time_zone_s : null;
				var time_zone_e = _.last(wf_data.leave.data) ? _.last(wf_data.leave.data).time_zone_e : null;
				assemble(self, time_parse(start_date + 'T' + time_zone_s), time_parse(end_date + 'T' + time_zone_e));

				// obj.leave.create_start_date = wf_data.leave.create_start_date ? wf_data.leave.create_start_date : new Date();
				// obj.leave.create_end_date = wf_data.leave.create_end_date ? wf_data.leave.create_end_date : new Date();
				//当天工作时间
				var today_time = is_work_on_off(new Date(), self.is_full_day);
				var day_hours = 8;
				obj.leave.hours = wf_data.leave.hours ? wf_data.leave.hours : day_hours;
				if (self.view_mode) {
					if (self.view_mode == 'trans') {
						$("#wf_attendance_title").html('数据处理人');

						$("#personal_wf_work_of_city-content").html(self.trans_template(self.trans_data));
						$("#personal_wf_work_of_city-content").trigger('create');

						if (self.trans_data.next_td.node_type == 'END') {
							do_trans(self.trans_data);
						}
					} else if (self.view_mode == 'deal_with') {
						$("#personal_wf_work_of_city-content").html(self.template(obj));
						$("#personal_wf_work_of_city-content").trigger('create');
						$("#btn_save").hide();
						$("#personal_wf_work_of_city-content #create_start_date,#create_end_date,#hours,#reason").attr("readonly", true);

						return this;
					}
				} else {
					$("#personal_wf_work_of_city-content").html(self.template(obj));
					$("#personal_wf_work_of_city-content").trigger('create');
					return this;
				}
				//把 a 换成 span， 避免点那个滑块的时候页面跳走。
				$(".ui-flipswitch a").each(function() {
					$(this).replaceWith("<span class='" + $(this).attr('class') + "'></span>");
				});



			},
			render2: function() {
				var self = this;
				var obj = self.wf_data;
				save_form_data(obj, function() {
					$("#wf_work_of_city_title").html("公干明细");
					$("#personal_wf_work_of_city-content").html(self.details_template(obj));
					$("#personal_wf_work_of_city-content").trigger('create');
					return this;
				})

			},
			bind_event: function() {
				var self = this;
				$("#personal_wf_work_of_city-content").on('click', '.do_trans', function(event) {
					event.preventDefault();
					var $this = $(this);
					if ($("#personal_wf_work_of_city-content #ti_comment").val() == '') {
						alert('请填写审批意见！');
						return;
					}
					$(this).attr('disabled', true)
					$.mobile.loading("show");

					var process_define_id = $("#personal_wf_work_of_city-content #process_define_id").val();
					var task_define_id = $("#personal_wf_work_of_city-content #task_define_id").val();
					var process_instance_id = $("#personal_wf_work_of_city-content #process_instance_id").val();
					var task_process_url = $("#personal_wf_work_of_city-content #task_process_url").val();
					var task_instance_id = $("#personal_wf_work_of_city-content #task_instance_id").val();

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
							ti_comment: $("#personal_wf_work_of_city-content #ti_comment").val(),
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
						var obj = self.wf_data;
						save_form_data(obj, function(data) {
							$.post('/admin/wf/trans_confirm_form_4m', {
								process_define_id: process_define_id,
								task_define_id: task_define_id,
								process_instance_id: process_instance_id,
								task_process_url: task_process_url,
								next_tdname: task_name,
								trans_name: name,
								ti_comment: $("#personal_wf_work_of_city-content #ti_comment").val(),
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
						})

					}


				}).on('click', '#btn_ok', function(e) {
					$.mobile.loading("show");
					if ($("#next_user_name").val()) {
						$("#btn_ok").attr("disabled", "disabled");
						if (!self.view_mode) {
							do_trans(self.trans_data);
						} else {
							do_trans(self.trans_data);
						}
						$.mobile.loading("hide");


					} else {
						alert('请选择下一任务的处理人');
					};
				}).on('click', '#btn_trans_cancel', function(event) {
					event.preventDefault();
					window.location.reload();
				}).on('click', '#btn_save', function(event) {
					event.preventDefault();
					var obj = self.wf_data;
					save_form_data(obj, function(data) {
						alert("数据保存成功");

					})
				}).on('change', '#is_full_day', function(event) {
					event.preventDefault();
					var is_full_day = $(this).val();
					self.wf_data.is_full_day = is_full_day == "false" ? false : true;
					var end_date = $("#create_end_date").val();
					var start_date = $("#create_start_date").val();
					st = time_parse(start_date);
					ed = time_parse(end_date);
					if (self.is_self) {
						assemble(self, st, ed);
						self.wf_data.leave.reason = $("#personal_wf_work_of_city-content #reason").val();

						self.render();

					}

					//把 a 换成 span， 避免点那个滑块的时候页面跳走。
					$(".ui-flipswitch a").each(function() {
						$(this).replaceWith("<span class='" + $(this).attr('class') + "'></span>");
					});

				}).on('click', '#create_data', function(event) {
					self.page_mode = 'detail';
					// self.wf_data.leave.create_start_date = $("#personal_wf_work_of_city-content #create_start_date").val();
					// self.wf_data.leave.create_end_date = $("#personal_wf_work_of_city-content #create_end_date").val();
					self.wf_data.leave.hours = $("#personal_wf_work_of_city-content #hours").val();
					var end_date = $("#personal_wf_work_of_city-content #create_end_date").val();
					var start_date = $("#personal_wf_work_of_city-content #create_start_date").val();
					st = time_parse(start_date);
					ed = time_parse(end_date);
					assemble(self, st, ed);
					self.wf_data.leave.reason = $("#personal_wf_work_of_city-content #reason").val();

					self.render2();
				}).on('change', '#create_end_date, #create_start_date', function(event) {
					var type = $(this).data('type');
					// self.wf_data.leave.create_start_date = $("#personal_wf_work_of_city-content #create_start_date").val();
					// self.wf_data.leave.create_end_date = $("#personal_wf_work_of_city-content #create_end_date").val();

					if (type == 'S') {
						var start_date = $(this).val();
						var end_date = $("#create_end_date").val();


					} else {
						var start_date = $("#create_start_date").val();
						var end_date = $(this).val();

					}
					st = time_parse(start_date);
					ed = time_parse(end_date);
					assemble(self, st, ed);

				}).on('click', '#btn_wf3_start_userchat', function(event) {
					event.preventDefault();
					var url = "im://userchat/" + self.wf_data.leave.people._id;
					console.log(url);
					window.location.href = url;
				})
				$("#wf_work_of_city").on('click', '#go_back', function(event) {
					if (self.page_mode == 'detail') {
						$("#wf_work_of_city_title").html("公干申请流程");
						self.page_mode = 'wf_three';
						if (self.mode == '2') {
							self.render();
							$("#personal_wf_work_of_city-content").find("textarea").attr("disabled", true);
							$("#wf_work_of_city_title").html("市区公干流程查看")
							$("#personal_wf_work_of_city-content").find("button").attr("disabled", true);
							$("#personal_wf_work_of_city-content").find("input").attr("disabled", true);
							$("#personal_wf_work_of_city-content").find("a").attr("disabled", true);
							$("#personal_wf_work_of_city-content").find("select").attr("disabled", true);
							$("#personal_wf_work_of_city-content").find("select[id='is_full_day']").parent().parent().parent().parent().remove() // self.render();
						} else {
							self.render();
						}
						//把 a 换成 span， 避免点那个滑块的时候页面跳走。
						$(".ui-flipswitch a").each(function() {
							$(this).replaceWith("<span class='" + $(this).attr('class') + "'></span>");
						});

					} else if (self.page_mode == 'wf_three') {
						window.location.href = "/m#wf_three";
					} else {
						window.location.href = "/m";
					}
				}).on('click', '#btn_upload_attachment', function(event) {
					self.wf_data.leave.reason = $("#personal_wf_work_of_city-content #reason").val();
					self.wf_data.leave.create_start_date = $("#personal_wf_work_of_city-content #create_start_date").val();
					self.wf_data.leave.create_end_date = $("#personal_wf_work_of_city-content #create_end_date").val();
					self.wf_data.is_full_day = $("#personal_wf_work_of_city-content #is_full_day").val() == 'true' ? true : false;
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
			get_datas: function() {

				var self = this;

			},
		});

		// Returns the View class
		return WorkOfCityView;

	});