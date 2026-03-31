function delegate(eventType, selector, handler, root) {
    (root || document).addEventListener(eventType, function(event) {
        const target = event.target.closest(selector)
        if (target) {
            event.target = target
            if (handler.call(this, event) === false) {
                event.preventDefault()
            }
        }
    })
}

const DEBOUNCE_TIMERS = {}
function debounce(key, fn, delay = 250) {
    clearTimeout(DEBOUNCE_TIMERS[key])
    DEBOUNCE_TIMERS[key] = setTimeout(fn, delay)
}

function noExponents(value) {
    const data = String(value).split(/[eE]/);
    if (data.length === 1) return data[0];

    let z = '', sign = value < 0 ? '-' : '',
        str = data[0].replace('.', ''),
        mag = Number(data[1]) + 1;

    if (mag < 0) {
        z = sign + '0.';
        while (mag++) z += '0';
        return z + str.replace(/^-/, '');
    }
    mag -= str.length;
    while (mag--) z += '0';
    return str + z;
}

// Date utility functions (Moment.js replacements)
function timeAgo(ms) {
    const seconds = Math.round((Date.now() - ms) / 1000);
    const absSeconds = Math.abs(seconds);
    const rtf = new Intl.RelativeTimeFormat('default', { numeric: 'auto' });
    if (absSeconds < 45) return rtf.format(-seconds, 'second');
    if (absSeconds < 2700) return rtf.format(-Math.round(seconds / 60), 'minute');
    if (absSeconds < 86400) return rtf.format(-Math.round(seconds / 3600), 'hour');
    if (absSeconds < 2592000) return rtf.format(-Math.round(seconds / 86400), 'day');
    if (absSeconds < 31536000) return rtf.format(-Math.round(seconds / 2592000), 'month');
    return rtf.format(-Math.round(seconds / 31536000), 'year');
}

function calendarDate(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = date.getTime() - new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    const timeStr = new Intl.DateTimeFormat('default', { hour: 'numeric', minute: '2-digit' }).format(date);
    if (diffDays === 0) return 'Today at ' + timeStr;
    if (diffDays === -1) return 'Yesterday at ' + timeStr;
    if (diffDays === 1) return 'Tomorrow at ' + timeStr;
    return new Intl.DateTimeFormat('default', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function formatLongDate(dateStr) {
    return new Intl.DateTimeFormat('en', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(dateStr));
}

function formatFullDateTime(dateStr) {
    return new Intl.DateTimeFormat('en', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true }).format(new Date(dateStr));
}

function formatShortDateTime(dateStr) {
    return new Intl.DateTimeFormat('default', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(dateStr));
}

function formatCSVDateTime(dateStr) {
    const d = new Date(dateStr);
    const pad = n => String(n).padStart(2, '0');
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
}

function timeDiffString(targetDate) {
    const diffMs = new Date(targetDate).getTime() - Date.now();
    const totalSec = Math.floor(diffMs / 1000);
    if (totalSec <= 0) return '';
    const days = Math.floor(totalSec / 86400);
    if (days > 0) return days + ' days';
    const hours = Math.floor(totalSec / 3600);
    if (hours > 0) return hours + ' hours';
    const minutes = Math.floor(totalSec / 60);
    if (minutes > 0) return minutes + ' minutes';
    return totalSec + ' seconds';
}

function toUnix(date) {
    return Math.floor(new Date(date).getTime() / 1000);
}

function fromUnix(timestamp) {
    return new Date(timestamp * 1000);
}

function endOfDayUnix(date) {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return Math.floor(d.getTime() / 1000);
}

function formatDateTimes(format, root) {
    root = root || document;
    // select only elements which haven't been initialized before, those without data-localized
    root.querySelectorAll("time[datetime]:not([data-localized])").forEach($el => {
        const date = new Date($el.getAttribute("datetime"));
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat
        const { dateStyle = 'short', timeStyle = 'short' } = $el.dataset;
        // initialize and set localized attribute
        $el.dataset.localized = new Intl.DateTimeFormat('default', { dateStyle, timeStyle }).format(date);
        // set text to chosen mode
        const mode = format || $el.dataset.initial;
        if ($el.dataset[mode]) $el.innerText = $el.dataset[mode];
    });
}
