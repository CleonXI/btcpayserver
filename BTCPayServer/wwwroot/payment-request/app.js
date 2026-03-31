let app = null;
const eventAggregator = createEventBus();

document.addEventListener("DOMContentLoaded",function (ev) {
    const { createApp } = Vue;

    app = createApp({
        data: function () {
            return {
                srvModel: window.srvModel,
                connectionStatus: "",
                endDate: "",
                ended: false,
                endDiff: "",
                active: true,
                loading: false,
                timeoutState: "",
                customAmount: null,
                detailsShown: {}
            }
        },
        computed: {
            currency: function () {
                return this.srvModel.currency.toUpperCase();
            },
            settled: function () {
                return this.srvModel.amountDue <= 0;
            },
            lastUpdated: function () {
                return this.srvModel.lastUpdated && calendarDate(this.srvModel.lastUpdated);
            },
            lastUpdatedDate: function () {
                return this.srvModel.lastUpdated && formatFullDateTime(this.srvModel.lastUpdated);
            },
            active: function () {
                return !this.ended;
            }
        },
        methods: {
            updateComputed: function () {
                if (this.srvModel.expiryDate) {
                    this.endDate = formatLongDate(this.srvModel.expiryDate);
                    this.ended = new Date(this.srvModel.expiryDate) < new Date();
                } else {
                    this.ended = false;
                    this.endDate = null;
                    this.endDiff = null;
                }

                if (!this.ended && this.srvModel.expiryDate) {
                    this.endDiff = timeDiffString(this.srvModel.expiryDate);
                }

                setTimeout(this.updateComputed, 1000);
            },
            setLoading: function (val) {
                this.loading = val;
                if (this.timeoutState) {
                    clearTimeout(this.timeoutState);
                }
            },
            pay: function (amount) {
                this.setLoading(true);
                const self = this;
                self.timeoutState = setTimeout(function () {
                    self.setLoading(false);
                }, 5000);

                eventAggregator.$emit("pay", amount);
            },
            cancelPayment: function (amount) {
                this.setLoading(true);
                const self = this;
                self.timeoutState = setTimeout(function () {
                    self.setLoading(false);
                }, 5000);
                eventAggregator.$emit("cancel-invoice", amount);
            },
            formatDate: function (date) {
                return formatShortDateTime(date);
            },
            submitCustomAmountForm: function(e) {
                if (e) {
                    e.preventDefault();
                }
                if (this.srvModel.allowCustomPaymentAmounts && parseFloat(this.customAmount) < this.srvModel.amountDue){
                    this.pay(parseFloat(this.customAmount));
                } else {
                    this.pay();
                }
            },
            statusClass: function (state) {
                const [, status,, exceptionStatus] = state.match(/(\w*)\s?(\((\w*)\))?/) || [];
                switch (status) {
                    case "Expired":
                        switch (exceptionStatus) {
                            case "paidLate":
                            case "paidPartial":
                            case "paidOver":
                                return "unusual";
                            default:
                                return "expired";
                        }
                    default:
                        return status.toLowerCase();
                }
            },
            showDetails(invoiceId) {
                return this.detailsShown[invoiceId] === true;
            },
            toggleDetails(invoiceId) {
                if (this.detailsShown[invoiceId])
                    delete this.detailsShown[invoiceId];
                else
                    this.detailsShown[invoiceId] = true;
            }
        },
        mounted: function () {
            this.customAmount = noExponents(this.srvModel.amountDue || 0);
            hubListener.connect();
            const self = this;

            eventAggregator.$on("invoice-created", function (invoiceId) {
                self.setLoading(false);
                btcpay.appendAndShowInvoiceFrame(invoiceId);
            });
            eventAggregator.$on("invoice-cancelled", function (){
                self.setLoading(false);
                showToast('Payment cancelled', { type: 'info' });
            });
            eventAggregator.$on("cancel-invoice-error", function () {
                self.setLoading(false);
                showToast("Error cancelling payment", { type: 'error' });
            });
            eventAggregator.$on("invoice-error", function (error) {
                self.setLoading(false);
                let msg = "";
                if (typeof error === "string") {
                    msg = error;
                } else if (!error) {
                    msg = "Unknown Error";
                } else {
                    msg = JSON.stringify(error);
                }
                showToast("Error creating invoice: " + msg, { type: 'error' });
            });
            eventAggregator.$on("payment-received", function (amount, currency, prettyPMI, pmi) {
                const amountFormatted = noExponents(parseFloat(amount));
                const title = "New payment of " + amountFormatted + " " + currency + " " + prettyPMI;
                showToast(title, { type: 'success' });
            });
            eventAggregator.$on("info-updated", function (model) {
                self.srvModel = model;
            });
            eventAggregator.$on("connection-pending", function () {
                self.connectionStatus = "pending";
            });
            eventAggregator.$on("connection-failed", function () {
                self.connectionStatus = "failed";
            });
            eventAggregator.$on("connection-lost", function () {
                self.connectionStatus = "connection lost";
            });
            this.updateComputed();
        }
    });

    registerCollapsibleDirective(app);
    app.mount('#app');
});
