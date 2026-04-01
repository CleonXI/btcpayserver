function initLabelEditModal(baseUrl) {
    delegate('click', '.btn-delete', function () {
        return false;
    });

    delegate('click', '.btn-edit', function (event) {
        const button = event.target.closest('.btn-edit');
        const label = button.dataset.label;
        const modal = document.getElementById('EditLabelModal');
        modal.querySelector('#EditLabelInput').value = label;
        modal.querySelector('#OldLabel').value = label;
        modal.querySelector('form').action = baseUrl + '/' + encodeURIComponent(label) + '/edit';
        new bootstrap.Modal(modal).show();
    });
}
