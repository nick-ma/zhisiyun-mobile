// WFApprove List View
// =================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "moment", "../../models/WFApproveModel"],
    function($, _, Backbone, Handlebars, moment, WFApproveModel) {

        // Extends Backbone.View
        var WFApproveListView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                var self = this;
                this.template = Handlebars.compile($("#hbtmp_wf_approve_list_view").html());
                // The render method is called when WFApprove Models are added to the Collection
                // this.collection.on("sync", function() {
                //     self.render()
                // }, this);
                self.mode = '1';
                self.search_term = ''; //过滤条件
                self.date_offset = 30; //过滤条件
                this.bind_event();
            },

            // Renders all of the WFApprove models on the UI
            render: function() {

                var self = this;
                self.mode = $("#wf_approve_list input[type=radio][name=wf_approve_view_mode]:checked").val() || '1';
                // console.log(self.state);
                // localStorage.setItem('ct_render_mode', mode); //通过local storage来保存状态

                var models4render = [];
                var render_mode = '';
                var login_people = $("#login_people").val();
                var render_data;
                var tmp = _.map(self.collection.models, function(x) {
                    return x.toJSON();
                });
                // console.log(tmp);
                //根据条件进行过滤
                if (self.search_term) {
                    var st = /./;
                    st.compile(self.search_term);
                    tmp = _.filter(tmp, function(x) {
                        return st.test(x.name);
                    })
                };
                var dm1 = _.filter(tmp, function(x) {
                    return x.state == 'START' && x.current_handler._id == login_people;
                });
                var dm2 = _.filter(tmp, function(x) {
                    return !!_.find(x.tasks, function(y) {
                        return y.people._id == login_people;
                    }) && (!x.current_handler || x.current_handler._id != login_people)
                })
                var dm3 = _.filter(tmp, function(x) {
                    return x.creator._id == login_people;
                })
                var ts_count = {
                    '1': dm1.length,
                    '2': dm2.length,
                    '3': dm3.length
                };
                // 整理前端需要渲染的数据
                if (self.mode == '1') { //待办任务
                    render_mode = 'todo';
                    models4render = dm1;
                } else if (self.mode == '2') { //已办任务
                    render_mode = 'done';
                    models4render = dm2;
                } else if (self.mode == '3') { //我发起的流程
                    render_mode = 'mywf';
                    models4render = dm3
                }

                render_data = {
                    render_mode: render_mode,
                    fas: models4render
                }
                _.each($("#wf_approve-left-panel label"), function(x) {
                    // console.log(x);
                    $(x).find('span').html(ts_count[$(x).data('mode')] || 0);
                })

                $("#wf_approve-content").html(self.template(render_data));
                $("#wf_approve-content").trigger('create');
                return this;

            },
            bind_event: function() {
                var self = this;
                $("#wf_approve_list")
                    .on('change', '#wf_approve_view_mode', function(event) {
                        event.preventDefault();
                        self.mode = this.value;
                        self.render();
                    })
                    .on('click', '.open-left-panel', function(event) {
                        event.preventDefault();
                        $("#wf_approve-left-panel").panel("open");
                    })
                    .on('swiperight', function(event) { //向右滑动，打开左边的面板
                        // console.log('message on touchStart');
                        // event.preventDefault();
                        $("#wf_approve-left-panel").panel("open");
                    })
                    .on('click', '#btn-wf_approve-refresh', function(event) {
                        event.preventDefault();
                        $.mobile.loading("show");
                        self.collection.fetch().done(function() {
                            $.mobile.loading("hide");
                            $("#wf_approve-left-panel").panel("close");
                        });
                    })
                    .on('change', '#wf_approve-left-panel input[name=wf_approve_view_mode]', function(event) {
                        event.preventDefault();
                        var $this = $(this);
                        self.mode = $this.val();
                        self.render();
                        $("#wf_approve-left-panel").panel("close");
                        // console.log($this.val());
                    })
                    .on('change', '#wf_approve-left-panel select', function(event) {
                        event.preventDefault();
                        var $this = $(this);
                        var field = $this.data("field");
                        var value = $this.val();
                        self[field] = value;
                        if (field == 'date_offset') { //需要重新获取数据
                            $.mobile.loading("show");
                            self.collection.date_offset = value;
                            self.collection.fetch().done(function() {
                                $.mobile.loading("hide");
                                self.render();
                            })
                        } else {
                            self.render();
                        };
                        // $("#wf_approve-left-panel").panel("close");
                        // console.log($this.val());
                    })
                    .on('change', '#cf_wf_approve_name', function(event) {
                        event.preventDefault();
                        var $this = $(this);
                        self.search_term = $this.val();
                        self.render();
                    })
                    .on('click', '#btn-wf_approve-add', function(event) { //新建一个流程
                        event.preventDefault();
                        var name = prompt("请输入报批流程的标题");
                        if (name) {
                            var new_wf = new WFApproveModel({
                                name: name,
                                content: '手机创建'
                            });
                            new_wf
                                .save()
                                .done(function() {
                                    alert('流程启动成功');
                                    var url = '#wf_approve_edit/' + new_wf.get('_id');
                                    window.location.href = url;
                                })
                        } else {
                            alert("必须输入标题才启动报批流程");
                        };
                    });

            }

        });

        // Returns the View class
        return WFApproveListView;

    });