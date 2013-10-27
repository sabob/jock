define(function(require) {

    var $ = require("jquery");
    //var module = require("module");
    var ClientEdit = require("./ClientEdit");
    var utils = require("spamd/utils/utils");
    var viewManager = require("spamd/view/view-manager");
    var errorUtils = require("spamd/utils/error-utils");
    var template = require("hb!./ClientSearch.htm");
    var templateEngine = require("spamd/template/template-engine");
    require("domReady!");
    function ClientSearch() {
        var that = this;

        this.onInit = function(dom, options) {
            var request = $.ajax({
                url: "json/clients.json",
                type: "GET",
                dataType: "json"
                        //contentType: "application/json"
            });
            request.done(function(data, textStatus, jqXHR) {
                renderClients(data, dom);
            });

            request.fail(function(jqXHR, textStatus, errorThrown) {
                handleError(jqXHR, dom);
            });
        };

        function renderClients(data, dom) {
            var context = data;
            var options = {};
            options.data = {
                onEdit: function(e, client) {
                    e.preventDefault();
                    //console.log("edit: client", client);
                    var args = {id: client.id};
                    viewManager.showView({view: ClientEdit, params: args});
                },
                onDelete: function(e, client) {
                    e.preventDefault();
                    //console.log("delete: client", client);
                }
            };
            var html = templateEngine.render(template, context, options);
            dom.attach(html).then(function() {
                onAttached(data);
                templateEngine.bind("#table");
            });
        }

        function handleError(jqXHR, dom) {
            dom.stay();
            console.log("Request failed: " + textStatus);
            var text = jqXHR.responseText;
            errorUtils.showError(text);
        }

        function onAttached(data) {
            $('#table').dataTable({"sPaginationType": "full_numbers"});
        }
    }

    return ClientSearch;
});