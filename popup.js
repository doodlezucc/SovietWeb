let enable;

let profile = {
    disabledPages: [],
};

let domain = "";

function save() {
    if (isChecked()) {
        profile.disabledPages = profile.disabledPages.filter(s => s !== domain);
    } else {
        profile.disabledPages.push(domain);
    }
    console.log(profile.disabledPages);

    chrome.storage.local.set({ profile: profile }, function() {
        console.log("Saved!");
        if (isChecked()) {
            chrome.tabs.query({ currentWindow: true, active: true }, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, { action: "apply_changes" });
            });
        } else {
            chrome.tabs.reload();
        }
    });
    //window.close();
}

function isChecked() {
    return enable[0].checked;
}

function isDisabled(url) {
    return profile.disabledPages.some(s => s === url);
}

function load() {
    chrome.storage.local.get(["profile"], function(result) {
        if (!$.isEmptyObject(result)) {
            profile = result["profile"];
            console.log(profile.disabledPages);
        }
        enable[0].checked = !isDisabled(domain);
        setTimeout(() => {
            enable.addClass("init");
        }, 100);
    });
}

/**
 * @param {String} url 
 */
function getDomain(url) {
    url = url.substr(url.indexOf("//") + 2);
    url = url.substr(0, url.indexOf("/"));
    return url;
}

$(document).ready(() => {
    enable = $("#enable");
    enable.on("change", save);

    // Get current tab URL
    chrome.tabs.query({ currentWindow: true, active: true }, tabs => {
        const active = tabs[0];
        domain = getDomain(active.url);
        $("#label").text(domain);
        load();
    });
});