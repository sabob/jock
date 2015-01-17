define(function(require) {
    var $ = require("jquery");
    var template = require("hb!./calendarEdit.htm");
    var calendar = require("./calendar");
    var te = require("jock/template/template-engine");
    var moment = require("moment");
    var toastr = require("app/plugins/toastr");
    var editEvent = require("./event/editEventDialog");
    var string = require("jock/utils/string");
    require("domReady!");

    var cal;
    var editEventDialog;

    function CalendarEdit() {

        var that = {};

        cal = calendar("calendar");
        editEventDialog = editEvent();

        that.onInit = function(container, args) {
            container.attach(template);

            // Calendar only paints once the DOM is visible!
            container.visible.then(function() {
                onVisible();
            });
        };

        function onVisible() {

            cal.init();
            cal.select(function(start, end, e, view) {
                //console.log("MOOOO", start, end, e, view)
            });

            cal.eventClick(function(event, jsEvent, view) {
                //console.log("MOOOO", event, jsEvent, view);
                var options = {
                    event: event
                };
                showEditDialog(options);

            });

            function notifySelection() {
                toastr.error("Please select a date on the calendar." +
                        " Drag your mouse for group selection. Hold 'ctrl' down to make multiple selections.", "No date selected");
            }

            $("#addSelected").on('click', function() {
                if (!cal.hasSelected()) {
                    notifySelection();

                } else {
                    showEditDialog();
                }
            });

            $("#removeAll").on('click', function() {
                if (!cal.hasSelected()) {
                    notifySelection();

                } else {
                    toastr.clear();

                    //$('#confirmDialog').modal('show');
                    var continueProcessing = confirm("Are you sure?");
                    if (!continueProcessing) {
                        return;
                    }
                    cal.deleteEvents();

                }
            });

            $('#confirmDialog').on('shown.bs.modal', function(e) {
                $("#cancelConfirm").focus();
            });
        }

        function showEditDialog(options) {
            options = options || {};
            toastr.clear();
            options.onSave = onSaveEventClick;
            editEventDialog.show(options);
        }

        function onSaveEventClick(e, jsEvent) {
            editEventDialog.hide();
           
            var moments;
            var currentEventId;
            if (jsEvent != null) {
                // Edit event mode
                currentEventId = jsEvent.id;
                cal.deleteEvent(jsEvent);
                moments = [jsEvent.start];
                
            } else {
                // Add event mode
                moments = cal.selectedMoments();
            }

            var event = editEventDialog.getData();


            $.each(moments, function(index, mom) {
                console.log(event);
                
                var tags = $.isArray(event.tags) ? event.tags.join() : event.tags;

                var item = {
                    id: currentEventId || cal.generateID(),
                    title: tags,
                    content: string.prune(event.description, 100),
                    start: mom,
                    data: event,
                    //end: new Date(2014, mom.month(), 30),
                    //start: start,
                    //end: new Date(2014, today.getMonth(), 15, 3),
                    allDay: false
                };

                cal.addEvent(item);
            });

            cal.refresh();
        }

        return that;
    }

    return CalendarEdit;
});
