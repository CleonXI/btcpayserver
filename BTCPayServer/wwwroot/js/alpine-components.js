document.addEventListener('alpine:init', () => {

    // --- Modal ---
    Alpine.data('btcModal', () => ({
        isOpen: false,
        _bd: null,
        _trigger: null,

        init() {
            window.addEventListener('btcpay:open-modal', (e) => {
                const detail = e.detail;
                if (!detail) return;
                const targetSel = typeof detail === 'string' ? detail : detail.target;
                if (this.$el.id && targetSel === '#' + this.$el.id) {
                    this._trigger = detail.trigger || null;
                    this.open();
                }
            });
        },

        open() {
            if (this.isOpen) return;
            const evt = new CustomEvent('show.bs.modal', {
                bubbles: true, cancelable: true,
                detail: { relatedTarget: this._trigger }
            });
            evt.relatedTarget = this._trigger;
            if (!this.$el.dispatchEvent(evt)) return;
            this.isOpen = true;
            document.body.style.overflow = 'hidden';
            this._bd = document.createElement('div');
            this._bd.className = 'modal-backdrop';
            document.body.appendChild(this._bd);
            this.$nextTick(() => {
                const shown = new CustomEvent('shown.bs.modal', {
                    bubbles: true,
                    detail: { relatedTarget: this._trigger }
                });
                shown.relatedTarget = this._trigger;
                this.$el.dispatchEvent(shown);
            });
        },

        close() {
            if (!this.isOpen) return;
            if (!this.$el.dispatchEvent(new CustomEvent('hide.bs.modal', { bubbles: true, cancelable: true }))) return;
            this.isOpen = false;
            document.body.style.overflow = '';
            if (this._bd) {
                this._bd.remove();
                this._bd = null;
            }
            setTimeout(() => {
                this.$el.dispatchEvent(new CustomEvent('hidden.bs.modal', { bubbles: true }));
            }, 300);
            this._trigger = null;
        }
    }));

    // --- Dropdown ---
    Alpine.data('btcDropdown', () => ({
        isOpen: false,

        toggle() {
            this.isOpen ? this.close() : this.open();
        },

        open() {
            if (this.isOpen) return;
            if (!this.$el.dispatchEvent(new CustomEvent('show.bs.dropdown', { bubbles: true, cancelable: true }))) return;
            this.isOpen = true;
            this.$nextTick(() => {
                this.$el.dispatchEvent(new CustomEvent('shown.bs.dropdown', { bubbles: true }));
            });
        },

        close() {
            if (!this.isOpen) return;
            if (!this.$el.dispatchEvent(new CustomEvent('hide.bs.dropdown', { bubbles: true, cancelable: true }))) return;
            this.isOpen = false;
            this.$el.dispatchEvent(new CustomEvent('hidden.bs.dropdown', { bubbles: true }));
        }
    }));

    // --- Offcanvas ---
    Alpine.data('btcOffcanvas', () => ({
        isOpen: false,
        _bd: null,

        init() {
            window.addEventListener('btcpay:open-offcanvas', (e) => {
                const detail = e.detail;
                if (!detail) return;
                const targetSel = typeof detail === 'string' ? detail : detail.target;
                if (this.$el.id && targetSel === '#' + this.$el.id) {
                    this.open();
                }
            });
        },

        open() {
            if (this.isOpen) return;
            if (!this.$el.dispatchEvent(new CustomEvent('show.bs.offcanvas', { bubbles: true, cancelable: true }))) return;
            this.isOpen = true;
            document.body.style.overflow = 'hidden';
            this.$nextTick(() => {
                this.$el.dispatchEvent(new CustomEvent('shown.bs.offcanvas', { bubbles: true }));
            });
        },

        close() {
            if (!this.isOpen) return;
            if (!this.$el.dispatchEvent(new CustomEvent('hide.bs.offcanvas', { bubbles: true, cancelable: true }))) return;
            this.isOpen = false;
            document.body.style.overflow = '';
            setTimeout(() => {
                this.$el.dispatchEvent(new CustomEvent('hidden.bs.offcanvas', { bubbles: true }));
            }, 300);
        },

        toggle() {
            this.isOpen ? this.close() : this.open();
        }
    }));

    // --- Collapse ---
    Alpine.data('btcCollapse', (initialOpen = false) => ({
        expanded: initialOpen,

        toggle() {
            this.expanded ? this.hide() : this.show();
        },

        show() {
            if (this.expanded) return;
            if (!this.$el.dispatchEvent(new CustomEvent('show.bs.collapse', { bubbles: true, cancelable: true }))) return;
            this.expanded = true;
            this.$nextTick(() => {
                this.$el.dispatchEvent(new CustomEvent('shown.bs.collapse', { bubbles: true }));
            });
        },

        hide() {
            if (!this.expanded) return;
            if (!this.$el.dispatchEvent(new CustomEvent('hide.bs.collapse', { bubbles: true, cancelable: true }))) return;
            this.expanded = false;
            this.$nextTick(() => {
                this.$el.dispatchEvent(new CustomEvent('hidden.bs.collapse', { bubbles: true }));
            });
        }
    }));

    // --- Toast Store ---
    Alpine.store('toasts', {
        items: [],
        _nextId: 0,

        show(message, opts = {}) {
            const id = ++this._nextId;
            const type = opts.type || 'info';
            const duration = opts.duration || opts.delay || 5000;
            const typeClasses = {
                info: 'bg-btcpay-info text-btcpay-white',
                success: 'bg-btcpay-success text-btcpay-white',
                error: 'bg-btcpay-danger text-btcpay-white',
                warning: 'bg-btcpay-warning text-btcpay-dark'
            };
            this.items = [...this.items, {
                id,
                message,
                visible: true,
                classes: typeClasses[type] || typeClasses.info
            }];
            if (duration > 0) {
                setTimeout(() => this.dismiss(id), duration);
            }
            return id;
        },

        dismiss(id) {
            const idx = this.items.findIndex(t => t.id === id);
            if (idx === -1) return;
            const updated = [...this.items];
            updated[idx] = { ...updated[idx], visible: false };
            this.items = updated;
            setTimeout(() => {
                this.items = this.items.filter(t => t.id !== id);
            }, 300);
        }
    });

    // --- Tooltip Directive ---
    Alpine.directive('tooltip', (el, { expression }, { evaluate, cleanup }) => {
        const title = expression ? evaluate(expression) : (el.getAttribute('data-bs-title') || el.getAttribute('title') || '');
        if (!title) return;

        const placement = el.getAttribute('data-tooltip-placement') || el.getAttribute('data-bs-placement') || 'top';
        const isHtml = el.getAttribute('data-bs-html') === 'true';
        const customClass = el.getAttribute('data-bs-custom-class') || '';
        let tip = null;

        if (el.getAttribute('title')) {
            el.setAttribute('data-bs-title', el.getAttribute('title'));
            el.removeAttribute('title');
        }

        const show = () => {
            if (tip) return;
            tip = document.createElement('div');
            tip.className = 'tooltip bs-tooltip-' + placement;
            if (customClass) tip.classList.add(...customClass.split(' '));
            tip.setAttribute('role', 'tooltip');
            const arrow = document.createElement('div');
            arrow.className = 'tooltip-arrow';
            const inner = document.createElement('div');
            inner.className = 'tooltip-inner';
            if (isHtml) inner.innerHTML = title;
            else inner.textContent = title;
            tip.append(arrow, inner);
            document.body.appendChild(tip);

            const r = el.getBoundingClientRect();
            const tr = tip.getBoundingClientRect();
            let top, left;
            if (placement === 'bottom') { top = r.bottom + 4; left = r.left + (r.width - tr.width) / 2; }
            else if (placement === 'left') { top = r.top + (r.height - tr.height) / 2; left = r.left - tr.width - 4; }
            else if (placement === 'right') { top = r.top + (r.height - tr.height) / 2; left = r.right + 4; }
            else { top = r.top - tr.height - 4; left = r.left + (r.width - tr.width) / 2; }
            Object.assign(tip.style, { position: 'fixed', top: top + 'px', left: left + 'px', zIndex: '1080' });
            tip.classList.add('show');
        };

        const hide = () => {
            if (!tip) return;
            tip.classList.remove('show');
            const t = tip;
            tip = null;
            setTimeout(() => t.remove(), 150);
        };

        el.addEventListener('mouseenter', show);
        el.addEventListener('mouseleave', hide);
        el.addEventListener('focusin', show);
        el.addEventListener('focusout', hide);

        cleanup(() => {
            hide();
            el.removeEventListener('mouseenter', show);
            el.removeEventListener('mouseleave', hide);
            el.removeEventListener('focusin', show);
            el.removeEventListener('focusout', hide);
        });
    });

    // --- Backward-compat: window.bootstrap shim ---
    function getStore(el) {
        if (typeof el === 'string') el = document.querySelector(el);
        return el && el._x_dataStack ? el._x_dataStack[0] : null;
    }

    const shimInstances = new WeakMap();

    function makeShimClass(getInstanceFn) {
        const C = function(el, opts) {
            if (typeof el === 'string') el = document.querySelector(el);
            this._el = el;
            this._opts = opts || {};
            this._store = getInstanceFn(el);
            this._shown = false;
            shimInstances.set(el, this);
        };
        C.prototype.show = function() {
            if (this._store && this._store.open) { this._store.open(); return; }
            if (this._store && 'isOpen' in this._store) { this._store.isOpen = true; return; }
            this._shown = true;
            this._el.classList.add('show');
            this._el.style.display = 'block';
            this._el.dispatchEvent(new CustomEvent('show.bs.' + (this._type || 'component'), { bubbles: true }));
        };
        C.prototype.hide = function() {
            if (this._store && this._store.close) { this._store.close(); return; }
            if (this._store && 'isOpen' in this._store) { this._store.isOpen = false; return; }
            this._shown = false;
            this._el.classList.remove('show');
            this._el.dispatchEvent(new CustomEvent('hide.bs.' + (this._type || 'component'), { bubbles: true }));
        };
        C.prototype.toggle = function() {
            if (this._store && this._store.toggle) { this._store.toggle(); return; }
            this._shown ? this.hide() : this.show();
        };
        C.prototype.isShown = function() {
            if (this._store && 'isOpen' in this._store) return this._store.isOpen;
            return this._shown;
        };
        C.prototype.dispose = function() {};
        C.getInstance = (el) => {
            if (typeof el === 'string') el = document.querySelector(el);
            return shimInstances.get(el) || getInstanceFn(el);
        };
        C.getOrCreateInstance = (el, o) => {
            if (typeof el === 'string') el = document.querySelector(el);
            return shimInstances.get(el) || getInstanceFn(el) || new C(el, o);
        };
        return C;
    }

    const ModalShim = makeShimClass(getStore);
    const OffcanvasShim = makeShimClass(getStore);
    const CollapseShim = makeShimClass(getStore);
    const DropdownShim = makeShimClass(getStore);
    const TabShim = makeShimClass(getStore);

    const TooltipShim = function(el, opts = {}) {
        if (typeof el === 'string') el = document.querySelector(el);
        this._el = el;
        const title = opts.title || el.getAttribute('data-bs-title') || el.getAttribute('title') || '';
        const placement = opts.placement || el.getAttribute('data-bs-placement') || 'top';
        const trigger = opts.trigger || 'hover focus';
        const isHtml = opts.html || false;
        let tip = null;

        const show = () => {
            if (tip) return;
            tip = document.createElement('div');
            tip.className = 'tooltip bs-tooltip-' + placement;
            tip.setAttribute('role', 'tooltip');
            const arrow = document.createElement('div'); arrow.className = 'tooltip-arrow';
            const inner = document.createElement('div'); inner.className = 'tooltip-inner';
            if (isHtml) inner.innerHTML = title; else inner.textContent = title;
            tip.append(arrow, inner);
            document.body.appendChild(tip);
            const r = el.getBoundingClientRect();
            const tr = tip.getBoundingClientRect();
            let top, left;
            if (placement === 'bottom') { top = r.bottom + 4; left = r.left + (r.width - tr.width) / 2; }
            else if (placement === 'left') { top = r.top + (r.height - tr.height) / 2; left = r.left - tr.width - 4; }
            else if (placement === 'right') { top = r.top + (r.height - tr.height) / 2; left = r.right + 4; }
            else { top = r.top - tr.height - 4; left = r.left + (r.width - tr.width) / 2; }
            Object.assign(tip.style, { position: 'fixed', top: top + 'px', left: left + 'px', zIndex: '1080' });
            tip.classList.add('show');
        };
        const hide = () => { if (tip) { tip.remove(); tip = null; } };

        if (trigger.includes('hover')) { el.addEventListener('mouseenter', show); el.addEventListener('mouseleave', hide); }
        if (trigger.includes('focus')) { el.addEventListener('focusin', show); el.addEventListener('focusout', hide); }

        this.show = show;
        this.hide = hide;
        this.update = () => {};
        this.dispose = () => { hide(); el.removeEventListener('mouseenter', show); el.removeEventListener('mouseleave', hide); el.removeEventListener('focusin', show); el.removeEventListener('focusout', hide); };
    };
    TooltipShim.getInstance = () => null;
    TooltipShim.getOrCreateInstance = (el, o) => new TooltipShim(el, o);

    const ToastShim = function(el, opts = {}) {
        this._el = typeof el === 'string' ? document.querySelector(el) : el;
        this._auto = opts.autohide !== false;
        this._delay = opts.delay || 5000;
        this._shown = false;
    };
    ToastShim.prototype.show = function() {
        this._shown = true;
        this._el.classList.add('show');
        this._el.classList.remove('hide');
        if (this._auto) setTimeout(() => this.hide(), this._delay);
    };
    ToastShim.prototype.hide = function() {
        this._shown = false;
        this._el.classList.remove('show');
        setTimeout(() => { this._el.classList.add('hide'); this._el.dispatchEvent(new CustomEvent('hidden.bs.toast', { bubbles: true })); }, 300);
    };
    ToastShim.prototype.isShown = function() { return this._shown; };
    ToastShim.prototype.dispose = function() { this._el.classList.remove('show'); };
    ToastShim.getInstance = () => null;

    window.bootstrap = {
        Modal: ModalShim,
        Toast: ToastShim,
        Tooltip: TooltipShim,
        Offcanvas: OffcanvasShim,
        Collapse: CollapseShim,
        Dropdown: DropdownShim,
        Tab: TabShim
    };

    // --- Global helpers for non-Alpine contexts ---
    window.openModal = (selector, trigger) => {
        window.dispatchEvent(new CustomEvent('btcpay:open-modal', { detail: { target: selector, trigger } }));
    };

    window.openOffcanvas = (selector) => {
        window.dispatchEvent(new CustomEvent('btcpay:open-offcanvas', { detail: { target: selector } }));
    };

    // --- Legacy data-bs-toggle/dismiss click delegation ---
    function getTarget(el) {
        const s = el.getAttribute('data-bs-target') || el.getAttribute('href');
        return s ? document.querySelector(s) : null;
    }

    document.addEventListener('click', (e) => {
        let el;
        if ((el = e.target.closest('[data-bs-toggle="modal"]'))) {
            e.preventDefault();
            const t = getTarget(el);
            if (t) openModal('#' + t.id, el);
        }
        if ((el = e.target.closest('[data-bs-toggle="collapse"]'))) {
            e.preventDefault();
            const t = getTarget(el);
            if (t) {
                const store = getStore(t);
                if (store && store.toggle) store.toggle();
                else t.classList.toggle('show');
            }
        }
        if ((el = e.target.closest('[data-bs-toggle="tab"], [data-bs-toggle="pill"]'))) {
            e.preventDefault();
            const tgt = getTarget(el);
            const list = el.closest('[role="tablist"], .nav-tabs, .nav-pills, .nav');
            const prev = list ? list.querySelector('.nav-link.active, .active > .nav-link') : null;
            const prevPane = prev ? getTarget(prev) : null;
            if (prev && prev !== el) {
                prev.classList.remove('active');
                prev.setAttribute('aria-selected', 'false');
                if (prevPane) prevPane.classList.remove('show', 'active');
            }
            el.classList.add('active');
            el.setAttribute('aria-selected', 'true');
            if (tgt) tgt.classList.add('show', 'active');
        }
        if ((el = e.target.closest('[data-bs-toggle="dropdown"]'))) {
            e.preventDefault();
            const store = getStore(el.closest('.dropdown, .dropup'));
            if (store && store.toggle) store.toggle();
        }
        if ((el = e.target.closest('[data-bs-toggle="offcanvas"]'))) {
            e.preventDefault();
            const t = getTarget(el);
            if (t) openOffcanvas('#' + t.id);
        }
    });

    // Tooltip auto-init for remaining data-bs-toggle="tooltip" elements
    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
            new TooltipShim(el);
        });
    });
});
