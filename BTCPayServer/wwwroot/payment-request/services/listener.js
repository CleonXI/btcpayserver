const hubListener = createHubListener(
    srvModel.hubPath,
    'ListenToPaymentRequest',
    srvModel.id,
    ['PaymentReceived', 'InvoiceCreated', 'InvoiceConfirmed', 'InvoiceError', 'InfoUpdated', 'InvoiceCancelled', 'CancelInvoiceError'],
    {
        'pay': ['Pay', true],
        'cancel-invoice': ['CancelUnpaidPendingInvoice', true]
    }
);
