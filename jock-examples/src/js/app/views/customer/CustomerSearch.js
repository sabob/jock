define(function (require) {

    var $ = require("jquery");
    var template = require("hb!./CustomerSearch.htm");
    var te = require("jock/template/template-engine");
    var viewManager = require("jock/view/view-manager");
    var CustomerEdit = require("./CustomerEdit");
    require("domReady!");

    function customerSearch() {

        var that = {};

        that.onInit = function (container, args) {

            var promise = $.ajax("/data/customers.json");
            container.tracker.add(promise);
            promise.then(function (data) {

                var html = renderTemplate(data);
                container.attach(html).then(function () {
                    onAttached(args);
                });

                container.visible.then(function () {
                    onAttached(args);
                });
            });

            container.overwrite.then(function (view) {
                console.error("Overwritten customers, aborting AJAX");
                // Code below is not necessary since container.tracker cancels registered AJAX when request is overwritten
                promise.abort();
            });
        };

        that.onEdit = function (e, customer) {
            e.preventDefault();
            //console.log("Edit", customer);
            viewManager.showView({view: CustomerEdit, params: {id: customer.id}, args: {customer: customer}});
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