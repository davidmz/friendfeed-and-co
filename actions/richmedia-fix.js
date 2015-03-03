(function () {
    registerAction(function (node) {
        node = node || document.body;

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
                        th.src = 'http://img.youtube.com/vi/' + id + '/mqdefault.jpg';
                    }
                });
            } else {
                // Смотрим ссылки в тексте
                var links = ebody.querySelectorAll(".text a:not([href^='http://friendfeed.com/search?q='])");
                if (links.length === 1) {
                    var link = links[0], m, id;
                    if ((m = link.href.match(/^https?:\/\/vimeo\.com\/(\d+)/)) !== null) {
                        id = m[1];
                        var xhr = new XMLHttpRequest();
                        xhr.open('GET', "https://vimeo.com/api/v2/video/" + id + ".json");
                        xhr.responseType = "json";
                        xhr.onload = function () {
                            var inf = this.response[0];
                            ebody.appendChild(h("div", {"class": "images media"},
                                    h("div", {"class": "container"},
                                        h("a", {
                                                rel: "nofollow",
                                                href: inf.url,
                                                "class": "l_play",
                                                play: '<iframe width="613" height="345" src="//player.vimeo.com/video/' + id + '?autoplay=1" frameborder="0" allowfullscreen></iframe>'
                                            },
                                            h("img", {
                                                src: inf.thumbnail_medium,
                                                "class": "thumbnail",
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
                        ebody.appendChild(h("div", {"class": "images media"},
                                h("div", {"class": "container"},
                                    h("a", {
                                            rel: "nofollow",
                                            href: link.href,
                                            "class": "l_play",
                                            play: '<iframe width="613" height="345" src="'
                                            + htmlSafe("//www.youtube.com/v/" + encodeURIComponent(id) + "&autoplay=1&showsearch=0&ap=%2526fmt%3D18&fs=1")
                                            + '" frameborder="0" allowfullscreen></iframe>'
                                        },
                                        h("img", {
                                            src: 'http://img.youtube.com/vi/' + id + '/mqdefault.jpg',
                                            "class": "thumbnail",
                                            style: "width:320px; height:180px"
                                        })
                                    )
                                )
                            )
                        );
                    }
                }
            }
        });
    });
})();
