registerAction(function (node) {
    if (!settings["killDuck"] || node !== undefined) return;

    toArray(document.querySelectorAll('body > div[style*="duck"]'))
        .forEach(function (node) {
            node.style.width = 0;
            node.style.height = 0;
        });
});
