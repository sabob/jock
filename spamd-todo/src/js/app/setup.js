define(function(require) {
    
    var $ = require("jquery");
    require("spamd/spamd");
    var viewManager = require("spamd/view/view-manager");
    var todoView = require("./views/todo/todo-view");
    require("domReady!");

    var options = {
        target: "#todoapp"
    };

    options.routes = {
        "todo": todoView.id
    };

    options.defaultView = todoView;

    viewManager.init(options);
});