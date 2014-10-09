// MyTeam List View 
// =================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "moment"],
  function($, _, Backbone, Handlebars) {

    // Extends Backbone.View
    var LambdaListView = Backbone.View.extend({

      // The View Constructor
      initialize: function() {
        this.template = Handlebars.compile($("#hbtmp_talent_lambda_list_view").html());
        // this.collection.on("sync", this.render, this);
        this.bind_event();
      },

      // Renders all of the MyTeamList models on the UI
      render: function() {
        var self = this;
        var tmp = _.sortBy(_.map(this.collection.models, function(x) {
          return x.toJSON();
        }), function(x) {
          return x.people_no
        });
        //人才对比localStrorage;
        var people_arr = JSON.parse(localStorage.getItem("lambda_helper")) || null;
        // localStorage.removeItem('lambda_helper'); //用完删掉

        if (people_arr) {
          tmp = _.filter(tmp, function(temp) {
            return !!~people_arr.indexOf(String(temp._id));
          })
        }
        $("#talent_lambda_list-content").html(self.template({
          people: tmp
        }));
        $("#talent_lambda_list-content").trigger('create');
        return this;

      },
      bind_event: function() {
        var self = this;
        $("#talent_lambda_list").on('change', 'input[class="lambda_data"]', function(event) {
          event.preventDefault();
          var current_val = $(this).val();
          var people = $(this).data("people");
          if (current_val == 'A') {
            $("#lambda_data_a").show();
            $("#lambda_data_b").hide();
            $("#lambda_data_c").hide();

            self.c_assessment.url = '/admin/pm/assessment_instance/get_my_assessments_4m?people=' + people + '&ct=' + (new Date()).getTime();
            self.c_assessment.fetch().done(function() {
              self.render();
            })

          } else if (current_val == 'B') {
            $("#lambda_data_b").show();
            $("#lambda_data_a").hide();
            $("#lambda_data_c").hide();

            self.c_competency.model = self.c_competency.get(people)
            self.c_competency.model.fetch().done(function() {
              self.render();

            })

          } else if (current_val == 'C') {
            $("#lambda_data_c").show();
            $("#lambda_data_a").hide();
            $("#lambda_data_b").hide();

            // self.c_talent.get(people);
            self.c_talent.model = self.c_talent.get(people)
            self.c_talent.model.fetch().done(function() {
              self.render();

            })
          }
        })
      }

    });

    // Returns the View class
    return LambdaListView;

  });