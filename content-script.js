(function () {
    var normalizeNames = function (element) {
        if (!settings["fixNames"]) return;
        toArray(element.querySelectorAll(
            ".content > .l_profile, .lbody > .l_profile, .name > .l_profile, .foaf > .l_profile"
        )).forEach(function (node) {
            var login = node.getAttribute("href").substr(1);
            if (node.innerHTML != login) node.innerHTML = login;
        });
    };

    var quoteEventHandler = function (e) {
        if (!e.target.matches("a.quote") || e.button != 0) return;
        e.preventDefault();
        var caps = null;
        if (e.metaKey || e.ctrlKey) {
            var p = e.target.parentNode;
            var n = 1;
            while (true) {
                p = p.nextElementSibling;
                if (p && p.classList.contains("comment") && !p.classList.contains("bottomcomment")) {
                    n++;
                } else if (p && p.classList.contains("hiddencomments")) {
                    // pass
                } else if (p && p.classList.contains("expandcomment")) {
                    n += parseInt(p.querySelector("a").textContent);
                } else {
                    break;
                }
            }
            caps = new Array(n + 1).join("^");
        }
        var login = e.target.parentNode.querySelector("a.l_profile").getAttribute("href").substr(1);
        var body = closestParent(e.target, ".body");
        var ta = body.querySelector("textarea");
        if (!ta) {
            var comLink = body.querySelector(".l_comment");
            if (comLink) {
                comLink.click();
                ta = body.querySelector("textarea");
            }
        }
        if (ta) {
            if (caps && ta.value == "") {
                ta.value = caps + " ";
                if (e.shiftKey) ta.value += "this";
            } else {
                ta.value += "@" + login + " ";
            }
            ta.focus();
            ta.selectionStart = ta.selectionEnd = ta.value.length;
        }
    };

    var avatars = {};
    var getAvatar = function (login, callback) {
        if (login in avatars) {
            var a = avatars[login];
            if (a.url) {
                callback(a.url);
            } else {
                a["callbacks"].push(callback);
            }
        } else {
            avatars[login] = {url: null, callbacks: [callback]};
            fetchAvatar(login, function (login, url) {
                avatars[login]["callbacks"].forEach(function (cb) { cb(url); });
                avatars[login] = {url: url};
            });
        }
    };
    // Эта функция вызывается по одному разу для каждого логина
    var fetchAvatar = function (login, callback) {
        var a = document.querySelector("a[href='/" + login + "']");
        if (a) {
            var img = document.querySelector("img[src*='" + a.getAttribute("sid") + "']");
            if (img) {
                var url = img.src.replace(/-(\w+)-(\d+)$/, "-small-$2");
                callback(login, url);
                return;
            }
        }
        var xhr = new XMLHttpRequest();
        xhr.open('GET', "http://friendfeed-api.com/v2/picture/" + login + "?size=small");
        xhr.responseType = "blob";
        xhr.onload = function () {
            if (this.status != 200) return;
            callback(login, URL.createObjectURL(this.response));
        };
        xhr.send();
    };

    var quoteLinks = function (element) {
        if (!settings["replyLinks"]) return;
        if (settings["withAvatars"]) toArray(element.querySelectorAll(".entry:not(.with-avatars)")).forEach(function (node) { node.classList.add("with-avatars"); });
        var el;
        while (el = element.querySelector(".comments div.quote")) {
            var parentComments = closestParent(el, ".comments");
            var href = parentComments.parentNode.querySelector(".body > .info > .date").href;
            toArray(parentComments.querySelectorAll("div.quote")).forEach(function (node) {
                var parent = node.parentNode,
                    id = parent.getAttribute("id"),
                    a = document.createElement("A");
                a.className = node.className;
                a.title = node.title;
                a.href = href + "#" + id;
                if (settings["withAvatars"]) {
                    var login = parent.querySelector(".l_profile").getAttribute("href").substr(1);
                    getAvatar(login, function (url) { a.style.backgroundImage = "url(" + url + ")"; });
                }
                parent.insertBefore(a, node);
                parent.removeChild(node);
            });
        }
    };

    var lightBox = document.createElement("DIV");
    document.body.appendChild(lightBox);
    var lightBoxHTML = '<!--suppress HtmlUnknownTarget --><div class="light-box-shadow"><div class="light-box-container"><a href="{{LINK}}" target="_blank"><img src="{{URL}}" class="light-box-img"></a></div></div>';
    var imgOpeners = function (element) {
        if (settings["openImages"]) {
            toArray(element.querySelectorAll(".images.media a")).forEach(function (node) {
                var m = /^http:\/\/m\.friendfeed-media\.com\/(.*)/.exec(node.href);
                if (m) {
                    node.dataset["src"] = node.href;
                    node.href = "http://rss2lj.net/ffimg#" + m[1];
                }
            });
        }
        if (settings["lightBoxedImages"]) {
            toArray(element.querySelectorAll(".images.media a:not(.light-box-thumbnail)")).forEach(function (node) {
                if (node.dataset["src"]) {
                    node.classList.add("light-box-thumbnail");
                } else if (/^http:\/\/www\.flickr\.com\/photos\//.test(node.href)) {
                    var img = node.querySelector("img");
                    if (img && /^https?:\/\/farm\d+\.static\.?flickr\.com\//.test(img.src)) {
                        node.dataset["src"] = img.src.replace(/_.\.jpg$/, "_b.jpg");
                        node.classList.add("light-box-thumbnail");
                    }
                } else if (/^http:\/\/instagram\.com\/p\//.test(node.href)) {
                    var xhr = new XMLHttpRequest();
                    xhr.open('GET', "http://api.instagram.com/oembed?url=" + encodeURIComponent(node.href));
                    xhr.responseType = "json";
                    xhr.onload = function () {
                        node.dataset["src"] = this.response.url;
                        node.classList.add("light-box-thumbnail");
                    };
                    xhr.send();
                } else if (/\.(jpe?g|png|gif)/i.test(node.href)) {
                    node.dataset["src"] = node.href;
                    node.classList.add("light-box-thumbnail");
                }
            });
        }
    };

    var killDuck = function () {
        if (!settings["killDuck"]) return;
        toArray(document.querySelectorAll('body > div[style*="duck"]')).forEach(function (node) {
            node.style.width = 0;
            node.style.height = 0;
        });
    };


    var init = function () {
        killDuck();

        if (settings["replyLinks"]) {
            document.body.addEventListener("click", quoteEventHandler, false);
        }

        if (settings["lightBoxedImages"]) {
            document.body.addEventListener("keyup", function (e) {
                if (e.keyCode == 27 && lightBox.innerHTML != "") lightBox.innerHTML = "";
            });

            document.body.addEventListener("click", function (e) {
                if (closestParent(e.target, ".light-box-shadow", true)) {
                    lightBox.innerHTML = "";
                    return;
                }
                var th = closestParent(e.target, ".light-box-thumbnail", true);
                if (!th || e.button != 0) return;
                e.preventDefault();
                lightBox.innerHTML = lightBoxHTML.replace("{{URL}}", th.dataset["src"]).replace("{{LINK}}", th.href);
            }, false);
        }

        var box = document.createElement("DIV");
        box.className = "box";
        box.innerHTML = '<div class="box-bar ffnco">\n    <div class="box-corner"></div>\n    <div class="box-bar-text">&nbsp;</div>\n</div>\n<div class="box-body">\n    <ul>\n        <li>\n            <a href="#">Настройки FF&amp;Co</a>\n            <div class="updated">v {{VERSION}}</div>\n        </li>\n    </ul>\n</div>\n<div class="box-bottom">\n    <div class="box-corner"></div>\n    <div class="box-spacer"></div>\n</div>\n        '
            .replace("{{VERSION}}", chrome.runtime.getManifest().version);
        box.querySelector("a").onclick = function (e) {
            e.preventDefault();
            window.open(chrome.extension.getURL("options.html"));
        };
        document.getElementById("sidebar").appendChild(box);
    };

    var improveThis = function (element) {
        normalizeNames(element);
        quoteLinks(element);
        imgOpeners(element);
    };

    var closestParent = function (element, selector, withSelf) {
        withSelf = withSelf || false;
        var p = withSelf ? element : element.parentNode;
        if (p && p.nodeType == Node.ELEMENT_NODE) {
            return p.matches(selector) ? p : closestParent(p, selector);
        }
        return null;
    };

    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.addedNodes.length == 0) return;
            for (var i = 0, l = mutation.addedNodes.length; i < l; i++) {
                var node = mutation.addedNodes[i];
                if (node.nodeType == Node.ELEMENT_NODE) improveThis(node);
            }
        });
    });

    //////////////////////

    var bodyEl = document.getElementById("body");
    var settings;

    loadSettings(function (s) {
        settings = s;
        init();
        improveThis(bodyEl);
        observer.observe(bodyEl, { childList: true, subtree: true });
    });

})();
