(function () {
    var profileLogin = null;

    registerAction(function (node) {
            if (!settings["replyLinks"]) return;

            if (node === undefined) {
                // Если мы на странице профиля, запоминаем логин
                var profileLink = document.querySelector('.profile h1 a.name');
                if (profileLink) profileLogin = profileLink.getAttribute("href").substr(1);

                document.body.addEventListener("click", quoteEventHandler, false);
            }

            node = node || document.body;

            // После редактирования комментария FF помещает его в span
            // Достаём его оттуда (это, вроде бы, ничему не вредит)
            if (node.classList.contains("comment") && node.parentNode && node.parentNode.tagName === "SPAN") {
                var span = node.parentNode;
                span.parentNode.insertBefore(node, span);
                span.parentNode.removeChild(span);
            }

            toArray(node.querySelectorAll(".expandcomment")).forEach(function (node) {
                node.style.counterIncrement = "comment " + parseInt(node.querySelector("a").textContent)
            });

            var el;
            while (el = node.querySelector(".comments div.quote")) {
                var parentComments = closestParent(el, ".comments");
                var href = parentComments.parentNode.querySelector(".body > .info > .date").href;

                var threadAuthorLogin = profileLogin,
                    threadAuthors = parentComments.parentNode.querySelectorAll(".ebody > .title > .name > .l_profile");

                if (threadAuthors.length > 0) {
                    threadAuthorLogin = threadAuthors[threadAuthors.length - 1].getAttribute("href").substr(1);
                }

                // Замена div.quote на ссылки
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
                    }
                    if (login === threadAuthorLogin) {
                        parent.classList.add("comment-from-post-author");
                    }
                    parent.dataset["author"] = login ? login : "";
                    parent.insertBefore(a, node);
                    parent.removeChild(node);
                });

                // Ссылки с @login внутри комментариев
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
                            }
                            var lastCh = fr.appendChild(document.createTextNode(str.substr(ptr)));
                            node.insertBefore(fr, c);
                            node.removeChild(c);
                            c = lastCh;
                        }
                        c = c.nextSibling;
                    }
                    node.normalize();
                });

            }
        }
    );

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
            if (n > 4) {
                caps = "^\u00D7" + n;
            } else {
                caps = new Array(n + 1).join("^");
            }
        }
        var login = e.target.parentNode.dataset["author"];
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
            if (caps) {
                ta.value += caps + " ";
                if (e.shiftKey) ta.value += "this";
            } else if (login) {
                ta.value += "@" + login + " ";
            }
            ta.focus();
            ta.selectionStart = ta.selectionEnd = ta.value.length;
        }
    };

})();