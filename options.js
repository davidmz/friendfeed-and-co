function toArray(nl) { return Array.prototype.slice.call(nl); }

document.addEventListener("DOMContentLoaded", function () {
    loadSettings(function (settings) {
        var sPage = document.querySelector(".content.settings");
        var checkBoxes = toArray(sPage.querySelectorAll("input[type='checkbox']"));
        var saveBtn = document.getElementById("save-settings");

        checkBoxes.forEach(function (box) {
            box.checked = settings[box.value];
        });
        sPage.style.display = "block";
        sPage.previousElementSibling.style.display = "none";

        saveBtn.addEventListener("click", function () {
            saveBtn.disabled = true;
            checkBoxes.forEach(function (box) {
                settings[box.value] = box.checked;
            });
            saveSettings(settings, function () { saveBtn.disabled = false; });
        }, false);
    });
});

