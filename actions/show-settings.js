registerAction(function (node) {
    if (node !== undefined) return;

    var link;
    var box = h(".box",
        h(".box-bar.ffnco", h(".box-corner"), h(".box-bar-text", "\u00a0")),
        h(".box-body",
            h("ul", h("li",
                (link = h("a",
                    {href: inChromeExt ? chrome.extension.getURL("options.html") : "#"},
                    "Настройки FF&Co")),
                h(".updated", "v " + frfCoVersion)
            ))
        ),
        h(".box-bottom", h(".box-corner"), h(".box-spacer"))
    );

    var lightBoxCont;
    var lightBox = h(".frf-co-light-box.hidden",
        h(".light-box-shadow",
            (lightBoxCont = h(".light-box-container"))
        )
    );
    document.body.appendChild(lightBox);

    lightBox.addEventListener("click", function () {
        lightBoxCont.innerHTML = "";
        lightBox.classList.add("hidden");
    });

    link.addEventListener("click", function (e) {
        e.preventDefault();

        lightBoxCont.innerHTML = "";
        lightBoxCont.appendChild(h("iframe.light-box-iframe", {
            src: inChromeExt ? chrome.extension.getURL("options.html") : frfScriptRoot + "/options.html",
            frameborder: "0"
        }));
        lightBox.classList.remove("hidden");
    });
    var sidebar = document.getElementById("sidebar");
    if (sidebar) sidebar.appendChild(box);
});
