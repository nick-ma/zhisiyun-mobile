// free workflow approve router
// ============================

define(["jquery", "backbone", "handlebars", "lzstring", "moment", "async",
        // 协作任务
        "../models/WFApproveModel", "../models/ProcessInstanceModel",
        "../collections/WFApproveCollection", "../collections/WFMyWorkflowCollection",
        "../views/wf_approve/List", "../views/wf_approve/Detail", "../views/wf_approve/Edit", "../views/wf_approve/MyWorkflow",
        "../views/wf_approve/FormHeaderView", "../views/wf_approve/FormBodyView", "../views/wf_approve/FormFooterView",
        "../views/wf_approve/FormHeaderVView", "../views/wf_approve/FormBodyVView", "../views/wf_approve/FormFooterVView"
    ],
    function($, Backbone, Handlebars, LZString, moment, async,
        WFApproveModel, ProcessInstanceModel, WFApproveCollection, WFMyWorkflowCollection,
        WFApproveListView, WFApproveDetailView, WFApproveEditView, WFMyWorkflowView,
        FormHeaderView, FormBodyView, FormFooterView,
        FormHeaderVView, FormBodyVView, FormFooterVView
    ) {

        var WFApproveRouter = Backbone.Router.extend({
            initialize: function() {
                var self = this;
                self.init_models();
                self.init_collections();
                self.init_views();
                self.bind_events();
                console.info('app message: wf_approve router initialized');
                // Backbone.history.start();
            },
            routes: {
                // 
                "wf_approve": "wf_approve",
                "wf_approve_detail/:fa_id": "wf_approve_detail",
                // "wf_approve_edit/:fa_id": "wf_approve_edit",
                "wf_approve_edit/:fa_id": "wf_approve_edit",
                "wf_my_workflow": "wf_my_workflow",
                "handle_form/:task_id": "handle_form",
                "handle_form_view/:pi_id": "handle_form_view",
            },

            //--------报批事项--------//
            wf_approve: function() {

                // localStorage.setItem('wf_approve_detail_back_url', window.location.href);
                var self = this;
                $("body").pagecontainer("change", "#wf_approve_list", {
                    reverse: false,
                    changeHash: false,
                });
                $.mobile.loading("show");
                self.c_wf_approve.fetch().done(function() {
                    self.wfapproveListView.render();
                    $.mobile.loading("hide");
                })
            },

            wf_approve_detail: function(fa_id) {
                var self = this;
                $("body").pagecontainer("change", "#wf_approve_detail", {
                    reverse: false,
                    changeHash: false,
                });
                $.mobile.loading("show");
                self.wfapproveDetailView.pre_render();
                // if (self.c_wf_approve.get(fa_id)) {
                //     self.wfapproveDetailView.model = self.c_wf_approve.get(fa_id);
                //     self.wfapproveDetailView.model.fetch().done(function() {
                //         self.wfapproveDetailView.render();
                //         $.mobile.loading("hide");
                //     })
                // } else {
                var tmp = new WFApproveModel({
                    _id: fa_id
                });
                tmp.fetch().done(function() {
                        // console.log('message done');
                        self.c_wf_approve.set(tmp); //放到collection里面
                        self.wfapproveDetailView.model = tmp;
                        self.wfapproveDetailView.render();
                        $.mobile.loading("hide");
                    }).fail(function() { //针对手机app版
                        console.log('message fail');
                        $.mobile.loading("hide");
                        alert('流程不存在')
                        window.location.href = "#"
                    })
                    // };
            },
            wf_approve_edit: function(fa_id) {
                $("body").pagecontainer("change", "#wf_approve_edit", {
                    reverse: false,
                    changeHash: false,
                });
                var fa;
                var self = this;

                // fa = self.c_wf_approve.get(fa_id);
                // if (fa) {
                //     self.wfapproveEditView.model = fa;
                //     self.wfapproveEditView.render();

                // } else {
                fa = new WFApproveModel({
                    _id: fa_id
                });
                fa.fetch().done(function() {
                        self.c_wf_approve.push(fa); //放到collection里面
                        self.wfapproveEditView.model = fa;
                        self.wfapproveEditView.render();
                    })
                    // };

                // console.log(fa_id, p_task, ct);

            },

            wf_my_workflow: function() {
                var self = this;

                $("body").pagecontainer("change", "#wf_my_workflow", {
                    reverse: false,
                    changeHash: false,
                });
                $.mobile.loading("show");
                self.c_wf_my_workflow.fetch().done(function() {
                    self.wfmyWorkflowView.render();
                    $.mobile.loading("hide");
                })
            },

            handle_form: function(task_id) {
                var self = this;

                $("body").pagecontainer("change", "#wf_my_workflow_form", {
                    reverse: false,
                    changeHash: false,
                });
                //隐藏返回按钮，只有从待办进的时候才显示
                $("#btn-mwf-back").attr("style","display:none");
                $.mobile.loading("show");

                $.get('/admin/wf/universal/handle_form_4m/' + task_id, function(data) {
                    async.parallel({
                        peoples_data: function(cb) {
                            init_peoples(cb);
                        },
                        ref_pis_data: function(cb) {
                            init_ref_pis(cb);
                        },
                        wf_data: function(cb) {
                            fetch_data(task_id, cb);
                        }
                    }, function(err, result) {
                        self.ti = result.wf_data.ti;
                        self.pi.set(result.wf_data.ti.process_instance);

                        self.td = result.wf_data.td;
                        self.tts = result.wf_data.tts;
                        self.pd = result.wf_data.pd;
                        self.history_tasks = result.wf_data.history_tasks;
                        self.flowchart_data = result.wf_data.flowchart_data;
                        self.attachments = result.wf_data.attachments;
                        self.ref_pis = result.ref_pis_data;
                        self.users_data = result.peoples_data;
                        // 处理数据－start
                        var tmp = [];
                        tmp.push(_.find(self.flowchart_data, function(x) {
                            return x.node_type == 'START'
                        }))
                        tmp = tmp.concat(_.sortBy(_.filter(self.flowchart_data, function(x) {
                            return x.node_type == "TASK"
                        }), function(x) {
                            return x.sequence;
                        }));
                        tmp.push(_.find(self.flowchart_data, function(x) {
                            return x.node_type == 'END'
                        }))
                        self.flowchart_data = tmp;

                        // 处理数据－end
                        self.fh_v.pi = self.pi;
                        self.fh_v.ti = self.ti;
                        self.fb_v.pi = self.pi;
                        self.fb_v.td = self.td;
                        self.ff_v.pi = self.pi;
                        self.ff_v.ti = self.ti;
                        self.ff_v.pd = self.pd;
                        self.ff_v.td = self.td;
                        self.ff_v.tts = self.tts;
                        self.ff_v.history_tasks = self.history_tasks;
                        self.ff_v.flowchart_data = self.flowchart_data;
                        self.ff_v.attachments = self.attachments;
                        self.ff_v.supreme_leader = data.supreme_leader;
                        self.ff_v.ref_pis = self.ref_pis;
                        self.ff_v.users = self.users_data;
                        self.pi.fetch().done(function() {
                            self.fh_v.render();
                            self.fb_v.render();
                            self.ff_v.render();

                            // $("#form_header").show();
                            // $("#form_body").show();
                            // $("#form_footer").show();
                            // $("#confirm_trans").hide();

                            $.mobile.loading("hide");
                        })
                    })
                })
            },

            handle_form_view: function(pi_id) {
                var self = this;

                $("body").pagecontainer("change", "#wf_my_workflow_form", {
                    reverse: false,
                    changeHash: false,
                });
                $("#btn-mwf-back").attr("style","display:block");
                $.mobile.loading("show");

                async.parallel({
                    peoples_data: function(cb) {
                        init_peoples(cb);
                    },
                    wf_data: function(cb) {
                        fetch_data2(pi_id, cb);
                    }
                }, function(err, result) {
                    self.pi.id = pi_id;
                    self.flowchart_data = result.wf_data.flowchart_data.tds;
                    // 处理数据－start
                    var tmp = [];
                    tmp.push(_.find(self.flowchart_data, function(x) {
                        return x.node_type == 'START'
                    }))
                    tmp = tmp.concat(_.sortBy(_.filter(self.flowchart_data, function(x) {
                        return x.node_type == "TASK"
                    }), function(x) {
                        return x.sequence;
                    }));
                    tmp.push(_.find(self.flowchart_data, function(x) {
                        return x.node_type == 'END'
                    }))
                    self.flowchart_data = tmp;

                    // 处理数据－end

                    self.fh_vv.pi = self.pi;
                    self.fb_vv.pi = self.pi;
                    self.ff_vv.pi = self.pi;
                    self.ff_vv.history_tasks = result.wf_data.history_tasks;
                    self.ff_vv.flowchart_data = self.flowchart_data;
                    self.ff_vv.users = result.peoples_data;
                    self.ff_vv.ctd = result.wf_data.flowchart_data.ctd;

                    self.pi.fetch().done(function() {
                        self.fh_vv.render();
                        self.fb_vv.render();
                        self.ff_vv.render();
                        $.mobile.loading("hide");
                    })
                })
            },

            init_views: function() {
                var self = this;
                self.wfapproveListView = new WFApproveListView({
                    el: "#wf_approve-content",
                    collection: self.c_wf_approve
                })
                self.wfapproveEditView = new WFApproveEditView({
                    el: "#wf_approve_edit-content",
                })
                self.wfapproveDetailView = new WFApproveDetailView({
                    el: "#wf_approve_detail-content",
                })
                self.wfmyWorkflowView = new WFMyWorkflowView({
                    el: "#wf_my_workflow-content",
                    collection: self.c_wf_my_workflow
                })
                self.fh_v = new FormHeaderView();
                self.fb_v = new FormBodyView();
                self.ff_v = new FormFooterView();
                
                self.fh_vv = new FormHeaderVView();
                self.fb_vv = new FormBodyVView();
                self.ff_vv = new FormFooterVView();
            },
            init_models: function() {
                this.pi = new ProcessInstanceModel(); //当前任务的流程实例，表单的主要部分由这个来渲染。
            },
            init_collections: function() {
                this.c_wf_approve = new WFApproveCollection(); //全体相关的流程
                this.c_wf_my_workflow = new WFMyWorkflowCollection(); //我的相关的流程
            },
            bind_events: function() {

            }
        });

        function fetch_data(task_id, cb) {
            var url = '/admin/wf/universal/handle/' + task_id;
            $.get(url, function(data) {
                cb(null, data);
            })
        };

        function fetch_data2(pi_id, cb) {
            var url = '/admin/wf/universal/view_data/' + pi_id;
            $.get(url, function(data) {
                cb(null, data);
            })
        };

        function init_ref_pis(cb) {
            $.get('/admin/wf/universal/ref_pis', function(data) {
                cb(null, data);
            })
        };

        function init_peoples(cb) {
            var url = '/admin/masterdata/people/people_list4m';
            $.get(url, function(data) {
                cb(null, data);
            });
        }

        return WFApproveRouter;
    })