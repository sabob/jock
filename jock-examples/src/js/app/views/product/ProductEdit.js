define(function(require) {

    var $ = require("jquery");
    var template = require("hb!./ProductEdit.htm");
    var te = require("jock/template/template-engine");
    var viewManager = require("jock/view/view-manager");
    var toastr = require("app/plugins/toastr");
    require("domReady!");

    function productEdit() {

        var that = {};

        that.onInit = function(containerArg, options) {
            var container = containerArg;

            if (options.params.id == null) {
                container.cancel();
                return;
            }

            var productId = options.params.id;

            var promise = $.ajax("/data/product" + productId + ".json");
            container.tracker.add(promise);
            promise.then(function(product) {

                var html = renderTemplate(product, container);

                container.attach(html).then(function() {
                    onAttached(product);
                });
            });

            container.overwrite.then(function(view) {
                console.error("Overwritten product, aborting AJAX");
                promise.abort();
            });
        };

        function onSave(e, origProduct, options) {
            e.preventDefault();
            var product = $("#form").toObject();
            var container = options.data.container;
            container.tracker.add(promise, {msg: 'Saving...'});
            toastr.success("Product '" + product.name + "' saved!", "Saved");
        }

        function onBack(e, origProduct, options) {
            e.preventDefault();
            var productSearch = require("./ProductSearch");
            viewManager.showView({view: productSearch});
        }

        function renderTemplate(product, container) {
            var actions = {
                save: onSave,
                back: onBack
            };
            var html = te.render(template, {'product': product}, actions, {data: {container: container}});
            return html;
        }

        function onAttached(product) {
            $("#form").fromObject(product);
        }

        return that;
    }
    return productEdit;
});