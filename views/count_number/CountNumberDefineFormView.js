// CountNumberDefineForm Edit View
// =================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "../../models/CountNumberDefineModel"],
    function($, _, Backbone, Handlebars, CountNumberDefineModel) {
        // Extends Backbone.View
        var CountNumberDefineFormView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                this.template = Handlebars.compile($("#psh_count_number_define_form_view").html());
                this.loading_template = Handlebars.compile($("#loading_template_view").html());
                this.item_template = Handlebars.compile($("#psh_count_number_left_view").html());
                this.bind_event();
            },
            pre_render: function() {
                var self = this;
                $("#my_count_number_define-content").html(self.loading_template({
                    info_msg: '数据加载中...请稍候'
                }));
                $("#my_count_number_define-content").trigger('create');
                return this;
            },

            // Renders all of the CountNumberDefineList on the UI
            render: function(select) {

                var self = this;
                var login_people = $("#login_people").val();
                var temp_model = self.collection.models[0];
                var count_item = temp_model.attributes.count_item;
                var filter_item_C = _.groupBy(_.filter(count_item, function(x) {
                    return x.item_type == 'C'
                }), function(g) {
                    return g.item_C
                })
                var filter_item_S = _.groupBy(_.filter(count_item, function(x) {
                    return x.item_type == 'S'
                }), function(g) {
                    return g.item.item_category_name
                })
                temp_model.attributes.filter_item_S = filter_item_S;
                temp_model.attributes.filter_item_S_key = _.keys(filter_item_S);
                temp_model.attributes.filter_item_C = filter_item_C;
                temp_model.attributes.filter_item_C_key = _.keys(filter_item_C);
                var render_data = JSON.parse(JSON.stringify(temp_model.attributes));

                $("#my_count_number_define-content").html(self.template(render_data));
                $("#my_count_number_define-content").trigger('create');
                //把 a 换成 span， 避免点那个滑块的时候页面跳走。
                $(".ui-flipswitch a").each(function() {
                    $(this).replaceWith("<span class='" + $(this).attr('class') + "'></span>");
                });
                return this;

            },
            bind_event: function() {
                var self = this;
                $("#my_count_number_define").on('click', '#btn_select_category', function(event) {
                    event.preventDefault();
                    var data = _.map(self.item_data, function(x) {
                        return x.toJSON()
                    })

                    var render_data={
                        data:data
                    }
                    $("#my_count_number_define-left-panel-content").html(self.item_template(render_data));
                    $("#my_count_number_define-left-panel-content").trigger('create');
                    $("#my_count_number_define-left-panel").panel("open");
                }).on('click', '#btn_go_back', function(event) {
                    event.preventDefault();
                    var up_id = $(this).data("up_id");
                    self.collection.url = '/admin/pm/count_number_define/bb';
                    self.collection.fetch().done(function() {
                        window.location = "/m#count_number_list";
                    })
                })
                $("#my_count_number_define-left-panel-content")
                    .on('change', '.goto_sub_assessment', function(event) {
                        var $this = $(this);
                        var people = $this.data('up_id');
                        $("#summary_name").html($this.data('people_name') + '的绩效总结');
                        self.collection.url = '/admin/pm/assessment_instance/summary/bb?people=' + people;
                        self.collection.fetch().done(function() {
                            self.render();
                        })
                        $("#summary_list-left-panel").panel("close");


                    });
            },

        });

        // Returns the View class
        return CountNumberDefineFormView;

    });