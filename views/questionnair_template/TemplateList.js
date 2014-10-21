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
    var category_enum = ['', '满意度调查问卷', '选项统计问卷', '测验问卷', '满意度调查问卷(外部用户)', '选项统计问卷(外部用户)'];
    Handlebars.registerHelper('Category', function(category) {
        return category_enum[category];
    });
    var Quesetionnaire_TemplateView = Backbone.View.extend({
        // The View Constructor
        initialize: function() {
            this.quesetionnaire_template = Handlebars.compile($("#quesetionnaire_template_list_view").html());
            this.loading_template = Handlebars.compile($("#loading_template_view").html());
            this.bind_event();
        },
        pre_render: function() {
            var self = this;
            $("#quesetionnaire_list-content").html(self.loading_template({
                info_msg: '数据加载中...请稍候'
            }));
            $("#quesetionnaire_list-content").trigger('create');
            return this;
        },
        // Renders all of the Task models on the UI
        render: function() {
            var self = this;
            var rendered_data = '';
            var sorts = _.sortBy(self.collection.toJSON(), function(qt) {
                return qt.createDate
            })
            var filters = _.filter(sorts, function(st) {
                return st.questionnair_category == '2'
            })
            rendered_data = self.quesetionnaire_template({
                qts: filters.reverse()
            });
            $("#quesetionnaire_template_list-content").html(rendered_data);
            $("#quesetionnaire_template_list-content").trigger('create');
            return self;
        },
        bind_event: function() {
            var self = this
            $("#quesetionnaire_template_list").on('click', '#btn-quesetionnaire_template_create', function(event) {
                event.preventDefault();
                var new_qt = {
                    qt_name: '新建的选项统计问卷' + (self.collection.length + 1),
                    questionnair_category: '2',
                };
                var qt = self.collection.add(new_qt);
                qt.url = '/admin/pm/questionnair_template/common_bb/' + null
                qt.save(qt.attributes, {
                    success: function(model, response, options) {
                        var url = "#quesetionnair_template/" + model.get("_id");
                        window.location.href = url;
                    }
                })
            })
        },

    });

    // Returns the View class
    return Quesetionnaire_TemplateView;

});