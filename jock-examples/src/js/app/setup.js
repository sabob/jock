define(function(require) {
    //console.log("Setup starting!");

    var $ = require("jquery");
    require("jock/jock");
    var viewManager = require("jock/view/view-manager");
    var Home = require("./views/home/Home");
    var CustomerSearch = require("./views/customer/CustomerSearch");
    var CustomerEdit = require("./views/customer/CustomerEdit");
    var ProductSearch = require("./views/product/ProductSearch");
    var ProductEdit = require("./views/product/ProductEdit");
    require("./plugins/jquery.placeholder");
    var validationSetup = require("./util/validation-setup");
    //var floatlabels = require("./plugins/floatlabels");
    require("domReady!");

    var options = {};
    options.routes = {
        "home": Home.id,
        "customers": CustomerSearch.id,
        "customerEdit": CustomerEdit.id,
        "products": ProductSearch.id,
        "productEdit": ProductEdit.id
    };
    var menuNames = [];

    setupActiveMenu();
    validationSetup.setupValidation();

    /*options.onHashChange = function(view) {
     setActiveMenu(view);
     $('#nav-ind').stop(true, true);
     };*/
    options.defaultView = Home;

    options.globalOnAttached = function(options) {
    };

    viewManager.init(options);

    function setupActiveMenu() {

        $("#navbar [data-menu]").each(function(i, item) {
            menuNames.push($(item).attr("data-menu"));
        });

        $(viewManager).on("global.before.attach", function(e, options) {

            // Ignore subviews
            if (!options.isMainView) {
                return;
            }
            var routesByPath = viewManager.getRoutesByPath();
            var route = routesByPath[options.newView.id];

            if (route == null) {
                return;
            }

            var $item = $("#menu-" + route).parent();

            if ($item.length === 0) {
                // Menu not found. Try and find menu from the list of data-menu attributes
                for (var i = 0; i < menuNames.length; i++) {
                    var menuName = menuNames[i];
                    // Check if route starts with menu name
                    if (route.indexOf(menuName) === 0) {
                        $item = $("#navbar [data-menu=" + menuName + "]").parent();
                    }
                }
            }

            $("#navbar li.active").removeClass("active");
            slideToActive($item);
        });


        $(viewManager).on("ajax.success", function() {
            console.log("ajax.success", arguments);
        });

        $(viewManager).on("ajax.error", function() {
            console.log("ajax.error", arguments);
        });

        $(viewManager).on("ajax.complete", function() {
            console.log("ajax.complete", arguments);
        });

        $(viewManager).on("ajax.start", function(e, args) {
            var msg = "Loading...";
            args = args || {};
            if (args.msg != null) {
                msg = args.msg;
            }

            $(document.body).append('<div id="loading" class="loader">' + msg + '</div>');
            $("#loading").stop( true, true ).animate({ top: 0 });
        });

        $(viewManager).on("ajax.stop", function(e, args) {
            $("#loading").stop( true, true ).animate({
                top: -45

            }, function() {
                $('#loading').remove();

            });
        });

        $(viewManager).on("global.visible", function(e, options) {
        });

        $(viewManager).on("global.attached", function(e, options) {

            if (!$.fn.placeholder.input || !$.fn.placeholder.textarea) {
                $('input, textarea').placeholder();
            }
            //$('input, textarea').floatlabel();
        });
    }

    function setActiveMenu(view) {
        if (view == null) {
            return;
        }
        var routesByPath = viewManager.getRoutesByPath();
        var route = routesByPath[view.id];
        $("#navbar li.active").removeClass("active");

        if (route == null) {
            return;
        }
        var item = $("#menu-" + route).parent();
        var location = getActiveMenuLocation(item);
        item.addClass("active");
        $("#nav-ind").css(location);
    }

    function slideToActive($li) {
        //console.log("ACTIVE", $li);
        $li.addClass('active');
        var location = getActiveMenuLocation($li);
        $('#nav-ind').animate(location, 'fast', 'linear');
    }

    function getActiveMenuLocation($li) {
        var offsetTop = 57;
        var $item = $($li);
        var offsetLeft = 0;
        if ($item.length) {
            var offsetLeft = $item.offset().left - $('#navbar').offset().left;
        }
        var location = {
            top: offsetTop,
            left: offsetLeft,
            right: $('#navbar').width() - $($li).width() - offsetLeft,
            bottom: $('#navbar').height() - $($li).height() - offsetTop
        };
        return location;
    }
});