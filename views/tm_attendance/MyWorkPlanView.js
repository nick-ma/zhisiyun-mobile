// 我的签到记录列表 List View
// =================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "moment"],
	function($, _, Backbone, Handlebars, moment) {
		var select_month = moment().format("YYYY-MM");
		var login_people = $("#login_people").val();
		// Extends Backbone.View
		var MyWorkPlanView = Backbone.View.extend({

			// The View Constructor
			initialize: function() {
				var self = this;
				this.template = Handlebars.compile($("#hbtmp_my_work_plan_list_view").html());
				this.loading_template = Handlebars.compile($("#loading_template_view").html());

				// The render method is called when TmWorkPlan Models are added to the Collection
				this.bind_event();
			},
			pre_render: function() {
				var self = this;
				$("#show_my_work_plan-content").html(self.loading_template({
					info_msg: '数据加载中...请稍候'
				}));
				$("#show_my_work_plan-content").trigger('create');
				return this;
			},
			// Renders all of the TmWorkPlan models on the UI
			render: function() {
				var self = this;

				var obj = {};
				// var filter_data = _.filter(self.work_plan.models[0].toJSON()[0].calendar_data, function(temp) {
				// 	return moment(temp.job_date).format("YYYY-MM") == String(select_month)
				// })
				var filter_data = self.work_plan;
				obj.plan_data = filter_data;
				$("#show_my_work_plan-content").html(self.template(obj));

				$("#show_my_work_plan-content").trigger('create');
				return this
			},
			bind_event: function() {
				var self = this;
				$("#show_my_work_plan-content").on('click', '#last_month', function(event) {
					event.preventDefault();
					select_month = moment(select_month).subtract('month', 1).format('YYYY-MM');
					var url = '/admin/tm/workplan/pep_bb2?people=' + login_people + '&month=' + select_month;
					$.get(url, function(data) {
							if (data) {
								self.work_plan = data;
								self.render();

							}
						})
						// self.work_plan.models.url = '/admin/tm/workplan/pep_bb?people=' + login_people + '&month=' + select_month;
						// self.work_plan.fetch().done(function() {
						// 	self.render();
						// })

				}).on('click', '#current_month', function(event) {
					event.preventDefault();
					select_month = moment().format("YYYY-MM");
					var url = '/admin/tm/workplan/pep_bb2?people=' + login_people + '&month=' + select_month;
					$.get(url, function(data) {
						if (data) {
							self.work_plan = data;
							self.render();

						}
					})
				}).on('click', '#next_month', function(event) {
					event.preventDefault();
					select_month = moment(select_month).add('month', 1).format('YYYY-MM');
					var url = '/admin/tm/workplan/pep_bb2?people=' + login_people + '&month=' + select_month;
					$.get(url, function(data) {
						if (data) {
							self.work_plan = data;
							self.render();

						}
					})
				})
			}
		});

		// Returns the View class
		return MyWorkPlanView;

	});