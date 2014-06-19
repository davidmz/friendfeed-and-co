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
        if (e.button != 0) return;
        e.preventDefault();
        var caps = null;
        if (e.ctrlKey) {
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
                if (e.shiftKey) ta.value += "THIS";
            } else {
                ta.value += "@" + login + " ";
            }
            ta.focus();
            ta.selectionStart = ta.selectionEnd = ta.value.length;
        }
    };

    var quoteLinks = function (element) {
        if (!settings["replyLinks"]) return;
        toArray(element.querySelectorAll("div.quote")).forEach(function (node) {
            var parent = node.parentNode;
            var id = parent.getAttribute("id");
            var href = closestParent(parent, ".body").querySelector(".body > .info > .date").href;
            var a = document.createElement("A");
            a.className = node.className;
            a.title = node.title;
            a.href = href + "#" + id;
            parent.insertBefore(a, node);
            parent.removeChild(node);
            a.addEventListener("click", quoteEventHandler, false);
        });
    };

    var imgOpeners = function (element) {
        if (!settings["openImages"]) return;
        toArray(element.querySelectorAll(".images.media a")).forEach(function (node) {
            var m = /^http:\/\/m\.friendfeed-media\.com\/(.*)/.exec(node.href);
            if (m) {
                node.href = "http://rss2lj.net/ffimg#" + m[1];
            }
        });
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

        var box = document.createElement("DIV");
        box.className = "box";
        box.innerHTML = '<div class="box-bar ffnco">\n    <div class="box-corner"></div>\n    <div class="box-bar-text">&nbsp;</div>\n</div>\n<div class="box-body">\n    <ul>\n        <li><a href="#">Настройки FF&amp;Co</a></li>\n    </ul>\n</div>\n<div class="box-bottom">\n    <div class="box-corner"></div>\n    <div class="box-spacer"></div>\n</div>\n        ';
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

    var closestParent = function (element, selector) {
        var p = element.parentNode;
        if (p) {
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
