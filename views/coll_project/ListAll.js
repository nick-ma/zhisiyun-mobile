// CollProject List View All
// ==========================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "moment"],
    function($, _, Backbone, Handlebars, moment) {

        // Extends Backbone.View
        var CollProjectListViewAll = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                var self = this;
                this.template = Handlebars.compile($("#hbtmp_coll_project_list_view_all").html());
                // The render method is called when CollProject Models are added to the Collection
                this.extra_select_template = Handlebars.compile($("#hbtmp_coll_project_cf_str_select_filter").html());
                // this.collection.on("sync", function() {
                //     self.render()
                // }, this);
                self.state = '0'; //默认是0
                self.mode = 'all_project';
                self.search_term = ''; //过滤条件
                self.date_offset = 30; //过滤条件
                self.date_pj_typeset = '0';
                self.extra_filter = {};
                this.bind_event();
            },

            // Renders all of the CollProject models on the UI
            render: function() {
                // console.log('message: render()');
                var self = this;
                self.mode = $("#collproject_view_mode").val() || 'all_project';
                var render_mode = 'project';
                var login_people = $("#login_people").val();

                var tmp = _.map(self.collection.models, function(x) {
                    return x.toJSON();
                });
                //根据条件进行过滤
                if (self.search_term) {
                    var st = /./;
                    st.compile(self.search_term);
                    tmp = _.filter(tmp, function(x) {
                        return st.test(x.project_name);
                    })
                };
                //过滤扩展字段
                _.each(self.extra_filter, function(val, key) {
                    // console.log(key, '->', val);
                    if (val != '全部') {
                        tmp = _.filter(tmp, function(x) {
                            return x[key] == val;
                        })
                    };
                })
                // 整理前端需要渲染的数据
                // console.log(tmp);
                var models4render;
                if (self.mode == 'all_project') {
                    models4render = tmp;
                    render_mode = 'project';
                } else if (self.mode == 'my_project_1') { //我发起的任务
                    models4render = _.filter(tmp, function(x) {
                        return x.creator._id == login_people;
                    })
                    render_mode = 'project';
                } else if (self.mode == 'my_project_2') { //我负责的任务
                    models4render = _.filter(tmp, function(x) {
                        return x.pm._id == login_people;
                    })
                    render_mode = 'project';
                } else if (self.mode == 'my_project_3') { //我参与的任务
                    models4render = _.filter(tmp, function(x) {
                        return !!_.find(x.pms, function(y) {
                            return y._id == login_people;
                        })
                    })
                    render_mode = 'project';
                } else if (self.mode == 'my_project_4') { //我观察的任务
                    models4render = _.filter(tmp, function(x) {
                        return !!_.find(x.npms, function(y) {
                            return y._id == login_people;
                        })
                    })
                    render_mode = 'project';
                } else if (self.mode == 'my_project_5') { //我的任务
                    models4render = _.filter(tmp, function(x) {
                        return x.creator._id == login_people && x.pm._id != login_people;
                    })
                    render_mode = 'project';
                } else if (self.mode == 'my_project_6') { //未评分
                    models4render = _.filter(tmp, function(x) {
                        var flag = false;
                        if (!flag) {
                            for (var i = 0; i < x.pms.length; i++) {
                                flag = (x.pms[i]._id == login_people) && !x.scores.pms[i];
                                if (flag) {
                                    break;
                                };
                            };
                        };
                        if (!flag) {
                            for (var i = 0; i < x.npms.length; i++) {
                                flag = (x.npms[i]._id == login_people) && !x.scores.npms[i];
                                if (flag) {
                                    break;
                                };
                            };
                        };
                        return flag && x.status == 'C';
                    })
                    render_mode = 'project';
                } else if (self.mode == 'my_project_7') { //未评定
                    models4render = _.filter(tmp, function(x) {
                        return x.status == 'C' && x.final_judge_people && x.final_judge_people._id == login_people && !x.final_judgement;
                    })
                    render_mode = 'project';
                } else if (self.mode == 'my_pis') { //指标相关
                    render_mode = 'pis';
                } else if (self.mode == 'my_skills') { //技能相关
                    render_mode = 'skills';
                }
                var render_data;


                if (render_mode == 'project') {
                    _.each(models4render, function(x) {
                        if (x.status == 'C') {
                            x.state = '3';
                        } else if (!x.end || moment(x.end).endOf('day').toDate() >= new Date()) {
                            x.state = '1';
                        } else {
                            x.state = '2';
                        };
                    })
                    render_data = {
                        cps: _.filter(models4render, function(x) { //没写结束日期的也算正常
                            if (self.state == '0') {
                                return true;
                            } else {
                                return x.state == self.state;
                            };
                        }),
                        render_mode: render_mode,
                    };
                    // console.log(render_data);
                    var ts_count = _.countBy(models4render, function(x) {
                        return x.state;
                    });
                    ts_count['0'] = models4render.length;
                    _.each($("#collproject-left-panel label"), function(x) {
                        // console.log(x);
                        $(x).find('span').html(ts_count[$(x).data('state')] || 0);
                    })

                } else if (render_mode == 'pis') {
                    var projects_by_pis = [];

                    _.each(_.filter(tmp, function(x) {
                        return x.pis.length;
                    }), function(x) {
                        _.each(x.pis, function(y) {
                            projects_by_pis.push({
                                sk: y.pi_name + '/' + y.period_name,
                                project: x
                            })
                        })
                    })
                    projects_by_pis = _.groupBy(projects_by_pis, function(x) {
                        return x.sk;
                    });
                    render_data = {
                        pis: projects_by_pis,
                        render_mode: render_mode,
                    }
                } else if (render_mode == 'skills') {
                    var projects_by_skills = [];

                    _.each(_.filter(tmp, function(x) {
                        return x.skills.length;
                    }), function(x) {
                        _.each(x.skills, function(y) {
                            projects_by_skills.push({
                                sk: y.skill_name,
                                project: x
                            })
                        })
                    })
                    projects_by_skills = _.groupBy(projects_by_skills, function(x) {
                        return x.sk;
                    });
                    render_data = {
                        skills: projects_by_skills,
                        render_mode: render_mode,
                    }
                };
                var items = []
                items.push('<option value="0" ' + (('0' == self.date_pj_typeset + '') ? 'selected' : '') + '>全部</option>')
                _.each(self.cp_types, function(type) {
                    items.push('<option value="' + type._id + '" ' + ((type._id == self.date_pj_typeset) ? 'selected' : '') + '>' + type.cp_type_name + '</option>')
                })
                $("#fc_pj_type_set").html(items.join(''))
                //自定义筛选
                $("#collproject_extra_filter_fields").empty(); //清空
                // console.log(self.cp_types);
                // console.log(self.cpfd);
                var cp_type = _.find(self.cp_types, function(x) {
                    return x._id == self.date_pj_typeset
                });
                if (cp_type) { //查到了，开始循环他的字段
                    var fd_filter_rendered = [];
                    _.each(cp_type.cp_type_fields, function(x) {
                        // console.log(x);
                        var field_define = self.cpfd[x];
                        // console.log(field_define);
                        if (field_define && field_define.cat == 'str' && field_define.ctype == 'select') {
                            // console.log(field_define);
                            var fd_render_data = {
                                title: field_define.title,
                                field_name: x,
                                field_value: self.extra_filter[x],
                                options: ['全部'].concat(field_define.options)
                            };
                            fd_filter_rendered.push(self.extra_select_template(fd_render_data));
                            // console.log(fd_render_data);
                        }
                        // _.find(self.cpfd,function  (val,key) {
                        //     return y.
                        // })
                    })
                    $("#collproject_extra_filter_fields").html(fd_filter_rendered.join(''));
                };
                $("#collproject-left-panel").trigger("create"); //渲染侧边栏
                // console.log(cp_type);
                $("#btn-collproject_list-add").attr('href', '#collproject_edit/add');

                $("#collproject-content").html(self.template(render_data));
                $("#collproject-content").trigger('create');
                // $("#collproject-left-panel").trigger('create');

                return this;

            },
            bind_event: function() {
                var self = this;
                $("#collproject")
                    .on('change', '#collproject_view_mode', function(event) {
                        // console.log('message: fired 3');
                        event.preventDefault();
                        self.mode = this.value;
                        self.render();
                    })
                    .on('click', '.open-left-panel', function(event) {
                        event.preventDefault();
                        $("#collproject-left-panel").panel("open");
                    })
                    .on('swiperight', function(event) { //向右滑动，打开左边的面板
                        event.preventDefault();
                        $("#collproject-left-panel").panel("open");
                    })
                    .on('click', '#btn-collproject-refresh', function(event) {
                        event.preventDefault();
                        $.mobile.loading("show");
                        self.collection.fetch().done(function() {
                            $.mobile.loading("hide");
                            $("#collproject-left-panel").panel("close");
                        });
                    })
                    .on('change', '#collproject-left-panel input[name=collproject_state]', function(event) {
                        // console.log('message: fired 2');
                        event.preventDefault();
                        var $this = $(this);
                        self.state = $this.val();
                        self.render();
                        $("#collproject-left-panel").panel("close");
                        // console.log($this.val());
                    })
                    .on('change', '#collproject-left-panel select', function(event) {
                        event.preventDefault();
                        var $this = $(this);
                        var field = $this.data("field");
                        var value = $this.val();
                        // console.log($this.data("extra"));
                        self[field] = value;
                        if (field == 'date_offset') { //需要重新获取数据
                            $.mobile.loading("show");
                            self.collection.date_offset = value;
                            self.collection.fetch().done(function() {
                                $.mobile.loading("hide");
                                self.render();
                            })
                        } else if (field == 'date_pj_typeset') {
                            $.mobile.loading("show");
                            self.collection.date_pj_typeset = value;
                            self.extra_filter = {}; //清空扩展字段
                            self.collection.fetch().done(function() {
                                $.mobile.loading("hide");
                                self.render();
                            })
                            // self.render();
                        } else if ($this.data("extra")) { //扩展字段
                            self.extra_filter[field] = value;
                            self.render();
                        }
                        // console.log('message: fired 1');
                        // $("#colltask-left-panel").panel("close");
                        // console.log($this.val());
                    })
                    .on('change', '#cf_project_name', function(event) {
                        event.preventDefault();
                        var $this = $(this);
                        self.search_term = $this.val();
                        self.render();
                    });

            },

        });

        // Returns the View class
        return CollProjectListViewAll;

    });