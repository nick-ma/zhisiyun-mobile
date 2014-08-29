// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars"],
    function($, _, Backbone, Handlebars) {

        // Extends Backbone.View
        var WorkReportListView = Backbone.View.extend({

            initialize: function() {
                this.template = Handlebars.compile($("#tmp_wr_list_view").html());
                this.bind_event();
            },

            // Renders all of the Contact models on the UI
            render: function() {
                var self = this;

                self.wr_list_back_url = localStorage.getItem('wr_list_back_url') || null;
                localStorage.removeItem('wr_list_back_url'); //用完删掉 
                if (self.wr_list_back_url) {//有才设，没有则保持不变
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
                } else { //未提交
                    _.each(self.collection.models, function(x) {
                        if (!x.attributes.is_submit && moment(x.attributes.show_time) < moment().add(1, 'months')) {
                            render_data.wrs.push(x.attributes)
                        }
                    })
                }
                $("#wr_list-content").html(self.template(render_data));
                $("#wr_list-content").trigger('create');

                return this;

            },
            bind_event: function() {
                var self = this;
                $("#wr_list").on('change', '#wr_list_view_mode', function(event) {
                    event.preventDefault();
                    self.filter_mode = $(this).val();
                    self.render();
                })
            }

        });

        // Returns the View class
        return WorkReportListView;

    });