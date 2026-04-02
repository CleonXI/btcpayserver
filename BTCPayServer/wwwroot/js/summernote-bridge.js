(function ($) {
    if (!$ || $.fn.modal) return;

    $.fn.modal = function (action) {
        return this.each(function () {
            const el = this;
            if (action === 'show') {
                window.openModal('#' + el.id);
            } else if (action === 'hide') {
                window.closeModal(el);
            }
        });
    };

    $.fn.tooltip = function (optionsOrAction) {
        return this.each(function () {
            if (typeof optionsOrAction === 'string') {
                const t = this._btcpayTooltip;
                if (t && typeof t[optionsOrAction] === 'function') t[optionsOrAction]();
            } else {
                this._btcpayTooltip = window.btcpayTooltip(this, optionsOrAction || {});
            }
        });
    };
})(window.jQuery);
