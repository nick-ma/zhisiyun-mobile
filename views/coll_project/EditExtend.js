// CollProject Edit View - Basic
// ==============================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars"],
    function($, _, Backbone, Handlebars) {

        // Extends Backbone.View
        var CollProjectEditExtendView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                var self = this;
                this.template = Handlebars.compile($("#hbtmp_coll_project_edit_extend_view").html());
                this.template_cf_str_input = Handlebars.compile($("#hbtmp_coll_project_cf_str_input").html());
                this.template_cf_str_textarea = Handlebars.compile($("#hbtmp_coll_project_cf_str_textarea").html());
                this.template_cf_str_select = Handlebars.compile($("#hbtmp_coll_project_cf_str_select").html());
                this.template_cf_str_select_m = Handlebars.compile($("#hbtmp_coll_project_cf_str_select_m").html());
                this.template_cf_date = Handlebars.compile($("#hbtmp_coll_project_cf_date").html());
                this.template_cf_color = Handlebars.compile($("#hbtmp_coll_project_cf_color").html());

                this.color_map = ['#bbbbbb', '#44BBFF', '#A97FFF', "#FF8887", "#FFCF68", "#FFF86A", "#11D310", "#333333"];
                this.color_symble = {
                    'color_01': '&#9873;', // ⚑ flag
                    'color_02': '&#9733;', //★ star
                    'color_03': '&#9679;', //● circle
                    'color_04': '&#9650;', //▲ triangle
                };
                // The render method is called when CollProject Models are added to the Collection
                // this.collection.on("sync", this.render, this);
                // bind event
                this.bind_event();
            },

            // Renders all of the CollProject models on the UI
            render: function() {

                var self = this;

                // $("#btn-collproject_edit-back").attr('href', "#collproject/" + self.ct_id + "/" + self.model.get('_id'));
                var render_data;

                var cp_type = _.find(self.cp_types, function(x) {
                    return x._id == self.model.get('cp_type');
                })
                var rendered = [];
                if (cp_type) {
                    _.each(cp_type.cp_type_fields, function(x) {
                        if (x != 'contacts') {
                            var fd = self.cpfd[x];
                            if (fd.cat == 'str') {
                                var fc_rd = {
                                    field_name: x,
                                    field_value: self.model.get(x),
                                }
                                _.extend(fc_rd, fd);
                                if (fd.ctype == 'input') {
                                    rendered.push(self.template_cf_str_input(fc_rd));
                                } else if (fd.ctype == 'textarea') {
                                    rendered.push(self.template_cf_str_textarea(fc_rd));
                                } else if (fd.ctype == 'select') {
                                    rendered.push(self.template_cf_str_select(fc_rd));
                                } else if (fd.ctype == 'select_m') {
                                    rendered.push(self.template_cf_str_select_m(fc_rd));
                                };
                            } else if (fd.cat == 'num') {
                                var fc_rd = {
                                    field_name: x,
                                    field_value: self.model.get(x),
                                }
                                _.extend(fc_rd, fd);
                                rendered.push(self.template_cf_str_input(fc_rd));
                            } else if (fd.cat == 'date') {
                                var fc_rd = {
                                    field_name: x,
                                    field_value: self.model.get(x),
                                }
                                _.extend(fc_rd, fd);
                                rendered.push(self.template_cf_date(fc_rd));
                            } else if (fd.cat == 'color') {
                                var fc_rd = {
                                    field_name: x,
                                    field_value: self.model.get(x),
                                    color_map: self.color_map,
                                    color_symble: self.color_symble[x],
                                }

                                _.extend(fc_rd, fd);
                                rendered.push(self.template_cf_color(fc_rd));
                            };

                        };
                    })
                };


                $("#btn-collproject_edit_extend-back").attr('href', "#collproject_detail/" + self.model.get('_id'));

                $("#collproject_edit_extend-content").html(self.template({
                    cp_cfs_content: rendered.join('')
                }));
                $("#collproject_edit_extend-content").trigger('create');
                return this;

            },
            bind_event: function() {
                var self = this;

                $("#collproject_edit_extend-content")
                    .on('click', '#btn-cp-save', function(event) {
                        // event.preventDefault();
                        // self.model.set('task_name', $("#ct_task_name").val());
                        self.$el.find('select').trigger('change');
                        if (self.model.isValid()) {
                            self.model.save().done(function() { //保存
                                alert('项目保存成功')
                                window.setTimeout(function() {
                                    var next_page = "#collproject_detail/" + self.model.get('_id');
                                    window.location.href = next_page;
                                }, 100);
                            })
                        } else {
                            alert(self.model.validationError);
                        }
                    })

                .on('change', 'input, textarea, select', function(event) {
                    event.preventDefault();
                    var $this = $(this);
                    var field = $this.data('field');
                    var value = $this.val();
                    if ($this.attr('multiple')) { //多选的下拉筐
                        // console.log(field, 'multiple:', value);
                        if (value) {
                            if (value.length == 1) { //判断是否对应取消的动作
                                var fdata = self.model.get(field);
                                var tmp = fdata.split(',');
                                var found = _.find(tmp, function(x) {
                                    return x == value[0]
                                })
                                if (found) { //原来已经存在这个值，应该删掉
                                    tmp.splice(tmp.indexOf(found), 1);
                                    self.model.set(field, tmp.join(','));

                                    self.render(); //重新render
                                } else {
                                    self.model.set(field, value[0]);
                                };
                            } else {
                                self.model.set(field, value.join(',')) //转换成逗号分割的数据

                            };
                        } else {
                            self.model.set(field, ''); //取消所有的选项时
                        };

                    } else { //一般的，直接设定值
                        self.model.set(field, value);
                    };
                    // self.model.set(field, value);
                });
            }

        });

        // Returns the View class
        return CollProjectEditExtendView;

    });