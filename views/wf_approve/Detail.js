// WFApprove Detail View
// =================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "moment",
        "../../models/WFApproveModel"
    ],
    function($, _, Backbone, Handlebars, moment,
        WFApproveModel) {

        // Extends Backbone.View
        var WFApproveDetailView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                this.template = Handlebars.compile($("#hbtmp_wf_approve_detail_view").html());
                // The render method is called when WFApprove Models are added to the Collection
                // this.collection.on("sync", this.render, this);
                this.bind_event();
            },
            pre_render: function() { //预先render
                $("#wf_approve_detail-content").html('<div>正在加载数据...</div>');
                $("#wf_approve_detail-content").trigger('create');
            },
            // Renders all of the WFApprove models on the UI
            render: function() {

                var self = this;

                var render_data = self.model.toJSON();
                render_data.login_people = $("#login_people").val();
                var rendered = self.template(render_data);

                $("#wf_approve_detail-content").html(rendered);
                $("#wf_approve_detail-content").trigger('create');

                return this;

            },
            bind_event: function() {
                var self = this;
                $("#wf_approve_detail-content")
                    .on('click', '#btn-fa-delete', function(event) {
                        event.preventDefault();
                        if (self.model && confirm('确定要删除当前流程么？\n一旦删除将无法恢复。')) {
                            self.model.destroy({
                                success: function(model, response, options) {
                                    alert('流程删除成功');
                                    var url = '#wf_approve';
                                    window.location.href = url;
                                },
                                error: function(model, response, options) {
                                    alert('流程删除失败 ' + response);
                                }
                            })
                        };
                    });


            },

        });

        // Returns the View class
        return WFApproveDetailView;

    });