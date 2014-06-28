registerAction(function (node) {
    if (!settings["lightBoxedImages"]) return;

    if (node === undefined) {
        // инициализация
        var lightBox = document.createElement("DIV");
        document.body.appendChild(lightBox);
        var lightBoxHTML = '<!--suppress HtmlUnknownTarget --><div class="light-box-shadow"><div class="light-box-container"><a href="{{LINK}}" target="_blank"><img src="{{URL}}" class="light-box-img"></a></div></div>';

        document.body.addEventListener("keyup", function (e) {
            if (e.keyCode == 27 && lightBox.innerHTML != "") lightBox.innerHTML = "";
        });

        document.body.addEventListener("click", function (e) {
            if (closestParent(e.target, ".light-box-shadow", true)) {
                lightBox.innerHTML = "";
                return;
            }
            var th = closestParent(e.target, ".light-box-thumbnail", true);
            if (!th || e.button != 0) return;
            e.preventDefault();
            lightBox.innerHTML = lightBoxHTML.replace("{{URL}}", th.dataset["imageSrc"]).replace("{{LINK}}", th.href);
        }, false);
    }

    node = node || document.body;
    toArray(node.querySelectorAll(".images.media a:not(.light-box-thumbnail)"))
        .forEach(function (node) {
            var img = node.querySelector("img");
            if (node.dataset["imageSrc"]) {
                node.classList.add("light-box-thumbnail");

            } else if (/\.(jpe?g|png|gif)/i.test(node.href)) {
                node.dataset["imageSrc"] = node.href;
                node.classList.add("light-box-thumbnail");

            } else if (/^http:\/\/m\.friendfeed-media\.com\//.test(node.href)) {
                node.dataset["imageSrc"] = node.href;
                node.classList.add("light-box-thumbnail");

            } else if (/^http:\/\/www\.flickr\.com\/photos\//.test(node.href)) {
                if (img && /^https?:\/\/farm\d+\.static\.?flickr\.com\//.test(img.src)) {
                    node.dataset["imageSrc"] = img.src.replace(/_.\.jpg$/, "_b.jpg");
                    node.classList.add("light-box-thumbnail");
                }

            } else if (/^http:\/\/instagram\.com\/p\//.test(node.href)) {
                var xhr = new XMLHttpRequest();
                xhr.open('GET', "http://api.instagram.com/oembed?url=" + encodeURIComponent(node.href));
                xhr.responseType = "json";
                xhr.onload = function () {
                    node.dataset["imageSrc"] = this.response.url;
                    node.classList.add("light-box-thumbnail");
                };
                xhr.send();

            } else if (/^http:\/\/imgur\.com\//.test(node.href)) {
                node.dataset["imageSrc"] = "http://i.imgur.com/" + node.href.match(/^http:\/\/imgur\.com\/(gallery\/)?([^#]+)/)[2] + ".jpg";
                node.classList.add("light-box-thumbnail");

            } else if (/^http:\/\/gyazo\.com\//.test(node.href)) {
                node.dataset["imageSrc"] = "http://i.gyazo.com/" + node.href.match(/^http:\/\/gyazo\.com\/([^#]+)/)[1] + ".png";
                node.classList.add("light-box-thumbnail");

            } else if (/soup\.io\/asset/.test(img.src)) {
                node.dataset["imageSrc"] = img.src.replace(/_400(\.\w+)$/, "$1");
                node.classList.add("light-box-thumbnail");

            }
        });
});
