function showToast(message, options = {}) {
    const { type = 'info', duration = 5000 } = options;

    if (typeof Alpine !== 'undefined' && Alpine.store('toasts')) {
        return Alpine.store('toasts').show(message, { type, duration });
    }

    const typeClasses = {
        info: 'bg-btcpay-info text-btcpay-white',
        success: 'bg-btcpay-success text-btcpay-white',
        error: 'bg-btcpay-danger text-btcpay-white',
        warning: 'bg-btcpay-warning text-btcpay-dark'
    };
    const container = document.getElementById('toast-container') || createToastContainer();
    const toastEl = document.createElement('div');
    toastEl.className = `toast align-items-center border-0 show ${typeClasses[type] || typeClasses.info}`;
    toastEl.setAttribute('role', 'alert');
    const wrapper = document.createElement('div');
    wrapper.className = 'flex';
    const body = document.createElement('div');
    body.className = 'toast-body';
    body.textContent = message;
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'btn-close btn-close-white mr-2 m-auto';
    closeBtn.onclick = () => { toastEl.remove(); };
    wrapper.append(body, closeBtn);
    toastEl.appendChild(wrapper);
    container.appendChild(toastEl);
    if (duration > 0) {
        setTimeout(() => toastEl.remove(), duration);
    }
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container fixed p-4 top-0 start-50 translate-middle-x';
    container.style.zIndex = '1090';
    document.body.appendChild(container);
    return container;
}

window.showToast = showToast;
