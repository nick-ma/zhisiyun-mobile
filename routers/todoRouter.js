// todo router
// ====================

define(["jquery", "backbone", "handlebars", "lzstring",
        "../views/ToDoListView", "../collections/ToDoListCollection",
    ],
    function($, Backbone, Handlebars, LZString,
        ToDoListView, ToDoListCollection
    ) {

        var ToDoRouter = Backbone.Router.extend({
            initialize: function() {
                var self = this;
                // self.init_models();
                self.init_collections();
                self.init_views();
                self.init_data();
                // self.bind_events();
                console.info('app message: todo router initialized');
                // Backbone.history.start();
            },
            routes: {
                //我的待办
                "todo": "todo_list",
            },
            todo_list: function() { //我的待办
                var self = this;
                if (self.todoListView.collection.length) {
                    self.todoListView.render();
                } else {
                    self.todoListView.collection.fetch().done(function() {
                        self.todoListView.render();
                    })
                }
                $("body").pagecontainer("change", "#todo_list", {
                    reverse: false,
                    changeHash: false,
                });
            },
            init_views: function() {
                var self = this;
                this.todoListView = new ToDoListView({
                    el: "#todo_list",
                    collection: self.todoList
                })
            },
            init_collections: function() {
                var self = this;
                self.todoList = new ToDoListCollection();
            },
            init_data: function() {
                // var self = this;
                this.todoList.fetch();
            },
        });

        return ToDoRouter;
    })