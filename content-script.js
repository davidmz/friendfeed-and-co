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
        var login = e.target.parentNode.querySelector(".l_profile:not(.user-link)").getAttribute("href").substr(1);
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

    var linkMouseOver = function (e) {
        var selector;
        if ((selector = e.target.dataset["selector"])) {
            toArray(closestParent(e.target, ".comments").querySelectorAll(".comment")).forEach(function (node) {
                if (node.matches(selector)) {
                    node.classList.add("highlighted");
                } else {
                    node.classList.remove("highlighted");
                }
            });
        }
    };
    var linkMouseOut = function (e) {
        toArray(closestParent(e.target, ".comments").querySelectorAll(".comment.highlighted")).forEach(function (node) {
            node.classList.remove("highlighted");
        });
    };

    var hlOver = function (el, selector) {
        el.dataset["selector"] = selector;
        el.addEventListener("mouseover", linkMouseOver);
        el.addEventListener("mouseout", linkMouseOut);
    };

    var quoteLinks = function (element) {
        if (!settings["replyLinks"]) return;
        if (settings["withAvatars"]) toArray(element.querySelectorAll(".entry:not(.with-avatars)")).forEach(function (node) { node.classList.add("with-avatars"); });
        var postAuthor,
            h1link = document.querySelector('.profile h1 a.name');
        if (h1link) { // страница отдельного фида
            postAuthor = h1link.href.split('/').pop();
        }
        var el;
        while (el = element.querySelector(".comments div.quote")) {
            var parentComments = closestParent(el, ".comments");
            var entry = parentComments.parentNode;
            var href = entry.querySelector(".body > .info > .date").href;
            var entryname = entry.querySelector(".ebody .name");
            if (!h1link) {
                if (entryname.childNodes[2].textContent.trim() == ':') { // третья нода -- двоеточие? значит, сообщество
                    postAuthor = entryname.querySelector(".l_profile:nth-child(2)").innerHTML; // автор поста в сообществе -- второй из нескольких .l_profile
                } else { // обычный пост
                    postAuthor = entryname.querySelector(".l_profile").innerHTML;  // автор поста -- первый из нескольких .l_profile
                }
            }
            toArray(parentComments.querySelectorAll(".comment .content")).forEach(function (node) {
                var c = node.firstChild;
                while (c) {
                    if (c.nodeType == Node.TEXT_NODE && /\B@([a-z0-9_]+)/.test(c.nodeValue)) {
                        var re = /\B@([a-z0-9_]+)/g,
                            str = c.nodeValue,
                            fr = document.createDocumentFragment(),
                            m, ptr = 0;
                        while ((m = re.exec(str)) !== null) {
                            var match = m[0], login = m[1], off = m.index;
                            fr.appendChild(document.createTextNode(str.substr(ptr, off - ptr)));
                            ptr = off + match.length;

                            var a = fr.appendChild(document.createElement("a"));
                            a.appendChild(document.createTextNode(match));
                            a.href = "/" + login;
                            a.className = "l_profile user-link";
                            if (settings["highlightRefComments"]) {
                                hlOver(a, ".comment-from-" + login);
                            }
                        }
                        var lastCh = fr.appendChild(document.createTextNode(str.substr(ptr)));
                        node.insertBefore(fr, c);
                        node.removeChild(c);
                        c = lastCh;
                    }
                    c = c.nextSibling;
                }
                c = node.firstChild;
                if (settings["highlightRefComments"] && c.nodeType == Node.TEXT_NODE && /^\s+[↑^]+/.test(c.nodeValue)) {
                    m = /^(\s+)([↑^]+)/.exec(c.nodeValue);

                    var n = m[2].length;
                    var comm = node.parentNode, refComm = null;
                    while (true) {
                        comm = comm.previousElementSibling;
                        if (comm && comm.classList.contains("comment")) {
                            n--;
                            if (n == 0) {
                                refComm = comm;
                                break;
                            }
                        } else if (comm && comm.classList.contains("hiddencomments")) {
                            // pass
                        } else if (comm && comm.classList.contains("expandcomment")) {
                            n -= parseInt(comm.querySelector("a").textContent);
                            if (n <= 0) break;
                        } else {
                            break;
                        }
                    }

                    if (refComm) {
                        node.insertBefore(document.createTextNode(m[1]), c);
                        a = document.createElement("span");
                        a.className = "ups";
                        a.appendChild(document.createTextNode(m[2]));
                        hlOver(a, "#" + refComm.id);
                        node.insertBefore(a, c);
                        node.insertBefore(document.createTextNode(c.nodeValue.substr(m[0].length)), c);
                        node.removeChild(c);
                    }
                }
                if (settings["highlightAuthorComments"]) {
                    var commentAuthor = node.querySelector(".l_profile").href.split('/').pop(); // достаю ник автора из ссылки, потому что не могу доверять содержимому ссылки (может быть изменено ранее)
                    if (commentAuthor == postAuthor) {
                        node.classList.add("comment-from-post-author");
                    }
                }
                node.normalize();
            });
            toArray(parentComments.querySelectorAll("div.quote")).forEach(function (node) {
                var parent = node.parentNode,
                    id = parent.getAttribute("id"),
                    a = document.createElement("A");
                a.className = node.className;
                a.title = node.title;
                a.href = href + "#" + id;
                var profile = parent.querySelector(".l_profile:not(.user-link)"),
                    login = null;
                if (profile) {
                    // элемента может не быть, пример: https://friendfeed.com/aepiots-blogs/a8c56d00/amber-alert-8-month-old-abducted-in-moms-car
                    login = profile.getAttribute("href").substr(1);
                    parent.classList.add("comment-from-" + login);
                    // hlOver(a, ".comment-from-" + login);
                    // hlOver(profile, ".comment-from-" + login);
                }
                if (settings["withAvatars"] && login) getAvatar(login, function (url) { a.style.backgroundImage = "url(" + url + ")"; });
                parent.insertBefore(a, node);
                parent.removeChild(node);
            });
        };
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
                var img = node.querySelector("img");
                if (node.dataset["src"]) {
                    node.classList.add("light-box-thumbnail");
                } else if (/\.(jpe?g|png|gif)/i.test(node.href)) {
                    node.dataset["src"] = node.href;
                    node.classList.add("light-box-thumbnail");
                } else if (/^http:\/\/m\.friendfeed-media\.com\//.test(node.href)) {
                    node.dataset["src"] = node.href;
                    node.classList.add("light-box-thumbnail");
                } else if (/^http:\/\/www\.flickr\.com\/photos\//.test(node.href)) {
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
                } else if (/^http:\/\/imgur\.com\//.test(node.href)) {
                    node.dataset["src"] = "http://i.imgur.com/" + node.href.match(/^http:\/\/imgur\.com\/(gallery\/)?([^#]+)/)[2] + ".jpg";
                    node.classList.add("light-box-thumbnail");
                } else if (/^http:\/\/gyazo\.com\//.test(node.href)) {
                    node.dataset["src"] = "http://i.gyazo.com/" + node.href.match(/^http:\/\/gyazo\.com\/([^#]+)/)[1] + ".png";
                    node.classList.add("light-box-thumbnail");
                } else if (/soup\.io\/asset/.test(img.src)) {
                    node.dataset["src"] = img.src.replace(/_\d+(\.\w+)$/, "$1");
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
