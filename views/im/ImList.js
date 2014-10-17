// CollTask List View
// =================

// Includes file dependencies

define(["jquery", "underscore", "backbone", "handlebars", "moment"],
    function($, _, Backbone, Handlebars, moment) {

        function sort_im(items) {
            var sorts = _.sortBy(items, function(it) {
                return it.s_date
            })
            return sorts.reverse()
        }

        Handlebars.registerHelper('im_rp', function(data) {
            var str = data
            if (data == 'root' || !data) {
                str = '系统通知';
            }
            return str
        });
        // Extends Backbone.View
        var ImListView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                var self = this;
                this.template_im = Handlebars.compile($("#im_view").html());
                this.loading_template = Handlebars.compile($("#loading_template_view").html());
                // The render method is called when CollTask Models are added to the Collection
                this.bind_event();
                this.model_view = '0';
            },
            pre_render: function() {
                var self = this;
                $("#im_list-content").html(self.loading_template({
                    info_msg: '数据加载中...请稍候'
                }));
                $("#im_list-content").trigger('create');
                return this;
            },
            render: function() {
                var self = this;
                var obj = {};
                obj.ims = []
                if (self.model_view == '0') {
                    $("#im_view_list #receive_list").addClass('ui-btn-active')
                    obj.ims = sort_im(_.filter(self.collection.toJSON(), function(im) {
                        return im.msg_mark == 'R'
                    }))

                    obj.im_type = 'R'
                } else {
                    $("#im_view_list #send_list").addClass('ui-btn-active')
                    var items = sort_im(_.filter(self.collection.toJSON(), function(im) {
                        return im.msg_mark == 'S'
                    }))
                    obj.ims = items
                    obj.im_type = 'S'
                }
                $("#im_list-content").html(self.template_im(obj));
                $("#im_list-content").trigger('create');
                return this
            },
            bind_event: function() {
                var self = this;
                $("#im_view_list")
                    .on('click', '#receive_list', function(event) {
                        event.preventDefault();
                        self.model_view = '0';
                        self.render()
                    })
                    .on('click', '#send_list', function(event) {
                        event.preventDefault();
                        self.model_view = '1';
                        self.render()
                    }).on('click', '#im_ceate', function(event) {
                        event.preventDefault();
                        if (confirm('确定新建通知 ？')) {
                            $.mobile.loading("show");
                            $.post('/admin/im/bb/' + null, {
                                msg_theme: '新建通知',
                                im_format: 'plain'
                            }, function(data) {
                                window.location.href = '#im_view_S/' + data._id
                                $.mobile.loading("hide");

                            })

                        };
                    }).on('click', '.open-left-panel', function(event) {
                        event.preventDefault();
                        $("#show_im-left-panel").panel("open");
                    }).on('swiperight', function(event) { //向右滑动，打开左边的面板
                        event.preventDefault();
                        $("#show_im-left-panel").panel("open");
                    }).on('click', '#btn-im_showh-change_view', function(event) {
                        event.preventDefault();
                        window.location.href = '#im_list'
                        $("#show_im-left-panel").panel("close");
                    }).on('click', '#btn-moblie_resource-change_view', function(event) {
                        event.preventDefault();
                        window.location.href = '#mobile_resource'
                        $("#show_im-left-panel").panel("close");
                    })
            }
        });

        // Returns the View class
        return ImListView;

    });