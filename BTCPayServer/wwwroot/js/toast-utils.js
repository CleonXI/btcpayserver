function showToast(message, options = {}) {
    const { type = 'info', duration = 5000, position = 'top-center' } = options;
    const typeClasses = {
        info: 'bg-info text-white',
        success: 'bg-success text-white',
        error: 'bg-danger text-white',
        warning: 'bg-warning text-dark'
    };
    const container = document.getElementById('toast-container') || createToastContainer(position);
    const toastEl = document.createElement('div');
    toastEl.className = `toast align-items-center border-0 ${typeClasses[type] || typeClasses.info}`;
    toastEl.setAttribute('role', 'alert');
    const wrapper = document.createElement('div');
    wrapper.className = 'd-flex';
    const body = document.createElement('div');
    body.className = 'toast-body';
    body.textContent = message;
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'btn-close btn-close-white me-2 m-auto';
    closeBtn.setAttribute('data-bs-dismiss', 'toast');
    wrapper.append(body, closeBtn);
    toastEl.appendChild(wrapper);
    container.appendChild(toastEl);
    const toast = new bootstrap.Toast(toastEl, { delay: duration });
    toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
    toast.show();
    return toast;
}

function createToastContainer(position) {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container position-fixed p-3 top-0 start-50 translate-middle-x';
    container.style.zIndex = '1090';
    document.body.appendChild(container);
    return container;
}
