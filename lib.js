var inChromeExt = (typeof chrome !== "undefined" && typeof chrome.extension !== "undefined");
var scriptRoot = inChromeExt ? null : document.currentScript.src.replace(/[a-z.-]+\.js([?#]|$)/, "");

var getSettings = function (toApply) {
    var settingsNames = ["fixNames", "replyLinks", "openImages", "lightBoxedImages", "killDuck", "withAvatars", "highlightRefComments", "highlightAuthorComments", "newLines"];
    toApply = toApply || {};
    var settings = {};
    settingsNames.forEach(function (name) {
        settings[name] = (name in toApply) ? toApply[name] : (name !== "withAvatars");
    });
    return settings;
};

function toArray(nl) { return Array.prototype.slice.call(nl); }

function closestParent(element, selector, withSelf) {
    withSelf = withSelf || false;
    var p = withSelf ? element : element.parentNode;
    if (p && p.nodeType == Node.ELEMENT_NODE) {
        return p.matches(selector) ? p : closestParent(p, selector);
    }
    return null;
}

var docLoaded = new Promise(function (resolve) {
    if (/* inChromeExt ||*/ document.readyState === 'complete' || document.readyState === 'interactive') {
        resolve();
    } else {
        document.addEventListener("DOMContentLoaded", resolve);
    }
});


////////////////////////////////

var settingsStoreChrome = {
    init: function () {},

    loadSettings: function () {
        return new Promise(function (resolve) {
            var settings;
            chrome.storage.sync.get("settings", function (it) {
                if (it && ("settings" in it)) {
                    settings = getSettings(it["settings"]);
                } else {
                    settings = getSettings();
                }
                resolve(settings);
            });
        });
    },

    saveSettings: function (settings) {
        return new Promise(function (resolve) { chrome.storage.sync.set({"settings": settings}, resolve); });
    }
};

var settingsStoreSAC = {
    init: function () {
        var self = this;
        // мы во внедрённом скрипте
        window.addEventListener('message', function (event) {
            if ("action" in event.data && event.data["action"] === "getSettings") {
                self.loadSettings().then(function (settings) {
                    event.source.postMessage(settings, event.origin);
                });
            }
            if ("action" in event.data && event.data["action"] === "saveSettings") {
                self.saveSettings(event.data["value"]);
            }
        });
    },

    loadSettings: function () {
        return new Promise(function (resolve) {
            var settings;
            try {
                settings = getSettings(JSON.parse(localStorage['ffc-sac-settings']));
            } catch (e) {
                settings = getSettings();
            }
            resolve(settings);
        });
    },

    saveSettings: function (settings) {
        localStorage['ffc-sac-settings'] = JSON.stringify(settings);
        return new Promise(function (resolve) { setTimeout(resolve, 0); });
    }
};

var settingsStoreFrame = {
    init: function () {
        var self = this;
        this.loadResolver = null;
        this.parentOrigin = location.protocol + "//friendfeed.com";
        window.addEventListener('message', function (event) {
            if (event.origin === self.parentOrigin && self.loadResolver !== null) {
                self.loadResolver(getSettings(event.data));
                self.loadResolver = null;
            }
        });
    },

    loadSettings: function () {
        var self = this;
        return new Promise(function (resolve) {
            self.loadResolver = resolve;
            window.parent.contentWindow.postMessage({action: "getSettings", value: null}, self.parentOrigin);
        });
    },

    saveSettings: function (settings) {
        var self = this;
        return new Promise(function (resolve) {
            window.parent.contentWindow.postMessage({action: "saveSettings", value: settings}, self.parentOrigin);
            setTimeout(resolve, 0);
        });
    }
};

//noinspection JSUnusedLocalSymbols
var settingsStoreZero = {
    init: function () {},
    loadSettings: function () { return new Promise(function (resolve) { setTimeout(function () { resolve(getSettings()); }, 0); }); },
    saveSettings: function (settings) { return new Promise(function (resolve) { setTimeout(resolve, 0); }); }
};

