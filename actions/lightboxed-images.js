(function () {
    //////////////////////
    var Preloader = function () {
        this.image = h("img");
        this.cache = {};
        this.queue = [];

        this.image.addEventListener("load", this.moveQueue.bind(this));
        this.image.addEventListener("error", this.moveQueue.bind(this));
        this.moveQueue();
    };

    Preloader.prototype.add = function (src) {
        if (src in this.cache) {
            return;
        }
        this.cache[src] = true;
        this.queue.push(src);
    };

    Preloader.prototype.moveQueue = function () {
        var src = this.queue.pop();
        if (src !== undefined) {
            this.image.src = src;
        } else {
            setTimeout(this.moveQueue.bind(this), 250);
        }
    };

    //////////////////////

    var SlideShow = function () {
        this.imageStab = "/static/images/loading.gif";
        this.lightBoxImage = h("img", {"class": "light-box-img", src: this.imageStab});
        this.lightBox = h("div", {"class": "frf-co-light-box first last hidden"},
            h("div", {"class": "light-box-shadow"},
                h("div", {"class": "light-box-container"}, this.lightBoxImage),
                h("div", {"class": "light-box-arrow left"}),
                h("div", {"class": "light-box-arrow right"})
            )
        );
        /**
         * @type {DOMTokenList}
         */
        this.cList = this.lightBox.classList;
        this.preloader = new Preloader();
        this.hidden = true;
        this.slides = [];
        this.index = 0;

        document.body.appendChild(this.lightBox);

        document.body.addEventListener("keydown", function (e) {
            if (this.hidden) {
                return;
            }

            if (e.keyCode == 27) {
                this.hide();
            } else if (e.keyCode == 39) { // →
                this.next();
                e.preventDefault();
            } else if (e.keyCode == 37) { // ←
                this.prev();
                e.preventDefault();
            } else if (e.keyCode == 36) { // Home
                this.first();
                e.preventDefault();
            } else if (e.keyCode == 35) { // End
                this.last();
                e.preventDefault();
            }
        }.bind(this), true);

        this.lightBox.addEventListener("click", function (e) {
            var arr;
            if ((arr = closestParent(e.target, ".light-box-arrow", true)) !== null) {
                e.stopPropagation();
                if (arr.classList.contains("left")) {
                    this.prev();
                } else if (arr.classList.contains("right")) {
                    this.next();
                }
            } else if (closestParent(e.target, ".light-box-shadow", true)) {
                this.hide();
            }
        }.bind(this));

        this.lightBoxImage.addEventListener("click", function () {
            window.open(this.slides[this.index].href, "_blank");
        }.bind(this));
    };

    SlideShow.prototype.isFirst = function () { return this.index === 0;};
    SlideShow.prototype.isLast = function () { return this.index === this.slides.length - 1;};

    /**
     * @param {Array<HTMLAnchorElement>} slides
     * @param {HTMLAnchorElement} currSlide
     */
    SlideShow.prototype.show = function (slides, currSlide) {
        this.slides = slides;
        slides.forEach(function (s, i) {
            if (s === currSlide) {
                this.index = i;
            } else {
                this.preloader.add(s.dataset["imageSrc"]);
            }
        }.bind(this));
        this.hidden = false;
        this.cList.remove("hidden");
        this._showCurrent();
    };

    SlideShow.prototype._showCurrent = function () {
        this.lightBoxImage.src = this.imageStab;
        this.lightBoxImage.src = this.slides[this.index].dataset["imageSrc"];
        if (this.isFirst()) this.cList.add("first"); else this.cList.remove("first");
        if (this.isLast()) this.cList.add("last"); else this.cList.remove("last");
    };

    SlideShow.prototype.hide = function () {
        if (!this.hidden) {
            this.hidden = true;
            this.cList.add("hidden");
        }
    };

    SlideShow.prototype.next = function () {
        if (this.hidden || this.isLast()) return;
        this.index++;
        this._showCurrent();
    };

    SlideShow.prototype.prev = function () {
        if (this.hidden || this.isFirst()) return;
        this.index--;
        this._showCurrent();
    };

    SlideShow.prototype.first = function () {
        if (this.hidden || this.isFirst()) return;
        this.index = 0;
        this._showCurrent();
    };

    SlideShow.prototype.last = function () {
        if (this.hidden || this.isLast()) return;
        this.index = this.slides.length - 1;
        this._showCurrent();
    };


    //////////////////////

    var OEmbedIt = function (link, url, param) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url + "?url=" + encodeURIComponent(link.href));
        xhr.responseType = "json";
        xhr.onload = function () {
            if (param in this.response) {
                link.dataset["imageSrc"] = this.response[param];
                link.classList.add("light-box-thumbnail");
            }
        };
        xhr.send();
    };

    var NoEmbedIt = function (link) { OEmbedIt(link, "https://noembed.com/embed", "media_url"); };

    registerAction(function (node) {
        if (!settings["lightBoxedImages"]) return;

        if (node === undefined) {
            // инициализация
            var slideShow = new SlideShow();

            document.body.addEventListener("click", function (e) {
                if (e.target.matches(".show-more--link")) {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "inline";
                    selectAll(e.target.nextSibling, ".thumbnail").forEach(function (node) { node.src = node.dataset["src"]; });
                    return;
                }

                var th = closestParent(e.target, ".light-box-thumbnail", true);
                if (!th || e.button != 0) return;
                e.preventDefault();

                // соседи
                var slides = [th];
                var cont = closestParent(th, ".images.media");
                if (cont) {
                    slides = selectAll(cont, ".light-box-thumbnail");
                }

                slideShow.show(slides, th);
            }, false);
        }

        node = node || document.body;

        selectAll(node, ".images.media a:not(.light-box-thumbnail)").forEach(function (node) {
            var img = node.querySelector("img");
            var imgSrc = ("src" in img.dataset) ? img.dataset["src"] : img.src;

            if (node.dataset["imageSrc"]) {
                node.classList.add("light-box-thumbnail");

            } else if (/\.(jpe?g|png|gif)/i.test(node.href)) {
                node.dataset["imageSrc"] = node.href;
                node.classList.add("light-box-thumbnail");

            } else if (/^http:\/\/m\.friendfeed-media\.com\//.test(node.href)) {
                node.dataset["imageSrc"] = node.href;
                node.classList.add("light-box-thumbnail");

            } else if (/^https?:\/\/www\.flickr\.com\/photos\//.test(node.href)) {
                if (/^https?:\/\/farm\d+\.static\.?flickr\.com\//.test(imgSrc)) {
                    node.dataset["imageSrc"] = imgSrc.replace(/_.\.jpg$/, "_b.jpg");
                    node.classList.add("light-box-thumbnail");
                } else {
                    NoEmbedIt(node);
                }

            } else if (/^https?:\/\/instagram\.com\/p\//.test(node.href)) {
                NoEmbedIt(node);

            } else if (/deviantart\.com\/art\//.test(node.href)) {
                OEmbedIt(node, "https://davidmz.me/oembed/deviantart/oembed", "url");

            } else if (/^http:\/\/imgur\.com\//.test(node.href)) {
                node.dataset["imageSrc"] = "http://i.imgur.com/" + node.href.match(/^http:\/\/imgur\.com\/(gallery\/)?([^#]+)/)[2] + ".jpg";
                node.classList.add("light-box-thumbnail");

            } else if (/^http:\/\/gyazo\.com\//.test(node.href)) {
                node.dataset["imageSrc"] = "http://i.gyazo.com/" + node.href.match(/^http:\/\/gyazo\.com\/([^#]+)/)[1] + ".png";
                node.classList.add("light-box-thumbnail");

            } else if (/soup\.io\/asset/.test(imgSrc)) {
                node.dataset["imageSrc"] = imgSrc.replace(/_400(\.\w+)$/, "$1");
                node.classList.add("light-box-thumbnail");

            }
        });

        selectAll(node, "a.l_expandmedia:not(.ffco-done)").forEach(function (node) {
            node.classList.add("ffco-done");
            var entry = closestParent(node, ".entry"),
                media = closestParent(node, ".media"),
                previewCount = selectAll(media, ".thumbnail").length,
                at = document.cookie.match(/(?:^| )AT=(.*?)(?:;|$)/)[1];

            var data = "entry=" + encodeURIComponent(entry.getAttribute("eid")) + "&media=1&_nano=1&at=" + encodeURIComponent(at);
            var xhr = new XMLHttpRequest();
            xhr.open("POST", "/a/expandmedia");
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            xhr.responseType = "json";
            xhr.onload = function () {
                var items = this.response.html.match(/<a .*?<\/a>/g);
                var visibleItems = items.slice(0, previewCount);
                var invisibleItems = items.slice(previewCount)
                    .map(function (s) {
                        return s.replace(/src="(.*?)"/, 'data-src="$1" src="/static/images/loading.gif"');
                    });
                var newMedia = document.createElement("div");
                newMedia.className = "images media";
                newMedia.innerHTML = visibleItems.join("") + '<span class="show-more--link"></span><span class="show-more--items">' + invisibleItems.join("") + '</span>';
                media.parentNode.insertBefore(newMedia, media);
                media.parentNode.removeChild(media);
                media.innerHTML = "";
            };
            xhr.send(data);
        });
    });
})();
