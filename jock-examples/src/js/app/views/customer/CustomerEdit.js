define(function(require) {

    var $ = require("jquery");
    var template = require("hb!./CustomerEdit.htm");
    var te = require("jock/template/template-engine");
    var viewManager = require("jock/view/view-manager");
    var toastr = require("app/plugins/toastr");
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
            });
            
            container.overwrite.then(function(view) {
                console.error("Overwritten customer, aborting AJAX");
                promise.abort();
            });
        };

        function onSave(e, origCustomer) {
            e.preventDefault();
            var valid = $("#form").validationEngine('validate');
            if (valid) {
                var customer = $("#form").toObject();
                toastr.success("Customer '" + customer.name + "' saved!", "Saved");
            }
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
            // Copy customer values to form
            $("#form").fromObject(customer);

            // Add inline validation to form
            $("#form").validationEngine();
        }

        return that;
    }
    return customerEdit;
});