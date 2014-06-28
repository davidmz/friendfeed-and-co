registerAction(function (node) {
    if (!settings["highlightAuthorComments"] || node !== undefined) return;
    document.body.classList.add("hl-authors-comments");
});
