docLoaded.then(function () {
    document.querySelector(".version").appendChild(document.createTextNode("v. " + frfCoVersion));

    var sPage = document.querySelector(".content.settings");
    var checkBoxes = toArray(sPage.querySelectorAll("input[type='checkbox']"));

    settingsStore.loadSettings().then(function (settings) {
        checkBoxes.forEach(function (box) {
            box.checked = settings[box.value];
        });
        sPage.classList.remove("hidden");
        sPage.previousElementSibling.classList.add("hidden");

        Cell
            .fromInput(sPage.querySelector("[value='replyLinks']"), "change", "checked")
            .onValue(function (ok) {
                sPage.querySelector("[value='withAvatars']").disabled = !ok;
                sPage.querySelector("[value='highlightRefComments']").disabled = !ok;
                sPage.querySelector("[value='highlightAuthorComments']").disabled = !ok;
            });
    });

    document.getElementById("save-settings").addEventListener("click", function (e) {
        var saveBtn = e.target;
        saveBtn.disabled = true;
        var settings = {};
        checkBoxes.forEach(function (box) { settings[box.value] = box.checked; });
        settingsStore.saveSettings(settings).then(function () { saveBtn.disabled = false; });
    }, false);

    if (!inChromeExt) {
        var refreshBtn = document.getElementById("check-updates");
        refreshBtn.classList.remove("hidden");
        refreshBtn.addEventListener("click", function () {
            refreshBtn.disabled = true;
            window.parent.postMessage({action: "checkUpdates", value: null}, location.protocol + "//friendfeed.com");
        }, false);
    }
});

