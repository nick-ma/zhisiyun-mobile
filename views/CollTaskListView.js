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

                    self.render(localStorage.getItem('ct_render_mode') || 'all_task')
                }, this);
                this.bind_event();
            },

            // Renders all of the CollTask models on the UI
            render: function(mode) {

                var self = this;
                localStorage.setItem('ct_render_mode', mode); //通过local storage来保存状态

                var models4render = [];
                var render_mode = '';
                var login_people = $("#login_people").val();
                var render_data;
                if (mode == 'all_task') {
                    render_mode = 'task';
                    // console.log(mode);
                    models4render = _.filter(self.collection.models, function(x) {
                        return x
                    });
                } else if (mode == 'my_task_1') { //我发起的任务
                    render_mode = 'task';
                    models4render = _.filter(self.collection.models, function(x) {
                        return x.get('creator')._id == login_people;
                    })
                } else if (mode == 'my_task_2') { //我负责的任务
                    render_mode = 'task';
                    models4render = _.filter(self.collection.models, function(x) {
                        return x.get('th')._id == login_people;
                    })
                } else if (mode == 'my_task_3') { //我参与的任务
                    render_mode = 'task';
                    models4render = _.filter(self.collection.models, function(x) {
                        return !!_.find(x.get('tms'), function(y) {
                            return y._id == login_people;
                        })
                    })
                } else if (mode == 'my_task_4') { //我观察的任务
                    render_mode = 'task';
                    models4render = _.filter(self.collection.models, function(x) {
                        return !!_.find(x.get('ntms'), function(y) {
                            return y._id == login_people;
                        })
                    })
                } else if (mode == 'my_project') { //我发起的项目
                    render_mode = 'project';
                    // alert('即将实现');

                } else if (mode == 'my_pis') { //我发起的项目
                    render_mode = 'pi';
                    // alert('即将实现');

                };
                if (render_mode == 'task') {
                    render_data = {
                        cts: _.sortBy(_.map(_.filter(models4render, function(x) {
                            return !x.get('isfinished');
                        }), function(x) {
                            return x.toJSON();
                        }), function(x) {
                            return new Date(x.end);
                        }),
                        cts_finished: _.sortBy(_.map(_.filter(models4render, function(x) {
                            return x.get('isfinished');
                        }), function(x) {
                            return x.toJSON();
                        }), function(x) {
                            return -new Date(x.end);
                        }),
                        render_mode: render_mode,
                    };
                    _.each(render_data.cts, function(x) {
                        x.sub_task_num = _.filter(self.collection.models, function(y) {
                            return y.get('p_task') == x._id
                        }).length;
                    });
                    _.each(render_data.cts_finished, function(x) {
                        x.sub_task_num = _.filter(self.collection.models, function(y) {
                            return y.get('p_task') == x._id
                        }).length;
                    });
                } else if (render_mode == 'project') {
                    render_data = {
                        projects: [],
                        render_mode: render_mode,
                    };
                    var tmp = _.sortBy(_.map(self.collection.models, function(x) {
                        return x.toJSON();
                    }), function(x) {
                        return new Date(x.end);
                    });
                    render_data.projects = _.groupBy(tmp, function(x) {
                        return x.cp_name;
                    });
                    // render_data.projects = _.map(render_data.projects, function(val, key) {
                    //     return {
                    //         cp_name: key || '无关联项目的任务',
                    //         cts: val
                    //     }
                    // })
                    // console.log(render_data.projects);
                } else if (render_mode == 'pi') {
                    render_data = {
                        pis: [],
                        render_mode: render_mode,
                    };
                    var tmp = _.sortBy(_.map(self.collection.models, function(x) {
                        return x.toJSON();
                    }), function(x) {
                        return new Date(x.end);
                    });
                    render_data.pis = _.groupBy(tmp, function(x) {
                        return (x.pi) ? x.pi.pi_name : '';
                    });

                    console.log(render_data.pis);
                };

                // _.each(this.collection.models, function(x) {
                //     x.attributes.pi_count = x.attributes.qualitative_pis.items.length + x.attributes.quantitative_pis.items.length;
                //     rendered.push(self.template(x.attributes));
                // });
                // self.template(render_data);
                $("#colltask-content").html(self.template(render_data));
                $("#colltask-content").trigger('create');
                return this;

            },
            bind_event: function() {
                var self = this;
                $("#colltask")
                    .on('change', '#colltask_view_mode', function(event) {
                        event.preventDefault();
                        self.render(this.value);
                    });
            }

        });

        // Returns the View class
        return CollTaskListView;

    });