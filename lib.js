var inChromeExt = (typeof chrome !== "undefined" && typeof chrome.extension !== "undefined");

var getSettings = function (toApply) {
    var settingsNames = [
        "fixNames", "replyLinks", "openImages", "lightBoxedImages",
        "killDuck", "withAvatars", "highlightRefComments", "highlightAuthorComments",
        "newLines", "markLinks"
    ];
    toApply = toApply || {};
    var settings = {};
    settingsNames.forEach(function (name) {
        settings[name] = (name in toApply) ? toApply[name] : (name !== "withAvatars");
    });
    return settings;
};

function toArray(nl) { return Array.prototype.slice.call(nl); }

function htmlSafe(s) {
    return s.toString().replace(/&/g, "&amp;")
        .replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
}

/**
 * h("tag.class", {attr: val}, child)
 * h("tag.class", child)
 * h("tag.class", {attr: val})
 * h("tag.class")
 * h(".class") // div
 *
 * Класс, заданный через атрибуты, перекрывает классы из строки тегов
 *
 * @param {String} tagName - tag или tag.class1.class2 (поддерживаются только классы)
 * @param {Object} [attrs]
 * @param {Node|string} [children]
 * @return {HTMLElement}
 */
function h(tagName, attrs, children) {
    var i, k;
    var tagParts = tagName.split(".");
    var tn = tagParts.shift() || "div";
    var el = document.createElement(tn);
    if (tagParts.length > 0) {
        el.className = tagParts.join(" ");
    }

    var chStart = 1;
    if (arguments.length > 1 && typeof attrs === "object" && !(attrs instanceof Node)) {
        for (k in attrs) if (attrs.hasOwnProperty(k)) el.setAttribute(k, attrs[k]);
        chStart = 2;
    }

    if (arguments.length > chStart) {
        for (i = chStart; i < arguments.length; i++) {
            var ch = arguments[i];
            if (ch instanceof Node) {
                el.appendChild(ch);
            } else if (typeof ch === "string") {
                el.appendChild(document.createTextNode(ch));
            }
        }
    }
    return el;
}

function closestParent(element, selector, withSelf) {
    withSelf = withSelf || false;
    var p = withSelf ? element : element.parentNode;
    if (p && p.nodeType == Node.ELEMENT_NODE) {
        return p.matches(selector) ? p : closestParent(p, selector);
    }
    return null;
}

/**
 * @param {Node} node
 * @param {String} selector
 * @return {Array<HTMLElement>}
 */
function selectAll(node, selector) {
    return toArray(node.querySelectorAll(selector));
}

var docLoaded = new Promise(function (resolve) {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(resolve, 0);
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
            if ("action" in event.data && event.data["action"] === "checkUpdates") {
                var now = Date.now();
                localStorage['ffc-sac-next-update'] = now + 3600 * 1000;
                var xhr = new XMLHttpRequest();
                xhr.open('GET', 'https://rawgit.com/davidmz/friendfeed-and-co/master/manifest.json');
                xhr.onload = function () {
                    try {
                        var manifest = JSON.parse(this.response);
                        if ('version' in manifest) {
                            localStorage['ffc-sac-version'] = manifest.version;
                            localStorage['ffc-sac-next-update'] = now + 24 * 3600 * 1000;
                            if (manifest.version != frfCoVersion) {
                                alert("Доступна новая версия: " + manifest.version + ". Она будет установлена после перезагрузки страницы.");
                            } else {
                                alert("У вас установлена последняя версия");
                            }
                        }
                    } catch (e) {
                    }
                };
                xhr.send();
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
            window.parent.postMessage({action: "getSettings", value: null}, self.parentOrigin);
        });
    },

    saveSettings: function (settings) {
        var self = this;
        return new Promise(function (resolve) {
            window.parent.postMessage({action: "saveSettings", value: settings}, self.parentOrigin);
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

