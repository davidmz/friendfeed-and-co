registerAction(function (node) {
    if (!settings["fixNames"]) return;
    node = node || document.body;

    toArray(node.querySelectorAll(".content > .l_profile, .lbody > .l_profile, .name > .l_profile, .foaf > .l_profile"))
        .forEach(function (node) {
            var login = node.getAttribute("href").substr(1);
            if (node.innerHTML != login) {
                node.dataset["displayName"] = node.innerHTML;
                node.innerHTML = login;
            }
        });

    // В попапе показываем оригинальное имя
    toArray(node.querySelectorAll("#popup .name > .l_profile"))
        .forEach(function (node) {
            node.innerHTML = node.dataset["displayName"];
        });
});
