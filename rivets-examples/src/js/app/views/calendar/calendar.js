define(function(require) {

    var $ = require("jquery");

    function calendar(id) {

        var that = {};

        var settings = {};

        var idSelector = "#" + id;

        var selectedCls = "calendarSelected";

        var items = [];

        var eventGUID = new Date().getTime();

        that.unselectAll = function() {
            $(idSelector + " td").removeClass(selectedCls);
        };

        that.cal = function() {
            return $(idSelector).fullCalendar;
        };

        that.select = function(fn) {
            settings.selectFn = fn;
        };

        that.eventClick = function(fn) {
            settings.eventClickFn = fn;
        };

        that.init = function() {
            $(idSelector).fullCalendar({
                eventClick: function( event, jsEvent, view  ) {
                    if (settings.eventClickFn != null) {
                        settings.eventClickFn( event, jsEvent, view  );
                    }
                },
                unselect: function() {
                    //console.log("Unselect", arguments);
                },
                select: function(start, end, e, view) {
                    console.log(e);
                    console.log(e.ctrlKey, e.shiftKey, e.altKey);

                    //$('#calendar').fullCalendar( 'unselect');

                    if (e.ctrlKey !== true) {
                        that.unselectAll();
                    }

                    while (end.isAfter(start)) {
                        var selector = start.format("YYYY-MM-DD");
                        console.log(selector);
                        var td = $('#calendar [data-date="' + selector + '"]');
                        $(td).toggleClass("calendarSelected");
                        start.add('d', 1);
                    }

                    //var $e = $(e.target);
                    //console.log("SEL", start, end, e);
                    //console.log("DOM", dom);
                    //$(arguments[2].target).css({"border": "1px solid red"});

                    if (settings.selectFn != null) {
                        settings.selectFn(start, end, e, view);
                    }

                },
                eventMouseover: function(calEvent, domEvent) {
                    var layer = "<div id='events-layer' class='fc-transparent' style='position:absolute; width:100%; height:100%; top:2px; text-align:right; z-index:100'> <a class='remove-event' id='events-layer-remove'>X</a></div>";
                    $(this).append(layer);
                    $("#events-layer-remove", this).on('click', function(e) {
                        that.deleteEvent(calEvent);
                    });
                },
                eventMouseout: function(calEvent, domEvent) {
                    $("#events-layer").remove();
                },
                eventRender: function(event, element) {
                    //console.log(element);
                    $(element).find(".fc-event-inner").append("<div>" + event.content + "");
                },
                // put your options and callbacks here
                selectable: true,
                selectHelper: true,
                unselectAuto: true,
                unselectable: true,
                //unselectCancel: ".fc-day, fc-week",
                header: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'month, agendaWeek, agendaDay'
                },
                editable: false,
                droppable: false
            });

            $(idSelector).fullCalendar("addEventSource", items);
        };

        that.selected = function() {
            var $selected = $("#calendar .calendarSelected");
            return $selected;
        };
        
        that.hasSelected = function() {
            var $selected = that.selected();
            if ($selected.length === 0) {
                return false;
            }
            return true;
        };

        that.selectedMoments = function() {
            var $selected = that.selected();

            var moments = [];
            $selected.each(function(index) {
                var selectedDate = $(this).attr('data-date');
                var mom = $.fullCalendar.moment(selectedDate);
                moments.push(mom);
            });
            return moments;
        };

        that.generateID = function() {
            return ++eventGUID;
        }

        that.addEvent = function(event) {
            items.push(event);
        };

        that.refresh = function() {
            //$(idSelector).fullCalendar("removeEventSource", items);
            //$(idSelector).fullCalendar("addEventSource", items);
            $(idSelector).fullCalendar('refetchEvents');
            that.unselectAll();
        };

        that.deleteEvents = function() {
            $(idSelector).fullCalendar("removeEventSource", items);
            items = [];
            $(idSelector).fullCalendar("addEventSource", items);
        };

        that.deleteEvent = function(event) {
            console.log("remove", event._id, event.id);
            //console.log("remove", items);

            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                /*
                 var start = event.start;
                 var mom = item.start;
                 console.log("event date:", start.toDate());
                 console.log("item date", mom.toDate());
                 console.log(start.isSame(mom));
                 if (start.isSame(mom)) {
                 */
                if (item.id === event.id) {
                    items.splice(i, 1);
                    break;
                    //console.log("removed event", event);
                }
            }
            $(idSelector).fullCalendar('refetchEvents');

            //$('#calendar').fullCalendar('removeEventSource', items);
            /*
             $('#calendar').fullCalendar('removeEvents', function (e) {
             console.log("remove", e);
             if (e == event) {
             return true;
             }
             return false;
             });*/
        }

        return that;
    }
    return calendar;
});