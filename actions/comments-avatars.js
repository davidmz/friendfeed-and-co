(function () {
    registerAction(function (node) {
        if (!settings["replyLinks"] || !settings["withAvatars"]) return;
        node = node || document.body;

        toArray(node.querySelectorAll(".entry:not(.with-avatars)"))
            .forEach(function (node) { node.classList.add("with-avatars"); });

        toArray(node.querySelectorAll(".comment:not(.ffco-with-avatar) .quote"))
            .forEach(function (node) {
                var comment = node.parentNode;
                comment.classList.add("ffco-with-avatar");
                var login = comment.dataset["author"];
                if (login) {
                    getAvatar(login, function (url) { node.style.backgroundImage = "url(" + url + ")"; });
                }
            });
    });

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
})();
