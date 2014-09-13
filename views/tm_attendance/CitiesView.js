// CollTask List View
// =================

// Includes file dependencies
define(["jquery", "underscore", "backbone", "handlebars", "moment"],
    function($, _, Backbone, Handlebars, moment) {
        function save_form_data(single_city, wf_data, type, cb) {
            var url = '/admin/tm/work_travel/edit_formdata';
            var leaves = wf_data.leave.data;
            var leave_id = wf_data.leave._id;
            if (type == 'save') {
                var destinations = wf_data.leave.destination || [];
                var temp_destinations = [];

                if (destinations.length > 0) {
                    _.each(destinations, function(x) {
                        temp_destinations.push({
                            "city_name": x.city_name,
                            "city": x.city,
                            "city_code": x.city_code,
                            "province_name": x.province_name,
                            "province": x.province
                        });
                    })
                    temp_destinations.push({
                        "city_name": single_city.city_name,
                        "city": single_city._id,
                        "city_code": single_city.city_code,
                        "province_name": single_city.province.province_name["zh"],
                        "province": single_city.province._id
                    });
                } else {

                    temp_destinations.push({
                        "city_name": single_city.city_name,
                        "city": single_city._id,
                        "city_code": single_city.city_code,
                        "province_name": single_city.province.province_name["zh"],
                        "province": single_city.province._id
                    });
                }
            } else if (type == 'delete') {
                var temp_destinations = single_city;
            }


            // self.wf_data.leave.destinations = destinations;
            var obj = {
                leaves: JSON.stringify(leaves),
                leave_id: leave_id,
                destinations: JSON.stringify(temp_destinations),
                reason: wf_data.leave.reason || '',
                hours: null,
                create_start_date: null,
                create_end_date: null
            }
            post_data = _.extend(obj, {});
            $.post(url, post_data, function(data) {
                cb(temp_destinations)
            })
        }
        // Extends Backbone.View
        var CitiesView = Backbone.View.extend({

            // The View Constructor
            initialize: function() {
                var self = this;
                $("#show_destinations").find("a[id='go_back']").attr("href", self.back_url);
                this.template = Handlebars.compile($("#wf_three_destinations_view").html());
                this.list_template = Handlebars.compile($("#wf_three_destinations_list_view").html());
                self.city_name = null;
                // The render method is called when CollTask Models are added to the Collection
                this.bind_event();
            },

            // Renders all of the CollTask models on the UI
            render: function() {
                var self = this;
                if (self.page_mode == 'destination_selected' || !self.page_mode) {
                    $("#show_destinations-content").html(self.template({
                        cities: self.wf_data.leave.destination
                    }));
                    $("#show_destinations-content").trigger('create');
                    $("#show_destinations").find("fieldset[id='is_show_filter']").hide();
                } else if (self.page_mode == 'show_cities') {
                    $("#show_destinations-content").html(self.list_template(self.wf_data));
                    $("#show_destinations-content").trigger('create');
                    $("#show_destinations").find("fieldset[id='is_show_filter']").show();
                }

                return this
            },
            bind_event: function() {
                var self = this
                $("#show_destinations")
                    .on('click', '#destination_selected', function(event) {
                        event.preventDefault();
                        self.page_mode = 'destination_selected';
                        self.render();
                    }).on('click', '#show_cities', function(event) {
                        event.preventDefault();
                        self.page_mode = 'show_cities';
                        self.render();


                    })
                    .on('click', '#save_city_name', function(event) {
                        event.preventDefault();
                        var wf_data = self.wf_data;
                        var leave_id = $(this).data("_id");
                        var city_id = $(this).data("city_id");
                        var single_city = _.find(self.wf_data.cities, function(temp) {
                            return temp._id == String(city_id);
                        })
                        if (single_city) {
                            save_form_data(single_city, wf_data, 'save', function(data) {
                                self.wf_data.leave.destination = data;
                                self.wf_data.cities = _.filter(self.wf_data.cities, function(temp) {
                                    return temp._id != String(city_id)
                                })
                                self.render();
                            })
                        } else {
                            self.render();
                        }

                    })
                    .on('click', '#delete_city', function(event) {
                        event.preventDefault();
                        var wf_data = self.wf_data;
                        var leave_id = $(this).data("_id");
                        var city_id = $(this).data("city_id");
                        var destination = _.filter(self.wf_data.leave.destination, function(temp) {
                            return temp.city != String(city_id);
                        })
                        self.wf_data.leave.destination = destination;
                        save_form_data(destination, wf_data, 'delete', function(data) {
                            self.render();
                        })

                    })
            }
        });

        // Returns the View class
        return CitiesView;

    });