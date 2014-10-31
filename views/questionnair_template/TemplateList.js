// ToDo View
// =============

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "async"], function($, _, Backbone, Handlebars, async) {
    Handlebars.registerHelper('is_G', function(data, options) {
        if (data != 'G') {
            return options.fn(this);
        } else {
            return options.inverse(this);
        };
    });
    Handlebars.registerHelper('qtis_num', function(data) {
        return data.length
    });
    Handlebars.registerHelper("addOne", function(index) {
        //利用+1的时机，在父级循环对象中添加一个_index属性，用来保存父级每次循环的索引
        this._index = index;
        //返回+1之后的结果
        return this._index;
    });
    var category_enum = ['', '满意度调查问卷', '选项统计问卷', '测验问卷', '满意度调查问卷(外部用户)', '选项统计问卷(外部用户)', '投票问卷'];
    Handlebars.registerHelper('Category', function(category) {
        return category_enum[category];
    });


    //1:人员 频次 look type
    Handlebars.registerHelper('eq_people', function(data, data1, options) {
        var login_people = $('#login_people').val();

        if (data1 == 'J') {

            if (data == login_people) {
                return options.fn(this);
            } else {
                return options.inverse(this);
            }
        } else if (data1 == 'F') {
            if (data == login_people) {
                return options.fn(this);
            } else {
                return options.inverse(this);
            }


        } else if (data1 == 'S') {
            if (data == login_people && data1 == 0) {
                return options.fn(this);
            } else {
                return options.inverse(this);
            }


        };
    });

    function sort_items(items) {
        var sorts = _.sortBy(items, function(qt) {
            return qt.createDate
        })
        return sorts.reverse();
    }


    var Quesetionnaire_TemplateView = Backbone.View.extend({
        // The View Constructor
        initialize: function() {
            this.quesetionnaire_template = Handlebars.compile($("#quesetionnaire_template_list_view").html());
            this.quesetionnaire_template_join = Handlebars.compile($("#quesetionnaire_template_list_join_view").html());
            this.quesetionnaire_template_on = Handlebars.compile($("#quesetionnaire_template_list_on_view").html());

            this.loading_template = Handlebars.compile($("#loading_template_view").html());
            this.collection.on("sync", this.render, this);
            this.model_view = '0';
            this.qtis = [];
            this.bind_event();
        },
        pre_render: function() {
            var self = this;
            $("#quesetionnaire_template_list-content").html(self.loading_template({
                info_msg: '数据加载中...请稍候'
            }));
            $("#quesetionnaire_template_list-content").trigger('create');
            return this;
        },
        // Renders all of the Task models on the UI
        render: function() {
            var self = this;
            var rendered_data = '';
            if (self.model_view == '0') {
                var filters = _.filter(self.collection.toJSON(), function(qt) {
                    return self.collection.people == qt.creator && qt.frequency_of_usage > 0 && qt.questionnair_category == '6'
                })
                rendered_data = self.quesetionnaire_template({
                    qts: sort_items(filters)
                });

            } else if (self.model_view == '1') {
                var filters = _.filter(self.collection.toJSON(), function(qt) {
                    var f_d = _.find(self.qtis, function(q) {
                        return q.qtc == qt._id
                    })
                    return f_d && qt.questionnair_category == '6'
                })
                rendered_data = self.quesetionnaire_template_join({
                    qts: sort_items(filters)
                });

            } else if (self.model_view == '2') {

                var filters = _.filter(self.collection.toJSON(), function(st) {
                    return self.collection.people == st.creator && st.questionnair_category == '6' && st.frequency_of_usage == 0
                })
                rendered_data = self.quesetionnaire_template_on({
                    qts: sort_items(filters)
                });
            }

            $("#quesetionnaire_template_list-content").html(rendered_data);
            $("#quesetionnaire_template_list-content").trigger('create');
            return self;
        },
        bind_event: function() {
            var self = this
            $("#quesetionnaire_template_list").on('click', '#btn-quesetionnaire_template_create', function(event) {
                event.preventDefault();
                var new_qt = {
                    qt_name: '新建的投票问卷' + (self.collection.length + 1),
                    qt_description: '',
                    questionnair_category: '6',
                    vote_items: [{
                        qti_name: '新建题目',
                        qti_options: [],
                    }],
                };
                $.mobile.loading("show");
                var qt = self.collection.add(new_qt);
                qt.url = '/admin/pm/questionnair_template/common_bb/' + null
                qt.save(qt.attributes, {
                    success: function(model, response, options) {
                        var url = "#quesetionnair_template/" + model.get("_id");
                        $.mobile.loading("hide");
                        window.location.href = url;

                    }
                })
            }).on('click', '.open-left-panel', function(event) {
                event.preventDefault();
                $("#quesetionnaire_template-left-panel").panel("open");
            }).on('swiperight', function(event) { //向右滑动，打开左边的面板
                event.preventDefault();
                $("#quesetionnaire_template-left-panel").panel("open");
            }).on('click', '#btn-im_showh-change_view', function(event) {
                event.preventDefault();
                window.location.href = '#im_list'
                $("#quesetionnaire_template-left-panel").panel("close");
            }).on('click', '#btn-moblie_resource-change_view', function(event) {
                event.preventDefault();
                window.location.href = '#mobile_resource'
                $("#quesetionnaire_template-left-panel").panel("close");
            }).on('click', '#btn-quesetionnair_template-change_view', function(event) {
                event.preventDefault();
                window.location.href = '#quesetionnair_template'
                $("#quesetionnaire_template-left-panel").panel("close");
            }).on('click', '#my_issued', function(event) { //我发起的
                event.preventDefault();
                self.model_view = '0';
                self.render();

            }).on('click', '#my_part', function(event) { //我参与的
                event.preventDefault();
                $.get('/admin/pm/questionnair_template/querstionnar_instance_by_people', function(data) {
                    self.qtis = data
                    self.model_view = '1';
                    self.render();
                })

            }).on('click', '#on_issued', function(event) { //未发布的
                event.preventDefault();
                self.model_view = '2';
                self.render();
            }).on('click', '.btn_edit,.btn_issue', function(event) {
                event.preventDefault();
                window.location.href = $(this).attr('href');

            }).on('click', '.btn_delete', function(event) {
                event.preventDefault();
                var qt_id = $(this).data('qt_id');
                var qti = self.collection.get(qt_id);
                if (confirm('确定删除吗 ？')) {
                    $.mobile.loading("show");
                    qti.url = "/admin/pm/questionnair_template/common_bb/" + qt_id
                    qti.destroy({
                        success: function() {
                            $.mobile.loading("hide");
                            alert('删除成功!')
                            self.collection.fetch().done(function() {
                                self.render();
                            })

                        }
                    });
                }
            }).on('click', '.btn_clone', function(event) {
                event.preventDefault();
                var qt_id = $(this).data('qt_id');
                var qti = self.collection.get(qt_id).clone();
                qti.set('qt_name', qti.get('qt_name') + '-克隆的副本');
                qti.set('createDate', moment());
                qti.set('frequency_of_usage', 0);
                delete qti.id;
                delete qti.attributes._id;
                if (confirm('确定克隆吗 ？')) {
                    $.mobile.loading("show");
                    qti.save(qti.attributes, {
                        success: function(model, response, options) {
                            $.mobile.loading("hide");
                            alert('克隆成功!');
                            self.collection.fetch().done(function() {
                                self.render();
                            })
                        }
                    })

                }
            }).on('click', '.btn_result', function(event) {
                event.preventDefault();
                var qt_id = $(this).data('qt_id');
                var qt_type = $(this).data('qt_type');
                window.location.href = '#quesetionnair_template_result/' + qt_id + '/' + qt_type + '/X'
            })
        },

    });

    // Returns the View class
    return Quesetionnaire_TemplateView;

});