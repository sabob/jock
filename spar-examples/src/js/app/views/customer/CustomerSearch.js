define(function (require) {

	var $ = require("jquery");
	var template = require("rvc!./CustomerSearch");
	require("domReady!");

	function customerSearch() {

		var that = {};

		that.onInit = function (options) {
			var promise = $.ajax("/data/customers.json");
			//container.tracker.add(promise);

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

			var view = template.extend({
				data: {customers: data},
				onEdit: function (e, val) {
					e.original.preventDefault();
					console.log("EDIT CALLED", e, val);
				},
				onDelete: function (e, val) {
					e.original.preventDefault();
					console.log("DELETE CALLED", e, val);
				}
			});
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