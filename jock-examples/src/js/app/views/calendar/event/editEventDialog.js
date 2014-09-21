define(function(require) {

    var $ = require("jquery");
    var template = require("hb!./editEventDialog.htm");
    var select2 = require("select2");
    var utils = require("jock/utils/utils");
    var moment = require("moment");

    function editEventDialog() {

        var onSave;

        var that = {};

        var eventEdited = null;

        that.show = function(options) {
            onSave = options.onSave;
            $('body').append(template);
            registerEvents();
            $('#eventDialog').modal({
                show: true,
                keyboard: false
            });

            var event = options.event || { data: {} };
            eventEdited = options.event;

            $("#form").fromObject(event.data);
            $(".select2").select2();

            var timeVal = event.data.time || "";
            renderTime(timeVal);
        };

        that.hide = function() {
            $('#eventDialog').modal('hide');
            eventEdited = null;
        };

        that.getData = function() {
            var data = utils.toObject("#form");
            return data;
        };

        that.setData = function(data) {
            utils.fromObject("#form", data);
        };

        function registerEvents() {
            $("#saveEvents").on('click', function(e) {
                if (onSave != null) {
                    onSave(e, eventEdited);
                }
            });

            $('#eventDialog').on('shown.bs.modal', function(e) {
                onVisible();
            });

            $('#eventDialog').on('hidden.bs.modal', function(e) {
                $('#eventDialog').remove();
                $('body > .select2-hidden-accessible').remove();
                $('body > .select2-drop-mask').remove();
                $('body > .select2-drop').remove();
                $('body > .select2-sizer').remove();
            });

            $("#time").on("keyup", function(e) {
                var val = $(this).val();
                renderTime(val);
            });
        }
        
        function renderTime(val) {
            
                var matches = val.match(/(\d+)\s*-\s*(\d+)/);

                if (matches === null) {
                    $("#workTime").text("");
                    return;
                }
                var start = parseInt(matches[1]);
                var end = parseInt(matches[2]);
                var time;
                
                if (start >  end) {
                    // ie. 3-1
                    // Assume 24 hour format and add 12 hours
                     end += 12;
                    // ie. 3-13
                }
                
                time =  end - start;
                var now = new Date();
                now.setHours(start);
                var startTime = moment(now).format("HH:00");
                now.setHours(end);
                var endTime = moment(now).format("HH:00");
                
                $("#workTime").text("" + startTime + " - " + endTime + " (work: " + time + "h)");
        }


        function onVisible() {
            $("#saveEvents").focus();

        }

        return that;
    }
    return editEventDialog;
});