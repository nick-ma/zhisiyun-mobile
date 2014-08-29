// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars"],
    function($, _, Backbone, Handlebars) {
        var WorkReportDetailView = Backbone.View.extend({

            initialize: function() {
                var self = this;
                self.template = Handlebars.compile($("#tmp_wr_detail_view").html());

                self.bind_events();
            },
            bind_events: function() {
                var self = this;
                $("#wr_detail-content").on('change', 'textarea', function() {
                    var $this = $(this);
                    var val = $this.val();
                    var field = $this.data('field');

                    if (field == 'comment') {
                        var obj = {};
                        obj.people = $("#login_people").val();
                        obj.comment = val;
                        obj.comment_date = moment();
                        self.model.attributes.comments.push(obj);
                    } else {
                        self.model.set(field, val);
                    }
                });
                $("#wr_detail-content").on('click', '#btn_wr_ok', function() {
                    //保存时，重置populate的id
                    _.each(self.model.attributes.comments, function(x) {
                        if (!!x.people._id) {
                            x.people = x.people._id;
                        }
                    })
                    self.model.save().done(function() {
                        alert('保存成功');
                        self.model.fetch().done(function(){
                            self.render();
                        })
                    })
                });
                $("#wr_detail-content").on('click', '#btn_wr_submit', function() {
                    //保存评语时，重置populate的id
                    _.each(self.model.attributes.comments, function(x) {
                        if (!!x.people._id) {
                            x.people = x.people._id;
                        }
                    })
                    self.model.set('is_submit', true);
                    self.model.save().done(function() {
                        alert('提交成功!');
                        window.location.href = '#wrlist';
                    })
                });
            },
            // Renders all of the People models on the UI
            render: function() {
                var self = this;

                self.wr_detail_back_url = localStorage.getItem('wr_detail_back_url') || null;
                localStorage.removeItem('wr_detail_back_url'); //用完删掉 
                if (self.wr_detail_back_url) {
                    $("#btn-wr_detail-back").attr('href', self.wr_detail_back_url);
                }

                $("#wr_detail-content").html(self.template(self.model.attributes));
                $("#wr_detail-content").trigger('create');
                return this;
            },

        });

        // Returns the View class
        return WorkReportDetailView;

    });