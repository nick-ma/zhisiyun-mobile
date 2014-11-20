// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "moment"],
    function($, _, Backbone, Handlebars, moment) {
        var pi;
        var td;
        var tmp_form_table;
        var tmp_form_table_form;
        var disabled;

        Handlebars.registerHelper('renderFieldTitle', function(row, col) {
            var field = get_field(row, col);
            if (field) {
                var ret = [];
                if (startWith(field.cat, 'table')) {
                    ret.push('<span class="ui-field-contain">* <b>')
                    ret.push(field.title)
                    ret.push(':</b>')
                    if (!disabled) {
                        ret.push('<p class="m-ud-0p2em" style="position: absolute;top: -3px;width:30px;right: 1px;margin-top:2px">')
                        ret.push('<button class="btn_add_tr_data ui-btn ui-icon-plus ui-btn-icon-notext ui-shadow ui-corner-all" data-row="' + field.row + '" data-col="' + field.col + '">')
                        ret.push('</button></p>')
                    }
                    ret.push('</span>')
                } else {
                    if (field.require) {
                        ret.push('<span class="text-error">* </span>')
                    };
                    ret.push('<span><b>')
                    ret.push(field.title)
                    ret.push(':</b></span>')
                }
                return ret.join('');
            } else {
                return '';
            };
        });

        // Handlebars.registerHelper('renderFieldElement', function(row, col) {
        //     var field = get_field(row, col);
        //     if (field) {
        //         var common_attr = [];
        //         common_attr.push('placeholder="' + field.title + '"');
        //         common_attr.push('data-row="' + field.row + '"');
        //         common_attr.push('data-col="' + field.col + '"');
        //         if (field.require) {
        //             common_attr.push('required');
        //         };
        //         var ca_str = common_attr.join(' ');
        //         var value = field.data ? field.data : ''; //字段里的值
        //         //判断当前的任务节点是否能进行编辑
        //         var task_editable = _.find(field.task_editable, function(x) {
        //             return x.td == td._id
        //         })
        //         disabled = (task_editable && task_editable.flag) ? '' : 'disabled';

        //         var ret = [];
        //         if (field.cat == 'str') {
        //             if (field.ctype == 'input') {
        //                 ret.push('<input type="text" ' + ca_str + ' value="' + value + '" ' + disabled + '>')
        //             } else if (field.ctype == 'textarea') {
        //                 ret.push('<textarea ' + ca_str + ' ' + disabled + '>' + value + '</textarea>')
        //             } else if (field.ctype == 'select') {
        //                 ret.push('<select ' + ca_str + ' ' + disabled + '>');
        //                 _.each(field.options, function(x) {
        //                     if (value == x) {
        //                         ret.push('<option value="' + x + '" selected>' + x + '</opton>');
        //                     } else {
        //                         ret.push('<option value="' + x + '">' + x + '</opton>');
        //                     };
        //                 })
        //                 ret.push('</select>');
        //             };
        //         } else if (field.cat == 'num') {
        //             ret.push('<input type="text" ' + ca_str + ' value="' + value + '" ' + disabled + '>')
        //         } else if (field.cat == 'date') {
        //             ret.push('<input class="date_field" type="date" ' + ca_str + ' value="' + value + '" ' + disabled + '>')
        //         } else if (startWith(field.cat, 'table')) {
        //             var table_render_data = field;
        //             table_render_data.disabled = disabled;
        //             ret.push(tmp_form_table(table_render_data)); //也要渲染value， disabled
        //         };

        //         return ret.join('');
        //     } else {
        //         return '';
        //     };
        // });

        Handlebars.registerHelper('getTableCellValue', function(data_row, col, decimal_digits, thousands) {
            // console.log(data_row, col, decimal_digits);
            var ret = '';
            if (_.isObject(data_row)) {
                ret = data_row[col];
                if (decimal_digits) { //处理小数位数
                    ret = sprintf("%0." + decimal_digits + "f", parseInt(ret));
                };
                if (thousands) { //转换千分位显示
                    ret = commafy(ret);
                };
            };
            return ret;
        });

        Handlebars.registerHelper('sum', function(data, col, decimal_digits, thousands) {
            // console.log(data, col);
            var sum = 0;
            if (_.isArray(data)) {
                _.each(data, function(x) {
                    var tmp = parseFloat(x[col]);
                    if (_.isNaN(tmp)) {
                        tmp = 0;
                    };
                    sum += tmp;
                })
            };
            if (decimal_digits) { //处理小数位数
                sum = sprintf("%0." + decimal_digits + "f", sum);
            };
            if (thousands) { //转换千分位显示
                sum = commafy(sum);
            };
            return sum;
        });

        function get_field(row, col) {
            return _.find(pi.get('customize_fields'), function(x) {
                return x.row == row && x.col == col;
            })
        };

        function startWith(str1, str2) {
            var re = /./;
            re.compile('^' + str2);
            return re.test(str1);
        };

        function commafy(num, fp) { //转换为千分位显示
            if (_.isNumber(num) && fp) {
                num = num.toFixed(fp) + "";
            };
            var re = /(-?\d+)(\d{3})/;
            while (re.test(num)) {
                num = num.replace(re, "$1,$2");
            }
            return num;
        };

        function apply_formula(field, data) { //计算formula的值
            var regexp_num = /^(-)?[0-9\.]*$/;
            _.each(field.columns, function(x, index) {
                if (x.cat == 'num' && x.formula) {
                    var formula = x.formula;
                    var operands = x.formula.match(/\{\d\}/g);
                    _.each(operands, function(p) {
                        var idx = parseInt(p.replace(/\{|\}/g, '')) - 1; //获取到数据的index
                        var idx_data = data[idx];
                        if (idx_data == '' || !regexp_num.test(idx_data)) { //如果没写或者不是数字，则给0
                            idx_data = 0;
                        };
                        formula = formula.replace(p, idx_data);
                    })
                    var val = 0;
                    try {
                        val = eval(formula)
                    } catch (e) {
                        val = 0;
                    }
                    data[index] = val + '';
                    // console.log(formula, eval(formula));
                };
            })
        };

        function validate_table_form_data(field, data) { //验证表格的单行数据
            var ret = {
                pass: true,
                errs: []
            };
            _.each(field.columns,
                function(x, index) {
                    if (x.show) {
                        //检查必输项
                        if (x.require) { //设定为必输的
                            if (!data[index]) {
                                ret.pass = false;
                                ret.errs.push('[' + x.title + ']不能为空');
                            };
                        };
                        // 检查数据类型
                        if (x.cat == 'num') {
                            var regexp_num = /^(-)?[0-9\.]*$/;
                            if (!regexp_num.test(data[index])) {
                                ret.pass = false;
                                ret.errs.push('[' + x.title + ']不是有效的数字');
                            };
                        } else if (x.cat == 'date') {

                        };
                    };

                })
            return ret;
        };
        // Extends Backbone.View
        var View = Backbone.View.extend({
            // The View Constructor
            initialize: function() {
                this.el = '#form_body';
                this.template = Handlebars.compile($("#tmp_form_body").html());
                tmp_form_table_form = Handlebars.compile($("#tmp_form_table_form").html());
                tmp_form_table = Handlebars.compile($("#tmp_form_table").html());

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
                    td = self.td;
                    var render_data = self.pi.toJSON();
                    render_data.customize_form_rows = _.map(_.range(render_data.customize_form.rows), function(x) {
                        var row = {
                            row: x
                        };
                        row.colspan = render_data.customize_form.colspan[x] || false;
                        return row;
                    });
                    $("#form_body").html(self.template(render_data));
                    $("#form_body").trigger('create');
                } else {
                    $("body").pagecontainer("change", "#form_table_form", {
                        reverse: false,
                        changeHash: false,
                    });
                }
                return this;
            },
            bind_event: function() {
                var self = this;
                $("#form_body")
                    .on('change', 'input,textarea,select', function(event) {
                        event.preventDefault();
                        var $this = $(this);
                        var row = $this.data('row');
                        var col = $this.data('col');
                        var data_row = $this.data('data_row');
                        var data_col = $this.data('data_col');
                        var value = $this.val();
                        var field = get_field(row, col);
                        if (field) {
                            if (field.cat == 'str' || field.cat == 'num' || field.cat == 'date') {
                                field['data'] = value;
                                self.render(); //简单的内容，改变之后直接render
                            } else if (startWith(field.cat, 'table')) { //对于表格内部的数据的变化，直接修改数据，等到用户点击“保存”的时候再render
                                // console.log(value, field, data_row, data_col);
                                field.data[data_row][data_col] = value;
                                //是否设定了公式需要计算的
                                // console.log(field);
                                if (field.columns[data_col].cat == 'num') {
                                    var data = field.data[data_row]
                                    apply_formula(field, data);
                                    var render_data = {
                                            field: field,
                                            data: data,
                                            index: data_row
                                        }
                                        // var $table_form_container = $('#table_form_' + row + '-' + col);
                                        // $table_form_container.html(tmp_form_table_form(render_data));
                                };

                            };
                        };
                    })
                    .on('click', '.btn_add_tr_data', function(event) { //增加一行表格数据
                        event.preventDefault();

                        var $this = $(this);
                        var row = $this.data('row');
                        var col = $this.data('col');
                        var field = get_field(row, col);
                        // console.log(row, col, field);

                        if (field) {
                            if (!field.data) {
                                field.data = [];
                            };
                            field.data.push({});
                            var render_data = {
                                field: field,
                                data: {},
                                index: field.data.length - 1,
                            }

                            $("#form_table_form-content").html(tmp_form_table_form(render_data));
                            $("#form_table_form-content").trigger('create');
                            $("#form_table_form-content").find(".date_field").attr("type", "date");

                            self.view_mode = '2';
                            self.render();
                        };

                    })
                    .on('click', '.btn_edit_tr_data', function(event) { //编辑一行表格数据
                        event.preventDefault();

                        var $this = $(this);
                        var row = $this.data('row');
                        var col = $this.data('col');
                        var index = $this.data('index');
                        var field = get_field(row, col);
                        var data = field.data[index];

                        if (field) {
                            var render_data = {
                                field: field,
                                data: data,
                                index: index
                            };
                            $("#form_table_form-content").html(tmp_form_table_form(render_data));
                            $("#form_table_form-content").trigger('create');
                            $("#form_table_form-content").find(".date_field").attr("type", "date");

                            self.view_mode = '2';
                            self.render();
                        };

                    });
                $("#form_table_form")
                    .on('change', 'input,textarea,select', function(event) {
                        event.preventDefault();

                        var $this = $(this);
                        var row = $this.data('row');
                        var col = $this.data('col');
                        var data_row = $this.data('data_row');
                        var data_col = $this.data('data_col');
                        var value = $this.val();
                        var field = get_field(row, col);
                        if (field) {
                            if (field.cat == 'str' || field.cat == 'num' || field.cat == 'date') {
                                field['data'] = value;
                                self.render(); //简单的内容，改变之后直接render
                            } else if (startWith(field.cat, 'table')) { //对于表格内部的数据的变化，直接修改数据，等到用户点击“保存”的时候再render
                                // console.log(value, field, data_row, data_col);
                                field.data[data_row][data_col] = value;
                                //是否设定了公式需要计算的
                                // console.log(field);
                                if (field.columns[data_col].cat == 'num') {
                                    var data = field.data[data_row]
                                    apply_formula(field, data);
                                    var render_data = {
                                        field: field,
                                        data: data,
                                        index: data_row
                                    }
                                    $("#form_table_form-content").html(tmp_form_table_form(render_data));
                                    $("#form_table_form-content").trigger('create');
                                    $("#form_table_form-content").find(".date_field").attr("type", "date");
                                    self.render();
                                    // var $table_form_container = $('#table_form_' + row + '-' + col);
                                    // $table_form_container.html(tmp_form_table_form(render_data));
                                };

                            };
                        };
                    })
                    .on('click', '.btn_remove_tr_data', function(event) { //删除一行表格数据
                        event.preventDefault();

                        var $this = $(this);
                        var row = $this.data('row');
                        var col = $this.data('col');
                        var index = $this.data('index');
                        var field = get_field(row, col);
                        var data = field.data[index];
                        // if (field && data && confirm('确认要删除吗？')) {
                            field.data.splice(index, 1);
                            self.view_mode = '1';
                            self.render();
                        // };
                        // console.log(row, col, index);
                    })
                    .on('click', '.btn_save_tr_data', function(event) { //保存一行表格数据
                        event.preventDefault();

                        var $this = $(this);
                        var row = $this.data('row');
                        var col = $this.data('col');
                        var index = $this.data('index');

                        $("#form_table_form-content select").trigger('change')
                        //做表单验证
                        var field = get_field(row, col);
                        var data = field.data[index];
                        // console.log(field);
                        var vr = validate_table_form_data(field, data);
                        // console.log(vr);
                        if (vr.pass) {
                            self.view_mode = '1';
                            self.render();
                        } else {
                            alert(vr.errs.join('\n'));
                        };
                    })
                    .on('click', '#btn-form_table_form-back', function(event) {
                        // self.view_mode = '1';
                        // self.render();

                        $('.btn_remove_tr_data').trigger('click');
                    });
            }

        });

        // Returns the View class
        return View;

    });