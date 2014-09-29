function gotSettings(message) {
    if (message.name === "SettingsReady") {
	applyActions(message.message);
    }
}

safari.self.addEventListener("message", gotSettings, false);
safari.self.tab.dispatchMessage("getSettings");
