var contactConfigs = {
    customParam: customParam,
    contactId: contactId
};

var contactFunctions = {
    initEvents: function () {
        $('.nav-tabs a[data-toggle="tab"]').on("shown.bs.tab", function (e) {
            const tabId = $(e.target).attr("href");

            contactFunctions.triggerEvents(tabId);
        });
    },
    initPage: function () {
        contactFunctions.initEvents();

        // Trigger active tab
        const tabId = $('.nav-tabs li.active a[data-toggle="tab"]').attr("href");
        contactFunctions.triggerEvents(tabId);
    },
    triggerEvents: function (tabId) {
        switch (tabId) {
            case "#contacts": {
                break;
            }
            case "#licence_details": {
                break;
            }
            case "#documents": {
                attachmentConfigs.attachmentType = "document";
                attachmentFunctions.initPage(contactConfigs.customParam);
                break;
            }
            case "#system-note": {
                break;
            }
            default: {
                break;
            }
        }
    }
}

$(document).ready(function () {
    contactFunctions.initPage();
});