(function () {
    var ZeroSpace = "\u200B";

    var prePost = function (ta) {
        var isEntry = (closestParent(ta, ".editentryform, .sharebox") !== null);
        ta.value = ta.value.replace(/^\n+/, "").replace(/\n+$/, "");
        if (!isEntry) {
            ta.value = ta.value.replace(/\n/g, "\n" + ZeroSpace);
        }
    };

    registerAction(function (node) {
        if (!settings["newLines"]) return;

        if (node === undefined) {
            document.addEventListener('keypress', function (e) {
                if (e.keyCode == 13 && e.target.nodeName === "TEXTAREA" && e.target.matches(".editentryform textarea, .commentform textarea, .sharebox textarea")) {
                    if (e.shiftKey) {
                        e.stopPropagation();
                    } else {
                        prePost(e.target);
                    }
                }
            }, true);

            document.addEventListener('submit', function (e) {
                var txtA = e.target.querySelector("textarea[name='body']");
                if (txtA && txtA.matches(".editentryform textarea, .commentform textarea, .sharebox textarea")) {
                    prePost(txtA);
                }
            }, true);

        }

        node = node || document.body;

        toArray(node.querySelectorAll(".comment .content, .entry .text")).forEach(function (node) {
            var c = node.firstChild,
                changed = false,
                isEntry = node.classList.contains("text"),
                findRe = isEntry ? /[\n\u2000]/ : /\u2000|\u200B/,
                splitRe = isEntry ? /[ \t]*[\u2000\n][ \t]*/ : /[ \t]*\u2000|\u200B[ \t]*/;

            while (c) {
                if (c.nodeType == Node.TEXT_NODE && findRe.test(c.nodeValue)) {
                    changed = true;
                    var fr = document.createDocumentFragment(),
                        nEmpties = 0;

                    c.nodeValue.split(splitRe).forEach(function (line) {
                        nEmpties = (line === "") ? nEmpties + 1 : 0;
                        if (nEmpties > 1) return;
                        if (line !== "") fr.appendChild(document.createTextNode(line));
                        fr.appendChild(document.createElement("br"));
                    });

                    fr.removeChild(fr.lastChild);
                    node.insertBefore(fr, c);
                    var lastCh = c.previousSibling;
                    node.removeChild(c);
                    c = lastCh;
                }
                c = c.nextSibling;
            }
            if (changed) node.normalize();
        });

        toArray(node.querySelectorAll("textarea")).forEach(function (node) {
            node.value = node.value.replace(/\u200B/g, "").replace(/\u2000/g, "\n");
        });

    });
})();
