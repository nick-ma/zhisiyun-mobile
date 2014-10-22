// talent router
// ====================

define(["jquery", "backbone", "handlebars", "lzstring", "async",
        "../views/talent/TalentDevelopeListView",
        "../views/talent/TalentWfSuperiorTwitterView",
        "../views/talent/TalentPeopleSelectView",
        "../views/talent/SuperiorTwitterFormView",
        "../views/talent/SuperiorTwitterForm2View",
        "../views/talent/TalentDevelopeDetailListView", //培养计划明细列表
        "../views/talent/TalentDevelopeDetailOperationListView", //培养计划明细列表
        "../views/talent/CourseView", //课程选择
        "../views/talent/LambdaListView", //人才对比
        "../collections/DevelopePlanCollection",
        "../collections/DevelopeDirectCollection",
        "../collections/DevelopeTypeCollection",
        "../collections/DevelopeCheckCollection",
        "../collections/DevelopeLearnCollection",
        "../collections/SuperiorTwitterCollection",
        "../collections/PeopleCollection",
        "../collections/CourseCollection", //课程
        "../collections/TalentCollection", //人才
        "../collections/CompetencyCollection", //能力素质
        "../collections/AssessmentCollection", //绩效得分
        "../models/DevelopePlanModel",
        "../models/DevelopeDirectModel",
        "../models/DevelopeTypeModel",
        "../models/DevelopeCheckModel",
        "../models/DevelopeLearnModel",
        "../models/SuperiorTwitterModel",
        "../models/CourseModel", //课程
        "../models/AssessmentModel",
        "../models/CompetencyModel",
        "../models/TalentModel",



    ],
    function($, Backbone, Handlebars, LZString, async,
        DevelopePlanListView, //我的培养计划
        TalentWfSuperiorTwitterView, //人才提名流程
        TalentPeopleSelectView, //人才选择界面
        SuperiorTwitterFormView, //人才提名流程表单
        SuperiorTwitterForm2View, //人才提名流程表单
        DevelopePlanDetailListView,
        DevelopePlanDetailOperationListView,
        CourseView,
        LambdaListView, //人才对比
        DevelopePlanCollection,
        DevelopeDirectCollection,
        DevelopeTypeCollection,
        DevelopeCheckCollection,
        DevelopeLearnCollection,
        SuperiorTwitterCollection,
        PeopleCollection,
        CourseCollection,
        TalentCollection, //人才
        CompetencyCollection, //能力素质
        AssessmentCollection, //绩效得分
        DevelopePlanModel,
        DevelopeDirectModel,
        DevelopeTypeModel,
        DevelopeCheckModel,
        DevelopeLearnModel,
        SuperiorTwitterModel,
        CourseModel,
        AssessmentModel,
        CompetencyModel,
        TalentModel
    ) {

        var TalentRouter = Backbone.Router.extend({
            initialize: function() {
                var self = this;
                self.init_models();
                self.init_collections();
                self.init_views();
                self.init_data();
                // self.bind_events();
                console.info('app message: TALENT router initialized');
            },
            routes: {
                "plan_list": "plan_list", //人才培养计划列表
                "twitter_list": "twitter_list", //人才提名历史数据
                "talent_twitter_people/:type": "talent_twitter_people", //人员选择（人才提名）
                "godo10/:op_id/:type": "go_do10",
                "godo10_view/:pi_id": "go_do10_view", //市区公干流程查看
                "plan_list_detail/:plan_id": "plan_list_detail", //人才培养计划明细
                "plan_list_detail/:plan_id/:divide_id": "plan_list_detail_operation", //人才培养计划明细
                "course": "course", //课程选择
                "lambda_list": "lambda_list"  //人才对比列表

            },
            plan_list: function() { //我的培养计划列表
                var self = this;
                $("body").pagecontainer("change", "#talent_develope_list", {
                    reverse: false,
                    changeHash: false,
                });
                $.mobile.loading("show");
                self.DevelopePlanListView.pre_render();
                var people = $("#login_people").val();
                self.DevelopePlanListView.people = people;

                // self.dtCollection.fetch();
                // // self.c_people.url = '/admin/masterdata/people/people_list4m?people_id=' + people;
                // self.c_people.fetch();


                async.parallel({
                    dd: function(cb) {
                        self.ddCollection.fetch().done(function() {
                            cb(null, self)
                        });

                    },
                    dt: function(cb) {
                        self.dtCollection.fetch().done(function() {
                            cb(null, self)
                        });
                    },
                    c_people: function(cb) {
                        self.c_people.fetch().done(function() {
                            cb(null, self)
                        });
                    },
                    status: function(cb) {
                        $.get('/admin/pm/talent_develope/people', function(data) {
                            if (data) {
                                self.DevelopePlanListView.people_data = data.data;
                                self.DevelopePlanListView.status_data = data.status;
                            }
                            cb(null, 'OK')
                        })
                    },

                }, function(err, result) {
                    self.DevelopePlanListView.c_people = self.c_people; //人员数据
                    self.DevelopePlanListView.direct = self.ddCollection.models;
                    self.DevelopePlanListView.type = self.dtCollection.models;

                    //第一个分支解决回退回来数据不能显示的问题
                    var plan_list_mode = localStorage.getItem("plan_detail_list_mode");
                    // localStorage.removeItem("plan_detail_list_mode");
                    if (plan_list_mode) {
                        var people_data = _.map(self.DevelopePlanListView.c_people.models, function(x) {
                            return x.toJSON()
                        })
                        var direct = _.map(self.DevelopePlanListView.direct, function(temp) {
                            return temp.attributes
                        })
                        localStorage.setItem("TalentMentor", "False");
                        if (plan_list_mode == "self") {
                            self.DevelopePlanListView.collection.url = '/admin/pm/talent_develope/plan?people_id=' + people;
                            self.DevelopePlanListView.collection.fetch().done(function() {
                                var filter_data = _.map(self.DevelopePlanListView.collection.models, function(x) {
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
                                self.DevelopePlanListView.filter_data = filter_data;
                                self.DevelopePlanListView.render();
                                $.mobile.loading("hide");
                            });
                        } else {
                            self.DevelopePlanListView.collection.url = '/admin/pm/talent_develope/plan';
                            self.DevelopePlanListView.collection.fetch().done(function() {
                                var filter_data = _.map(self.DevelopePlanListView.collection.models, function(x) {
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
                                if (plan_list_mode == 'myteam') {
                                    var myteam = _.map(_.filter(people_data, function(temp) {
                                        return temp.myteam
                                    }), function(p) {
                                        return String(p._id)
                                    })
                                    var filter_collection = _.filter(filter_data, function(x) {
                                        return !!~myteam.indexOf(String(x.people))
                                    })
                                    self.DevelopePlanListView.filter_data = filter_collection;
                                } else if (plan_list_mode == 'myteam2') {
                                    var myteam2 = _.map(_.filter(people_data, function(temp) {
                                        return temp.myteam2
                                    }), function(p) {
                                        return String(p._id)
                                    })
                                    var filter_collection = _.filter(filter_data, function(x) {
                                        return !!~myteam2.indexOf(String(x.people))
                                    })
                                    self.DevelopePlanListView.filter_data = filter_collection

                                } else {

                                    var filter_collection = _.filter(filter_data, function(x) {
                                        var mentor = [];
                                        _.each(x.plan_divide, function(p) {
                                            _.each(p.mentor, function(m) {
                                                mentor.push(String(m.people))
                                            })
                                        })
                                        return !!~mentor.indexOf(String(people))
                                    })
                                    self.DevelopePlanListView.filter_data = filter_collection;
                                    localStorage.setItem("TalentMentor", "True"); //过滤与我相关的明细计划。
                                }
                                self.DevelopePlanListView.render();
                                $.mobile.loading("hide");

                            });
                        }



                    } else {
                        self.DevelopePlanListView.collection.url = '/admin/pm/talent_develope/plan?people_id=' + people;
                        self.DevelopePlanListView.collection.fetch().done(function() {
                            self.DevelopePlanListView.render();
                            $.mobile.loading("hide");

                        })
                    }
                })

            },
            twitter_list: function() { //我的人才提名历史数据
                var self = this;
                $("body").pagecontainer("change", "#superior_twitter_list", {
                    reverse: false,
                    changeHash: false,
                });
                $.mobile.loading("show");
                self.SuperiorTwitterListView.pre_render();
                var people = $("#login_people").val();
                self.SuperiorTwitterListView.people = people;
                self.ddCollection.fetch();
                self.SuperiorTwitterListView.direct = self.ddCollection.models;
                // self.SuperiorTwitterListView.collection.url = '/admin/pm/talent_wf/superior4m?people=' + people;
                self.SuperiorTwitterListView.collection.fetch().done(function() {
                    self.SuperiorTwitterListView.render();
                    $.mobile.loading("hide");

                })

            },
            talent_twitter_people: function() {
                var self = this;
                self.peopleSelectView.people = $("#login_people").val();
                $("body").pagecontainer("change", "#talent_people_select", {
                    reverse: false,
                    changeHash: false,
                });
                self.c_people.fetch().done(function() {
                    self.peopleSelectView.render();

                })
            },
            go_do10: function(op_id, type, mode) {
                var self = this;
                var ti_id = op_id.split("-")[0];
                var pd_id = op_id.split("-")[1];
                var pd_code = op_id.split("-")[2];
                $("body").pagecontainer("change", "#superior_twitter_form", {
                    reverse: false,
                    changeHash: false,
                });
                $.mobile.loading("show");
                self.SuperiorTwitterFormView.pre_render();
                var people = $("#login_people").val();
                self.ddCollection.fetch();
                self.SuperiorTwitterFormView.direct = self.ddCollection.models;
                self.SuperiorTwitterFormView.model = self.stModel;
                async.parallel({
                    data1: function(cb) {
                        $.get('/admin/pm/talent_wf/edit_m/' + ti_id, function(data) {
                            if (data) {
                                self.SuperiorTwitterFormView.wf_data = data;
                                if (data.task_state != 'FINISHED') {
                                    self.SuperiorTwitterFormView.people = data.twitter.superior._id;
                                    self.SuperiorTwitterFormView.collection.url = '/admin/pm/talent_wf/superior/' + data.ti.process_instance.collection_id;
                                    self.SuperiorTwitterFormView.collection.fetch().done(function() {
                                        cb(null, self.SuperiorTwitterFormView.wf_data)

                                    })
                                } else {
                                    cb(null, null)
                                }

                            } else {
                                cb(null, null);
                            }
                        })
                    }
                }, function(err, ret) {
                    if (self.SuperiorTwitterFormView.wf_data.task_state == 'FINISHED') {
                        window.location = '/m#godo10_view/' + self.SuperiorTwitterFormView.wf_data.process_instance
                    } else {
                        var is_self = self.SuperiorTwitterFormView.people == String($("#login_people").val());
                        if (is_self) {
                            self.SuperiorTwitterFormView.view_mode = '';

                        } else {
                            self.SuperiorTwitterFormView.view_mode = 'deal_with';

                        }
                        self.SuperiorTwitterFormView.is_self = is_self;
                        self.SuperiorTwitterFormView.render();
                        if (!is_self) {
                            $("#superior_twitter_form select").attr("disabled", true);
                        }
                        $.mobile.loading("hide");


                    }
                })

            },
            go_do10_view: function(pi_id) {
                var self = this;
                $("body").pagecontainer("change", "#superior_twitter_form2", {
                    reverse: false,
                    changeHash: false,
                });
                $.mobile.loading("show");
                self.SuperiorTwitterForm2View.pre_render();
                self.ddCollection.fetch();
                self.SuperiorTwitterForm2View.direct = self.ddCollection.models;
                self.SuperiorTwitterForm2View.model = self.stModel;
                async.parallel({
                    data1: function(cb) {
                        $.get('/admin/pm/talent_wf/view_m/' + pi_id, function(data) {
                            if (data) {
                                self.SuperiorTwitterForm2View.wf_data = data;
                                self.SuperiorTwitterForm2View.collection.url = '/admin/pm/talent_wf/superior/' + data.pi.collection_id;
                                self.SuperiorTwitterForm2View.collection.fetch().done(function() {
                                    cb(null, data)
                                })
                            } else {
                                cb(null, null);
                            }
                        })
                    }
                }, function(err, ret) {
                    self.SuperiorTwitterForm2View.render();
                    $("#superior_twitter_form_title2").html("人才提名流程查看")
                    $("#superior_twitter_form2 select").attr("disabled", true);
                    $.mobile.loading("hide");


                })
            },
            plan_list_detail: function(plan_id) { //人才培养计划明细列表
                var self = this;
                $("body").pagecontainer("change", "#talent_develope_detail_list", {
                    reverse: false,
                    changeHash: false,
                });
                $.mobile.loading("show");
                self.DevelopePlanDetailListView.pre_render();
                var people = $("#login_people").val();
                self.DevelopePlanDetailListView.people = people;
                // self.ddCollection.fetch();
                // self.dtCollection.fetch();
                // self.dcCollection.fetch();
                // self.dlCollection.fetch();
                // // self.c_people.url = '/admin/masterdata/people/people_list4m?people_id=' + people;
                // self.c_people.fetch();


                async.parallel({
                    dd: function(cb) {
                        self.ddCollection.fetch().done(function() {
                            cb(null, self)
                        });

                    },
                    dt: function(cb) {
                        self.dtCollection.fetch().done(function() {
                            cb(null, self)
                        });
                    },
                    dc: function(cb) {
                        self.dcCollection.fetch().done(function() {
                            cb(null, self)
                        });
                    },
                    dl: function(cb) {
                        self.dlCollection.fetch().done(function() {
                            cb(null, self)
                        });
                    },
                    c_people: function(cb) {
                        self.c_people.fetch().done(function() {
                            cb(null, self)
                        });
                    },
                    status: function(cb) {
                        $.get('/admin/pm/talent_develope/people', function(data) {
                            if (data) {
                                self.DevelopePlanDetailListView.people_id_name = data.people_data;
                                self.DevelopePlanDetailListView.people_data = data.data;
                                self.DevelopePlanDetailListView.status_data = data.status;
                            }
                            cb(null, 'OK')
                        })
                    },

                }, function(err, result) {
                    self.DevelopePlanDetailListView.c_people = self.c_people; //人员数据
                    self.DevelopePlanDetailListView.direct = self.ddCollection.models;
                    self.DevelopePlanDetailListView.type = self.dtCollection.models;
                    self.DevelopePlanDetailListView.check = self.dcCollection.models;
                    self.DevelopePlanDetailListView.learn = self.dlCollection.models;
                    self.DevelopePlanDetailListView.collection.url = '/admin/pm/talent_develope/plan/' + plan_id;
                    self.DevelopePlanDetailListView.collection.fetch().done(function() {
                        self.DevelopePlanDetailListView.render();
                        $.mobile.loading("hide");

                    })
                })

            },
            plan_list_detail_operation: function(plan_id, divide_id) { //人才培养计划明细列表
                var self = this;
                $("body").pagecontainer("change", "#talent_develope_detail_operation_list", {
                    reverse: false,
                    changeHash: false,
                });
                $.mobile.loading("show");
                self.DevelopePlanDetailOperationListView.pre_render();
                var people = $("#login_people").val();
                self.DevelopePlanDetailOperationListView.people = people;
                self.ddCollection.fetch();
                self.dtCollection.fetch();
                // self.c_people.url = '/admin/masterdata/people/people_list4m?people_id=' + people;
                self.c_people.fetch();
                self.DevelopePlanDetailOperationListView.c_people = self.c_people; //人员数据
                self.DevelopePlanDetailOperationListView.direct = self.ddCollection.models;
                self.DevelopePlanDetailOperationListView.type = self.dtCollection.models;
                //明细计划
                self.DevelopePlanDetailOperationListView.divide_id = divide_id;
                async.parallel({
                    status: function(cb) {
                        $.get('/admin/pm/talent_develope/people', function(data) {
                            if (data) {
                                self.DevelopePlanDetailOperationListView.people_data = data.data;
                                self.DevelopePlanDetailOperationListView.status_data = data.status;
                            }
                            cb(null, 'OK')
                        })
                    },
                    file: function(cb) {
                        $.get('/admin/pm/talent_develope/file', function(data) {
                            if (data) {
                                self.DevelopePlanDetailOperationListView.file = data.data;
                            }
                            cb(null, 'OK')
                        })

                    }

                }, function(err, result) {
                    self.DevelopePlanDetailOperationListView.collection.url = '/admin/pm/talent_develope/plan/' + plan_id;
                    self.DevelopePlanDetailOperationListView.collection.fetch().done(function() {
                        self.DevelopePlanDetailOperationListView.render();
                        //把 a 换成 span， 避免点那个滑块的时候页面跳走。
                        $(".ui-flipswitch a").each(function() {
                            $(this).replaceWith("<span class='" + $(this).attr('class') + "'></span>");
                        })
                        $.mobile.loading("hide");


                    })
                })

            },
            course: function() {
                var self = this;
                self.courseSelectView.people = $("#login_people").val();
                $("body").pagecontainer("change", "#course_select", {
                    reverse: false,
                    changeHash: false,
                });
                self.cCollection.fetch().done(function() {
                    self.courseSelectView.render();

                });
                // self.courseSelectView.course = self.cCollection.models;
            }, //人才对比
            lambda_list: function() {
                var self = this;
                $("body").pagecontainer("change", "#talent_lambda_list", {
                    reverse: false,
                    changeHash: false,
                });
                $.mobile.loading("show");
                self.LambdaListView.pre_render();

                var people = $("#login_people").val();
                async.parallel({
                    talent: function(cb) {
                        self.c_talent.fetch().done(function() {
                            cb(null, self)
                        });
                    },
                    assessment: function(cb) {
                        self.c_assessment.fetch().done(function() {
                            cb(null, self)
                        });
                    },
                    competency: function(cb) {
                        $.get('/admin/pm/questionnair_template/querstionnar_template_for_talent_lambda', function(data) {
                            if (data.code == 'OK') {
                                self.LambdaListView.c_competency = data.data;
                                cb(null, self);
                            } else {
                                cb(null, null);
                            }
                        })
                    }
                }, function(err, data) {
                    self.LambdaListView.people = people;
                    self.LambdaListView.c_talent = self.c_talent;
                    // self.LambdaListView.c_competency = self.c_competency;
                    self.LambdaListView.c_assessment = self.c_assessment;
                    self.LambdaListView.render();
                    $.mobile.loading("hide");

                })

                // self.courseSelectView.course = self.cCollection.models;
            },
            init_views: function() {
                var self = this;
                self.DevelopePlanListView = new DevelopePlanListView({
                    el: "#talent_develope_list-content",
                    collection: self.dpCollection
                });
                self.SuperiorTwitterListView = new TalentWfSuperiorTwitterView({
                    el: "#personal_superior_twitter-content",
                    collection: self.stCollection
                });
                this.peopleSelectView = new TalentPeopleSelectView({
                    el: "#talent_people_select-content",
                    collection: self.c_people,
                });
                this.SuperiorTwitterFormView = new SuperiorTwitterFormView({
                    el: "#superior_twitter_form-content",
                    collection: self.stModel,
                });
                this.SuperiorTwitterForm2View = new SuperiorTwitterForm2View({
                    el: "#superior_twitter_form2-content",
                    collection: self.stModel,
                });
                this.DevelopePlanDetailListView = new DevelopePlanDetailListView({
                    el: "#talent_develope_detail-content",
                    collection: self.dpCollection,
                })
                this.DevelopePlanDetailOperationListView = new DevelopePlanDetailOperationListView({
                    el: "#talent_develope_detail_operation-content",
                    collection: self.dpCollection,
                })
                this.courseSelectView = new CourseView({
                    el: "#course_select-content",
                    collection: self.cCollection,
                });
                //人才对比
                this.LambdaListView = new LambdaListView({
                    el: "#talent_lambda_list-content",
                    collection: self.c_people

                })
            },
            init_models: function() {
                var self = this;
                self.dpModel = new DevelopePlanModel();
                self.ddModel = new DevelopeDirectModel();
                self.dtModel = new DevelopeTypeModel();
                self.dcModel = new DevelopeCheckModel();
                self.dlModel = new DevelopeLearnModel();
                self.stModel = new SuperiorTwitterModel();
                this.c_people = new PeopleCollection();
                this.cModel = new CourseModel();
                self.AssessmentModel = new AssessmentModel();
                self.TalentModel = new TalentModel();
                self.CompetencyModel = new CompetencyModel();

            },
            init_collections: function() {
                var self = this;
                self.dpCollection = new DevelopePlanCollection();
                self.ddCollection = new DevelopeDirectCollection();
                self.dtCollection = new DevelopeTypeCollection();
                self.dcCollection = new DevelopeCheckCollection(); //
                self.dlCollection = new DevelopeLearnCollection();
                self.stCollection = new SuperiorTwitterCollection();
                self.cCollection = new CourseCollection(); //课程
                self.c_talent = new TalentCollection(); //人才
                self.c_competency = new CompetencyCollection(); //能力素质
                self.c_assessment = new AssessmentCollection(); //绩效得分

            },
            init_data: function() { //初始化的时候，先从local storage里面恢复数据，如果localstorage里面没有，则去服务器fetch
                var self = this;
                self.load_data(self.c_people, 'people');
            },
            load_data: function(col_obj, col_name) { //加载数据
                $.mobile.loading("show");
                var login_people = $("#login_people").val();
                var cn = col_name
                var local_data = JSON.parse(LZString.decompressFromUTF16(localStorage.getItem(cn)) || null)
                    // var local_data = localStorage.getItem(cn);
                if (local_data) {
                    col_obj.reset(local_data);
                    col_obj.trigger('sync');
                    $.mobile.loading("hide");
                } else {
                    col_obj.fetch().done(function() {
                        localStorage.setItem(cn, LZString.compressToUTF16(JSON.stringify(col_obj)));
                        $.mobile.loading("hide");
                    })
                };
            },
        });

        return TalentRouter;
    })