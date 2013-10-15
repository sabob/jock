define(function(require) {
    console.log("Main starting!");

    //require('./onResourceLoad');
    var $ = require("jquery");
    require("jquery.address");
    var viewManager = require("kv/view/view-manager");
    require("domReady!");

    var ClientSearch = require("./views/client/ClientSearch");
    var Datatables = require("./views/client/Datatables");
    var ClientEdit = require("./views/client/ClientEdit");
    var Home = require("./views/home/Home");

    //$.address.strict(true);
    //$.address.state("/koevoet-examples/js/spa.html");

    var options = {};
    options.routes = {
        "home": Home.id,
        "clients": ClientSearch.id,
        "clientedit": ClientEdit.id
    };
    options.defaultView = Home;
    options.params = {p1: ["val1", "val2"], p2: "pok"};
    
    viewManager.init(options);
    //console.log("Routes set!");


    $("#homeInd").click(function(e) {
        e.preventDefault();
        viewManager.showView({view: Home});
    });

    $("#clientsInd").click(function(e) {
        e.preventDefault();
        viewManager.showView({view: ClientSearch});
    });
    $("#datatables").click(function(e) {
        e.preventDefault();
        viewManager.showView({view: Datatables}).then(function() {
            console.log("DataTables finished!!!")
        });
    });
});