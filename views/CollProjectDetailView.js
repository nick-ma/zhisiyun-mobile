// CollProject Detail View
// =================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "moment"

    ],
    function($, _, Backbone, Handlebars, moment) {

        // Extends Backbone.View
        var CollProjectDetailView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                this.template_basic = Handlebars.compile($("#hbtmp_coll_project_detail_view_basic").html());
                this.template_extend = Handlebars.compile($("#hbtmp_coll_project_detail_view_extend").html());
                this.template_contact = Handlebars.compile($("#hbtmp_coll_project_detail_view_contact").html());
                this.template_revise = Handlebars.compile($("#hbtmp_coll_project_detail_view_revise").html());
                this.template_attachment = Handlebars.compile($("#hbtmp_coll_project_detail_view_attachment").html());
                this.template_score = Handlebars.compile($("#hbtmp_coll_project_detail_view_score").html());
                this.template_colltask = Handlebars.compile($("#hbtmp_coll_project_detail_view_colltask").html());

                this.template_ct_text_view = Handlebars.compile($("#hbtmp_coll_project_cf_text_view").html());
                this.template_ct_color_view = Handlebars.compile($("#hbtmp_coll_project_cf_color_view").html());


                // The render method is called when CollProject Models are added to the Collection
                // this.collection.on("sync", this.render, this);
                this.color_map = ['#bbbbbb', '#44BBFF', '#A97FFF', "#FF8887", "#FFCF68", "#FFF86A", "#11D310", "#333333"];
                this.color_symble = {
                    'color_01': '&#9873;', // ⚑ flag
                    'color_02': '&#9733;', //★ star
                    'color_03': '&#9679;', //● circle
                    'color_04': '&#9650;', //▲ triangle
                };
                this.view_mode = 'basic'; //初始化为基本信息界面
                this.bind_event();
            },

            // Renders all of the CollProject models on the UI
            render: function() {

                var self = this;


                var render_data = self.model.toJSON();


                //查找子任务
                // render_data.sub_projects = _.map(_.filter(self.model.collection.models, function(x) {
                //     return x.get('p_project') == self.model.get('_id')
                // }), function(x) {
                //     return x.toJSON();
                // })
                render_data.login_people = $("#login_people").val();

                //设定返回按钮的地址

                $("#btn-collproject_detail-back").attr('href', '#projectlist');

                var rendered = '';
                if (self.view_mode == 'basic') {
                    rendered = self.template_basic(render_data)
                } else if (self.view_mode == 'extend') { //扩展信息
                    var cp_type = _.find(self.cp_types, function(x) {
                        return x._id == self.model.get('cp_type');
                    })
                    var rendered2 = [];
                    if (cp_type) {
                        _.each(cp_type.cp_type_fields, function(x) {
                            if (x != 'contacts') {
                                var fd = self.cpfd[x];
                                if (fd.cat == 'color') {
                                    var fc_rd = {
                                        field_name: x,
                                        field_value: self.model.get(x),
                                        color_map: self.color_map,
                                        color_symble: self.color_symble[x],
                                    }

                                    _.extend(fc_rd, fd);
                                    rendered2.push(self.template_ct_color_view(fc_rd));
                                } else {
                                    var fc_rd = {
                                        field_name: x,
                                        field_value: self.model.get(x),
                                    }
                                    if (fd.cat == 'date') {
                                        fc_rd.field_value = moment(fc_rd.field_value).format('YYYY-MM-DD');
                                    } else if (fd.cat == 'num') {
                                        fc_rd.field_value = fc_rd.field_value || 0;
                                    };
                                    _.extend(fc_rd, fd);
                                    // console.log(fc_rd);
                                    rendered2.push(self.template_ct_text_view(fc_rd));
                                };
                            };
                        })
                    };
                    // console.log(cp_type);
                    rendered = self.template_extend({
                        cf_contents: rendered2.join('')
                    });
                } else if (self.view_mode == 'contact') {
                    rendered = self.template_contact(render_data)
                } else if (self.view_mode == 'revise') {
                    //渲染更改记录部分
                    var rh_data = _.sortBy(_.map(_.groupBy(self.model.get('revise_history'), function(x) {
                            return moment(x.timestamp).format('YYYY-MM-DD HH:mm')
                        }), function(val, key) {
                            return {
                                ts: key,
                                msgs: val
                            }
                        }), function(x) {
                            return -new Date(x.ts)
                        })
                        // console.log(rh_data);
                        // $("#coll_project_revise").html(self.template_revise({
                        //     revise_history: rh_data
                        // }))
                    rendered = self.template_revise({
                        revise_history: rh_data
                    })
                } else if (self.view_mode == 'attachment') {
                    rendered = self.template_attachment(render_data)
                } else if (self.view_mode == 'score') {
                    rendered = self.template_score(render_data)
                } else if (self.view_mode == 'colltasks') { //任务清单
                    // 获取任务
                    $.get('/admin/pm/coll_task/get_by_cp/' + self.model.get('_id'), function(data) {
                        rendered = self.template_colltask({
                            coll_tasks: data
                        })
                        $("#collproject_detail-content").html(rendered);
                        $("#collproject_detail-content").trigger('create');
                    })
                };
                $("#collproject_detail-content").html(rendered);
                $("#collproject_detail-content").trigger('create');
                //确定权限
                var login_people = $("#login_people").val();
                var rights = [0, 0, 0, 0, 0, 0, 0];
                // if (login_people == self.model.attributes.creator._id) { //创建人
                //     rights = [0, 0, 0, 0, 0, 0, 0];
                // } else 
                if (login_people == self.model.attributes.pm._id) { //负责人
                    rights = [1, 1, 1, 1, 1, 1, 1];
                } else if (self.test_in('_id', login_people, self.model.attributes.pms)) { //参与人
                    rights = [1, 0, 0, 0, 0, 0, 0];
                } else if (self.test_in('_id', login_people, self.model.attributes.npms)) { //观察员
                    rights = [0, 0, 0, 0, 0, 0, 0];
                };
                var state_rights = [0, 0, 0, 0, 0, 0, 0];
                if (self.model.get('status') == 'O') {
                    state_rights = [1, 1, 1, 1, 1, 1, 1];
                } else if (self.model.get('status') == 'C') {
                    state_rights = [0, 0, 0, 1, 0, 0, 0];

                };
                var btns = ['#btn-cp-add_coll_task', '#btn-collproject_detail-edit', '#btn-collproject_detail-remove', '#btn-collproject_detail-complete',
                    '#btn_collproject_detail_add_contact', '.btn_collproject_detail_edit_contact', '.btn_collproject_detail_remove_contact'
                ];
                for (var i = 0; i < rights.length; i++) {
                    if (rights[i] && state_rights[i]) {
                        $(btns[i]).removeAttr('disabled')
                    } else {
                        $(btns[i]).attr('disabled', true)
                    };
                    // if (rights[i] == 0) {
                    //     $(btns[i]).attr('disabled', true)
                    // } else {
                    //     $(btns[i]).removeAttr('disabled')
                    // };
                };
                // 设定完成按钮的文字
                if (self.model.get('status') == 'C') {
                    $("#btn-collproject_detail-complete").html('打开');
                } else {
                    $("#btn-collproject_detail-complete").html('完成');
                };
                // 设定人员信息卡的返回地址
                localStorage.setItem('contact_detail_back_url', '#collproject_detail/' + self.model.get('_id'));
                return this;

            },
            bind_event: function() {
                var self = this;
                $("#collproject_detail-content")
                    .on('click', '.btn_collproject_detail_remove_contact', function(event) {
                        event.preventDefault();
                        if (self.model && confirm('确实要删除联系人吗？')) {
                            var $this = $(this);
                            var index = $this.data('index');
                            var contacts = self.model.get('contacts');
                            contacts.splice(index, 1);
                            self.model.set('contacts', contacts);
                            self.model.save().done(function() {
                                self.render()
                            })
                        };
                    })
                    .on('click', '#btn_collproject_detail_add_contact', function(event) {
                        event.preventDefault();
                        if (self.model) {
                            var new_contact = {
                                name: '新联系人',
                                role: '无',
                                company: '',
                                position: '',
                                tel: '',
                                cell: '',
                                email: '',
                                comment: '',
                            };
                            var contacts = self.model.get('contacts');
                            contacts.push(new_contact);
                            self.model.set('contacts', contacts);
                            self.model.save().done(function() {
                                var url = "#collproject_edit/" + self.model.get('_id') + "/contact/" + (contacts.length - 1);
                                window.location.href = url;
                            })
                        };
                    })
                    .on('click', '.btn_collproject_detail_edit_contact', function(event) {
                        event.preventDefault();
                        var $this = $(this);
                        var index = $this.data('index');
                        var url = "#collproject_edit/" + self.model.get('_id') + "/contact/" + index;
                        window.location.href = url;
                    })
                    .on('change', 'input', function(event) { //打分
                        event.preventDefault();
                        var $this = $(this);
                        var field = $this.data('field');
                        var index = $this.data('index');
                        var value = $this.val();
                        var ff = (field) ? field.split('.') : [];
                        if (ff.length == 2) { //打分的输入框
                            $.mobile.loading("show");
                            if (index >= 0) {
                                self.model.attributes[ff[0]][ff[1]][index] = value;
                            } else {
                                self.model.attributes[ff[0]][ff[1]] = value;
                            };
                            self.model.save().done(function() {
                                self.model.fetch().done(function() {
                                    self.render();
                                    $.mobile.loading("hide");
                                })
                            })
                        };

                    });



                $("#collproject_detail-footer")
                    .on('click', '#btn-collproject_detail-remove', function(event) {
                        event.preventDefault();
                        if (confirm('确认删除本项目吗？')) { //确认是否删除
                            var coll = self.model.collection;
                            coll.remove(self.model);
                            coll.trigger('sync');

                            self.model.destroy().done(function() {
                                alert('项目删除成功');
                                window.location.href = '#projectlist';

                            })
                        };
                    })
                    .on('click', '#btn-collproject_detail-complete', function(event) {
                        event.preventDefault();
                        var x = self.model.get('status');
                        if (x == 'O') { //准备关闭项目，提示打分
                            var pm_score = prompt('请为本项目评分', 90);
                            if (pm_score) {
                                self.model.attributes.scores.pm = pm_score;
                                self.model.set('status', 'C');
                                self.model.save().done(function() {
                                    self.model.fetch().done(function() {
                                        alert('项目已标记为完成');
                                        window.location.href = '#projectlist';
                                    })
                                })
                            } else {
                                alert('请评分')
                            };
                        } else {
                            self.model.set('status', 'O');
                            self.model.save().done(function() {

                                alert('项目已重新打开');
                                self.render();

                            })
                        };

                    })
                    .on('click', '#btn-collproject_detail-edit', function(event) {
                        event.preventDefault();
                        var url = '#collproject_edit/' + self.model.get('_id') + '/';
                        if (self.view_mode == 'extend') {
                            url += 'extend';
                        } else {
                            url += 'basic';
                        };
                        window.location.href = url;
                    })
                $("#collproject_detail-left-panel")
                    .on('click', '#btn-collproject_detail-change_view', function(event) {
                        event.preventDefault();
                        var $this = $(this)
                        self.view_mode = $this.data('view_mode');
                        self.render();
                        $("#collproject_detail-left-panel").panel('close');
                    })

                $("#collproject_detail")
                    .on('swiperight', function(event) { //向右滑动，打开左边的面板
                        event.preventDefault();
                        $("#collproject_detail-left-panel").panel('open');
                        // window.location.href = '#collproject'
                    })
            },
            test_in: function(key, val, coll) {
                var flag = false;
                for (var i = 0; i < coll.length; i++) {
                    flag = coll[i][key] == val;
                    if (flag) {
                        break;
                    }
                };
                return flag;
            }
        });

        // Returns the View class
        return CollProjectDetailView;

    });