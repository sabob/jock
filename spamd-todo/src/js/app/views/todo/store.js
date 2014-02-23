define(function(require) {
    var $ = require("jquery");

    function store() {

        var that = function(namespace, data) {
            if (arguments.length > 1) {
                return localStorage.setItem(namespace, JSON.stringify(data));
            } else {
                var store = localStorage.getItem(namespace);
                return (store && JSON.parse(store)) || [];
            }
        };

        return that;
    }
    
    return store();

});