// free workflow approve router
// ============================

define(["jquery", "backbone", "handlebars", "lzstring", "moment",
        // 协作任务
        "../models/WFApproveModel",
        "../collections/WFApproveCollection",
        "../views/wf_approve/List", "../views/wf_approve/Detail", "../views/wf_approve/Edit",
    ],
    function($, Backbone, Handlebars, LZString, moment,
        WFApproveModel,
        WFApproveCollection,
        WFApproveListView, WFApproveDetailView, WFApproveEditView
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
                "wf_approve_edit/:fa_id(/:p_task)": "wf_approve_edit",
                
            },

            //--------协作任务--------//
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
                if (self.c_wf_approve.get(fa_id)) {
                    self.wfapproveDetailView.model = self.c_wf_approve.get(fa_id);
                    self.wfapproveDetailView.model.fetch().done(function() {
                        self.wfapproveDetailView.render();
                        $.mobile.loading("hide");
                    })
                } else {
                    var tmp = new WFApproveModel({
                        _id: fa_id
                    });
                    tmp.fetch().done(function() {
                        console.log('message done');
                        self.c_wf_approve.set(tmp); //放到collection里面
                        self.wfapproveDetailView.model = tmp;
                        self.wfapproveDetailView.render();
                        $.mobile.loading("hide");
                    }).fail(function() { //针对手机app版
                        console.log('message fail');
                        $.mobile.loading("hide");
                        alert('任务已被删除')
                        window.location.href = "#"
                    })
                };
            },
            wf_approve_edit: function(fa_id, p_task) {
                var ct;
                var self = this;
                if (fa_id == 'add') { //新增
                    ct = self.c_wf_approve.add({
                        task_name: '新建任务',
                        start: new Date(),
                        end: moment().add(3, 'day').toDate(),
                        allday: true,
                        p_task: p_task || null,
                        comments: [],

                    });
                    if (p_task) { //取出上级任务的相关信息
                        var pt = self.c_wf_approve.get(p_task);
                        // console.log(pt);
                        ct.set('root_task', pt.get('root_task'));
                        ct.set('cp', pt.get('cp'));
                        ct.set('cp_name', pt.get('cp_name'));
                    };
                    //设定上级为默认的观察员-改为服务器端获取
                    // var upper_people = JSON.parse($("#upper_people").val());
                    // if (upper_people) { //有上级的才放进去
                    //     ct.set('ntms', [upper_people]);
                    // };
                    ct.save().done(function() {
                        ct.fetch().done(function() {
                            self.wfapproveEditView.model = ct;
                            self.wfapproveEditView.render();
                        })
                    })

                } else {
                    ct = self.c_wf_approve.get(fa_id);
                    if (ct) {
                        self.wfapproveEditView.model = ct;
                        self.wfapproveEditView.render();

                    } else {
                        ct = new WFApproveModel({
                            _id: fa_id
                        });
                        ct.fetch().done(function() {
                            self.c_wf_approve.push(ct); //放到collection里面
                            self.wfapproveEditView.model = ct;
                            self.wfapproveEditView.render();
                        })
                    };
                };
                // console.log(fa_id, p_task, ct);
                $("body").pagecontainer("change", "#wf_approve_edit", {
                    reverse: false,
                    changeHash: false,
                });
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
                
            },
            init_models: function() {

            },
            init_collections: function() {
                this.c_wf_approve = new WFApproveCollection(); //全体相关的流程
            },
            bind_events: function() {

            }
        });

        return WFApproveRouter;
    })