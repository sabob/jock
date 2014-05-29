define(function(require) {
    var $ = require("jquery");
    var todosTemplate = require("hb!./templates/todo-view.htm");
    var todoListTemplate = require("hb!./templates/todo-list.htm");
    var itemTemplate = require("hb!./templates/todo-item.htm");
    var footerTemplate = require("hb!./templates/footer.htm");
    var te = require("jock/template/template-engine");
    var utils = require("./utils");
    var store = require("./store");
    var model = require("./model");
    require("domReady!");

    function todo() {

        var ENTER_KEY = 13;
        var ESCAPE_KEY = 27;

        var that = {};

        that.onInit = function(container, args) {

            model.filter(args.params.filter);
            model.todos(store('todos-jock'));

            $(args.hash).on("onHashChange", function(e, options) {
                model.filter(options.hash.get().filter);
                renderTodoList();
            });

            // render the view
            var html = te.render(todosTemplate, {todos: model.getFilteredTodos()}, getTemplateActions());
            container.attach(html).then(function() {
                renderTodoList();
            });
        };

        function getTemplateActions() {
            return {
                create: create,
                remove: remove,
                editFocusout: editFocusout,
                editKeyup: editKeyup,
                startEdit: startEdit,
                toggleComplete: toggleComplete,
                removeCompleted: removeCompleted,
                toggleAll: toggleAll
            };
        }

        function editFocusout(e, todo) {
            update(e, todo);
        }

        function editKeyup(e, todo) {
            if (e.which === ENTER_KEY) {
                update(e, todo);

            } else if (e.which === ESCAPE_KEY) {
                var $editInput = $(e.target);
                undoEdit($editInput, todo);
            }
        }

        function undoEdit($editInput, todo) {
            $editInput.val(todo.title);
            $editInput.closest('li').removeClass('editing');
        }

        function toggleComplete(e, todo) {
            todo.completed = !todo.completed;
            if (model.showActive() && todo.completed) {
                removeRow(e.target);
            }
            if (model.showCompleted() && !todo.completed) {
                removeRow(e.target);
            }
            renderHeader();
            renderFooter();
        }

        function toggleAll(e) {
            var isChecked = $(e.target).prop('checked');
            $('#todo-list input[type=checkbox]').prop('checked', isChecked);

            model.todos().forEach(function(todo) {
                todo.completed = isChecked;
            });

            renderTodoList();
        }

        function create(e) {
            var $input = $(e.target);
            var val = $input.val().trim();

            if (e.which !== ENTER_KEY || !val) {
                return;
            }

            var todo = {title: val, completed: false};
            model.todos().unshift(todo);
            store('todos-jock', model.todos());

            $input.val('');
            renderItem(e, todo);
            renderHeader();
            renderFooter();
        }

        function update(e, todo) {
            var $el = $(e.target);
            var val = $el.val().trim();
            var $label = $el.prev("div").find("label");
            $label.text(val);
            todo.title = val;
            $el.closest('li').removeClass('editing');
            store('todos-jock', model.todos());
        }


        function remove(e, todo) {
            var index = $.inArray(todo, model.todos());
            model.todos().splice(index, 1);
            removeRow(e.target);
            $("#main").toggle(model.todos().length > 0);
            renderHeader();
            renderFooter();
            store('todos-jock', model.todos());
        }

        function removeRow(node) {
            $(node).closest('li').remove();
        }

        function removeCompleted() {
            model.todos(model.getActiveTodos());
            model.filter('all');
            renderTodoList();
        }

        function startEdit(e) {
            var $input = $(e.target).closest('li').addClass('editing').find('.edit');
            $input.val($input.val()).focus();
        }
        
        function renderItem(e, todo) {
            if (todo.completed && model.showActive() ||
                    !todo.completed && model.showCompleted()) {
                return;
            }
            $("#main").toggle(model.todos().length > 0);
            var html = te.render(itemTemplate, todo, getTemplateActions());
            $("#todo-list").prepend(html);
            te.bind("#todo-list");
        }
        
        function renderTodoList() {
            store('todos-jock', model.todos());

            renderHeader();

            var options = {
                partials: {
                    "todo-item": itemTemplate
                }
            };
            var html = te.render(todoListTemplate, {todos: model.getFilteredTodos()}, getTemplateActions(), options);
            $("#todo-list").html(html);
            te.bind("#todo-list");

            $("#main").toggle(model.todos().length > 0);
            renderFooter();
        }

        function renderHeader() {
            if (model.getFilteredTodos().length > 0) {
                $("#toggle-all").toggle(true);
                $("#toggle-all").prop('checked', false);
            } else {
                $("#toggle-all").toggle(false);
            }
        }

        function renderFooter() {
            var todoCount = model.todos().length;
            var activeTodoCount = model.getActiveTodos().length;

            var context = {
                activeTodoCount: activeTodoCount,
                activeTodoWord: utils.pluralize(activeTodoCount, 'item'),
                completedTodos: todoCount - activeTodoCount,
                filter: model.filter()
            };
            var html = te.render(footerTemplate, context, getTemplateActions());

            $("#footer").html(html);
            te.bind("#footer");
            $("#footer").toggle(model.todos().length > 0);
        }

        return that;
    }
    return todo;
});
