// ToDo View
// =============

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "async"], function($, _, Backbone, Handlebars, async) {

    function sort_items(items) {
        var sorts = _.sortBy(items, function(qt) {
            return qt.createDate
        })
        return sorts.reverse();
    }


    var AdjustmentView = Backbone.View.extend({
        // The View Constructor
        initialize: function() {
            this.adjustment_singles_template = Handlebars.compile($("#adjustment_singles_view").html());
            this.adjustment_bulks_template = Handlebars.compile($("#adjustment_bulks_view").html());



            this.loading_template = Handlebars.compile($("#loading_template_view").html());
            // this.collection.on("sync", this.render, this);
            this.model_view = '0';
            this.qtis = [];
            this.bind_event();
        },
        pre_render: function() {
            var self = this;
            $("#adjustment_list-content").html(self.loading_template({
                info_msg: '数据加载中...请稍候'
            }));
            $("#adjustment_list-content").trigger('create');
            return this;
        },
        // Renders all of the Task models on the UI
        render: function() {
            var self = this;
            var rendered_data = '';
            var filters = [];
            $('.adjustment_single_state_num').html(self.adjustment.adjustment_singles.length)
            $('.adjustment_bulk_state_num').html(self.adjustment.adjustment_bulks.length)

            if (self.model_view == '0') {
                rendered_data = self.adjustment_singles_template({
                    adjustments: self.adjustment.adjustment_singles
                });
            } else {
                rendered_data = self.adjustment_bulks_template({
                    adjustments: self.adjustment.adjustment_bulks
                });
            }

            console.log(self.adjustment.adjustment_singles)
            console.log(self.adjustment.adjustment_bulks)

            $("#adjustment_list-content").html(rendered_data);
            $("#adjustment_list-content").trigger('create');
            return self;
        },
        bind_event: function() {
            var self = this
            $("#adjustment_list").on('click', '.btn_single', function(event) {
                event.preventDefault();
                var adjustment_id = $(this).data('adjustment_id');
                var process_define = $(this).data('process_define');
                // window.location = '#godo25/' + process_define + '/1';
                var process_instance = $(this).data('process_instance');
                var ptype = $(this).data('ptype');
                window.location = '#adjustment_single_form/' + process_instance + '/F';

            }).on('click', '.btn_bulk', function(event) {
                event.preventDefault();
                var adjustment_id = $(this).data('adjustment_id');
                var process_define = $(this).data('process_define');
                var process_instance = $(this).data('process_instance');
                var ptype = $(this).data('ptype');
                window.location = '#adjustment_bulk_form/' + process_instance + '/F';
            }).on('click', '.btn-adjustment_single_state', function(event) {
                var $this = $(this);
                self.model_view = $this.data('state');
                self.render();
                $('.btn-adjustment_bulk_state').removeClass('ui-btn-active');
                $this.addClass('ui-btn-active');
            }).on('click', '.btn-adjustment_bulk_state', function(event) {
                var $this = $(this);
                self.model_view = $this.data('state');
                self.render();
                $('.btn-adjustment_single_state').removeClass('ui-btn-active');
                $this.addClass('ui-btn-active');
            })
        },

    });

    // Returns the View class
    return AdjustmentView;

});