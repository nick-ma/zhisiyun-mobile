// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars"],
    function($, _, Backbone, Handlebars) {

        // Extends Backbone.View
        var AiPrevView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                this.template = Handlebars.compile($("#ai_prev_view").html());
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

                $("#ai_add_pi-content").html(self.template(self.model.attributes));
                $("#ai_add_pi-content").trigger('create');

                return this;

            },

            bind_event: function() {
                var self = this;

                function find_sf(pi) {
                    var position_id = self.ai_data.attributes.position;
                    var ou_id = self.ai_data.attributes.ou;
                    var company_id = self.ai_data.attributes.company;

                    var item_p = _.find(pi.sf_position_items, function(x) {
                        return x.position == position_id;
                    })

                    if (item_p) {
                        return item_p.sfs;
                    }

                    var item_o = _.find(pi.sf_ou_items, function(x) {
                        return x.ou == ou_id;
                    })

                    if (item_o) {
                        return item_o.sfs;
                    }

                    var item_c = _.find(pi.sf_company_items, function(x) {
                        return x.company == company_id;
                    })

                    if (item_c) {
                        return item_c.sfs;
                    }

                    return [];
                }

                function find_sc(pi) {
                    var position_id = self.ai_data.attributes.position;
                    var ou_id = self.ai_data.attributes.ou;
                    var company_id = self.ai_data.attributes.company;

                    var item_p = _.find(pi.sc_position_items, function(x) {
                        return x.position == position_id;
                    })

                    if (item_p) {
                        return item_p.scs;
                    }

                    var item_o = _.find(pi.sc_ou_items, function(x) {
                        return x.ou == ou_id;
                    })

                    if (item_o) {
                        return item_o.scs;
                    }

                    var item_c = _.find(pi.sc_company_items, function(x) {
                        return x.company == company_id;
                    })

                    if (item_c) {
                        return item_c.scs;
                    }

                    return [];
                }

                function find_pg(pi) {
                    var position_id = self.ai_data.attributes.position;
                    var ou_id = self.ai_data.attributes.ou;
                    var company_id = self.ai_data.attributes.company;

                    var item_p = _.find(pi.pg_position_items, function(x) {
                        return x.position == position_id;
                    })

                    if (item_p) {
                        return item_p.pgs;
                    }

                    var item_o = _.find(pi.pg_ou_items, function(x) {
                        return x.ou == ou_id;
                    })

                    if (item_o) {
                        return item_o.pgs;
                    }

                    var item_c = _.find(pi.pg_company_items, function(x) {
                        return x.company == company_id;
                    })

                    if (item_c) {
                        return item_c.pgs;
                    }

                    return [];
                }


                $("#ai_add_pi").on('click', '#btn_add_pi_prev', function(event) {
                    event.preventDefault();

                    var pi_ids1 = [];
                    $(".dl:checked").each(function() {
                        pi_ids1.push($(this).attr("id"));
                    });

                    var pi_ids2 = [];
                    $(".dx:checked").each(function() {
                        pi_ids2.push($(this).attr("id"));
                    });

                    if (pi_ids1.length == 0 && pi_ids2.length == 0) {
                        alert('请选择要添加的指标!');
                    } else {
                        $('#btn_add_pi_prev').attr('disabled', true);
                        for (var i = 0, l = pi_ids1.length; i < l; i++) {
                            var sitem = _.find(self.model.attributes.quantitative_pis.items, function(sa) {
                                return sa.pi == pi_ids1[i];
                            });
                            var item = {};
                            item.pi_source = '1';
                            item.pi = pi_ids1[i];
                            item.pi_name = sitem.pi_name ? sitem.pi_name : '';
                            item.target_value = sitem.target_value ? sitem.target_value : '';
                            item.weight = sitem.weight ? sitem.weight : 0;
                            //自己是否有配置计分公式
                            var pi_f = _.find(self.pis.models, function(x) {
                                return x.attributes._id == pi_ids1[i];
                            });
                            var sfs = find_sf(pi_f.attributes);
                            if (sfs.length == 1) {
                                item.scoringformula = sfs[0].sf;
                            } else {
                                item.scoringformula = sitem.scoringformula ? sitem.scoringformula : null;
                            }

                            item.unit = sitem.unit ? sitem.unit : '';
                            //加载的时候，取自己的配置
                            // item.dp_people = sitem.dp_people ? sitem.dp_people : null;
                            if (!!sitem.ol) {
                                item.ol = sitem.ol;
                                item.ol_name = sitem.ol_name;
                            }

                            var oitem = _.find(self.ai_data.attributes.quantitative_pis.items, function(op) {
                                return op.pi == item.pi;
                            });
                            var flag = true;
                            if (!!oitem) {
                                if (!!item.ol) {
                                    var ite = _.find(self.ai_data.attributes.quantitative_pis.items, function(op) {
                                        return op.pi == item.pi && op.ol == item.ol;
                                    });
                                    if (!!ite) {
                                        flag = false;
                                    }
                                } else {
                                    flag = false;
                                }
                            }

                            if (flag) {
                                self.ai_data.attributes.quantitative_pis.items.push(item);
                            }
                        }

                        for (var j = 0, l = pi_ids2.length; j < l; j++) {
                            var sitem = _.find(self.model.attributes.qualitative_pis.items, function(sa) {
                                return sa.pi == pi_ids2[j];
                            });
                            var item = {};
                            item.pi_source = '1';
                            item.pi = pi_ids2[j];
                            item.pi_name = sitem.pi_name ? sitem.pi_name : '';
                            item.target_value = sitem.target_value ? sitem.target_value : '';
                            item.weight = sitem.weight ? sitem.weight : 0;
                            item.unit = sitem.unit ? sitem.unit : '';

                            //自己是否有配置评分标准
                            var pi_f = _.find(self.pis.models, function(x) {
                                return x.attributes._id == pi_ids2[j];
                            });

                            var scs = find_sc(pi_f.attributes);
                            if (scs.length == 1) {
                                item.pi_sc_name = scs[0].sc_name;
                                item.pi_sc_description = scs[0].sc_description;
                            } else {
                                item.pi_sc_name = sitem.pi_sc_name ? sitem.pi_sc_name : '';
                                item.pi_sc_description = sitem.pi_sc_description ? sitem.pi_sc_description : '';
                            }

                            item.grade_way = self.ai_data.attributes.qualitative_pis.grade_way ? self.ai_data.attributes.qualitative_pis.grade_way : '';
                            //自己是否配置了等级组
                            if (self.ai_data.attributes.qualitative_pis.grade_group) {
                                var pgs = find_pg(pi_f.attributes);
                                //如果指标上配置了，指标优先
                                if (pgs.length == 1) {
                                    item.grade_group = pgs[0].grade_group;
                                } else {
                                    item.grade_group = self.ai_data.attributes.qualitative_pis.grade_group ? self.ai_data.attributes.qualitative_pis.grade_group : null;
                                }
                            }

                            item.self_weight = self.ai_data.attributes.qualitative_pis.self_weight;
                            item.indirect_weight = self.ai_data.attributes.qualitative_pis.indirect_weight;
                            item.superior_weight = self.ai_data.attributes.qualitative_pis.superior_weight;
                            item.superior_superior_weight = self.ai_data.attributes.qualitative_pis.superior_superior_weight;
                            item.other_weight = self.ai_data.attributes.qualitative_pis.other_weight;

                            if (!!sitem.ol) {
                                item.ol = sitem.ol;
                                item.ol_name = sitem.ol_name;
                            }
                            var oitem = _.find(self.ai_data.attributes.qualitative_pis.items, function(op) {
                                return op.pi == item.pi;
                            });
                            var flag = true;
                            if (!!oitem) {
                                if (!!item.ol) {
                                    var ite = _.find(self.ai_data.attributes.qualitative_pis.items, function(op) {
                                        return op.pi == item.pi && op.ol == item.ol;
                                    });
                                    if (!!ite) {
                                        flag = false;
                                    }
                                } else {
                                    flag = false;
                                }
                            }

                            if (flag) {
                                self.ai_data.attributes.qualitative_pis.items.push(item);
                            }
                        }

                        //计算权重
                        self.ai_data.attributes.quantitative_pis.weight = 0;
                        self.ai_data.attributes.qualitative_pis.weight = 0;
                        _.each(self.ai_data.attributes.quantitative_pis.items, function(x) {
                            self.ai_data.attributes.quantitative_pis.weight += parseFloat(x.weight);
                        });
                        _.each(self.ai_data.attributes.qualitative_pis.items, function(x) {
                            self.ai_data.attributes.qualitative_pis.weight += parseFloat(x.weight);
                        });

                        self.ai_data.save().done(function() {
                            window.location.href = self.ai_add_pi_back_url;
                        })
                    }
                });
                $("#ai_add_pi-content").on('change', '#dls', function(event) {
                    event.preventDefault();
                    var bool = ($(this).attr('data-cacheval') == 'true' ? false : true);
                    if (bool) {
                        var set = $(".dl").each(function() {
                            $(this).attr('checked', true)
                            $(this).prev().removeClass('ui-checkbox-off').addClass('ui-checkbox-on')
                            $(this).attr("data-cacheval", false);
                        })
                    } else {
                        var set = $(".dl").each(function() {
                            $(this).attr('checked', false)
                            $(this).prev().removeClass('ui-checkbox-on').addClass('ui-checkbox-off')
                            $(this).attr("data-cacheval", true);
                        })
                    }

                }).on('change', '#dxs', function(event) {
                    event.preventDefault();
                    var bool = ($(this).attr('data-cacheval') == 'true' ? false : true);
                    if (bool) {
                        var set = $(".dx").each(function() {
                            $(this).attr('checked', true)
                            $(this).prev().removeClass('ui-checkbox-off').addClass('ui-checkbox-on')
                            $(this).attr("data-cacheval", false);
                        })
                    } else {
                        var set = $(".dx").each(function() {
                            $(this).attr('checked', false)
                            $(this).prev().removeClass('ui-checkbox-on').addClass('ui-checkbox-off')
                            $(this).attr("data-cacheval", true);
                        })
                    }

                })
            }

        });

        // Returns the View class
        return AiPrevView;

    });