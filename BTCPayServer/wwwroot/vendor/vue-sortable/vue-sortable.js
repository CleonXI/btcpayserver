; (function () {
    var Sortable = typeof require === 'function'
        ? require('sortablejs')
        : window.Sortable

    if (!Sortable) {
        throw new Error('[vue-sortable] cannot locate Sortable.js.')
    }

    var sortableDirective = {
        mounted: function (el, binding) {
            var options = binding.value || {};
            new Sortable(el, options);
        }
    };

    function registerSortableDirective(app) {
        app.directive('sortable', sortableDirective);
    }

    if (typeof exports == "object") {
        module.exports = { registerSortableDirective, sortableDirective }
    } else if (typeof define == "function" && define.amd) {
        define([], function () {
            return { registerSortableDirective, sortableDirective }
        })
    } else {
        window.registerSortableDirective = registerSortableDirective;
        window.sortableDirective = sortableDirective;
    }
})()
