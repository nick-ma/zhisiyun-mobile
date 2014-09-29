// Contact Detail View
// ===================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars"],
    function($, _, Backbone, Handlebars) {
        var pri_state = null;

        function get_data(id, talent) {
            var found = _.find(talent, function(temp) {
                return temp._id == String(id)
            })
            return found;
        }
        // Extends Backbone.View
        var DevelopePlanDetailListView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                this.template = Handlebars.compile($("#hbtmp_talent_develope_detail_list_view").html());
                // The render method is called when People Models are added to the Collection
                this.loading_template = Handlebars.compile($("#loading_template_view").html());

                // this.collection.on("sync", this.render, this);
                this.bind_event();
            },
            pre_render: function() {
                var self = this;
                $("#talent_develope_detail-content").html(self.loading_template({
                    info_msg: '数据加载中...请稍候'
                }));
                $("#talent_develope_detail-content").trigger('create');
                return this;
            },
            // Renders all of the People models on the UI
            render: function() {

                var self = this;
                var talent_data = _.map(self.collection.models, function(x) {
                    var find_people = _.find(self.c_people.models, function(temp) {
                        return temp.attributes._id == String(x.attributes.people)
                    })
                    var find_direct = _.find(self.direct, function(temp) {
                        return temp.attributes._id == String(x.attributes.develope_direct)
                    })

                    x.attributes.people_data = find_people.attributes;
                    x.attributes.direct = find_direct.attributes;
                    return x.toJSON();
                })
                var direct = _.map(self.direct, function(temp) {
                    return temp.attributes
                })
                var type = _.map(self.type, function(temp) {
                    return temp.attributes
                })
                var check = _.map(self.check, function(temp) {
                    return temp.attributes
                })
                var learn = _.map(self.learn, function(temp) {
                    return temp.attributes
                })
                var obj = {
                    talent_data: talent_data[0],
                    status: self.status_data[String(self.people)],
                    direct: direct,
                    type: type,
                    check: check,
                    learn: learn
                }
                //@detect the login identifier
                //个人权限和上级权限
                var per_pri = {};
                per_pri[talent_data[0].people_data._id] = 'p';
                var superior_pri = {};
                superior_pri[talent_data[0].people_data.superiors] = 's';
                superior_pri[talent_data[0].people_data.ind_superiors] = 's';
                var login_people = $("#login_people").val();
                if (per_pri[login_people] || superior_pri[login_people]) {
                    pri_state = per_pri[login_people] || superior_pri[login_people];
                }
                obj.pri_state = pri_state;
                                console.log(obj)

                $("#talent_develope_detail-content").html(self.template(obj));
                $("#talent_develope_detail-content").trigger('create');

                return this;

            },

            bind_event: function() {
                var self = this;
                var change = 1;

                $("#talent_develope_detail_list").on('click', "#btn_go_back", function(event) {
                    event.preventDefault();
                    window.location.href = "#plan_list";
                }).on('vmousemove', 'img', function(event) {
                    event.preventDefault();
                    var img_view = '<img src="' + this.src + '">';
                    $("#fullscreen-overlay").html(img_view).fadeIn('fast');
                }).on('change', '.chzn-select', function(event) {
                    event.preventDefault();
                    var up_id = $(this).data("up_id");
                    // var plans = plan.models[0].get("plan_divide");
                    var plans = self.collection.models[0].attributes.plan_divide;
                    var plan_id = self.collection.models[0].attributes._id;
                    var found = get_data(up_id, plans)
                    var field1 = $(this).data("field1")
                    var field2 = $(this).data("field2")
                    var _id = String($(this).val()).split(',')[0];
                    var name = String($(this).val()).split(',')[1]
                    if (found) {
                        found[field1] = _id;
                        found[field2] = name;
                        self.collection.models[0].save(self.collection.models[0].attributes, {
                            success: function(model, response, options) {
                                self.collection.url = '/admin/pm/talent_develope/plan/' + plan_id;
                                self.collection.fetch();
                                // plan.trigger('sync')
                                self.render();
                            },
                            error: function(model, xhr, options) {}
                        });
                        //通过Tag标签来控制与候选人培养计划的消息发送,共用一个接口
                        if (change == 1) {
                            var require_data = [];
                            var temp_data = self.collection.models[0].attributes;
                            require_data.push({
                                'plan_name': temp_data.plan_name,
                                'develope_direct': temp_data.develope_direct,
                                'people': temp_data.people,
                                'people_no': temp_data.people_no,
                                'people_name': temp_data.people_name,
                                'period_start': temp_data.period_start,
                                'period_end': temp_data.period_end,
                                'des_career': temp_data.des_career,
                                'des_career_name': temp_data.des_career_name,
                                'des_position': temp_data.des_position,
                                'des_position_name': temp_data.des_position_name,
                            });
                            var post_data = 'require_data=' + JSON.stringify(require_data);
                            post_data += '&tag=change';
                            if (post_data) {
                                $.post('/admin/pm/talent_develope/email_send', post_data)
                            }
                            change++;
                        }


                    }

                })

            }

        });

        // Returns the View class
        return DevelopePlanDetailListView;

    });