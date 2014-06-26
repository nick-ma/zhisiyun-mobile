// CollTask List View
// =================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars"],
    function($, _, Backbone, Handlebars) {

        // Extends Backbone.View
        var CollTaskListView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                var self = this;
                this.template = Handlebars.compile($("#hbtmp_coll_task_list_view").html());
                // The render method is called when CollTask Models are added to the Collection
                this.collection.on("sync", function() {

                    self.render()
                }, this);
                self.state = '1'; //默认是1
                self.mode = 'all_task';
                this.bind_event();
            },

            // Renders all of the CollTask models on the UI
            render: function() {

                var self = this;
                self.mode = $("#colltask_view_mode").val() || 'all_task';
                // console.log(self.state);
                // localStorage.setItem('ct_render_mode', mode); //通过local storage来保存状态

                var models4render = [];
                var render_mode = '';
                var login_people = $("#login_people").val();
                var render_data;
                var tmp = _.map(self.collection.models, function(x) {
                        return x.toJSON();
                    })
                    // 计算自上次查看以来新增加的聊天条数
                var ct_last_view = JSON.parse(localStorage.getItem('ct_last_view')) || [];
                _.each(tmp, function(x) {
                    var found = _.find(ct_last_view, function(y) {
                        return y._id == x._id
                    })
                    if (found) { //找到了，根据里面记录的时间做计算
                        x.unviewed_comment_nums = _.filter(x.comments, function(z) {
                            return new Date(z.createDate) > new Date(found.ts);
                        }).length;
                    } else { //没找到，就按照当前时间计算。然后push进去。
                        x.unviewed_comment_nums = x.comments.length;
                        ct_last_view.push({
                            _id: x._id,
                            ts: new Date(197811250915), //from some reasonable start date
                        });
                    };

                })
                localStorage.setItem('ct_last_view', JSON.stringify(ct_last_view));
                // 整理前端需要渲染的数据
                if (self.mode == 'all_task') {
                    render_mode = 'task';
                    // console.log(mode);
                    models4render = tmp;
                } else if (self.mode == 'my_task_1') { //我发起的任务
                    render_mode = 'task';
                    models4render = _.filter(tmp, function(x) {
                        return x.creator._id == login_people;
                    })
                } else if (self.mode == 'my_task_2') { //我负责的任务
                    render_mode = 'task';
                    models4render = _.filter(tmp, function(x) {
                        return x.th._id == login_people;
                    })
                } else if (self.mode == 'my_task_3') { //我参与的任务
                    render_mode = 'task';
                    models4render = _.filter(tmp, function(x) {
                        return !!_.find(x.tms, function(y) {
                            return y._id == login_people;
                        })
                    })
                } else if (self.mode == 'my_task_4') { //我观察的任务
                    render_mode = 'task';
                    models4render = _.filter(tmp, function(x) {
                        return !!_.find(x.ntms, function(y) {
                            return y._id == login_people;
                        })
                    })
                } else if (self.mode == 'my_project') { //我发起的项目
                    render_mode = 'project';
                    // alert('即将实现');

                } else if (self.mode == 'my_pis') { //我发起的项目
                    render_mode = 'pi';
                    // alert('即将实现');

                } else if (self.mode == 'my_skills') { //skills
                    render_mode = 'skills';
                    // alert('即将实现');

                };
                if (render_mode == 'task') {

                    _.each(models4render, function(x) {
                        if (x.isfinished) {
                            x.state = '3';
                        } else if (!x.end || moment(x.end).endOf('day').toDate() >= new Date()) {
                            x.state = '1';
                        } else {
                            x.state = '2';
                        };
                    })
                    render_data = {
                        cts: _.filter(models4render, function(x) { //没写结束日期的也算正常
                            return x.state == self.state;
                        }),
                        render_mode: render_mode,
                    };
                    _.each(render_data.cts, function(x) {
                        x.sub_task_num = _.filter(tmp, function(y) {
                            return y.p_task == x._id
                        }).length;
                    });
                    var ts_count = _.countBy(models4render, function(x) {
                        return x.state;
                    });
                    _.each($("#colltask-left-panel label"), function(x) {
                        // console.log(x);
                        $(x).find('span').html(ts_count[$(x).data('state')] || 0);
                    })
                    // _.each(render_data.cts_finished, function(x) {
                    //     x.sub_task_num = _.filter(tmp, function(y) {
                    //         return y.p_task == x._id
                    //     }).length;
                    // });
                } else if (render_mode == 'project') {
                    render_data = {
                        projects: [],
                        render_mode: render_mode,
                    };
                    var project_tasks = _.filter(tmp, function(x) {
                        return x.cp;
                    })

                    _.each(project_tasks, function(x) {
                        if (x.isfinished) {
                            x.state = '3';
                        } else if (!x.end || moment(x.end).endOf('day').toDate() >= new Date()) {
                            x.state = '1';
                        } else {
                            x.state = '2';
                        };
                    })

                    render_data.projects = _.groupBy(_.sortBy(_.filter(project_tasks, function(x) {
                        return x.state == self.state;
                    }), function(x) {
                        return new Date(x.end);
                    }), function(x) {
                        return x.cp_name;
                    });
                    var ts_count = _.countBy(project_tasks, function(x) {
                        return x.state;
                    });
                    _.each($("#colltask-left-panel label"), function(x) {
                        // console.log(x);
                        $(x).find('span').html(ts_count[$(x).data('state')] || 0);
                    })
                    // console.log(render_data.projects);
                } else if (render_mode == 'pi') {
                    render_data = {
                        pis: [],
                        render_mode: render_mode,
                    };
                    var pi_tasks = _.filter(tmp, function(x) {
                        return !_.isEmpty(x.pi);
                    })
                    _.each(pi_tasks, function(x) {
                        if (x.isfinished) {
                            x.state = '3';
                        } else if (!x.end || moment(x.end).endOf('day').toDate() >= new Date()) {
                            x.state = '1';
                        } else {
                            x.state = '2';
                        };
                    })
                    render_data.pis = _.groupBy(_.sortBy(_.filter(pi_tasks, function(x) {
                        return x.state == self.state;
                    }), function(x) {
                        return new Date(x.end);
                    }), function(x) {
                        return (x.pi) ? x.pi.pi_name : '';
                    });
                    var ts_count = _.countBy(pi_tasks, function(x) {
                        return x.state;
                    });
                    _.each($("#colltask-left-panel label"), function(x) {
                        // console.log(x);
                        $(x).find('span').html(ts_count[$(x).data('state')] || 0);
                    })
                    // console.log(render_data.pis);
                } else if (render_mode == 'skills') {
                    render_data = {
                        skills: [],
                        render_mode: render_mode,
                    };
                    var tasks_by_skills = [];
                    var skill_tasks = _.filter(tmp, function(x) {
                        return x.skills.length;
                    })
                    _.each(skill_tasks, function(x) {
                        if (x.isfinished) {
                            x.state = '3';
                        } else if (!x.end || moment(x.end).endOf('day').toDate() >= new Date()) {
                            x.state = '1';
                        } else {
                            x.state = '2';
                        };
                    })
                    // skill_tasks = _.filter(skill_tasks, function(x) {
                    //     return x.state == self.state;
                    // })
                    _.each(_.filter(skill_tasks, function(x) {
                        return x.state == self.state;
                    }), function(x) {
                        _.each(x.skills, function(y) {
                            tasks_by_skills.push({
                                sk: y.skill_name,
                                task: x
                            })
                        })
                    })

                    render_data.skills = _.groupBy(tasks_by_skills, function(x) {
                        return x.sk;
                    });
                    // console.log(render_data.skills);
                    var ts_count = _.countBy(skill_tasks, function(x) {
                        return x.state;
                    });
                    _.each($("#colltask-left-panel label"), function(x) {
                        // console.log(x);
                        $(x).find('span').html(ts_count[$(x).data('state')] || 0);
                    })
                };


                $("#colltask-content").html(self.template(render_data));
                $("#colltask-content").trigger('create');
                return this;

            },
            bind_event: function() {
                var self = this;
                $("#colltask")
                    .on('change', '#colltask_view_mode', function(event) {
                        event.preventDefault();
                        self.mode = this.value;
                        self.render();
                    })
                    .on('swiperight', function(event) { //向右滑动，打开左边的面板
                        event.preventDefault();
                        $("#colltask-left-panel").panel("open");
                    })
                    .on('click', '#btn-colltask-refresh', function(event) {
                        event.preventDefault();
                        $.mobile.loading("show");
                        self.collection.fetch().done(function() {
                            $.mobile.loading("hide");
                            $("#colltask-left-panel").panel("close");
                        });
                    })
                    .on('change', '#colltask-left-panel input[name=colltask_state]', function(event) {
                        event.preventDefault();
                        var $this = $(this);
                        self.state = $this.val();
                        self.render();
                        $("#colltask-left-panel").panel("close");
                        // console.log($this.val());
                    });
            }

        });

        // Returns the View class
        return CollTaskListView;

    });