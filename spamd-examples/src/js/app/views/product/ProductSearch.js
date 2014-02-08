define(function(require) {

    var $ = require("jquery");
    var template = require("hb!./ProductSearch.htm");
    var te = require("spamd/template/template-engine");
    var viewManager = require("spamd/view/view-manager");
    var ProductEdit = require("./ProductEdit");
    require("domReady!");

    function productSearch() {

        var that = {};

        that.onInit = function(container, args) {
            var promise = $.ajax("/data/products.json");
            promise.then(function(data) {

                var html = renderTemplate(data);

                container.attach(html).then(function() {
                    onAttached(args);
                });
            });
        };
        
         function onEdit(e, product) {
            e.preventDefault();
            //console.log("Edit", product);
            viewManager.showView({view: ProductEdit, params: {id: product.id}, args: {product: product}});
        }

        function onDelete(e, product) {
            e.preventDefault();
                    //console.log("Delete", product);
        }

        function renderTemplate(products) {
            var actions = {
                edit: onEdit,
                remove: onDelete
            };
            var html = te.render(template, {products: products}, actions);
            return html;
        }

        function onAttached() {

        }
        
        return that;
    }
    return productSearch;
});