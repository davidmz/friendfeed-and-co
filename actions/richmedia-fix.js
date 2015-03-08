(function () {
    registerAction(function (node) {
        node = node || document.body;

        toArray(node.querySelectorAll(".container a[href*='akamai.coub.com/get/']")).forEach(function (a) {
            var p = closestParent(a, ".images.media");
            p.parentNode.removeChild(p);
        });

        toArray(node.querySelectorAll(".entry .ebody")).forEach(function (ebody) {
            var ws = ebody.querySelectorAll(".media a.l_play");
            if (ws.length > 0) {
                // Есть родные виджеты
                toArray(ws).forEach(function (lPlay) {
                    var id,
                        playAttr = lPlay.getAttribute("play");
                    if (playAttr.indexOf("vimeo.com/moogaloop.swf?clip_id=") !== -1) {
                        id = playAttr.match(/moogaloop\.swf\?clip_id=(\d+)/)[1];
                        lPlay.setAttribute("play", '<iframe width="613" height="345" src="//player.vimeo.com/video/' + id + '?autoplay=1" frameborder="0" allowfullscreen></iframe>');
                    } else if (playAttr.indexOf("youtube.com/v/") !== -1) {
                        id = playAttr.match(/youtube.com\/v\/([^&]+)/)[1];
                        lPlay.setAttribute("play", '<iframe width="613" height="345" src="'
                        + htmlSafe("//www.youtube.com/v/" + encodeURIComponent(id) + "&autoplay=1&showsearch=0&ap=%2526fmt%3D18&fs=1")
                        + '" frameborder="0" allowfullscreen></iframe>');
                        var th = lPlay.querySelector(".thumbnail");
                        th.style.width = "320px";
                        th.style.height = "180px";
                        th.src = '//img.youtube.com/vi/' + id + '/mqdefault.jpg';
                    }
                });
            } else {
                // Смотрим ссылки в тексте
                var linkCount = 0, link;
                toArray(ebody.querySelectorAll(".text a")).forEach(function (l) {
                    if (
                        l.href.indexOf("//friendfeed.com/") !== -1 && l.firstChild.nodeValue.charAt(0) === "#" ||
                        l.href.indexOf("//search.twitter.com/") !== -1 && l.firstChild.nodeValue.charAt(0) === "#" ||
                        l.href === "http://twitter.com/coub" && l.firstChild.nodeValue === "coub"
                    ) {
                        return;
                    }
                    linkCount++;
                    link = l;
                });

                if (linkCount === 1) {
                    var m, id, xhr;
                    if ((m = link.href.match(/^https?:\/\/vimeo\.com\/(\d+)/)) !== null) {
                        id = m[1];
                        xhr = new XMLHttpRequest();
                        xhr.open('GET', "https://vimeo.com/api/v2/video/" + id + ".json");
                        xhr.responseType = "json";
                        xhr.onload = function () {
                            var inf = this.response[0];
                            ebody.appendChild(h(".images.media",
                                    h(".container",
                                        h("a.l_play", {
                                                rel: "nofollow",
                                                href: inf.url,
                                                play: '<iframe width="613" height="345" src="//player.vimeo.com/video/' + id + '?autoplay=1" frameborder="0" allowfullscreen></iframe>'
                                            },
                                            h("img.thumbnail", {
                                                src: inf.thumbnail_medium,
                                                style: "width:200px; height:150px",
                                                alt: inf.title,
                                                title: inf.title
                                            })
                                        )
                                    )
                                )
                            );
                        };
                        xhr.send();
                    }

                    if (
                        (m = link.href.match(/^https?:\/\/www\.youtube\.com\/watch.*[?&]v=([^&?#]+)/)) !== null ||
                        (m = link.href.match(/^https?:\/\/youtu\.be\/([^&?#]+)/)) !== null
                    ) {
                        id = m[1];
                        ebody.appendChild(h(".images.media",
                                h(".container",
                                    h("a.l_play", {
                                            rel: "nofollow",
                                            href: link.href,
                                            play: '<iframe width="613" height="345" src="'
                                            + htmlSafe("//www.youtube.com/v/" + encodeURIComponent(id) + "&autoplay=1&showsearch=0&ap=%2526fmt%3D18&fs=1")
                                            + '" frameborder="0" allowfullscreen></iframe>'
                                        },
                                        h("img.thumbnail", {
                                            src: '//img.youtube.com/vi/' + id + '/mqdefault.jpg',
                                            style: "width:320px; height:180px"
                                        })
                                    )
                                )
                            )
                        );
                    }

                    if (
                        (m = link.href.match(/^http:\/\/coub\.com\/view\/(\w+)/)) !== null ||
                        (m = link.title.match(/^http:\/\/coub\.com\/view\/(\w+)/)) !== null
                    ) {
                        id = m[1];
                        xhr = new XMLHttpRequest();
                        xhr.open('GET', "https://davidmz.me/oembed/coub/oembed.json?url=http://coub.com/view/" + id);
                        xhr.responseType = "json";
                        xhr.onload = function () {
                            var inf = this.response;
                            var hi = 345;
                            var w = Math.round(inf.width * hi / inf.height);
                            if (w > 613) {
                                hi = Math.round(hi * 613 / w);
                                w = 613;
                            }
                            ebody.appendChild(h(".images.media",
                                    h(".container",
                                        h("a.l_play", {
                                                rel: "nofollow",
                                                href: inf.url,
                                                play: '<iframe src="//coub.com/embed/' + id + '?muted=false&autostart=true&originalSize=false&hideTopBar=false&startWithHD=true" allowfullscreen="true" frameborder="0" width="' + w + '" height="' + hi + '"></iframe>'
                                            },
                                            h("img.thumbnail", {
                                                src: inf.thumbnail_url,
                                                style: "width:auto; height:180px",
                                                alt: inf.title,
                                                title: inf.title
                                            })
                                        )
                                    )
                                )
                            );
                        };
                        xhr.send();
                    }

                }
            }
        });
    });
})();
