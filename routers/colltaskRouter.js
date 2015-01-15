// coll task router
// ====================

define(["jquery", "backbone", "handlebars", "lzstring", "moment", "async",
        // 协作任务
        "../models/CollTaskModel",
        "../collections/CollProjectCollection", "../collections/CollTaskCollection", "../collections/CollTaskCollection2",
        "../collections/CollTasksDiff", "../collections/CollTasksRemain",
        "../views/coll_task/List", "../views/coll_task/List2", "../views/coll_task/Detail", "../views/coll_task/Edit",
        // 协作项目－配套协作任务的
        "../views/coll_project/List",
    ],
    function($, Backbone, Handlebars, LZString, moment, async,
        CollTaskModel,
        CollProjectCollection, CollTaskCollection, CollTaskCollection2,
        CollTasksDiff, CollTasksRemain,
        CollTaskListView, CollTaskListView2, CollTaskDetailView, CollTaskEditView,
        CollProjectListView
    ) {

        var CollTaskRouter = Backbone.Router.extend({
            initialize: function() {
                var self = this;
                self.init_models();
                self.init_collections();
                self.init_views();
                self.bind_events();
                self.init_config_data();
                self.ct_date_offset = 90; //默认取90天

                console.info('app message: colltask router initialized');
                // Backbone.history.start();
            },
            routes: {
                // 协作任务
                "colltask": "colltask",
                "colltask2/:people_id": "colltask2",
                "colltask_detail/:ct_id": "colltask_detail",
                // "colltask_edit/:ct_id": "colltask_edit",
                "colltask_edit/:ct_id(/:p_task)": "colltask_edit",
                // 协作任务的项目
                "collproject/:ct_id/(:cp_id)": "collproject",
                // "collproject_edit/:ct_id(/:p_task)": "collproject_edit",
            },

            //--------协作任务--------//
            colltask: function() {
                localStorage.setItem('colltask_detail_back_url', window.location.href);

                var self = this;

                self.ct_date_offset = self.collTaskListView.ct_date_offset = localStorage.getItem('ct_date_offset') || 90; //默认取90天
                // localStorage.setItem('ct_date_offset', self.ct_date_offset); //保存到ls
                $("#fc_date_offset").val(self.ct_date_offset);
                $("#fc_date_offset").trigger('change');

                localStorage.setItem('colltask_detail_back_url', window.location.href);
                $("body").pagecontainer("change", "#colltask", {
                    reverse: false,
                    changeHash: false,
                });
                $.mobile.loading("show");
                self.fetch_cts(function() {
                    self.collTaskListView.render();
                    $.mobile.loading("hide");
                });

                // self.c_colltask.fetch().done(function() {

                // })
            },
            colltask2: function(people_id) {
                localStorage.setItem('colltask_detail_back_url', window.location.href);
                var self = this;
                $("body").pagecontainer("change", "#colltask2", {
                    reverse: false,
                    changeHash: false,
                });
                $.mobile.loading("show");

                self.c_colltask2.people_id = people_id;
                self.c_colltask2.fetch().done(function() {
                    self.collTaskListView2.people_id = people_id;
                    self.collTaskListView2.render();
                    $.mobile.loading("hide");
                })
            },
            colltask_detail: function(ct_id) {
                var self = this;
                $("body").pagecontainer("change", "#colltask_detail", {
                    reverse: false,
                    changeHash: false,
                });
                $.mobile.loading("show");
                self.collTaskDetailView.ctsl = self.ctsl;
                self.collTaskDetailView.pre_render();
                if (self.c_colltask.get(ct_id)) {
                    self.collTaskDetailView.model = self.c_colltask.get(ct_id);
                    self.collTaskDetailView.model.fetch().done(function() {
                        self.collTaskDetailView.render();
                        $.mobile.loading("hide");
                    })
                } else {
                    var tmp = new CollTaskModel({
                        _id: ct_id
                    });
                    tmp.fetch().done(function() {
                        console.log('message done');
                        self.c_colltask.set(tmp); //放到collection里面
                        self.collTaskDetailView.model = tmp;
                        self.collTaskDetailView.render();
                        $.mobile.loading("hide");
                    }).fail(function() { //针对手机app版
                        console.log('message fail');
                        $.mobile.loading("hide");
                        alert('任务已被删除')
                        window.location.href = "#"
                    })
                };
            },
            colltask_edit: function(ct_id, p_task) {
                var ct;
                var self = this;
                if (ct_id == 'add') { //新增
                    ct = self.c_colltask.add({
                        task_name: '新建任务',
                        start: new Date(),
                        end: moment().add(3, 'day').toDate(),
                        allday: true,
                        p_task: p_task || null,
                        comments: [],

                    });
                    if (p_task) { //取出上级任务的相关信息
                        var pt = self.c_colltask.get(p_task);
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
                            self.collTaskEditView.model = ct;
                            self.collTaskEditView.render();
                        })
                    })

                } else {
                    ct = self.c_colltask.get(ct_id);
                    if (ct) {
                        self.collTaskEditView.model = ct;
                        self.collTaskEditView.render();

                    } else {
                        ct = new CollTaskModel({
                            _id: ct_id
                        });
                        ct.fetch().done(function() {
                            self.c_colltask.push(ct); //放到collection里面
                            self.collTaskEditView.model = ct;
                            self.collTaskEditView.render();
                        })
                    };
                };
                // console.log(ct_id, p_task, ct);
                $("body").pagecontainer("change", "#colltask_edit", {
                    reverse: false,
                    changeHash: false,
                });
            },
            collproject: function(ct_id, cp_id) {
                // collProjectListView
                var self = this;
                $("body").pagecontainer("change", "#collproject_list", {
                    reverse: false,
                    changeHash: false,
                });
                $.mobile.loading("show");
                self.collProjectListView.collection.fetch().done(function() {
                    self.collProjectListView.render();
                    self.collProjectListView.ct_id = ct_id;
                    self.collProjectListView.ct_model = self.c_colltask.get(ct_id);
                    self.collProjectListView.cp_id = cp_id;
                    $.mobile.loading("hide");
                });
            },
            // collproject_edit: function(cp_id, ct_id) {
            //     var cp;
            //     if (cp_id == 'add') {
            //         cp = this.c_collproject.add({
            //             project_name: ''
            //         });
            //     } else {
            //         cp = this.c_collproject.get(cp_id);
            //     };
            //     this.collProjectEditView.ct_id = ct_id;
            //     this.collProjectEditView.model = cp;
            //     this.collProjectEditView.render();
            //     $("body").pagecontainer("change", "#collproject_edit", {
            //         reverse: false,
            //         changeHash: false,
            //     });
            // },
            //
            init_views: function() {
                var self = this;
                this.collTaskListView = new CollTaskListView({
                    el: "#colltask-content",
                    collection: self.c_colltask
                })
                this.collTaskListView2 = new CollTaskListView2({
                    el: "#colltask-content2",
                    collection: self.c_colltask2
                })
                this.collTaskEditView = new CollTaskEditView({
                    el: "#colltask_edit-content",
                })
                this.collTaskDetailView = new CollTaskDetailView({
                    el: "#colltask_detail-content",
                })
                this.collProjectListView = new CollProjectListView({
                        el: "#collproject_list-content",
                        collection: self.c_collproject
                    })
                    // this.collProjectEditView = new CollProjectEditView({
                    //     el: "#collproject_edit-content",
                    // })
            },
            init_models: function() {

            },
            init_collections: function() {
                this.c_colltask = new CollTaskCollection(); //协作任务
                this.c_colltask2 = new CollTaskCollection2(); //下属的协作任务
                this.c_collproject = new CollProjectCollection(); //协作项目
                this.cts_diff = new CollTasksDiff();
                this.cts_remain = new CollTasksRemain();
                // this.c_colltask.on('sync', function(event) { //放到local storage


                // });
            },
            bind_events: function() {

            },
            init_config_data: function() {
                var self = this;
                $.get("/admin/pm/coll_task_sl/bb/getdata", function(data) { //评分等级组
                    self.ctsl = _.clone(data);
                })
            },
            fetch_cts: function(callback) {
                var self = this;
                //检查localStorage
                var local_cts = JSON.parse(LZString.decompressFromUTF16(localStorage.getItem('cts') || '')) || [];
                if (local_cts.length && self.ct_date_offset == localStorage.getItem('ct_date_offset')) {
                    self.c_colltask.set(local_cts);
                    // 判断是否需要差异刷新
                    async.parallel({
                        diff: function(cb) {
                            self.cts_diff.reset(); //清空一下
                            self.cts_diff.last_fetch_ts = localStorage.getItem('ct_last_fetch_ts');
                            self.cts_diff.fetch().done(function() {
                                cb(null, 'OK');
                            })
                        },
                        remain: function(cb) {
                            self.cts_remain.reset(); //清空一下
                            self.cts_remain.date_offset = self.ct_date_offset; //按最大的取
                            self.cts_remain.fetch().done(function() {
                                cb(null, 'OK');
                            })
                        }
                    }, function(err, result) {
                        // console.log(result);
                        self.c_colltask.set(self.cts_diff.models, {
                            remove: false //只增加和修改，不删除
                        });
                        self.c_colltask.set(self.cts_remain.models, {
                            add: false //不增加
                        });
                        self.save_cts_to_localStorage();
                        localStorage.setItem('ct_last_fetch_ts', (new Date()).getTime());
                        // cts.trigger('sync');
                        if (typeof callback == 'function') {
                            callback();
                        };
                    })

                } else { //全部刷新
                    // if (parseInt(ct_date_offset) > parseInt(ct_date_offset_max)) {
                    //     ct_date_offset_max = parseInt(ct_date_offset)
                    //     localStorage.setItem('ct_date_offset_max', ct_date_offset_max);
                    // };
                    localStorage.setItem('ct_date_offset', self.ct_date_offset);
                    self.c_colltask.date_offset = self.ct_date_offset; //这里也应该来做差异更新－－TODO
                    self.c_colltask.fetch().done(function() {
                        self.save_cts_to_localStorage()
                            // localStorage.setItem('ct_date_offset_max', ct_date_offset_max);
                        localStorage.setItem('ct_last_fetch_ts', (new Date()).getTime());
                        if (typeof callback == 'function') {
                            callback();
                        };
                    })
                };
            },
            // 保存cts到localStorage -- 只保留列表视图需要用到的字段
            save_cts_to_localStorage: function() {
                var self = this;
                var tmp = _.map(self.c_colltask.toJSON(), function(x) {
                    return _.pick(x, '_id task_name cp cp_name creator th tms ntms start end allday isfinished lastModified comments attachments urgency importance skills pi scores need_accept did_accepted final_judge_people final_judgement'.split(' '));
                });
                // console.log(tmp);
                localStorage.setItem('cts', LZString.compressToUTF16(JSON.stringify(tmp)));
            }
        });

        return CollTaskRouter;
    })