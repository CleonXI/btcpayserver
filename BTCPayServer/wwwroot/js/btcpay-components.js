(function () {
    const TRANSITION = 300;
    const instances = new WeakMap();

    function fire(el, name) {
        return el.dispatchEvent(new CustomEvent(name, { bubbles: true, cancelable: true }));
    }

    function getTarget(el) {
        const s = el.getAttribute('data-bs-target') || el.getAttribute('href');
        return s ? document.querySelector(s) : null;
    }

    function scrollLock(lock) {
        document.body.classList.toggle('overflow-hidden', lock);
        document.body.style.overflow = lock ? 'hidden' : '';
    }

    function addBackdrop(onClick) {
        const bd = document.createElement('div');
        bd.className = 'modal-backdrop fade';
        document.body.appendChild(bd);
        bd.offsetHeight;
        bd.classList.add('show');
        if (onClick) bd.addEventListener('click', onClick);
        return bd;
    }

    function dropBackdrop(bd) {
        if (!bd) return;
        bd.classList.remove('show');
        setTimeout(() => bd.remove(), TRANSITION);
    }

    function get(C, el) { const m = instances.get(C); return m ? m.get(el) : null; }
    function getOrNew(C, el, o) { return get(C, el) || new C(el, o); }
    function store(C, el, i) { if (!instances.has(C)) instances.set(C, new WeakMap()); instances.get(C).set(el, i); }
    function drop(C, el) { const m = instances.get(C); if (m) m.delete(el); }

    class Modal {
        constructor(el, opts = {}) {
            this._el = typeof el === 'string' ? document.querySelector(el) : el;
            this._opts = opts; this._bd = null; this._shown = false;
            this._esc = (e) => { if (e.key === 'Escape' && this._shown) this.hide(); };
            store(Modal, this._el, this);
        }
        show() {
            if (this._shown) return;
            if (!fire(this._el, 'show.bs.modal')) return;
            this._shown = true;
            scrollLock(true);
            this._bd = addBackdrop();
            this._el.style.display = 'block';
            this._el.offsetHeight;
            this._el.classList.add('show');
            this._el.setAttribute('aria-modal', 'true');
            this._el.setAttribute('role', 'dialog');
            this._el.removeAttribute('aria-hidden');
            document.addEventListener('keydown', this._esc);
            setTimeout(() => fire(this._el, 'shown.bs.modal'), TRANSITION);
        }
        hide() {
            if (!this._shown) return;
            if (!fire(this._el, 'hide.bs.modal')) return;
            this._shown = false;
            this._el.classList.remove('show');
            document.removeEventListener('keydown', this._esc);
            setTimeout(() => {
                this._el.style.display = 'none';
                this._el.setAttribute('aria-hidden', 'true');
                this._el.removeAttribute('aria-modal');
                this._el.removeAttribute('role');
                scrollLock(false);
                dropBackdrop(this._bd);
                this._bd = null;
                fire(this._el, 'hidden.bs.modal');
            }, TRANSITION);
        }
        toggle() { this._shown ? this.hide() : this.show(); }
        static getInstance(el) { return get(Modal, el); }
        static getOrCreateInstance(el, o) { return getOrNew(Modal, el, o); }
    }

    class Toast {
        constructor(el, opts = {}) {
            this._el = typeof el === 'string' ? document.querySelector(el) : el;
            this._delay = opts.delay || 5000;
            this._auto = opts.autohide !== false;
            this._timer = null; this._shown = false;
            store(Toast, this._el, this);
        }
        isShown() { return this._shown; }
        show() {
            if (this._shown) return;
            if (!fire(this._el, 'show.bs.toast')) return;
            this._shown = true;
            this._el.classList.add('show');
            this._el.classList.remove('hide');
            setTimeout(() => fire(this._el, 'shown.bs.toast'), TRANSITION);
            if (this._auto) this._timer = setTimeout(() => this.hide(), this._delay);
        }
        hide() {
            if (!this._shown) return;
            if (!fire(this._el, 'hide.bs.toast')) return;
            clearTimeout(this._timer);
            this._shown = false;
            this._el.classList.remove('show');
            setTimeout(() => { this._el.classList.add('hide'); fire(this._el, 'hidden.bs.toast'); }, TRANSITION);
        }
        dispose() { clearTimeout(this._timer); this._el.classList.remove('show'); drop(Toast, this._el); }
        static getInstance(el) { return get(Toast, el); }
    }

    class Tooltip {
        constructor(el, opts = {}) {
            this._el = typeof el === 'string' ? document.querySelector(el) : el;
            this._title = opts.title || this._el.getAttribute('data-bs-title') || this._el.getAttribute('title') || '';
            this._place = opts.placement || this._el.getAttribute('data-bs-placement') || 'top';
            this._trigger = opts.trigger || this._el.getAttribute('data-bs-trigger') || 'hover focus';
            this._isHtml = opts.html || this._el.getAttribute('data-bs-html') === 'true';
            this._cls = opts.customClass || this._el.getAttribute('data-bs-custom-class') || '';
            this._tip = null; this._vis = false;
            this._enter = () => this.show(); this._leave = () => this.hide();
            this._focIn = () => this.show(); this._focOut = () => this.hide();
            if (this._el.getAttribute('title')) {
                this._el.setAttribute('data-bs-title', this._el.getAttribute('title'));
                this._el.removeAttribute('title');
            }
            if (this._trigger.includes('hover')) {
                this._el.addEventListener('mouseenter', this._enter);
                this._el.addEventListener('mouseleave', this._leave);
            }
            if (this._trigger.includes('focus')) {
                this._el.addEventListener('focusin', this._focIn);
                this._el.addEventListener('focusout', this._focOut);
            }
            store(Tooltip, this._el, this);
        }
        _makeTip() {
            const t = document.createElement('div');
            t.className = 'tooltip bs-tooltip-' + this._place;
            if (this._cls) t.classList.add(...this._cls.split(' '));
            t.setAttribute('role', 'tooltip');
            const arrow = document.createElement('div'); arrow.className = 'tooltip-arrow';
            const inner = document.createElement('div'); inner.className = 'tooltip-inner';
            if (this._isHtml) inner.innerHTML = this._title; else inner.textContent = this._title;
            t.append(arrow, inner);
            return t;
        }
        _pos() {
            if (!this._tip) return;
            const r = this._el.getBoundingClientRect();
            const tr = this._tip.getBoundingClientRect();
            let top, left;
            if (this._place === 'bottom') { top = r.bottom + 4; left = r.left + (r.width - tr.width) / 2; }
            else if (this._place === 'left') { top = r.top + (r.height - tr.height) / 2; left = r.left - tr.width - 4; }
            else if (this._place === 'right') { top = r.top + (r.height - tr.height) / 2; left = r.right + 4; }
            else { top = r.top - tr.height - 4; left = r.left + (r.width - tr.width) / 2; }
            Object.assign(this._tip.style, { position: 'fixed', top: top + 'px', left: left + 'px', zIndex: '1080' });
        }
        show() {
            if (this._vis || !this._title) return;
            this._vis = true;
            this._tip = this._makeTip();
            document.body.appendChild(this._tip);
            this._pos();
            this._tip.offsetHeight;
            this._tip.classList.add('show');
        }
        hide() {
            if (!this._vis || !this._tip) return;
            this._vis = false;
            this._tip.classList.remove('show');
            const tip = this._tip; this._tip = null;
            setTimeout(() => tip.remove(), TRANSITION);
        }
        update() { if (this._tip) this._pos(); }
        dispose() {
            this.hide();
            this._el.removeEventListener('mouseenter', this._enter);
            this._el.removeEventListener('mouseleave', this._leave);
            this._el.removeEventListener('focusin', this._focIn);
            this._el.removeEventListener('focusout', this._focOut);
            drop(Tooltip, this._el);
        }
        static getInstance(el) { return get(Tooltip, el); }
    }

    class Offcanvas {
        constructor(el, opts = {}) {
            this._el = typeof el === 'string' ? document.querySelector(el) : el;
            this._bd = null; this._useBd = opts.backdrop !== false; this._shown = false;
            store(Offcanvas, this._el, this);
        }
        show() {
            if (this._shown) return;
            if (!fire(this._el, 'show.bs.offcanvas')) return;
            this._shown = true;
            if (this._useBd) this._bd = addBackdrop(() => this.hide());
            scrollLock(true);
            this._el.classList.add('showing');
            this._el.offsetHeight;
            this._el.classList.add('show');
            this._el.classList.remove('showing');
            this._el.removeAttribute('aria-hidden');
            setTimeout(() => fire(this._el, 'shown.bs.offcanvas'), TRANSITION);
        }
        hide() {
            if (!this._shown) return;
            if (!fire(this._el, 'hide.bs.offcanvas')) return;
            this._shown = false;
            this._el.classList.add('hiding');
            this._el.classList.remove('show');
            setTimeout(() => {
                this._el.classList.remove('hiding');
                this._el.setAttribute('aria-hidden', 'true');
                scrollLock(false);
                dropBackdrop(this._bd);
                this._bd = null;
                fire(this._el, 'hidden.bs.offcanvas');
            }, TRANSITION);
        }
        toggle() { this._shown ? this.hide() : this.show(); }
        static getInstance(el) { return get(Offcanvas, el); }
        static getOrCreateInstance(el, o) { return getOrNew(Offcanvas, el, o); }
    }

    class Collapse {
        constructor(el, opts = {}) {
            this._el = typeof el === 'string' ? document.querySelector(el) : el;
            this._shown = this._el.classList.contains('show');
            store(Collapse, this._el, this);
            if (opts.toggle) this.toggle();
        }
        show() {
            if (this._shown) return;
            if (!fire(this._el, 'show.bs.collapse')) return;
            this._shown = true;
            this._el.classList.remove('collapse');
            this._el.classList.add('collapsing');
            this._el.style.height = '0px';
            this._el.offsetHeight;
            this._el.style.height = this._el.scrollHeight + 'px';
            setTimeout(() => {
                this._el.classList.remove('collapsing');
                this._el.classList.add('collapse', 'show');
                this._el.style.height = '';
                fire(this._el, 'shown.bs.collapse');
            }, TRANSITION);
        }
        hide() {
            if (!this._shown) return;
            if (!fire(this._el, 'hide.bs.collapse')) return;
            this._shown = false;
            this._el.style.height = this._el.getBoundingClientRect().height + 'px';
            this._el.offsetHeight;
            this._el.classList.remove('collapse', 'show');
            this._el.classList.add('collapsing');
            this._el.style.height = '';
            setTimeout(() => {
                this._el.classList.remove('collapsing');
                this._el.classList.add('collapse');
                fire(this._el, 'hidden.bs.collapse');
            }, TRANSITION);
        }
        toggle() { this._shown ? this.hide() : this.show(); }
        static getInstance(el) { return get(Collapse, el); }
        static getOrCreateInstance(el, o) { return getOrNew(Collapse, el, o); }
    }

    class Dropdown {
        constructor(el) {
            this._el = typeof el === 'string' ? document.querySelector(el) : el;
            this._menu = this._el.parentElement.querySelector('.dropdown-menu');
            this._shown = false;
            this._docClick = (e) => {
                if (!this._el.contains(e.target) && !this._menu.contains(e.target)) this.hide();
            };
            store(Dropdown, this._el, this);
        }
        show() {
            if (this._shown || !this._menu) return;
            if (!fire(this._el, 'show.bs.dropdown')) return;
            this._shown = true;
            this._menu.classList.add('show');
            this._el.classList.add('show');
            this._el.setAttribute('aria-expanded', 'true');
            document.addEventListener('click', this._docClick, true);
            setTimeout(() => fire(this._el, 'shown.bs.dropdown'), TRANSITION);
        }
        hide() {
            if (!this._shown || !this._menu) return;
            if (!fire(this._el, 'hide.bs.dropdown')) return;
            this._shown = false;
            this._menu.classList.remove('show');
            this._el.classList.remove('show');
            this._el.setAttribute('aria-expanded', 'false');
            document.removeEventListener('click', this._docClick, true);
            fire(this._el, 'hidden.bs.dropdown');
        }
        toggle() { this._shown ? this.hide() : this.show(); }
        static getInstance(el) { return get(Dropdown, el); }
        static getOrCreateInstance(el, o) { return getOrNew(Dropdown, el, o); }
    }

    class Tab {
        constructor(el) {
            this._el = typeof el === 'string' ? document.querySelector(el) : el;
            store(Tab, this._el, this);
        }
        show() {
            const tgt = getTarget(this._el);
            if (!tgt) return;
            const list = this._el.closest('[role="tablist"], .nav-tabs, .nav-pills, .nav');
            const prev = list ? list.querySelector('.nav-link.active, .active > .nav-link') : null;
            const prevPane = prev ? getTarget(prev) : null;
            if (prev && prev !== this._el) {
                fire(prev, 'hide.bs.tab');
                prev.classList.remove('active');
                prev.setAttribute('aria-selected', 'false');
                if (prevPane) prevPane.classList.remove('show', 'active');
                fire(prev, 'hidden.bs.tab');
            }
            fire(this._el, 'show.bs.tab');
            this._el.classList.add('active');
            this._el.setAttribute('aria-selected', 'true');
            tgt.classList.add('show', 'active');
            fire(this._el, 'shown.bs.tab');
        }
        static getInstance(el) { return get(Tab, el); }
        static getOrCreateInstance(el, o) { return getOrNew(Tab, el, o); }
    }

    window.bootstrap = { Modal, Toast, Tooltip, Offcanvas, Collapse, Dropdown, Tab };

    document.addEventListener('click', (e) => {
        let el;
        if ((el = e.target.closest('[data-bs-toggle="modal"]'))) {
            e.preventDefault();
            const t = getTarget(el);
            if (t) Modal.getOrCreateInstance(t).show();
        }
        if ((el = e.target.closest('[data-bs-toggle="dropdown"]'))) {
            e.preventDefault();
            Dropdown.getOrCreateInstance(el).toggle();
        }
        if ((el = e.target.closest('[data-bs-toggle="collapse"]'))) {
            e.preventDefault();
            const t = getTarget(el);
            if (t) Collapse.getOrCreateInstance(t).toggle();
        }
        if ((el = e.target.closest('[data-bs-toggle="tab"], [data-bs-toggle="pill"]'))) {
            e.preventDefault();
            Tab.getOrCreateInstance(el).show();
        }
        if ((el = e.target.closest('[data-bs-toggle="offcanvas"]'))) {
            e.preventDefault();
            const t = getTarget(el);
            if (t) Offcanvas.getOrCreateInstance(t).toggle();
        }
        if ((el = e.target.closest('[data-bs-dismiss="modal"]'))) {
            const m = el.closest('.modal');
            if (m) { const i = Modal.getInstance(m); if (i) i.hide(); }
        }
        if ((el = e.target.closest('[data-bs-dismiss="alert"]'))) {
            const a = el.closest('.alert');
            if (a) { a.classList.remove('show'); setTimeout(() => a.remove(), TRANSITION); }
        }
        if ((el = e.target.closest('[data-bs-dismiss="offcanvas"]'))) {
            const o = el.closest('.offcanvas');
            if (o) { const i = Offcanvas.getInstance(o); if (i) i.hide(); }
        }
        if ((el = e.target.closest('[data-bs-dismiss="toast"]'))) {
            const t = el.closest('.toast');
            if (t) {
                const i = Toast.getInstance(t);
                if (i) i.hide();
                else { t.classList.remove('show'); setTimeout(() => { t.classList.add('hide'); fire(t, 'hidden.bs.toast'); }, TRANSITION); }
            }
        }
    });
})();
