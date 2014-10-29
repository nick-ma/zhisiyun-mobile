// PeopleSelectt View
// =================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars"],
    function($, _, Backbone, Handlebars) {

        // Extends Backbone.View
        var PISelectView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                this.template_m = Handlebars.compile($("#ai_pi_select_view").html());
                // this.template_s = Handlebars.compile($("#hbtmp_people_select_single_view").html());
                // The render method is called when PeopleSelectels are added to the Collection
                // this.collection.on("sync", this.render, this);
                this.filter_mode = 'favorite'; //默认是favorite
                this.select_mode = 'm';
                this.bind_event();
            },

            // Renders all of the PeopleSelectels on the UI
            render: function() {

                var self = this;

                if (!!localStorage.getItem('ai_add_pi_back_url')) {
                    self.ai_add_pi_back_url = localStorage.getItem('ai_add_pi_back_url');
                    localStorage.removeItem('ai_add_pi_back_url');
                }

                // self.target_field = target_field;
                // self.select_mode = select_mode || 'm'; //默认多选
                var render_data = {
                    pis: _.map(self.my_pis.models, function(x) {
                        return x.toJSON();
                    }),
                    // cp_id: self.cp_id,
                }

                if (self.filter_mode == 'all') {
                    render_data.pis = _.map(self.collection.models, function(x) {
                        return x.toJSON();
                    });
                };

                self.pis = render_data.pis;

                $("#pis_select-content").html(self.template_m(render_data));
                $("#pis_select-content").trigger('create');
                // 设定顶部过滤按钮的样式
                if (self.filter_mode == 'all') {
                    $("#pis_select").find("#btn_filter_all").addClass('ui-btn-active');
                    $("#pis_select").find("#btn_filter_my_favorite").removeClass('ui-btn-active');
                } else {
                    $("#pis_select").find("#btn_filter_all").removeClass('ui-btn-active');
                    $("#pis_select").find("#btn_filter_my_favorite").addClass('ui-btn-active');
                };

                window.setTimeout(function() {
                    if ($("#pis_select-content input:checked").length && $("#pis_select-content input:checked").offset().top > 75) {
                        $.mobile.silentScroll($("#pis_select-content input:checked").offset().top - 95)
                    }
                }, 1000);
                return this;

            },
            bind_event: function() {
                var self = this;

                function find_dp_peoples(sii, pi) {
                    var position_id = self.ai_data.attributes.position;
                    var ou_id = self.ai_data.attributes.ou;
                    var company_id = self.ai_data.attributes.company;

                    var item_p = _.find(pi.dp_position_items, function(x) {
                        return x.position == position_id;
                    })

                    if (item_p) {
                        return get_select_peoples_data(sii, item_p);
                    }

                    var item_o = _.find(pi.dp_ou_items, function(x) {
                        return x.ou == ou_id;
                    })

                    if (item_o) {
                        return get_select_peoples_data(sii, item_o);
                    }

                    var item_c = _.find(pi.dp_company_items, function(x) {
                        return x.company == company_id;
                    })

                    if (item_c) {
                        return get_select_peoples_data(sii, item_c);
                    }
                }

                function get_select_peoples_data(sii, item) {
                    var pls = [];

                    //遍历数据提供人
                    _.each(item.dp_peoples, function(p) {
                        var obj = {};
                        obj._id = p._id;
                        obj.people_name = p.people_name;
                        pls.push(obj);
                    });

                    if (pls.length) {
                        return pls;
                    }

                    //遍历数据提供职位
                    _.each(item.dp_positions, function(x) {
                        var peoples = _.filter(self.peoples_data, function(p) {
                            return (p.position._id == x.position);
                        });
                        _.each(peoples, function(p) {
                            var obj = {};
                            obj._id = p._id;
                            obj.people_name = p.people_name;
                            pls.push(obj);
                        })
                    });

                    if (pls.length) {
                        return pls;
                    }

                    //遍历数据提供部门，找出部门的负责人
                    _.each(item.dp_ous, function(ou) {
                        var p = _.find(self.peoples_data, function(p) {
                            return (p.ou == ou.ou && p.position.position_manager);
                        });
                        if (p) {
                            var obj = {};
                            obj._id = p._id;
                            obj.people_name = p.people_name;
                            pls.push(obj);
                        }
                    });

                    return pls;
                }

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

                $("#pis_select")
                    .on('click', '#btn-pis_select-ok', function(event) {
                        event.preventDefault();

                        var pi_ids = [];
                        $(".pis:checked").each(function() {
                            pi_ids.push($(this).attr("id"));
                        });

                        if (pi_ids.length == 0) {
                            alert('请选择要添加的指标!');
                        } else {
                            //指标来源
                            var pi_source;
                            if (self.ai_data.attributes.ai_status == '1') {
                                pi_source = '3';
                            } else if (self.ai_data.attributes.ai_status == '2') {
                                pi_source = '1';
                            } else {
                                pi_source = '2';
                            }
                            for (var i = 0, l = pi_ids.length; i < l; i++) {
                                var pi = _.find(self.pis, function(x) {
                                    return x._id == pi_ids[i];
                                })
                                if (pi.ration == '2') { //定量
                                    var item = {};
                                    item.pi_source = pi_source;
                                    item.pi = pi._id;
                                    item.pi_name = pi.pi_name;
                                    item.unit = pi.pi_unit;
                                    item.target_value = '';
                                    item.actual_value = '';
                                    item.weight = 0;

                                    var sfs = find_sf(pi);
                                    if (sfs.length == 1) {
                                        item.scoringformula = sfs[0].sf;
                                    }

                                    //自己是否配有数据提供人
                                    var pls = find_dp_peoples(item, pi);
                                    if (pls.length == 1) {
                                        item.dp_people = pls[0]._id;
                                    }

                                    var oItem = _.find(self.ai_data.attributes.quantitative_pis.items, function(op) {
                                        return op.pi == pi._id;
                                    });
                                    if (!oItem) {
                                        self.ai_data.attributes.quantitative_pis.items.push(item);
                                    }
                                } else { //定性
                                    var item = {};
                                    item.pi_source = pi_source;
                                    item.target_value = '';
                                    item.pi = pi._id;
                                    item.pi_name = pi.pi_name;
                                    item.unit = pi.pi_unit;
                                    item.weight = 0;
                                    item.grade_way = self.ai_data.attributes.qualitative_pis.grade_way;
                                    if (self.ai_data.attributes.qualitative_pis.grade_group) {
                                        var pgs = find_pg(pi);
                                        //如果指标上配置了，指标优先
                                        if (pgs.length == 1) {
                                            item.grade_group = pgs[0].grade_group;
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

                                    var scs = find_sc(pi);
                                    if (scs.length == 1) {
                                        item.pi_sc_name = scs[0].sc_name;
                                        item.pi_sc_description = scs[0].sc_description;
                                    }
                                }
                            }

                            self.ai_data.save().done(function() {
                                window.location.href = self.ai_add_pi_back_url;
                            })
                        }
                    })
                    .on('click', '#btn-pis_select-back', function(event) {
                        event.preventDefault();
                        window.location.href = self.ai_add_pi_back_url; //返回调用界面
                    })
                    .on('click', '#btn_filter_my_pi', function(event) {
                        event.preventDefault();
                        self.filter_mode = 'favorite';
                        self.render();
                    })
                    .on('click', '#btn_filter_all', function(event) {
                        event.preventDefault();
                        self.filter_mode = 'all';
                        self.render();
                    });

            },

        });

        // Returns the View class
        return PISelectView;

    });