define(function(require) {

    var $ = require("jquery");
    var template = require("hb!./CustomerSearch.htm");
    var te = require("jock/template/template-engine");
    var viewManager = require("jock/view/view-manager");
    var CustomerEdit = require("./CustomerEdit");
    require("domReady!");

    function customerSearch() {

        var that = {};

        that.onInit = function(container, args) {

            var promise = $.ajax("/data/customers.json");
            container.tracker.add(promise);
            promise.then(function(data) {
                console.log("MOO")

                var html = renderTemplate(data);
                
                //console.log("about to attach");
                container.attach(html).then(function() {
                    onAttached(args);
                });
                
                container.visible.then(function() {
                    onAttached(args);
                });
            });
            
             container.overwrite.then(function(view) {
                console.error("Overwritten customers, aborting AJAX");
                // Cod ebelow is not necessary since container.tracker cancels registered AJAX when request is overwritten
                promise.abort();
            });
        };

        function onEdit(e, customer) {
            e.preventDefault();
            //console.log("Edit", customer);
            viewManager.showView({view: CustomerEdit, params: {id: customer.id}, args: {customer: customer}});
        }

        function onDelete(e, customer) {
            e.preventDefault();
            console.log("Delete", customer);
        }

        function renderTemplate(customers) {
            var actions = {
                edit: onEdit,
                remove: onDelete
            };
            var html = te.render(template, {'customers': customers}, actions);
            return html;
        }

        function onAttached() {

        }

        return that;
    }
    return customerSearch;
});