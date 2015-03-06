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

} else if (window.parent) { // Фрейм настроек
    settingsStore = settingsStoreFrame;

} else { // Непонятно что
    settingsStore = settingsStoreZero;

}

if (!inChromeExt && ('ffc-sac-version' in localStorage)) {
    frfCoVersion = localStorage['ffc-sac-version'];
}

docLoaded.then(function () {
    settingsStore.init();
    settingsStore.loadSettings().then(function (s) {
        settings = s;
        actions.forEach(function (act) { act(); });
        observer.observe(document.body, {childList: true, subtree: true});
    });
});