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

                this.collection.on("sync", function() {
                    self.render()
                }, this);
                self.state = '1'; //默认是1
                self.mode = 'all_project';
                this.bind_event();
            },

            // Renders all of the CollProject models on the UI
            render: function() {

                var self = this;
                self.mode = $("#collproject_view_mode").val() || 'all_project';
                var render_mode = 'project';
                var login_people = $("#login_people").val();

                var tmp = _.map(self.collection.models, function(x) {
                        return x.toJSON();
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
                            return x.state == self.state;
                        }),
                        render_mode: render_mode,
                    };
                    // console.log(render_data);
                    var ts_count = _.countBy(models4render, function(x) {
                        return x.state;
                    });
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



                $("#btn-collproject_list-add").attr('href', '#collproject_edit/add');

                $("#collproject-content").html(self.template(render_data));
                $("#collproject-content").trigger('create');
                return this;

            },
            bind_event: function() {
                var self = this;
                $("#collproject")
                    .on('change', '#collproject_view_mode', function(event) {
                        event.preventDefault();
                        self.mode = this.value;
                        self.render();
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
                        event.preventDefault();
                        var $this = $(this);
                        self.state = $this.val();
                        self.render();
                        $("#collproject-left-panel").panel("close");
                        // console.log($this.val());
                    });
            },

        });

        // Returns the View class
        return CollProjectListViewAll;

    });