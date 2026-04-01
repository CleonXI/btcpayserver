(function ($) {
    if (!$ || $.fn.modal) return;

    $.fn.modal = function (action) {
        return this.each(function () {
            const m = bootstrap.Modal.getOrCreateInstance(this);
            if (typeof m[action] === 'function') m[action]();
        });
    };

    $.fn.tooltip = function (optionsOrAction) {
        return this.each(function () {
            if (typeof optionsOrAction === 'string') {
                const t = bootstrap.Tooltip.getInstance(this);
                if (t && typeof t[optionsOrAction] === 'function') t[optionsOrAction]();
            } else {
                new bootstrap.Tooltip(this, optionsOrAction || {});
            }
        });
    };
})(window.jQuery);
