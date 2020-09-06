let enable;

let profile = {
    enable: true,
};

function save() {
    profile.enable = enable[0].checked;

    chrome.storage.local.set({ profile: profile }, function() {
        console.log("Saved!");
        if (profile.enable) {
            chrome.tabs.query({ currentWindow: true, active: true }, function(tabs) {
                var activeTab = tabs[0];
                chrome.tabs.sendMessage(activeTab.id, { action: "apply_changes" });
            });
        } else {
            chrome.tabs.reload();
        }
    });
    //window.close();
}

function load() {
    chrome.storage.local.get(["profile"], function(result) {
        if (!$.isEmptyObject(result)) {
            profile = result["profile"];
        }
        enable[0].checked = profile.enable;
        setTimeout(() => {
            enable.addClass("init");
        }, 100);
    });
}

$(document).ready(() => {
    enable = $("#enable");
    load();
    enable.on("change", function() {
        save();
    });
});