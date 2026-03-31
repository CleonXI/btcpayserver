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
    toastEl.innerHTML = `<div class="d-flex"><div class="toast-body">${message}</div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div>`;
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
