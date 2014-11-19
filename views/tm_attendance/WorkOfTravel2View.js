// PeopleAttendanceResult List View
// =================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "moment"],
	function($, _, Backbone, Handlebars, moment) {



		var WorkOfTravel2View = Backbone.View.extend({

			initialize: function() {
				var self = this;
				this.template = Handlebars.compile($("#hbtmp2_wf_work_of_travel_list_view").html());
				this.details_template = Handlebars.compile($("#wf_three_details_view").html());
				this.loading_template = Handlebars.compile($("#loading_template_view").html());

				// The render method is called when CollTask Models are added to the Collection
				this.bind_event();
			},
			pre_render: function() {
				var self = this;
				$("#personal_wf_work_of_travel-content2").html(self.loading_template({
					info_msg: '数据加载中...请稍候'
				}));
				$("#personal_wf_work_of_travel-content2").trigger('create');
				return this;
			},

			// Renders all of the CollTask models on the UI
			render: function() {
				var self = this;

				if (!!localStorage.getItem('wf_three_back_url')) {
					self.wf_three_back_url = localStorage.getItem('wf_three_back_url');
					localStorage.removeItem('wf_three_back_url');
				}
				//流程数据
				var wf_data = self.wf_data;
				var obj = _.extend(wf_data, {});
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
				//判断是否有开始和结束时间
				var first_data = _.first(wf_data.leave.data);
				var last_data = _.last(wf_data.leave.data);
				self.wf_data.leave.create_start_date = moment(first_data.start_date).format('YYYY-MM-DD') + ' ' + first_data.time_zone_s
				self.wf_data.leave.create_end_date = moment(first_data.end_date).format('YYYY-MM-DD') + ' ' + first_data.time_zone_e
				obj.create_start_date = moment(first_data.start_date).format('YYYY-MM-DD') + ' ' + first_data.time_zone_s;
				obj.create_end_date = moment(first_data.end_date).format('YYYY-MM-DD') + ' ' + first_data.time_zone_e;
				//当天工作时间
				obj.leave.hours = wf_data.leave.hours ? wf_data.leave.hours : '';
				$("#personal_wf_work_of_travel-content2").html(self.template(obj));
				$("#personal_wf_work_of_travel-content2").trigger('create');
				return this;

				//把 a 换成 span， 避免点那个滑块的时候页面跳走。
				$(".ui-flipswitch a").each(function() {
					$(this).replaceWith("<span class='" + $(this).attr('class') + "'></span>");
				});

				// $("#go_back").attr("href",self.wf_three_back_url);
			},
			render2: function() {
				var self = this;
				var obj = self.wf_data;
				$("#wf_work_of_travel_title2").html("出差明细");
				$("#personal_wf_work_of_travel-content2").html(self.details_template(obj));
				$("#personal_wf_work_of_travel-content2").trigger('create');
				return this;

			},
			bind_event: function() {
				var self = this;

				$("#wf_work_of_travel2").on('click', '#create_data', function(event) {
					self.page_mode = 'detail';
					self.render2();
				}).on('click', '#go_back', function(event) {
					if (self.page_mode == 'detail') {
						$("#wf_work_of_travel_title2").html("出差流程查看")
						self.page_mode = 'wf_three';
						self.render();
						$("#personal_wf_work_of_travel-content2").find("textarea").attr("disabled", true);

						$("#personal_wf_work_of_travel-content2").find("button").attr("disabled", true);
						$("#personal_wf_work_of_travel-content2").find("input").attr("disabled", true);
						$("#personal_wf_work_of_travel-content2").find("a").attr("disabled", true);
						$("#personal_wf_work_of_travel-content2").find("select").attr("disabled", true);

					} else if (self.page_mode == 'wf_three') {
						// window.location.href = "/m#wf_three";
						window.location.href = self.wf_three_back_url;
					} else {
						window.location.href = "/m";
					}
				}).on('click', 'img', function(event) {
					event.preventDefault();
					// var img_view = '<div class="img_view" style="background-image:url('+this.src+')"></div>';
					var img_view = '<img src="' + this.src + '">';
					// img_view += '<a href="'+this.src.replace('get','download')+'" target="_blank">保存到本地</a>';
					$("#fullscreen-overlay").html(img_view).fadeIn('fast');
				})
			},
			get_datas: function() {

				var self = this;

			},
		});

		// Returns the View class
		return WorkOfTravel2View;

	});