let app = null;
const eventAggregator = createEventBus();

document.addEventListener("DOMContentLoaded",function (ev) {
    const { createApp } = Vue;

    const Contribute = {
        props: ["targetCurrency", "active", "perks", "inModal", "displayPerksRanking", "perksValue", "loading"],
        template: "#contribute-template"
    };

    const Perks = {
        props: ["perks", "targetCurrency", "active", "inModal","displayPerksRanking", "perksValue", "loading"],
        template: "#perks-template"
    };

    const Perk = {
        props: ["perk", "targetCurrency", "active", "inModal", "displayPerksRanking", "perksValue", "index", "loading"],
        template:  "#perk-template",
        components: {
            qrcode: VueQrcode
        },
        data: function () {
            return {
                amount: null,
                expanded: false
            }
        },
        computed: {
            canExpand: function(){
                return !this.expanded
                    && this.active &&
                    (this.perk.inventory==null || this.perk.inventory > 0)
            }
        },
        methods: {
            noExponents: noExponents,
            onContributeFormSubmit: function (e) {
                if (e) {
                    e.preventDefault();
                }
                if (!this.active || this.loading){
                    return;
                }
                const formUrl = this.$root.srvModel.formUrl;
                if (formUrl) {
                    location.href = formUrl + "?amount=" + this.amount + "&choiceKey=" + this.perk.id;
                    return;
                } else {
                    eventAggregator.$emit("contribute", { amount: parseFloat(this.amount), choiceKey: this.perk.id });
                }
            },
            expand: function(){
                if(this.canExpand){
            this.expanded = true;
        }
    },
    setAmount: function (amount) {
                if(typeof amount === "string"){
            amount = parseFloat(amount);
        }
                this.amount = this.perk.priceType === "Topup"? null : noExponents(amount || 0);
        this.expanded = false;
    }
        },
    mounted: function () {
        this.setAmount(this.perk.price);
    },
    watch: {
    perk: function (newValue, oldValue) {
                if(newValue.price.type === "Topup"){
            this.setAmount();
                }else if (newValue.price !== oldValue.price) {
            this.setAmount(newValue.price);
        }
    }
}
    };

app = createApp({
        data: function(){
        return {
            srvModel: window.srvModel,
            connectionStatus: "",
            endDate: "",
            startDate: "",
            started: false,
            ended: false,
            contributeModalOpen: false,
            endDiff: "",
            startDiff: "",
            active: true,
            animation: true,
            sound: true,
            lastUpdated: "",
            loading: false,
            timeoutState: 0
        }
    },
    computed: {
            raisedAmount: function(){
            return this.formatAmount(this.srvModel.info.currentAmount + this.srvModel.info.currentPendingAmount);
        },
            targetAmount: function(){
            return this.formatAmount(this.srvModel.targetAmount);
        },
            percentageRaisedAmount: function(){
                return parseFloat(this.srvModel.info.progressPercentage + this.srvModel.info.pendingProgressPercentage ).toFixed(2);
        },
            targetCurrency: function(){
            return this.srvModel.targetCurrency.toUpperCase();
        },
            paymentStats: function(){
            const keys = Object.keys(this.srvModel.info.paymentStats);
            const result = [];
            for (let i = 0; i < keys.length; i++) {
                const value = this.srvModel.info.paymentStats[keys[i]].percent.toFixed(2) + '%';
                const newItem = { key: keys[i], value: value, label: this.srvModel.info.paymentStats[keys[i]].label};
                newItem.lightning = this.srvModel.info.paymentStats[keys[i]].isLightning;
                result.push(newItem);
            }

                if(result.length === 1 && result[0].label === srvModel.targetCurrency){
                return [];
            }
            return result;
        },
            perks: function(){
            const result = [];
            for (let i = 0; i < this.srvModel.perks.length; i++) {
                const currentPerk = this.srvModel.perks[i];
                    if(Object.prototype.hasOwnProperty.call(this.srvModel.perkCount, currentPerk.id)){
                    currentPerk.sold = this.srvModel.perkCount[currentPerk.id];
                }
                    if(Object.prototype.hasOwnProperty.call(this.srvModel.perkValue, currentPerk.id)){
                    currentPerk.value = this.srvModel.perkValue[currentPerk.id];
                }
                result.push(currentPerk);
            }
            return result;
        },
        hasPerks() {
            return this.srvModel.perks && this.srvModel.perks.length > 0;
        }
    },
    methods: {
        updateComputed: function () {
            if (this.srvModel.endDate) {
                this.endDate = formatLongDate(this.srvModel.endDate);
                this.ended = new Date(this.srvModel.endDate) < new Date();
                }else{
                this.ended = false;
                this.endDate = null;
            }

            if (this.srvModel.startDate) {
                this.startDate = formatLongDate(this.srvModel.startDate);
                this.started = new Date(this.srvModel.startDate) < new Date();
                }else{
                this.started = true;
                this.startDate = null;
            }
                if(this.started && !this.ended && this.srvModel.endDate){
                    this.endDiff = timeDiffString(this.srvModel.endDate);
                }else{
                this.endDiff = null;
            }
                if(!this.started && this.srvModel.startDate){
                    this.startDiff = timeDiffString(this.srvModel.startDate);
                }else {
                this.startDiff = null;
            }
            this.lastUpdated = calendarDate(this.srvModel.info.lastUpdated);
            this.active = this.started && !this.ended;
            setTimeout(this.updateComputed, 1000);
        },
            setLoading: function(val){
            this.loading = val;
                if(this.timeoutState){
                clearTimeout(this.timeoutState);
            }
        },
            formatAmount: function(amount) {
            return formatAmount(amount, this.srvModel.currencyData.divisibility)
        },
        contribute() {
            if (!this.active || this.loading) return;

            if (this.hasPerks) {
                this.contributeModalOpen = true;
                window.openModal('#' + this.$refs.modalContribute.id);
            } else {
                if (this.srvModel.formUrl) {
                    window.location.href = this.srvModel.formUrl;
                    return;
                } else {
                    eventAggregator.$emit("contribute", { amount: null, choiceKey: null });
                }
            }
        }
    },
    mounted: function () {
        const modalEl = this.$refs.modalContribute;
        if (modalEl) {
            modalEl.addEventListener('hidden.bs.modal', () => { this.contributeModalOpen = false; });
        }
        hubListener.connect();
        const self = this;
        this.sound = this.srvModel.soundsEnabled;
        this.animation = this.srvModel.animationsEnabled;
        eventAggregator.$on("invoice-created", function (invoiceId) {
            btcpay.appendAndShowInvoiceFrame(invoiceId);

            self.contributeModalOpen = false;
            window.closeModal('#' + self.$refs.modalContribute.id);
            self.setLoading(false);
        });

        eventAggregator.$on("contribute", function () {
            self.setLoading(true);

                self.timeoutState = setTimeout(function(){
                self.setLoading(false);
                },5000);
        });
            eventAggregator.$on("invoice-error", function(error){

            self.setLoading(false);
            let msg = "";
                if(typeof error === "string"){
                msg = error;
                }else if(!error){
                msg = "Unknown Error";
                }else{
                msg = JSON.stringify(error);
            }

            showToast("Error creating invoice: " + msg, { type: 'error' });
        });
        eventAggregator.$on("payment-received", function (amount, currency, prettyPMI) {
            if (self.sound) {
                playRandomSound();
            }
            if (self.animation) {
                fireworks();
            }
            amount = noExponents(parseFloat(amount));
            showToast('New payment of ' + amount + " " + currency + " " + prettyPMI, { type: 'success' });
        });
        if (srvModel.disqusEnabled) {
            window.disqus_config = function () {
                this.page.url = window.location.href;
                this.page.identifier = self.srvModel.appId;
            };

            (function () {
                const d = document, s = d.createElement('script');
                s.src = "https://" + self.srvModel.disqusShortname + ".disqus.com/embed.js";
                s.async = true;
                s.setAttribute('data-timestamp', +new Date());
                (d.head || d.body).appendChild(s);

                const s2 = d.createElement('script');
                s2.src = "//" + self.srvModel.disqusShortname + ".disqus.com/count.js";
                s2.async = true;
                s.setAttribute('data-timestamp', +new Date());
                (d.head || d.body).appendChild(s);
            })();
        }
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

app.component('contribute', Contribute);
app.component('perks', Perks);
app.component('perk', Perk);
app.mount('#app');
});

function formatAmount(amount, divisibility) {
    return new Intl.NumberFormat(undefined, {
        minimumFractionDigits: divisibility,
        maximumFractionDigits: divisibility
    }).format(parseFloat(amount));
}
