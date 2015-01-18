define(function (require) {

	var $ = require("jquery");
	var template = require("text!./CustomerSearch.html");
	require("domReady!");

	function customerSearch() {

		var that = {};

		that.onInit = function (options) {
			var promise = $.ajax("/data/customers.json");

			var viewPromise = $.Deferred();

			promise.then(function (data) {
				var view = createView(data);

				viewPromise.resolve(view);
			}, function () {
				viewPromise.reject();
			});

			/*
			 container.overwrite.then(function (view) {
			 console.error("Overwritten customers, aborting AJAX");
			 // Code below is not necessary since container.tracker cancels registered AJAX when request is overwritten
			 promise.abort();
			 });*/
			return viewPromise;
		};

		function createView(data) {
			var view = {
				template: template,
				model: {
					customers: data,
					onEdit: function (e, model) {
						e.preventDefault();
						console.log("EDIT CALLED", model.customer, model.index);
					},
					onDelete: function (e, obj) {
						e.preventDefault();
						console.log("DELETE CALLED", obj.customer, obj.index);
						//items.pop();
					}
				}
			};

			return view;
		}

		that.onEdit = function (e, customer) {
			e.preventDefault();
		}

		that.onDelete = function (e, customer) {
			e.preventDefault();
			console.log("Delete", customer);
		}

		function renderTemplate(customers) {
			var html = te.render({
				template: template,
				context: {'customers': customers},
				actions: that});
			return html;
		}

		function onAttached() {

		}

		return that;
	}
	return customerSearch;
});