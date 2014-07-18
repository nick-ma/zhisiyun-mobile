// CollTask Edit View
// =================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "moment"],
    function($, _, Backbone, Handlebars, moment) {

        // Extends Backbone.View
        var CollTaskEditView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                var self = this;
                this.template = Handlebars.compile($("#hbtmp_coll_task_edit_view").html());
                // The render method is called when CollTask Models are added to the Collection
                // this.collection.on("sync", this.render, this);
                // bind event
                self.bind_event();
            },

            // Renders all of the CollTask models on the UI
            render: function() {

                var self = this;
                self.ct_id = self.model.get('_id') || null;
                // var rendered = ;
                // var render_data = {
                //         cts: _.sortBy(_.map(this.collection.models, function(x) {
                //             return x.toJSON();
                //         }), function(x) {
                //             return x.fl;
                //         })
                //     }
                // _.each(this.collection.models, function(x) {
                //     x.attributes.pi_count = x.attributes.qualitative_pis.items.length + x.attributes.quantitative_pis.items.length;
                //     rendered.push(self.template(x.attributes));
                // });
                // self.template(render_data);
                // 人员选择
                var sphb = JSON.parse(localStorage.getItem('sp_helper_back') || null);
                localStorage.removeItem('sp_helper_back'); //获取完之后，删掉，避免后面重复使用。
                if (sphb) {
                    self.model.set(sphb.model);
                };
                localStorage.setItem('sp_helper', JSON.stringify({
                    model: self.model.toJSON(),
                    back_url: '#colltask_edit/' + self.model.get('_id'),
                })); //放到local storage里面，便于后面选择屏幕进行操作
                // 指标选择
                var spihb = JSON.parse(localStorage.getItem('spi_helper_back') || null);
                localStorage.removeItem('spi_helper_back'); //获取完之后，删掉，避免后面重复使用。
                if (spihb) {
                    self.model.set(spihb.model);
                };
                localStorage.setItem('spi_helper', JSON.stringify({
                    model: self.model.toJSON(),
                    back_url: '#colltask_edit/' + self.model.get('_id'),
                })); //放到local storage里面，便于后面选择屏幕进行操作
                if (self.ct_id) {
                    $("#btn-colltask_edit-back").attr('href', '#colltask_detail/' + self.ct_id);
                } else {
                    $("#btn-colltask_edit-back").attr('href', '#colltask');
                };
                $("#colltask_edit-content").html(self.template(self.model.toJSON()));
                $("#colltask_edit-content").trigger('create');
                //把 a 换成 span， 避免点那个滑块的时候页面跳走。
                $(".ui-flipswitch a").each(function() {
                    $(this).replaceWith("<span class='" + $(this).attr('class') + "'></span>");
                });
                return this;

            },
            bind_event: function() {
                var self = this;
                $("#colltask_edit-content")
                    .on('click', '#btn-ct-remove', function(event) {
                        // event.preventDefault();
                        /* Act on the event */
                    })
                    .on('click', '#btn-ct-save', function(event) {
                        // event.preventDefault();
                        // self.model.set('task_name', $("#ct_task_name").val());
                        if (self.model.isValid()) {
                            self.model.save().done(function() { //保存
                                if (self.ct_id) {
                                    alert('任务保存成功')
                                    window.setTimeout(function() {
                                        var next_page = "#colltask_detail/" + self.model.get('_id');
                                        window.location.href = next_page;
                                    }, 100);
                                } else {
                                    self.render();
                                };

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
                        self.model.set(field, value);
                    })
                    .on('change', '#ct_task-allday', function(event) {
                        var value = $(this).val();

                        if (value === 'true') {
                            self.model.set('allday', true);
                            self.$el.find("#ct_task-start").attr('type', 'date').val(moment(self.model.get('start')).format('YYYY-MM-DD'));
                            self.$el.find("#ct_task-end").attr('type', 'date').val(moment(self.model.get('end')).format('YYYY-MM-DD'));
                        } else {
                            self.model.set('allday', false);
                            self.$el.find("#ct_task-start").attr('type', 'datetime-local').val(moment(self.model.get('start')).format('YYYY-MM-DDTHH:mm'));
                            self.$el.find("#ct_task-end").attr('type', 'datetime-local').val(moment(self.model.get('end')).format('YYYY-MM-DDTHH:mm'));
                        }
                    })
                    .on('change', '#ct_task-lock_remove', function(event) {
                        var value = $(this).val();

                        if (value === 'true') {
                            self.model.set('lock_remove', true);
                        } else {
                            self.model.set('lock_remove', false);
                        }
                    })
            }

        });

        // Returns the View class
        return CollTaskEditView;

    });