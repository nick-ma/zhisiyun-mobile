// CollTask List View
// =================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars"],
    function($, _, Backbone, Handlebars) {

        // Extends Backbone.View
        var CollTaskDetailView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                this.template = Handlebars.compile($("#hbtmp_coll_task_detail_view").html());
                // The render method is called when CollTask Models are added to the Collection
                // this.collection.on("sync", this.render, this);
                this.bind_event();
            },

            // Renders all of the CollTask models on the UI
            render: function() {

                var self = this;

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
                var render_data = self.model.toJSON();
                //查找子任务
                render_data.sub_tasks = _.map(_.filter(self.model.collection.models, function(x) {
                    return x.get('p_task') == self.model.get('_id')
                }), function(x) {
                    return x.toJSON();
                })
                render_data.login_people = $("#login_people").val();

                $("#btn-colltask_detail-edit").attr('href', '#colltask_edit/' + self.model.get('_id'));
                //设定返回按钮的地址
                if (self.model.get('p_task')) { //有父级任务，返回
                    $("#btn-colltask_detail-back").attr('href', '#colltask_detail/' + self.model.get('p_task'));
                } else {
                    $("#btn-colltask_detail-back").attr('href', '#colltask');
                };
                $("#colltask_detail-content").html(self.template(render_data));
                $("#colltask_detail-content").trigger('create');
                return this;

            },
            bind_event: function() {
                var self = this;
                $("#colltask_detail-content").on('change', 'textarea', function(event) {
                    event.preventDefault();
                    var $this = $(this);
                    var field = $this.data('field');
                    var value = $this.val();
                    if (field == 'comments') { //增加一条新的留言
                        var new_comment = {
                            comment: value,
                            people_name: $("#login_people_name").val(),
                            position_name: $("#login_position_name").val(),
                            avatar: $("#login_avatar").val(),
                            creator: $("#login_people").val(),
                            createDate: new Date()
                        };
                        self.model.attributes.comments.push(new_comment);
                        self.model.attributes.comments = _.sortBy(self.model.attributes.comments, function(x) {
                            return -(new Date(x.createDate));
                        })
                        self.model.save().done(function() {
                            self.render();
                        })
                    };

                });
                $("#colltask_detail-footer")
                    .on('click', '#btn-colltask_detail-remove', function(event) {
                        event.preventDefault();
                        if (confirm('确认删除本任务吗？')) { //确认是否删除
                            var coll = self.model.collection;
                            coll.remove(self.model);
                            coll.trigger('sync');

                            self.model.destroy().done(function() {
                                alert('任务删除成功');
                                window.location.href='#colltask';
                                
                            })
                        };
                    })
                    .on('click', '#btn-colltask_detail-complete', function(event) {
                        event.preventDefault();
                        self.model.set('isfinished', true);
                        self.model.save().done(function() {
                            alert('任务已标记为完成');
                            window.location.href='#colltask';
                            
                        })
                    });

            },

        });

        // Returns the View class
        return CollTaskDetailView;

    });