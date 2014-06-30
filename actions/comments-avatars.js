(function () {
    registerAction(function (node) {
        if (!settings["replyLinks"] || !settings["withAvatars"]) return;
        if (node === undefined) {
            var styleEl = document.head.appendChild(document.createElement('style'));
            styleEl.type = 'text/css';
            styleEl.title = 'avatars';
            style = styleEl.sheet;
            console.log(styleEl, style)
        }
        node = node || document.body;

        toArray(node.querySelectorAll(".entry:not(.with-avatars)"))
            .forEach(function (node) { node.classList.add("with-avatars"); });

        toArray(node.querySelectorAll(".comments > .comment:not(.ffco-with-avatar) .quote"))
            .forEach(function (node) {
                var comment = node.parentNode;
                comment.classList.add("ffco-with-avatar");
                var login = comment.dataset["author"];
                if (login && !(login in avatars)) {
                    avatars[login] = true;
                    fetchAvatar(login);
                }
            });
    });

    var style = null,
        avatars = {};

    var fetchAvatar = function (login) {
        var a = document.querySelector("a[href='/" + login + "']");
        if (a) {
            var img = document.querySelector("img[src*='" + a.getAttribute("sid") + "']");
            if (img) {
                var url = img.src.replace(/-(\w+)-(\d+)$/, "-small-$2");
                style.insertRule(".comment-from-" + login + " > .quote { background-image: url(" + url + "); }", 0);
                return;
            }
        }
        var xhr = new XMLHttpRequest();
        xhr.open('GET', "http://friendfeed-api.com/v2/picture/" + login + "?size=small");
        xhr.responseType = "blob";
        xhr.onload = function () {
            if (this.status != 200) return;
            var url = URL.createObjectURL(this.response);
            style.insertRule(".comment-from-" + login + " > .quote { background-image: url(" + url + "); }", 0);
            setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
        };
        xhr.send();
    };
})();
