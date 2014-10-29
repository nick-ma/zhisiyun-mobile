// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars"],
    function($, _, Backbone, Handlebars) {
        function sort_02(items) {
            var sorts = _.sortBy(items, function(ls) {
                return ls.show_time
            })
            return sorts
        }
        // Extends Backbone.View
        var WorkReportListView = Backbone.View.extend({

            initialize: function() {
                this.template = Handlebars.compile($("#tmp_wr_list_view").html());
                this.template_sub = Handlebars.compile($("#tmp_wr_sub_list_view").html());
                this.filter_mode = '0';
                this.sub_items = [];
                this.current_time_no = '';
                this.current_time_yes = '';
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
                var group = {};
                if (self.filter_mode == '1') { //已提交
                    _.each(self.collection.models, function(x) {
                        if (x.attributes.is_submit && moment(x.attributes.show_time) > moment().subtract(1, 'years')) {
                            render_data.wrs.push(x.attributes)
                        }
                    })
                    render_data.wrs = sort_02(render_data.wrs).reverse();
                    $("#wr_list-content").html(self.template(render_data));

                } else if (self.filter_mode == '0') { //未提交
                    _.each(self.collection.models, function(x) {
                        if (!x.attributes.is_submit && moment(x.attributes.show_time) < moment().add(1, 'months')) {
                            render_data.wrs.push(x.attributes)
                        }
                    })
                    render_data.wrs = sort_02(render_data.wrs);
                    $("#wr_list-content").html(self.template(render_data));
                } else if (self.filter_mode == '2') {
                    var maps = _.compact(_.map(self.sub_items, function(wr) {
                        var f_d = _.find(wr.comments, function(ct) {
                            return ct.people == self.people_id && !ct.is_submit
                        })
                        if (f_d) {
                            return wr
                        } else {
                            return null
                        }
                    }))
                    group = _.groupBy(maps, function(qt) {
                        return moment(qt.show_time).format('YYYY-MM-DD')
                    })
                    var sorts = _.sortBy(_.keys(group), function(gp) {
                        return gp
                    })
                    if (!self.current_time_yes) {
                        self.current_time_yes = _.last(sorts);
                    };

                    render_data.wrs = group[self.current_time_yes];

                    $("#wr_list-content").html(self.template_sub(render_data));
                } else if (self.filter_mode == '3') {
                    var maps = _.compact(_.map(self.sub_items, function(wr) {
                        var f_d = _.find(wr.comments, function(ct) {
                            return ct.people == self.people_id && ct.is_submit
                        })
                        if (f_d) {
                            return wr
                        } else {
                            return null
                        }
                    }))
                    group = _.groupBy(maps, function(qt) {
                        return moment(qt.show_time).format('YYYY-MM-DD')
                    })
                    var sorts = _.sortBy(_.keys(group), function(gp) {
                        return gp
                    })
                    if (!self.current_time_no) {
                        self.current_time_no = _.last(sorts);
                    };

                    render_data.wrs = group[self.current_time_no];

                    $("#wr_list-content").html(self.template_sub(render_data));
                }

                $("#wr_list-content").trigger('create');
                var items = []
                _.each(group, function(ys, k) {
                    if (self.current_time_yes == k && self.filter_mode == '2') {
                        items.push('<option value=' + k + ' selected>' + k + '</option>')
                    } else if (self.current_time_no == k && self.filter_mode == '3') {
                        items.push('<option value=' + k + ' selected>' + k + '</option>')
                    } else {
                        items.push('<option value=' + k + ' >' + k + '</option>')
                    }
                })
                $("#sub_work_times").html(items.join(''))
                if (self.filter_mode == '2') {
                    if (group[self.current_time_yes]) {
                        if (!_.isUndefined(group) && !_.isEmpty(group) && group[self.current_time_yes].length) {
                            $('#sub_show_work').show()
                        }

                        $("#sub_work_times").prev().html(self.current_time_yes)
                    };
                } else {
                    if (group[self.current_time_no]) {
                        if (!_.isUndefined(group) && !_.isEmpty(group) && group[self.current_time_no].length) {
                            $('#sub_show_work').show()
                        }
                        $("#sub_work_times").prev().html(self.current_time_no)
                    }
                }


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
                    if (self.filter_mode == '2') {
                        self.current_time_yes = $(this).val();
                    } else {
                        self.current_time_no = $(this).val();
                    }
                    self.render();

                })
            }

        });

        // Returns the View class
        return WorkReportListView;

    });