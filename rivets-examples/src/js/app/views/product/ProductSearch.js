define(function(require) {

    var $ = require("jquery");
    var template = require("hb!./ProductSearch.htm");
    var te = require("jock/template/template-engine");
    var viewManager = require("jock/view/view-manager");
    var ProductEdit = require("./ProductEdit");
    require("domReady!");

    function productSearch() {

        var that = {};

        that.onInit = function(container, args) {
            var promise = $.ajax("/data/products.json");
            container.tracker.add(promise);
            promise.then(function(data) {

                var html = renderTemplate(data);

                container.attach(html).then(function() {
                    onAttached(args);
                });
            });
            
             container.overwrite.then(function(view) {
                console.error("Overwritten products, aborting AJAX");
                promise.abort();
            });
        };
        
         that.onEdit = function(e, product) {
            e.preventDefault();
            //console.log("Edit", product);
            viewManager.showView({view: ProductEdit, params: {id: product.id}, args: {product: product}});
        }

        that.onDelete = function(e, product) {
            e.preventDefault();
            console.log("Delete", product);
        };

        function renderTemplate(products) {
            var html = te.render({template: template, context: {products: products}, actions: that});
            return html;
        }

        function onAttached() {

        }
        
        return that;
    }
    return productSearch;
});