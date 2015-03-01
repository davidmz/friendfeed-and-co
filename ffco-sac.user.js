// ==UserScript==
// @name FriendFeed & Co
// @namespace https://github.com/davidmz/friendfeed-and-co
// @version 1.36
// @description Some cool features for FriendFeed
// @include https://friendfeed.com/*
// @include http://friendfeed.com/*
// @icon https://cdn.rawgit.com/davidmz/friendfeed-and-co/master/icon128.png
// ==/UserScript==
(function () {
    var version = '1.36',
        nextUpdate = 0,
        now = Date.now();

    if ('ffc-sac-version' in localStorage) {
        version = localStorage['ffc-sac-version'];
        nextUpdate = parseInt(localStorage['ffc-sac-next-update']);
        if (isNaN(nextUpdate)) {
            nextUpdate = 0;
        }
    }

    if (now > nextUpdate) {
        localStorage['ffc-sac-next-update'] = now + 3600 * 1000;
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://rawgit.com/davidmz/friendfeed-and-co/master/manifest.json');
        xhr.onload = function () {
            try {
                var manifest = JSON.parse(this.response);
                if ('version' in manifest) {
                    console.log(manifest.version);
                    localStorage['ffc-sac-version'] = manifest.version;
                    localStorage['ffc-sac-next-update'] = now + 24 * 3600 * 1000;
                }
            } catch (e) {
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