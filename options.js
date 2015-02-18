document.addEventListener("DOMContentLoaded", function () {
    loadSettings.then(function (settings) {
        var sPage = document.querySelector(".content.settings");
        var checkBoxes = toArray(sPage.querySelectorAll("input[type='checkbox']"));
        var saveBtn = document.getElementById("save-settings");

        checkBoxes.forEach(function (box) {
            box.checked = settings[box.value];
        });
        sPage.style.display = "block";
        sPage.previousElementSibling.style.display = "none";

        Cell
            .fromInput(sPage.querySelector("[value='replyLinks']"), "change", "checked")
            .onValue(function (ok) {
                sPage.querySelector("[value='withAvatars']").disabled = !ok;
                sPage.querySelector("[value='highlightRefComments']").disabled = !ok;
                sPage.querySelector("[value='highlightAuthorComments']").disabled = !ok;
                sPage.querySelector("[value='newLines']").disabled = !ok;
            });


        saveBtn.addEventListener("click", function () {
            saveBtn.disabled = true;
            checkBoxes.forEach(function (box) {
                settings[box.value] = box.checked;
            });
            saveSettings(settings, function () { saveBtn.disabled = false; });
        }, false);
    });
});

