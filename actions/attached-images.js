registerAction(function (node) {
    if (!settings["openImages"]) return;
    node = node || document.body;

    selectAll(node, ".images.media a[href *= 'm.friendfeed-media.com']").forEach(function (node) {
        var m = /^http:\/\/m\.friendfeed-media\.com\/(.*)/.exec(node.href);
        if (m) {
            node.dataset["imageSrc"] = node.href;
            node.href = "http://rss2lj.net/ffimg#" + m[1];
        }
    });
});
