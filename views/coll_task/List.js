// CollTask List View
// =================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "moment", "async", "lzstring",
        "../../collections/CollTasksDiff", "../../collections/CollTasksRemain",
    ],
    function($, _, Backbone, Handlebars, moment, async, LZString, CollTasksDiff, CollTasksRemain) {

        // Extends Backbone.View
        var CollTaskListView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                var self = this;
                this.template = Handlebars.compile($("#hbtmp_coll_task_list_view").html());
                // The render method is called when CollTask Models are added to the Collection
                // this.collection.on("sync", function() {
                //     self.render()
                // }, this);
                self.state = '0'; //默认是0
                self.mode = 'all_task';
                self.importance = ''; //过滤条件
                self.urgency = ''; //过滤条件
                self.search_term = ''; //过滤条件
                self.ct_date_offset = 90; //过滤条件
                self.cts_diff = new CollTasksDiff();
                self.cts_remain = new CollTasksRemain();
                this.bind_event();
            },

            // Renders all of the CollTask models on the UI
            render: function() {

                var self = this;
                // update select box
                // if (localStorage.getItem('ct_date_offset') != self.ct_date_offset) {
                //     $("#fc_date_offset").val(localStorage.getItem('ct_date_offset') || self.ct_date_offset);
                //     $("#fc_date_offset").trigger('change');
                //     return;
                // };

                self.mode = $("#colltask_view_mode").val() || 'all_task';
                // console.log(self.state);
                // localStorage.setItem('ct_render_mode', mode); //通过local storage来保存状态

                var models4render = [];
                var render_mode = '';
                var login_people = $("#login_people").val();
                var render_data;
                var tmp = _.map(self.collection.models, function(x) {
                    return x.toJSON();
                });
                //根据条件进行过滤
                if (self.search_term) {
                    var st = /./;
                    st.compile(self.search_term);
                    tmp = _.filter(tmp, function(x) {
                        return st.test(x.task_name);
                    })
                };
                if (self.importance) {
                    tmp = _.filter(tmp, function(x) {
                        return x.importance == self.importance;
                    })
                };
                if (self.urgency) {
                    tmp = _.filter(tmp, function(x) {
                        return x.urgency == self.urgency;
                    })
                };
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
                } else if (self.mode == 'my_task_5') { //我分派的任务
                    render_mode = 'task';
                    models4render = _.filter(tmp, function(x) {
                        return x.creator._id == login_people && x.th._id != login_people;
                    })
                } else if (self.mode == 'my_task_6') { //未打分
                    render_mode = 'task';
                    models4render = _.filter(tmp, function(x) {

                        var flag = false;
                        if (!flag) {
                            for (var i = 0; i < x.tms.length; i++) {
                                flag = (x.tms[i]._id == login_people) && !x.scores.tms[i];
                                if (flag) {
                                    break;
                                };
                            };
                        };
                        if (!flag) {
                            for (var i = 0; i < x.ntms.length; i++) {
                                flag = (x.ntms[i]._id == login_people) && !x.scores.ntms[i];
                                if (flag) {
                                    break;
                                };
                            };
                        };
                        return flag && x.isfinished;
                    })
                } else if (self.mode == 'my_task_7') { //未评定
                    render_mode = 'task';
                    models4render = _.filter(tmp, function(x) {
                        return x.isfinished && x.final_judge_people && x.final_judge_people._id == login_people && !x.final_judgement;
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
                        } else if (!x.end || moment(x.end).endOf('day').toDate() >= new Date()) { //没写结束日期的也算正常
                            x.state = '1';
                        } else {
                            x.state = '2';
                        };
                    })
                    var ts_count = _.countBy(models4render, function(x) {
                        return x.state;
                    });
                    ts_count['0'] = models4render.length;

                    render_data = {
                        cts: _.filter(models4render, function(x) {
                            if (self.state == '0') {
                                return true;
                            } else {
                                return x.state == self.state;
                            }
                        }),
                        render_mode: render_mode,
                    };
                    _.each(render_data.cts, function(x) {
                        x.sub_task_num = _.filter(tmp, function(y) {
                            return y.p_task == x._id
                        }).length;
                    });
                    // _.each($("#colltask-left-panel label"), function(x) {
                    //     // console.log(x);
                    //     $(x).find('span').html(ts_count[$(x).data('state')] || 0);
                    // })
                    _.each($("#colltask .btn-colltask-change_state"), function(x) {
                            $(x).find('.colltask_state_num').html(ts_count[$(x).data('state')] || 0);
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
                    // _.each($("#colltask-left-panel label"), function(x) {
                    //     // console.log(x);
                    //     $(x).find('span').html(ts_count[$(x).data('state')] || 0);
                    // })
                    _.each($("#colltask .btn-colltask-change_state"), function(x) {
                            $(x).find('.colltask_state_num').html(ts_count[$(x).data('state')] || 0);
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
                    // _.each($("#colltask-left-panel label"), function(x) {
                    //     // console.log(x);
                    //     $(x).find('span').html(ts_count[$(x).data('state')] || 0);
                    // })
                    _.each($("#colltask .btn-colltask-change_state"), function(x) {
                            $(x).find('.colltask_state_num').html(ts_count[$(x).data('state')] || 0);
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
                    _.each($("#colltask .btn-colltask-change_state"), function(x) {
                        $(x).find('.colltask_state_num').html(ts_count[$(x).data('state')] || 0);
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
                    .on('click', '.open-left-panel', function(event) {
                        event.preventDefault();
                        $("#colltask-left-panel").panel("open");
                    })
                    .on('swiperight', function(event) { //向右滑动，打开左边的面板
                        // console.log('message on touchStart');
                        // event.preventDefault();
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
                    // .on('change', '#colltask-left-panel input[name=colltask_state]', function(event) {
                    //     event.preventDefault();
                    //     var $this = $(this);
                    //     self.state = $this.val();
                    //     self.render();
                    //     $("#colltask-left-panel").panel("close");
                    //     // console.log($this.val());
                    // })
                    .on('change', '#colltask-left-panel select', function(event) {
                        event.preventDefault();
                        var $this = $(this);
                        var field = $this.data("field");
                        var value = $this.val();
                        self[field] = value;
                        if (field == 'date_offset') { //需要重新获取数据
                            $.mobile.loading("show");
                            // console.log(self.ct_date_offset , value);
                            if (self.ct_date_offset != value) {
                                self.ct_date_offset = value;
                                self.fetch_cts(function() {
                                    $.mobile.loading("hide");
                                    self.render();
                                });
                            };


                        } else {
                            self.render();
                        };
                        // $("#colltask-left-panel").panel("close");
                        // console.log($this.val());
                    })
                    .on('change', '#cf_task_name', function(event) {
                        event.preventDefault();
                        var $this = $(this);
                        self.search_term = $this.val();
                        self.render();
                    })
                    .on('click', '.btn-colltask-change_state', function(event) {
                        var $this = $(this);
                        self.state = $this.data('state');
                        self.render();
                        $('.btn-colltask-change_state').removeClass('ui-btn-active');
                        $this.addClass('ui-btn-active');
                    });
            },
            fetch_cts: function(callback) {
                var self = this;
                //检查localStorage
                var local_cts = JSON.parse(LZString.decompressFromUTF16(localStorage.getItem('cts') || '')) || [];
                if (local_cts.length && self.ct_date_offset == localStorage.getItem('ct_date_offset')) {
                    self.collection.set(local_cts);
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
                        self.collection.set(self.cts_diff.models, {
                            remove: false //只增加和修改，不删除
                        });
                        self.collection.set(self.cts_remain.models, {
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
                    self.collection.date_offset = self.ct_date_offset; //这里也应该来做差异更新－－TODO
                    self.collection.fetch().done(function() {
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
                var tmp = _.map(self.collection.toJSON(), function(x) {
                    return _.pick(x, '_id task_name cp cp_name creator th tms ntms start end allday isfinished lastModified comments attachments urgency importance skills pi scores need_accept did_accepted final_judge_people final_judgement'.split(' '));
                });
                // console.log(tmp);
                localStorage.setItem('cts', LZString.compressToUTF16(JSON.stringify(tmp)));
            }
        });

        // Returns the View class
        return CollTaskListView;

    });