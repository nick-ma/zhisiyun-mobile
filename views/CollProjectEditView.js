// CollProject Edit View
// =================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars"],
    function($, _, Backbone, Handlebars) {

        // Extends Backbone.View
        var CollProjectEditView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                var self = this;
                this.template = Handlebars.compile($("#hbtmp_coll_project_edit_view").html());
                // The render method is called when CollProject Models are added to the Collection
                // this.collection.on("sync", this.render, this);
                // bind event
                self.bind_event();
            },

            // Renders all of the CollProject models on the UI
            render: function() {

                var self = this;
                // 指标选择
                var spihb = JSON.parse(localStorage.getItem('spi_helper_back') || null);
                localStorage.removeItem('spi_helper_back'); //获取完之后，删掉，避免后面重复使用。
                // console.log(spihb);
                if (spihb) {
                    self.model.set(spihb.model);
                };
                localStorage.setItem('spi_helper', JSON.stringify({
                    model: self.model.toJSON(),
                    back_url: '#collproject_edit/' + self.model.get('_id') + '/' + self.ct_id,
                })); //放到local storage里面，便于后面选择屏幕进行操作


                $("#collproject_edit-content").html(self.template(self.model.toJSON()));
                $("#collproject_edit-content").trigger('create');

                return this;

            },
            bind_event: function() {
                var self = this;
                $("#collproject_edit-content")
                    .on('click', '#btn-cp-save', function(event) {
                        // event.preventDefault();
                        // self.model.set('task_name', $("#ct_task_name").val());
                        if (self.model.isValid()) {
                            self.model.save().done(function() { //保存
                                alert('项目保存成功')
                                window.setTimeout(function() {
                                    var next_page = "#collproject/" + self.ct_id + "/" + self.model.get('_id');
                                    window.location.href = next_page;
                                }, 100);
                            })
                        } else {
                            alert(self.model.validationError);
                        }
                    })
                    .on('click', '#btn-cp-remove', function(event) {
                        // event.preventDefault();
                        // self.model.set('task_name', $("#ct_task_name").val());
                        if (confirm('确认删除项目吗？\n一旦删除，所有与之关联的任务将自动解除关联！')) {
                            var col_cp = self.model.collection;
                            // col_cp.remove(self.model);
                            // col_cp.trigger('sync');
                            self.model.destroy().done(function() { //保存
                                alert('项目删除成功')
                                window.setTimeout(function() {
                                    var next_page = "#collproject/" + self.ct_id + "/";
                                    window.location.href = next_page;
                                }, 100);
                            })
                        };

                    })
                    .on('change', 'input, textarea', function(event) {
                        event.preventDefault();
                        var $this = $(this);
                        var field = $this.data('field');
                        var value = $this.val();
                        self.model.set(field, value);
                    })
                    .on('click', '#btn-cp-select-pis', function(event) {
                        event.preventDefault();
                        if (self.model.isValid()) {
                            self.model.save().done(function() { //保存
                                self.render();
                                window.setTimeout(function() {
                                    var url = '#pi_select/m/pis';
                                    window.location.href = url;
                                }, 100);
                            })
                        } else {
                            alert(self.model.validationError);
                        }

                    });
            }

        });

        // Returns the View class
        return CollProjectEditView;

    });