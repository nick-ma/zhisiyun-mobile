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
                        return im.r_user.people == self.people || !im.r_user
                    }))

                    obj.im_type = 'R'
                } else {
                    $("#im_view_list #send_list").addClass('ui-btn-active')


                    var items = _.filter(self.collection.toJSON(), function(im) {
                        var people_id = im.s_user ? im.s_user.people : null;
                        return people_id == self.people
                    })


                    var goups = _.groupBy(items, function(it) {
                        return it.msg_theme + '-' + it.msg_type
                    })
                    _.each(goups, function(ys, k) {
                        obj.ims.push(_.first(ys))

                    })
                    console.log(obj.ims)
                    obj.ims = sort_im(obj.ims)
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
                    })
            }
        });

        // Returns the View class
        return ImListView;

    });