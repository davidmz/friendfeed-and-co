// ==UserScript==
// @name FriendFeed & Co
// @namespace https://github.com/davidmz/friendfeed-and-co
// @version 1.32
// @description Some cool features for FriendFeed
// @include https://friendfeed.com/*
// @include http://friendfeed.com/*
// @icon https://cdn.rawgit.com/davidmz/friendfeed-and-co/master/icon128.png
// ==/UserScript==
(function () {
    var e = document.createElement("script");
    e.src = 'https://cdn.rawgit.com/davidmz/friendfeed-and-co/v1.32/ffco-sac.min.js';
    e.type = "text/javascript";
    e.async = true;
    document.head.appendChild(e);
})();