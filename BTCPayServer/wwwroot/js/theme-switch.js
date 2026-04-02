(function() {
    const COLOR_MODES = ['light', 'dark'];
    const THEME_ATTR = 'data-btcpay-theme';
    const STORE_ATTR = 'btcpay-theme';
    const mediaMatcher = window.matchMedia('(prefers-color-scheme: dark)');

    window.setColorMode = userMode => {
        if (userMode === 'system') {
            window.localStorage.removeItem(STORE_ATTR);
        } else if (COLOR_MODES.includes(userMode)) {
            window.localStorage.setItem(STORE_ATTR, userMode);
        }
        const user = window.localStorage.getItem(STORE_ATTR);
        const system = mediaMatcher.matches ? COLOR_MODES[1] : COLOR_MODES[0];
        const mode = user || system;
        document.documentElement.setAttribute(THEME_ATTR, mode);
    }

    setColorMode(window.localStorage.getItem(STORE_ATTR));

    mediaMatcher.addEventListener('change', () => {
        const userMode = window.localStorage.getItem(STORE_ATTR);
        if (!userMode) setColorMode('system');
    });
})();
