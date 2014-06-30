(function () {
    registerAction(function (node) {
        if (!settings["replyLinks"] || !settings["highlightRefComments"]) return;
        node = node || document.body;

        // ссылки с @login
        toArray(node.querySelectorAll(".l_profile.user-link"))
            .forEach(function (node) { hlOver(node, ".comment-from-" + node.getAttribute("href").substr(1)); });

        // ссылки с ^^^
        toArray(node.querySelectorAll(".comment .content"))
            .forEach(function (node) {
                var txtNode = node.firstChild;
                if (!txtNode || txtNode.nodeType != Node.TEXT_NODE || !/^\s+[↑^]+/.test(txtNode.nodeValue)) return;

                var text = txtNode.nodeValue, m;
                while ((m = /^(\s+)([↑^]+)/.exec(text)) !== null) {
                    var n = m[2].length;
                    var refComm = getRefComment(node.parentNode, n);
                    if (refComm) {
                        node.insertBefore(document.createTextNode(m[1]), txtNode);
                        var a = document.createElement("span");
                        a.className = "ups";
                        a.appendChild(document.createTextNode(m[2]));
                        hlOver(a, "#" + refComm.id);
                        node.insertBefore(a, txtNode);
                    } else {
                        node.insertBefore(document.createTextNode(m[0]), txtNode);
                    }
                    text = text.substr(m[0].length);
                }
                node.insertBefore(document.createTextNode(text), txtNode);
                node.removeChild(txtNode);
                node.normalize();
            });

    });

    var getRefComment = function (comm, n) {
        var refComm = null;
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
        return refComm;
    };

    var linkMouseOver = function (e) {
        var selector;
        if ((selector = e.target.dataset["hlSelector"])) {
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
        if (el.dataset["hlSelector"]) return;
        el.dataset["hlSelector"] = selector;
        el.addEventListener("mouseover", linkMouseOver);
        el.addEventListener("mouseout", linkMouseOut);
    };
})();

