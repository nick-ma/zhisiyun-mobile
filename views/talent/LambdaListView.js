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
        this.loading_template = Handlebars.compile($("#loading_template_view").html());

        // this.collection.on("sync", this.render, this);
        this.bind_event();
      },
      pre_render: function() {
        var self = this;
        $("#talent_lambda_list-content").html(self.loading_template({
          info_msg: '数据加载中...请稍候'
        }));
        $("#talent_lambda_list-content").trigger('create');
        return this;
      },
      // Renders all of the MyTeamList models on the UI
      render: function() {
        var self = this;
        // console.log(self)
        var competency = self.c_competency;
        var talent = _.map(self.c_talent.models, function(x) {
          return x.toJSON();
        })
        var assessment = _.map(self.c_assessment.models, function(x) {
          return x.toJSON();
        })
        var tmp = _.sortBy(_.map(this.collection.models, function(x) {
          return x.toJSON();
        }), function(x) {
          return x.people_no
        });
        //人才对比localStrorage;
        var people_arr = JSON.parse(localStorage.getItem("lambda_helper")) || null;
        // localStorage.removeItem('lambda_helper'); //用完删掉
        self.twitter_people = tmp

        if (people_arr) {
          tmp = _.filter(tmp, function(temp) {
            return !!~people_arr.indexOf(String(temp._id));
          })
          self.twitter_people = tmp
        }
        _.each(tmp, function(x) {
          var single_competency = _.filter(competency, function(temp) {
            return x._id == String(temp.people_id)
          })
          // console.log(single_competency)
          // x.competency = single_competency;
          if (single_competency) {
            var scores = [],
              repeat_id = [];
            _.each(single_competency, function(L1) {
              if (!~repeat_id.indexOf(String(L1.qi_id))) {
                scores.push(L1)
              }
              repeat_id.push(String(L1.qi_id))

            })
            x.competency = scores;
          }

          var single_talent = _.find(talent, function(temp) {
            return x._id == String(temp.people_id)
          })
          x.talent = single_talent ? single_talent.lambda_data : '';
        })
        // console.log(tmp)
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
            $.mobile.loading("show");

            self.c_assessment.url = '/admin/pm/assessment_instance/get_my_assessments_4m?people=' + people + '&ct=' + (new Date()).getTime();
            self.c_assessment.fetch().done(function() {
              var single_people = _.find(self.collection.models, function(temp) {
                return temp.attributes._id == String(people)
              })
              single_people.attributes.assessment = _.map(self.c_assessment.models, function(x) {
                return x.toJSON();
              })
              self.render();
              $.mobile.loading("hide");

              $("#lambda_data_a" + people).show();
              $("#lambda_data_b" + people).hide();
              $("#lambda_data_c" + people).hide();
            })

          } else if (current_val == 'B') {
            $("#lambda_data_b" + people).show();
            $("#lambda_data_a" + people).hide();
            $("#lambda_data_c" + people).hide();
          } else if (current_val == 'C') {
            $("#lambda_data_c" + people).show();
            $("#lambda_data_a" + people).hide();
            $("#lambda_data_b" + people).hide();
          }
        }).on('click', '#btn-people_select-ok', function(event) {
          event.preventDefault();

          var people_selected = self.twitter_people;
          if (people_selected.length > 0) {
            if (confirm("确认启动人才提名流程吗？")) {
              var twitter_data = [],
                peoples = [];
              _.each(people_selected, function(x) {
                var obj = {};
                obj.people = x._id;
                obj.position = x.position;
                peoples.push(x._id);
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
        }).on('click', 'img', function(event) {
          event.preventDefault();
          // var img_view = '<div class="img_view" style="background-image:url('+this.src+')"></div>';
          var img_view = '<img src="' + this.src + '">';
          // img_view += '<a href="'+this.src.replace('get','download')+'" target="_blank">保存到本地</a>';
          $("#fullscreen-overlay").html(img_view).fadeIn('fast');
        }).on('click', '#btn_delete', function(event) {
          event.preventDefault();
          var people = $(this).data("people");
          var people_arr = JSON.parse(localStorage.getItem("lambda_helper")) || null;
          if (people_arr) {
            people_arr = _.filter(people_arr, function(x) {
              return x != String(people)
            })
            localStorage.setItem("lambda_helper", JSON.stringify(people_arr));
            self.collection.models = _.filter(self.collection.models, function(temp) {
              return !!~people_arr.indexOf(String(temp.attributes._id));
            })
            self.render();
          } else {
            self.collection.models = _.filter(self.collection.models, function(temp) {
              return String(people) != temp.attributes._id;
            })
            self.render();

          }
          // alert(people)
        })
      }

    });

    // Returns the View class
    return LambdaListView;

  });