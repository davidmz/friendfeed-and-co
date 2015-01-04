registerAction(function (node) {
    if (node !== undefined) return;

    var box = document.createElement("DIV");
    box.className = "box";
    box.innerHTML = '<div class="box-bar ffnco">\n    <div class="box-corner"></div>\n    <div class="box-bar-text">&nbsp;</div>\n</div>\n<div class="box-body">\n    <ul>\n        <li>\n            <a href="#">Настройки FF&amp;Co</a>\n            <div class="updated">v {{VERSION}}</div>\n        </li>\n    </ul>\n</div>\n<div class="box-bottom">\n    <div class="box-corner"></div>\n    <div class="box-spacer"></div>\n</div>\n        '
        .replace("{{VERSION}}", chrome.runtime.getManifest().version);
    box.querySelector("a").onclick = function (e) {
        e.preventDefault();
        window.open(chrome.extension.getURL("options.html"));
    };
    var sidebar = document.getElementById("sidebar");
    if (sidebar) sidebar.appendChild(box);
});
