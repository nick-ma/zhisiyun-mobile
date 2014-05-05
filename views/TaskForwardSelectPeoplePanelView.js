// Task Forward Select People Panel View
// =========================================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "moment", "models/TaskModel", "async"], function($, _, Backbone, Handlebars, moment, TaskModel, async) {

    // Extends Backbone.View
    var TaskForwardSelectPeoplePanelView = Backbone.View.extend({
        // The View Constructor
        initialize: function() {
            this.template = Handlebars.compile($("#hbtmp_people_select_view").html());
            // this.bind_events();
            // The render method is called when Task Models are added to the Collection
            this.collection.on("sync", this.render, this);

        },

        // Renders all of the Task models on the UI
        render: function() {
            var self = this;
            // self.c_people = people;
            // var people_template = Handlebars.compile($("#hbtmp_people_select_view").html());
            // var people_panel_content = '<ul data-role="listview" data-theme="a" data-divider-theme="b" data-filter="true" data-autodividers="true" data-filter-placeholder="工号、姓名、职位、部门、公司">' + _.map(people.models, function(x) {
            //     var ret = [];
            //     // ret.push('<li data-role="controlgroup">')
            //     ret.push('<input type="checkbox" name="cb_' + x.get('_id') + '" id="cb_' + x.get('_id') + '">')
            //     ret.push('<label for="cb_' + x.get('_id') + '">' + x.get('people_name') + '</label>')
            //     // ret.push('</li>')

            //     return ret.join('');
            // }).join('') + '</ul>';
            var people_data = _.map(self.collection.models, function(x) {
                return x.toJSON();
            });
            people_data = _.sortBy(people_data, function(x) {
                return x.myteam && x.fl && x.people_no;
            })
            // people_data = _.sortBy(people_data, function(x) {
            //     return x.fl;
            // })
            // var people_data = _.sortBy(_.map(self.collection.models, function(x) {
            //     return x.toJSON();
            // }), function(x) {
            //     return x.myteam;
            // })
            $("#panel-fwd-people").html(self.template({
                people: people_data
            })).trigger('create');
            // $("#btn-task-edit").attr('href', "#task_edit/" + self.model.get('_id'));
            // $("#task_forward-content").html(self.template(self.model.attributes));
            // $("#task_forward-content").trigger('create');

            // $("#btn-task_forward-back").attr('href', '#task/' + self.model.get('_id'));
            // Maintains chainability
            return this;

        },

    });

    // Returns the View class
    return TaskForwardSelectPeoplePanelView;

});