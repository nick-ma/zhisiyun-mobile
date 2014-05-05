// Task Forward View
// =================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "moment", "models/TaskModel", "async"], function($, _, Backbone, Handlebars, moment, TaskModel, async) {

    // Extends Backbone.View
    var TaskForwardView = Backbone.View.extend({
        // The View Constructor
        initialize: function() {
            this.template = Handlebars.compile($("#hbtmp_task_forward_view").html());
            this.bind_events();
            // The render method is called when Task Models are added to the Collection
            // this.model.on("sync", this.render, this);

        },

        // Renders all of the Task models on the UI
        render: function(people) {
            var self = this;
            self.c_people = people;
            // var people_template = Handlebars.compile($("#hbtmp_people_select_view").html());
            // var people_panel_content = '<ul data-role="listview" data-theme="a" data-divider-theme="b" data-filter="true" data-autodividers="true" data-filter-placeholder="工号、姓名、职位、部门、公司">' + _.map(people.models, function(x) {
            //     var ret = [];
            //     // ret.push('<li data-role="controlgroup">')
            //     ret.push('<input type="checkbox" name="cb_' + x.get('_id') + '" id="cb_' + x.get('_id') + '">')
            //     ret.push('<label for="cb_' + x.get('_id') + '">' + x.get('people_name') + '</label>')
            //     // ret.push('</li>')

            //     return ret.join('');
            // }).join('') + '</ul>';
            // var people_data = _.sortBy(_.map(people.models, function(x) {
            //     return x.toJSON();
            // }), function(x) {
            //     return x.fl;
            // })
            // $("#panel-fwd-people").html(people_template({
            //     people: people_data
            // })).trigger('create');
            // $("#btn-task-edit").attr('href', "#task_edit/" + self.model.get('_id'));
            $("#task_forward-content").html(self.template(self.model.attributes));
            $("#task_forward-content").trigger('create');

            $("#btn-task_forward-back").attr('href', '#task/' + self.model.get('_id'));
            // Maintains chainability
            return this;

        },

        bind_events: function() {
            var self = this;
            self.$el
            // .on('click', '#btn-task-select-receiver', function(event) {
            //     event.preventDefault();
            //     $("#panel-fwd-people").panel('open').trigger("updatelayout");
            // })
            .on('click', '#btn-task-send', function(event) {
                event.preventDefault();
                // console.log(self.model, $("#people-for-forward").val(), $("#task-comments").val());
                // $("#people-for-forward").val();
                // $("#task-comments").val();

                if ($("#people-for-forward").val() && confirm('确认转发吗？')) {
                    var people = $("#people-for-forward").val().split(',');
                    async.times(people.length, function(n, next) {
                        var new_task = self.model.clone();
                        delete new_task.id;
                        delete new_task.attributes._id;
                        new_task.attributes.people = people[n]; //对象
                        new_task.attributes.origin = '3'; //转发
                        new_task.attributes.forward_people = []; //truncate
                        if ($("#task-comments").val()) { //留言
                            new_task.attributes.comments = '来自' + $("#login_people_name").val() + '的转发留言:\n' + $("#task-comments").val();
                        };
                        // console.log(new_task);
                        new_task.save().done(function() {
                            next(null, 'ok');
                        })
                    }, function(err, result) {
                        self.model.set('forward_people',
                            _.union(self.model.get('forward_people'),
                                _.map(people, function(x) {
                                    var tmp = self.c_people.get(x).toJSON();
                                    return _.pick(tmp, '_id', 'avatar', 'people_name', 'company_name', 'ou_name', 'position_name', 'position');
                                }))).save().done(function() {
                            $("#people-for-forward").val(''); //转发成功完成后，清空这个隐藏域
                            alert('转发成功！')
                            self.render(self.c_people);
                        })
                    })

                } else {
                    alert('请选择需要转发的人')
                };
            });
            $("#task_forward").on('click', '#btn-task-select-receiver', function(event) {
                event.preventDefault();
                $("#panel-fwd-people").panel('open').trigger("updatelayout");
            });
            $("#panel-fwd-people").on("panelclose", function(event, ui) {
                var selected_people = _.map($("#panel-fwd-people input[type=checkbox]:checked"), function(x) {
                    return x.value;
                })
                $("#people-for-forward").val(selected_people.join(','));
                // console.log(selected_people);
                var ret = _.map(selected_people, function(x) {
                    var people = self.c_people.get(x);
                    return '<p>' + people.get('people_name') + '／' + people.get('position_name') + '／' + people.get('ou_name') + '</p>'
                })
                $("#new_receiver").html(ret.join(''));
            });
        }


    });

    // Returns the View class
    return TaskForwardView;

});