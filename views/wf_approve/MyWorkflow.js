// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "moment"],
    function($, _, Backbone, Handlebars, moment) {
        var pd;
        // Extends Backbone.View
        var WFMyWorkflowView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                var self = this;
                self.template = Handlebars.compile($("#hbtmp_my_workflow_view").html());
                this.template2 = Handlebars.compile($("#hbtmp_start_form_view").html());
                self.mode = '1'; //列表
                // self.search_term = ''; //过滤条件
                // self.date_offset = 30; //过滤条件
                self.bind_event();
            },

            // Renders all of the WFApprove models on the UI
            render: function() {

                var self = this;
                // self.mode = $("#wf_approve_list input[type=radio][name=wf_approve_view_mode]:checked").val() || '1';
                // console.log(self.state);
                // localStorage.setItem('ct_render_mode', mode); //通过local storage来保存状态
                var render_data;
                if (self.mode == '1') {
                    render_data = {
                        pds: _.map(self.collection.models, function(x) {
                            return x.toJSON();
                        })
                    };
                    $("#wf_my_workflow-content").html(self.template(render_data));
                } else {

                    render_data = pd.toJSON();
                    render_data.people_name = $("#login_people_name").val();
                    $("#wf_my_workflow-content").html(self.template2(render_data));
                }

                $("#wf_my_workflow-content").trigger('create');

                return self;

            },
            bind_event: function() {
                var self = this;
                $("#wf_my_workflow")
                    .on('click', '#btn-my_workflow-back', function(event) {
                        event.preventDefault();
                        
                        self.mode = '1';
                        self.render();
                    })
                $("#wf_my_workflow-content")
                    .on('click', '.start_form', function(event) {
                        event.preventDefault();
                        var $this = $(this);
                        var _id = $this.data('up_id');

                        pd = _.find(self.collection.models, function(x) {
                            return x.attributes._id.toString() == _id;
                        });

                        self.mode = '2';
                        self.render();
                    })
                    .on('click', '#btn_cancel', function(event) {
                        event.preventDefault();

                        self.mode = '1';
                        self.render();
                    })
                    .on('click', '#btn_start', function(event) {
                        event.preventDefault();
                        var $this = $(this);
                        var up_id = $this.data('up_id');

                        if (confirm('确认以“' + pd.attributes.process_name + '”做为名称来启动流程吗？')) {
                            $this.attr('disabled', true);
                            
                            var start_url = '/admin/wf/universal/start';
                            var post_data = {
                                process_define: up_id,
                                process_instance_name: pd.attributes.process_name,
                            };
                            $.post(start_url, post_data)
                                .done(function(data) {
                                    alert('流程启动成功，稍后将转入编辑界面。');
                                    var pd = data.pd;
                                    var ti = data.ti;
                                    window.location.href = '#handle_form/'+ti._id;
                                })
                                .fail(function(data) {
                                    alert('流程启动失败：' + data);
                                })
                                .always(function() {
                                    $this.attr('disabled', false);
                                });
                        };
                    })
            }

        });
    
        // Returns the View class
        return WFMyWorkflowView;

    });