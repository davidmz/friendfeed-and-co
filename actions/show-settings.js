registerAction(function (node) {
    if (node !== undefined) return;

    var box = document.createElement("DIV");
    box.className = "box";
    box.innerHTML = '<div class="box-bar ffnco">\n    <div class="box-corner"></div>\n    <div class="box-bar-text">&nbsp;</div>\n</div>\n<div class="box-body">\n    <ul>\n        <li>\n            <a href="#">Настройки FF&amp;Co</a>\n            <div class="updated">v {{VERSION}}</div>\n        </li>\n    </ul>\n</div>\n<div class="box-bottom">\n    <div class="box-corner"></div>\n    <div class="box-spacer"></div>\n</div>\n        '
        .replace("{{VERSION}}", frfCoVersion);
    box.querySelector("a").onclick = function (e) {
        e.preventDefault();
        if (inChromeExt) {
            window.open(chrome.extension.getURL("options.html"));
        } else {
            var settingsUrl = scriptRoot + "options.html";
            var lightBoxHTML = '<!--suppress HtmlUnknownTarget --><div class="light-box-shadow"><div class="light-box-container"><iframe src="{{URL}}" class="light-box-iframe" frameborder="0"></iframe></div></div>';
            var lightBox = document.querySelector(".frf-co-light-box");
            lightBox.innerHTML = lightBoxHTML.replace("{{URL}}", settingsUrl);
        }
    };
    var sidebar = document.getElementById("sidebar");
    if (sidebar) sidebar.appendChild(box);
});
