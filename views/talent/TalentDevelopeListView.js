// Contact Detail View
// ===================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars"],
    function($, _, Backbone, Handlebars) {

        // Extends Backbone.View
        var DevelopePlanListView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                this.template = Handlebars.compile($("#hbtmp_talent_develope_list_view").html());
                // The render method is called when People Models are added to the Collection
                this.loading_template = Handlebars.compile($("#loading_template_view").html());

                // this.collection.on("sync", this.render, this);
                this.bind_event();
            },
            pre_render: function() {
                var self = this;
                $("#talent_develope_list-content").html(self.loading_template({
                    info_msg: '数据加载中...请稍候'
                }));
                $("#talent_develope_list-content").trigger('create');
                return this;
            },
            // Renders all of the People models on the UI
            render: function() {

                var self = this;
                if (self.filter) {
                    var talent_data = self.filter_data;
                } else {
                    var talent_data = _.map(self.collection.models, function(x) {
                        var find_people = _.find(self.c_people.models, function(temp) {
                            return temp.attributes._id == String(x.attributes.people)
                        })
                        var find_direct = _.find(self.direct, function(temp) {
                            return temp.attributes._id == String(x.attributes.develope_direct)
                        })
                        x.attributes.people_data = find_people.attributes;
                        x.attributes.direct = find_direct.attributes;
                        x.attributes.integral = _.reduce(_.map(x.attributes.plan_divide, function(temp) {
                            return temp.pass ? temp.integral : 0
                        }), function(mem, num) {
                            return mem + num
                        }, 0)
                        return x.toJSON();
                    })
                }
                var direct = _.map(self.direct, function(temp) {
                    return temp.attributes
                })
                var type = _.map(self.type, function(temp) {
                    return temp.attributes
                })
                var obj = {
                    talent_data: talent_data,
                    status: self.status_data[String(self.people)],
                    direct: direct,
                    type: type
                }
                $("#talent_develope_list-content").html(self.template(obj));
                $("#talent_develope_list-content").trigger('create');

                return this;

            },

            bind_event: function() {
                var self = this;
                $("#talent_develope_list").on('click', '.open-left-panel', function(event) {
                    event.preventDefault();
                    $("#show_talent_develope_plan-left-panel").panel("open");
                }).on('swiperight', function(event) { //向右滑动，打开左边的面板
                    event.preventDefault();
                    $("#show_talent_develope_plan-left-panel").panel("open");
                }).on('click', '#btn_show_talent_twitter_view', function(event) {
                    event.preventDefault();
                    window.location.href = "#twitter_list";
                }).on('change', '#talent_develope_view_mode', function(event) {
                    event.preventDefault();
                    var select = $(this).val();
                    var team_obj = {
                        'A': 'self',
                        'B': 'myteam',
                        'C': 'myteam2',
                        'D': 'mentor'
                    }
                    var people_data = _.map(self.c_people.models, function(x) {
                        return x.toJSON()
                    })
                    var direct = _.map(self.direct, function(temp) {
                        return temp.attributes
                    })
                    if (team_obj[select] == 'self') {
                        self.collection.url = '/admin/pm/talent_develope/plan?people_id=' + self.people;
                        self.collection.fetch().done(function() {
                            var filter_data = _.map(self.collection.models, function(x) {
                                var find_people = _.find(people_data, function(temp) {
                                    return temp._id == String(x.attributes.people)
                                })
                                var find_direct = _.find(direct, function(temp) {
                                    return temp._id == String(x.attributes.develope_direct)
                                })
                                x.attributes.direct = find_direct;
                                x.attributes.integral = _.reduce(_.map(x.attributes.plan_divide, function(temp) {
                                    return temp.pass ? temp.integral : 0
                                }), function(mem, num) {
                                    return mem + num
                                }, 0)
                                x.attributes.people_data = find_people;
                                return x.toJSON()
                            });
                            self.filter_data = filter_data;
                            self.filter = true;
                            self.render();
                        });

                    } else {
                        self.collection.url = '/admin/pm/talent_develope/plan';
                        self.collection.fetch().done(function() {
                            var filter_data = _.map(self.collection.models, function(x) {
                                var find_people = _.find(people_data, function(temp) {
                                    return temp._id == String(x.attributes.people)
                                })
                                var find_direct = _.find(direct, function(temp) {
                                    return temp._id == String(x.attributes.develope_direct)
                                })
                                x.attributes.direct = find_direct;
                                x.attributes.integral = _.reduce(_.map(x.attributes.plan_divide, function(temp) {
                                    return temp.pass ? temp.integral : 0
                                }), function(mem, num) {
                                    return mem + num
                                }, 0)
                                x.attributes.people_data = find_people;
                                return x.toJSON()
                            })
                            if (team_obj[select] == 'myteam') {
                                var myteam = _.map(_.filter(people_data, function(temp) {
                                    return temp.myteam
                                }), function(p) {
                                    return String(p._id)
                                })
                                var filter_collection = _.filter(filter_data, function(x) {
                                    return !!~myteam.indexOf(String(x.people))
                                })
                                self.filter_data = filter_collection
                            } else if (team_obj[select] == 'myteam2') {
                                var myteam2 = _.map(_.filter(people_data, function(temp) {
                                    return temp.myteam2
                                }), function(p) {
                                    return String(p._id)
                                })
                                var filter_collection = _.filter(filter_data, function(x) {
                                    return !!~myteam2.indexOf(String(x.people))
                                })
                                self.filter_data = filter_collection

                            } else {

                                var filter_collection = _.filter(filter_data, function(x) {
                                    var mentor = [];
                                    _.each(x.plan_divide, function(p) {
                                        _.each(p.mentor, function(m) {
                                            mentor.push(String(m.people))
                                        })
                                    })
                                    return !!~mentor.indexOf(String(self.people))
                                })
                                self.filter_data = filter_collection;
                            }
                            self.filter = true;
                            self.render();

                        });

                    }
                }).on('vmousemove', 'img', function(event) {
                    event.preventDefault();
                    var img_view = '<img src="' + this.src + '">';
                    $("#fullscreen-overlay").html(img_view).fadeIn('fast');
                }).on('click', '#btn_show_myteam_view', function(event) {
                    event.preventDefault();
                    window.location.href = "#myteam";
                }).on('click', '#btn_show_talent_twitter_select_view', function(event) {
                    event.preventDefault();
                    window.location.href = "#talent_twitter_people";
                })
            }

        });

        // Returns the View class
        return DevelopePlanListView;

    });