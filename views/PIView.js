// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars"],
    function($, _, Backbone, Handlebars) {

        // Extends Backbone.View
        var PIView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                this.template = Handlebars.compile($("#pi_edit_view").html());
                this.loading_template = Handlebars.compile($("#loading_template_view").html());
                this.bind_event();
            },
            pre_render: function() {
                var self = this;
                $("#ai_add_pi-content").html(self.loading_template({
                    info_msg: '数据加载中...请稍候'
                }));
                $("#ai_add_pi-content").trigger('create');
                return self;
            },
            // Renders all of the People models on the UI
            render: function() {

                var self = this;
                self.ai_add_pi_back_url = localStorage.getItem('ai_add_pi_back_url');
                localStorage.removeItem('ai_add_pi_back_url');
                $("#ai_add_pi_back").attr('href', self.ai_add_pi_back_url);

                var obj = {};
                obj.pi = self.model.attributes;
                obj.pscs = _.filter(self.pi_datas.attributes.pscs, function(x) {
                    return x.points_system.toString() == self.ai_data.attributes.points_system._id.toString();
                });
                obj.unit_data = self.pi_datas.attributes.unit_data;
                obj.sccs = self.pi_datas.attributes.sccs;
                obj.vps = self.pi_datas.attributes.vps;
                obj.its = self.pi_datas.attributes.its;
                $("#ai_add_pi-content").html(self.template(obj));
                $("#ai_add_pi-content").trigger('create');

                return this;

            },

            bind_event: function() {
                var self = this;

                $("#ai_add_pi").on('click', '#btn_add_my_pi', function(event) {
                    event.preventDefault();

                    if ($('#viewport').val() == '') {
                        alert('请选择绩效视角!');
                        return;
                    }

                    if ($('#pi_type').val() == '') {
                        alert('请选择指标类型!');
                        return;
                    }

                    if ($('#pi_unit').val() == '') {
                        alert('请选择指标单位!');
                        return;
                    }

                    if ($('#scc').val() == '') {
                        alert('请选择评分标准!');
                        return;
                    }

                    self.model.attributes.viewport = $('#viewport').val();
                    self.model.attributes.pi_type = $('#pi_type').val();
                    self.model.attributes.pi_unit = $('#pi_unit').val();
                    //评分标准,默认自己公司
                    var company = self.ai_data.attributes.company;
                    var company_name = self.ai_data.attributes.company_name;
                    var scs = [];
                    var sc = {};
                    sc.sc_name = $('#scc').find("option:selected").text();
                    sc.sc_description = $('#scc').val();
                    scs.push(sc);
                    var company_item = {};
                    company_item.company = company;
                    company_item.company_name = company_name;
                    company_item.scs = scs;
                    self.model.attributes.sc_company_items.push(company_item);

                    if ($('#psc').val()) {
                        //评分等级组,默认自己公司
                        var points_system = self.ai_data.attributes.points_system._id;
                        var points_system_name = self.ai_data.attributes.points_system.points_system_name;
                        var pgs = [];
                        var pg = {};
                        pg.points_system = points_system;
                        pg.points_system_name = points_system_name;
                        pg.grade_group = $('#psc').val();
                        pg.gg_name = $('#psc').find('option:selected').text();
                        pgs.push(pg);
                        var company_item1 = {};
                        company_item1.company = company;
                        company_item1.company_name = company_name;
                        company_item1.pgs = pgs;
                        self.model.attributes.pg_company_items.push(company_item1);
                    }

                    self.model.save().done(function() {
                        var pi = self.model.attributes;

                        var item = {};
                        item.pi_source = '1';
                        item.target_value = '';
                        item.pi = pi._id;
                        item.pi_name = pi.pi_name;
                        item.unit = pi.pi_unit;
                        item.weight = 0;
                        item.grade_way = self.ai_data.attributes.qualitative_pis.grade_way;
                        if (self.ai_data.attributes.qualitative_pis.grade_group) {

                            //如果指标上配置了，指标优先
                            if (pi.pg_company_items.length == 1 && pi.pg_company_items[0].pgs.length == 1) {
                                item.grade_group = pi.pg_company_items[0].pgs[0].grade_group;
                            } else {
                                item.grade_group = self.ai_data.attributes.qualitative_pis.grade_group;
                            }
                        }
                        item.self_weight = self.ai_data.attributes.qualitative_pis.self_weight;
                        item.indirect_weight = self.ai_data.attributes.qualitative_pis.indirect_weight;
                        item.superior_weight = self.ai_data.attributes.qualitative_pis.superior_weight;
                        item.superior_superior_weight = self.ai_data.attributes.qualitative_pis.superior_superior_weight;
                        item.other_weight = self.ai_data.attributes.qualitative_pis.other_weight;

                        var oItem = _.find(self.ai_data.attributes.qualitative_pis.items, function(op) {
                            return op.pi == pi._id;
                        });

                        if (!oItem) {
                            self.ai_data.attributes.qualitative_pis.items.push(item);
                        }

                        if (pi.sc_company_items.length == 1 && pi.sc_company_items[0].scs.length == 1) {
                            item.pi_sc_name = pi.sc_company_items[0].scs[0].sc_name;
                            item.pi_sc_description = pi.sc_company_items[0].scs[0].sc_description;
                        }

                        //计算权重
                        // self.ai_data.attributes.quantitative_pis.weight = 0;
                        // self.ai_data.attributes.qualitative_pis.weight = 0;
                        // _.each(self.ai_data.attributes.quantitative_pis.items, function(x) {
                        //     self.ai_data.attributes.quantitative_pis.weight += parseFloat(x.weight);
                        // });
                        // _.each(self.ai_data.attributes.qualitative_pis.items, function(x) {
                        //     self.ai_data.attributes.qualitative_pis.weight += parseFloat(x.weight);
                        // });

                        self.ai_data.save().done(function() {
                            window.location.href = self.ai_add_pi_back_url;
                        })
                    })
                })
                $("#ai_add_pi-content").on('change', '.mypi', function(event) {
                    event.preventDefault();
                    var $this = $(this);

                    var target = $this.data('target');
                    self.model.attributes[target] = $this.val();
                })
            }

        });

        // Returns the View class
        return PIView;

    });