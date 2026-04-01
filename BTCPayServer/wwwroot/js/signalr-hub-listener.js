function createHubListener(hubPath, listenMethod, listenId, events, commands) {
    const connection = new signalR.HubConnectionBuilder().withUrl(hubPath).build();

    connection.onclose(function () {
        eventAggregator.$emit("connection-lost");
        console.error("Connection was closed. Attempting reconnect in 2s");
        setTimeout(connect, 2000);
    });

    events.forEach(function (event) {
        connection.on(event, function (...args) {
            const emitName = event.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
            eventAggregator.$emit(emitName, ...args);
        });
    });

    function connect() {
        eventAggregator.$emit("connection-pending");
        connection
            .start()
            .then(function () {
                connection.invoke(listenMethod, listenId);
            })
            .catch(function (err) {
                eventAggregator.$emit("connection-failed");
                console.error("Could not connect to backend. Retrying in 2s", err);
                setTimeout(connect, 2000);
            });
    }

    Object.keys(commands).forEach(function (eventName) {
        const config = commands[eventName];
        const method = config[0];
        const prependId = config[1];
        eventAggregator.$on(eventName, function (...args) {
            if (prependId) {
                connection.invoke(method, listenId, ...args);
            } else {
                connection.invoke(method, ...args);
            }
        });
    });

    return { connect };
}
