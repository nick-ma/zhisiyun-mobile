// ToDo View
// =============

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "async"], function($, _, Backbone, Handlebars, async) {
    function save_data(self) {
        self.model.save(self.model.attributes).done(function(data) {
            self.model.fetch().done(function() {
                self.render();

            })
        })
    }

    var Quesetionnaire_Template_IssueView = Backbone.View.extend({
        // The View Constructor
        initialize: function() {
            this.quesetionnaire_template_issue = Handlebars.compile($("#quesetionnaire_template_issue_view").html());
            this.loading_template = Handlebars.compile($("#loading_template_view").html());
            this.bind_event();
        },
        pre_render: function() {
            var self = this;
            $("#quesetionnaire_template_issue_list-content").html(self.loading_template({
                info_msg: '数据加载中...请稍候'
            }));
            $("#quesetionnaire_template_issue_list-content").trigger('create');
            return this;
        },
        // Renders all of the Task models on the UI
        render: function() {
            var self = this;


            rendered_data = self.quesetionnaire_template_issue(self.model.attributes);

            $("#quesetionnaire_template_issue_list-content").html(rendered_data);
            $("#quesetionnaire_template_issue_list-content").trigger('create');
            return self;
        },
        bind_event: function() {
            var self = this
            var bool = true;
            $("#quesetionnaire_template_issue_list").on('click', '.add_qti', function(event) {
                event.preventDefault();
                var item = {};
                var num = parseInt(self.model.attributes.option_items.length) + 1
                item.qti_name = '新建题目' + num;
                self.model.attributes.option_items.push(item);
                save_data(self)
            }).on('click', "#btn_save", function(event) {
                event.preventDefault();
                var radio_all = $('#quesetionnaire_eg_list-content').find('input[type=radio]').length;
                var radio_chk = $('#quesetionnaire_eg_list-content').find('input[type=radio]:checked').length;
                if (radio_all / radio_chk != 2) {
                    alert("请答完题目再提交!");
                    return false;
                } else {
                    self.model.save(self.model.attributes).done(function(data) {
                        self.model.fetch().done(function() {
                            self.render();

                        })
                    })
                }
            }).on('click', ".btn_remove_qti", function(event) {
                event.preventDefault();
                $this = $(this);
                event.preventDefault();
                var qti_id = $this.data('qti_id')
                self.model.attributes.option_items = _.filter(self.model.get('option_items'), function(op) {
                    return op._id != qti_id
                })
                save_data(self)
            }).on('click', '.btn_add_option', function(event) {
                event.preventDefault();
                var qti_id = $(this).data('qti_id')
                var f_qti = _.find(self.model.get('option_items'), function(op) {
                    return op._id == qti_id
                })
                var option = {};
                var num = parseInt(f_qti.qti_options.length) + 1
                option.option = '选项' + num;
                option.option_description = '';
                f_qti.qti_options.push(option);
                save_data(self);
            }).on('click', '.btn_remove_option', function(event) {
                event.preventDefault();
                var qti_id = $(this).data('qti_id');
                var option_id = $(this).data('option_id');
                var f_qti = _.find(self.model.get('option_items'), function(op) {
                    return op._id == qti_id
                })
                f_qti.qti_options = _.filter(f_qti.qti_options, function(qt) {
                    return qt._id != option_id
                })
                save_data(self);

            }).on('change', "input[type='text']", function(event) {
                event.preventDefault();
                var qt_id = $(this).data('qt_id');
                var qti_id = $(this).data('qti_id');
                var option_id = $(this).data('option_id');
                if (!_.isUndefined(option_id)) {
                    var f_qti = _.find(self.model.get('option_items'), function(op) {
                        return op._id == qti_id
                    })
                    f_op = _.find(f_qti.qti_options, function(qt) {
                        return qt._id == option_id
                    })
                    f_op.option = $(this).val()
                } else if (!_.isUndefined(qt_id)) {
                    self.model.set('qt_name', $(this).val())
                } else {
                    var f_qti = _.find(self.model.get('option_items'), function(op) {
                        return op._id == qti_id
                    })
                    f_qti.qti_name = $(this).val()
                }

            }).on('change', 'textarea', function(event) {
                event.preventDefault();
                var qt_id = $(this).data('qt_id');
                var qti_id = $(this).data('qti_id');
                var option_id = $(this).data('option_id');
                // if (!_.isUndefined(qt_id)) {
                self.model.set('qt_description', $(this).val())
                // } else {
                //     var f_qti = _.find(self.model.get('option_items'), function(op) {
                //         return op._id == qti_id
                //     })
                //     f_op = _.find(f_qti.qti_options, function(qt) {
                //         return qt._id == option_id
                //     })
                //     f_op.option_description = $(this).val()
                // }
            }).on('click', '#btn-save', function(event) {
                event.preventDefault();
                var $this = $(this);
                $.mobile.loading("show");
                $this.attr('disabled', true);
                self.model.save(self.model.attributes, {
                    success: function(model, response, options) {
                        self.model.fetch().done(function() {
                            $.mobile.loading("hide");
                            self.render();
                            alert('问卷制作保存成功!')
                            $this.removeAttr('disabled')
                        })
                    },
                    error: function(model, xhr, options) {
                        $.mobile.loading("hide");
                        alert('问卷制作保存失败!')
                        self.render();
                        $this.removeaAttr('disabled')
                    }
                })
            }).on('change', 'select', function(event) {
                event.preventDefault();
                var qti_id = $(this).data('qti_id');
                var field = $(this).data('field');
                if (!_.isUndefined(qti_id)) {
                    var f_qti = _.find(self.model.get('option_items'), function(op) {
                        return op._id == qti_id
                    })
                    f_qti.qti_type = ($(this).val() == 'false' ? '1' : '2')
                } else {
                    self.model.set(field, $(this).val() == 'false' ? false : true)
                }
                $(".ui-flipswitch a").each(function() {
                    $(this).replaceWith("<span class='" + $(this).attr('class') + "'></span>");
                });

            })



        },

    });

    // Returns the View class
    return Quesetionnaire_Template_IssueView;

});