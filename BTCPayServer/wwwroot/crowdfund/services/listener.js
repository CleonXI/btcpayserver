const hubListener = createHubListener(
    srvModel.hubPath,
    'ListenToCrowdfundApp',
    srvModel.appId,
    ['PaymentReceived', 'InvoiceCreated', 'InvoiceError', 'InfoUpdated'],
    {
        'contribute': ['CreateInvoice', false]
    }
);
