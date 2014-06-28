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

loadSettings(function (s) {
    settings = s;
    actions.forEach(function (act) { act(); });
    observer.observe(document.body, { childList: true, subtree: true });
});

