define(function (require) {

    var $ = require("jquery");
    var template = require("hb!./ProductEdit.htm");
    var te = require("jock/template/template-engine");
    var viewManager = require("jock/view/view-manager");
    var toastr = require("app/plugins/toastr");
    var customerEdit = require("app/views/customer/customerEdit");
    var customerSearch = require("app/views/customer/customerSearch");
    var home = require("app/views/home/home");
    require("domReady!");

    function productEdit() {

        var that = {};

        that.onInit = function (containerArg, options) {
            var container = containerArg;

            if (options.params.id == null) {
                container.cancel();
                return;
            }

            var productId = options.params.id;

            var promise = $.ajax("/data/product" + productId + ".json");
            container.tracker.add(promise);
            promise.then(function (product) {

                var tabs = [
                    {label: "One", tpl: "#", disable: "false", active: true},
                    {label: "Two", tpl: "#", disable: "false", active: false},
                    {label: "Three", tpl: "#", disable: "false", active: false}
                ];

                var data = {product: product, tabs: tabs};

                var html = renderTemplate(data, container);

                container.attach(html).then(function () {
                    onAttached(product);
                });
            });

            container.overwrite.then(function (view) {
                console.error("Overwritten product, aborting AJAX");
                promise.abort();
            });
        };

        that.onSelectTab = function(e, tab, options) {
            e.preventDefault();
            if (tab.label == "One") {
                viewManager.showView({view: customerEdit, target: "#tabContent", params: {id: 1}});
            } else if (tab.label == "Two") {
                console.log("Two");
                viewManager.showView({view: customerSearch, target: "#tabContent", params: {id: 1}});
            } else if (tab.label == "Three") {
                console.log("Three");
                viewManager.showView({view: home, target: "#tabContent", params: {id: 1}});
            }
        };

        that.onSave = function(e, origProduct, options) {
            e.preventDefault();
            var product = $("#form").toObject();
            var container = options.data.container;
            var promise = $.ajax("/data/product" + product.id + ".json");
            container.tracker.add(promise, {msg: 'Saving...'});
            toastr.success("Product '" + product.name + "' saved!", "Saved");
        };

        that.onBack = function(e, origProduct, options) {
            e.preventDefault();
            var productSearch = require("./ProductSearch");
            viewManager.showView({view: productSearch});
        };

        function renderTemplate(data, container) {
            var html = te.render({
                template: template,
                context: data,
                actions: that,
                data: {container: container}});
            return html;
        }

        function onAttached(product) {
            $("#form").fromObject(product);
        }

        return that;
    }
    return productEdit;
});