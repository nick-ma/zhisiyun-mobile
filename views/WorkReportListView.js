// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars"],
    function($, _, Backbone, Handlebars) {

        // Extends Backbone.View
        var WorkReportListView = Backbone.View.extend({

            initialize: function() {
                this.template = Handlebars.compile($("#tmp_wr_list_view").html());
                this.template_sub = Handlebars.compile($("#tmp_wr_sub_list_view").html());
                this.filter_mode = '0';
                this.sub_items = [];
                this.current_time = '';
                this.bind_event();
            },

            // Renders all of the Contact models on the UI
            render: function() {
                var self = this;
                self.wr_list_back_url = localStorage.getItem('wr_list_back_url') || null;
                localStorage.removeItem('wr_list_back_url'); //用完删掉 
                if (self.wr_list_back_url) { //有才设，没有则保持不变
                    $("#btn-wr_list-back").attr('href', self.wr_list_back_url);
                }
                var render_data = {
                    wrs: [],
                }

                if (self.filter_mode == '1') { //已提交
                    _.each(self.collection.models, function(x) {
                        if (x.attributes.is_submit && moment(x.attributes.show_time) > moment().subtract(1, 'years')) {
                            render_data.wrs.push(x.attributes)
                        }
                    })
                    $("#wr_list-content").html(self.template(render_data));
                } else if (self.filter_mode == '0') { //未提交
                    _.each(self.collection.models, function(x) {
                        if (!x.attributes.is_submit && moment(x.attributes.show_time) < moment().add(1, 'months')) {
                            render_data.wrs.push(x.attributes)
                        }
                    })
                    $("#wr_list-content").html(self.template(render_data));
                } else {
                    var group = _.groupBy(self.sub_items, function(qt) {
                        return moment(qt.show_time).format('YYYY-MM-DD')
                    })
                    var sorts = _.sortBy(_.keys(group), function(gp) {
                        return gp
                    })
                    if (!self.current_time) {
                        self.current_time = _.last(sorts);
                    };
                    render_data.wrs = group[self.current_time];

                    $("#wr_list-content").html(self.template_sub(render_data));
                }

                $("#wr_list-content").trigger('create');


                if (group[self.current_time].length) {
                    $('#sub_show_work').show()
                }


                var items = []
                _.each(group, function(ys, k) {
                    if (self.current_time == k) {
                        items.push('<option value=' + k + ' selected>' + k + '</option>')
                    } else {
                        items.push('<option value=' + k + ' >' + k + '</option>')
                    }
                })
                $("#sub_work_times").html(items.join(''))
                $("#sub_work_times").prev().html(self.current_time)

                return this;

            },
            bind_event: function() {
                var self = this;
                $("#wr_list").on('change', '#wr_list_view_mode', function(event) {
                    event.preventDefault();
                    self.filter_mode = $(this).val();
                    self.render();
                }).on('click', '.btn-wr-change_state', function(event) {
                    event.preventDefault();
                    var $this = $(this);
                    var state = $this.data('state');
                    if (state == '0' || state == '1') {
                        self.filter_mode = state
                        self.render();
                    } else {
                        $.get('/admin/pm/work_report/get_sub_work_reports', function(data) {
                            self.sub_items = data;
                            self.filter_mode = state
                            self.render();
                        })

                    }
                }).on('change', '#sub_work_times', function(event) {
                    event.preventDefault();
                    self.current_time = $(this).val();
                    self.render();

                })
            }

        });

        // Returns the View class
        return WorkReportListView;

    });