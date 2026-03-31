function createEventBus() {
    const listeners = {};
    return {
        $on(event, handler) {
            (listeners[event] || (listeners[event] = [])).push(handler);
        },
        $off(event, handler) {
            if (!listeners[event]) return;
            if (handler) {
                listeners[event] = listeners[event].filter(h => h !== handler);
            } else {
                delete listeners[event];
            }
        },
        $emit(event, ...args) {
            if (listeners[event]) {
                listeners[event].forEach(h => h(...args));
            }
        }
    };
}
