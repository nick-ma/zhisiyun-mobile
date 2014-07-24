// MyTeam List View 
// =================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "moment"],
    function($, _, Backbone, Handlebars) {

        // Extends Backbone.View
        var MyTeamListView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                this.template = Handlebars.compile($("#hbtmp_myteam_list_view").html());
                // The render method is called when MyTeamList Models are added to the Collection
                // this.collection.on("sync", this.render, this);
                this.view_filter = 'myteam'; //过滤条件(默认是一级下属)
                this.bind_event();
            },

            // Renders all of the MyTeamList models on the UI
            render: function() {
                var self = this;
                // var rendered = [];
                var tmp = _.sortBy(_.map(this.collection.models, function(x) {
                    return x.toJSON();
                }), function(x) {
                    return x.people_no
                });
                //计算数量
                var count = {
                    myteam: 0,
                    myteam2: 0,
                    myteama: 0,
                }
                _.each(tmp, function(x) {
                    if (x.myteam) {
                        count.myteam++;
                    } else if (x.myteam2) {
                        count.myteam2++;
                    } else if (x.myteama) {
                        count.myteama++;
                    };
                })

                var people = _.filter(tmp, function(x) {
                    return x[self.view_filter];
                });
                _.each($("#myteam_list-left-panel label"), function(x) {
                    $(x).find('span').html(count[$(x).data('filter')])
                })

                $("#myteam_list-content").html(self.template({
                    people: people
                }));
                $("#myteam_list-content").trigger('create');
                return this;

            },
            bind_event: function() {
                var self = this;
                $("#myteam_list")
                    .on('swiperight', function(event) { //向右滑动，打开左边的面板
                        event.preventDefault();
                        $("#myteam_list-left-panel").panel("open");
                    })
                    .on('change', '#myteam_list-left-panel input[name=myteam_filter]', function(event) {
                        event.preventDefault();
                        var $this = $(this);
                        self.view_filter = $this.val();
                        self.render();
                        $("#myteam_list-left-panel").panel("close");
                        // console.log($this.val());
                    })
            }

        });

        // Returns the View class
        return MyTeamListView;

    });