// Contact Detail View
// ===================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars"],
    function($, _, Backbone, Handlebars) {

        // Extends Backbone.View
        var TalentWfSuperiorTwitterView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                this.template = Handlebars.compile($("#hbtmp_wf_superior_twitter_list_view").html());
                // The render method is called when People Models are added to the Collection
                this.loading_template = Handlebars.compile($("#loading_template_view").html());

                // this.collection.on("sync", this.render, this);
                this.bind_event();
            },
            pre_render: function() {
                var self = this;
                $("#personal_superior_twitter-content").html(self.loading_template({
                    info_msg: '数据加载中...请稍候'
                }));
                $("#personal_superior_twitter-content").trigger('create');
                return this;
            },
            // Renders all of the People models on the UI
            render: function() {

                var self = this;
                console.log(self)
                var twitter_data = self.collection.models;
                var temp_arr = [],
                    wf_data = [];
                //取掉重复掉流程实例
                _.each(twitter_data, function(temp) {
                    if (!~temp_arr.indexOf(String(temp.attributes.pi_id))) {
                        temp.attributes.twitter_data.state = (temp.attributes.process_state == 'END' ? true : false)
                        temp.attributes.twitter_data.pi_id = temp.attributes.pi_id;

                        wf_data.push(temp)
                    }
                    temp_arr.push(temp.attributes.pi_id)
                })
                var talent_data = _.map(_.filter(wf_data, function(temp) {
                    return (temp.attributes.twitter_data.superior == String(self.people))
                }), function(t) {
                    return t.attributes.twitter_data
                })
                var direct = _.map(self.direct, function(temp) {
                    return temp.attributes
                })
                var obj = {
                    talent_data: talent_data,
                    direct: direct,
                }
                console.log(obj)
                $("#personal_superior_twitter-content").html(self.template(obj));
                $("#personal_superior_twitter-content").trigger('create');

                return this;

            },

            bind_event: function() {
                var self = this;
                $("#superior_twitter_list").on('click', '.open-left-panel', function(event) {
                    event.preventDefault();
                    $("#show_talent_develope_plan-left-panel").panel("open");
                }).on('swiperight', function(event) { //向右滑动，打开左边的面板
                    event.preventDefault();
                    $("#show_myteam-left-panel").panel("open");
                }).on('click', '#btn_show_myteam_view', function(event) {
                    event.preventDefault();
                    window.location.href = "#myteam";
                }).on('click', '#btn_show_talent_twitter_select_view', function(event) {
                    event.preventDefault();
                    window.location.href = "#talent_twitter_people";
                })
            }

        });

        // Returns the View class
        return TalentWfSuperiorTwitterView;

    });