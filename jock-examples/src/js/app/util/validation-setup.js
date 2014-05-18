define(function(require) {
    
    var that = {};
    
    require("../plugins/jquery.validationEngine");
    require("../plugins/languages/jquery.validationEngine-en");

that.setupValidation = function() {
        $.validationEngine.defaults.globalFieldValidating = function(options) {
            options.obj.ok = false;

                if (options.obj.e == null) {
                    options.obj.ok = true;
                    return;
                }
                if (options.obj.e.type === "focusout") {
                    options.field.data("enableValidation", true);
                    options.obj.ok = true;
                    return;
                }

                if (options.obj.e.type === "keyup" || options.obj.e.type === "change") {
                    if (options.field.data("enableValidation") === true) {
                        options.obj.ok = true;
                    } else {
                        options.obj.ok = false;
                    }
                }
//                console.log("field.validating", options.obj.e.type);
            };
    }
    
    return that;
});