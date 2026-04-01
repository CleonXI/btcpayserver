/* jshint browser: true, strict: false, maxlen: false, maxstatements: false */
(function () {
    let showingInvoice = false;
    const scriptSrcRegex = /\/modal\/btcpay\.js(\?v=.*)?$/;
    const supportsCurrentScript = ("currentScript" in document);
    let thisScript = "";
    if (supportsCurrentScript) {
        thisScript = document.currentScript.src;
    }
    else {
        for (let i = 0; i < document.scripts.length; i++) {
            const script = document.scripts[i];
            if (script.src.match(scriptSrcRegex)) {
                thisScript = script.src;
            }
        }
    }

    function warn() {
        if (window.console && window.console.warn) {
            window.console.warn.apply(window.console, arguments);
        }
    }

    if (window.btcpay) {
        warn('btcpay.js attempted to initialize more than once.');
        return;
    }

    let iframe = document.createElement('iframe');
    iframe.name = 'btcpay';
    iframe.class = 'btcpay';
    iframe.style.display = 'none';
    iframe.style.border = 0;
    iframe.style.position = 'fixed';
    iframe.style.top = 0;
    iframe.style.left = 0;
    iframe.style.height = '100%';
    iframe.style.width = '100%';
    iframe.style.zIndex = '2000';
    // Removed, see https://github.com/btcpayserver/btcpayserver/issues/2139#issuecomment-768223263
    // iframe.setAttribute('allowtransparency', 'true');

    // https://web.dev/async-clipboard/#permissions-policy-integration
    iframe.setAttribute('allow', 'clipboard-read; clipboard-write')

    let origin = 'http://chat.btcpayserver.org join us there, and initialize this with your origin url through setApiUrlPrefix';
    const scriptMatch = thisScript.match(scriptSrcRegex)
    if (scriptMatch) {
        // We can't just take the domain as btcpay can run under a sub path with RootPath
        origin = thisScript.slice(0, thisScript.length - scriptMatch[0].length);
    }
    // urlPrefix should be site root without trailing slash
    function setApiUrlPrefix(urlPrefix) {
        origin = stripTrailingSlashes(urlPrefix);
    }
    function stripTrailingSlashes(site) {
        return site.replace(/\/+$/, "");
    }

    let onModalWillEnterMethod = function () { };
    let onModalWillLeaveMethod = function () { };
    let onModalReceiveMessageMethod = function (event) { };

    function showFrame() {
        if (window.document.getElementsByName('btcpay').length === 0) {
            window.document.body.appendChild(iframe);
        }
        onModalWillEnterMethod();
        iframe.style.display = 'block';
        iframe.removeAttribute('aria-hidden');
    }

    function hideFrame() {
        onModalWillLeaveMethod();
        iframe.style.display = 'none';
        iframe.setAttribute('aria-hidden', 'true');
        showingInvoice = false;
        iframe = window.document.body.removeChild(iframe);
    }

    function onModalWillEnter(customOnModalWillEnter) {
        onModalWillEnterMethod = customOnModalWillEnter;
    }

    function onModalWillLeave(customOnModalWillLeave) {
        onModalWillLeaveMethod = customOnModalWillLeave;
    }

    function onModalReceiveMessage(customOnModalReceiveMessage) {
        onModalReceiveMessageMethod = customOnModalReceiveMessage;
    }
    let readerAbortController = null;

    function startNfcScan() {
        const ndef = new NDEFReader();
        readerAbortController = new AbortController()
        readerAbortController.signal.onabort = () => {
            this.scanning = false;
        };
        ndef.scan({ signal: readerAbortController.signal }).then(() => {
            ndef.onreading = event => {
                const message = event.message;
                const record = message.records[0];
                const textDecoder = new TextDecoder('utf-8');
                const data = textDecoder.decode(record.data);

                // Send NFC data back to the iframe
                if (iframe) {
                    iframe.contentWindow.postMessage({ action: 'nfc:data', data }, '*');
                }
            };
            ndef.onreadingerror = () => {
                // Send error message back to the iframe
                if (iframe) {
                    iframe.contentWindow.postMessage({ action: 'nfc:error' }, '*');
                }
            };
        }).catch(console.error);
    }

    function receiveMessage(event) {
        if (!origin.startsWith(event.origin) || !showingInvoice) {
            return;
        }
        if (event.data === 'close') {
            hideFrame();
        } else if (event.data === 'loaded') {
            showFrame();
        } else if (event.data === 'nfc:startScan') {
            startNfcScan();
        } else if (event.data === 'nfc:abort') {
            if (readerAbortController) {
                readerAbortController.abort()
            }
        } else if (event.data && event.data.open) {
            const uri = event.data.open;
            if (uri.indexOf('bitcoin:') === 0) {
                window.location = uri;
            }
        }
        onModalReceiveMessageMethod(event);
    }

    function appendInvoiceFrame(invoiceId, params) {
        showingInvoice = true;
        window.document.body.appendChild(iframe);

        let paymentMethodId = null;
        const animateEntrance = params && typeof params === 'object'
            ? params.animateEntrance
            : undefined;

        if (typeof params === 'string') {
            // Shorthand: btcpay.showInvoice(id, "BTC-LN")
            paymentMethodId = params;
        } else if (params && typeof params === 'object') {
            paymentMethodId = params.paymentMethodId || null;
        }

        let invoiceUrl;
        if (paymentMethodId) {
            invoiceUrl =
                origin +
                '/i/' +
                invoiceId +
                '/' +
                encodeURIComponent(paymentMethodId) +
                '?view=modal';
        } else {
            invoiceUrl = origin + '/invoice?id=' + invoiceId + '&view=modal';
        }

        if (animateEntrance === false) {
            invoiceUrl += '&animateEntrance=false';
        }
        iframe.src = invoiceUrl;
    }

    function appendAndShowInvoiceFrame(invoiceId, params) {
        appendInvoiceFrame(invoiceId, params);
        showFrame();
    }

    function setButtonListeners() {
        const buttons = window.document.querySelectorAll('[data-btcpay-button]');
        for (let i = 0; i < buttons.length; i++) {
            const b = buttons[i];
            b.addEventListener('submit', showFrame);
        }
    }

    window.addEventListener('load', function load() {
        window.removeEventListener('load', load);
    });

    window.addEventListener('message', receiveMessage, false);
    setButtonListeners();

    window.btcpay = {
        showFrame: showFrame,
        hideFrame: hideFrame,
        showInvoice: appendInvoiceFrame,
        appendInvoiceFrame: appendInvoiceFrame,
        appendAndShowInvoiceFrame: appendAndShowInvoiceFrame,
        onModalWillEnter: onModalWillEnter,
        onModalWillLeave: onModalWillLeave,
        setApiUrlPrefix: setApiUrlPrefix,
        onModalReceiveMessage: onModalReceiveMessage
    };
})();
