function startAuthCheck(url, onSuccess) {
    function check() {
        const request = new XMLHttpRequest();
        request.onload = function () {
            if (request.readyState === 4 && request.status === 200) {
                setTimeout(check, 1000);
            } else if (request.readyState === 4) {
                onSuccess();
            }
        };
        request.open("GET", url, true);
        request.send();
    }
    check();
}
