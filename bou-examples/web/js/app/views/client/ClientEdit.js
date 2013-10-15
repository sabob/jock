define(function(require) {
    var $ = require("jquery");
    var template = require("hb!./ClientEdit.htm");
    var utils = require("kv/utils/utils");
    var viewManager = require("kv/view/view-manager");
    var errorUtils = require("kv/utils/error-utils");

    require("domReady!");

    function ClientEdit() {
        
        var that = this;
        //var id = null;
        //var ClientSearch;

        this.onInit = function(dom, options) {
            var id = options.params.id;
            //ClientSearch = options.args.ClientSearch;

            getClient(dom, id);
            
        };

        function onAttached() {
            $("#save").click(function(e) {
                // Require here to stop circular ref between ClientSearch and ClientEdit
                var ClientSearch = require("./ClientSearch");
                saveClient(ClientSearch);
            });
        }

        function getClient(dom, id) {
            var request = $.ajax({
                url: "json/client" + id + ".json",
                data: "id=" + id,
                type: "GET",
                dataType: "json"
                        //contentType: "application/json"
            });

            request.done(function(data, textStatus, jqXHR) {
                dom.attach(template).then(function() {
                    //copy data to form
                    utils.fromObject("form", data);
                    onAttached();
                });
                //console.log('done', data);
            });

            request.fail(function(jqXHR, textStatus, errorThrown) {
                //console.log("getClient() failed: " + textStatus);
                dom.stay();
                var text = jqXHR.responseText;
                errorUtils.showError(text);
            });
            request.always(function(arg1, textStatus, arg3) {
                //console.log("getClient() completed: ", textStatus);
            });
        }

        function saveClient(ClientSearch) {
            var json = utils.toJson("form");

            var request = $.ajax({
                //url: "/ratel-examples/clientService/saveClient",
                url: "json/clients.json",
                data: json,
                type: "POST",
                dataType: "json",
                contentType: "application/json"
            });

            request.done(function(data, textStatus, jqXHR) {
                //console.log('done', data);
                viewManager.showView({view: ClientSearch});
            });

            request.fail(function(jqXHR, textStatus, errorThrown) {
                //console.log("SaveClient failed: " + textStatus);
            });
        }
    }
    return ClientEdit;
});