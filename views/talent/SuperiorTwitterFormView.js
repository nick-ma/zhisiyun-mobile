// PeopleSelectt View
// =================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars"],
    function($, _, Backbone, Handlebars) {
        // Extends Backbone.View
        var SuperiorTwitterFormView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                this.template = Handlebars.compile($("#hbtmp_wf_superior_twitter_form_view").html());
                this.trans_template = Handlebars.compile($("#trans_confirm_view").html());
                this.loading_template = Handlebars.compile($("#loading_template_view").html());

                this.bind_event();
            },
            pre_render: function() {
                var self = this;
                $("#superior_twitter_form-content").html(self.loading_template({
                    info_msg: '数据加载中...请稍候'
                }));
                $("#superior_twitter_form-content").trigger('create');
                return this;
            },
            // Renders all of the PeopleSelectels on the UI
            render: function() {

                var self = this;
                console.log(self)
                // $("#talent_people_select-content").html(self.template(render_data));
                // $("#talent_people_select-content").trigger('create');

              
                return this;

            },
            bind_event: function() {
                var self = this;
                

            },

        });

        // Returns the View class
        return SuperiorTwitterFormView;

    });