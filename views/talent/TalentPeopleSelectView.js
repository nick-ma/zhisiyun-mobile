// PeopleSelectt View
// =================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars"],
    function($, _, Backbone, Handlebars) {
        // Extends Backbone.View
        var PeopleSelectView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                this.template = Handlebars.compile($("#hbtmp_people_select_view").html());
                this.bind_event();
            },

            // Renders all of the PeopleSelectels on the UI
            render: function() {

                var self = this;
                var myteam = _.filter(self.collection.models, function(x) {
                    return x.attributes.myteam;
                })
                var tmp = _.sortBy(_.map(myteam, function(x) {
                    return x.toJSON();
                }), function(x) {
                    return x.people_no
                });
                var render_data = {
                    people: tmp,
                    // cp_id: self.cp_id,
                }
                $("#talent_people_select-content").html(self.template(render_data));
                $("#talent_people_select-content").trigger('create');

                window.setTimeout(function() {
                    if ($("#talent_people_select-content input:checked").length && $("#talent_people_select-content input:checked").offset().top > 75) {
                        $.mobile.silentScroll($("#talent_people_select-content input:checked").offset().top - 95)
                    }
                }, 1000);
                return this;

            },
            bind_event: function() {
                var self = this;
                $("#talent_people_select").on('click', '#btn-people_select-back', function(event) {
                    event.preventDefault();
                    window.location.href = '#twitter_list';
                }).on('click', '#btn-people_select-ok', function(event) {
                    event.preventDefault();

                    var people_selected = _.map($("#talent_people_select-content input[type=checkbox]:checked"), function(x) {
                        return self.collection.get(x.value);
                    });
                    if (people_selected.length > 0) {
                        if (confirm("确认启动人才提名流程吗？")) {
                            var twitter_data = [],
                                peoples = [];
                            _.each(people_selected, function(x) {
                                var obj = {};
                                obj.people = x.attributes._id;
                                obj.position = x.attributes.position;
                                peoples.push(x.attributes._id);
                                twitter_data.push(obj)
                            })
                            var obj = {
                                peoples: peoples,
                                twitter_data: twitter_data,
                                superior: self.people
                            }

                            $.mobile.loading("show");
                            $("#btn-people_select-ok").attr("disabled", "disabled");
                            $.post('/admin/pm/talent_wf/wf_create', obj, function(data) {
                                var goto_url = (data.ti._id + '-' + data.pd._id + '-') + (data.pd ? data.pd.process_code : '');
                                console.log(goto_url);
                                window.location.href = '/m#godo10/' + goto_url + '/' + 1;
                                $.mobile.loading("hide");

                            })
                        }

                    } else {
                        alert("请选择提名人员!!!")
                    }
                }).on('click', '#btn-people_select-lambda', function(event) {
                    event.preventDefault();
                    var people_selected = _.map($("#talent_people_select-content input[type=checkbox]:checked"), function(x) {
                        return self.collection.get(x.value);
                    });
                    var people_arr = _.map(people_selected, function(temp) {
                        return temp.attributes._id
                    })
                    if (people_selected.length > 0) { //人才对比当地存储
                        localStorage.setItem('lambda_helper', JSON.stringify(people_arr)); //放到local storage里面，便于后面选择屏幕进行操作
                        window.location.href = "/m#lambda_list";
                    } else {
                        alert("请选择对比人才!!!")

                    }
                })

            },

        });

        // Returns the View class
        return PeopleSelectView;

    });