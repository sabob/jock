define(function(require) {

    var $ = require("jquery");
    var template = require("hb!./CustomerSearch.htm");
    var te = require("spamd/template/template-engine");
    var viewManager = require("spamd/view/view-manager");
    var CustomerEdit = require("./CustomerEdit");
    require("domReady!");

    function customerSearch() {

        var that = {};

        that.onInit = function(container, args) {

            var promise = $.ajax("/data/customers.json");
            promise.then(function(data) {

                var html = renderTemplate(data);
                
                //console.log("about to attach");
                container.attach(html).then(function() {
                    console.log("onAttached THEN");
                    onAttached(args);
                });
                
                container.visible.then(function() {
                    console.log("onVisible THEN");
                    onAttached(args);
                });
            });
        };

        function onEdit(e, customer) {
            e.preventDefault();
            //console.log("Edit", customer);
            viewManager.showView({view: CustomerEdit, params: {id: customer.id}, args: {customer: customer}});
        }

        function onDelete(e, customer) {
            e.preventDefault();
            //console.log("Delete", customer);
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