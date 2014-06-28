registerAction(function (node) {
    if (!settings["fixNames"]) return;
    node = node || document.body;

    toArray(node.querySelectorAll(".content > .l_profile, .lbody > .l_profile, .name > .l_profile, .foaf > .l_profile"))
        .forEach(function (node) {
            var login = node.getAttribute("href").substr(1);
            if (node.innerHTML != login) node.innerHTML = login;
        });
});
