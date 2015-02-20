var settings,
    actions = [];

function registerAction(action) { actions.push(action); }

var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
        if (mutation.addedNodes.length == 0) return;
        toArray(mutation.addedNodes).forEach(function (node) {
            if (node.nodeType == Node.ELEMENT_NODE) {
                actions.forEach(function (act) { act(node); });
            }
        });
    });
});

var settingsStore;

if (inChromeExt) { // Расширение
    settingsStore = settingsStoreChrome;

} else if (location.hostname === "friendfeed.com") { // Встроенный скрипт
    settingsStore = settingsStoreSAC;
    // CSS
    docLoaded.then(function () {
        var cssUrl = scriptRoot + "content.css";
        var link = document.createElement("link");
        link.setAttribute("rel", "stylesheet");
        link.setAttribute("type", "text/css");
        link.setAttribute("href", cssUrl);
        document.head.appendChild(link);
    });

} else if (window.parent) { // Фрейм настроек
    settingsStore = settingsStoreFrame;

} else { // Непонятно что
    settingsStore = settingsStoreZero;

}

docLoaded.then(function () {
    settingsStore.init();
    settingsStore.loadSettings().then(function (s) {
        settings = s;
        actions.forEach(function (act) { act(); });
        observer.observe(document.body, {childList: true, subtree: true});
    });
});