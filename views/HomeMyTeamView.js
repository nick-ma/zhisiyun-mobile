// MyTeam View 首页
// =============

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "moment"],
    function($, _, Backbone, Handlebars) {

        // Extends Backbone.View
        var MyTeamView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                this.template = Handlebars.compile($("#hbtmp_home_myteam_view").html());
                // The render method is called when MyTeam Models are added to the Collection
                this.collection.on("sync", this.render, this);

            },

            // Renders all of the MyTeam models on the UI
            render: function() {
                var self = this;
                // var rendered = [];
                var people = _.sortBy(_.compact(_.map(this.collection.models, function(x) {
                    if (x.get('myteam')) {
                        return x.toJSON();
                    }
                })), function(x) {
                    return x.people_no;
                });

                $("#home-myteam-num").html(people.length);
                $("#home-myteam-list").html(self.template({
                    people: people
                }));
                $("#home-myteam-list").trigger('create');
                return this;

            }

        });

        // Returns the View class
        return MyTeamView;

    });