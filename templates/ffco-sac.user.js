// ==UserScript==
// @name FriendFeed & Co
// @namespace https://github.com/davidmz/friendfeed-and-co
// @version <%= version %>
// @description Some cool features for FriendFeed
// @include https://friendfeed.com/*
// @include http://friendfeed.com/*
// @icon https://cdn.rawgit.com/davidmz/friendfeed-and-co/master/icon128.png
// ==/UserScript==
(function () {
    var version = '<%= version %>',
        nextUpdate = 0,
        now = Date.now(),
        store = localStorage,
        pInt = parseInt,
        verName = 'ffc-sac-version',
        updName = 'ffc-sac-next-update',
        cmp;

    var cmpVer = function (v1, v2) {
        var p1 = v1.split("."), p2 = v2.split("."),
            l1 = p1.length, l2 = p2.length,
            l = Math.min(l1, l2), i;
        for (i = 0; i < l; i++) {
            if (pInt(p1[i]) < pInt(p2[i])) return -1;
            if (pInt(p1[i]) > pInt(p2[i])) return 1;
        }
        if (l1 < l2) return -1;
        if (l1 > l2) return 1;
        return 0;
    };

    if (verName in store) {
        if ((cmp = cmpVer(store[verName], version)) > 0) {
            version = store[verName];
        } else if (cmp < 0) {
            store[verName] = version;
        }
        nextUpdate = pInt(store[updName]);
        if (isNaN(nextUpdate)) {
            nextUpdate = 0;
        }
    }

    if (now > nextUpdate) {
        store[updName] = now + 3600 * 1000;
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://rawgit.com/davidmz/friendfeed-and-co/master/manifest.json');
        xhr.responseType = "json";
        xhr.onload = function () {
            var manifest = this.response;
            if ('version' in manifest) {
                store[verName] = manifest.version;
                store[updName] = now + 24 * 3600 * 1000;
            }
        };
        xhr.send();
    }

    var e = document.createElement("script");
    e.src = '//cdn.rawgit.com/davidmz/friendfeed-and-co/v' + version + '/ffco-sac.min.js';
    e.type = "text/javascript";
    e.charset = "utf-8";
    e.async = true;
    document.head.appendChild(e);
})();