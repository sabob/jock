define(function (require) {
	var $ = require("jquery");
	var Ractive = require("ractive");
	require('ractive-transitions-fade');
	//var HomeRactive = require("rvc!./Home2");
	var template = require("text!./Home2.html");
	var Isotope = require("app/plugins/isotope/isotope.pkgd");

	function Home2() {

		var templateInstance;

		// This example displays an address form, using the autocomplete feature
// of the Google Places API to help users fill in the information.

		var placeSearch, autocomplete;
		var componentForm = {
			street_number: 'short_name',
			route: 'long_name',
			locality: 'long_name',
			sublocality_level_1: 'long_name',
			administrative_area_level_1: 'long_name',
			country: 'long_name',
			postal_code: 'short_name'
		};

		function initialize() {
			// Create the autocomplete object, restricting the search
			// to geographical location types.
			/*
			 autocomplete = new google.maps.places.Autocomplete(
			 (document.getElementById('autocomplete')),
			 {types: ['geocode']});
			 // When the user selects an address from the dropdown,
			 // populate the address fields in the form.
			 google.maps.event.addListener(autocomplete, 'place_changed', function () {
			 fillInAddress();
			 });
			 */
		}

// [START region_fillform]
		function fillInAddress() {
			// Get the place details from the autocomplete object.
			var place = autocomplete.getPlace();

			for (var component in componentForm) {
				var node = document.getElementById(component);
				node.value = '';
				node.disabled = false;
			}

			// Get each component of the address from the place details
			// and fill the corresponding field on the form.
			for (var i = 0; i < place.address_components.length; i++) {
				var addressType = place.address_components[i].types[0];
				if (componentForm[addressType]) {
					var val = place.address_components[i][componentForm[addressType]];
					document.getElementById(addressType).value = val;
				}
			}
		}
// [END region_fillform]

// [START region_geolocation]
// Bias the autocomplete object to the user's geographical location,
// as supplied by the browser's 'navigator.geolocation' object.
		function geolocate() {
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(function (position) {
					var geolocation = new google.maps.LatLng(
							position.coords.latitude, position.coords.longitude);
					autocomplete.setBounds(new google.maps.LatLngBounds(geolocation,
							geolocation));
				});
			}
		}
// [END region_geolocation]

		var that = this;

		var items = [{val: 0}, {val: 1}];

		that.onInit = function (options) {
			//console.log("args", options);

			//if (templateInstance == null) {
			var view = createView();
			//}
			return view;
		};

		that.onRemove = function (options) {
			var num = getRandomInt(0, 3);
			//console.log("ON_REMOVE called", num);
			var def = $.Deferred();
			//setTimeout(function() {
			if (num == 0 || num == 2) {
				//console.error("RES")
				def.resolve();
			} else {
				//def.reject();
				def.resolve();
			}
			//}, 1000);
			return def.promise();
			//return true;
			//return (num == 0 || num == 2);
		};

		function getRandomInt(min, max) {
			return Math.floor(Math.random() * (max - min)) + min;
		}

		// Commented to shows how on Destroy could be used to cancel showing a new view

		that.onComplete = function (options) {
			//console.log("HOME2 ON_COMPLETE called")
		};

		function createView() {

			var view = {
				template: template,
				model: {
					users: {name : "World"},
					items: items,
					user: {firstname: "bob", lastname: "smith"},
					add: function (e, model) {
						console.log("ADD CALLED", model.item, model.index);
						items.push({val: 2});
						//this.push("items", {val: 3});
						//var user = this.get("user");
						//console.log(user);
						console.log(model.user.firstname);
						model.user.firstname = "okok"
					},
					remove: function (e, obj) {
						console.log("REMOVE CALLED", obj.item, obj.index);
						obj.users.name = "john";
						items.pop();
						
						//items.push({val: 2});
						//this.pop("items");
						//var user = this.get("user");
						//console.log(user);
					}
				}
			};

			return view;
		}

		that.onRender = function (options) {
			//console.log("HOME2 ON_RENDER called")
			//console.log("HOME attached arg", options);
			//console.log("ractive", options.ractive);
			initialize();

			// TODO use home template before coninuing
			return;

			$("#radios").radiosToSlider();
			var iso = new Isotope('#isotope', {
				layoutMode: 'masonry',
				transitionDuration: '1s'
						//  layoutMode: 'fitRows'
						//layoutMode: 'fitColumns'
			});
			$('#radios').click(function (e) {
				//if($('').is(':checked')) { alert("it's checked"); }
				var $target = $(e.target);
				//console.log($target.attr("id"));
				var value = $target.data("radio");
				//var value  = $target.attr("id");
				if (value == null) {
					return; // Didn't click on a radio
				}

				// Turn value into a CSS selector
				if (value === 'fast') {
					value = '*';
				} else {
					value = '.' + value;
				}
				//console.log(value)

				iso.arrange({
					filter: value
				});
			});
		};

		return that;
	}
	return new Home2();
});
