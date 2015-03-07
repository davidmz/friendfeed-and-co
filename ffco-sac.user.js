// ==UserScript==
// @name FriendFeed & Co
// @namespace https://github.com/davidmz/friendfeed-and-co
// @version 1.45
// @description Some cool features for FriendFeed
// @include https://friendfeed.com/*
// @include http://friendfeed.com/*
// @icon https://cdn.rawgit.com/davidmz/friendfeed-and-co/master/icon128.png
// ==/UserScript==
!function(){var e,n="1.45",t=0,a=Date.now(),r=localStorage,s=parseInt,i="ffc-sac-version",o="ffc-sac-next-update",c=function(e,n){var t,a=e.split("."),r=n.split("."),i=a.length,o=r.length,c=Math.min(i,o);for(t=0;c>t;t++){if(s(a[t])<s(r[t]))return-1;if(s(a[t])>s(r[t]))return 1}return o>i?-1:i>o?1:0};if(i in r&&((e=c(r[i],n))>0?n=r[i]:0>e&&(r[i]=n),t=s(r[o]),isNaN(t)&&(t=0)),a>t){r[o]=a+36e5;var d=new XMLHttpRequest;d.open("GET","https://rawgit.com/davidmz/friendfeed-and-co/master/manifest.json"),d.responseType="json",d.onload=function(){var e=this.response;"version"in e&&(r[i]=e.version,r[o]=a+864e5)},d.send()}var f=document.createElement("script");f.src="//cdn.rawgit.com/davidmz/friendfeed-and-co/v"+n+"/ffco-sac.min.js",f.type="text/javascript",f.charset="utf-8",f.async=!0,document.head.appendChild(f)}();