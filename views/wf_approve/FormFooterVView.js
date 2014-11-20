// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "moment"],
    function($, _, Backbone, Handlebars, moment) {
        function validate_form_data() {
            var ret = {
                pass: true,
                errs: []
            };
            _.each(pi.attributes.customize_fields,
                function(x) {
                    //检查必输项
                    if (x.require) { //设定为必输的
                        if (!x.data || (_.isArray(x.data) && !x.data.length)) {
                            ret.pass = false;
                            ret.errs.push('[' + x.title + ']不能为空');
                        };
                    };
                    // 检查数据类型
                    if (x.cat == 'num') {
                        var regexp_num = /^(-)?[0-9\.]*$/;
                        if (!regexp_num.test(x.data)) {
                            ret.pass = false;
                            ret.errs.push('[' + x.title + ']不是有效的数字');
                        };
                    } else if (x.cat == 'date') {

                    };
                })
            return ret;
        }

        function render_confirm_trans(render_data) { //渲染流程条的界面
            $("#confirm_trans").html(tmp_confirm_trans(render_data));
            $("#confirm_trans").trigger('create');
            $("#form_header").hide();
            $("#form_body").hide();
            $("#form_footer").hide();
            $("#confirm_trans").show();
        }

        // Handlebars.registerHelper('genTransButtons', function(tts) {
        //     var tmp_btn = '<button class="ui-btn btn_do_trans btn %s" data-target="%s", data-direction="%s", data-trans_name="%s"><i class="%s"></i>  %s</button>';
        //     var ret = [];
        //     _.each(tts, function(x) {
        //         var btn_class = (x.direction == 'F') ? 'btn-success' : 'btn-danger';
        //         var btn = sprintf(tmp_btn, btn_class, x.target._id, x.direction, x.name, x.icon, x.name);
        //         if (x.restrict == '') {
        //             ret.push(btn);
        //         } else if (x.restrict == '1' && supreme_leader) { //最高领导＋最高领导专用
        //             ret.push(btn);
        //         } else if (x.restrict == '2' && !supreme_leader) { //不是最高领导＋除最高领导外使用
        //             ret.push(btn);
        //         };
        //     })
        //     return ret.join('');
        // });
        Handlebars.registerHelper('getCCUsers', function(cc_users) {
            var ret_users = [];
            if (_.isArray(cc_users)) {
                _.each(cc_users, function(x) {
                    var found = _.find(users_data, function(y) {
                        return y.user == x
                    });
                    if (found) {
                        ret_users.push(found.people_name + '/' + found.position_name);
                    };
                })

            };
            return ret_users.join('; ');
        });

        var supreme_leader;
        var pi;
        var ti;
        var pd;
        var tmp_confirm_trans;
        var users_data;
        // Extends Backbone.View
        var View = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                this.el = '#form_footer';
                this.template = Handlebars.compile($("#tmp_form_footer").html());
                this.template2 = Handlebars.compile($("#ref_pis_select_view").html());
                this.template3 = Handlebars.compile($("#tmp_cc_users_view").html());
                this.template4 = Handlebars.compile($("#tmp_next_user_view").html());
                tmp_confirm_trans = Handlebars.compile($("#tmp_confirm_trans").html());
                this.view_mode = '1';
                this.bind_event();
            },

            // Renders all of the WFApprove models on the UI
            render: function() {
                var self = this;
                if (self.view_mode == '1') {
                    $("body").pagecontainer("change", "#wf_my_workflow_form", {
                        reverse: false,
                        changeHash: false,
                    });

                    pi = self.pi;
                    ti = self.ti;
                    pd = self.pd;
                    users_data = self.users;
                    var render_data = {
                        mode: 'view',
                        pi: self.pi.toJSON(),
                        ti: self.ti,
                        pd: self.pd,
                        td: self.td,
                        tts: _.sortBy(self.tts, function(x) { //排个序，把提交的放在前面，驳回的操作放在后面
                            return -x.direction;
                        }),
                        history_tasks: self.history_tasks,
                        flowchart_data: self.flowchart_data,
                        ctd: self.ctd,
                        attachments: self.attachments,
                    };

                    // console.log(render_data);
                    $("#form_footer").html(self.template(render_data));
                } else if (self.view_mode == '2') {
                    $("body").pagecontainer("change", "#ref_pis_select", {
                        reverse: false,
                        changeHash: false,
                    });

                    var render_data = {
                        ref_pis: self.ref_pis,
                    }

                    $("#ref_pis_select-content").html(self.template2(render_data));
                    $("#ref_pis_select-content").trigger('create');
                } else if (self.view_mode == '3') {
                    $("body").pagecontainer("change", "#cc_users_select", {
                        reverse: false,
                        changeHash: false,
                    });

                    var render_data = {
                        people: self.users,
                    }

                    $("#cc_users_select-content").html(self.template3(render_data));
                    $("#cc_users_select-content").trigger('create');
                } else {
                    $("body").pagecontainer("change", "#next_user_select", {
                        reverse: false,
                        changeHash: false,
                    });

                    var render_data = {
                        people: self.users,
                    }

                    $("#next_user_select-content").html(self.template4(render_data));
                    $("#next_user_select-content").trigger('create');
                }
                return this;
            },
            bind_event: function() {
                var self = this;
                $('#form_footer')
                    .on('click', '.btn_view_ref_pi', function(event) {
                        event.preventDefault();
                        var $this = $(this);
                        var pi_id = $this.data('pi_id');
                        // console.log(pi_id);
                        $.get('/admin/wf/universal/ref_pi_url?pi_id=' + pi_id, function(url) {
                            if (url) {
                                window.open(url);
                            };
                        })
                    })
            }

        });

        // Returns the View class
        return View;

    });