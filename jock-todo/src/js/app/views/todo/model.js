define(function(require) {

    var $ = require("jquery");

    function model() {

        var that = {};

        var todos = [];

        var filter = 'all';

        that.todos = function(todosArg) {
            if (arguments.length === 0) {
                return todos;
            } else {
                todos = todosArg;
            }
        };

        that.filter = function(filterArg) {
            if (arguments.length === 0) {
                return filter;
            } else {
                filter = filterArg;
            }
        };

        that.getActiveTodos = function() {
            return todos.filter(function(todo) {
                return !todo.completed;
            });
        };

        that.getCompletedTodos = function() {
            return todos.filter(function(todo) {
                return todo.completed;
            });
        };

        that.getFilteredTodos = function() {
            if (that.showActive()) {
                return that.getActiveTodos();
            }

            if (that.showCompleted()) {
                return that.getCompletedTodos();
            }

            return todos;
        };
        
        that.showActive = function() {
            return filter === 'active';
        };
        
        that.showCompleted = function() {
            return filter === 'completed';
        };
        
        that.showAll = function() {
            return filter === 'all' || filter === '';
        };


        return that;
    }

    return model();

});