document.addEventListener("DOMContentLoaded",function () {
    const { createApp } = Vue;
    createApp({
        mixins: [posCommon],
        data () {
            return {
                _cartStore: null,
                amount: 0,
                persistState: true
            }
        },
        watch: {
            cart: {
                handler(newCart) {
                    if (!newCart || newCart.length === 0) {
                        if (this._cartStore && this._cartStore.close) this._cartStore.close();
                    }
                }
            }
        },
        methods: {
            toggleCart() {
                if (this._cartStore && this._cartStore.toggle) this._cartStore.toggle();
            }
        },
        mounted() {
            const el = this.$refs.cart;
            if (el && el._x_dataStack) {
                this._cartStore = el._x_dataStack[0];
            }
        }
    }).mount('#PosCart');
});
