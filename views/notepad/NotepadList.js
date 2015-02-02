// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "moment"],
    function($, _, Backbone, Handlebars, moment) {
        // Extends Backbone.View
        var NotepadListView = Backbone.View.extend({
            // The View Constructor
            initialize: function() {
                var self = this;

                this.template = Handlebars.compile($("#np_view").html());
                this.loading_template = Handlebars.compile($("#loading_template_view").html());
                this.search_term = '';
                // The render method is called when CollTask Models are added to the Collection
                this.bind_event();
            },
            pre_render: function() {
                var self = this;
                $("#np_list-content").html(self.loading_template({
                    info_msg: '数据加载中...请稍候'
                }));
                $("#np_list-content").trigger('create');
                return this;
            },
            render: function() {
                var self = this;

                var rendered_data = {
                    nps: []
                };
                var nps_tmp = [];
                _.each(self.collection.models, function(x) {
                    nps_tmp.push(x.attributes);
                })

                //根据条件进行过滤
                if (self.search_term) {
                    // var nps_tmp1 = [];
                    // var nps_tmp2 = [];
                    var st = /./;
                    st.compile(self.search_term);
                    // nps_tmp1 = _.filter(nps_tmp, function(x) {
                    //     return st.test(x.content);
                    // })

                    nps_tmp = _.filter(nps_tmp, function(x) {
                        var tags_str = '';
                        _.each(x.tags,function(xx){
                            tags_str += xx + ',';
                        })
                        return st.test(tags_str) || st.test(x.content);
                    })

                    // var nps_tmp = [];
                    // _.each(nps_tmp1,function(x){
                    //     nps_tmp.push(x);
                    // })
                    // _.each(nps_tmp2,function(x){
                    //     nps_tmp.push(x);
                    // })
                };

                rendered_data.nps = _.sortBy(nps_tmp, function(x) {
                    return -moment(x.lastModified);
                })
                rendered_data.search_term = self.search_term;
                $("#np_list-content").html(self.template(rendered_data));
                $("#np_list-content").trigger('create');
                return this
            },
            bind_event: function() {
                var self = this;
                $("#np_view_list")
                    .on('click', '#np_ceate', function(event) {
                        event.preventDefault();

                        $.mobile.loading("show");

                        // $.post('/admin/im/bb/' + null, {
                        //     msg_theme: '新建通知',
                        //     np_format: 'plain'
                        // }, function(data) {
                        //     window.location.href = '#np_view_S/' + data._id
                        //     $.mobile.loading("hide");

                        // })
                        var new_np = {
                            people: self.people,
                            people_name: self.people_name,
                            content: '新建的备忘录',
                            source_people: null,
                            source_people_name: '',
                            createDate: new Date(),
                            lastModified: new Date(),
                        };
                        var np = self.collection.add(new_np);

                        np.save().done(function() {
                            window.location.href = '#np_view/' + np.attributes._id
                            $.mobile.loading("hide");
                        })
                    })
                    .on('change', '#search_memo', function(event) {
                        event.preventDefault();

                        var $this = $(this);
                        self.search_term = $this.val();
                        self.render();
                    })
            }
        });

        // Returns the View class
        return NotepadListView;

    });