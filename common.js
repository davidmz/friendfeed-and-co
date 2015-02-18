var isStandAlone = (typeof chrome === "undefined" || typeof chrome.runtime === "undefined");
var scriptRoot = isStandAlone ? document.currentScript.src.replace(/[a-z.-]+\.js([?#]|$)/, "") : null;

function toArray(nl) { return Array.prototype.slice.call(nl); }

function closestParent(element, selector, withSelf) {
    withSelf = withSelf || false;
    var p = withSelf ? element : element.parentNode;
    if (p && p.nodeType == Node.ELEMENT_NODE) {
        return p.matches(selector) ? p : closestParent(p, selector);
    }
    return null;
}

function myVersion() {
    if (!isStandAlone) {
        return chrome.runtime.getManifest().version;
    } else {
        return _myVersion + " (SAC)";
    }
}

if (isStandAlone) {
    // CSS
    (function () {
        var cssUrl = scriptRoot + "content.css";
        var link = document.createElement("link");
        link.setAttribute("rel", "stylesheet");
        link.setAttribute("type", "text/css");
        link.setAttribute("href", cssUrl);
        document.head.appendChild(link);
    })();

    // Storage
    var msgR = {
        reqId: 0,
        callbacks: {},
        origin: "",
        win: null
    };
    var initMessenger = new Promise(function (resolve) {
        var scriptBare = scriptRoot.replace(/^.*?\/\//, "");
        msgR.origin = location.protocol + "//" + scriptBare.replace(/\/.*/, "");
        var frameUrl = location.protocol + "//" + scriptBare + "messenger.html";
        var createIframe = function () {
            var frame = document.body.appendChild(document.createElement('iframe'));
            frame.style.display = 'none';
            frame.src = frameUrl;
            frame.addEventListener('load', function () {
                msgR.win = frame.contentWindow;
                resolve(msgR);
            });
        };
        if (document.readyState === 'complete') {
            createIframe();
        } else {
            document.addEventListener("DOMContentLoaded", createIframe);
        }
    });

    window.addEventListener('message', function (event) {
        if (event.origin == msgR.origin) {
            if (event.data && "reqId" in event.data && event.data.reqId in msgR.callbacks) {
                msgR.callbacks[event.data.reqId](event.data);
                delete msgR.callbacks[event.data.reqId];
            }
        }
    });
    var sendMessage = function (msg) {
        return new Promise(function (resolve) {
            initMessenger.then(function (msgR) {
                msg["reqId"] = ++msgR.reqId;
                msgR.callbacks[msgR.reqId] = resolve;
                msgR.win.postMessage(msg, msgR.origin);
            });
        });
    };
}

var loadSettings = new Promise(function (resolve) {
    var boolNames = ["fixNames", "replyLinks", "openImages", "lightBoxedImages", "killDuck", "withAvatars", "highlightRefComments", "highlightAuthorComments", "newLines"];
    var settings = {};
    boolNames.forEach(function (name) {settings[name] = true;});
    settings["withAvatars"] = false;
    if (!isStandAlone) {
        chrome.storage.sync.get("settings", function (it) {
            if (it && ("settings" in it)) {
                var s = it["settings"];
                boolNames.forEach(function (name) { if (name in s) settings[name] = s[name]; });
            }
            resolve(settings);
        });
    } else {
        sendMessage({'action': 'get', 'key': 'ffc-sac-settings'})
            .then(function (ss) {
                var s = {};
                try {
                    s = JSON.parse(ss.resp);
                } catch (e) {
                }
                boolNames.forEach(function (name) { if (name in s) settings[name] = s[name]; });
                resolve(settings);
            });
    }
});

function saveSettings(settings) {
    if (!isStandAlone) {
        return new Promise(function (resolve) { chrome.storage.sync.set({"settings": settings}, resolve); });
    } else {
        return sendMessage({'action': 'set', 'key': 'ffc-sac-settings', value: JSON.stringify(settings)});
    }
}
