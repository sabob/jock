define(function() {

    var $ = require("jquery");
    var utils = require("jock/utils/utils");

    function ajaxTracker(viewManager) {

        if (viewManager == null) {
            throw new Error("ajaxTracker requires a viewManager instance!");
        }

        var that = {};
        var idCounter = 0;
        var promiseCounter = 0;

        var jqXHRMap = {};
        var globalPromise = null;
        var globalPromiseArgs = {};

        that.add = function(target, jqXHR, args) {

            var jqXHRArray = jqXHRMap[target];
            if (jqXHRArray == null) {
                jqXHRArray = [];
                jqXHRMap[target] = jqXHRArray;
            }
            
            var item = {jqXHR: jqXHR, args: args};
            jqXHRArray.push(item);

            if (globalPromise == null) {
                globalPromise = $.when(jqXHR);
                if (args != null) {
                    globalPromiseArgs = args;
                }
                $(viewManager).trigger("ajax.start", [args]);

            } else {
                globalPromise = $.when(globalPromise, jqXHR);
                if (args != null) {
                    globalPromiseArgs = $.extend(globalPromiseArgs, args);
                }
            }
            globalPromise._id = idCounter++;

            addListeners(target, globalPromise, jqXHR, globalPromiseArgs);
            console.log("DONE registering", globalPromise._id);

            promiseCounter++;

            return globalPromise;
        };

        that.remove = function(target, jqXHR) {
            var jqXHRArray = jqXHRMap[target];
            if (jqXHRArray == null) {
                return false;
            }

            var index = -1;
            for (var i = 0; i < jqXHRArray.length; i++) {
                var item = jqXHRArray[i];
                if (item.jqXHR === jqXHR) {
                    index = i;
                    break;
                }
            }

            if (index >= 0) {
                jqXHRArray.splice(index, 1);
                if (jqXHRArray.length === 0) {
                    delete jqXHRMap[target];
                }
                promiseCounter--;
                return true;
            }
            return false;
        };

        that.clear = function(target) {
            if (arguments.length === 0) {
                jqXHRMap = {};

            } else {
                delete jqXHRMap[target];
            }
        };

        that.abort = function(target) {
            var jqXHRArray = jqXHRMap[target];
            if (jqXHRArray == null) {
                return;
            }
            
            // jqXHRArray could be manipulated outside the loop below, so we make a copy
            var jqXHRCopy = jqXHRArray.slice();
            $.each(jqXHRCopy, function(index, item) {
                item.jqXHR.abort();
            });
            globalPromise = null;
            globalPromiseArgs = {};
        };

        function addListeners(target, globalPromiseParam, promiseParam, globalPromiseArgs) {

            promiseParam.then(function(data, status, jqXHR) {
                console.log("local promise then:", arguments);
                $(viewManager).trigger("ajax.success", [data, status, jqXHR, globalPromiseArgs]);

            }, function(jqXHR, textStatus, errorThrown) {
                console.log("local promise error:", arguments);
                $(viewManager).trigger("ajax.error", [jqXHR, textStatus, errorThrown, globalPromiseArgs]);
            });

            promiseParam.always(function(dataOrjqXHR, textStatus, jqXHROrerrorThrown) {
                console.log("local promise always:", arguments);
                $(viewManager).trigger("ajax.complete", [dataOrjqXHR, textStatus, jqXHROrerrorThrown, globalPromiseArgs]);
                var removed = that.remove(target, promiseParam);
                console.log("Removed?", removed);
            });

            globalPromiseParam.then(function() {

                // Only process if this is the globalPromise, otherwise globalPromise has been overwritten
                if (globalPromise == null || globalPromise == globalPromiseParam) {
                    $(viewManager).trigger("ajax.stop", [arguments, globalPromiseArgs]);
                    globalPromise = null;
                    globalPromiseArgs = {};
                } else {
                    console.log("globalPromise ignore then");
                }

            }, function(error) {

                if (globalPromise == null || globalPromise == globalPromiseParam) {
                    $(viewManager).trigger("ajax.stop", [error, globalPromiseArgs]);
                    globalPromise = null;
                    globalPromiseArgs = {};
                    console.log("globalPromise ERROR", globalPromiseParam);
                    console.log(arguments);

                } else {
                    console.log("globalPromise ignore error");
                    return;
                }
            });

            globalPromiseParam.always(function() {

                if (globalPromise == null || globalPromise == globalPromiseParam) {
                    console.log("globalPromise ALWAYS", arguments);
                    console.log("Promises size1:", utils.objectSize(jqXHRMap));
                    console.log("Promises size2:", promiseCounter);

                } else {
                    console.log("globalPromise ignore always");
                    return;
                }
            });
        }

        return that;
    }

    return ajaxTracker;
});