function toArray(nl) { return Array.prototype.slice.call(nl); }

function closestParent(element, selector, withSelf) {
    withSelf = withSelf || false;
    var p = withSelf ? element : element.parentNode;
    if (p && p.nodeType == Node.ELEMENT_NODE) {
        return p.matches(selector) ? p : closestParent(p, selector);
    }
    return null;
}

function loadSettings(callback) {
    var boolNames = ["fixNames", "replyLinks", "openImages", "lightBoxedImages", "killDuck", "withAvatars", "highlightRefComments", "highlightAuthorComments", "newLines"];
    var settings = {};
    boolNames.forEach(function (name) {settings[name] = true;});
    settings["withAvatars"] = false;

    chrome.storage.sync.get("settings", function (it) {
        if (it && ("settings" in it)) {
            var s = it["settings"];
            boolNames.forEach(function (name) { if (name in s) settings[name] = s[name]; });
        }
        callback(settings);
    });
}

function saveSettings(settings, callback) {
    chrome.storage.sync.set({"settings": settings}, callback);
}