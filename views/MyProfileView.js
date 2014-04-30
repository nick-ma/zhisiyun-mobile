// MyProfile  View
// ===================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "models/PeopleModel"],
    function($, _, Backbone, Handlebars, PeopleModel) {

        // Extends Backbone.View
        var MyProfileView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                this.template = Handlebars.compile($("#hbtmp_myprofile_basic_view").html());
                // The render method is called when People Models are added to the Collection
                // this.collection.on("sync", this.render, this);

            },

            // Renders all of the People models on the UI
            render: function(m_competenty,m_talent) {
                var self = this;
                var render_data = self.model.toJSON();
                // console.log(m_talent);
                render_data.competencies = m_competenty.get('competencies')
                render_data.talent = m_talent.get('lambda_data')
                $("#myprofile_basic-content").html(self.template(render_data));
                $("#myprofile_basic-content").trigger('create');
                return this;
            }

        });

        // Returns the View class
        return MyProfileView;

    });