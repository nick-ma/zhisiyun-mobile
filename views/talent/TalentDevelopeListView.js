// Contact Detail View
// ===================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars"],
    function($, _, Backbone, Handlebars) {

        // Extends Backbone.View
        var DevelopePlanListlView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                this.template = Handlebars.compile($("#hbtmp_talent_develope_list_view").html());
                // The render method is called when People Models are added to the Collection
                this.loading_template = Handlebars.compile($("#loading_template_view").html());

                // this.collection.on("sync", this.render, this);
                this.bind_event();
            },
            pre_render: function() {
                var self = this;
                $("#talent_develope_list-content").html(self.loading_template({
                    info_msg: '数据加载中...请稍候'
                }));
                $("#talent_develope_list-content").trigger('create');
                return this;
            },
            // Renders all of the People models on the UI
            render: function() {

                var self = this;
                console.log(self)
                var develope_data = self.collection.models;
                var talent_data = _.map(develope_data, function(temp) {
                    return temp.attributes
                })
                var direct = _.map(self.direct, function(temp) {
                    return temp.attributes
                })
                var type = _.map(self.type, function(temp) {
                    return temp.attributes
                })
                var obj = {
                    talent_data: talent_data,
                    status: self.status_data[String(self.people)],
                    direct: direct,
                    type: type
                }
                $("#talent_develope_list-content").html(self.template(obj));
                $("#talent_develope_list-content").trigger('create');

                return this;

            },

            bind_event: function() {
                var self = this;
                $("#talent_develope_list").on('click', '.open-left-panel', function(event) {
                    event.preventDefault();
                    $("#show_talent_develope_plan-left-panel").panel("open");
                }).on('swiperight', function(event) { //向右滑动，打开左边的面板
                    event.preventDefault();
                    $("#show_talent_develope_plan-left-panel").panel("open");
                })
            }

        });

        // Returns the View class
        return DevelopePlanListlView;

    });