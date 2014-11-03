// Contact Detail View
// ===================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars"],
    function($, _, Backbone, Handlebars) {

        // Extends Backbone.View
        var TrainRecordListView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                this.template = Handlebars.compile($("#hbtmp_talent_train_record_list_view").html());
                // The render method is called when People Models are added to the Collection
                this.loading_template = Handlebars.compile($("#loading_template_view").html());

                // this.collection.on("sync", this.render, this);
                this.bind_event();
            },
            pre_render: function() {
                var self = this;
                $("#talent_train_record-content").html(self.loading_template({
                    info_msg: '数据加载中...请稍候'
                }));
                $("#talent_train_record-content").trigger('create');
                return this;
            },
            // Renders all of the People models on the UI
            render: function() {

                var self = this;
                var record_data = _.map(self.collection.models, function(x) {
                    return x.toJSON()
                })

                var obj = {
                    record_data: record_data,
                    type: self.type,
                };
                if (self.type != 'A') {
                    var filter_people = _.filter(record_data, function(x) {
                        return !!~self.myteam.indexOf(String(x.people._id))
                    })
                    var avatar_id_obj = {},
                        people_id = [];
                    _.each(filter_people, function(x) {
                        avatar_id_obj[x.people._id] = x.people.avatar;
                        if (!~people_id.indexOf(String(x.people._id))) {
                            people_id.push(String(x.people._id))

                        }
                    })
                    obj.people_id = people_id
                    obj.avatar_id_obj = avatar_id_obj;
                }
                $("#talent_train_record-content").html(self.template(obj));
                $("#talent_train_record-content").trigger('create');
                return this;

            },

            bind_event: function() {
                var self = this;
                $("#talent_train_record").on('click', '.talent_train_record_view_mode', function(event) {
                    event.preventDefault();
                    var select = $(this).data("select");
                    window.location = "/m#train_record/" + select;

                })
            }

        });

        // Returns the View class
        return TrainRecordListView;

    });