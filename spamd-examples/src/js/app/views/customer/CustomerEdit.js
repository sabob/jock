define(function(require) {

    var $ = require("jquery");
    var template = require("hb!./CustomerEdit.htm");
    var te = require("jock/template/template-engine");
    var viewManager = require("jock/view/view-manager");
    var domUtils = require("../../util/dom-utils");
    require("domReady!");

    function customerEdit() {

        var that = {};

        that.onInit = function(container, options) {
            if (options.params.id == null) {
                container.cancel();
                return;
            }

            var customerId = options.params.id;

            var promise = $.ajax("/data/customer" + customerId + ".json");
            promise.then(function(customer) {

                var html = renderTemplate(customer);

                container.attach(html).then(function() {
                    onAttached(customer);
                });
            }, function(e, status, msg) {
                console.log(status, msg);
            });
        };

        function onSave(e, origCustomer) {
            e.preventDefault();
            var customer = $("#form").toObject();
            domUtils.clearAlerts();
            domUtils.alertSuccess("Customer '" + customer.name + "' saved!");
        }
        
         function onBack(e, origCustomer) {
            e.preventDefault();
            var CustomerSearch = require("./CustomerSearch");
            viewManager.showView({view: CustomerSearch});
        }

        function renderTemplate(customer) {
            var actions = {
                save: onSave,
                back: onBack
            };
            var html = te.render(template, {'customer': customer}, actions);
            return html;
        }

        function onAttached(customer) {
            $("#form").fromObject(customer);
        }

        return that;
    }
    return customerEdit;
});