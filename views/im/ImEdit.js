// CollTask List View
// =================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "moment"],
    function($, _, Backbone, Handlebars, moment) {



        Handlebars.registerHelper('is_msg_type', function(type, options) {
            if (type == 'plain') {
                return options.fn(this);
            } else {
                //不满足条件执行{{else}}部分    
                return options.inverse(this);
            }
        });


        // Extends Backbone.View
        var ImListView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                var self = this;
                this.template_im_edit = Handlebars.compile($("#im_edit_view").html());
                this.loading_template = Handlebars.compile($("#loading_template_view").html());
                // The render method is called when CollTask Models are added to the Collection
                this.bind_event();
            },
            pre_render: function() {
                var self = this;
                $("#im_edit_list-content").html(self.loading_template({
                    info_msg: '数据加载中...请稍候'
                }));
                $("#im_edit_list-content").trigger('create');
                return this;
            },
            render: function() {
                var self = this;
                $("#im_edit_list-content").html(self.template_im_edit(self.model.attributes));
                $("#im_edit_list-content").trigger('create');
                return this
            },
            bind_event: function() {
                var self = this;
                $("#im_view_list")
                    .on('click', '.open-left-panel', function(event) {
                        event.preventDefault();
                        $("#show_my_skills-left-panel").panel("open");
                    })
                    .on('swiperight', function(event) { //向右滑动，打开左边的面板
                        event.preventDefault();
                        $("#show_my_skills-left-panel").panel("open");
                    })
                    .on('click', '#btn-show_my_skills-change_view', function(event) {
                        event.preventDefault();
                        window.location = '#skill_config'
                        $("#show_my_skills-left-panel").panel("close");
                    })
            }
        });

        // Returns the View class
        return ImListView;

    });