define(function (require) {

    var $ = require("jquery");
    var template = require("hb!./CustomerEdit.htm");
    var te = require("jock/template/template-engine");
    var viewManager = require("jock/view/view-manager");
    var toastr = require("app/plugins/toastr");
    require("domReady!");

    function customerEdit() {

        var that = {};
        that.onInit = function (containerArg, options) {
            var container = containerArg;

            if (options.params.id == null) {
                container.cancel();
                return;
            }

            var customerId = options.params.id;

            var promise = $.ajax("/data/customer" + customerId + ".json");
            container.tracker.add(promise);
            promise.then(function (customer) {

                var html = renderTemplate(customer, container);

                container.attach(html).then(function () {
                    onAttached(customer);
                });
            });

            container.overwrite.then(function (view) {
                console.error("Overwritten customer, aborting AJAX");
                //promise.abort();
            });
        };

        that.onSave = function (e, origCustomer, options) {
            e.preventDefault();
            var valid = $("#form").validationEngine('validate');
            if (valid) {
                var customer = $("#form").toObject();
                var promise = $.ajax("/data/customer" + customer.id + ".json");
                var container = options.data.container;
                container.tracker.add(promise, {msg: 'Saving...'});
                toastr.success("Customer '" + customer.name + "' saved!", "Saved");
            }
        }

        that.onBack = function (e, origCustomer, options) {
            e.preventDefault();
            var CustomerSearch = require("./CustomerSearch");
            viewManager.showView({view: CustomerSearch});
        }

        function renderTemplate(customer, container) {

            var html = te.render({
                template: template,
                context: {'customer': customer},
                actions: that,
                data: {container: container}});
            return html;
        }

        function onAttached(customer) { 
            // Copy customer values to form
            $("#form").fromObject(customer);
            //$(".select2").select2(); // This call is done in setup.js under the "global.before.attached.notify" event

            // Add inline validation to form
            $("#form").validationEngine();
        }

        return that;
    }
    return customerEdit;
});