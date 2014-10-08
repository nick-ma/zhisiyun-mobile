// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", ], function($, _, Backbone, Handlebars) {
    var ListView = Backbone.View.extend({
        // The View Constructor
        initialize: function() {
            this.template = Handlebars.compile($("#qi_sub_list_view").html());
            this.loading_template = Handlebars.compile($("#loading_template_view").html());
            // this.collection.on("sync", this.render, this);
            this.bind_event();
        },
        pre_render: function() {
            var self = this;
            $("#personal_wf_work_of_travel-content").html(self.loading_template({
                info_msg: '数据加载中...请稍候'
            }));
            $("#personal_wf_work_of_travel-content").trigger('create');
            return this;
        },
        // Renders all of the Task models on the UI
        render: function() {
            var self = this;
            var rendered_data = {
                qis: _.map(self.collection.models, function(x) {
                    return x.toJSON();
                })
            }
            $("#qi_sub_list-content").html(self.template(rendered_data));
            $("#qi_sub_list-content").trigger('create');

            return self;
        },
        bind_event: function() {
            var self = this;
            $("#qi_sub_list").on('click', '#btn-qi_sub_list-back', function(event) {
                event.preventDefault();
                window.location.href = '#myteam_detail/' + self.people_id + '/basic';
            })
        }
    });

    // Returns the View class
    return ListView;

});