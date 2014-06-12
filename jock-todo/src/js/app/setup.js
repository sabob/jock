define(function(require) {
    
    var $ = require("jquery");
    require("jock/jock");
    var viewManager = require("jock/view/view-manager");
    var todoView = require("./views/todo/todo-view");

    var options = {
        target: "#todoapp"
    };

    options.routes = {
        "todo": todoView.id
    };

    options.defaultView = todoView;

    viewManager.init(options);
});